import { getMetadataArgsStorage } from 'typeorm';

import { AuditLog } from '../audit-log.entity';
import { AdminSession } from './admin-session.entity';
import { AdminUser } from './admin-user.entity';

type EntityClass = new () => object;

describe('admin and audit entities', () => {
  const storage = getMetadataArgsStorage();
  const column = (target: EntityClass, propertyName: string) =>
    storage.filterColumns(target).find((c) => c.propertyName === propertyName);
  const checkNames = (target: EntityClass) => storage.filterChecks(target).map((c) => c.name);

  describe('AdminUser', () => {
    it('stores emails lowercase so case variants cannot be two admins', () => {
      expect(column(AdminUser, 'email')?.options.unique).toBe(true);
      expect(checkNames(AdminUser)).toContain('CHK_admin_user_email_lowercase');
    });

    it('never selects the password hash or MFA secret by default', () => {
      expect(column(AdminUser, 'passwordHash')?.options.select).toBe(false);
      expect(column(AdminUser, 'mfaSecretCiphertext')?.options.select).toBe(false);
    });

    it('requires a password once active and a scope for diocese admins', () => {
      expect(checkNames(AdminUser)).toEqual(
        expect.arrayContaining([
          'CHK_admin_user_active_has_password',
          'CHK_admin_user_diocese_admin_scoped',
        ]),
      );
    });
  });

  it('stores refresh tokens only as unique hashes grouped by rotation family', () => {
    expect(column(AdminSession, 'tokenHash')?.options.unique).toBe(true);
    expect(column(AdminSession, 'familyId')).toBeDefined();
  });

  it('gives the append-only audit log no update or soft-delete columns', () => {
    const properties = storage.filterColumns(AuditLog).map((c) => c.propertyName);
    expect(properties).toEqual(expect.arrayContaining(['createdAt', 'reason']));
    expect(properties).not.toContain('updatedAt');
    expect(properties).not.toContain('deletedAt');
    expect(properties).not.toContain('updatedBy');
  });
});
