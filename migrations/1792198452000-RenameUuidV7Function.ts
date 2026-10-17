import { MigrationInterface, QueryRunner } from 'typeorm';

// TypeORM's Postgres schema reader treats any default matching /^uuid_generate_v\d\(\)/ as its own
// uuid-ossp strategy and reports it as uuid_generate_v4(), so every migration:generate would rewrite
// every primary key default. A name outside that pattern keeps the diff clean.
export class RenameUuidV7Function1792198452000 implements MigrationInterface {
  name = 'RenameUuidV7Function1792198452000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER FUNCTION uuid_generate_v7() RENAME TO uuid_v7');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER FUNCTION uuid_v7() RENAME TO uuid_generate_v7');
  }
}
