import { loadAuthConfig } from './auth-config';

const KEY = Buffer.alloc(32, 1).toString('base64');
const OTHER_KEY = Buffer.alloc(32, 2).toString('base64');
const SECRET = 'a-test-signing-secret-that-is-long-enough';
const VALID = {
  JWT_ACCESS_SECRET: SECRET,
  MFA_ENCRYPTION_KEY: KEY,
  BACK_OFFICE_URL: 'https://admin.example.org/',
};

describe('loadAuthConfig', () => {
  it('applies the 15-minute access and 30-day refresh defaults', () => {
    const config = loadAuthConfig(VALID);
    expect(config).toMatchObject({
      accessTokenSecret: SECRET,
      accessTokenTtlSeconds: 900,
      refreshTokenTtlDays: 30,
      backOfficeUrl: 'https://admin.example.org',
      mfaPreviousEncryptionKey: undefined,
    });
    expect(config.mfaEncryptionKey.key).toEqual(Buffer.from(KEY, 'base64'));
    expect(config.mfaEncryptionKey.id).toMatch(/^[0-9a-f]{8}$/);
  });

  it('gives each MFA key a distinct id for rotation', () => {
    const config = loadAuthConfig({ ...VALID, MFA_ENCRYPTION_KEY_PREVIOUS: OTHER_KEY });
    expect(config.mfaPreviousEncryptionKey?.id).not.toBe(config.mfaEncryptionKey.id);
  });

  it('reports every missing or invalid variable at once', () => {
    expect(() =>
      loadAuthConfig({
        JWT_ACCESS_SECRET: 'short',
        JWT_ACCESS_TTL_SECONDS: '0',
        MFA_ENCRYPTION_KEY: Buffer.alloc(16).toString('base64'),
        BACK_OFFICE_URL: 'ftp://example.org',
      }),
    ).toThrow(
      /JWT_ACCESS_SECRET is required[\s\S]*JWT_ACCESS_TTL_SECONDS must be a positive integer[\s\S]*MFA_ENCRYPTION_KEY must be 32 bytes[\s\S]*BACK_OFFICE_URL must be an http/,
    );
    expect(() => loadAuthConfig({})).toThrow(/MFA_ENCRYPTION_KEY is required/);
  });

  it('never echoes a secret or key in errors', () => {
    const shortSecret = 'leaky-but-too-short';
    expect(() =>
      loadAuthConfig({
        ...VALID,
        JWT_ACCESS_SECRET: shortSecret,
        MFA_ENCRYPTION_KEY: 'bm90LWEta2V5',
      }),
    ).toThrow(
      expect.objectContaining({
        message: expect.not.stringMatching(new RegExp(`${shortSecret}|bm90LWEta2V5`)),
      }),
    );
  });
});
