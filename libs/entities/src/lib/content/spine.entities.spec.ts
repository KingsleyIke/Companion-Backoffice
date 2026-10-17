import { getMetadataArgsStorage } from 'typeorm';

import { AppModule } from '../navigation/app-module.entity';
import { DeviceNotificationSubscription } from '../notifications/device-notification-subscription.entity';
import { ContentCollection } from './content-collection.entity';
import { ContentItem } from './content-item.entity';
import { ContentItemTranslation } from './content-item-translation.entity';

type EntityClass = new () => object;

describe('extensibility spine entities', () => {
  const storage = getMetadataArgsStorage();
  const column = (target: EntityClass, propertyName: string) =>
    storage.filterColumns(target).find((c) => c.propertyName === propertyName);
  const uniqueColumns = (target: EntityClass) =>
    storage.filterUniques(target).map((u) => u.columns);

  it('ships new modules hidden and lets old clients skip them', () => {
    expect(column(AppModule, 'isEnabled')?.options.default).toBe(false);
    expect(column(AppModule, 'minAppVersion')).toBeDefined();
    expect(column(AppModule, 'placement')).toBeDefined();
  });

  it('keeps one subscription per device and topic', () => {
    expect(uniqueColumns(DeviceNotificationSubscription)).toContainEqual(['deviceId', 'topicId']);
  });

  it('derives a GIN-indexed search vector for collections in the database', () => {
    expect(column(ContentCollection, 'searchVector')?.options).toMatchObject({
      type: 'tsvector',
      generatedType: 'STORED',
    });
    const index = storage
      .filterIndices(ContentCollection)
      .find((i) => Array.isArray(i.columns) && i.columns.join() === 'searchVector');
    expect(index?.type).toBe('gin');
  });

  it('nests content items and bounds repeat counts and audio chapters', () => {
    const parent = storage
      .filterRelations(ContentItem)
      .find((r) => r.propertyName === 'parentItem');
    expect((parent?.type as () => unknown)()).toBe(ContentItem);
    expect(storage.filterChecks(ContentItem).map((c) => c.name)).toEqual(
      expect.arrayContaining([
        'CHK_content_item_repeat_count_positive',
        'CHK_content_item_audio_range',
      ]),
    );
  });

  it('holds one translation per item and language', () => {
    expect(uniqueColumns(ContentItemTranslation)).toContainEqual(['itemId', 'language']);
  });
});
