import type { DataSourceOptions } from 'typeorm';

export * from './lib/base.entity';

export const ENTITIES: NonNullable<DataSourceOptions['entities']> = [];
