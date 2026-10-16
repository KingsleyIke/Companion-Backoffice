import { registerAs } from '@nestjs/config';

const NODE_ENVS = ['development', 'test', 'staging', 'production'] as const;
export type NodeEnv = (typeof NODE_ENVS)[number];

export interface Environment {
  nodeEnv: NodeEnv;
  port: number;
  database: {
    url: string;
    migrationUrl: string | undefined;
    ssl: boolean;
  };
}

type Source = Record<string, string | undefined>;

export function loadEnvironment(source: Source = process.env): Environment {
  const errors: string[] = [];

  const nodeEnv = readOneOf(source, 'NODE_ENV', NODE_ENVS, 'development', errors);
  const port = readPort(source, 'PORT', 3000, errors);
  const url = readPostgresUrl(source, 'DATABASE_URL', errors);
  const migrationUrl = readOptional(source, 'MIGRATION_DATABASE_URL')
    ? readPostgresUrl(source, 'MIGRATION_DATABASE_URL', errors)
    : undefined;
  const ssl = readBoolean(source, 'DATABASE_SSL', true, errors);

  // The transaction pooler lacks the prepared statements and advisory locks
  // TypeORM's migration runner needs (docs/03 §5.2).
  if (migrationUrl && new URL(migrationUrl).port === '6543') {
    errors.push(
      'MIGRATION_DATABASE_URL must not use the transaction pooler (port 6543); use the direct or session connection on 5432',
    );
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment:\n  - ${errors.join('\n  - ')}`);
  }

  const environment: Environment = {
    nodeEnv,
    port,
    database: { url, migrationUrl, ssl },
  };
  assertNotPointedAtProduction(environment, readOptional(source, 'PRODUCTION_DATABASE_REF'));
  return environment;
}

export const environmentConfig = registerAs('environment', () => loadEnvironment());

function assertNotPointedAtProduction(
  environment: Environment,
  productionRef: string | undefined,
): void {
  if (!productionRef || environment.nodeEnv === 'production') {
    return;
  }
  const { url, migrationUrl } = environment.database;
  if ([url, migrationUrl].some((value) => value?.includes(productionRef))) {
    throw new Error(
      `Refusing to start: ${environment.nodeEnv} build pointed at the production database`,
    );
  }
}

function readOptional(source: Source, key: string): string | undefined {
  const value = source[key]?.trim();
  return value ? value : undefined;
}

function readOneOf<T extends string>(
  source: Source,
  key: string,
  allowed: readonly T[],
  fallback: T,
  errors: string[],
): T {
  const value = readOptional(source, key);
  if (value === undefined) {
    return fallback;
  }
  if (!(allowed as readonly string[]).includes(value)) {
    errors.push(`${key} must be one of: ${allowed.join(', ')}`);
    return fallback;
  }
  return value as T;
}

function readPort(source: Source, key: string, fallback: number, errors: string[]): number {
  const value = readOptional(source, key);
  if (value === undefined) {
    return fallback;
  }
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push(`${key} must be an integer between 1 and 65535`);
    return fallback;
  }
  return port;
}

function readBoolean(source: Source, key: string, fallback: boolean, errors: string[]): boolean {
  const value = readOptional(source, key);
  if (value === undefined) {
    return fallback;
  }
  if (value !== 'true' && value !== 'false') {
    errors.push(`${key} must be "true" or "false"`);
    return fallback;
  }
  return value === 'true';
}

// Error messages never echo the value: connection strings carry the password.
function readPostgresUrl(source: Source, key: string, errors: string[]): string {
  const value = readOptional(source, key);
  if (value === undefined) {
    errors.push(`${key} is required`);
    return '';
  }
  try {
    const { protocol } = new URL(value);
    if (protocol !== 'postgres:' && protocol !== 'postgresql:') {
      errors.push(`${key} must be a postgres:// or postgresql:// URL`);
    }
  } catch {
    errors.push(`${key} is not a valid URL`);
  }
  return value;
}
