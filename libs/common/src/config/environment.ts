import { registerAs } from '@nestjs/config';

import {
  readBoolean,
  readHttpUrl,
  readOneOf,
  readOptional,
  readPort,
  readPostgresUrl,
  type Source,
} from './env-readers';

const NODE_ENVS = ['development', 'test', 'staging', 'production'] as const;
export type NodeEnv = (typeof NODE_ENVS)[number];

// Most to least severe; LOG_LEVEL keeps its level and everything more severe.
export const LOG_LEVELS = ['fatal', 'error', 'warn', 'log', 'debug', 'verbose'] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

export interface Environment {
  nodeEnv: NodeEnv;
  port: number;
  // Behind a reverse proxy (Railway), so request.ip is the client's address, not the proxy's.
  trustProxy: boolean;
  database: {
    url: string;
    migrationUrl: string | undefined;
    ssl: boolean;
  };
  observability: {
    logLevel: LogLevel;
    // Sentry is off unless a DSN is set, so local runs, tests and CI never report.
    sentryDsn: string | undefined;
    sentryRelease: string | undefined;
  };
}

export function loadEnvironment(source: Source = process.env): Environment {
  const errors: string[] = [];

  const nodeEnv = readOneOf(source, 'NODE_ENV', NODE_ENVS, 'development', errors);
  const port = readPort(source, 'PORT', 3000, errors);
  const url = readPostgresUrl(source, 'DATABASE_URL', errors);
  const migrationUrl = readOptional(source, 'MIGRATION_DATABASE_URL')
    ? readPostgresUrl(source, 'MIGRATION_DATABASE_URL', errors)
    : undefined;
  const ssl = readBoolean(source, 'DATABASE_SSL', true, errors);
  const trustProxy = readBoolean(source, 'TRUST_PROXY', false, errors);
  const logLevel = readOneOf(source, 'LOG_LEVEL', LOG_LEVELS, 'log', errors);
  const sentryDsn = readOptional(source, 'SENTRY_DSN')
    ? readHttpUrl(source, 'SENTRY_DSN', errors)
    : undefined;
  const sentryRelease = readOptional(source, 'SENTRY_RELEASE');

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
    trustProxy,
    database: { url, migrationUrl, ssl },
    observability: { logLevel, sentryDsn, sentryRelease },
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
