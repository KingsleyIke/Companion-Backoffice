import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncNotifications1792204291408 implements MigrationInterface {
  name = 'SyncNotifications1792204291408';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."scheduled_notification_status" AS ENUM(
                'scheduled',
                'processing',
                'sent',
                'failed',
                'cancelled'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "scheduled_notification" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "topic_id" uuid NOT NULL,
                "title" character varying(200) NOT NULL,
                "body" text NOT NULL,
                "data" jsonb,
                "target_criteria" jsonb,
                "scheduled_for" TIMESTAMP WITH TIME ZONE NOT NULL,
                "status" "public"."scheduled_notification_status" NOT NULL DEFAULT 'scheduled',
                "sent_count" integer NOT NULL DEFAULT '0',
                "failed_count" integer NOT NULL DEFAULT '0',
                CONSTRAINT "PK_0c7f6fe4bf988bd6fc01bee33bd" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_84122d1d1d3eda93f3657df1b2" ON "scheduled_notification" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_78b9aaeb8f9a3f94797d4d1608" ON "scheduled_notification" ("topic_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_7d102fc8decc37c6cc1dc5730d" ON "scheduled_notification" ("status", "scheduled_for")
        `);
    await queryRunner.query(`
            CREATE TABLE "notification_inbox_item" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "device_id" uuid NOT NULL,
                "scheduled_notification_id" uuid,
                "topic_id" uuid NOT NULL,
                "title" character varying(200) NOT NULL,
                "body" text NOT NULL,
                "icon" character varying(60),
                "deep_link" character varying(300),
                "read_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_5464a3bba8e5774096e9e3a4a79" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_3e146ba5cb248b00c34d2ca05b" ON "notification_inbox_item" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_9186e7b4cdcd0b75033157fff8" ON "notification_inbox_item" ("scheduled_notification_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_3d55529f876f8e668d34d49869" ON "notification_inbox_item" ("device_id", "read_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_b0ce56df6a8b3acd92d30cef5a" ON "notification_inbox_item" ("device_id", "deleted_at", "created_at")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."notification_receipt_status" AS ENUM('sent', 'failed', 'invalid_token')
        `);
    await queryRunner.query(`
            CREATE TABLE "notification_receipt" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "scheduled_notification_id" uuid NOT NULL,
                "device_id" uuid NOT NULL,
                "status" "public"."notification_receipt_status" NOT NULL,
                "error_code" character varying(80),
                "sent_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_2c131c15d67bbf91d59b793be7e" UNIQUE ("scheduled_notification_id", "device_id"),
                CONSTRAINT "PK_b0bb15b886420a6434d896db00a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_0cb9021cd87757694f5a3b674f" ON "notification_receipt" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_0b214f630aa787db5c319b8163" ON "notification_receipt" ("device_id")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."app_setting_value_type" AS ENUM('string', 'int', 'bool', 'json')
        `);
    await queryRunner.query(`
            CREATE TABLE "app_setting" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "key" character varying(80) NOT NULL,
                "value" text,
                "value_type" "public"."app_setting_value_type" NOT NULL,
                "description" character varying(300),
                "is_public" boolean NOT NULL DEFAULT false,
                "requires_super_admin" boolean NOT NULL DEFAULT false,
                CONSTRAINT "UQ_0d66bfb0d9f93124a4549d21af0" UNIQUE ("key"),
                CONSTRAINT "PK_10b1e1bf64917bdb640f8eedb31" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_2c7176a92e50c4d37bcbdbd5ec" ON "app_setting" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE TABLE "content_version" (
                "resource" character varying(60) NOT NULL,
                "version" bigint NOT NULL DEFAULT '0',
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_2aa200121ba8a26c7709593c06b" PRIMARY KEY ("resource")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "scheduled_notification"
            ADD CONSTRAINT "FK_78b9aaeb8f9a3f94797d4d16080" FOREIGN KEY ("topic_id") REFERENCES "notification_topic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "notification_inbox_item"
            ADD CONSTRAINT "FK_679ccd335f7ee1b5acaced4ed1a" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "notification_inbox_item"
            ADD CONSTRAINT "FK_9186e7b4cdcd0b75033157fff89" FOREIGN KEY ("scheduled_notification_id") REFERENCES "scheduled_notification"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "notification_inbox_item"
            ADD CONSTRAINT "FK_6aecf29fd48248a437caad61730" FOREIGN KEY ("topic_id") REFERENCES "notification_topic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "notification_receipt"
            ADD CONSTRAINT "FK_536c1bcf90648e21cdba7d1aea1" FOREIGN KEY ("scheduled_notification_id") REFERENCES "scheduled_notification"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "notification_receipt"
            ADD CONSTRAINT "FK_0b214f630aa787db5c319b8163b" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "notification_receipt" DROP CONSTRAINT "FK_0b214f630aa787db5c319b8163b"
        `);
    await queryRunner.query(`
            ALTER TABLE "notification_receipt" DROP CONSTRAINT "FK_536c1bcf90648e21cdba7d1aea1"
        `);
    await queryRunner.query(`
            ALTER TABLE "notification_inbox_item" DROP CONSTRAINT "FK_6aecf29fd48248a437caad61730"
        `);
    await queryRunner.query(`
            ALTER TABLE "notification_inbox_item" DROP CONSTRAINT "FK_9186e7b4cdcd0b75033157fff89"
        `);
    await queryRunner.query(`
            ALTER TABLE "notification_inbox_item" DROP CONSTRAINT "FK_679ccd335f7ee1b5acaced4ed1a"
        `);
    await queryRunner.query(`
            ALTER TABLE "scheduled_notification" DROP CONSTRAINT "FK_78b9aaeb8f9a3f94797d4d16080"
        `);
    await queryRunner.query(`
            DROP TABLE "content_version"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_2c7176a92e50c4d37bcbdbd5ec"
        `);
    await queryRunner.query(`
            DROP TABLE "app_setting"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."app_setting_value_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_0b214f630aa787db5c319b8163"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_0cb9021cd87757694f5a3b674f"
        `);
    await queryRunner.query(`
            DROP TABLE "notification_receipt"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."notification_receipt_status"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_b0ce56df6a8b3acd92d30cef5a"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_3d55529f876f8e668d34d49869"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_9186e7b4cdcd0b75033157fff8"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_3e146ba5cb248b00c34d2ca05b"
        `);
    await queryRunner.query(`
            DROP TABLE "notification_inbox_item"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_7d102fc8decc37c6cc1dc5730d"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_78b9aaeb8f9a3f94797d4d1608"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_84122d1d1d3eda93f3657df1b2"
        `);
    await queryRunner.query(`
            DROP TABLE "scheduled_notification"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."scheduled_notification_status"
        `);
  }
}
