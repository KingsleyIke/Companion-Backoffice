import { Check, Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import type { Point } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { RECORD_STATUSES, type RecordStatus } from '../record-status';
import { Deanery } from './deanery.entity';
import { Diocese } from './diocese.entity';
import { Institution } from './institution.entity';
import { ReligiousInstitute } from './religious-institute.entity';

export const PARISH_TYPES = [
  'parish',
  'outstation',
  'chaplaincy',
  'cathedral',
  'shrine',
  'chapel',
] as const;
export type ParishType = (typeof PARISH_TYPES)[number];

// 'simple' rather than 'english': stemming mangles Igbo, Yoruba and Hausa names.
const SEARCH_VECTOR_EXPRESSION = `
  setweight(to_tsvector('simple', coalesce("name", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("patron_saint", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("city", '') || ' ' || coalesce("lga", '') || ' ' || coalesce("state", '')), 'C')`;

@Entity()
@Index(['dioceseId', 'status'])
@Check('CHK_parish_not_own_parent', `"parent_parish_id" <> "id"`)
@Check(
  'CHK_parish_outstation_has_parent',
  `"type" <> 'outstation' OR "parent_parish_id" IS NOT NULL`,
)
@Check(
  'CHK_parish_has_authority',
  `"diocese_id" IS NOT NULL OR "institution_id" IS NOT NULL OR "religious_institute_id" IS NOT NULL`,
)
@Check(
  'CHK_parish_chaplaincy_has_institution',
  `"type" <> 'chaplaincy' OR "institution_id" IS NOT NULL`,
)
@Check('CHK_parish_deanery_needs_diocese', `"deanery_id" IS NULL OR "diocese_id" IS NOT NULL`)
export class Parish extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  dioceseId!: string | null;

  @ManyToOne(() => Diocese, { nullable: true })
  @JoinColumn()
  diocese!: Relation<Diocese> | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  institutionId!: string | null;

  @ManyToOne(() => Institution, { nullable: true })
  @JoinColumn()
  institution!: Relation<Institution> | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  religiousInstituteId!: string | null;

  @ManyToOne(() => ReligiousInstitute, { nullable: true })
  @JoinColumn()
  religiousInstitute!: Relation<ReligiousInstitute> | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  deaneryId!: string | null;

  @ManyToOne(() => Deanery, { nullable: true })
  @JoinColumn()
  deanery!: Relation<Deanery> | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  parentParishId!: string | null;

  @ManyToOne(() => Parish, { nullable: true })
  @JoinColumn()
  parentParish!: Relation<Parish> | null;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 220, unique: true })
  slug!: string;

  @Column({ type: 'enum', enum: PARISH_TYPES, enumName: 'parish_type', default: 'parish' })
  type!: ParishType;

  @Column({ type: 'varchar', length: 160, nullable: true })
  patronSaint!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  addressLine!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  lga!: string | null;

  @Column({ type: 'varchar', length: 120 })
  state!: string;

  @Index({ spatial: true })
  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  location!: Point | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 254, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website!: string | null;

  @Column({ type: 'date', nullable: true })
  establishedDate!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: RECORD_STATUSES, enumName: 'record_status', default: 'draft' })
  status!: RecordStatus;

  @Index({ type: 'gin' })
  @Column({
    type: 'tsvector',
    generatedType: 'STORED',
    asExpression: SEARCH_VECTOR_EXPRESSION,
    select: false,
  })
  searchVector!: string;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt!: Date | null;
}
