import { getMetadataArgsStorage } from 'typeorm';

import { AuditLog, BaseEntity, ContentVersion, ENTITIES } from './index';

// Doc 2 Part B allows exactly three tables outside BaseEntity: audit_log, content_version and
// parish_follow. Adding to this list needs written justification in the pull request.
const BASE_ENTITY_EXCEPTIONS: (new () => object)[] = [AuditLog, ContentVersion];

describe('ENTITIES', () => {
  const declared = getMetadataArgsStorage().tables.map((t) => t.target);

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
});
