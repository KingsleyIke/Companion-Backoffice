import type { EntityManager } from 'typeorm';
import { AuditLog } from '@companion/entities';

export type AuthAuditAction =
  | 'admin.login_succeeded'
  | 'admin.login_failed'
  | 'admin.mfa_failed'
  | 'admin.refresh_token_reused'
  | 'admin.logout'
  | 'admin.password_reset_requested'
  | 'admin.password_reset_completed'
  | 'admin.super_admin_created';

export interface RequestContext {
  ipAddress: string | null;
  userAgent: string | null;
}

// Done by the admin themselves; every other event (failures, reuse, requests from an unverified
// caller, the setup CLI) is recorded with actor 'system' and the admin as the subject.
const ADMIN_ACTIONS: ReadonlySet<AuthAuditAction> = new Set([
  'admin.login_succeeded',
  'admin.logout',
  'admin.password_reset_completed',
]);

// Only for admins that exist: an email that matches no account is personal data under the NDPR
// and is never stored. No secrets, hashes or emails go into before/after.
export function recordAuthEvent(
  manager: EntityManager,
  action: AuthAuditAction,
  adminId: string,
  context: RequestContext | null,
): Promise<unknown> {
  const byAdmin = ADMIN_ACTIONS.has(action);
  return manager.insert(AuditLog, {
    actorType: byAdmin ? 'admin' : 'system',
    actorId: byAdmin ? adminId : null,
    action,
    entityType: 'admin_user',
    entityId: adminId,
    ipAddress: context?.ipAddress ?? null,
    userAgent: context?.userAgent?.slice(0, 500) ?? null,
  });
}
