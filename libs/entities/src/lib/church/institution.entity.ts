import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { RECORD_STATUSES, type RecordStatus } from '../record-status';
import { Diocese } from './diocese.entity';
import { ReligiousInstitute } from './religious-institute.entity';

export const INSTITUTION_TYPES = [
  'seminary',
  'monastery',
  'convent',
  'religious_house',
  'school',
  'tertiary',
  'hospital',
  'military',
  'paramilitary',
  'correctional',
  'other',
] as const;
export type InstitutionType = (typeof INSTITUTION_TYPES)[number];

// No location: the map pin belongs to the institution's chaplaincy (a parish row).
@Entity()
export class Institution extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 220, unique: true })
  slug!: string;

  @Index()
  @Column({ type: 'enum', enum: INSTITUTION_TYPES, enumName: 'institution_type' })
  type!: InstitutionType;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  dioceseId!: string | null;

  @ManyToOne(() => Diocese, { nullable: true })
  @JoinColumn()
  diocese!: Relation<Diocese> | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  religiousInstituteId!: string | null;

  @ManyToOne(() => ReligiousInstitute, { nullable: true })
  @JoinColumn()
  religiousInstitute!: Relation<ReligiousInstitute> | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  affiliation!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', length: 120 })
  state!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website!: string | null;

  @Column({ type: 'varchar', length: 254, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: RECORD_STATUSES, enumName: 'record_status', default: 'draft' })
  status!: RecordStatus;
}
