import { Check, Column, Entity, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { MediaAsset } from '../media/media-asset.entity';
import { RECORD_STATUS_COLUMN, type RecordStatus } from '../record-status';

@Entity()
@Check('CHK_saint_feast_date_complete', `("feast_month" IS NULL) = ("feast_day" IS NULL)`)
@Check(
  'CHK_saint_feast_date_range',
  `"feast_month" BETWEEN 1 AND 12 AND "feast_day" BETWEEN 1 AND 31`,
)
export class Saint extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'smallint', nullable: true })
  feastMonth!: number | null;

  @Column({ type: 'smallint', nullable: true })
  feastDay!: number | null;

  @Column({ type: 'text', nullable: true })
  biography!: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  patronage!: string | null;

  @Column({ type: 'smallint', nullable: true })
  birthYear!: number | null;

  @Column({ type: 'smallint', nullable: true })
  deathYear!: number | null;

  @Column({ type: 'date', nullable: true })
  canonizationDate!: string | null;

  @Column({ type: 'uuid', nullable: true })
  imageMediaId!: string | null;

  @ManyToOne(() => MediaAsset, { nullable: true })
  @JoinColumn()
  imageMedia!: Relation<MediaAsset> | null;

  @Column(RECORD_STATUS_COLUMN)
  status!: RecordStatus;
}
