export const RECORD_STATUSES = ['draft', 'published', 'archived'] as const;
export type RecordStatus = (typeof RECORD_STATUSES)[number];
