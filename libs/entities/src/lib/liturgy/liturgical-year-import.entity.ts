import { Check, Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { AdminUser } from '../admin/admin-user.entity';
import { BaseEntity } from '../base.entity';
import { Country } from '../church/country.entity';
import { MediaAsset } from '../media/media-asset.entity';
import { IMPORT_STATUSES, type ImportErrorReport, type ImportStatus } from './liturgical-enums';

@Entity()
@Index('UQ_liturgical_year_import_one_committed', ['countryId', 'yearLabel'], {
  unique: true,
  where: `"status" = 'committed' AND "deleted_at" IS NULL`,
})
@Check('CHK_liturgical_year_import_date_range', `"end_date" >= "start_date"`)
export class LiturgicalYearImport extends BaseEntity {
  @Column({ type: 'uuid' })
  countryId!: string;

  @ManyToOne(() => Country)
  @JoinColumn()
  country!: Relation<Country>;

  // Liturgical year, beginning at Advent: '2026/2027'.
  @Column({ type: 'varchar', length: 20 })
  yearLabel!: string;

  @Column({ type: 'varchar', length: 160 })
  sourceDocument!: string;

  @Column({ type: 'date' })
  startDate!: string;

  @Column({ type: 'date' })
  endDate!: string;

  @Column({ type: 'uuid' })
  fileMediaId!: string;

  @ManyToOne(() => MediaAsset)
  @JoinColumn()
  fileMedia!: Relation<MediaAsset>;

  @Column({ type: 'uuid' })
  uploadedByAdminId!: string;

  @ManyToOne(() => AdminUser)
  @JoinColumn()
  uploadedByAdmin!: Relation<AdminUser>;

  @Column({ type: 'int', default: 0 })
  rowCount!: number;

  @Column({ type: 'int', default: 0 })
  insertedCount!: number;

  @Column({ type: 'int', default: 0 })
  updatedCount!: number;

  @Column({ type: 'enum', enum: IMPORT_STATUSES, enumName: 'import_status', default: 'uploaded' })
  status!: ImportStatus;

  @Column({ type: 'jsonb', nullable: true })
  errorReport!: ImportErrorReport | null;

  @Column({ type: 'timestamptz', nullable: true })
  committedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  rolledBackAt!: Date | null;
}
