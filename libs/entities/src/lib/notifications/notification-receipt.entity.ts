import { Column, Entity, Index, JoinColumn, ManyToOne, Unique, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { Device } from '../users/device.entity';
import { ScheduledNotification } from './scheduled-notification.entity';

export const NOTIFICATION_RECEIPT_STATUSES = ['sent', 'failed', 'invalid_token'] as const;
export type NotificationReceiptStatus = (typeof NOTIFICATION_RECEIPT_STATUSES)[number];

// One receipt per notification and device, so a retried fan-out updates rather than duplicates.
// On invalid_token the sender sets device.is_active = false.
@Entity()
@Unique(['scheduledNotificationId', 'deviceId'])
export class NotificationReceipt extends BaseEntity {
  @Column({ type: 'uuid' })
  scheduledNotificationId!: string;

  @ManyToOne(() => ScheduledNotification)
  @JoinColumn()
  scheduledNotification!: Relation<ScheduledNotification>;

  @Index()
  @Column({ type: 'uuid' })
  deviceId!: string;

  @ManyToOne(() => Device)
  @JoinColumn()
  device!: Relation<Device>;

  @Column({
    type: 'enum',
    enum: NOTIFICATION_RECEIPT_STATUSES,
    enumName: 'notification_receipt_status',
  })
  status!: NotificationReceiptStatus;

  @Column({ type: 'varchar', length: 80, nullable: true })
  errorCode!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt!: Date | null;
}
