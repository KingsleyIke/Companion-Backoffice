import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../base.entity';

export const NOTIFICATION_CATEGORIES = ['liturgical', 'devotional', 'parish', 'system'] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

// Notification types as data: the settings screen renders a control per supports_* flag.
@Entity()
@Index(['category', 'sortOrder'])
export class NotificationTopic extends BaseEntity {
  @Column({ type: 'varchar', length: 60, unique: true })
  key!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: NOTIFICATION_CATEGORIES, enumName: 'notification_category' })
  category!: NotificationCategory;

  @Column({ type: 'boolean', default: false })
  defaultEnabled!: boolean;

  @Column({ type: 'boolean', default: false })
  supportsTime!: boolean;

  @Column({ type: 'boolean', default: false })
  supportsLeadDays!: boolean;

  @Column({ type: 'boolean', default: false })
  supportsFrequency!: boolean;

  @Column({ type: 'boolean', default: false })
  supportsRankThreshold!: boolean;

  @Column({ type: 'smallint', default: 0 })
  sortOrder!: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  minAppVersion!: string | null;
}
