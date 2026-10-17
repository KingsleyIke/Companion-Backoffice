import { Secret, TOTP } from 'otpauth';

import { createTotpSecret, totpProvisioningUri, TotpVerifier } from './totp';

const STEP = 30_000;
const NOW = 1_800_000_000_000;

describe('TOTP', () => {
  const secret = createTotpSecret();
  const codeAt = (timestamp: number) =>
    new TOTP({ secret: Secret.fromBase32(secret), period: 30, digits: 6 }).generate({ timestamp });

  it('creates a base32 secret and an otpauth provisioning URI', () => {
    expect(secret).toMatch(/^[A-Z2-7]{32}$/);
    expect(totpProvisioningUri(secret, 'ada@example.org')).toMatch(
      /^otpauth:\/\/totp\/Catholic%20Companion:ada%40example\.org\?.*secret=/,
    );
  });

  it('accepts the current code and one step of drift either way, not two', () => {
    expect(new TotpVerifier().verify('a', secret, codeAt(NOW), NOW)).toBe(true);
    expect(new TotpVerifier().verify('a', secret, codeAt(NOW - STEP), NOW)).toBe(true);
    expect(new TotpVerifier().verify('a', secret, codeAt(NOW + STEP), NOW)).toBe(true);
    expect(new TotpVerifier().verify('a', secret, codeAt(NOW - 2 * STEP), NOW)).toBe(false);
  });

  it('rejects a replayed or older step for the same admin only', () => {
    const verifier = new TotpVerifier();
    expect(verifier.verify('a', secret, codeAt(NOW), NOW)).toBe(true);
    expect(verifier.verify('a', secret, codeAt(NOW), NOW)).toBe(false);
    expect(verifier.verify('a', secret, codeAt(NOW - STEP), NOW)).toBe(false);
    expect(verifier.verify('b', secret, codeAt(NOW), NOW)).toBe(true);
  });
});
