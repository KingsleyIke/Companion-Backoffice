import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { Parish } from './parish.entity';

export const SOCIAL_PLATFORMS = [
  'facebook',
  'instagram',
  'x',
  'youtube',
  'tiktok',
  'whatsapp',
  'website',
  'other',
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

@Entity()
@Index(['parishId', 'sortOrder'])
export class ParishSocialLink extends BaseEntity {
  @Column({ type: 'uuid' })
  parishId!: string;

  @ManyToOne(() => Parish)
  @JoinColumn()
  parish!: Relation<Parish>;

  @Column({ type: 'enum', enum: SOCIAL_PLATFORMS, enumName: 'social_platform' })
  platform!: SocialPlatform;

  @Column({ type: 'varchar', length: 500 })
  url!: string;

  @Column({ type: 'smallint', default: 0 })
  sortOrder!: number;
}
