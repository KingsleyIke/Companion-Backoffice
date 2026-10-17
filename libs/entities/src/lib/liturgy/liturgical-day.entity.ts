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

import { BaseEntity } from '../base.entity';
import { Country } from '../church/country.entity';
import {
  LITURGICAL_COLOR_COLUMN,
  LITURGICAL_SEASON_COLUMN,
  ROSARY_MYSTERY_SETS,
  SUNDAY_CYCLES,
  WEEKDAY_CYCLES,
  type LiturgicalColor,
  type LiturgicalSeason,
  type RosaryMysterySet,
  type SundayCycle,
  type WeekdayCycle,
} from './liturgical-enums';
import { LiturgicalYearImport } from './liturgical-year-import.entity';

// Transcribed from the imported Ordo, never computed. import_id and source_reference trace every
// row to an Ordo page. rosary_mystery_set is the exception: editor-entered, not in the Ordo.
@Entity()
@Unique(['countryId', 'date'])
@Check('CHK_liturgical_day_day_of_week_matches_date', `"day_of_week" = extract(dow FROM "date")`)
export class LiturgicalDay extends BaseEntity {
  @Column({ type: 'uuid' })
  countryId!: string;

  @ManyToOne(() => Country)
  @JoinColumn()
  country!: Relation<Country>;

  @Column({ type: 'date' })
  date!: string;

  @Column(LITURGICAL_SEASON_COLUMN)
  season!: LiturgicalSeason;

  @Column({ type: 'smallint', nullable: true })
  weekOfSeason!: number | null;

  // 0 = Sunday … 6 = Saturday.
  @Column({ type: 'smallint' })
  dayOfWeek!: number;

  @Column({ type: 'enum', enum: SUNDAY_CYCLES, enumName: 'sunday_cycle', nullable: true })
  sundayCycle!: SundayCycle | null;

  @Column({ type: 'enum', enum: WEEKDAY_CYCLES, enumName: 'weekday_cycle', nullable: true })
  weekdayCycle!: WeekdayCycle | null;

  @Column(LITURGICAL_COLOR_COLUMN)
  liturgicalColor!: LiturgicalColor;

  @Column({
    type: 'enum',
    enum: ROSARY_MYSTERY_SETS,
    enumName: 'rosary_mystery_set',
    nullable: true,
  })
  rosaryMysterySet!: RosaryMysterySet | null;

  @Column({ type: 'boolean', default: false })
  isHolyDayOfObligation!: boolean;

  @Index()
  @Column({ type: 'uuid' })
  importId!: string;

  @ManyToOne(() => LiturgicalYearImport)
  @JoinColumn()
  import!: Relation<LiturgicalYearImport>;

  @Column({ type: 'varchar', length: 160 })
  sourceReference!: string;
}
