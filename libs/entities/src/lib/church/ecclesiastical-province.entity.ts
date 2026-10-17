import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { Country } from './country.entity';
import { Diocese } from './diocese.entity';

@Entity()
export class EcclesiasticalProvince extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  countryId!: string;

  @ManyToOne(() => Country)
  @JoinColumn()
  country!: Relation<Country>;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'varchar', length: 180, unique: true })
  slug!: string;

  @Column({ type: 'uuid', nullable: true })
  metropolitanSeeId!: string | null;

  @ManyToOne(() => Diocese, { nullable: true })
  @JoinColumn()
  metropolitanSee!: Relation<Diocese> | null;
}
