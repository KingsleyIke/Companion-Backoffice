import { ENTITIES } from '@companion/entities';
import type { DataSourceOptions } from 'typeorm';

import type { Environment } from '../config/environment';
import { SnakeNamingStrategy } from './snake-naming.strategy';

export function createDataSourceOptions(
  environment: Environment,
  url: string = environment.database.url,
): DataSourceOptions {
  return {
    type: 'postgres',
    url,
    ssl: environment.database.ssl ? { rejectUnauthorized: false } : false,
    entities: ENTITIES,
    namingStrategy: new SnakeNamingStrategy(),
    // Never true: synchronize silently drops columns. Every schema change is a migration.
    synchronize: false,
    migrationsRun: false,
  };
}
