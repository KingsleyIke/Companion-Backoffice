import { DataSource } from 'typeorm';

import { loadEnvironment } from '../config/environment';
import { createDataSourceOptions } from './data-source-options';

const environment = loadEnvironment();
const { migrationUrl } = environment.database;

if (!migrationUrl) {
  throw new Error('MIGRATION_DATABASE_URL is required to run migrations');
}

export default new DataSource({
  ...createDataSourceOptions(environment, migrationUrl),
  migrations: ['migrations/*.ts'],
});
