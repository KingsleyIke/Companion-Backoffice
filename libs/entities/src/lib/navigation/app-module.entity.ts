import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { Country } from '../church/country.entity';

export const APP_MODULE_PLACEMENTS = [
  'home_primary',
  'home_secondary',
  'drawer',
  'bottom_nav',
] as const;
export type AppModulePlacement = (typeof APP_MODULE_PLACEMENTS)[number];

// Server-driven navigation: the home screen and drawer render from these rows. min_app_version
// hides a module from clients too old to render it.
@Entity()
@Index(['placement', 'sortOrder'])
export class AppModule extends BaseEntity {
  @Column({ type: 'varchar', length: 60, unique: true })
  key!: string;

  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  subtitle!: string | null;

  @Column({ type: 'varchar', length: 60 })
  icon!: string;

  // A client route or a content_collection slug.
  @Column({ type: 'varchar', length: 120 })
  route!: string;

  @Column({ type: 'enum', enum: APP_MODULE_PLACEMENTS, enumName: 'app_module_placement' })
  placement!: AppModulePlacement;

  @Column({ type: 'smallint', default: 0 })
  sortOrder!: number;

  @Column({ type: 'boolean', default: false })
  isEnabled!: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  badgeText!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  minAppVersion!: string | null;

  // Null means every country.
  @Column({ type: 'uuid', nullable: true })
  countryId!: string | null;

  @ManyToOne(() => Country, { nullable: true })
  @JoinColumn()
  country!: Relation<Country> | null;
}
