import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtensibilitySpine1792203400242 implements MigrationInterface {
  name = 'ExtensibilitySpine1792203400242';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."content_display_style" AS ENUM('list', 'grid', 'carousel')
        `);
    await queryRunner.query(`
            CREATE TABLE "content_category" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "parent_category_id" uuid,
                "name" character varying(120) NOT NULL,
                "slug" character varying(140) NOT NULL,
                "icon" character varying(60),
                "sort_order" smallint NOT NULL DEFAULT '0',
                "display_style" "public"."content_display_style" NOT NULL DEFAULT 'list',
                "country_id" uuid,
                CONSTRAINT "UQ_60f7095e299a708275a15787523" UNIQUE ("slug"),
                CONSTRAINT "PK_818b727b7f93a9952dc12cd526e" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_a864e6f096d62112f1f95bea9e" ON "content_category" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_6006bab237ac40a5f3c76c41d5" ON "content_category" ("parent_category_id", "sort_order")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."content_collection_type" AS ENUM(
                'prayer',
                'prayer_set',
                'rosary',
                'stations',
                'chaplet',
                'novena',
                'litany',
                'devotion',
                'article'
            )
        `);
    // Database and schema are resolved at run time because they differ between local Docker and
    // Supabase. The migration runner creates typeorm_metadata itself.
    await queryRunner.query(
      `
            INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value")
            VALUES (current_database(), current_schema(), 'content_collection', 'GENERATED_COLUMN', 'search_vector', $1)
        `,
      [
        "\n  setweight(to_tsvector('simple', coalesce(\"title\", '')), 'A') ||\n  setweight(to_tsvector('simple', coalesce(\"subtitle\", '')), 'B')",
      ],
    );
    await queryRunner.query(`
            CREATE TABLE "content_collection" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "category_id" uuid NOT NULL,
                "type" "public"."content_collection_type" NOT NULL,
                "slug" character varying(140) NOT NULL,
                "title" character varying(200) NOT NULL,
                "subtitle" character varying(200),
                "description_html" text,
                "is_sequential" boolean NOT NULL DEFAULT false,
                "supports_audio" boolean NOT NULL DEFAULT false,
                "audio_media_id" uuid,
                "cover_media_id" uuid,
                "estimated_minutes" smallint,
                "language" character varying(10) NOT NULL,
                "country_id" uuid,
                "liturgical_season" "public"."liturgical_season",
                "diocese_id" uuid,
                "days_of_week" jsonb,
                "parent_collection_id" uuid,
                "sort_order" smallint NOT NULL DEFAULT '0',
                "status" "public"."record_status" NOT NULL DEFAULT 'draft',
                "search_vector" tsvector GENERATED ALWAYS AS (
                    setweight(
                        to_tsvector('simple', coalesce("title", '')),
                        'A'
                    ) || setweight(
                        to_tsvector('simple', coalesce("subtitle", '')),
                        'B'
                    )
                ) STORED NOT NULL,
                CONSTRAINT "UQ_db7beba817bf6110bc1e8175482" UNIQUE ("slug"),
                CONSTRAINT "PK_d04118aee44829c43d00cc7012a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_5d0767159483421bbb58b5fc2a" ON "content_collection" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_fde55fec7bda3e127d0f334468" ON "content_collection" ("diocese_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_e3500cf95ca4db0c420bae270b" ON "content_collection" ("parent_collection_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_e767a6898f071d916ef0d9dddf" ON "content_collection" USING gin ("search_vector")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_5445d026b55e37533d03fdc5d4" ON "content_collection" ("type", "status")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_cd8c67e1648d6032bb56817c37" ON "content_collection" ("category_id", "sort_order")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."content_item_type" AS ENUM(
                'station',
                'mystery',
                'decade',
                'prayer',
                'reflection',
                'scripture',
                'antiphon',
                'response',
                'heading'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "content_item" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "collection_id" uuid NOT NULL,
                "parent_item_id" uuid,
                "sequence" smallint NOT NULL,
                "item_type" "public"."content_item_type" NOT NULL,
                "title" character varying(200) NOT NULL,
                "body_html" text,
                "reflection_html" text,
                "prayer_html" text,
                "response_text" character varying(300),
                "scripture_citation" character varying(120),
                "repeat_count" smallint NOT NULL DEFAULT '1',
                "image_media_id" uuid,
                "audio_media_id" uuid,
                "audio_start_ms" integer,
                "audio_end_ms" integer,
                "metadata" jsonb,
                CONSTRAINT "CHK_content_item_audio_range" CHECK (
                    "audio_start_ms" IS NULL
                    OR "audio_end_ms" IS NULL
                    OR "audio_end_ms" > "audio_start_ms"
                ),
                CONSTRAINT "CHK_content_item_repeat_count_positive" CHECK ("repeat_count" >= 1),
                CONSTRAINT "PK_65d05a7056f7b695c9473ce43b9" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_4b789a11317bfc67eda85013b9" ON "content_item" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_1e074ff725132fd63867bc4e4f" ON "content_item" ("collection_id", "item_type")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_4552a083c8594d134b37bed848" ON "content_item" ("collection_id", "parent_item_id", "sequence")
        `);
    await queryRunner.query(`
            CREATE TABLE "content_item_translation" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "item_id" uuid NOT NULL,
                "language" character varying(10) NOT NULL,
                "title" character varying(200),
                "body_html" text,
                "response_text" character varying(300),
                CONSTRAINT "UQ_020773fca902bf77d962a00e5cd" UNIQUE ("item_id", "language"),
                CONSTRAINT "PK_cd751fec4ddfa46b6ffb490438b" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_9af4ca49b29f827dc455c2085d" ON "content_item_translation" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."app_module_placement" AS ENUM(
                'home_primary',
                'home_secondary',
                'drawer',
                'bottom_nav'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "app_module" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "key" character varying(60) NOT NULL,
                "title" character varying(120) NOT NULL,
                "subtitle" character varying(160),
                "icon" character varying(60) NOT NULL,
                "route" character varying(120) NOT NULL,
                "placement" "public"."app_module_placement" NOT NULL,
                "sort_order" smallint NOT NULL DEFAULT '0',
                "is_enabled" boolean NOT NULL DEFAULT false,
                "badge_text" character varying(20),
                "min_app_version" character varying(20),
                "country_id" uuid,
                CONSTRAINT "UQ_7becb7940d6125655fab053b4f1" UNIQUE ("key"),
                CONSTRAINT "PK_9920ae910a4692b40f37154cacc" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_dd2120566a4fd12f8d3c7d4008" ON "app_module" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_df69046017e618b2117d9304b3" ON "app_module" ("placement", "sort_order")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."notification_category" AS ENUM('liturgical', 'devotional', 'parish', 'system')
        `);
    await queryRunner.query(`
            CREATE TABLE "notification_topic" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "key" character varying(60) NOT NULL,
                "name" character varying(120) NOT NULL,
                "description" character varying(300),
                "category" "public"."notification_category" NOT NULL,
                "default_enabled" boolean NOT NULL DEFAULT false,
                "supports_time" boolean NOT NULL DEFAULT false,
                "supports_lead_days" boolean NOT NULL DEFAULT false,
                "supports_frequency" boolean NOT NULL DEFAULT false,
                "supports_rank_threshold" boolean NOT NULL DEFAULT false,
                "sort_order" smallint NOT NULL DEFAULT '0',
                "min_app_version" character varying(20),
                CONSTRAINT "UQ_d21d98427faf2f18783068de703" UNIQUE ("key"),
                CONSTRAINT "PK_85d716e16399718ae28c73c0fbd" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_776e691776309dd776bc85d74e" ON "notification_topic" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_ff367ce0dc0073c9e90a53f319" ON "notification_topic" ("category", "sort_order")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."notification_frequency" AS ENUM('daily', 'weekly', 'custom')
        `);
    await queryRunner.query(`
            CREATE TABLE "device_notification_subscription" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "device_id" uuid NOT NULL,
                "topic_id" uuid NOT NULL,
                "enabled" boolean NOT NULL DEFAULT true,
                "delivery_time" TIME,
                "lead_days" smallint,
                "frequency" "public"."notification_frequency",
                "rank_threshold" "public"."celebration_rank",
                "days_of_week" jsonb,
                "sound_enabled" boolean NOT NULL DEFAULT true,
                "settings" jsonb,
                CONSTRAINT "UQ_86e300499e7babefb9fbd626992" UNIQUE ("device_id", "topic_id"),
                CONSTRAINT "CHK_device_notification_subscription_lead_days" CHECK ("lead_days" >= 0),
                CONSTRAINT "PK_a62519c688ea0771bf2e4d6590e" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_09e8138b500632ed333d933d7c" ON "device_notification_subscription" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_d25bd8f77a00ad0f277448fafe" ON "device_notification_subscription" ("topic_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "content_category"
            ADD CONSTRAINT "FK_d635ccbcb9d352c4069db6f4955" FOREIGN KEY ("parent_category_id") REFERENCES "content_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "content_category"
            ADD CONSTRAINT "FK_6998ed4577665eefe393119b7e9" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "content_collection"
            ADD CONSTRAINT "FK_6d334c30f4e896801ec2d3da55b" FOREIGN KEY ("category_id") REFERENCES "content_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "content_collection"
            ADD CONSTRAINT "FK_a802978824ee70c775eb7fcabaa" FOREIGN KEY ("audio_media_id") REFERENCES "media_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "content_collection"
            ADD CONSTRAINT "FK_89bac11f94cb959f1ba5286e1bc" FOREIGN KEY ("cover_media_id") REFERENCES "media_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "content_collection"
            ADD CONSTRAINT "FK_1689e8fcf00503d6077139a028c" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "content_collection"
            ADD CONSTRAINT "FK_fde55fec7bda3e127d0f334468a" FOREIGN KEY ("diocese_id") REFERENCES "diocese"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "content_collection"
            ADD CONSTRAINT "FK_e3500cf95ca4db0c420bae270be" FOREIGN KEY ("parent_collection_id") REFERENCES "content_collection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "content_item"
            ADD CONSTRAINT "FK_3851e1585d40e00ec2c82c59d49" FOREIGN KEY ("collection_id") REFERENCES "content_collection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "content_item"
            ADD CONSTRAINT "FK_bdc6988a348f8e96f8686271efd" FOREIGN KEY ("parent_item_id") REFERENCES "content_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "content_item"
            ADD CONSTRAINT "FK_e7cb47444ebd9e61d8f7df574c8" FOREIGN KEY ("image_media_id") REFERENCES "media_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "content_item"
            ADD CONSTRAINT "FK_f22b149eb9dd77832fd6688808a" FOREIGN KEY ("audio_media_id") REFERENCES "media_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "content_item_translation"
            ADD CONSTRAINT "FK_a58e7be6ab8697ae8d23e847214" FOREIGN KEY ("item_id") REFERENCES "content_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "app_module"
            ADD CONSTRAINT "FK_541ec5ca59a93d668e966cca7cd" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "device_notification_subscription"
            ADD CONSTRAINT "FK_6d8ef062e133759850819748ff5" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "device_notification_subscription"
            ADD CONSTRAINT "FK_d25bd8f77a00ad0f277448fafe9" FOREIGN KEY ("topic_id") REFERENCES "notification_topic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "device_notification_subscription" DROP CONSTRAINT "FK_d25bd8f77a00ad0f277448fafe9"
        `);
    await queryRunner.query(`
            ALTER TABLE "device_notification_subscription" DROP CONSTRAINT "FK_6d8ef062e133759850819748ff5"
        `);
    await queryRunner.query(`
            ALTER TABLE "app_module" DROP CONSTRAINT "FK_541ec5ca59a93d668e966cca7cd"
        `);
    await queryRunner.query(`
            ALTER TABLE "content_item_translation" DROP CONSTRAINT "FK_a58e7be6ab8697ae8d23e847214"
        `);
    await queryRunner.query(`
            ALTER TABLE "content_item" DROP CONSTRAINT "FK_f22b149eb9dd77832fd6688808a"
        `);
    await queryRunner.query(`
            ALTER TABLE "content_item" DROP CONSTRAINT "FK_e7cb47444ebd9e61d8f7df574c8"
        `);
    await queryRunner.query(`
            ALTER TABLE "content_item" DROP CONSTRAINT "FK_bdc6988a348f8e96f8686271efd"
        `);
    await queryRunner.query(`
            ALTER TABLE "content_item" DROP CONSTRAINT "FK_3851e1585d40e00ec2c82c59d49"
        `);
    await queryRunner.query(`
            ALTER TABLE "content_collection" DROP CONSTRAINT "FK_e3500cf95ca4db0c420bae270be"
        `);
    await queryRunner.query(`
            ALTER TABLE "content_collection" DROP CONSTRAINT "FK_fde55fec7bda3e127d0f334468a"
        `);
    await queryRunner.query(`
            ALTER TABLE "content_collection" DROP CONSTRAINT "FK_1689e8fcf00503d6077139a028c"
        `);
    await queryRunner.query(`
            ALTER TABLE "content_collection" DROP CONSTRAINT "FK_89bac11f94cb959f1ba5286e1bc"
        `);
    await queryRunner.query(`
            ALTER TABLE "content_collection" DROP CONSTRAINT "FK_a802978824ee70c775eb7fcabaa"
        `);
    await queryRunner.query(`
            ALTER TABLE "content_collection" DROP CONSTRAINT "FK_6d334c30f4e896801ec2d3da55b"
        `);
    await queryRunner.query(`
            ALTER TABLE "content_category" DROP CONSTRAINT "FK_6998ed4577665eefe393119b7e9"
        `);
    await queryRunner.query(`
            ALTER TABLE "content_category" DROP CONSTRAINT "FK_d635ccbcb9d352c4069db6f4955"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_d25bd8f77a00ad0f277448fafe"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_09e8138b500632ed333d933d7c"
        `);
    await queryRunner.query(`
            DROP TABLE "device_notification_subscription"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."notification_frequency"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_ff367ce0dc0073c9e90a53f319"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_776e691776309dd776bc85d74e"
        `);
    await queryRunner.query(`
            DROP TABLE "notification_topic"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."notification_category"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_df69046017e618b2117d9304b3"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_dd2120566a4fd12f8d3c7d4008"
        `);
    await queryRunner.query(`
            DROP TABLE "app_module"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."app_module_placement"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_9af4ca49b29f827dc455c2085d"
        `);
    await queryRunner.query(`
            DROP TABLE "content_item_translation"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_4552a083c8594d134b37bed848"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_1e074ff725132fd63867bc4e4f"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_4b789a11317bfc67eda85013b9"
        `);
    await queryRunner.query(`
            DROP TABLE "content_item"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."content_item_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_cd8c67e1648d6032bb56817c37"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_5445d026b55e37533d03fdc5d4"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_e767a6898f071d916ef0d9dddf"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_e3500cf95ca4db0c420bae270b"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_fde55fec7bda3e127d0f334468"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_5d0767159483421bbb58b5fc2a"
        `);
    await queryRunner.query(`
            DROP TABLE "content_collection"
        `);
    await queryRunner.query(`
            DELETE FROM "typeorm_metadata"
            WHERE "database" = current_database()
                AND "schema" = current_schema()
                AND "table" = 'content_collection'
                AND "type" = 'GENERATED_COLUMN'
                AND "name" = 'search_vector'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."content_collection_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_6006bab237ac40a5f3c76c41d5"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_a864e6f096d62112f1f95bea9e"
        `);
    await queryRunner.query(`
            DROP TABLE "content_category"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."content_display_style"
        `);
  }
}
