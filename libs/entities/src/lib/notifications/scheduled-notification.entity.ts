import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { NotificationTopic } from './notification-topic.entity';

export const SCHEDULED_NOTIFICATION_STATUSES = [
  'scheduled',
  'processing',
  'sent',
  'failed',
  'cancelled',
] as const;
export type ScheduledNotificationStatus = (typeof SCHEDULED_NOTIFICATION_STATUSES)[number];

@Entity()
@Index(['status', 'scheduledFor'])
export class ScheduledNotification extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  topicId!: string;

  @ManyToOne(() => NotificationTopic)
  @JoinColumn()
  topic!: Relation<NotificationTopic>;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'jsonb', nullable: true })
  data!: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  targetCriteria!: Record<string, unknown> | null;

  @Column({ type: 'timestamptz' })
  scheduledFor!: Date;

  @Column({
    type: 'enum',
    enum: SCHEDULED_NOTIFICATION_STATUSES,
    enumName: 'scheduled_notification_status',
    default: 'scheduled',
  })
  status!: ScheduledNotificationStatus;

  @Column({ type: 'int', default: 0 })
  sentCount!: number;

  @Column({ type: 'int', default: 0 })
  failedCount!: number;
}
