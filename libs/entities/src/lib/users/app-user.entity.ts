import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
  type Relation,
} from 'typeorm';

import { BaseEntity } from '../base.entity';
import { Country } from '../church/country.entity';
import { MediaAsset } from '../media/media-asset.entity';

export const APP_AUTH_PROVIDERS = ['email', 'google', 'apple'] as const;
export type AppAuthProvider = (typeof APP_AUTH_PROVIDERS)[number];

export const APP_USER_STATUSES = ['active', 'suspended'] as const;
export type AppUserStatus = (typeof APP_USER_STATUSES)[number];

@Entity()
@Unique(['authProvider', 'providerUid'])
@Check('CHK_app_user_email_lowercase', `"email" = lower("email")`)
@Check(
  'CHK_app_user_credentials',
  `("auth_provider" = 'email' AND "email" IS NOT NULL AND "password_hash" IS NOT NULL)
   OR ("auth_provider" <> 'email' AND "provider_uid" IS NOT NULL)`,
)
export class AppUser extends BaseEntity {
  @Column({ type: 'varchar', length: 254, unique: true, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  displayName!: string | null;

  @Column({ type: 'uuid', nullable: true })
  avatarMediaId!: string | null;

  @ManyToOne(() => MediaAsset, { nullable: true })
  @JoinColumn()
  avatarMedia!: Relation<MediaAsset> | null;

  @Column({ type: 'enum', enum: APP_AUTH_PROVIDERS, enumName: 'app_auth_provider' })
  authProvider!: AppAuthProvider;

  @Column({ type: 'varchar', length: 255, nullable: true })
  providerUid!: string | null;

  // Argon2id; only for the email provider.
  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  passwordHash!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  emailVerifiedAt!: Date | null;

  @Index()
  @Column({ type: 'enum', enum: APP_USER_STATUSES, enumName: 'app_user_status', default: 'active' })
  status!: AppUserStatus;

  // Cached sum of contribution_points_ledger (Phase 4).
  @Column({ type: 'int', default: 0 })
  points!: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  locale!: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  timezone!: string | null;

  @Column({ type: 'uuid', nullable: true })
  countryId!: string | null;

  @ManyToOne(() => Country, { nullable: true })
  @JoinColumn()
  country!: Relation<Country> | null;
}
