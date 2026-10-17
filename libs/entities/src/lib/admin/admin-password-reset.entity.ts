import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { AdminUser } from './admin-user.entity';

@Entity()
export class AdminPasswordReset extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  adminUserId!: string;

  @ManyToOne(() => AdminUser)
  @JoinColumn()
  adminUser!: Relation<AdminUser>;

  @Column({ type: 'varchar', length: 64, unique: true })
  tokenHash!: string;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  usedAt!: Date | null;
}
