import type { DataSourceOptions } from 'typeorm';

import { Country } from './lib/church/country.entity';
import { Deanery } from './lib/church/deanery.entity';
import { Diocese } from './lib/church/diocese.entity';
import { EcclesiasticalProvince } from './lib/church/ecclesiastical-province.entity';
import { Institution } from './lib/church/institution.entity';
import { MassSchedule } from './lib/church/mass-schedule.entity';
import { ParishActivity } from './lib/church/parish-activity.entity';
import { ParishContact } from './lib/church/parish-contact.entity';
import { Parish } from './lib/church/parish.entity';
import { ReligiousInstitute } from './lib/church/religious-institute.entity';

export * from './lib/base.entity';
export * from './lib/church/country.entity';
export * from './lib/church/deanery.entity';
export * from './lib/church/diocese.entity';
export * from './lib/church/ecclesiastical-province.entity';
export * from './lib/church/institution.entity';
export * from './lib/church/mass-schedule.entity';
export * from './lib/church/parish-activity.entity';
export * from './lib/church/parish-contact.entity';
export * from './lib/church/parish.entity';
export * from './lib/church/religious-institute.entity';
export * from './lib/record-status';

export const ENTITIES: NonNullable<DataSourceOptions['entities']> = [
  Country,
  EcclesiasticalProvince,
  Diocese,
  Deanery,
  ReligiousInstitute,
  Institution,
  Parish,
  MassSchedule,
  ParishContact,
  ParishActivity,
];
