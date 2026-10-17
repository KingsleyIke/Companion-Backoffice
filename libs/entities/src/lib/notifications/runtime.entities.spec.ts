import { getMetadataArgsStorage } from 'typeorm';

import { AppSetting } from '../settings/app-setting.entity';
import { ContentVersion } from '../sync/content-version.entity';
import { NotificationInboxItem } from './notification-inbox-item.entity';
import { NotificationReceipt } from './notification-receipt.entity';
import { ScheduledNotification } from './scheduled-notification.entity';

type EntityClass = new () => object;

describe('sync and notification runtime entities', () => {
  const storage = getMetadataArgsStorage();
  const column = (target: EntityClass, propertyName: string) =>
    storage.filterColumns(target).find((c) => c.propertyName === propertyName);

  it('keys the sync manifest by resource with no id or soft delete', () => {
    expect(column(ContentVersion, 'resource')?.options.primary).toBe(true);
    expect(column(ContentVersion, 'id')).toBeUndefined();
    expect(column(ContentVersion, 'deletedAt')).toBeUndefined();
  });

  it('keeps settings private and editable by any admin unless marked otherwise', () => {
    expect(column(AppSetting, 'key')?.options.unique).toBe(true);
    expect(column(AppSetting, 'isPublic')?.options.default).toBe(false);
    expect(column(AppSetting, 'requiresSuperAdmin')?.options.default).toBe(false);
  });

  it('lets the planner find due notifications by status and time', () => {
    const index = storage
      .filterIndices(ScheduledNotification)
      .find((i) => Array.isArray(i.columns) && i.columns.join() === 'status,scheduledFor');
    expect(index).toBeDefined();
  });

  it('records one receipt per notification and device', () => {
    expect(storage.filterUniques(NotificationReceipt).map((u) => u.columns)).toContainEqual([
      'scheduledNotificationId',
      'deviceId',
    ]);
  });

  it('starts inbox items unread', () => {
    expect(column(NotificationInboxItem, 'readAt')?.options.nullable).toBe(true);
  });
});
