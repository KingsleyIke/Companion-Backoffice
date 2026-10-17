import { Column, Entity, JoinColumn, ManyToOne, Unique, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { Diocese } from './diocese.entity';

@Entity()
@Unique(['dioceseId', 'slug'])
export class Deanery extends BaseEntity {
  @Column({ type: 'uuid' })
  dioceseId!: string;

  @ManyToOne(() => Diocese)
  @JoinColumn()
  diocese!: Relation<Diocese>;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'varchar', length: 180 })
  slug!: string;
}
