import { Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { environmentConfig } from '@companion/common';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const environment = app.get<ConfigType<typeof environmentConfig>>(environmentConfig.KEY);

  app.setGlobalPrefix('api/v1');
  await app.listen(environment.port);
  Logger.log(`API listening on http://localhost:${environment.port}/api/v1`);
}

bootstrap();
