import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../base.entity';

export const APP_SETTING_VALUE_TYPES = ['string', 'int', 'bool', 'json'] as const;
export type AppSettingValueType = (typeof APP_SETTING_VALUE_TYPES)[number];

// Extends BaseEntity with a unique key rather than using key as the primary key, so it is not a
// fourth BaseEntity exception. BaseEntity.updatedBy records the admin who last changed it.
@Entity()
export class AppSetting extends BaseEntity {
  @Column({ type: 'varchar', length: 80, unique: true })
  key!: string;

  @Column({ type: 'text', nullable: true })
  value!: string | null;

  @Column({ type: 'enum', enum: APP_SETTING_VALUE_TYPES, enumName: 'app_setting_value_type' })
  valueType!: AppSettingValueType;

  @Column({ type: 'varchar', length: 300, nullable: true })
  description!: string | null;

  // Only public settings are served to the app by /bootstrap.
  @Column({ type: 'boolean', default: false })
  isPublic!: boolean;

  // e.g. auto_publish_readings: only a super admin may change it.
  @Column({ type: 'boolean', default: false })
  requiresSuperAdmin!: boolean;
}
