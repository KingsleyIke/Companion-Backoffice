import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { AdminUser } from './admin-user.entity';

// One row per issued refresh token. Rotation links each token to its replacement; reuse of a
// replaced token revokes every session sharing its family_id.
@Entity()
export class AdminSession extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  adminUserId!: string;

  @ManyToOne(() => AdminUser)
  @JoinColumn()
  adminUser!: Relation<AdminUser>;

  @Column({ type: 'varchar', length: 64, unique: true })
  tokenHash!: string;

  @Index()
  @Column({ type: 'uuid' })
  familyId!: string;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  replacedById!: string | null;

  @ManyToOne(() => AdminSession, { nullable: true })
  @JoinColumn()
  replacedBy!: Relation<AdminSession> | null;
}
