import { Check, Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { AdminUser } from '../admin/admin-user.entity';
import { BaseEntity } from '../base.entity';
import { Diocese } from '../church/diocese.entity';
import { Parish } from '../church/parish.entity';
import { AppUser } from './app-user.entity';

export const CONTRIBUTOR_STATUSES = ['pending', 'approved', 'rejected', 'revoked'] as const;
export type ContributorStatus = (typeof CONTRIBUTOR_STATUSES)[number];

@Entity()
@Check(
  'CHK_contributor_profile_rejection_reason',
  `"status" <> 'rejected' OR "rejection_reason" IS NOT NULL`,
)
export class ContributorProfile extends BaseEntity {
  @Column({ type: 'uuid', unique: true })
  userId!: string;

  @ManyToOne(() => AppUser)
  @JoinColumn()
  user!: Relation<AppUser>;

  @Index()
  @Column({
    type: 'enum',
    enum: CONTRIBUTOR_STATUSES,
    enumName: 'contributor_status',
    default: 'pending',
  })
  status!: ContributorStatus;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  appliedAt!: Date;

  @Column({ type: 'uuid', nullable: true })
  reviewedByAdminId!: string | null;

  @ManyToOne(() => AdminUser, { nullable: true })
  @JoinColumn()
  reviewedByAdmin!: Relation<AdminUser> | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt!: Date | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  dioceseId!: string | null;

  @ManyToOne(() => Diocese, { nullable: true })
  @JoinColumn()
  diocese!: Relation<Diocese> | null;

  @Column({ type: 'uuid', nullable: true })
  parishAffiliationId!: string | null;

  @ManyToOne(() => Parish, { nullable: true })
  @JoinColumn()
  parishAffiliation!: Relation<Parish> | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'text', nullable: true })
  verificationNotes!: string | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason!: string | null;
}
