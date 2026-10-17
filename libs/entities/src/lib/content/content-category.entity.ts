import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { Country } from '../church/country.entity';

export const CONTENT_DISPLAY_STYLES = ['list', 'grid', 'carousel'] as const;
export type ContentDisplayStyle = (typeof CONTENT_DISPLAY_STYLES)[number];

@Entity()
@Index(['parentCategoryId', 'sortOrder'])
export class ContentCategory extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  parentCategoryId!: string | null;

  @ManyToOne(() => ContentCategory, { nullable: true })
  @JoinColumn()
  parentCategory!: Relation<ContentCategory> | null;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 140, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  icon!: string | null;

  @Column({ type: 'smallint', default: 0 })
  sortOrder!: number;

  @Column({
    type: 'enum',
    enum: CONTENT_DISPLAY_STYLES,
    enumName: 'content_display_style',
    default: 'list',
  })
  displayStyle!: ContentDisplayStyle;

  @Column({ type: 'uuid', nullable: true })
  countryId!: string | null;

  @ManyToOne(() => Country, { nullable: true })
  @JoinColumn()
  country!: Relation<Country> | null;
}
