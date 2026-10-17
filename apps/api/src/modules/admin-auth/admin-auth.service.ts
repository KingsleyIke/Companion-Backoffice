import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { authConfig, type AccessTokenClaims, type AuthConfig } from '@companion/common';
import type {
  AdminProfileDto,
  AuthSessionDto,
  LoginRequestDto,
  LoginResultDto,
  MfaLoginRequestDto,
} from '@companion/dto';
import { AdminUser } from '@companion/entities';

import { recordAuthEvent, type RequestContext } from './auth-audit';
import { MfaSecretCipher } from './domain/mfa-secret-cipher';
import { hashPassword, passwordNeedsRehash, PasswordVerifier } from './domain/passwords';
import { TotpVerifier } from './domain/totp';
import { SessionService } from './session.service';

const INVALID_CREDENTIALS = 'Invalid email or password';
const MFA_TOKEN_TTL_SECONDS = 300;

// What the controller needs: the response body, and a refresh token for the cookie if one was issued.
export interface SignIn<T> {
  body: T;
  refreshToken: string | null;
}

interface MfaTokenClaims {
  sub: string;
  typ: 'mfa';
}

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectEntityManager() private readonly manager: EntityManager,
    @Inject(authConfig.KEY) private readonly config: AuthConfig,
    private readonly sessions: SessionService,
    private readonly jwt: JwtService,
    private readonly passwords: PasswordVerifier,
    private readonly totp: TotpVerifier,
    private readonly cipher: MfaSecretCipher,
  ) {}

  // An unknown email, a wrong password and a non-active account get the same answer after the
  // same Argon2 work, so the response reveals nothing about which accounts exist.
  async login(
    { email, password }: LoginRequestDto,
    context: RequestContext,
  ): Promise<SignIn<LoginResultDto>> {
    const admin = await this.admins()
      .addSelect(['admin.passwordHash', 'admin.mfaSecretCiphertext'])
      .where('admin.email = :email', { email })
      .getOne();
    const hash = admin?.passwordHash ?? null;
    const valid = await this.passwords.verify(hash, password);
    if (!admin || !hash || !valid || admin.status !== 'active') {
      if (admin) {
        await recordAuthEvent(this.manager, 'admin.login_failed', admin.id, context);
      }
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
    if (passwordNeedsRehash(hash)) {
      await this.manager.update(AdminUser, admin.id, {
        passwordHash: await hashPassword(password),
      });
    }

    if (admin.role === 'super_admin') {
      if (!admin.mfaSecretCiphertext) {
        throw new ForbiddenException('MFA is not set up for this account');
      }
      const claims: MfaTokenClaims = { sub: admin.id, typ: 'mfa' };
      const mfaToken = await this.jwt.signAsync(claims, { expiresIn: MFA_TOKEN_TTL_SECONDS });
      return { body: { status: 'mfa_required', session: null, mfaToken }, refreshToken: null };
    }

    const { body, refreshToken } = await this.signIn(admin, context);
    return { body: { status: 'authenticated', session: body, mfaToken: null }, refreshToken };
  }

  async completeMfaLogin(
    { mfaToken, code }: MfaLoginRequestDto,
    context: RequestContext,
  ): Promise<SignIn<AuthSessionDto>> {
    const claims = await this.jwt.verifyAsync<MfaTokenClaims>(mfaToken).catch(() => null);
    if (claims?.typ !== 'mfa') {
      throw new UnauthorizedException();
    }
    const admin = await this.admins()
      .addSelect('admin.mfaSecretCiphertext')
      .where('admin.id = :id', { id: claims.sub })
      .andWhere("admin.status = 'active' AND admin.role = 'super_admin'")
      .getOne();
    if (!admin?.mfaSecretCiphertext) {
      throw new UnauthorizedException();
    }

    const { secret, sealedWithCurrentKey } = this.cipher.open(admin.mfaSecretCiphertext);
    if (!this.totp.verify(admin.id, secret, code)) {
      await recordAuthEvent(this.manager, 'admin.mfa_failed', admin.id, context);
      throw new UnauthorizedException('Invalid code');
    }
    if (!sealedWithCurrentKey) {
      await this.manager.update(AdminUser, admin.id, {
        mfaSecretCiphertext: this.cipher.seal(secret),
      });
    }
    return this.signIn(admin, context);
  }

  async refresh(
    refreshToken: string | undefined,
    context: RequestContext,
  ): Promise<SignIn<AuthSessionDto>> {
    const rotation = refreshToken ? await this.sessions.rotate(refreshToken, context) : null;
    if (!rotation?.rotated) {
      throw new UnauthorizedException();
    }
    return {
      body: await this.accessSession(rotation.admin, rotation.familyId),
      refreshToken: rotation.refreshToken,
    };
  }

  async logout(refreshToken: string | undefined, context: RequestContext): Promise<void> {
    const adminId = refreshToken ? await this.sessions.revokeFamilyOf(refreshToken) : null;
    if (adminId) {
      await recordAuthEvent(this.manager, 'admin.logout', adminId, context);
    }
  }

  async me(adminId: string): Promise<AdminProfileDto> {
    const admin = await this.manager.getRepository(AdminUser).findOneBy({ id: adminId });
    if (admin?.status !== 'active') {
      throw new UnauthorizedException();
    }
    return toProfile(admin);
  }

  private async signIn(admin: AdminUser, context: RequestContext): Promise<SignIn<AuthSessionDto>> {
    const { refreshToken, familyId } = await this.manager.transaction(async (tx) => {
      const issued = await this.sessions.start(tx, admin.id);
      await tx.update(AdminUser, admin.id, { lastLoginAt: new Date() });
      await recordAuthEvent(tx, 'admin.login_succeeded', admin.id, context);
      return issued;
    });
    return { body: await this.accessSession(admin, familyId), refreshToken };
  }

  private async accessSession(admin: AdminUser, familyId: string): Promise<AuthSessionDto> {
    const ttl = this.config.accessTokenTtlSeconds;
    const claims: AccessTokenClaims = {
      sub: admin.id,
      role: admin.role,
      dsc: admin.dioceseScopeId,
      sid: familyId,
      typ: 'access',
    };
    const accessToken = await this.jwt.signAsync(claims, { expiresIn: ttl });
    return {
      accessToken,
      accessTokenExpiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
      admin: toProfile(admin),
    };
  }

  private admins() {
    return this.manager.getRepository(AdminUser).createQueryBuilder('admin');
  }
}

function toProfile(admin: AdminUser): AdminProfileDto {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    dioceseScopeId: admin.dioceseScopeId,
    status: admin.status,
  };
}
