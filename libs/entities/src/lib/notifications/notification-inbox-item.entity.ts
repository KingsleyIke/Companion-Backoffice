import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { Device } from '../users/device.entity';
import { NotificationTopic } from './notification-topic.entity';
import { ScheduledNotification } from './scheduled-notification.entity';

// Per-device inbox. Title and body are copied so history survives topic changes; deleted_at
// (from BaseEntity) is the user's per-item delete. Postgres scans the index backwards for
// newest-first, so no DESC index is needed.
@Entity()
@Index(['deviceId', 'deletedAt', 'createdAt'])
@Index(['deviceId', 'readAt'])
export class NotificationInboxItem extends BaseEntity {
  @Column({ type: 'uuid' })
  deviceId!: string;

  @ManyToOne(() => Device)
  @JoinColumn()
  device!: Relation<Device>;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  scheduledNotificationId!: string | null;

  @ManyToOne(() => ScheduledNotification, { nullable: true })
  @JoinColumn()
  scheduledNotification!: Relation<ScheduledNotification> | null;

  @Column({ type: 'uuid' })
  topicId!: string;

  @ManyToOne(() => NotificationTopic)
  @JoinColumn()
  topic!: Relation<NotificationTopic>;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  icon!: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  deepLink!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  readAt!: Date | null;
}
