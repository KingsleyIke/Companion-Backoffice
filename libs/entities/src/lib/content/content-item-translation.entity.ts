import { Column, Entity, JoinColumn, ManyToOne, Unique, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { ContentItem } from './content-item.entity';

// Parallel text for language toggles (English / Latin / Both).
@Entity()
@Unique(['itemId', 'language'])
export class ContentItemTranslation extends BaseEntity {
  @Column({ type: 'uuid' })
  itemId!: string;

  @ManyToOne(() => ContentItem)
  @JoinColumn()
  item!: Relation<ContentItem>;

  @Column({ type: 'varchar', length: 10 })
  language!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title!: string | null;

  @Column({ type: 'text', nullable: true })
  bodyHtml!: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  responseText!: string | null;
}
