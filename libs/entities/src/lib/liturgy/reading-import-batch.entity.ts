import { Check, Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { AdminUser } from '../admin/admin-user.entity';
import { BaseEntity } from '../base.entity';
import { MediaAsset } from '../media/media-asset.entity';
import {
  IMPORT_STATUS_COLUMN,
  type ImportErrorReport,
  type ImportStatus,
} from './liturgical-enums';

export const IMPORT_FORMATS = ['xlsx', 'csv', 'json', 'docx'] as const;
export type ImportFormat = (typeof IMPORT_FORMATS)[number];

@Entity()
@Index(['status', 'createdAt'])
@Index(['dateRangeStart', 'dateRangeEnd'])
@Check('CHK_reading_import_batch_date_range', `"date_range_end" >= "date_range_start"`)
export class ReadingImportBatch extends BaseEntity {
  @Column({ type: 'varchar', length: 260 })
  filename!: string;

  @Column({ type: 'enum', enum: IMPORT_FORMATS, enumName: 'import_format' })
  format!: ImportFormat;

  @Column({ type: 'varchar', length: 200 })
  sourceReference!: string;

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

  @Column({ type: 'date' })
  dateRangeStart!: string;

  @Column({ type: 'date' })
  dateRangeEnd!: string;

  @Column({ type: 'int', default: 0 })
  rowCount!: number;

  @Column({ type: 'int', default: 0 })
  insertedCount!: number;

  @Column({ type: 'int', default: 0 })
  updatedCount!: number;

  @Column({ type: 'int', default: 0 })
  skippedCount!: number;

  @Column(IMPORT_STATUS_COLUMN)
  status!: ImportStatus;

  @Column({ type: 'jsonb', nullable: true })
  errorReport!: ImportErrorReport | null;

  @Column({ type: 'timestamptz', nullable: true })
  committedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  rolledBackAt!: Date | null;
}
