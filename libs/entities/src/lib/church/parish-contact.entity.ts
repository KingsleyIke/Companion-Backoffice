import { Check, Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { Parish } from './parish.entity';

export const PARISH_CONTACT_GROUPS = ['clergy', 'pastoral_team'] as const;
export type ParishContactGroup = (typeof PARISH_CONTACT_GROUPS)[number];

export const PARISH_CONTACT_ROLES = [
  'parish_priest',
  'assistant_priest',
  'resident_priest',
  'chaplain',
  'rector',
  'catechist',
  'sacristan',
  'secretary',
  'other',
] as const;
export type ParishContactRole = (typeof PARISH_CONTACT_ROLES)[number];

@Entity()
@Index(['parishId', 'contactGroup', 'sortOrder'])
@Index('UQ_parish_contact_one_parish_priest', ['parishId'], {
  unique: true,
  where: `"role" = 'parish_priest' AND "deleted_at" IS NULL`,
})
@Check('CHK_parish_contact_other_role_titled', `"role" <> 'other' OR "role_title" IS NOT NULL`)
export class ParishContact extends BaseEntity {
  @Column({ type: 'uuid' })
  parishId!: string;

  @ManyToOne(() => Parish)
  @JoinColumn()
  parish!: Relation<Parish>;

  @Column({ type: 'enum', enum: PARISH_CONTACT_GROUPS, enumName: 'parish_contact_group' })
  contactGroup!: ParishContactGroup;

  @Column({ type: 'enum', enum: PARISH_CONTACT_ROLES, enumName: 'parish_contact_role' })
  role!: ParishContactRole;

  @Column({ type: 'varchar', length: 120, nullable: true })
  roleTitle!: string | null;

  @Column({ type: 'varchar', length: 160 })
  fullName!: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 254, nullable: true })
  email!: string | null;

  // NDPR: never exposed publicly unless explicitly ticked.
  @Column({ type: 'boolean', default: false })
  isPublic!: boolean;

  @Column({ type: 'smallint', default: 0 })
  sortOrder!: number;
}
