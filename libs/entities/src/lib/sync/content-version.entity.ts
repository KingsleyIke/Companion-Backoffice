import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

// Documented BaseEntity exception: it is the sync manifest itself, keyed by resource name, so it
// has no id and is never soft-deleted.
@Entity()
export class ContentVersion {
  @PrimaryColumn({ type: 'varchar', length: 60 })
  resource!: string;

  // pg returns bigint as a string to avoid precision loss.
  @Column({ type: 'bigint', default: 0 })
  version!: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
