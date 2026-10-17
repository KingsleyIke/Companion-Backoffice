import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../base.entity';

@Entity()
export class Country extends BaseEntity {
  @Column({ type: 'char', length: 2, unique: true })
  isoCode!: string;

  @Column({ type: 'varchar', length: 80 })
  name!: string;

  @Column({ type: 'varchar', length: 10 })
  defaultLocale!: string;

  @Column({ type: 'varchar', length: 40 })
  defaultTimezone!: string;

  @Column({ type: 'char', length: 3 })
  currencyCode!: string;

  @Column({ type: 'boolean', default: false })
  isActive!: boolean;
}
