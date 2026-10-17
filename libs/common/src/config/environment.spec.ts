import { loadEnvironment } from './environment';

const POOLER_URL = 'postgresql://postgres.devref:secret@pooler.example.com:6543/postgres';
const DIRECT_URL = 'postgresql://postgres:secret@db.devref.example.com:5432/postgres';

describe('loadEnvironment', () => {
  it('applies defaults when only DATABASE_URL is set', () => {
    expect(loadEnvironment({ DATABASE_URL: POOLER_URL })).toEqual({
      nodeEnv: 'development',
      port: 3000,
      trustProxy: false,
      database: { url: POOLER_URL, migrationUrl: undefined, ssl: true },
    });
  });

  it('parses every variable', () => {
    const environment = loadEnvironment({
      NODE_ENV: 'test',
      PORT: '4000',
      DATABASE_URL: POOLER_URL,
      MIGRATION_DATABASE_URL: DIRECT_URL,
      DATABASE_SSL: 'false',
      TRUST_PROXY: 'true',
    });

    expect(environment).toEqual({
      nodeEnv: 'test',
      port: 4000,
      trustProxy: true,
      database: { url: POOLER_URL, migrationUrl: DIRECT_URL, ssl: false },
    });
  });

  it('reports every invalid variable at once', () => {
    expect(() => loadEnvironment({ NODE_ENV: 'prod', PORT: 'abc', DATABASE_SSL: 'yes' })).toThrow(
      /NODE_ENV must be one of[\s\S]*PORT must be an integer[\s\S]*DATABASE_URL is required[\s\S]*DATABASE_SSL must be/,
    );
  });

  it('rejects a non-postgres URL', () => {
    expect(() => loadEnvironment({ DATABASE_URL: 'mysql://user:pw@host/db' })).toThrow(
      /DATABASE_URL must be a postgres/,
    );
  });

  it('never echoes a connection string in errors', () => {
    expect(() =>
      loadEnvironment({ DATABASE_URL: POOLER_URL, MIGRATION_DATABASE_URL: POOLER_URL }),
    ).toThrow(expect.objectContaining({ message: expect.not.stringContaining('secret') }));
  });

  it('rejects migrations through the transaction pooler', () => {
    expect(() =>
      loadEnvironment({ DATABASE_URL: POOLER_URL, MIGRATION_DATABASE_URL: POOLER_URL }),
    ).toThrow(/transaction pooler/);
  });

  it('refuses a non-production build pointed at production', () => {
    expect(() =>
      loadEnvironment({
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://postgres.prodref:pw@pooler.example.com:6543/postgres',
        PRODUCTION_DATABASE_REF: 'prodref',
      }),
    ).toThrow(/Refusing to start: development build pointed at the production database/);
  });

  it('allows a production build to use the production database', () => {
    const url = 'postgresql://postgres.prodref:pw@pooler.example.com:6543/postgres';

    expect(
      loadEnvironment({
        NODE_ENV: 'production',
        DATABASE_URL: url,
        PRODUCTION_DATABASE_REF: 'prodref',
      }).database.url,
    ).toBe(url);
  });
});
