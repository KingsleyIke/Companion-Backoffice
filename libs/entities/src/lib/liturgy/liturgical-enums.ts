import type { ColumnOptions } from 'typeorm';

// Shared Postgres enum types: declare their columns only through the *_COLUMN constants.
export const LITURGICAL_SEASONS = [
  'advent',
  'christmas',
  'ordinary',
  'lent',
  'triduum',
  'easter',
] as const;
export type LiturgicalSeason = (typeof LITURGICAL_SEASONS)[number];
export const LITURGICAL_SEASON_COLUMN: ColumnOptions = {
  type: 'enum',
  enum: LITURGICAL_SEASONS,
  enumName: 'liturgical_season',
};

export const LITURGICAL_COLORS = [
  'green',
  'white',
  'red',
  'violet',
  'rose',
  'black',
  'gold',
] as const;
export type LiturgicalColor = (typeof LITURGICAL_COLORS)[number];
export const LITURGICAL_COLOR_COLUMN: ColumnOptions = {
  type: 'enum',
  enum: LITURGICAL_COLORS,
  enumName: 'liturgical_color',
};

export const CELEBRATION_RANKS = [
  'solemnity',
  'feast',
  'memorial',
  'optional_memorial',
  'ferial',
] as const;
export type CelebrationRank = (typeof CELEBRATION_RANKS)[number];
export const CELEBRATION_RANK_COLUMN: ColumnOptions = {
  type: 'enum',
  enum: CELEBRATION_RANKS,
  enumName: 'celebration_rank',
};

export const SUNDAY_CYCLES = ['A', 'B', 'C'] as const;
export type SundayCycle = (typeof SUNDAY_CYCLES)[number];

export const WEEKDAY_CYCLES = ['I', 'II'] as const;
export type WeekdayCycle = (typeof WEEKDAY_CYCLES)[number];

export const ROSARY_MYSTERY_SETS = ['joyful', 'luminous', 'sorrowful', 'glorious'] as const;
export type RosaryMysterySet = (typeof ROSARY_MYSTERY_SETS)[number];

export const IMPORT_STATUSES = [
  'uploaded',
  'validated',
  'committed',
  'rolled_back',
  'failed',
] as const;
export type ImportStatus = (typeof IMPORT_STATUSES)[number];
export const IMPORT_STATUS_COLUMN: ColumnOptions = {
  type: 'enum',
  enum: IMPORT_STATUSES,
  enumName: 'import_status',
  default: 'uploaded',
};

export type ImportErrorReport = { row: number; column: string; message: string }[];
