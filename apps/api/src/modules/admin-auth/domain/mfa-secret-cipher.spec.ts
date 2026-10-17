import { MfaSecretCipher } from './mfa-secret-cipher';

const key = (fill: number, id: string) => ({ id, key: Buffer.alloc(32, fill) });
const CURRENT = key(1, 'current1');
const PREVIOUS = key(2, 'previous');

describe('MfaSecretCipher', () => {
  const cipher = new MfaSecretCipher(CURRENT, PREVIOUS);

  it('round-trips a secret sealed with the current key', () => {
    const sealed = cipher.seal('JBSWY3DPEHPK3PXP');
    expect(sealed).toMatch(/^v1:current1:/);
    expect(sealed).not.toContain('JBSWY3DPEHPK3PXP');
    expect(cipher.open(sealed)).toEqual({ secret: 'JBSWY3DPEHPK3PXP', sealedWithCurrentKey: true });
  });

  it('uses a fresh IV each time', () => {
    expect(cipher.seal('same')).not.toBe(cipher.seal('same'));
  });

  it('opens a value sealed with the previous key and flags it for re-sealing', () => {
    const sealedBefore = new MfaSecretCipher(PREVIOUS, undefined).seal('OLDSECRET');
    expect(cipher.open(sealedBefore)).toEqual({ secret: 'OLDSECRET', sealedWithCurrentKey: false });
  });

  it('refuses an unknown key or a tampered value', () => {
    const sealed = cipher.seal('SECRET');
    expect(() => new MfaSecretCipher(key(3, 'otherkey'), undefined).open(sealed)).toThrow();
    const [version, id, iv, , tag] = sealed.split(':');
    expect(() => cipher.open([version, id, iv, 'AAAA', tag].join(':'))).toThrow();
  });
});
