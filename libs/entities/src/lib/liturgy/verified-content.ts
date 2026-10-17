import { Check, Column, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { AdminUser } from '../admin/admin-user.entity';
import { BaseEntity } from '../base.entity';

export const VERIFICATION_STATUSES = ['draft', 'ocr_raw', 'proofread', 'verified'] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

// Text users read as authoritative: readings, Mass propers, and the reflection and personal
// devotion on a reading set. Only `verified` rows pass the publish gate unless a super admin
// overrides, which requires a reason. The rule that the verifier differs from the proofreader
// for Sundays and solemnities depends on the day's rank and lives in the verification service.
@Check(
  'CHK_verification_proofread_recorded',
  `"verification_status" NOT IN ('proofread', 'verified')
   OR ("proofread_by_admin_id" IS NOT NULL AND "proofread_at" IS NOT NULL)`,
)
@Check(
  'CHK_verification_verified_recorded',
  `"verification_status" <> 'verified'
   OR ("verified_by_admin_id" IS NOT NULL AND "verified_at" IS NOT NULL)`,
)
@Check(
  'CHK_verification_override_has_reason',
  `"published_by_admin_id" IS NULL
   OR ("published_at" IS NOT NULL AND "override_reason" IS NOT NULL)`,
)
export abstract class VerifiedContent extends BaseEntity {
  @Index()
  @Column({
    type: 'enum',
    enum: VERIFICATION_STATUSES,
    enumName: 'verification_status',
    default: 'draft',
  })
  verificationStatus!: VerificationStatus;

  @Column({ type: 'uuid', nullable: true })
  proofreadByAdminId!: string | null;

  @ManyToOne(() => AdminUser, { nullable: true })
  @JoinColumn()
  proofreadByAdmin!: Relation<AdminUser> | null;

  @Column({ type: 'timestamptz', nullable: true })
  proofreadAt!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  verifiedByAdminId!: string | null;

  @ManyToOne(() => AdminUser, { nullable: true })
  @JoinColumn()
  verifiedByAdmin!: Relation<AdminUser> | null;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  publishedByAdminId!: string | null;

  @ManyToOne(() => AdminUser, { nullable: true })
  @JoinColumn()
  publishedByAdmin!: Relation<AdminUser> | null;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  overrideReason!: string | null;
}
