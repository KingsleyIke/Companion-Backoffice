import { Check, Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { Parish } from './parish.entity';

export const MASS_LANGUAGES = ['english', 'igbo', 'yoruba', 'hausa', 'latin', 'other'] as const;
export type MassLanguage = (typeof MASS_LANGUAGES)[number];

export const MASS_SCHEDULE_TYPES = [
  'sunday',
  'weekday',
  'vigil',
  'holy_day',
  'adoration',
  'confession',
  'novena',
] as const;
export type MassScheduleType = (typeof MASS_SCHEDULE_TYPES)[number];

// day_of_week: 0 = Sunday … 6 = Saturday. A Saturday-evening vigil is day 6, type 'vigil'.
@Entity()
@Index(['parishId', 'dayOfWeek'])
@Check('CHK_mass_schedule_day_of_week_range', `"day_of_week" BETWEEN 0 AND 6`)
@Check('CHK_mass_schedule_weekly_xor_dated', `("day_of_week" IS NULL) <> ("specific_date" IS NULL)`)
@Check(
  'CHK_mass_schedule_effective_range',
  `"effective_to" IS NULL OR "effective_from" IS NULL OR "effective_to" >= "effective_from"`,
)
export class MassSchedule extends BaseEntity {
  @Column({ type: 'uuid' })
  parishId!: string;

  @ManyToOne(() => Parish)
  @JoinColumn()
  parish!: Relation<Parish>;

  @Column({ type: 'smallint', nullable: true })
  dayOfWeek!: number | null;

  @Column({ type: 'date', nullable: true })
  specificDate!: string | null;

  @Column({ type: 'time' })
  startTime!: string;

  @Column({ type: 'enum', enum: MASS_LANGUAGES, enumName: 'mass_language' })
  language!: MassLanguage;

  @Column({ type: 'enum', enum: MASS_SCHEDULE_TYPES, enumName: 'mass_schedule_type' })
  type!: MassScheduleType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes!: string | null;

  @Column({ type: 'date', nullable: true })
  effectiveFrom!: string | null;

  @Column({ type: 'date', nullable: true })
  effectiveTo!: string | null;
}
