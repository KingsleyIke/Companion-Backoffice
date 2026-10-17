import { createHash, randomBytes } from 'node:crypto';

// 256 random bits. Stored only as a SHA-256 hash: a fast hash is enough for a random secret.
export function generateOpaqueToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: hashOpaqueToken(token) };
}

export function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
