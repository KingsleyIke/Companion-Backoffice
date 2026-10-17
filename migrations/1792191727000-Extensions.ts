import { MigrationInterface, QueryRunner } from 'typeorm';

export class Extensions1792191727000 implements MigrationInterface {
  name = 'Extensions1792191727000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS postgis');
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP EXTENSION IF EXISTS pg_trgm');
    await queryRunner.query('DROP EXTENSION IF EXISTS postgis');
  }
}
