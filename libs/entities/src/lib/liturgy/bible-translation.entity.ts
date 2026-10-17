import { Column, Entity, JoinColumn, ManyToOne, Unique, type Relation } from 'typeorm';

import { BaseEntity } from '../base.entity';
import { Country } from '../church/country.entity';
import { MediaAsset } from '../media/media-asset.entity';

export const TEXT_SOURCE_KINDS = ['lectionary', 'missal'] as const;
export type TextSourceKind = (typeof TEXT_SOURCE_KINDS)[number];

// The authority under which licensed texts are published. Licences are territorial, hence
// country_id. Internal only: never exposed by a public endpoint.
@Entity()
@Unique(['countryId', 'abbreviation'])
export class BibleTranslation extends BaseEntity {
  @Column({ type: 'uuid' })
  countryId!: string;

  @ManyToOne(() => Country)
  @JoinColumn()
  country!: Relation<Country>;

  @Column({ type: 'enum', enum: TEXT_SOURCE_KINDS, enumName: 'text_source_kind' })
  sourceKind!: TextSourceKind;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  abbreviation!: string;

  @Column({ type: 'varchar', length: 160 })
  licenceHolder!: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  licenceReference!: string | null;

  @Column({ type: 'uuid', nullable: true })
  permissionDocumentMediaId!: string | null;

  @ManyToOne(() => MediaAsset, { nullable: true })
  @JoinColumn()
  permissionDocumentMedia!: Relation<MediaAsset> | null;

  @Column({ type: 'boolean', default: false })
  isApprovedLectionary!: boolean;
}
