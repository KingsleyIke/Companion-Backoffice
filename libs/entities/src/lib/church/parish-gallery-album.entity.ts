import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { MediaAsset } from '../media/media-asset.entity';
import { RECORD_STATUS_COLUMN, type RecordStatus } from '../record-status';
import { Parish } from './parish.entity';

@Entity()
@Index(['parishId', 'sortOrder'])
export class ParishGalleryAlbum extends BaseEntity {
  @Column({ type: 'uuid' })
  parishId!: string;

  @ManyToOne(() => Parish)
  @JoinColumn()
  parish!: Relation<Parish>;

  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ type: 'date', nullable: true })
  eventDate!: string | null;

  @Column({ type: 'uuid', nullable: true })
  coverMediaId!: string | null;

  @ManyToOne(() => MediaAsset, { nullable: true })
  @JoinColumn()
  coverMedia!: Relation<MediaAsset> | null;

  @Column({ type: 'smallint', default: 0 })
  sortOrder!: number;

  @Column(RECORD_STATUS_COLUMN)
  status!: RecordStatus;
}
