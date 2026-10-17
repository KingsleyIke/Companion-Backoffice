import { Check, Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { MediaAsset } from '../media/media-asset.entity';
import { ContentCollection } from './content-collection.entity';

export const CONTENT_ITEM_TYPES = [
  'station',
  'mystery',
  'decade',
  'prayer',
  'reflection',
  'scripture',
  'antiphon',
  'response',
  'heading',
] as const;
export type ContentItemType = (typeof CONTENT_ITEM_TYPES)[number];

// Ordered and nestable: mystery → decade → prayer. A litany row's title is the invocation and
// response_text the response.
@Entity()
@Index(['collectionId', 'parentItemId', 'sequence'])
@Index(['collectionId', 'itemType'])
@Check('CHK_content_item_repeat_count_positive', `"repeat_count" >= 1`)
@Check(
  'CHK_content_item_audio_range',
  `"audio_start_ms" IS NULL OR "audio_end_ms" IS NULL OR "audio_end_ms" > "audio_start_ms"`,
)
export class ContentItem extends BaseEntity {
  @Column({ type: 'uuid' })
  collectionId!: string;

  @ManyToOne(() => ContentCollection)
  @JoinColumn()
  collection!: Relation<ContentCollection>;

  @Column({ type: 'uuid', nullable: true })
  parentItemId!: string | null;

  @ManyToOne(() => ContentItem, { nullable: true })
  @JoinColumn()
  parentItem!: Relation<ContentItem> | null;

  @Column({ type: 'smallint' })
  sequence!: number;

  @Column({ type: 'enum', enum: CONTENT_ITEM_TYPES, enumName: 'content_item_type' })
  itemType!: ContentItemType;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  bodyHtml!: string | null;

  @Column({ type: 'text', nullable: true })
  reflectionHtml!: string | null;

  @Column({ type: 'text', nullable: true })
  prayerHtml!: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  responseText!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  scriptureCitation!: string | null;

  @Column({ type: 'smallint', default: 1 })
  repeatCount!: number;

  @Column({ type: 'uuid', nullable: true })
  imageMediaId!: string | null;

  @ManyToOne(() => MediaAsset, { nullable: true })
  @JoinColumn()
  imageMedia!: Relation<MediaAsset> | null;

  @Column({ type: 'uuid', nullable: true })
  audioMediaId!: string | null;

  @ManyToOne(() => MediaAsset, { nullable: true })
  @JoinColumn()
  audioMedia!: Relation<MediaAsset> | null;

  // Chapter offsets into the collection's recording.
  @Column({ type: 'int', nullable: true })
  audioStartMs!: number | null;

  @Column({ type: 'int', nullable: true })
  audioEndMs!: number | null;

  // Type-specific overflow.
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;
}
