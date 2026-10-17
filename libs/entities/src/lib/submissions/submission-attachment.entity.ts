import { Column, Entity, Index, JoinColumn, ManyToOne, Unique, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { MediaAsset } from '../media/media-asset.entity';
import { Submission } from './submission.entity';

@Entity()
@Unique(['submissionId', 'mediaAssetId'])
export class SubmissionAttachment extends BaseEntity {
  @Column({ type: 'uuid' })
  submissionId!: string;

  @ManyToOne(() => Submission)
  @JoinColumn()
  submission!: Relation<Submission>;

  @Index()
  @Column({ type: 'uuid' })
  mediaAssetId!: string;

  @ManyToOne(() => MediaAsset)
  @JoinColumn()
  mediaAsset!: Relation<MediaAsset>;

  @Column({ type: 'smallint', default: 0 })
  sortOrder!: number;
}
