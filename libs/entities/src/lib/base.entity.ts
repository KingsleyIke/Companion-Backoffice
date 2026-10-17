import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  // uuid_v7() is defined in migrations; Postgres 17 has no native v7.
  @PrimaryColumn({ type: 'uuid', default: () => 'uuid_v7()' })
  id!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  // Delta sync scans every table by updated_at.
  @Index()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  createdBy!: string | null;

  @Column({ type: 'uuid', nullable: true })
  updatedBy!: string | null;
}
