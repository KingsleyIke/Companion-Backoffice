import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { Parish } from './parish.entity';

@Entity()
@Index(['parishId', 'sortOrder'])
export class ParishActivity extends BaseEntity {
  @Column({ type: 'uuid' })
  parishId!: string;

  @ManyToOne(() => Parish)
  @JoinColumn()
  parish!: Relation<Parish>;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  // Deliberately free text: "First Thursday/Friday", "Wed from 6:30am" don't structure.
  @Column({ type: 'varchar', length: 200 })
  scheduleText!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  category!: string | null;

  @Column({ type: 'smallint', default: 0 })
  sortOrder!: number;
}
