import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChurchHierarchy1792198452485 implements MigrationInterface {
  name = 'ChurchHierarchy1792198452485';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "country" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "iso_code" character(2) NOT NULL,
                "name" character varying(80) NOT NULL,
                "default_locale" character varying(10) NOT NULL,
                "default_timezone" character varying(40) NOT NULL,
                "currency_code" character(3) NOT NULL,
                "is_active" boolean NOT NULL DEFAULT false,
                CONSTRAINT "UQ_d8a20ea179fa742827ea45f270e" UNIQUE ("iso_code"),
                CONSTRAINT "PK_bf6e37c231c4f4ea56dcd887269" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_83831d38c77f05d52d26c7a07f" ON "country" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE TABLE "ecclesiastical_province" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "country_id" uuid NOT NULL,
                "name" character varying(160) NOT NULL,
                "slug" character varying(180) NOT NULL,
                "metropolitan_see_id" uuid,
                CONSTRAINT "UQ_2a37e06ec8e78716588c55ed017" UNIQUE ("slug"),
                CONSTRAINT "PK_eccc568c29f4f7f5e2f96d07c6a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_aa2970d51f0d2f44a360e59f6e" ON "ecclesiastical_province" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_bb43b99bf8c6dbf5530d2fd1fa" ON "ecclesiastical_province" ("country_id")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."diocese_type" AS ENUM(
                'archdiocese',
                'diocese',
                'vicariate',
                'prefecture',
                'military_ordinariate'
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."diocese_publication_status" AS ENUM('hidden', 'in_progress', 'published')
        `);
    await queryRunner.query(`
            CREATE TABLE "diocese" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "country_id" uuid NOT NULL,
                "province_id" uuid,
                "name" character varying(160) NOT NULL,
                "slug" character varying(180) NOT NULL,
                "type" "public"."diocese_type" NOT NULL,
                "patron_saint" character varying(160),
                "bishop_name" character varying(160),
                "seat_city" character varying(120) NOT NULL,
                "state" character varying(120) NOT NULL,
                "established_date" date,
                "website" character varying(255),
                "email" character varying(254),
                "phone" character varying(32),
                "publication_status" "public"."diocese_publication_status" NOT NULL DEFAULT 'hidden',
                "published_at" TIMESTAMP WITH TIME ZONE,
                "verified_parish_count" integer NOT NULL DEFAULT '0',
                "coverage_note" character varying(200),
                "rollout_priority" smallint,
                "interest_count" integer NOT NULL DEFAULT '0',
                CONSTRAINT "UQ_d841944bcf383e1871b24aaad1a" UNIQUE ("slug"),
                CONSTRAINT "PK_127e06bea9068bdba2e4f7a8b29" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_94d23d9dcc7c87b1f5c8801511" ON "diocese" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_fcc565e13b0af919acda14f063" ON "diocese" ("province_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_28f63d4a1a08033f67d0c6e56b" ON "diocese" ("publication_status")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_bbc86fcb5bbc1b3be9455c43af" ON "diocese" ("country_id", "publication_status")
        `);
    await queryRunner.query(`
            CREATE TABLE "deanery" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "diocese_id" uuid NOT NULL,
                "name" character varying(160) NOT NULL,
                "slug" character varying(180) NOT NULL,
                CONSTRAINT "UQ_66d5bfe0e5d965ee5fe06a6351c" UNIQUE ("diocese_id", "slug"),
                CONSTRAINT "PK_f8d7c1754ce0d4ec96b3238d88a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_9724afc66a376b9969681e3ad3" ON "deanery" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."religious_institute_type" AS ENUM(
                'religious_order',
                'religious_congregation',
                'society_of_apostolic_life',
                'secular_institute'
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."religious_institute_membership" AS ENUM('men', 'women', 'mixed')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."record_status" AS ENUM('draft', 'published', 'archived')
        `);
    await queryRunner.query(`
            CREATE TABLE "religious_institute" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "name" character varying(200) NOT NULL,
                "slug" character varying(220) NOT NULL,
                "abbreviation" character varying(20),
                "institute_type" "public"."religious_institute_type" NOT NULL,
                "membership" "public"."religious_institute_membership" NOT NULL,
                "website" character varying(255),
                "email" character varying(254),
                "phone" character varying(32),
                "description" text,
                "status" "public"."record_status" NOT NULL DEFAULT 'draft',
                CONSTRAINT "UQ_2c6599642300c68a1572ee7d07f" UNIQUE ("slug"),
                CONSTRAINT "PK_5975bd4314aa113a8763652fe10" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_b9035b51fe0afdcf038637709c" ON "religious_institute" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."institution_type" AS ENUM(
                'seminary',
                'monastery',
                'convent',
                'religious_house',
                'school',
                'tertiary',
                'hospital',
                'military',
                'paramilitary',
                'correctional',
                'other'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "institution" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "name" character varying(200) NOT NULL,
                "slug" character varying(220) NOT NULL,
                "type" "public"."institution_type" NOT NULL,
                "diocese_id" uuid,
                "religious_institute_id" uuid,
                "affiliation" character varying(160),
                "city" character varying(120),
                "state" character varying(120) NOT NULL,
                "website" character varying(255),
                "email" character varying(254),
                "phone" character varying(32),
                "description" text,
                "status" "public"."record_status" NOT NULL DEFAULT 'draft',
                CONSTRAINT "UQ_eef02e265f84ceb9d48b88015f9" UNIQUE ("slug"),
                CONSTRAINT "PK_f60ee4ff0719b7df54830b39087" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_0124fa2475e1f461b8f5ae678d" ON "institution" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_829e3ef7ee5db8aed1a64a2545" ON "institution" ("type")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_fe0b664cb7a4d33fcd0bda8bc1" ON "institution" ("diocese_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_66a55d5eb05aea99783f49c63a" ON "institution" ("religious_institute_id")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."parish_type" AS ENUM(
                'parish',
                'outstation',
                'chaplaincy',
                'cathedral',
                'shrine',
                'chapel'
            )
        `);
    // Database and schema are resolved at run time because they differ between local Docker and
    // Supabase. The migration runner creates typeorm_metadata itself.
    await queryRunner.query(
      `
            INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value")
            VALUES (current_database(), current_schema(), 'parish', 'GENERATED_COLUMN', 'search_vector', $1)
        `,
      [
        "\n  setweight(to_tsvector('simple', coalesce(\"name\", '')), 'A') ||\n  setweight(to_tsvector('simple', coalesce(\"patron_saint\", '')), 'B') ||\n  setweight(to_tsvector('simple', coalesce(\"city\", '') || ' ' || coalesce(\"lga\", '') || ' ' || coalesce(\"state\", '')), 'C')",
      ],
    );
    await queryRunner.query(`
            CREATE TABLE "parish" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "diocese_id" uuid,
                "institution_id" uuid,
                "religious_institute_id" uuid,
                "deanery_id" uuid,
                "parent_parish_id" uuid,
                "name" character varying(200) NOT NULL,
                "slug" character varying(220) NOT NULL,
                "type" "public"."parish_type" NOT NULL DEFAULT 'parish',
                "patron_saint" character varying(160),
                "address_line" character varying(255),
                "city" character varying(120),
                "lga" character varying(120),
                "state" character varying(120) NOT NULL,
                "location" geography(Point, 4326),
                "phone" character varying(32),
                "email" character varying(254),
                "website" character varying(255),
                "established_date" date,
                "description" text,
                "status" "public"."record_status" NOT NULL DEFAULT 'draft',
                "search_vector" tsvector GENERATED ALWAYS AS (
                    setweight(to_tsvector('simple', coalesce("name", '')), 'A') || setweight(
                        to_tsvector('simple', coalesce("patron_saint", '')),
                        'B'
                    ) || setweight(
                        to_tsvector(
                            'simple',
                            coalesce("city", '') || ' ' || coalesce("lga", '') || ' ' || coalesce("state", '')
                        ),
                        'C'
                    )
                ) STORED NOT NULL,
                "verified_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_e64ef18925bfdc84e96a246235a" UNIQUE ("slug"),
                CONSTRAINT "CHK_parish_deanery_needs_diocese" CHECK (
                    "deanery_id" IS NULL
                    OR "diocese_id" IS NOT NULL
                ),
                CONSTRAINT "CHK_parish_chaplaincy_has_institution" CHECK (
                    "type" <> 'chaplaincy'
                    OR "institution_id" IS NOT NULL
                ),
                CONSTRAINT "CHK_parish_has_authority" CHECK (
                    "diocese_id" IS NOT NULL
                    OR "institution_id" IS NOT NULL
                    OR "religious_institute_id" IS NOT NULL
                ),
                CONSTRAINT "CHK_parish_outstation_has_parent" CHECK (
                    "type" <> 'outstation'
                    OR "parent_parish_id" IS NOT NULL
                ),
                CONSTRAINT "CHK_parish_not_own_parent" CHECK ("parent_parish_id" <> "id"),
                CONSTRAINT "PK_6a7a7075856309e2fb8a749b5d8" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_9896e9e74baaae6159ccdeb626" ON "parish" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_127317e29fc3c28c6aa257ab7c" ON "parish" ("institution_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_087233e75f53a749b06dfa0ef9" ON "parish" ("religious_institute_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_85811d2347af8c1c625cd4cee6" ON "parish" ("deanery_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_37e801bae49381e9035a268e57" ON "parish" ("parent_parish_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_788ac75946058983acafc2d1a1" ON "parish" USING gist ("location")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_6c74dceb11adf0224f7aeb5227" ON "parish" USING gin ("search_vector")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_8c1f20cc1cfb5e9f1c6de5aceb" ON "parish" ("diocese_id", "status")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."mass_language" AS ENUM(
                'english',
                'igbo',
                'yoruba',
                'hausa',
                'latin',
                'other'
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."mass_schedule_type" AS ENUM(
                'sunday',
                'weekday',
                'vigil',
                'holy_day',
                'adoration',
                'confession',
                'novena'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "mass_schedule" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "parish_id" uuid NOT NULL,
                "day_of_week" smallint,
                "specific_date" date,
                "start_time" TIME NOT NULL,
                "language" "public"."mass_language" NOT NULL,
                "type" "public"."mass_schedule_type" NOT NULL,
                "notes" character varying(255),
                "effective_from" date,
                "effective_to" date,
                CONSTRAINT "CHK_mass_schedule_effective_range" CHECK (
                    "effective_to" IS NULL
                    OR "effective_from" IS NULL
                    OR "effective_to" >= "effective_from"
                ),
                CONSTRAINT "CHK_mass_schedule_weekly_xor_dated" CHECK (
                    ("day_of_week" IS NULL) <> ("specific_date" IS NULL)
                ),
                CONSTRAINT "CHK_mass_schedule_day_of_week_range" CHECK (
                    "day_of_week" BETWEEN 0 AND 6
                ),
                CONSTRAINT "PK_58dab95f0e46cc78c936e3ca4d2" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_aa56f673511c072d3e4f291176" ON "mass_schedule" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_40f07fe562706fe300bd227882" ON "mass_schedule" ("parish_id", "day_of_week")
        `);
    await queryRunner.query(`
            CREATE TABLE "parish_activity" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "parish_id" uuid NOT NULL,
                "name" character varying(160) NOT NULL,
                "schedule_text" character varying(200) NOT NULL,
                "description" text,
                "category" character varying(80),
                "sort_order" smallint NOT NULL DEFAULT '0',
                CONSTRAINT "PK_d2362925ec56820f183bb75d707" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_bc91b1643f9746b8004c8ad833" ON "parish_activity" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_a06d9af62468ae160f67bd062b" ON "parish_activity" ("parish_id", "sort_order")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."parish_contact_group" AS ENUM('clergy', 'pastoral_team')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."parish_contact_role" AS ENUM(
                'parish_priest',
                'assistant_priest',
                'resident_priest',
                'chaplain',
                'rector',
                'catechist',
                'sacristan',
                'secretary',
                'other'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "parish_contact" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "parish_id" uuid NOT NULL,
                "contact_group" "public"."parish_contact_group" NOT NULL,
                "role" "public"."parish_contact_role" NOT NULL,
                "role_title" character varying(120),
                "full_name" character varying(160) NOT NULL,
                "phone" character varying(32),
                "email" character varying(254),
                "is_public" boolean NOT NULL DEFAULT false,
                "sort_order" smallint NOT NULL DEFAULT '0',
                CONSTRAINT "CHK_parish_contact_other_role_titled" CHECK (
                    "role" <> 'other'
                    OR "role_title" IS NOT NULL
                ),
                CONSTRAINT "PK_3e8abaf024ca4dc44fac00a311f" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_6d4cce8158d61f55731c405f83" ON "parish_contact" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_parish_contact_one_parish_priest" ON "parish_contact" ("parish_id")
            WHERE "role" = 'parish_priest'
                AND "deleted_at" IS NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_5cbc9da5ed9045d5729a7238bd" ON "parish_contact" ("parish_id", "contact_group", "sort_order")
        `);
    await queryRunner.query(`
            ALTER TABLE "ecclesiastical_province"
            ADD CONSTRAINT "FK_bb43b99bf8c6dbf5530d2fd1fab" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "ecclesiastical_province"
            ADD CONSTRAINT "FK_558f07fe9e637001925a86e334a" FOREIGN KEY ("metropolitan_see_id") REFERENCES "diocese"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "diocese"
            ADD CONSTRAINT "FK_c1edf54a9645977530445dd127a" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "diocese"
            ADD CONSTRAINT "FK_fcc565e13b0af919acda14f063c" FOREIGN KEY ("province_id") REFERENCES "ecclesiastical_province"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "deanery"
            ADD CONSTRAINT "FK_c1c0a3a2bc13a13e5f15cb59c92" FOREIGN KEY ("diocese_id") REFERENCES "diocese"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "institution"
            ADD CONSTRAINT "FK_fe0b664cb7a4d33fcd0bda8bc1a" FOREIGN KEY ("diocese_id") REFERENCES "diocese"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "institution"
            ADD CONSTRAINT "FK_66a55d5eb05aea99783f49c63ab" FOREIGN KEY ("religious_institute_id") REFERENCES "religious_institute"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "parish"
            ADD CONSTRAINT "FK_74d46a10f02af733424cc64b6f5" FOREIGN KEY ("diocese_id") REFERENCES "diocese"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "parish"
            ADD CONSTRAINT "FK_127317e29fc3c28c6aa257ab7c9" FOREIGN KEY ("institution_id") REFERENCES "institution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "parish"
            ADD CONSTRAINT "FK_087233e75f53a749b06dfa0ef98" FOREIGN KEY ("religious_institute_id") REFERENCES "religious_institute"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "parish"
            ADD CONSTRAINT "FK_85811d2347af8c1c625cd4cee69" FOREIGN KEY ("deanery_id") REFERENCES "deanery"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "parish"
            ADD CONSTRAINT "FK_37e801bae49381e9035a268e578" FOREIGN KEY ("parent_parish_id") REFERENCES "parish"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mass_schedule"
            ADD CONSTRAINT "FK_4b8debbca3beda4c65d93165e0e" FOREIGN KEY ("parish_id") REFERENCES "parish"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "parish_activity"
            ADD CONSTRAINT "FK_078faf3274133708ba2f6cd6ab2" FOREIGN KEY ("parish_id") REFERENCES "parish"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "parish_contact"
            ADD CONSTRAINT "FK_e9f39aa80237867c3f3c9ab8d80" FOREIGN KEY ("parish_id") REFERENCES "parish"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "parish_contact" DROP CONSTRAINT "FK_e9f39aa80237867c3f3c9ab8d80"
        `);
    await queryRunner.query(`
            ALTER TABLE "parish_activity" DROP CONSTRAINT "FK_078faf3274133708ba2f6cd6ab2"
        `);
    await queryRunner.query(`
            ALTER TABLE "mass_schedule" DROP CONSTRAINT "FK_4b8debbca3beda4c65d93165e0e"
        `);
    await queryRunner.query(`
            ALTER TABLE "parish" DROP CONSTRAINT "FK_37e801bae49381e9035a268e578"
        `);
    await queryRunner.query(`
            ALTER TABLE "parish" DROP CONSTRAINT "FK_85811d2347af8c1c625cd4cee69"
        `);
    await queryRunner.query(`
            ALTER TABLE "parish" DROP CONSTRAINT "FK_087233e75f53a749b06dfa0ef98"
        `);
    await queryRunner.query(`
            ALTER TABLE "parish" DROP CONSTRAINT "FK_127317e29fc3c28c6aa257ab7c9"
        `);
    await queryRunner.query(`
            ALTER TABLE "parish" DROP CONSTRAINT "FK_74d46a10f02af733424cc64b6f5"
        `);
    await queryRunner.query(`
            ALTER TABLE "institution" DROP CONSTRAINT "FK_66a55d5eb05aea99783f49c63ab"
        `);
    await queryRunner.query(`
            ALTER TABLE "institution" DROP CONSTRAINT "FK_fe0b664cb7a4d33fcd0bda8bc1a"
        `);
    await queryRunner.query(`
            ALTER TABLE "deanery" DROP CONSTRAINT "FK_c1c0a3a2bc13a13e5f15cb59c92"
        `);
    await queryRunner.query(`
            ALTER TABLE "diocese" DROP CONSTRAINT "FK_fcc565e13b0af919acda14f063c"
        `);
    await queryRunner.query(`
            ALTER TABLE "diocese" DROP CONSTRAINT "FK_c1edf54a9645977530445dd127a"
        `);
    await queryRunner.query(`
            ALTER TABLE "ecclesiastical_province" DROP CONSTRAINT "FK_558f07fe9e637001925a86e334a"
        `);
    await queryRunner.query(`
            ALTER TABLE "ecclesiastical_province" DROP CONSTRAINT "FK_bb43b99bf8c6dbf5530d2fd1fab"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_5cbc9da5ed9045d5729a7238bd"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."UQ_parish_contact_one_parish_priest"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_6d4cce8158d61f55731c405f83"
        `);
    await queryRunner.query(`
            DROP TABLE "parish_contact"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."parish_contact_role"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."parish_contact_group"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_a06d9af62468ae160f67bd062b"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_bc91b1643f9746b8004c8ad833"
        `);
    await queryRunner.query(`
            DROP TABLE "parish_activity"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_40f07fe562706fe300bd227882"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_aa56f673511c072d3e4f291176"
        `);
    await queryRunner.query(`
            DROP TABLE "mass_schedule"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."mass_schedule_type"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."mass_language"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_8c1f20cc1cfb5e9f1c6de5aceb"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_6c74dceb11adf0224f7aeb5227"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_788ac75946058983acafc2d1a1"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_37e801bae49381e9035a268e57"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_85811d2347af8c1c625cd4cee6"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_087233e75f53a749b06dfa0ef9"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_127317e29fc3c28c6aa257ab7c"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_9896e9e74baaae6159ccdeb626"
        `);
    await queryRunner.query(`
            DROP TABLE "parish"
        `);
    await queryRunner.query(`
            DELETE FROM "typeorm_metadata"
            WHERE "database" = current_database()
                AND "schema" = current_schema()
                AND "table" = 'parish'
                AND "type" = 'GENERATED_COLUMN'
                AND "name" = 'search_vector'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."parish_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_66a55d5eb05aea99783f49c63a"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_fe0b664cb7a4d33fcd0bda8bc1"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_829e3ef7ee5db8aed1a64a2545"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_0124fa2475e1f461b8f5ae678d"
        `);
    await queryRunner.query(`
            DROP TABLE "institution"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."institution_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_b9035b51fe0afdcf038637709c"
        `);
    await queryRunner.query(`
            DROP TABLE "religious_institute"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."record_status"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."religious_institute_membership"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."religious_institute_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_9724afc66a376b9969681e3ad3"
        `);
    await queryRunner.query(`
            DROP TABLE "deanery"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_bbc86fcb5bbc1b3be9455c43af"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_28f63d4a1a08033f67d0c6e56b"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_fcc565e13b0af919acda14f063"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_94d23d9dcc7c87b1f5c8801511"
        `);
    await queryRunner.query(`
            DROP TABLE "diocese"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."diocese_publication_status"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."diocese_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_bb43b99bf8c6dbf5530d2fd1fa"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_aa2970d51f0d2f44a360e59f6e"
        `);
    await queryRunner.query(`
            DROP TABLE "ecclesiastical_province"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_83831d38c77f05d52d26c7a07f"
        `);
    await queryRunner.query(`
            DROP TABLE "country"
        `);
  }
}
