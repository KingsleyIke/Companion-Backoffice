import type { ColumnOptions } from 'typeorm';

export const RECORD_STATUSES = ['draft', 'published', 'archived'] as const;
export type RecordStatus = (typeof RECORD_STATUSES)[number];

// One Postgres type shared by several tables: declare the column only through this constant.
export const RECORD_STATUS_COLUMN: ColumnOptions = {
  type: 'enum',
  enum: RECORD_STATUSES,
  enumName: 'record_status',
  default: 'draft',
};
