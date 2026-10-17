import { BadRequestException } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { createDataSourceOptions, encodeCursor, loadEnvironment } from '@companion/common';
import { Diocese } from '@companion/entities';

import { DiocesesService } from './dioceses.service';

// Runs against a migrated database inside a rolled-back transaction. Pre-existing dioceses are
// hidden for the duration, so only the placeholder rows below are visible.
describe('DiocesesService.listPublished (database)', () => {
  const environment = loadEnvironment();
  const dataSource = new DataSource(
    createDataSourceOptions(environment, environment.database.migrationUrl),
  );
  let runner: QueryRunner;
  let service: DiocesesService;

  beforeAll(() => dataSource.initialize());
  afterAll(() => dataSource.destroy());

  beforeEach(async () => {
    runner = dataSource.createQueryRunner();
    await runner.startTransaction();
    service = new DiocesesService(runner.manager.getRepository(Diocese));
    await runner.query(`
      UPDATE diocese SET publication_status = 'hidden';
      INSERT INTO country (id, iso_code, name, default_locale, default_timezone, currency_code)
        VALUES ('00000000-0000-7000-8000-000000000001', 'XX', 'Testland', 'en', 'Africa/Lagos', 'XXX');
      INSERT INTO diocese (country_id, name, slug, type, seat_city, state, publication_status, deleted_at)
      VALUES
        ('00000000-0000-7000-8000-000000000001', 'Charlie', 'charlie', 'diocese', 'C', 'S', 'published', NULL),
        ('00000000-0000-7000-8000-000000000001', 'Alpha', 'alpha', 'archdiocese', 'A', 'S', 'published', NULL),
        ('00000000-0000-7000-8000-000000000001', 'Bravo', 'bravo', 'diocese', 'B', 'S', 'published', NULL),
        ('00000000-0000-7000-8000-000000000001', 'Hidden', 'hidden', 'diocese', 'H', 'S', 'hidden', NULL),
        ('00000000-0000-7000-8000-000000000001', 'Seeding', 'seeding', 'diocese', 'I', 'S', 'in_progress', NULL),
        ('00000000-0000-7000-8000-000000000001', 'Deleted', 'deleted', 'diocese', 'D', 'S', 'published', now());
    `);
  });

  afterEach(async () => {
    await runner.rollbackTransaction();
    await runner.release();
  });

  it('returns only published, non-deleted dioceses, by name', async () => {
    const page = await service.listPublished({ limit: 50 });
    expect(page.items.map((d) => d.name)).toEqual(['Alpha', 'Bravo', 'Charlie']);
    expect(page.nextCursor).toBeNull();
    expect(page.items[0]).toMatchObject({ slug: 'alpha', type: 'archdiocese', provinceId: null });
  });

  it('pages with a cursor until the last page', async () => {
    const first = await service.listPublished({ limit: 2 });
    expect(first.items.map((d) => d.name)).toEqual(['Alpha', 'Bravo']);
    expect(first.nextCursor).not.toBeNull();

    const second = await service.listPublished({ limit: 2, cursor: first.nextCursor ?? undefined });
    expect(second.items.map((d) => d.name)).toEqual(['Charlie']);
    expect(second.nextCursor).toBeNull();
  });

  it('rejects a cursor it did not issue', async () => {
    await expect(service.listPublished({ limit: 2, cursor: 'garbage' })).rejects.toThrow(
      BadRequestException,
    );
    await expect(
      service.listPublished({ limit: 2, cursor: encodeCursor(['only-one-key']) }),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.listPublished({ limit: 2, cursor: encodeCursor(['Alpha', 'not-a-uuid']) }),
    ).rejects.toThrow(BadRequestException);
  });
});
