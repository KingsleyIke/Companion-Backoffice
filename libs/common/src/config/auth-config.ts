import { createHash } from 'node:crypto';

import { registerAs } from '@nestjs/config';

import {
  readBase64Key,
  readHttpUrl,
  readOptional,
  readPositiveInt,
  readSecret,
  type Source,
} from './env-readers';

// The id lets ciphertext name the key that sealed it, so a rotated key can still be found.
export interface EncryptionKey {
  id: string;
  key: Buffer;
}

export interface AuthConfig {
  accessTokenSecret: string;
  accessTokenTtlSeconds: number;
  refreshTokenTtlDays: number;
  mfaEncryptionKey: EncryptionKey;
  mfaPreviousEncryptionKey: EncryptionKey | undefined;
  backOfficeUrl: string;
}

// Separate from loadEnvironment: the migration CLI and database specs need no auth secrets.
export function loadAuthConfig(source: Source = process.env): AuthConfig {
  const errors: string[] = [];

  const accessTokenSecret = readSecret(source, 'JWT_ACCESS_SECRET', 32, errors);
  const accessTokenTtlSeconds = readPositiveInt(source, 'JWT_ACCESS_TTL_SECONDS', 900, errors);
  const refreshTokenTtlDays = readPositiveInt(source, 'REFRESH_TOKEN_TTL_DAYS', 30, errors);
  const mfaKey = readBase64Key(source, 'MFA_ENCRYPTION_KEY', 32, errors);
  const mfaPreviousKey = readBase64Key(source, 'MFA_ENCRYPTION_KEY_PREVIOUS', 32, errors);
  const backOfficeUrl = readHttpUrl(source, 'BACK_OFFICE_URL', errors);

  if (readOptional(source, 'MFA_ENCRYPTION_KEY') === undefined) {
    errors.push('MFA_ENCRYPTION_KEY is required');
  }
  if (errors.length > 0 || !mfaKey) {
    throw new Error(`Invalid auth configuration:\n  - ${errors.join('\n  - ')}`);
  }

  return {
    accessTokenSecret,
    accessTokenTtlSeconds,
    refreshTokenTtlDays,
    mfaEncryptionKey: toEncryptionKey(mfaKey),
    mfaPreviousEncryptionKey: mfaPreviousKey && toEncryptionKey(mfaPreviousKey),
    backOfficeUrl,
  };
}

export const authConfig = registerAs('auth', () => loadAuthConfig());

function toEncryptionKey(key: Buffer): EncryptionKey {
  return { id: createHash('sha256').update(key).digest('hex').slice(0, 8), key };
}
