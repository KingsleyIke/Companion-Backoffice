import { getMetadataArgsStorage } from 'typeorm';

import { Diocese } from '../church/diocese.entity';
import { ParishGalleryItem } from '../church/parish-gallery-item.entity';
import { Parish } from '../church/parish.entity';
import { MediaAsset } from './media-asset.entity';

type EntityClass = new () => object;

describe('media entities', () => {
  const storage = getMetadataArgsStorage();
  const column = (target: EntityClass, propertyName: string) =>
    storage.filterColumns(target).find((c) => c.propertyName === propertyName);
  const relationTarget = (target: EntityClass, propertyName: string) =>
    (
      storage.filterRelations(target).find((r) => r.propertyName === propertyName)
        ?.type as () => unknown
    )();

  it('registers each R2 object once per bucket', () => {
    const unique = storage.filterUniques(MediaAsset).map((u) => u.columns);
    expect(unique).toContainEqual(['bucket', 'storageKey']);
  });

  it('holds new uploads for moderation by default', () => {
    expect(column(MediaAsset, 'moderationStatus')?.options.default).toBe('pending');
  });

  it('treats a gallery item without an album as a building photo', () => {
    expect(column(ParishGalleryItem, 'albumId')?.options.nullable).toBe(true);
    expect(relationTarget(ParishGalleryItem, 'mediaAsset')).toBe(MediaAsset);
  });

  it('links diocese logos and parish covers to media assets', () => {
    expect(relationTarget(Diocese, 'logoMedia')).toBe(MediaAsset);
    expect(relationTarget(Parish, 'coverMedia')).toBe(MediaAsset);
  });
});
