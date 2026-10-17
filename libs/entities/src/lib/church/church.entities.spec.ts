import { getMetadataArgsStorage } from 'typeorm';

import { ENTITIES } from '../../index';
import { BaseEntity } from '../base.entity';
import { Diocese } from './diocese.entity';
import { Institution } from './institution.entity';
import { MassSchedule } from './mass-schedule.entity';
import { ParishContact } from './parish-contact.entity';
import { Parish } from './parish.entity';

type EntityClass = new () => BaseEntity;

describe('church hierarchy entities', () => {
  const storage = getMetadataArgsStorage();
  const column = (target: EntityClass, propertyName: string) =>
    storage.filterColumns(target).find((c) => c.propertyName === propertyName);
  const indexOn = (target: EntityClass, propertyName: string) =>
    storage
      .filterIndices(target)
      .find((i) => Array.isArray(i.columns) && i.columns.join() === propertyName);
  const checkNames = (target: EntityClass) => storage.filterChecks(target).map((c) => c.name);

  it('registers every declared entity and nothing else', () => {
    const declared = storage.tables.map((t) => t.target);
    expect(ENTITIES).toHaveLength(declared.length);
    expect(ENTITIES).toEqual(expect.arrayContaining(declared));
  });

  it('builds every table on BaseEntity so it can delta-sync', () => {
    for (const { target } of storage.tables) {
      expect(typeof target === 'function' && target.prototype).toBeInstanceOf(BaseEntity);
    }
  });

  describe('Parish', () => {
    it('stores location as a GIST-indexed geography point in WGS 84', () => {
      expect(column(Parish, 'location')?.options).toMatchObject({
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
      });
      expect(indexOn(Parish, 'location')?.spatial).toBe(true);
    });

    it('derives a GIN-indexed search vector in the database', () => {
      expect(column(Parish, 'searchVector')?.options).toMatchObject({
        type: 'tsvector',
        generatedType: 'STORED',
        select: false,
      });
      expect(column(Parish, 'searchVector')?.options.asExpression).toContain("'simple'");
      expect(indexOn(Parish, 'searchVector')?.type).toBe('gin');
    });

    it('allows a chaplaincy with no diocese, but never a row answerable to nobody', () => {
      expect(column(Parish, 'dioceseId')?.options.nullable).toBe(true);
      expect(column(Parish, 'institutionId')?.options.nullable).toBe(true);
      expect(column(Parish, 'religiousInstituteId')?.options.nullable).toBe(true);
      expect(checkNames(Parish)).toEqual(
        expect.arrayContaining([
          'CHK_parish_has_authority',
          'CHK_parish_chaplaincy_has_institution',
          'CHK_parish_deanery_needs_diocese',
          'CHK_parish_outstation_has_parent',
          'CHK_parish_not_own_parent',
        ]),
      );
    });

    it('models outstations as a self-reference', () => {
      const relation = storage
        .filterRelations(Parish)
        .find((r) => r.propertyName === 'parentParish');
      expect((relation?.type as () => unknown)()).toBe(Parish);
    });
  });

  it('lets a diocese sit outside any province', () => {
    expect(column(Diocese, 'provinceId')?.options.nullable).toBe(true);
    expect(column(Diocese, 'type')?.options.enum).toContain('military_ordinariate');
  });

  it('gives institutions no location of their own', () => {
    expect(column(Institution, 'location')).toBeUndefined();
  });

  it('keeps Mass schedules either weekly or dated, Sunday = 0', () => {
    expect(checkNames(MassSchedule)).toEqual(
      expect.arrayContaining([
        'CHK_mass_schedule_day_of_week_range',
        'CHK_mass_schedule_weekly_xor_dated',
      ]),
    );
  });

  describe('ParishContact', () => {
    it('hides contacts unless explicitly made public (NDPR)', () => {
      expect(column(ParishContact, 'isPublic')?.options.default).toBe(false);
    });

    it('allows one active parish priest per parish', () => {
      const index = storage
        .filterIndices(ParishContact)
        .find((i) => i.name === 'UQ_parish_contact_one_parish_priest');
      expect(index?.unique).toBe(true);
      expect(index?.where).toContain('"deleted_at" IS NULL');
    });

    it('requires a title when the role is "other"', () => {
      expect(checkNames(ParishContact)).toContain('CHK_parish_contact_other_role_titled');
    });
  });
});
