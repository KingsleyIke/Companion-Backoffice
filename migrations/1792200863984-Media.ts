import { MigrationInterface, QueryRunner } from 'typeorm';

export class Media1792200863984 implements MigrationInterface {
  name = 'Media1792200863984';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."media_kind" AS ENUM('image', 'audio', 'document')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."media_moderation_status" AS ENUM(
                'pending',
                'auto_passed',
                'auto_flagged',
                'approved',
                'rejected'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "media_asset" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "bucket" character varying(80) NOT NULL,
                "storage_key" character varying(300) NOT NULL,
                "kind" "public"."media_kind" NOT NULL,
                "mime_type" character varying(60) NOT NULL,
                "width" integer,
                "height" integer,
                "duration_ms" integer,
                "bitrate_kbps" smallint,
                "size_bytes" bigint NOT NULL,
                "blurhash" character varying(60),
                "variants" jsonb,
                "moderation_status" "public"."media_moderation_status" NOT NULL DEFAULT 'pending',
                "moderation_labels" jsonb,
                CONSTRAINT "UQ_bf485e5853b55b398ec6f38be94" UNIQUE ("bucket", "storage_key"),
                CONSTRAINT "CHK_media_asset_size_non_negative" CHECK ("size_bytes" >= 0),
                CONSTRAINT "PK_facd363e2bf84400ac44913a2f3" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_baf2a072785a43c44b8b53559b" ON "media_asset" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_5722c6de445d2e7473c5ce3c63" ON "media_asset" ("moderation_status")
        `);
    await queryRunner.query(`
            CREATE TABLE "parish_gallery_album" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "parish_id" uuid NOT NULL,
                "title" character varying(160) NOT NULL,
                "event_date" date,
                "cover_media_id" uuid,
                "sort_order" smallint NOT NULL DEFAULT '0',
                "status" "public"."record_status" NOT NULL DEFAULT 'draft',
                CONSTRAINT "PK_e63a579aa6ce90827be5e7131f1" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_1c70b8a65ed434c0e15064c38c" ON "parish_gallery_album" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_c5fc904eda9fac175fe59cd023" ON "parish_gallery_album" ("parish_id", "sort_order")
        `);
    await queryRunner.query(`
            CREATE TABLE "parish_gallery_item" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "parish_id" uuid NOT NULL,
                "album_id" uuid,
                "media_asset_id" uuid NOT NULL,
                "caption" character varying(300),
                "event_date" date,
                "sort_order" smallint NOT NULL DEFAULT '0',
                "status" "public"."record_status" NOT NULL DEFAULT 'draft',
                CONSTRAINT "PK_85e91bad92c748ca84f68762263" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_b6e0192f70dd6541c2dc433a60" ON "parish_gallery_item" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_c8f02a33f09fa2e3fdda15c039" ON "parish_gallery_item" ("album_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_37274f3e3ea6d283e6d52255e9" ON "parish_gallery_item" ("media_asset_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_b6f58720a70f285c7c01bf8a06" ON "parish_gallery_item" ("parish_id", "album_id", "sort_order")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."social_platform" AS ENUM(
                'facebook',
                'instagram',
                'x',
                'youtube',
                'tiktok',
                'whatsapp',
                'website',
                'other'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "parish_social_link" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "parish_id" uuid NOT NULL,
                "platform" "public"."social_platform" NOT NULL,
                "url" character varying(500) NOT NULL,
                "sort_order" smallint NOT NULL DEFAULT '0',
                CONSTRAINT "PK_5e6c21b0b0e5446c2fe9c822ad4" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_006198741c2ca654171519890c" ON "parish_social_link" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_8fbdec0d51fb7b31c0fc1c1689" ON "parish_social_link" ("parish_id", "sort_order")
        `);
    await queryRunner.query(`
            ALTER TABLE "diocese"
            ADD "logo_media_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "parish"
            ADD "cover_media_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "diocese"
            ADD CONSTRAINT "FK_5dcd58ed2bfdce7551b01126af9" FOREIGN KEY ("logo_media_id") REFERENCES "media_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "parish"
            ADD CONSTRAINT "FK_0c5317056afc3f20da9d36b88f8" FOREIGN KEY ("cover_media_id") REFERENCES "media_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "parish_gallery_album"
            ADD CONSTRAINT "FK_902ea18c30e4e5b33c522d514af" FOREIGN KEY ("parish_id") REFERENCES "parish"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "parish_gallery_album"
            ADD CONSTRAINT "FK_c5f7c444ff7702d77c1723cc2d2" FOREIGN KEY ("cover_media_id") REFERENCES "media_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "parish_gallery_item"
            ADD CONSTRAINT "FK_ed50fa00404e09454f251d9d034" FOREIGN KEY ("parish_id") REFERENCES "parish"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "parish_gallery_item"
            ADD CONSTRAINT "FK_c8f02a33f09fa2e3fdda15c0395" FOREIGN KEY ("album_id") REFERENCES "parish_gallery_album"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "parish_gallery_item"
            ADD CONSTRAINT "FK_37274f3e3ea6d283e6d52255e9e" FOREIGN KEY ("media_asset_id") REFERENCES "media_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "parish_social_link"
            ADD CONSTRAINT "FK_15551c1d774f3907974d88672b6" FOREIGN KEY ("parish_id") REFERENCES "parish"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "parish_social_link" DROP CONSTRAINT "FK_15551c1d774f3907974d88672b6"
        `);
    await queryRunner.query(`
            ALTER TABLE "parish_gallery_item" DROP CONSTRAINT "FK_37274f3e3ea6d283e6d52255e9e"
        `);
    await queryRunner.query(`
            ALTER TABLE "parish_gallery_item" DROP CONSTRAINT "FK_c8f02a33f09fa2e3fdda15c0395"
        `);
    await queryRunner.query(`
            ALTER TABLE "parish_gallery_item" DROP CONSTRAINT "FK_ed50fa00404e09454f251d9d034"
        `);
    await queryRunner.query(`
            ALTER TABLE "parish_gallery_album" DROP CONSTRAINT "FK_c5f7c444ff7702d77c1723cc2d2"
        `);
    await queryRunner.query(`
            ALTER TABLE "parish_gallery_album" DROP CONSTRAINT "FK_902ea18c30e4e5b33c522d514af"
        `);
    await queryRunner.query(`
            ALTER TABLE "parish" DROP CONSTRAINT "FK_0c5317056afc3f20da9d36b88f8"
        `);
    await queryRunner.query(`
            ALTER TABLE "diocese" DROP CONSTRAINT "FK_5dcd58ed2bfdce7551b01126af9"
        `);
    await queryRunner.query(`
            ALTER TABLE "parish" DROP COLUMN "cover_media_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "diocese" DROP COLUMN "logo_media_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_8fbdec0d51fb7b31c0fc1c1689"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_006198741c2ca654171519890c"
        `);
    await queryRunner.query(`
            DROP TABLE "parish_social_link"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."social_platform"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_b6f58720a70f285c7c01bf8a06"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_37274f3e3ea6d283e6d52255e9"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_c8f02a33f09fa2e3fdda15c039"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_b6e0192f70dd6541c2dc433a60"
        `);
    await queryRunner.query(`
            DROP TABLE "parish_gallery_item"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_c5fc904eda9fac175fe59cd023"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_1c70b8a65ed434c0e15064c38c"
        `);
    await queryRunner.query(`
            DROP TABLE "parish_gallery_album"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_5722c6de445d2e7473c5ce3c63"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_baf2a072785a43c44b8b53559b"
        `);
    await queryRunner.query(`
            DROP TABLE "media_asset"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."media_moderation_status"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."media_kind"
        `);
  }
}
