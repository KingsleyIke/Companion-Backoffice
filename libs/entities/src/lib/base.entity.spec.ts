import { getMetadataArgsStorage } from 'typeorm';

import { BaseEntity } from './base.entity';

describe('BaseEntity', () => {
  const storage = getMetadataArgsStorage();
  const columns = storage.filterColumns(BaseEntity);
  const column = (propertyName: string) => columns.find((c) => c.propertyName === propertyName);

  it('declares every audit column the sync contract depends on', () => {
    expect(columns.map((c) => c.propertyName).sort()).toEqual(
      ['createdAt', 'createdBy', 'deletedAt', 'id', 'updatedAt', 'updatedBy'].sort(),
    );
  });

  it('defaults the primary key to a database-generated UUID v7', () => {
    const id = column('id');
    expect(id?.options.primary).toBe(true);
    expect(id?.options.type).toBe('uuid');
    expect((id?.options.default as () => string)()).toBe('uuid_v7()');
  });

  it('tracks updates and soft deletes as timestamptz', () => {
    expect(column('updatedAt')?.mode).toBe('updateDate');
    expect(column('deletedAt')?.mode).toBe('deleteDate');
    expect(column('updatedAt')?.options.type).toBe('timestamptz');
    expect(column('deletedAt')?.options.type).toBe('timestamptz');
  });
});
