import { Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { environmentConfig } from '@companion/common';

import { AppModule } from './app/app.module';
import { configureApp, createOpenApiDocument } from './app/configure-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const environment = app.get<ConfigType<typeof environmentConfig>>(environmentConfig.KEY);

  configureApp(app);
  // The UI would list every admin route publicly; the committed spec file is the contract.
  if (environment.nodeEnv !== 'production') {
    SwaggerModule.setup('api/v1/docs', app, createOpenApiDocument(app));
  }
  await app.listen(environment.port);
  Logger.log(`API listening on http://localhost:${environment.port}/api/v1`);
}

bootstrap();
