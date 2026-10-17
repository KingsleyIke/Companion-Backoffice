import { Module } from '@nestjs/common';
import {
  authConfig,
  environmentConfig,
  type AuthConfig,
  type Environment,
} from '@companion/common';

import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { MfaSecretCipher } from './domain/mfa-secret-cipher';
import { PasswordVerifier } from './domain/passwords';
import { TotpVerifier } from './domain/totp';
import { createPasswordResetMailer, PasswordResetMailer } from './password-reset-mailer';
import { PasswordResetService } from './password-reset.service';
import { SessionService } from './session.service';

@Module({
  controllers: [AdminAuthController],
  providers: [
    AdminAuthService,
    PasswordResetService,
    SessionService,
    { provide: PasswordVerifier, useFactory: () => PasswordVerifier.create() },
    { provide: TotpVerifier, useValue: new TotpVerifier() },
    {
      provide: MfaSecretCipher,
      inject: [authConfig.KEY],
      useFactory: (config: AuthConfig) =>
        new MfaSecretCipher(config.mfaEncryptionKey, config.mfaPreviousEncryptionKey),
    },
    {
      provide: PasswordResetMailer,
      inject: [environmentConfig.KEY],
      useFactory: (environment: Environment) => createPasswordResetMailer(environment.nodeEnv),
    },
  ],
})
export class AdminAuthModule {}
