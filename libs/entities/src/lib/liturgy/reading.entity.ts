import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
  type Relation,
} from 'typeorm';

import { MediaAsset } from '../media/media-asset.entity';
import { LicensedTextSource } from './licensed-text-source.entity';
import { ReadingImportBatch } from './reading-import-batch.entity';
import { ReadingSet } from './reading-set.entity';
import { VerifiedContent } from './verified-content';

// 'additional' covers readings beyond the first and second, as at the Easter Vigil. The printed
// label ("Fourth Reading") goes in heading exactly as the Lectionary has it.
export const READING_TYPES = [
  'first',
  'psalm',
  'second',
  'additional',
  'acclamation',
  'gospel',
  'sequence',
] as const;
export type ReadingType = (typeof READING_TYPES)[number];

@Entity()
@Unique(['readingSetId', 'sequence', 'isShorterForm'])
@Check('CHK_reading_psalm_response_only_on_psalm', `"type" = 'psalm' OR "psalm_response" IS NULL`)
export class Reading extends VerifiedContent {
  @Column({ type: 'uuid' })
  readingSetId!: string;

  @ManyToOne(() => ReadingSet)
  @JoinColumn()
  readingSet!: Relation<ReadingSet>;

  @Column({ type: 'enum', enum: READING_TYPES, enumName: 'reading_type' })
  type!: ReadingType;

  @Column({ type: 'smallint' })
  sequence!: number;

  @Column({ type: 'varchar', length: 120 })
  citation!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  heading!: string | null;

  // Wording varies between readings: stored as printed, never derived.
  @Column({ type: 'varchar', length: 240, nullable: true })
  introLine!: string | null;

  @Column({ type: 'varchar', length: 240, nullable: true })
  title!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  closingLine!: string | null;

  // Sanitised on write.
  @Column({ type: 'text' })
  bodyHtml!: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  psalmResponse!: string | null;

  @Column({ type: 'boolean', default: false })
  isShorterForm!: boolean;

  @Column({ type: 'uuid' })
  sourceId!: string;

  @ManyToOne(() => LicensedTextSource)
  @JoinColumn()
  source!: Relation<LicensedTextSource>;

  @Column({ type: 'uuid', nullable: true })
  audioMediaId!: string | null;

  @ManyToOne(() => MediaAsset, { nullable: true })
  @JoinColumn()
  audioMedia!: Relation<MediaAsset> | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  importBatchId!: string | null;

  @ManyToOne(() => ReadingImportBatch, { nullable: true })
  @JoinColumn()
  importBatch!: Relation<ReadingImportBatch> | null;

  // e.g. 'Lectionary Vol. II, p. 341'.
  @Column({ type: 'varchar', length: 160 })
  sourceReference!: string;
}
