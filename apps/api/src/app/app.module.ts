import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_GUARD, DiscoveryModule } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  authConfig,
  createDataSourceOptions,
  environmentConfig,
  JwtAuthGuard,
  RolesGuard,
  RouteAccessCheck,
} from '@companion/common';

import { AdminAuthModule } from '../modules/admin-auth/admin-auth.module';
import { DiocesesModule } from '../modules/dioceses/dioceses.module';
import { HealthModule } from '../modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [environmentConfig, authConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [environmentConfig.KEY],
      useFactory: (environment: ConfigType<typeof environmentConfig>) =>
        createDataSourceOptions(environment),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [authConfig.KEY],
      useFactory: (config: ConfigType<typeof authConfig>) => ({
        secret: config.accessTokenSecret,
        signOptions: { algorithm: 'HS256' },
        verifyOptions: { algorithms: ['HS256'] },
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'address', ttl: 60_000, limit: 60 },
        {
          name: 'account',
          ttl: 15 * 60_000,
          limit: 5,
          // Guards run before the DTO normalises the email, so lowercase it here too.
          getTracker: (request) =>
            `${String(request['ip'])}:${String(request['body']?.['email'] ?? '').toLowerCase()}`,
        },
      ],
    }),
    DiscoveryModule,
    HealthModule,
    DiocesesModule,
    AdminAuthModule,
  ],
  // Global guards run in this order: identify the admin, then check their role. Every route
  // must be @Public() or declare its roles; RouteAccessCheck refuses to start otherwise.
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    RouteAccessCheck,
  ],
})
export class AppModule {}
