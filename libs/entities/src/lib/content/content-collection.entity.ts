import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { Country } from '../church/country.entity';
import { Diocese } from '../church/diocese.entity';
import { LITURGICAL_SEASON_COLUMN, type LiturgicalSeason } from '../liturgy/liturgical-enums';
import { MediaAsset } from '../media/media-asset.entity';
import { RECORD_STATUS_COLUMN, type RecordStatus } from '../record-status';
import { ContentCategory } from './content-category.entity';

export const CONTENT_COLLECTION_TYPES = [
  'prayer',
  'prayer_set',
  'rosary',
  'stations',
  'chaplet',
  'novena',
  'litany',
  'devotion',
  'article',
] as const;
export type ContentCollectionType = (typeof CONTENT_COLLECTION_TYPES)[number];

const SEARCH_VECTOR_EXPRESSION = `
  setweight(to_tsvector('simple', coalesce("title", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("subtitle", '')), 'B')`;

// Every devotion is a collection of ordered, nestable content_item rows: a new devotion is data,
// not a migration.
@Entity()
@Index(['categoryId', 'sortOrder'])
@Index(['type', 'status'])
export class ContentCollection extends BaseEntity {
  @Column({ type: 'uuid' })
  categoryId!: string;

  @ManyToOne(() => ContentCategory)
  @JoinColumn()
  category!: Relation<ContentCategory>;

  @Column({ type: 'enum', enum: CONTENT_COLLECTION_TYPES, enumName: 'content_collection_type' })
  type!: ContentCollectionType;

  @Column({ type: 'varchar', length: 140, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  subtitle!: string | null;

  @Column({ type: 'text', nullable: true })
  descriptionHtml!: string | null;

  // true renders a stepper; false a single document.
  @Column({ type: 'boolean', default: false })
  isSequential!: boolean;

  @Column({ type: 'boolean', default: false })
  supportsAudio!: boolean;

  // Full-collection recording for chaptered playback.
  @Column({ type: 'uuid', nullable: true })
  audioMediaId!: string | null;

  @ManyToOne(() => MediaAsset, { nullable: true })
  @JoinColumn()
  audioMedia!: Relation<MediaAsset> | null;

  @Column({ type: 'uuid', nullable: true })
  coverMediaId!: string | null;

  @ManyToOne(() => MediaAsset, { nullable: true })
  @JoinColumn()
  coverMedia!: Relation<MediaAsset> | null;

  @Column({ type: 'smallint', nullable: true })
  estimatedMinutes!: number | null;

  @Column({ type: 'varchar', length: 10 })
  language!: string;

  @Column({ type: 'uuid', nullable: true })
  countryId!: string | null;

  @ManyToOne(() => Country, { nullable: true })
  @JoinColumn()
  country!: Relation<Country> | null;

  @Column({ ...LITURGICAL_SEASON_COLUMN, nullable: true })
  liturgicalSeason!: LiturgicalSeason | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  dioceseId!: string | null;

  @ManyToOne(() => Diocese, { nullable: true })
  @JoinColumn()
  diocese!: Relation<Diocese> | null;

  // 0 = Sunday … 6 = Saturday, e.g. [1, 6] for Monday and Saturday mysteries.
  @Column({ type: 'jsonb', nullable: true })
  daysOfWeek!: number[] | null;

  // Tabs within a devotion, e.g. Rosary → Prayers / Mysteries / Litany.
  @Index()
  @Column({ type: 'uuid', nullable: true })
  parentCollectionId!: string | null;

  @ManyToOne(() => ContentCollection, { nullable: true })
  @JoinColumn()
  parentCollection!: Relation<ContentCollection> | null;

  @Column({ type: 'smallint', default: 0 })
  sortOrder!: number;

  @Column(RECORD_STATUS_COLUMN)
  status!: RecordStatus;

  @Index({ type: 'gin' })
  @Column({
    type: 'tsvector',
    generatedType: 'STORED',
    asExpression: SEARCH_VECTOR_EXPRESSION,
    select: false,
  })
  searchVector!: string;
}
