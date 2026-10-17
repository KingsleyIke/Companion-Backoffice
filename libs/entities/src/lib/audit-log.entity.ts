import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

export const AUDIT_ACTOR_TYPES = ['admin', 'user', 'system'] as const;
export type AuditActorType = (typeof AUDIT_ACTOR_TYPES)[number];

// Documented BaseEntity exception: append-only, so no updated_at, deleted_at or updated_by.
// A trigger in the migration rejects UPDATE and DELETE.
@Entity()
@Index(['entityType', 'entityId', 'createdAt'])
@Index(['actorType', 'actorId', 'createdAt'])
export class AuditLog {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuid_v7()' })
  id!: string;

  @Column({ type: 'enum', enum: AUDIT_ACTOR_TYPES, enumName: 'audit_actor_type' })
  actorType!: AuditActorType;

  @Column({ type: 'uuid', nullable: true })
  actorId!: string | null;

  @Column({ type: 'varchar', length: 80 })
  action!: string;

  @Column({ type: 'varchar', length: 80 })
  entityType!: string;

  @Column({ type: 'uuid', nullable: true })
  entityId!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  before!: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  after!: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({ type: 'inet', nullable: true })
  ipAddress!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
