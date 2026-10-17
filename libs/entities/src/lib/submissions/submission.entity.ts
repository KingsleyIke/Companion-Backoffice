import { Check, Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { AdminUser } from '../admin/admin-user.entity';
import { BaseEntity } from '../base.entity';
import { Diocese } from '../church/diocese.entity';
import { AppUser } from '../users/app-user.entity';
import { Device } from '../users/device.entity';

export const SUBMISSION_ENTITY_TYPES = [
  'parish',
  'parish_info',
  'mass_schedule',
  'gallery',
  'announcement',
] as const;
export type SubmissionEntityType = (typeof SUBMISSION_ENTITY_TYPES)[number];

export const SUBMISSION_OPERATIONS = ['create', 'update', 'delete'] as const;
export type SubmissionOperation = (typeof SUBMISSION_OPERATIONS)[number];

export const SUBMISSION_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'withdrawn',
  'superseded',
] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

// Never applied directly: payload is stored, diffed, and applied only on approval.
// Anonymous "suggest my parish" submissions carry a device instead of a user.
@Entity()
@Index(['status', 'dioceseId', 'createdAt'])
@Check(
  'CHK_submission_has_submitter',
  `"submitter_user_id" IS NOT NULL OR "submitter_device_id" IS NOT NULL`,
)
@Check(
  'CHK_submission_target_for_change',
  `"operation" = 'create' OR "target_entity_id" IS NOT NULL`,
)
@Check(
  'CHK_submission_rejection_reason',
  `"status" <> 'rejected' OR "rejection_reason" IS NOT NULL`,
)
export class Submission extends BaseEntity {
  @Index()
  @Column({ type: 'uuid', nullable: true })
  submitterUserId!: string | null;

  @ManyToOne(() => AppUser, { nullable: true })
  @JoinColumn()
  submitterUser!: Relation<AppUser> | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  submitterDeviceId!: string | null;

  @ManyToOne(() => Device, { nullable: true })
  @JoinColumn()
  submitterDevice!: Relation<Device> | null;

  // PII (NDPR): never logged, never exposed publicly.
  @Column({ type: 'varchar', length: 160, nullable: true })
  contactName!: string | null;

  @Column({ type: 'varchar', length: 254, nullable: true })
  contactEmail!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  contactPhone!: string | null;

  @Column({ type: 'enum', enum: SUBMISSION_ENTITY_TYPES, enumName: 'submission_entity_type' })
  entityType!: SubmissionEntityType;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  targetEntityId!: string | null;

  @Column({ type: 'enum', enum: SUBMISSION_OPERATIONS, enumName: 'submission_operation' })
  operation!: SubmissionOperation;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  diff!: Record<string, { before: unknown; after: unknown }> | null;

  @Column({
    type: 'enum',
    enum: SUBMISSION_STATUSES,
    enumName: 'submission_status',
    default: 'pending',
  })
  status!: SubmissionStatus;

  @Column({ type: 'uuid', nullable: true })
  reviewedByAdminId!: string | null;

  @ManyToOne(() => AdminUser, { nullable: true })
  @JoinColumn()
  reviewedByAdmin!: Relation<AdminUser> | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason!: string | null;

  @Column({ type: 'int', nullable: true })
  appliedEntityVersion!: number | null;

  // Denormalised for diocese-scoped moderation; null for chaplaincies outside a diocese.
  @Column({ type: 'uuid', nullable: true })
  dioceseId!: string | null;

  @ManyToOne(() => Diocese, { nullable: true })
  @JoinColumn()
  diocese!: Relation<Diocese> | null;
}
