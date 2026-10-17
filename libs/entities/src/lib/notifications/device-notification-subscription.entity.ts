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
import { CELEBRATION_RANK_COLUMN, type CelebrationRank } from '../liturgy/liturgical-enums';
import { Device } from '../users/device.entity';
import { NotificationTopic } from './notification-topic.entity';

export const NOTIFICATION_FREQUENCIES = ['daily', 'weekly', 'custom'] as const;
export type NotificationFrequency = (typeof NOTIFICATION_FREQUENCIES)[number];

@Entity()
@Unique(['deviceId', 'topicId'])
@Check('CHK_device_notification_subscription_lead_days', `"lead_days" >= 0`)
export class DeviceNotificationSubscription extends BaseEntity {
  @Column({ type: 'uuid' })
  deviceId!: string;

  @ManyToOne(() => Device)
  @JoinColumn()
  device!: Relation<Device>;

  @Index()
  @Column({ type: 'uuid' })
  topicId!: string;

  @ManyToOne(() => NotificationTopic)
  @JoinColumn()
  topic!: Relation<NotificationTopic>;

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;

  @Column({ type: 'time', nullable: true })
  deliveryTime!: string | null;

  @Column({ type: 'smallint', nullable: true })
  leadDays!: number | null;

  @Column({
    type: 'enum',
    enum: NOTIFICATION_FREQUENCIES,
    enumName: 'notification_frequency',
    nullable: true,
  })
  frequency!: NotificationFrequency | null;

  @Column({ ...CELEBRATION_RANK_COLUMN, nullable: true })
  rankThreshold!: CelebrationRank | null;

  // 0 = Sunday … 6 = Saturday.
  @Column({ type: 'jsonb', nullable: true })
  daysOfWeek!: number[] | null;

  @Column({ type: 'boolean', default: true })
  soundEnabled!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  settings!: Record<string, unknown> | null;
}
