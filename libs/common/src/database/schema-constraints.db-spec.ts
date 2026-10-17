import { Client, DatabaseError } from 'pg';

import { loadEnvironment } from '../config/environment';

// Runs against a migrated database (CI: after migration:verify). Every test works inside a
// transaction that is rolled back, so nothing persists. Data is placeholder only.

const ID = {
  country: '00000000-0000-7000-8000-000000000001',
  diocese: '00000000-0000-7000-8000-000000000002',
  parish: '00000000-0000-7000-8000-000000000003',
  media: '00000000-0000-7000-8000-000000000004',
  device: '00000000-0000-7000-8000-000000000005',
  institution: '00000000-0000-7000-8000-000000000006',
  proofreader: '00000000-0000-7000-8000-000000000010',
  verifier: '00000000-0000-7000-8000-000000000011',
  source: '00000000-0000-7000-8000-000000000020',
  ordoImport: '00000000-0000-7000-8000-000000000030',
  day: '00000000-0000-7000-8000-000000000040',
  readingSet: '00000000-0000-7000-8000-000000000050',
  topic: '00000000-0000-7000-8000-000000000060',
  category: '00000000-0000-7000-8000-000000000070',
  collection: '00000000-0000-7000-8000-000000000071',
  notification: '00000000-0000-7000-8000-000000000080',
} as const;

const SEED = `
  INSERT INTO country (id, iso_code, name, default_locale, default_timezone, currency_code)
    VALUES ('${ID.country}', 'XX', 'Testland', 'en', 'Africa/Lagos', 'XXX');
  INSERT INTO diocese (id, country_id, name, slug, type, seat_city, state)
    VALUES ('${ID.diocese}', '${ID.country}', 'Test Diocese', 'test-diocese', 'diocese', 'City', 'State');
  INSERT INTO parish (id, diocese_id, name, slug, state)
    VALUES ('${ID.parish}', '${ID.diocese}', 'Test Parish', 'test-parish', 'State');
  INSERT INTO institution (id, name, slug, type, state)
    VALUES ('${ID.institution}', 'Test Barracks', 'test-barracks', 'military', 'State');
  INSERT INTO media_asset (id, bucket, storage_key, kind, mime_type, size_bytes)
    VALUES ('${ID.media}', 'bucket', 'test/file.xlsx', 'document', 'application/test', 1);
  INSERT INTO device (id, fcm_token, platform, app_version, timezone)
    VALUES ('${ID.device}', 'test-token', 'android', '1.0', 'Africa/Lagos');
  INSERT INTO admin_user (id, email, name, role)
    VALUES ('${ID.proofreader}', 'proofreader@test.invalid', 'Proofreader', 'admin'),
           ('${ID.verifier}', 'verifier@test.invalid', 'Verifier', 'admin');
  INSERT INTO licensed_text_source (id, country_id, source_kind, name, abbreviation, licence_holder)
    VALUES ('${ID.source}', '${ID.country}', 'lectionary', 'Placeholder Source', 'PS', 'Placeholder Holder');
  INSERT INTO liturgical_year_import
      (id, country_id, year_label, source_document, start_date, end_date, file_media_id, uploaded_by_admin_id, status)
    VALUES ('${ID.ordoImport}', '${ID.country}', 'TEST', 'Placeholder', '2099-01-01', '2099-12-31',
            '${ID.media}', '${ID.proofreader}', 'committed');
  INSERT INTO liturgical_day (id, country_id, date, season, day_of_week, liturgical_color, import_id, source_reference)
    VALUES ('${ID.day}', '${ID.country}', '2099-03-03', 'ordinary', extract(dow FROM date '2099-03-03'),
            'green', '${ID.ordoImport}', 'Placeholder ref');
  INSERT INTO reading_set (id, liturgical_day_id, mass_type) VALUES ('${ID.readingSet}', '${ID.day}', 'vigil');
  INSERT INTO notification_topic (id, key, name, category) VALUES ('${ID.topic}', 'test_topic', 'Test', 'system');
  INSERT INTO scheduled_notification (id, topic_id, title, body, scheduled_for)
    VALUES ('${ID.notification}', '${ID.topic}', 'Placeholder', 'Placeholder', now());
  INSERT INTO content_category (id, name, slug) VALUES ('${ID.category}', 'Test', 'test-category');
  INSERT INTO content_collection (id, category_id, type, slug, title, subtitle, language)
    VALUES ('${ID.collection}', '${ID.category}', 'prayer', 'test-collection', 'Placeholder Title', 'Placeholder Subtitle', 'en');
`;

const READING_COLUMNS = `reading_set_id, type, sequence, citation, body_html, source_id, source_reference`;
const READING_VALUES = `'${ID.readingSet}', 'first', 1, 'Test 1:1', '<p>placeholder</p>', '${ID.source}', 'Placeholder ref'`;

describe('schema constraints (database)', () => {
  const client = new Client({ connectionString: loadEnvironment().database.migrationUrl });

  beforeAll(() => client.connect());
  afterAll(() => client.end());
  beforeEach(async () => {
    await client.query('BEGIN');
    await client.query(SEED);
  });
  afterEach(() => client.query('ROLLBACK'));

  // Returns the violated constraint's name, or the error message for trigger exceptions.
  async function violation(sql: string): Promise<string> {
    await client.query('SAVEPOINT attempt');
    try {
      await client.query(sql);
    } catch (error) {
      await client.query('ROLLBACK TO SAVEPOINT attempt');
      if (error instanceof DatabaseError) {
        return error.constraint ?? error.message;
      }
      throw error;
    }
    throw new Error(`Expected a constraint violation from: ${sql}`);
  }

  async function value(sql: string): Promise<unknown> {
    const { rows } = await client.query(sql);
    return Object.values(rows[0])[0];
  }

  describe('church hierarchy', () => {
    it('rejects a parish answerable to no diocese, institution or congregation', async () => {
      expect(
        await violation(
          `INSERT INTO parish (name, slug, state) VALUES ('Orphan', 'orphan', 'State')`,
        ),
      ).toBe('CHK_parish_has_authority');
    });

    it('accepts a chaplaincy with an institution and no diocese', async () => {
      await client.query(
        `INSERT INTO parish (name, slug, type, state, institution_id)
         VALUES ('Chaplaincy', 'chaplaincy', 'chaplaincy', 'State', '${ID.institution}')`,
      );
    });

    it('requires a chaplaincy to serve an institution and an outstation to have a parent', async () => {
      expect(
        await violation(
          `INSERT INTO parish (name, slug, type, state, diocese_id)
           VALUES ('Chap', 'chap', 'chaplaincy', 'State', '${ID.diocese}')`,
        ),
      ).toBe('CHK_parish_chaplaincy_has_institution');
      expect(
        await violation(
          `INSERT INTO parish (name, slug, type, state, diocese_id)
           VALUES ('Out', 'out', 'outstation', 'State', '${ID.diocese}')`,
        ),
      ).toBe('CHK_parish_outstation_has_parent');
    });

    it('generates the parish search vector', async () => {
      expect(
        await value(`SELECT search_vector::text FROM parish WHERE id = '${ID.parish}'`),
      ).toContain("'test':1A");
    });

    it('keeps a Mass schedule either weekly (0-6) or dated', async () => {
      expect(
        await violation(
          `INSERT INTO mass_schedule (parish_id, start_time, language, type)
           VALUES ('${ID.parish}', '07:00', 'english', 'sunday')`,
        ),
      ).toBe('CHK_mass_schedule_weekly_xor_dated');
      expect(
        await violation(
          `INSERT INTO mass_schedule (parish_id, day_of_week, start_time, language, type)
           VALUES ('${ID.parish}', 7, '07:00', 'english', 'sunday')`,
        ),
      ).toBe('CHK_mass_schedule_day_of_week_range');
    });

    it('allows one active parish priest and titles every "other" role', async () => {
      const contact = (role: string) =>
        `INSERT INTO parish_contact (parish_id, contact_group, role, full_name)
         VALUES ('${ID.parish}', 'clergy', '${role}', 'Placeholder')`;
      await client.query(contact('parish_priest'));
      expect(await violation(contact('parish_priest'))).toBe('UQ_parish_contact_one_parish_priest');
      expect(await violation(contact('other'))).toBe('CHK_parish_contact_other_role_titled');
      expect(await value(`SELECT is_public FROM parish_contact`)).toBe(false);
    });
  });

  describe('admin and audit', () => {
    const admin = (email: string, status = 'pending') =>
      `INSERT INTO admin_user (email, name, role, status) VALUES ('${email}', 'Placeholder', 'admin', '${status}')`;

    it('stores emails lowercase, unique among live admins only', async () => {
      expect(await violation(admin('Ada@test.invalid'))).toBe('CHK_admin_user_email_lowercase');
      await client.query(admin('ada@test.invalid'));
      expect(await violation(admin('ada@test.invalid'))).toBe('UQ_admin_user_active_email');
      await client.query(
        `UPDATE admin_user SET deleted_at = now() WHERE email = 'ada@test.invalid'`,
      );
      await client.query(admin('ada@test.invalid'));
    });

    it('requires a password once active, and a scope for diocese admins only', async () => {
      expect(await violation(admin('b@test.invalid', 'active'))).toBe(
        'CHK_admin_user_active_has_password',
      );
      expect(
        await violation(
          `INSERT INTO admin_user (email, name, role) VALUES ('c@test.invalid', 'C', 'diocese_admin')`,
        ),
      ).toBe('CHK_admin_user_scope_matches_role');
      expect(
        await violation(
          `INSERT INTO admin_user (email, name, role, diocese_scope_id)
           VALUES ('d@test.invalid', 'D', 'admin', '${ID.diocese}')`,
        ),
      ).toBe('CHK_admin_user_scope_matches_role');
    });

    it('keeps the audit log append-only', async () => {
      await client.query(
        `INSERT INTO audit_log (actor_type, action, entity_type) VALUES ('system', 'test', 'test')`,
      );
      expect(await violation(`UPDATE audit_log SET action = 'changed'`)).toBe(
        'audit_log is append-only',
      );
      expect(await violation(`DELETE FROM audit_log`)).toBe('audit_log is append-only');
    });
  });

  describe('media', () => {
    it('registers each object once per bucket, with a non-negative size, pending moderation', async () => {
      const asset = (key: string, size: number) =>
        `INSERT INTO media_asset (bucket, storage_key, kind, mime_type, size_bytes)
         VALUES ('bucket', '${key}', 'image', 'image/jpeg', ${size})`;
      expect(await violation(asset('test/file.xlsx', 1))).toMatch(/^UQ_/);
      expect(await violation(asset('test/other.jpg', -1))).toBe(
        'CHK_media_asset_size_non_negative',
      );
      expect(
        await value(`SELECT moderation_status FROM media_asset WHERE id = '${ID.media}'`),
      ).toBe('pending');
    });
  });

  describe('users and contributions', () => {
    it('matches app user credentials to the provider and frees emails on soft delete', async () => {
      expect(
        await violation(
          `INSERT INTO app_user (email, auth_provider) VALUES ('u@test.invalid', 'email')`,
        ),
      ).toBe('CHK_app_user_credentials');
      expect(await violation(`INSERT INTO app_user (auth_provider) VALUES ('google')`)).toBe(
        'CHK_app_user_credentials',
      );
      const user = `INSERT INTO app_user (email, auth_provider, password_hash) VALUES ('u@test.invalid', 'email', 'hash')`;
      await client.query(user);
      expect(await violation(user)).toBe('UQ_app_user_active_email');
      await client.query(`UPDATE app_user SET deleted_at = now()`);
      await client.query(user);
    });

    it('allows one unlisted-diocese vote per device', async () => {
      const vote = (name: string) =>
        `INSERT INTO diocese_interest (device_id, requested_name) VALUES ('${ID.device}', '${name}')`;
      await client.query(vote('Unlisted A'));
      expect(await violation(vote('Unlisted B'))).toBe(
        'UQ_diocese_interest_one_unlisted_per_device',
      );
    });

    it('accepts anonymous suggestions from a device but never from nobody', async () => {
      await client.query(
        `INSERT INTO submission (entity_type, operation, payload, submitter_device_id)
         VALUES ('parish', 'create', '{}', '${ID.device}')`,
      );
      expect(
        await violation(
          `INSERT INTO submission (entity_type, operation, payload) VALUES ('parish', 'create', '{}')`,
        ),
      ).toBe('CHK_submission_has_submitter');
      expect(
        await violation(
          `INSERT INTO submission (entity_type, operation, payload, submitter_device_id)
           VALUES ('parish', 'update', '{}', '${ID.device}')`,
        ),
      ).toBe('CHK_submission_target_for_change');
    });
  });

  describe('liturgical calendar and readings', () => {
    it('requires day_of_week to match the date', async () => {
      expect(
        await violation(
          `INSERT INTO liturgical_day (country_id, date, season, day_of_week, liturgical_color, import_id, source_reference)
           VALUES ('${ID.country}', '2099-03-04', 'ordinary', (extract(dow FROM date '2099-03-04')::int + 1) % 7,
                   'green', '${ID.ordoImport}', 'Placeholder ref')`,
        ),
      ).toBe('CHK_liturgical_day_day_of_week_matches_date');
    });

    it('allows one committed Ordo per year and one primary celebration per day', async () => {
      expect(
        await violation(
          `INSERT INTO liturgical_year_import
             (country_id, year_label, source_document, start_date, end_date, file_media_id, uploaded_by_admin_id, status)
           VALUES ('${ID.country}', 'TEST', 'Placeholder', '2099-01-01', '2099-12-31',
                   '${ID.media}', '${ID.proofreader}', 'committed')`,
        ),
      ).toBe('UQ_liturgical_year_import_one_committed');
      const celebration = `INSERT INTO celebration (liturgical_day_id, name, rank, precedence, is_primary)
                           VALUES ('${ID.day}', 'Placeholder', 'ferial', 1, true)`;
      await client.query(celebration);
      expect(await violation(celebration)).toBe('UQ_celebration_one_primary_per_day');
    });

    it('holds a vigil set and a day set on one date, but not two day sets', async () => {
      const daySet = `INSERT INTO reading_set (liturgical_day_id, mass_type) VALUES ('${ID.day}', 'day')`;
      await client.query(daySet);
      expect(await violation(daySet)).toBe('UQ_reading_set_one_uncycled_per_mass_type');
    });

    it('gates verification and super-admin overrides', async () => {
      expect(
        await violation(
          `INSERT INTO reading (${READING_COLUMNS}, verification_status, proofread_by_admin_id, proofread_at)
           VALUES (${READING_VALUES}, 'verified', '${ID.proofreader}', now())`,
        ),
      ).toBe('CHK_verification_verified_recorded');
      expect(
        await violation(
          `INSERT INTO reading (${READING_COLUMNS}, published_by_admin_id, published_at)
           VALUES (${READING_VALUES}, '${ID.verifier}', now())`,
        ),
      ).toBe('CHK_verification_override_has_reason');
    });

    it('accepts up to nine verified readings in one vigil set', async () => {
      await client.query(
        `INSERT INTO reading (reading_set_id, type, sequence, citation, body_html, source_id, source_reference,
                              verification_status, proofread_by_admin_id, proofread_at, verified_by_admin_id, verified_at)
         SELECT '${ID.readingSet}', CASE WHEN n <= 2 THEN 'first' ELSE 'additional' END::reading_type, n,
                'Test ' || n, '<p>placeholder</p>', '${ID.source}', 'Placeholder ref',
                'verified', '${ID.proofreader}', now(), '${ID.verifier}', now()
         FROM generate_series(1, 9) AS n`,
      );
      expect(await value(`SELECT count(*)::int FROM reading`)).toBe(9);
    });

    it('allows a psalm response only on psalms and a feast date only when complete', async () => {
      expect(
        await violation(
          `INSERT INTO reading (${READING_COLUMNS}, psalm_response)
           VALUES ('${ID.readingSet}', 'gospel', 1, 'Test 1:1', '<p>placeholder</p>', '${ID.source}', 'Placeholder ref', 'x')`,
        ),
      ).toBe('CHK_reading_psalm_response_only_on_psalm');
      expect(
        await violation(`INSERT INTO saint (name, feast_month) VALUES ('Placeholder', 5)`),
      ).toBe('CHK_saint_feast_date_complete');
    });
  });

  describe('extensibility spine and notification runtime', () => {
    it('ships modules hidden and generates the collection search vector', async () => {
      await client.query(
        `INSERT INTO app_module (key, title, icon, route, placement) VALUES ('test', 'Test', 'icon', '/test', 'drawer')`,
      );
      expect(await value(`SELECT is_enabled FROM app_module`)).toBe(false);
      expect(await value(`SELECT search_vector::text FROM content_collection`)).toContain(
        "'title':2A",
      );
    });

    it('bounds content item repeats and audio chapters', async () => {
      const item = (extra: string, values: string) =>
        `INSERT INTO content_item (collection_id, sequence, item_type, title${extra})
         VALUES ('${ID.collection}', 1, 'prayer', 'Placeholder'${values})`;
      expect(await violation(item(', repeat_count', ', 0'))).toBe(
        'CHK_content_item_repeat_count_positive',
      );
      expect(await violation(item(', audio_start_ms, audio_end_ms', ', 500, 100'))).toBe(
        'CHK_content_item_audio_range',
      );
    });

    it('keeps one subscription per device and topic, with non-negative lead days', async () => {
      const subscription = `INSERT INTO device_notification_subscription (device_id, topic_id)
                            VALUES ('${ID.device}', '${ID.topic}')`;
      await client.query(subscription);
      expect(await violation(subscription)).toMatch(/^UQ_/);
      expect(await violation(`UPDATE device_notification_subscription SET lead_days = -1`)).toBe(
        'CHK_device_notification_subscription_lead_days',
      );
    });

    it('records one receipt per notification and device, and one setting per key', async () => {
      const receipt = `INSERT INTO notification_receipt (scheduled_notification_id, device_id, status)
                       VALUES ('${ID.notification}', '${ID.device}', 'sent')`;
      await client.query(receipt);
      expect(await violation(receipt)).toMatch(/^UQ_/);
      const setting = `INSERT INTO app_setting (key, value_type) VALUES ('test_setting', 'bool')`;
      await client.query(setting);
      expect(await violation(setting)).toMatch(/^UQ_/);
    });
  });
});
