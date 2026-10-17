import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
  type Relation,
} from 'typeorm';

import { BaseEntity } from '../base.entity';
import { AppUser } from '../users/app-user.entity';
import { Device } from '../users/device.entity';
import { Diocese } from './diocese.entity';

// One vote per device per diocese, and one "my diocese isn't listed" vote per device.
@Entity()
@Unique(['deviceId', 'dioceseId'])
@Index('UQ_diocese_interest_one_unlisted_per_device', ['deviceId'], {
  unique: true,
  where: `"diocese_id" IS NULL`,
})
@Check(
  'CHK_diocese_interest_names_a_diocese',
  `"diocese_id" IS NOT NULL OR "requested_name" IS NOT NULL`,
)
export class DioceseInterest extends BaseEntity {
  @Index()
  @Column({ type: 'uuid', nullable: true })
  dioceseId!: string | null;

  @ManyToOne(() => Diocese, { nullable: true })
  @JoinColumn()
  diocese!: Relation<Diocese> | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  requestedName!: string | null;

  @Column({ type: 'uuid' })
  deviceId!: string;

  @ManyToOne(() => Device)
  @JoinColumn()
  device!: Relation<Device>;

  @Column({ type: 'uuid', nullable: true })
  userId!: string | null;

  @ManyToOne(() => AppUser, { nullable: true })
  @JoinColumn()
  user!: Relation<AppUser> | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  state!: string | null;
}
