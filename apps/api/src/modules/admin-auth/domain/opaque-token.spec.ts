import { generateOpaqueToken, hashOpaqueToken } from './opaque-token';

describe('opaque tokens', () => {
  it('generates 256-bit url-safe tokens with their SHA-256 hash', () => {
    const { token, hash } = generateOpaqueToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hashOpaqueToken(token)).toBe(hash);
  });

  it('never repeats', () => {
    expect(generateOpaqueToken().token).not.toBe(generateOpaqueToken().token);
  });
});
