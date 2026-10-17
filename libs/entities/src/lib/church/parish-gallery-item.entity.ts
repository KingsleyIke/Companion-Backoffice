import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { MediaAsset } from '../media/media-asset.entity';
import { RECORD_STATUSES, type RecordStatus } from '../record-status';
import { ParishGalleryAlbum } from './parish-gallery-album.entity';
import { Parish } from './parish.entity';

// album_id IS NULL marks a photo of the parish building rather than an event.
@Entity()
@Index(['parishId', 'albumId', 'sortOrder'])
export class ParishGalleryItem extends BaseEntity {
  @Column({ type: 'uuid' })
  parishId!: string;

  @ManyToOne(() => Parish)
  @JoinColumn()
  parish!: Relation<Parish>;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  albumId!: string | null;

  @ManyToOne(() => ParishGalleryAlbum, { nullable: true })
  @JoinColumn()
  album!: Relation<ParishGalleryAlbum> | null;

  @Index()
  @Column({ type: 'uuid' })
  mediaAssetId!: string;

  @ManyToOne(() => MediaAsset)
  @JoinColumn()
  mediaAsset!: Relation<MediaAsset>;

  @Column({ type: 'varchar', length: 300, nullable: true })
  caption!: string | null;

  @Column({ type: 'date', nullable: true })
  eventDate!: string | null;

  @Column({ type: 'smallint', default: 0 })
  sortOrder!: number;

  @Column({ type: 'enum', enum: RECORD_STATUSES, enumName: 'record_status', default: 'draft' })
  status!: RecordStatus;
}
