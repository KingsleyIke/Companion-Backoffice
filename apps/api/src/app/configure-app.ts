import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { REFRESH_COOKIE } from '../modules/admin-auth/auth-http';

export const API_PREFIX = 'api/v1';

// Shared by main.ts and the spec generator, so the published spec matches the running API.
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix(API_PREFIX);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
}

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Catholic Companion API')
    .setVersion('1')
    .addBearerAuth()
    .addCookieAuth(REFRESH_COOKIE, undefined, REFRESH_COOKIE)
    .build();
  return SwaggerModule.createDocument(app, config);
}
