import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { Country } from '../church/country.entity';
import { AppUser } from './app-user.entity';

export const DEVICE_PLATFORMS = ['android', 'ios'] as const;
export type DevicePlatform = (typeof DEVICE_PLATFORMS)[number];

@Entity()
@Index(['isActive', 'timezone'])
export class Device extends BaseEntity {
  @Index()
  @Column({ type: 'uuid', nullable: true })
  userId!: string | null;

  @ManyToOne(() => AppUser, { nullable: true })
  @JoinColumn()
  user!: Relation<AppUser> | null;

  @Column({ type: 'varchar', length: 512, unique: true })
  fcmToken!: string;

  @Column({ type: 'enum', enum: DEVICE_PLATFORMS, enumName: 'device_platform' })
  platform!: DevicePlatform;

  @Column({ type: 'varchar', length: 20 })
  appVersion!: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  locale!: string | null;

  @Column({ type: 'varchar', length: 40 })
  timezone!: string;

  @Column({ type: 'uuid', nullable: true })
  countryId!: string | null;

  @ManyToOne(() => Country, { nullable: true })
  @JoinColumn()
  country!: Relation<Country> | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastSeenAt!: Date | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}
