import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReviewFixes1792205263530 implements MigrationInterface {
  name = 'ReviewFixes1792205263530';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Emails are unique among live rows only, so a soft-deleted account no longer blocks its address.
    await queryRunner.query(`
            ALTER TABLE "app_user" DROP CONSTRAINT "UQ_3fa909d0e37c531ebc237703391"
        `);
    await queryRunner.query(`
            ALTER TABLE "admin_user" DROP CONSTRAINT "UQ_840ac5cd67be99efa5cd989bf9f"
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_app_user_active_email" ON "app_user" ("email") WHERE "deleted_at" IS NULL
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_admin_user_active_email" ON "admin_user" ("email") WHERE "deleted_at" IS NULL
        `);
    // Hand-written rename: the generated version created an empty table and orphaned the old one.
    // Constraint and index names are renamed to the ones TypeORM derives from the new names.
    await queryRunner.query(`
            ALTER TABLE "bible_translation" RENAME TO "licensed_text_source"
        `);
    await queryRunner.query(`
            ALTER INDEX "IDX_b3636d3eb801fad6d7c4012747" RENAME TO "IDX_73584aa17d40988e1a8970319a"
        `);
    await queryRunner.query(`
            ALTER TABLE "licensed_text_source" RENAME CONSTRAINT "PK_bc6f4eed8789e966639420918a9" TO "PK_59e5869e2a4b2fef03f2494073a"
        `);
    await queryRunner.query(`
            ALTER TABLE "licensed_text_source" RENAME CONSTRAINT "UQ_9cc267da5ae6280d017a82290cd" TO "UQ_0f0b628f913af0e827df199d996"
        `);
    await queryRunner.query(`
            ALTER TABLE "licensed_text_source" RENAME CONSTRAINT "FK_20d72044ff5cde4db74ff281900" TO "FK_26b2f4e1f72c13bb5300bd65ca5"
        `);
    await queryRunner.query(`
            ALTER TABLE "licensed_text_source" RENAME CONSTRAINT "FK_e2b9a7ca550d257416072087b40" TO "FK_97a013498775ef54f3313f1385c"
        `);
    await queryRunner.query(`
            ALTER TABLE "reading" RENAME CONSTRAINT "FK_e2b8f21c7c0ddcd6b1a6ce66249" TO "FK_eb71c63eb701d5a8b788804cdce"
        `);
    await queryRunner.query(`
            ALTER TABLE "mass_proper" RENAME CONSTRAINT "FK_428fb217f2ddcba19de5f89bf13" TO "FK_e8171e73227abddd5959027bce3"
        `);
    await queryRunner.query(`
            ALTER TABLE "reading" RENAME COLUMN "translation_id" TO "source_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "mass_proper" RENAME COLUMN "translation_id" TO "source_id"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "mass_proper" RENAME COLUMN "source_id" TO "translation_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "reading" RENAME COLUMN "source_id" TO "translation_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "mass_proper" RENAME CONSTRAINT "FK_e8171e73227abddd5959027bce3" TO "FK_428fb217f2ddcba19de5f89bf13"
        `);
    await queryRunner.query(`
            ALTER TABLE "reading" RENAME CONSTRAINT "FK_eb71c63eb701d5a8b788804cdce" TO "FK_e2b8f21c7c0ddcd6b1a6ce66249"
        `);
    await queryRunner.query(`
            ALTER TABLE "licensed_text_source" RENAME CONSTRAINT "FK_97a013498775ef54f3313f1385c" TO "FK_e2b9a7ca550d257416072087b40"
        `);
    await queryRunner.query(`
            ALTER TABLE "licensed_text_source" RENAME CONSTRAINT "FK_26b2f4e1f72c13bb5300bd65ca5" TO "FK_20d72044ff5cde4db74ff281900"
        `);
    await queryRunner.query(`
            ALTER TABLE "licensed_text_source" RENAME CONSTRAINT "UQ_0f0b628f913af0e827df199d996" TO "UQ_9cc267da5ae6280d017a82290cd"
        `);
    await queryRunner.query(`
            ALTER TABLE "licensed_text_source" RENAME CONSTRAINT "PK_59e5869e2a4b2fef03f2494073a" TO "PK_bc6f4eed8789e966639420918a9"
        `);
    await queryRunner.query(`
            ALTER INDEX "IDX_73584aa17d40988e1a8970319a" RENAME TO "IDX_b3636d3eb801fad6d7c4012747"
        `);
    await queryRunner.query(`
            ALTER TABLE "licensed_text_source" RENAME TO "bible_translation"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."UQ_admin_user_active_email"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."UQ_app_user_active_email"
        `);
    await queryRunner.query(`
            ALTER TABLE "admin_user" ADD CONSTRAINT "UQ_840ac5cd67be99efa5cd989bf9f" UNIQUE ("email")
        `);
    await queryRunner.query(`
            ALTER TABLE "app_user" ADD CONSTRAINT "UQ_3fa909d0e37c531ebc237703391" UNIQUE ("email")
        `);
  }
}
