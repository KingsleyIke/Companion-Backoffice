import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDataSourceOptions, environmentConfig } from '@companion/common';

import { DiocesesModule } from '../modules/dioceses/dioceses.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, load: [environmentConfig] }),
    TypeOrmModule.forRootAsync({
      inject: [environmentConfig.KEY],
      useFactory: (environment: ConfigType<typeof environmentConfig>) =>
        createDataSourceOptions(environment),
    }),
    DiocesesModule,
  ],
})
export class AppModule {}
