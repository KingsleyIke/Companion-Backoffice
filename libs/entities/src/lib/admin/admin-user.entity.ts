import { Check, Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { Diocese } from '../church/diocese.entity';

export const ADMIN_ROLES = ['super_admin', 'admin', 'diocese_admin', 'content_editor'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_STATUSES = ['pending', 'active', 'suspended'] as const;
export type AdminStatus = (typeof ADMIN_STATUSES)[number];

@Entity()
@Index('UQ_admin_user_active_email', ['email'], { unique: true, where: '"deleted_at" IS NULL' })
@Check('CHK_admin_user_email_lowercase', `"email" = lower("email")`)
@Check('CHK_admin_user_active_has_password', `"status" <> 'active' OR "password_hash" IS NOT NULL`)
@Check(
  'CHK_admin_user_diocese_admin_scoped',
  `"role" <> 'diocese_admin' OR "diocese_scope_id" IS NOT NULL`,
)
export class AdminUser extends BaseEntity {
  @Column({ type: 'varchar', length: 254 })
  email!: string;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  // Argon2id. Null until an invited admin sets a password.
  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  passwordHash!: string | null;

  @Column({ type: 'enum', enum: ADMIN_ROLES, enumName: 'admin_role' })
  role!: AdminRole;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  dioceseScopeId!: string | null;

  @ManyToOne(() => Diocese, { nullable: true })
  @JoinColumn()
  dioceseScope!: Relation<Diocese> | null;

  @Column({ type: 'enum', enum: ADMIN_STATUSES, enumName: 'admin_status', default: 'pending' })
  status!: AdminStatus;

  // Encrypted at the application layer; the plaintext TOTP secret never reaches the database.
  @Column({ type: 'text', nullable: true, select: false })
  mfaSecretCiphertext!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  invitedById!: string | null;

  @ManyToOne(() => AdminUser, { nullable: true })
  @JoinColumn()
  invitedBy!: Relation<AdminUser> | null;
}
