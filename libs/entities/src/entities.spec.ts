import { getMetadataArgsStorage } from 'typeorm';

import {
  AdminUser,
  AppUser,
  AuditLog,
  BaseEntity,
  ContentVersion,
  ENTITIES,
  MassProper,
  Reading,
  ReadingSet,
  VerifiedContent,
} from './index';

// Contracts the database cannot show. Constraint behaviour is covered against a real database by
// libs/common/src/database/schema-constraints.db-spec.ts.

// Doc 2 Part B allows exactly three tables outside BaseEntity: audit_log, content_version and
// parish_follow. Adding to this list needs written justification in the pull request.
const BASE_ENTITY_EXCEPTIONS: (new () => object)[] = [AuditLog, ContentVersion];

describe('ENTITIES', () => {
  const storage = getMetadataArgsStorage();
  const declared = storage.tables.map((t) => t.target);
  const selectOption = (target: new () => object, propertyName: string) =>
    storage.filterColumns(target).find((c) => c.propertyName === propertyName)?.options.select;

  it('registers every declared entity and nothing else', () => {
    expect(ENTITIES).toHaveLength(declared.length);
    expect(ENTITIES).toEqual(expect.arrayContaining(declared));
  });

  it('builds every table on BaseEntity except the documented exceptions', () => {
    const outsideBaseEntity = declared.filter(
      (target) => typeof target === 'function' && !(target.prototype instanceof BaseEntity),
    );
    expect(outsideBaseEntity).toEqual(BASE_ENTITY_EXCEPTIONS);
  });

  it('never selects password hashes or MFA secrets by default', () => {
    expect(selectOption(AdminUser, 'passwordHash')).toBe(false);
    expect(selectOption(AdminUser, 'mfaSecretCiphertext')).toBe(false);
    expect(selectOption(AppUser, 'passwordHash')).toBe(false);
  });

  it('puts readings, reading sets and Mass propers behind the same verification gate', () => {
    for (const entity of [Reading, ReadingSet, MassProper]) {
      expect(entity.prototype).toBeInstanceOf(VerifiedContent);
    }
  });
});
