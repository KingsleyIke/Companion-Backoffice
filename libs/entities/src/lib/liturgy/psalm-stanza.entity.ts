import { Column, Entity, JoinColumn, ManyToOne, Unique, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { Reading } from './reading.entity';

// Verified with its parent reading. The renderer inserts reading.psalm_response between stanzas.
@Entity()
@Unique(['readingId', 'sequence'])
export class PsalmStanza extends BaseEntity {
  @Column({ type: 'uuid' })
  readingId!: string;

  @ManyToOne(() => Reading)
  @JoinColumn()
  reading!: Relation<Reading>;

  @Column({ type: 'smallint' })
  sequence!: number;

  // Sanitised on write.
  @Column({ type: 'text' })
  bodyHtml!: string;
}
