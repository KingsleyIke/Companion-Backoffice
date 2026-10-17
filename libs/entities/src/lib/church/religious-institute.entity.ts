import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { ContactDetails } from './contact-details';
import { RECORD_STATUS_COLUMN, type RecordStatus } from '../record-status';

export const RELIGIOUS_INSTITUTE_TYPES = [
  'religious_order',
  'religious_congregation',
  'society_of_apostolic_life',
  'secular_institute',
] as const;
export type ReligiousInstituteType = (typeof RELIGIOUS_INSTITUTE_TYPES)[number];

export const RELIGIOUS_INSTITUTE_MEMBERSHIPS = ['men', 'women', 'mixed'] as const;
export type ReligiousInstituteMembership = (typeof RELIGIOUS_INSTITUTE_MEMBERSHIPS)[number];

@Entity()
export class ReligiousInstitute extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 220, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  abbreviation!: string | null;

  @Column({
    type: 'enum',
    enum: RELIGIOUS_INSTITUTE_TYPES,
    enumName: 'religious_institute_type',
  })
  instituteType!: ReligiousInstituteType;

  @Column({
    type: 'enum',
    enum: RELIGIOUS_INSTITUTE_MEMBERSHIPS,
    enumName: 'religious_institute_membership',
  })
  membership!: ReligiousInstituteMembership;

  @Column(() => ContactDetails, { prefix: false })
  contact!: ContactDetails;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column(RECORD_STATUS_COLUMN)
  status!: RecordStatus;
}
