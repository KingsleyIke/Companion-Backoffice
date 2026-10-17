import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, IsNull } from 'typeorm';
import { authConfig, type AuthConfig } from '@companion/common';
import { AdminSession, AdminUser } from '@companion/entities';

import { recordAuthEvent, type RequestContext } from './auth-audit';
import { generateOpaqueToken, hashOpaqueToken } from './domain/opaque-token';

const DAY_MS = 86_400_000;
// A family can be refreshed for at most 90 days after its first sign-in, however active.
const SESSION_MAX_AGE_MS = 90 * DAY_MS;
// Two requests racing with the same cookie: the loser sees a just-replaced token. That is not
// theft, so within this window it is refused without revoking the family.
const REUSE_GRACE_MS = 10_000;

export interface IssuedRefreshToken {
  refreshToken: string;
  familyId: string;
}

export type Rotation =
  ({ rotated: true; admin: AdminUser } & IssuedRefreshToken) | { rotated: false };

// Refresh tokens: one admin_session row per issued token, chained by replaced_by_id within a
// family_id (one sign-in on one device). Only SHA-256 hashes are stored.
@Injectable()
export class SessionService {
  constructor(
    @InjectEntityManager() private readonly manager: EntityManager,
    @Inject(authConfig.KEY) private readonly config: AuthConfig,
  ) {}

  // A new family: one sign-in on one device.
  async start(tx: EntityManager, adminId: string, now = new Date()): Promise<IssuedRefreshToken> {
    const { refreshToken, familyId } = await this.issue(tx, adminId, randomUUID(), now);
    return { refreshToken, familyId };
  }

  // Never throws for a rejected token: revoking a family on reuse must commit, not roll back.
  rotate(refreshToken: string, context: RequestContext, now = new Date()): Promise<Rotation> {
    return this.manager.transaction(async (tx) => {
      const current = await tx.getRepository(AdminSession).findOne({
        where: { tokenHash: hashOpaqueToken(refreshToken) },
        lock: { mode: 'pessimistic_write' },
      });
      if (!current) {
        return { rotated: false };
      }
      if (current.revokedAt) {
        const replacedLongAgo =
          current.replacedById !== null &&
          now.getTime() - current.revokedAt.getTime() > REUSE_GRACE_MS;
        if (replacedLongAgo) {
          await this.revokeFamily(tx, current.familyId, now);
          await recordAuthEvent(tx, 'admin.refresh_token_reused', current.adminUserId, context);
        }
        return { rotated: false };
      }

      const admin = await tx.getRepository(AdminUser).findOneBy({ id: current.adminUserId });
      const startedAt = await this.familyStartedAt(tx, current.familyId, now);
      const usable =
        current.expiresAt > now &&
        now.getTime() - startedAt.getTime() < SESSION_MAX_AGE_MS &&
        admin?.status === 'active';
      if (!usable || !admin) {
        await this.revokeFamily(tx, current.familyId, now);
        return { rotated: false };
      }

      const next = await this.issue(tx, admin.id, current.familyId, now);
      await tx.update(AdminSession, current.id, { revokedAt: now, replacedById: next.id });
      return { rotated: true, admin, refreshToken: next.refreshToken, familyId: next.familyId };
    });
  }

  // Logout: ends the family behind this cookie. Returns the admin it belonged to, if any.
  async revokeFamilyOf(refreshToken: string, now = new Date()): Promise<string | null> {
    const session = await this.manager
      .getRepository(AdminSession)
      .findOneBy({ tokenHash: hashOpaqueToken(refreshToken) });
    if (!session) {
      return null;
    }
    await this.revokeFamily(this.manager, session.familyId, now);
    return session.adminUserId;
  }

  // For a password reset now, and for suspension or role changes (tasks 1.1.6 and 1.2.13).
  async revokeAllForAdmin(tx: EntityManager, adminId: string, now = new Date()): Promise<void> {
    await tx.update(
      AdminSession,
      { adminUserId: adminId, revokedAt: IsNull() },
      { revokedAt: now },
    );
  }

  private async revokeFamily(tx: EntityManager, familyId: string, now: Date): Promise<void> {
    await tx.update(AdminSession, { familyId, revokedAt: IsNull() }, { revokedAt: now });
  }

  // The presented row belongs to the family, so the minimum always exists.
  private async familyStartedAt(tx: EntityManager, familyId: string, now: Date): Promise<Date> {
    const row = await tx
      .getRepository(AdminSession)
      .createQueryBuilder('session')
      .select('MIN(session.createdAt)', 'startedAt')
      .where('session.familyId = :familyId', { familyId })
      .getRawOne<{ startedAt: Date }>();
    return row?.startedAt ?? now;
  }

  private async issue(
    tx: EntityManager,
    adminId: string,
    familyId: string,
    now: Date,
  ): Promise<IssuedRefreshToken & { id: string }> {
    const { token, hash } = generateOpaqueToken();
    const { id } = await tx.getRepository(AdminSession).save({
      adminUserId: adminId,
      tokenHash: hash,
      familyId,
      expiresAt: new Date(now.getTime() + this.config.refreshTokenTtlDays * DAY_MS),
    });
    return { id, refreshToken: token, familyId };
  }
}
