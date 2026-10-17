import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Secret, TOTP } from 'otpauth';
import { DataSource, QueryRunner } from 'typeorm';
import {
  createDataSourceOptions,
  loadEnvironment,
  type AccessTokenClaims,
  type AuthConfig,
} from '@companion/common';

import { AdminAuthService } from './admin-auth.service';
import type { RequestContext } from './auth-audit';
import { MfaSecretCipher } from './domain/mfa-secret-cipher';
import { hashPassword, PasswordVerifier } from './domain/passwords';
import { createTotpSecret, TotpVerifier } from './domain/totp';
import { PasswordResetMailer, type PasswordResetMessage } from './password-reset-mailer';
import { PasswordResetService } from './password-reset.service';
import { SessionService } from './session.service';

// Runs against a migrated database inside a rolled-back transaction; the service's own
// transactions become savepoints. Existing admins' emails are moved aside for the duration, so
// a developer's local data never collides. Placeholder data only.

const CONFIG: AuthConfig = {
  accessTokenSecret: 'a-test-signing-secret-that-is-long-enough',
  accessTokenTtlSeconds: 900,
  refreshTokenTtlDays: 30,
  mfaEncryptionKey: { id: 'current1', key: Buffer.alloc(32, 1) },
  mfaPreviousEncryptionKey: { id: 'previous', key: Buffer.alloc(32, 2) },
  backOfficeUrl: 'http://localhost:4200',
};
const CONTEXT: RequestContext = { ipAddress: '203.0.113.7', userAgent: 'db-spec' };
const PASSWORD = 'correct horse battery staple';

class CapturingMailer extends PasswordResetMailer {
  readonly sent: PasswordResetMessage[] = [];
  async send(message: PasswordResetMessage): Promise<void> {
    this.sent.push(message);
  }
}

describe('admin auth services (database)', () => {
  const environment = loadEnvironment();
  const dataSource = new DataSource(
    createDataSourceOptions(environment, environment.database.migrationUrl),
  );
  const jwt = new JwtService({
    secret: CONFIG.accessTokenSecret,
    signOptions: { algorithm: 'HS256' },
    verifyOptions: { algorithms: ['HS256'] },
  });
  const cipher = new MfaSecretCipher(CONFIG.mfaEncryptionKey, CONFIG.mfaPreviousEncryptionKey);
  let passwords: PasswordVerifier;
  let passwordHash: string;

  let runner: QueryRunner;
  let mailer: CapturingMailer;
  let sessions: SessionService;
  let auth: AdminAuthService;
  let resets: PasswordResetService;

  beforeAll(async () => {
    await dataSource.initialize();
    passwords = await PasswordVerifier.create();
    passwordHash = await hashPassword(PASSWORD);
  });
  afterAll(() => dataSource.destroy());

  beforeEach(async () => {
    runner = dataSource.createQueryRunner();
    await runner.startTransaction();
    await runner.query(`UPDATE admin_user SET email = id || '@pre-existing.invalid'`);
    mailer = new CapturingMailer();
    sessions = new SessionService(runner.manager, CONFIG);
    auth = new AdminAuthService(
      runner.manager,
      CONFIG,
      sessions,
      jwt,
      passwords,
      new TotpVerifier(),
      cipher,
    );
    resets = new PasswordResetService(runner.manager, CONFIG, sessions, mailer);
  });
  afterEach(async () => {
    await runner.rollbackTransaction();
    await runner.release();
  });

  async function createAdmin(
    email: string,
    fields: { role?: string; status?: string; mfaSecretCiphertext?: string | null } = {},
  ): Promise<string> {
    const [row] = await runner.query(
      `INSERT INTO admin_user (email, name, role, status, password_hash, mfa_secret_ciphertext)
       VALUES ($1, 'Placeholder Admin', $2, $3, $4, $5) RETURNING id`,
      [
        email,
        fields.role ?? 'admin',
        fields.status ?? 'active',
        fields.status === 'pending' ? null : passwordHash,
        fields.mfaSecretCiphertext ?? null,
      ],
    );
    return row.id;
  }

  const auditActions = async (adminId: string) =>
    (
      await runner.query(
        `SELECT action, actor_type, actor_id FROM audit_log WHERE entity_id = $1 ORDER BY created_at, action`,
        [adminId],
      )
    ).map(
      (r: { action: string; actor_type: string; actor_id: string | null }) =>
        `${r.action} ${r.actor_type} ${r.actor_id === adminId ? 'self' : String(r.actor_id)}`,
    );

  const signIn = async (email: string) => {
    const { body, refreshToken } = await auth.login({ email, password: PASSWORD }, CONTEXT);
    if (!body.session || !refreshToken) {
      throw new Error('expected a full session');
    }
    return { session: body.session, refreshToken };
  };

  describe('login', () => {
    it('signs in an active admin with minimal access-token claims and a refresh token', async () => {
      const id = await createAdmin('ada@test.invalid');
      const { session, refreshToken } = await signIn('ada@test.invalid');

      const claims = await jwt.verifyAsync<AccessTokenClaims & { iat: number; exp: number }>(
        session.accessToken,
      );
      expect(claims).toMatchObject({ sub: id, role: 'admin', dsc: null, typ: 'access' });
      expect(Object.keys(claims).sort()).toEqual([
        'dsc',
        'exp',
        'iat',
        'role',
        'sid',
        'sub',
        'typ',
      ]);
      expect(claims.exp - claims.iat).toBe(900);
      expect(session.admin).toEqual({
        id,
        email: 'ada@test.invalid',
        name: 'Placeholder Admin',
        role: 'admin',
        dioceseScopeId: null,
        status: 'active',
      });
      expect(refreshToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
      expect(await auditActions(id)).toEqual(['admin.login_succeeded admin self']);
    });

    it('gives one answer for an unknown email, a wrong password and a non-active account', async () => {
      const wrongPassword = await createAdmin('wrong@test.invalid');
      const suspended = await createAdmin('suspended@test.invalid', { status: 'suspended' });
      const pending = await createAdmin('pending@test.invalid', { status: 'pending' });

      const attempts = [
        { email: 'nobody@test.invalid', password: PASSWORD },
        { email: 'wrong@test.invalid', password: 'not the password' },
        { email: 'suspended@test.invalid', password: PASSWORD },
        { email: 'pending@test.invalid', password: PASSWORD },
      ];
      for (const attempt of attempts) {
        await expect(auth.login(attempt, CONTEXT)).rejects.toThrow(
          new UnauthorizedException('Invalid email or password'),
        );
      }

      for (const id of [wrongPassword, suspended, pending]) {
        expect(await auditActions(id)).toEqual(['admin.login_failed system null']);
      }
      const [{ count }] = await runner.query(
        `SELECT count(*)::int AS count FROM audit_log WHERE user_agent = 'db-spec' AND entity_id IS NULL`,
      );
      expect(count).toBe(0);
    });
  });

  describe('super admin MFA', () => {
    const secret = createTotpSecret();
    const code = (timestamp = Date.now()) =>
      new TOTP({ secret: Secret.fromBase32(secret) }).generate({ timestamp });

    it('requires a TOTP code before issuing a session', async () => {
      const id = await createAdmin('root@test.invalid', {
        role: 'super_admin',
        mfaSecretCiphertext: cipher.seal(secret),
      });
      const { body, refreshToken } = await auth.login(
        { email: 'root@test.invalid', password: PASSWORD },
        CONTEXT,
      );
      expect(body).toMatchObject({ status: 'mfa_required', session: null });
      expect(refreshToken).toBeNull();

      const mfaToken = body.mfaToken ?? '';
      await expect(auth.completeMfaLogin({ mfaToken, code: '000000' }, CONTEXT)).rejects.toThrow(
        UnauthorizedException,
      );
      const signedIn = await auth.completeMfaLogin({ mfaToken, code: code() }, CONTEXT);
      expect(signedIn.body.admin.role).toBe('super_admin');
      await expect(auth.completeMfaLogin({ mfaToken, code: code() }, CONTEXT)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(await auditActions(id)).toEqual(
        expect.arrayContaining([
          'admin.mfa_failed system null',
          'admin.login_succeeded admin self',
        ]),
      );
    });

    it('rejects an access token in place of the MFA token', async () => {
      await createAdmin('plain@test.invalid');
      const { session } = await signIn('plain@test.invalid');
      await expect(
        auth.completeMfaLogin({ mfaToken: session.accessToken, code: code() }, CONTEXT),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('re-seals a secret from the previous key with the current key', async () => {
      const id = await createAdmin('rotated@test.invalid', {
        role: 'super_admin',
        mfaSecretCiphertext: new MfaSecretCipher(CONFIG.mfaPreviousEncryptionKey!, undefined).seal(
          secret,
        ),
      });
      const { body } = await auth.login(
        { email: 'rotated@test.invalid', password: PASSWORD },
        CONTEXT,
      );
      await auth.completeMfaLogin({ mfaToken: body.mfaToken ?? '', code: code() }, CONTEXT);

      const [{ mfa_secret_ciphertext }] = await runner.query(
        `SELECT mfa_secret_ciphertext FROM admin_user WHERE id = $1`,
        [id],
      );
      expect(mfa_secret_ciphertext).toMatch(/^v1:current1:/);
    });

    it('refuses a super admin without enrolled MFA, after a correct password', async () => {
      await createAdmin('unenrolled@test.invalid', { role: 'super_admin' });
      await expect(
        auth.login({ email: 'unenrolled@test.invalid', password: PASSWORD }, CONTEXT),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('refresh tokens', () => {
    const revokedAt = (refreshToken: string) =>
      runner
        .query(
          `SELECT revoked_at FROM admin_session WHERE token_hash = encode(sha256($1), 'hex')`,
          [refreshToken],
        )
        .then(([row]) => row?.revoked_at ?? null);

    it('rotates within the family and refuses the replaced token', async () => {
      await createAdmin('rotate@test.invalid');
      const first = await signIn('rotate@test.invalid');

      const second = await auth.refresh(first.refreshToken, CONTEXT);
      const firstClaims = await jwt.verifyAsync<AccessTokenClaims>(first.session.accessToken);
      const secondClaims = await jwt.verifyAsync<AccessTokenClaims>(second.body.accessToken);
      expect(second.refreshToken).not.toBe(first.refreshToken);
      expect(secondClaims.sid).toBe(firstClaims.sid);

      // Inside the grace window: refused, but the family survives.
      await expect(auth.refresh(first.refreshToken, CONTEXT)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(await revokedAt(second.refreshToken ?? '')).toBeNull();
    });

    it('revokes the whole family when a replaced token comes back later', async () => {
      const id = await createAdmin('stolen@test.invalid');
      const first = await signIn('stolen@test.invalid');
      const second = await auth.refresh(first.refreshToken, CONTEXT);
      await runner.query(
        `UPDATE admin_session SET revoked_at = now() - interval '1 minute' WHERE token_hash = encode(sha256($1), 'hex')`,
        [first.refreshToken],
      );

      await expect(auth.refresh(first.refreshToken, CONTEXT)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(await revokedAt(second.refreshToken ?? '')).not.toBeNull();
      await expect(auth.refresh(second.refreshToken ?? '', CONTEXT)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(await auditActions(id)).toContain('admin.refresh_token_reused system null');
    });

    it('refuses an expired token, a family past 90 days and a suspended admin', async () => {
      const expiredAdmin = await createAdmin('expired@test.invalid');
      const expired = await signIn('expired@test.invalid');
      await runner.query(
        `UPDATE admin_session SET expires_at = now() - interval '1 second' WHERE admin_user_id = $1`,
        [expiredAdmin],
      );
      await expect(auth.refresh(expired.refreshToken, CONTEXT)).rejects.toThrow(
        UnauthorizedException,
      );

      const oldAdmin = await createAdmin('old@test.invalid');
      const old = await signIn('old@test.invalid');
      await runner.query(
        `UPDATE admin_session SET created_at = now() - interval '91 days' WHERE admin_user_id = $1`,
        [oldAdmin],
      );
      await expect(auth.refresh(old.refreshToken, CONTEXT)).rejects.toThrow(UnauthorizedException);

      const suspendedAdmin = await createAdmin('later-suspended@test.invalid');
      const suspended = await signIn('later-suspended@test.invalid');
      await runner.query(`UPDATE admin_user SET status = 'suspended' WHERE id = $1`, [
        suspendedAdmin,
      ]);
      await expect(auth.refresh(suspended.refreshToken, CONTEXT)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(await revokedAt(suspended.refreshToken)).not.toBeNull();
    });

    it('logs out by revoking this device only', async () => {
      const id = await createAdmin('logout@test.invalid');
      const laptop = await signIn('logout@test.invalid');
      const phone = await signIn('logout@test.invalid');

      await auth.logout(laptop.refreshToken, CONTEXT);
      await expect(auth.refresh(laptop.refreshToken, CONTEXT)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(auth.refresh(phone.refreshToken, CONTEXT)).resolves.toBeDefined();
      expect(await auditActions(id)).toContain('admin.logout admin self');
      await expect(auth.logout('not-a-token', CONTEXT)).resolves.toBeUndefined();
    });
  });

  describe('password reset', () => {
    const tokenFrom = (message: PasswordResetMessage | undefined) =>
      new URL(message?.resetUrl ?? 'http://x').searchParams.get('token') ?? '';

    it('does nothing visible for an unknown email', async () => {
      const resetRowCount = () =>
        runner
          .query(`SELECT count(*)::int AS count FROM admin_password_reset`)
          .then(([row]) => row.count);
      const before = await resetRowCount();
      await resets.request('nobody@test.invalid', CONTEXT);
      expect(mailer.sent).toEqual([]);
      expect(await resetRowCount()).toBe(before);
    });

    it('sends a single-use link that sets the password and ends every session', async () => {
      const id = await createAdmin('forgot@test.invalid');
      const before = await signIn('forgot@test.invalid');

      await resets.request('forgot@test.invalid', CONTEXT);
      await resets.request('forgot@test.invalid', CONTEXT);
      expect(mailer.sent).toHaveLength(2);
      expect(mailer.sent[1]?.resetUrl).toMatch(/^http:\/\/localhost:4200\/reset-password\?token=/);

      await expect(
        resets.reset(tokenFrom(mailer.sent[0]), 'the first link was cancelled', CONTEXT),
      ).rejects.toThrow(BadRequestException);

      const token = tokenFrom(mailer.sent[1]);
      await resets.reset(token, 'a brand new passphrase', CONTEXT);
      await expect(resets.reset(token, 'used twice is refused', CONTEXT)).rejects.toThrow(
        BadRequestException,
      );
      await expect(auth.refresh(before.refreshToken, CONTEXT)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(
        auth.login({ email: 'forgot@test.invalid', password: 'a brand new passphrase' }, CONTEXT),
      ).resolves.toMatchObject({ body: { status: 'authenticated' } });
      expect(await auditActions(id)).toEqual(
        expect.arrayContaining([
          'admin.password_reset_requested system null',
          'admin.password_reset_completed admin self',
        ]),
      );
    });

    it('refuses an expired link', async () => {
      const id = await createAdmin('slow@test.invalid');
      await resets.request('slow@test.invalid', CONTEXT);
      await runner.query(
        `UPDATE admin_password_reset SET expires_at = now() - interval '1 second' WHERE admin_user_id = $1`,
        [id],
      );
      await expect(
        resets.reset(tokenFrom(mailer.sent[0]), 'too late for this one', CONTEXT),
      ).rejects.toThrow(BadRequestException);
    });
  });

  it('returns the signed-in admin without any secret', async () => {
    const id = await createAdmin('me@test.invalid');
    const profile = await auth.me(id);
    expect(Object.keys(profile).sort()).toEqual(
      ['dioceseScopeId', 'email', 'id', 'name', 'role', 'status'].sort(),
    );
  });
});
