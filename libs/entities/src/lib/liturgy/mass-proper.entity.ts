import { Column, Entity, JoinColumn, ManyToOne, Unique, type Relation } from 'typeorm';

import { LicensedTextSource } from './licensed-text-source.entity';
import { ReadingSet } from './reading-set.entity';
import { VerifiedContent } from './verified-content';

export const MASS_PROPER_TYPES = [
  'entrance_antiphon',
  'collect',
  'prayer_after_communion',
  'offertory',
  'communion_antiphon',
] as const;
export type MassProperType = (typeof MASS_PROPER_TYPES)[number];

// Missal texts: a different copyright holder from the Lectionary, so source_id points to a
// source of kind 'missal'.
@Entity()
@Unique(['readingSetId', 'type'])
export class MassProper extends VerifiedContent {
  @Column({ type: 'uuid' })
  readingSetId!: string;

  @ManyToOne(() => ReadingSet)
  @JoinColumn()
  readingSet!: Relation<ReadingSet>;

  @Column({ type: 'enum', enum: MASS_PROPER_TYPES, enumName: 'mass_proper_type' })
  type!: MassProperType;

  // Sanitised on write.
  @Column({ type: 'text' })
  bodyHtml!: string;

  @Column({ type: 'uuid' })
  sourceId!: string;

  @ManyToOne(() => LicensedTextSource)
  @JoinColumn()
  source!: Relation<LicensedTextSource>;

  @Column({ type: 'varchar', length: 160, nullable: true })
  sourceReference!: string | null;
}
