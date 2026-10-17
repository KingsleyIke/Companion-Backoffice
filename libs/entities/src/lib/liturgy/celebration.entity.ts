import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import {
  CELEBRATION_RANKS,
  LITURGICAL_COLORS,
  type CelebrationRank,
  type LiturgicalColor,
} from './liturgical-enums';
import { LiturgicalDay } from './liturgical-day.entity';
import { Saint } from './saint.entity';

// Precedence is transcribed from the Ordo, which has already resolved it. Never infer it.
@Entity()
@Index(['liturgicalDayId', 'precedence'])
@Index('UQ_celebration_one_primary_per_day', ['liturgicalDayId'], {
  unique: true,
  where: `"is_primary" AND "deleted_at" IS NULL`,
})
export class Celebration extends BaseEntity {
  @Column({ type: 'uuid' })
  liturgicalDayId!: string;

  @ManyToOne(() => LiturgicalDay)
  @JoinColumn()
  liturgicalDay!: Relation<LiturgicalDay>;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'enum', enum: CELEBRATION_RANKS, enumName: 'celebration_rank' })
  rank!: CelebrationRank;

  @Column({ type: 'smallint' })
  precedence!: number;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  saintId!: string | null;

  @ManyToOne(() => Saint, { nullable: true })
  @JoinColumn()
  saint!: Relation<Saint> | null;

  @Column({ type: 'boolean', default: false })
  isProperToCountry!: boolean;

  @Column({
    type: 'enum',
    enum: LITURGICAL_COLORS,
    enumName: 'liturgical_color',
    nullable: true,
  })
  liturgicalColor!: LiturgicalColor | null;

  @Column({ type: 'boolean', default: false })
  isPrimary!: boolean;
}
