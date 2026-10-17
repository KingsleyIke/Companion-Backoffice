import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, IsNull } from 'typeorm';
import { authConfig, type AuthConfig } from '@companion/common';
import { AdminPasswordReset, AdminUser } from '@companion/entities';

import { recordAuthEvent, type RequestContext } from './auth-audit';
import { generateOpaqueToken, hashOpaqueToken } from './domain/opaque-token';
import { hashPassword } from './domain/passwords';
import { PasswordResetMailer } from './password-reset-mailer';
import { SessionService } from './session.service';

const RESET_TOKEN_TTL_MS = 30 * 60_000;

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    @InjectEntityManager() private readonly manager: EntityManager,
    @Inject(authConfig.KEY) private readonly config: AuthConfig,
    private readonly sessions: SessionService,
    private readonly mailer: PasswordResetMailer,
  ) {}

  // Same outcome whether or not the email belongs to an active admin. The email is sent without
  // awaiting it, so the response time does not depend on the mail provider.
  async request(email: string, context: RequestContext): Promise<void> {
    const admin = await this.manager
      .getRepository(AdminUser)
      .findOneBy({ email, status: 'active' });
    if (!admin) {
      return;
    }
    const { token, hash } = generateOpaqueToken();
    const now = new Date();
    await this.manager.transaction(async (tx) => {
      await tx.update(
        AdminPasswordReset,
        { adminUserId: admin.id, usedAt: IsNull() },
        { usedAt: now },
      );
      await tx.insert(AdminPasswordReset, {
        adminUserId: admin.id,
        tokenHash: hash,
        expiresAt: new Date(now.getTime() + RESET_TOKEN_TTL_MS),
      });
      await recordAuthEvent(tx, 'admin.password_reset_requested', admin.id, context);
    });

    const resetUrl = `${this.config.backOfficeUrl}/reset-password?token=${token}`;
    this.mailer
      .send({ adminId: admin.id, to: admin.email, resetUrl })
      .catch(() => this.logger.error(`Password reset email failed for admin ${admin.id}`));
  }

  // Single use, short-lived, and it ends every session the admin has.
  async reset(token: string, password: string, context: RequestContext): Promise<void> {
    const now = new Date();
    const reset = await this.manager.transaction(async (tx) => {
      const pending = await tx.getRepository(AdminPasswordReset).findOne({
        where: { tokenHash: hashOpaqueToken(token), usedAt: IsNull() },
        lock: { mode: 'pessimistic_write' },
      });
      const admin =
        pending && pending.expiresAt > now
          ? await tx
              .getRepository(AdminUser)
              .findOneBy({ id: pending.adminUserId, status: 'active' })
          : null;
      if (!pending || !admin) {
        return false;
      }
      await tx.update(AdminUser, admin.id, { passwordHash: await hashPassword(password) });
      await tx.update(AdminPasswordReset, pending.id, { usedAt: now });
      await this.sessions.revokeAllForAdmin(tx, admin.id, now);
      await recordAuthEvent(tx, 'admin.password_reset_completed', admin.id, context);
      return true;
    });
    if (!reset) {
      throw new BadRequestException('Invalid or expired reset link');
    }
  }
}
