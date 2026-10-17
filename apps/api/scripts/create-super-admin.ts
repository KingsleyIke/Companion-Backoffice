import { stdin, stdout } from 'node:process';

import { isEmail } from 'class-validator';
import { DataSource } from 'typeorm';
import { createDataSourceOptions, loadAuthConfig, loadEnvironment } from '@companion/common';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@companion/dto';
import { AdminUser } from '@companion/entities';

import { recordAuthEvent } from '../src/modules/admin-auth/auth-audit';
import { MfaSecretCipher } from '../src/modules/admin-auth/domain/mfa-secret-cipher';
import { hashPassword } from '../src/modules/admin-auth/domain/passwords';
import {
  createTotpSecret,
  totpProvisioningUri,
  TotpVerifier,
} from '../src/modules/admin-auth/domain/totp';

// Creates a super admin, with TOTP enrolled before anything is saved. There is no
// self-registration, and credentials never go in a migration, seed or env file.
// Usage: pnpm admin:create-super-admin [--additional]
async function main(): Promise<void> {
  if (!stdin.isTTY) {
    throw new Error('Run this in an interactive terminal');
  }
  const environment = loadEnvironment();
  const auth = loadAuthConfig();
  const cipher = new MfaSecretCipher(auth.mfaEncryptionKey, auth.mfaPreviousEncryptionKey);
  const dataSource = await new DataSource(
    createDataSourceOptions(environment, environment.database.migrationUrl),
  ).initialize();

  try {
    const activeSuperAdmins = await dataSource
      .getRepository(AdminUser)
      .countBy({ role: 'super_admin', status: 'active' });
    if (activeSuperAdmins > 0 && !process.argv.includes('--additional')) {
      throw new Error('An active super admin already exists. Pass --additional to add another.');
    }

    const email = (await readLine('Email: ')).trim().toLowerCase();
    const name = (await readLine('Name: ')).trim();
    const password = await readLine('Password: ', { hidden: true });
    const confirmation = await readLine('Confirm password: ', { hidden: true });
    if (!isEmail(email) || !name || name.length > 160) {
      throw new Error('A valid email and a name of at most 160 characters are required');
    }
    if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
      throw new Error(
        `The password must be ${PASSWORD_MIN_LENGTH}–${PASSWORD_MAX_LENGTH} characters`,
      );
    }
    if (password !== confirmation) {
      throw new Error('The passwords do not match');
    }

    const secret = createTotpSecret();
    stdout.write(
      `\nAdd this account to an authenticator app:\n  setup key: ${secret}\n  or link:   ${totpProvisioningUri(secret, email)}\n\n`,
    );
    const code = (await readLine('Six-digit code from the app: ')).trim();
    if (!new TotpVerifier().verify('enrolment', secret, code)) {
      throw new Error('That code does not match. Nothing was created.');
    }

    await dataSource.transaction(async (tx) => {
      const { id } = await tx.getRepository(AdminUser).save({
        email,
        name,
        role: 'super_admin',
        status: 'active',
        passwordHash: await hashPassword(password),
        mfaSecretCiphertext: cipher.seal(secret),
      });
      await recordAuthEvent(tx, 'admin.super_admin_created', id, null);
    });
    stdout.write(`\nCreated super admin ${email}.\n`);
  } finally {
    await dataSource.destroy();
  }
}

// Raw mode, so a hidden answer is never echoed or kept in terminal history. Handles pasted text.
function readLine(question: string, { hidden = false } = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    let answer = '';
    const finish = (error?: Error) => {
      stdin.off('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write('\n');
      if (error) {
        reject(error);
      } else {
        resolve(answer);
      }
    };
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n') {
          return finish();
        }
        if (char === '\u0003') {
          return finish(new Error('Cancelled'));
        }
        if (char === '\u007f') {
          answer = answer.slice(0, -1);
          if (!hidden) {
            stdout.write('\b \b');
          }
        } else {
          answer += char;
          if (!hidden) {
            stdout.write(char);
          }
        }
      }
    };
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.setEncoding('utf8');
    stdin.resume();
    stdin.on('data', onData);
  });
}

main().catch((error: Error) => {
  stdout.write(`\n${error.message}\n`);
  process.exitCode = 1;
});
