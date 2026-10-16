import { MigrationInterface, QueryRunner } from 'typeorm';

export class UuidV7Function1792188701000 implements MigrationInterface {
  name = 'UuidV7Function1792188701000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Overwrites the first 48 bits of a random v4 UUID with the Unix epoch in
    // milliseconds, then sets bits 52 and 53 to turn version 4 into version 7 (RFC 9562).
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION uuid_generate_v7() RETURNS uuid
      LANGUAGE sql VOLATILE AS $$
        SELECT encode(
          set_bit(
            set_bit(
              overlay(uuid_send(gen_random_uuid())
                placing substring(int8send(floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint) FROM 3)
                FROM 1 FOR 6),
              52, 1),
            53, 1),
          'hex')::uuid
      $$
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP FUNCTION IF EXISTS uuid_generate_v7()');
  }
}
