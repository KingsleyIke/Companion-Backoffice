import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDataSourceOptions, environmentConfig } from '@companion/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, load: [environmentConfig] }),
    TypeOrmModule.forRootAsync({
      inject: [environmentConfig.KEY],
      useFactory: (environment: ConfigType<typeof environmentConfig>) =>
        createDataSourceOptions(environment),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
