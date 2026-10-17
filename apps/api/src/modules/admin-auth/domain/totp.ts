import { Secret, TOTP } from 'otpauth';

const ISSUER = 'Catholic Companion';
const PERIOD_SECONDS = 30;

export function createTotpSecret(): string {
  return new Secret({ size: 20 }).base32;
}

export function totpProvisioningUri(secret: string, accountLabel: string): string {
  return totp(secret, accountLabel).toString();
}

// Accepts the previous, current and next 30-second step for clock drift, and never the same
// step twice for one admin. Replay memory is per process: enough for one API instance.
export class TotpVerifier {
  private readonly lastAcceptedStep = new Map<string, number>();

  verify(adminId: string, secret: string, code: string, now = Date.now()): boolean {
    const delta = totp(secret).validate({ token: code, timestamp: now, window: 1 });
    if (delta === null) {
      return false;
    }
    const step = Math.floor(now / 1000 / PERIOD_SECONDS) + delta;
    if (step <= (this.lastAcceptedStep.get(adminId) ?? -1)) {
      return false;
    }
    this.lastAcceptedStep.set(adminId, step);
    return true;
  }
}

function totp(secret: string, label = 'admin'): TOTP {
  return new TOTP({
    issuer: ISSUER,
    label,
    algorithm: 'SHA1',
    digits: 6,
    period: PERIOD_SECONDS,
    secret: Secret.fromBase32(secret),
  });
}
