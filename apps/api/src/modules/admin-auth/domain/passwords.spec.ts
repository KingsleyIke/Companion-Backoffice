import * as argon2 from 'argon2';

import { hashPassword, passwordNeedsRehash, PasswordVerifier } from './passwords';

describe('passwords', () => {
  let verifier: PasswordVerifier;
  beforeAll(async () => {
    verifier = await PasswordVerifier.create();
  });

  it('hashes with Argon2id at the OWASP minimum parameters', async () => {
    expect(await hashPassword('correct horse battery')).toMatch(
      /^\$argon2id\$v=19\$m=19456,p=1,t=2\$/,
    );
  });

  it('verifies the right password and rejects a wrong one', async () => {
    const hash = await hashPassword('correct horse battery');
    expect(await verifier.verify(hash, 'correct horse battery')).toBe(true);
    expect(await verifier.verify(hash, 'wrong horse battery')).toBe(false);
  });

  it('rejects when there is no stored hash, after doing the same work', async () => {
    expect(await verifier.verify(null, 'anything')).toBe(false);
  });

  it('rejects a malformed stored hash instead of throwing', async () => {
    expect(await verifier.verify('not-a-hash', 'anything')).toBe(false);
  });

  it('asks for a rehash only when the parameters differ', async () => {
    expect(passwordNeedsRehash(await hashPassword('x'))).toBe(false);
    expect(passwordNeedsRehash(await argon2.hash('x', { type: argon2.argon2id }))).toBe(true);
  });
});
