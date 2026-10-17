import { Column, Entity, Index, JoinColumn, ManyToOne, Unique, type Relation } from 'typeorm';

import { Celebration } from './celebration.entity';
import { LiturgicalDay } from './liturgical-day.entity';
import { VerifiedContent } from './verified-content';

export const MASS_TYPES = ['day', 'vigil', 'night', 'dawn', 'ritual'] as const;
export type MassType = (typeof MASS_TYPES)[number];

// One date can carry several Masses (Christmas: vigil, night, dawn, day). Verification here
// covers the reflection and personal devotion, which are original content.
@Entity()
@Unique(['liturgicalDayId', 'massType', 'cycle'])
@Index('UQ_reading_set_one_uncycled_per_mass_type', ['liturgicalDayId', 'massType'], {
  unique: true,
  where: `"cycle" IS NULL`,
})
export class ReadingSet extends VerifiedContent {
  @Column({ type: 'uuid' })
  liturgicalDayId!: string;

  @ManyToOne(() => LiturgicalDay)
  @JoinColumn()
  liturgicalDay!: Relation<LiturgicalDay>;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  celebrationId!: string | null;

  @ManyToOne(() => Celebration, { nullable: true })
  @JoinColumn()
  celebration!: Relation<Celebration> | null;

  @Column({ type: 'enum', enum: MASS_TYPES, enumName: 'mass_type' })
  massType!: MassType;

  @Column({ type: 'varchar', length: 2, nullable: true })
  cycle!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  label!: string | null;

  @Column({ type: 'boolean', default: false })
  hasSecondReading!: boolean;

  @Column({ type: 'text', nullable: true })
  reflectionHtml!: string | null;

  @Column({ type: 'text', nullable: true })
  personalDevotionHtml!: string | null;

  @Column({ type: 'smallint', default: 0 })
  sortOrder!: number;
}
