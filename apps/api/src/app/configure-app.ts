import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, getSchemaPath, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { ErrorResponseDto } from '@companion/dto';

import { REFRESH_COOKIE } from '../modules/admin-auth/auth-http';
import { AllExceptionsFilter } from './http/all-exceptions.filter';
import { requestLogging } from './http/request-logging';

export const API_PREFIX = 'api/v1';

const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'patch', 'options', 'head'] as const;

// Shared by main.ts, the spec generator and the HTTP specs, so all three see the same API.
export function configureApp(app: INestApplication): void {
  app.use(requestLogging);
  app.setGlobalPrefix(API_PREFIX);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
}

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Catholic Companion API')
    .setVersion('1')
    .addBearerAuth()
    .addCookieAuth(REFRESH_COOKIE, undefined, REFRESH_COOKIE)
    .build();
  const document = SwaggerModule.createDocument(app, config, { extraModels: [ErrorResponseDto] });
  documentErrorBodies(document);
  return document;
}

// Every error the API returns is an ErrorResponseDto (AllExceptionsFilter), so every 4xx/5xx
// response and the default response reference it, and both generated clients get a typed error.
function documentErrorBodies(document: OpenAPIObject): void {
  const content = { 'application/json': { schema: { $ref: getSchemaPath(ErrorResponseDto) } } };
  for (const path of Object.values(document.paths)) {
    for (const method of HTTP_METHODS) {
      const operation = path[method];
      if (!operation) {
        continue;
      }
      for (const [status, response] of Object.entries(operation.responses)) {
        if (/^[45]/.test(status) && response && !('$ref' in response)) {
          response.content = content;
        }
      }
      operation.responses['default'] = { description: 'Error', content };
    }
  }
}
