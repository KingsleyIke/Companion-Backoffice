import { getMetadataArgsStorage } from 'typeorm';

import { LiturgicalDay } from './liturgical-day.entity';
import { MassProper } from './mass-proper.entity';
import { READING_TYPES, Reading } from './reading.entity';
import { ReadingSet } from './reading-set.entity';
import { VerifiedContent } from './verified-content';

type EntityClass = abstract new () => object;

describe('liturgy entities', () => {
  const storage = getMetadataArgsStorage();
  const column = (target: EntityClass, propertyName: string) =>
    storage.filterColumns(target).find((c) => c.propertyName === propertyName);

  it('traces every liturgical day to an Ordo import and page', () => {
    expect(column(LiturgicalDay, 'importId')?.options.nullable).toBeFalsy();
    expect(column(LiturgicalDay, 'sourceReference')?.options.nullable).toBeFalsy();
  });

  it('leaves the rosary mystery set for editors, outside the Ordo import', () => {
    expect(column(LiturgicalDay, 'rosaryMysterySet')?.options.nullable).toBe(true);
  });

  it('puts readings, reflections and Mass propers behind the same verification gate', () => {
    for (const entity of [Reading, ReadingSet, MassProper]) {
      expect(entity.prototype).toBeInstanceOf(VerifiedContent);
    }
    expect(column(VerifiedContent, 'verificationStatus')?.options.default).toBe('draft');
    expect(storage.filterChecks(VerifiedContent).map((c) => c.name)).toEqual(
      expect.arrayContaining([
        'CHK_verification_proofread_recorded',
        'CHK_verification_verified_recorded',
        'CHK_verification_override_has_reason',
      ]),
    );
  });

  it('requires a licensed source and page for every reading', () => {
    expect(column(Reading, 'translationId')?.options.nullable).toBeFalsy();
    expect(column(Reading, 'sourceReference')?.options.nullable).toBeFalsy();
    expect(column(MassProper, 'translationId')?.options.nullable).toBeFalsy();
  });

  it('can type readings beyond the second, as at the Easter Vigil', () => {
    expect(READING_TYPES).toContain('additional');
  });
});
