import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { ContactDetails } from './contact-details';
import { MediaAsset } from '../media/media-asset.entity';
import { Country } from './country.entity';
import { EcclesiasticalProvince } from './ecclesiastical-province.entity';

export const DIOCESE_TYPES = [
  'archdiocese',
  'diocese',
  'vicariate',
  'prefecture',
  'military_ordinariate',
] as const;
export type DioceseType = (typeof DIOCESE_TYPES)[number];

export const DIOCESE_PUBLICATION_STATUSES = ['hidden', 'in_progress', 'published'] as const;
export type DiocesePublicationStatus = (typeof DIOCESE_PUBLICATION_STATUSES)[number];

@Entity()
@Index(['countryId', 'publicationStatus'])
export class Diocese extends BaseEntity {
  @Column({ type: 'uuid' })
  countryId!: string;

  @ManyToOne(() => Country)
  @JoinColumn()
  country!: Relation<Country>;

  // Null when immediately subject to the Holy See, e.g. a military ordinariate.
  @Index()
  @Column({ type: 'uuid', nullable: true })
  provinceId!: string | null;

  @ManyToOne(() => EcclesiasticalProvince, { nullable: true })
  @JoinColumn()
  province!: Relation<EcclesiasticalProvince> | null;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'varchar', length: 180, unique: true })
  slug!: string;

  @Column({ type: 'enum', enum: DIOCESE_TYPES, enumName: 'diocese_type' })
  type!: DioceseType;

  @Column({ type: 'varchar', length: 160, nullable: true })
  patronSaint!: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  bishopName!: string | null;

  @Column({ type: 'varchar', length: 120 })
  seatCity!: string;

  @Column({ type: 'varchar', length: 120 })
  state!: string;

  @Column({ type: 'date', nullable: true })
  establishedDate!: string | null;

  @Column(() => ContactDetails, { prefix: false })
  contact!: ContactDetails;

  @Column({ type: 'uuid', nullable: true })
  logoMediaId!: string | null;

  @ManyToOne(() => MediaAsset, { nullable: true })
  @JoinColumn()
  logoMedia!: Relation<MediaAsset> | null;

  @Index()
  @Column({
    type: 'enum',
    enum: DIOCESE_PUBLICATION_STATUSES,
    enumName: 'diocese_publication_status',
    default: 'hidden',
  })
  publicationStatus!: DiocesePublicationStatus;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({ type: 'int', default: 0 })
  verifiedParishCount!: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  coverageNote!: string | null;

  @Column({ type: 'smallint', nullable: true })
  rolloutPriority!: number | null;

  @Column({ type: 'int', default: 0 })
  interestCount!: number;
}
