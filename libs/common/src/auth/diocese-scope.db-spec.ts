import { DataSource, QueryRunner } from 'typeorm';
import { Parish } from '@companion/entities';

import { loadEnvironment } from '../config/environment';
import { createDataSourceOptions } from '../database/data-source-options';
import { applyDioceseScope, type DioceseScope } from './diocese-scope';

// Rolled-back transaction; placeholder dioceses only.
describe('applyDioceseScope (database)', () => {
  const environment = loadEnvironment();
  const dataSource = new DataSource(
    createDataSourceOptions(environment, environment.database.migrationUrl),
  );
  let runner: QueryRunner;
  const LAGOS = '00000000-0000-7000-8000-0000000000a1';
  const ENUGU = '00000000-0000-7000-8000-0000000000a2';

  beforeAll(() => dataSource.initialize());
  afterAll(() => dataSource.destroy());
  beforeEach(async () => {
    runner = dataSource.createQueryRunner();
    await runner.startTransaction();
    await runner.query(`
      INSERT INTO country (id, iso_code, name, default_locale, default_timezone, currency_code)
        VALUES ('00000000-0000-7000-8000-000000000001', 'XX', 'Testland', 'en', 'Africa/Lagos', 'XXX');
      INSERT INTO diocese (id, country_id, name, slug, type, seat_city, state) VALUES
        ('${LAGOS}', '00000000-0000-7000-8000-000000000001', 'Test Lagos', 'test-lagos', 'diocese', 'C', 'S'),
        ('${ENUGU}', '00000000-0000-7000-8000-000000000001', 'Test Enugu', 'test-enugu', 'diocese', 'C', 'S');
      INSERT INTO institution (id, name, slug, type, state)
        VALUES ('00000000-0000-7000-8000-0000000000b1', 'Test Barracks', 'test-barracks', 'military', 'S');
      INSERT INTO parish (name, slug, state, diocese_id) VALUES
        ('In Lagos', 'scope-in-lagos', 'S', '${LAGOS}'),
        ('In Enugu', 'scope-in-enugu', 'S', '${ENUGU}');
      INSERT INTO parish (name, slug, type, state, institution_id)
        VALUES ('No diocese', 'scope-no-diocese', 'chaplaincy', 'S', '00000000-0000-7000-8000-0000000000b1');
    `);
  });
  afterEach(async () => {
    await runner.rollbackTransaction();
    await runner.release();
  });

  const parishesVisibleTo = async (scope: DioceseScope) => {
    const query = runner.manager
      .getRepository(Parish)
      .createQueryBuilder('parish')
      .where("parish.slug LIKE 'scope-%'")
      .orderBy('parish.slug');
    return (await applyDioceseScope(query, 'parish.dioceseId', scope).getMany()).map((p) => p.name);
  };

  it('shows a national role every parish, including those outside any diocese', async () => {
    expect(await parishesVisibleTo({ kind: 'all' })).toEqual([
      'In Enugu',
      'In Lagos',
      'No diocese',
    ]);
  });

  it('shows a diocese admin only their own diocese', async () => {
    expect(await parishesVisibleTo({ kind: 'diocese', dioceseId: LAGOS })).toEqual(['In Lagos']);
  });
});
