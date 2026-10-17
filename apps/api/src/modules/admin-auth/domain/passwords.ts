import { randomBytes } from 'node:crypto';

import * as argon2 from 'argon2';

// OWASP Password Storage Cheat Sheet minimum for Argon2id: 19 MiB, 2 iterations, 1 lane. About
// 50 ms per hash on a small instance, and bounded memory under a burst of logins. Parameters
// are encoded in each hash, so raising them later only needs passwordNeedsRehash at login.
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

export function passwordNeedsRehash(hash: string): boolean {
  return argon2.needsRehash(hash, ARGON2_OPTIONS);
}

// Verifies against a dummy hash when there is no real one, so an unknown email, an account
// without a password and a wrong password all cost one Argon2 verification.
export class PasswordVerifier {
  private constructor(private readonly dummyHash: string) {}

  static async create(): Promise<PasswordVerifier> {
    return new PasswordVerifier(await hashPassword(randomBytes(32).toString('base64')));
  }

  async verify(hash: string | null, password: string): Promise<boolean> {
    const matches = await argon2.verify(hash ?? this.dummyHash, password).catch(() => false);
    return hash !== null && matches;
  }
}
