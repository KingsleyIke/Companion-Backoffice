import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import type { EncryptionKey } from '@companion/common';

const VERSION = 'v1';

// AES-256-GCM. Sealed form: v1:<keyId>:<iv>:<ciphertext>:<tag>, base64url parts. The key id
// lets a value sealed with MFA_ENCRYPTION_KEY_PREVIOUS still open after a rotation.
export class MfaSecretCipher {
  constructor(
    private readonly current: EncryptionKey,
    private readonly previous: EncryptionKey | undefined,
  ) {}

  seal(secret: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.current.key, iv);
    const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
    return [VERSION, this.current.id, iv, ciphertext, cipher.getAuthTag()]
      .map((part) => (Buffer.isBuffer(part) ? part.toString('base64url') : part))
      .join(':');
  }

  // Throws on an unknown key id or a tampered value: both mean the stored secret is unusable.
  open(sealed: string): { secret: string; sealedWithCurrentKey: boolean } {
    const [version, keyId, iv, ciphertext, tag] = sealed.split(':');
    const key = [this.current, this.previous].find((candidate) => candidate?.id === keyId);
    if (version !== VERSION || !key || !iv || !ciphertext || !tag) {
      throw new Error('MFA secret was sealed with an unknown key or format');
    }
    const decipher = createDecipheriv('aes-256-gcm', key.key, Buffer.from(iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    const secret = Buffer.concat([
      decipher.update(Buffer.from(ciphertext, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
    return { secret, sealedWithCurrentKey: key === this.current };
  }
}
