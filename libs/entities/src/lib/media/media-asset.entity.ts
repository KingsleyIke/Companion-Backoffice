import { Check, Column, Entity, Index, Unique } from 'typeorm';

import { BaseEntity } from '../base.entity';

export const MEDIA_KINDS = ['image', 'audio', 'document'] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const MEDIA_MODERATION_STATUSES = [
  'pending',
  'auto_passed',
  'auto_flagged',
  'approved',
  'rejected',
] as const;
export type MediaModerationStatus = (typeof MEDIA_MODERATION_STATUSES)[number];

@Entity()
@Unique(['bucket', 'storageKey'])
@Check('CHK_media_asset_size_non_negative', `"size_bytes" >= 0`)
export class MediaAsset extends BaseEntity {
  @Column({ type: 'varchar', length: 80 })
  bucket!: string;

  @Column({ type: 'varchar', length: 300 })
  storageKey!: string;

  @Column({ type: 'enum', enum: MEDIA_KINDS, enumName: 'media_kind' })
  kind!: MediaKind;

  @Column({ type: 'varchar', length: 60 })
  mimeType!: string;

  @Column({ type: 'int', nullable: true })
  width!: number | null;

  @Column({ type: 'int', nullable: true })
  height!: number | null;

  @Column({ type: 'int', nullable: true })
  durationMs!: number | null;

  @Column({ type: 'smallint', nullable: true })
  bitrateKbps!: number | null;

  // pg returns bigint as a string to avoid precision loss.
  @Column({ type: 'bigint' })
  sizeBytes!: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  blurhash!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  variants!: Record<string, string> | null;

  @Index()
  @Column({
    type: 'enum',
    enum: MEDIA_MODERATION_STATUSES,
    enumName: 'media_moderation_status',
    default: 'pending',
  })
  moderationStatus!: MediaModerationStatus;

  @Column({ type: 'jsonb', nullable: true })
  moderationLabels!: Record<string, unknown> | null;
}
