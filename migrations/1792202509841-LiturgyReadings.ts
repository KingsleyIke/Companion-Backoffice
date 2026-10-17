import { MigrationInterface, QueryRunner } from 'typeorm';

export class LiturgyReadings1792202509841 implements MigrationInterface {
  name = 'LiturgyReadings1792202509841';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."text_source_kind" AS ENUM('lectionary', 'missal')
        `);
    await queryRunner.query(`
            CREATE TABLE "bible_translation" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "country_id" uuid NOT NULL,
                "source_kind" "public"."text_source_kind" NOT NULL,
                "name" character varying(160) NOT NULL,
                "abbreviation" character varying(20) NOT NULL,
                "licence_holder" character varying(160) NOT NULL,
                "licence_reference" character varying(160),
                "permission_document_media_id" uuid,
                "is_approved_lectionary" boolean NOT NULL DEFAULT false,
                CONSTRAINT "UQ_9cc267da5ae6280d017a82290cd" UNIQUE ("country_id", "abbreviation"),
                CONSTRAINT "PK_bc6f4eed8789e966639420918a9" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_b3636d3eb801fad6d7c4012747" ON "bible_translation" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."import_status" AS ENUM(
                'uploaded',
                'validated',
                'committed',
                'rolled_back',
                'failed'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "liturgical_year_import" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "country_id" uuid NOT NULL,
                "year_label" character varying(20) NOT NULL,
                "source_document" character varying(160) NOT NULL,
                "start_date" date NOT NULL,
                "end_date" date NOT NULL,
                "file_media_id" uuid NOT NULL,
                "uploaded_by_admin_id" uuid NOT NULL,
                "row_count" integer NOT NULL DEFAULT '0',
                "inserted_count" integer NOT NULL DEFAULT '0',
                "updated_count" integer NOT NULL DEFAULT '0',
                "status" "public"."import_status" NOT NULL DEFAULT 'uploaded',
                "error_report" jsonb,
                "committed_at" TIMESTAMP WITH TIME ZONE,
                "rolled_back_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "CHK_liturgical_year_import_date_range" CHECK ("end_date" >= "start_date"),
                CONSTRAINT "PK_99cd7dedab92700a50031b4f79a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_12b1ff4c81afcc142a57542497" ON "liturgical_year_import" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_liturgical_year_import_one_committed" ON "liturgical_year_import" ("country_id", "year_label")
            WHERE "status" = 'committed'
                AND "deleted_at" IS NULL
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."liturgical_season" AS ENUM(
                'advent',
                'christmas',
                'ordinary',
                'lent',
                'triduum',
                'easter'
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."sunday_cycle" AS ENUM('A', 'B', 'C')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."weekday_cycle" AS ENUM('I', 'II')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."liturgical_color" AS ENUM(
                'green',
                'white',
                'red',
                'violet',
                'rose',
                'black',
                'gold'
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."rosary_mystery_set" AS ENUM('joyful', 'luminous', 'sorrowful', 'glorious')
        `);
    await queryRunner.query(`
            CREATE TABLE "liturgical_day" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "country_id" uuid NOT NULL,
                "date" date NOT NULL,
                "season" "public"."liturgical_season" NOT NULL,
                "week_of_season" smallint,
                "day_of_week" smallint NOT NULL,
                "sunday_cycle" "public"."sunday_cycle",
                "weekday_cycle" "public"."weekday_cycle",
                "liturgical_color" "public"."liturgical_color" NOT NULL,
                "rosary_mystery_set" "public"."rosary_mystery_set",
                "is_holy_day_of_obligation" boolean NOT NULL DEFAULT false,
                "import_id" uuid NOT NULL,
                "source_reference" character varying(160) NOT NULL,
                CONSTRAINT "UQ_a155c03c605e052cefa2f42812f" UNIQUE ("country_id", "date"),
                CONSTRAINT "CHK_liturgical_day_day_of_week_matches_date" CHECK (
                    "day_of_week" = extract(
                        dow
                        FROM "date"
                    )
                ),
                CONSTRAINT "PK_eb2fa94495a11266d632eec4b08" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_5dc55f3f799eec4272a6c4d832" ON "liturgical_day" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_70e84ef7d44c08c380c7f094b0" ON "liturgical_day" ("import_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "saint" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "name" character varying(200) NOT NULL,
                "feast_month" smallint,
                "feast_day" smallint,
                "biography" text,
                "patronage" character varying(300),
                "birth_year" smallint,
                "death_year" smallint,
                "canonization_date" date,
                "image_media_id" uuid,
                "status" "public"."record_status" NOT NULL DEFAULT 'draft',
                CONSTRAINT "CHK_saint_feast_date_range" CHECK (
                    "feast_month" BETWEEN 1 AND 12
                    AND "feast_day" BETWEEN 1 AND 31
                ),
                CONSTRAINT "CHK_saint_feast_date_complete" CHECK (("feast_month" IS NULL) = ("feast_day" IS NULL)),
                CONSTRAINT "PK_fe89dccbfdbe833b6121077252b" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_c641dd934ab26d167a14988331" ON "saint" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."celebration_rank" AS ENUM(
                'solemnity',
                'feast',
                'memorial',
                'optional_memorial',
                'ferial'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "celebration" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "liturgical_day_id" uuid NOT NULL,
                "name" character varying(200) NOT NULL,
                "rank" "public"."celebration_rank" NOT NULL,
                "precedence" smallint NOT NULL,
                "saint_id" uuid,
                "is_proper_to_country" boolean NOT NULL DEFAULT false,
                "liturgical_color" "public"."liturgical_color",
                "is_primary" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_440e18e029c21ed9588bac619ef" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_78b192268fe43059d116d94861" ON "celebration" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_04e1de9ee0454b0365b8ae178c" ON "celebration" ("saint_id")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_celebration_one_primary_per_day" ON "celebration" ("liturgical_day_id")
            WHERE "is_primary"
                AND "deleted_at" IS NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_66ecdb11f5fffe89a494f59582" ON "celebration" ("liturgical_day_id", "precedence")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."verification_status" AS ENUM('draft', 'ocr_raw', 'proofread', 'verified')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."mass_type" AS ENUM('day', 'vigil', 'night', 'dawn', 'ritual')
        `);
    await queryRunner.query(`
            CREATE TABLE "reading_set" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "verification_status" "public"."verification_status" NOT NULL DEFAULT 'draft',
                "proofread_by_admin_id" uuid,
                "proofread_at" TIMESTAMP WITH TIME ZONE,
                "verified_by_admin_id" uuid,
                "verified_at" TIMESTAMP WITH TIME ZONE,
                "published_by_admin_id" uuid,
                "published_at" TIMESTAMP WITH TIME ZONE,
                "override_reason" text,
                "liturgical_day_id" uuid NOT NULL,
                "celebration_id" uuid,
                "mass_type" "public"."mass_type" NOT NULL,
                "cycle" character varying(2),
                "label" character varying(120),
                "has_second_reading" boolean NOT NULL DEFAULT false,
                "reflection_html" text,
                "personal_devotion_html" text,
                "sort_order" smallint NOT NULL DEFAULT '0',
                CONSTRAINT "UQ_6273e6a7d6ebadba61dda273c1d" UNIQUE ("liturgical_day_id", "mass_type", "cycle"),
                CONSTRAINT "CHK_verification_override_has_reason" CHECK (
                    "published_by_admin_id" IS NULL
                    OR (
                        "published_at" IS NOT NULL
                        AND "override_reason" IS NOT NULL
                    )
                ),
                CONSTRAINT "CHK_verification_verified_recorded" CHECK (
                    "verification_status" <> 'verified'
                    OR (
                        "verified_by_admin_id" IS NOT NULL
                        AND "verified_at" IS NOT NULL
                    )
                ),
                CONSTRAINT "CHK_verification_proofread_recorded" CHECK (
                    "verification_status" NOT IN ('proofread', 'verified')
                    OR (
                        "proofread_by_admin_id" IS NOT NULL
                        AND "proofread_at" IS NOT NULL
                    )
                ),
                CONSTRAINT "PK_56498b69f17cc9c96c35a7a5a46" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_879e641440afa10fc7c5021e87" ON "reading_set" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_499f24d55fe8436b79ce103759" ON "reading_set" ("verification_status")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_5cde29e50e0cc49c701ac2aec6" ON "reading_set" ("celebration_id")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_reading_set_one_uncycled_per_mass_type" ON "reading_set" ("liturgical_day_id", "mass_type")
            WHERE "cycle" IS NULL
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."mass_proper_type" AS ENUM(
                'entrance_antiphon',
                'collect',
                'prayer_after_communion',
                'offertory',
                'communion_antiphon'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "mass_proper" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "verification_status" "public"."verification_status" NOT NULL DEFAULT 'draft',
                "proofread_by_admin_id" uuid,
                "proofread_at" TIMESTAMP WITH TIME ZONE,
                "verified_by_admin_id" uuid,
                "verified_at" TIMESTAMP WITH TIME ZONE,
                "published_by_admin_id" uuid,
                "published_at" TIMESTAMP WITH TIME ZONE,
                "override_reason" text,
                "reading_set_id" uuid NOT NULL,
                "type" "public"."mass_proper_type" NOT NULL,
                "body_html" text NOT NULL,
                "translation_id" uuid NOT NULL,
                "source_reference" character varying(160),
                CONSTRAINT "UQ_2d4d45da04e91e9cafbc19b8242" UNIQUE ("reading_set_id", "type"),
                CONSTRAINT "CHK_verification_override_has_reason" CHECK (
                    "published_by_admin_id" IS NULL
                    OR (
                        "published_at" IS NOT NULL
                        AND "override_reason" IS NOT NULL
                    )
                ),
                CONSTRAINT "CHK_verification_verified_recorded" CHECK (
                    "verification_status" <> 'verified'
                    OR (
                        "verified_by_admin_id" IS NOT NULL
                        AND "verified_at" IS NOT NULL
                    )
                ),
                CONSTRAINT "CHK_verification_proofread_recorded" CHECK (
                    "verification_status" NOT IN ('proofread', 'verified')
                    OR (
                        "proofread_by_admin_id" IS NOT NULL
                        AND "proofread_at" IS NOT NULL
                    )
                ),
                CONSTRAINT "PK_a07e5f0366425f7d672077aa2b1" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_3af385343f75ebceebbe99ba0c" ON "mass_proper" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_b114dab3bdee0cee850b4e99cc" ON "mass_proper" ("verification_status")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."import_format" AS ENUM('xlsx', 'csv', 'json', 'docx')
        `);
    await queryRunner.query(`
            CREATE TABLE "reading_import_batch" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "filename" character varying(260) NOT NULL,
                "format" "public"."import_format" NOT NULL,
                "source_reference" character varying(200) NOT NULL,
                "file_media_id" uuid NOT NULL,
                "uploaded_by_admin_id" uuid NOT NULL,
                "date_range_start" date NOT NULL,
                "date_range_end" date NOT NULL,
                "row_count" integer NOT NULL DEFAULT '0',
                "inserted_count" integer NOT NULL DEFAULT '0',
                "updated_count" integer NOT NULL DEFAULT '0',
                "skipped_count" integer NOT NULL DEFAULT '0',
                "status" "public"."import_status" NOT NULL DEFAULT 'uploaded',
                "error_report" jsonb,
                "committed_at" TIMESTAMP WITH TIME ZONE,
                "rolled_back_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "CHK_reading_import_batch_date_range" CHECK ("date_range_end" >= "date_range_start"),
                CONSTRAINT "PK_9f3982363545797427592228c52" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_b954de54523367bf13db31561e" ON "reading_import_batch" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_5900ea2b431b3d1a36df121a66" ON "reading_import_batch" ("date_range_start", "date_range_end")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_44d3c9ca2f0c6c8f3327b5c53d" ON "reading_import_batch" ("status", "created_at")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."reading_type" AS ENUM(
                'first',
                'psalm',
                'second',
                'additional',
                'acclamation',
                'gospel',
                'sequence'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "reading" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "verification_status" "public"."verification_status" NOT NULL DEFAULT 'draft',
                "proofread_by_admin_id" uuid,
                "proofread_at" TIMESTAMP WITH TIME ZONE,
                "verified_by_admin_id" uuid,
                "verified_at" TIMESTAMP WITH TIME ZONE,
                "published_by_admin_id" uuid,
                "published_at" TIMESTAMP WITH TIME ZONE,
                "override_reason" text,
                "reading_set_id" uuid NOT NULL,
                "type" "public"."reading_type" NOT NULL,
                "sequence" smallint NOT NULL,
                "citation" character varying(120) NOT NULL,
                "heading" character varying(200),
                "intro_line" character varying(240),
                "title" character varying(240),
                "closing_line" character varying(120),
                "body_html" text NOT NULL,
                "psalm_response" character varying(300),
                "is_shorter_form" boolean NOT NULL DEFAULT false,
                "translation_id" uuid NOT NULL,
                "audio_media_id" uuid,
                "import_batch_id" uuid,
                "source_reference" character varying(160) NOT NULL,
                CONSTRAINT "UQ_90ab2ddbb658024bbe7e3759378" UNIQUE ("reading_set_id", "sequence", "is_shorter_form"),
                CONSTRAINT "CHK_verification_override_has_reason" CHECK (
                    "published_by_admin_id" IS NULL
                    OR (
                        "published_at" IS NOT NULL
                        AND "override_reason" IS NOT NULL
                    )
                ),
                CONSTRAINT "CHK_verification_verified_recorded" CHECK (
                    "verification_status" <> 'verified'
                    OR (
                        "verified_by_admin_id" IS NOT NULL
                        AND "verified_at" IS NOT NULL
                    )
                ),
                CONSTRAINT "CHK_verification_proofread_recorded" CHECK (
                    "verification_status" NOT IN ('proofread', 'verified')
                    OR (
                        "proofread_by_admin_id" IS NOT NULL
                        AND "proofread_at" IS NOT NULL
                    )
                ),
                CONSTRAINT "CHK_reading_psalm_response_only_on_psalm" CHECK (
                    "type" = 'psalm'
                    OR "psalm_response" IS NULL
                ),
                CONSTRAINT "PK_f46a902bd4c9624c8b512174944" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_ba45f1b8072eaada5055713517" ON "reading" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_42aaf07ddab73ee40f51ba7e64" ON "reading" ("verification_status")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_9f3982363545797427592228c5" ON "reading" ("import_batch_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "psalm_stanza" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "reading_id" uuid NOT NULL,
                "sequence" smallint NOT NULL,
                "body_html" text NOT NULL,
                CONSTRAINT "UQ_4bf6f31c16a27503ad4537638e8" UNIQUE ("reading_id", "sequence"),
                CONSTRAINT "PK_96d0d4f45ab3ac368d152e26671" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_7934f8729d331f3d005306b31f" ON "psalm_stanza" ("updated_at")
        `);
    await queryRunner.query(`
            ALTER TABLE "bible_translation"
            ADD CONSTRAINT "FK_20d72044ff5cde4db74ff281900" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "bible_translation"
            ADD CONSTRAINT "FK_e2b9a7ca550d257416072087b40" FOREIGN KEY ("permission_document_media_id") REFERENCES "media_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "liturgical_year_import"
            ADD CONSTRAINT "FK_20ea31c5d1e5259ec0cd2586db3" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "liturgical_year_import"
            ADD CONSTRAINT "FK_1b07dd34116b996be9e397fe6e3" FOREIGN KEY ("file_media_id") REFERENCES "media_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "liturgical_year_import"
            ADD CONSTRAINT "FK_c2142b7501b459be6778c4734c2" FOREIGN KEY ("uploaded_by_admin_id") REFERENCES "admin_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "liturgical_day"
            ADD CONSTRAINT "FK_4fd06dd48b2a7fabd847ce41d89" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "liturgical_day"
            ADD CONSTRAINT "FK_70e84ef7d44c08c380c7f094b07" FOREIGN KEY ("import_id") REFERENCES "liturgical_year_import"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "saint"
            ADD CONSTRAINT "FK_f40e293dd6850b74aa869da61c6" FOREIGN KEY ("image_media_id") REFERENCES "media_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "celebration"
            ADD CONSTRAINT "FK_9b4408c38a6a670e884fc3f7a06" FOREIGN KEY ("liturgical_day_id") REFERENCES "liturgical_day"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "celebration"
            ADD CONSTRAINT "FK_04e1de9ee0454b0365b8ae178c8" FOREIGN KEY ("saint_id") REFERENCES "saint"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reading_set"
            ADD CONSTRAINT "FK_f3887dafcac013785da5bb7d409" FOREIGN KEY ("proofread_by_admin_id") REFERENCES "admin_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reading_set"
            ADD CONSTRAINT "FK_46448565e597e752d191b79342e" FOREIGN KEY ("verified_by_admin_id") REFERENCES "admin_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reading_set"
            ADD CONSTRAINT "FK_c9b3f4b8081d5566b318ea3f22e" FOREIGN KEY ("published_by_admin_id") REFERENCES "admin_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reading_set"
            ADD CONSTRAINT "FK_26ad9f17c09f5cb8b6e551d02d7" FOREIGN KEY ("liturgical_day_id") REFERENCES "liturgical_day"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reading_set"
            ADD CONSTRAINT "FK_5cde29e50e0cc49c701ac2aec67" FOREIGN KEY ("celebration_id") REFERENCES "celebration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mass_proper"
            ADD CONSTRAINT "FK_15e513185938ca8b6f0aec3b773" FOREIGN KEY ("proofread_by_admin_id") REFERENCES "admin_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mass_proper"
            ADD CONSTRAINT "FK_10e5135699abe9bac51e2cd0c5c" FOREIGN KEY ("verified_by_admin_id") REFERENCES "admin_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mass_proper"
            ADD CONSTRAINT "FK_883e9473bbd86a59da48a6ae878" FOREIGN KEY ("published_by_admin_id") REFERENCES "admin_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mass_proper"
            ADD CONSTRAINT "FK_35c3ac0b2c061f6baef996da1d8" FOREIGN KEY ("reading_set_id") REFERENCES "reading_set"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mass_proper"
            ADD CONSTRAINT "FK_428fb217f2ddcba19de5f89bf13" FOREIGN KEY ("translation_id") REFERENCES "bible_translation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reading_import_batch"
            ADD CONSTRAINT "FK_18afb9214876a9c17d85b463cb2" FOREIGN KEY ("file_media_id") REFERENCES "media_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reading_import_batch"
            ADD CONSTRAINT "FK_3dec6fd143c197d762735232548" FOREIGN KEY ("uploaded_by_admin_id") REFERENCES "admin_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reading"
            ADD CONSTRAINT "FK_a5a40dc7a29b23b1acc126000ec" FOREIGN KEY ("proofread_by_admin_id") REFERENCES "admin_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reading"
            ADD CONSTRAINT "FK_1592ea1d2e5e3e9a0f28d2b5462" FOREIGN KEY ("verified_by_admin_id") REFERENCES "admin_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reading"
            ADD CONSTRAINT "FK_78c9b2852e45854e358ed0e8ee9" FOREIGN KEY ("published_by_admin_id") REFERENCES "admin_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reading"
            ADD CONSTRAINT "FK_a628656b09ce0da19933621d0e9" FOREIGN KEY ("reading_set_id") REFERENCES "reading_set"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reading"
            ADD CONSTRAINT "FK_e2b8f21c7c0ddcd6b1a6ce66249" FOREIGN KEY ("translation_id") REFERENCES "bible_translation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reading"
            ADD CONSTRAINT "FK_6e96af5bb91e947669b9eea90fc" FOREIGN KEY ("audio_media_id") REFERENCES "media_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reading"
            ADD CONSTRAINT "FK_9f3982363545797427592228c52" FOREIGN KEY ("import_batch_id") REFERENCES "reading_import_batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "psalm_stanza"
            ADD CONSTRAINT "FK_5bb536fcaa1717419ac101ab554" FOREIGN KEY ("reading_id") REFERENCES "reading"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "psalm_stanza" DROP CONSTRAINT "FK_5bb536fcaa1717419ac101ab554"
        `);
    await queryRunner.query(`
            ALTER TABLE "reading" DROP CONSTRAINT "FK_9f3982363545797427592228c52"
        `);
    await queryRunner.query(`
            ALTER TABLE "reading" DROP CONSTRAINT "FK_6e96af5bb91e947669b9eea90fc"
        `);
    await queryRunner.query(`
            ALTER TABLE "reading" DROP CONSTRAINT "FK_e2b8f21c7c0ddcd6b1a6ce66249"
        `);
    await queryRunner.query(`
            ALTER TABLE "reading" DROP CONSTRAINT "FK_a628656b09ce0da19933621d0e9"
        `);
    await queryRunner.query(`
            ALTER TABLE "reading" DROP CONSTRAINT "FK_78c9b2852e45854e358ed0e8ee9"
        `);
    await queryRunner.query(`
            ALTER TABLE "reading" DROP CONSTRAINT "FK_1592ea1d2e5e3e9a0f28d2b5462"
        `);
    await queryRunner.query(`
            ALTER TABLE "reading" DROP CONSTRAINT "FK_a5a40dc7a29b23b1acc126000ec"
        `);
    await queryRunner.query(`
            ALTER TABLE "reading_import_batch" DROP CONSTRAINT "FK_3dec6fd143c197d762735232548"
        `);
    await queryRunner.query(`
            ALTER TABLE "reading_import_batch" DROP CONSTRAINT "FK_18afb9214876a9c17d85b463cb2"
        `);
    await queryRunner.query(`
            ALTER TABLE "mass_proper" DROP CONSTRAINT "FK_428fb217f2ddcba19de5f89bf13"
        `);
    await queryRunner.query(`
            ALTER TABLE "mass_proper" DROP CONSTRAINT "FK_35c3ac0b2c061f6baef996da1d8"
        `);
    await queryRunner.query(`
            ALTER TABLE "mass_proper" DROP CONSTRAINT "FK_883e9473bbd86a59da48a6ae878"
        `);
    await queryRunner.query(`
            ALTER TABLE "mass_proper" DROP CONSTRAINT "FK_10e5135699abe9bac51e2cd0c5c"
        `);
    await queryRunner.query(`
            ALTER TABLE "mass_proper" DROP CONSTRAINT "FK_15e513185938ca8b6f0aec3b773"
        `);
    await queryRunner.query(`
            ALTER TABLE "reading_set" DROP CONSTRAINT "FK_5cde29e50e0cc49c701ac2aec67"
        `);
    await queryRunner.query(`
            ALTER TABLE "reading_set" DROP CONSTRAINT "FK_26ad9f17c09f5cb8b6e551d02d7"
        `);
    await queryRunner.query(`
            ALTER TABLE "reading_set" DROP CONSTRAINT "FK_c9b3f4b8081d5566b318ea3f22e"
        `);
    await queryRunner.query(`
            ALTER TABLE "reading_set" DROP CONSTRAINT "FK_46448565e597e752d191b79342e"
        `);
    await queryRunner.query(`
            ALTER TABLE "reading_set" DROP CONSTRAINT "FK_f3887dafcac013785da5bb7d409"
        `);
    await queryRunner.query(`
            ALTER TABLE "celebration" DROP CONSTRAINT "FK_04e1de9ee0454b0365b8ae178c8"
        `);
    await queryRunner.query(`
            ALTER TABLE "celebration" DROP CONSTRAINT "FK_9b4408c38a6a670e884fc3f7a06"
        `);
    await queryRunner.query(`
            ALTER TABLE "saint" DROP CONSTRAINT "FK_f40e293dd6850b74aa869da61c6"
        `);
    await queryRunner.query(`
            ALTER TABLE "liturgical_day" DROP CONSTRAINT "FK_70e84ef7d44c08c380c7f094b07"
        `);
    await queryRunner.query(`
            ALTER TABLE "liturgical_day" DROP CONSTRAINT "FK_4fd06dd48b2a7fabd847ce41d89"
        `);
    await queryRunner.query(`
            ALTER TABLE "liturgical_year_import" DROP CONSTRAINT "FK_c2142b7501b459be6778c4734c2"
        `);
    await queryRunner.query(`
            ALTER TABLE "liturgical_year_import" DROP CONSTRAINT "FK_1b07dd34116b996be9e397fe6e3"
        `);
    await queryRunner.query(`
            ALTER TABLE "liturgical_year_import" DROP CONSTRAINT "FK_20ea31c5d1e5259ec0cd2586db3"
        `);
    await queryRunner.query(`
            ALTER TABLE "bible_translation" DROP CONSTRAINT "FK_e2b9a7ca550d257416072087b40"
        `);
    await queryRunner.query(`
            ALTER TABLE "bible_translation" DROP CONSTRAINT "FK_20d72044ff5cde4db74ff281900"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_7934f8729d331f3d005306b31f"
        `);
    await queryRunner.query(`
            DROP TABLE "psalm_stanza"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_9f3982363545797427592228c5"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_42aaf07ddab73ee40f51ba7e64"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_ba45f1b8072eaada5055713517"
        `);
    await queryRunner.query(`
            DROP TABLE "reading"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."reading_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_44d3c9ca2f0c6c8f3327b5c53d"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_5900ea2b431b3d1a36df121a66"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_b954de54523367bf13db31561e"
        `);
    await queryRunner.query(`
            DROP TABLE "reading_import_batch"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."import_format"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_b114dab3bdee0cee850b4e99cc"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_3af385343f75ebceebbe99ba0c"
        `);
    await queryRunner.query(`
            DROP TABLE "mass_proper"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."mass_proper_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."UQ_reading_set_one_uncycled_per_mass_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_5cde29e50e0cc49c701ac2aec6"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_499f24d55fe8436b79ce103759"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_879e641440afa10fc7c5021e87"
        `);
    await queryRunner.query(`
            DROP TABLE "reading_set"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."mass_type"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."verification_status"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_66ecdb11f5fffe89a494f59582"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."UQ_celebration_one_primary_per_day"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_04e1de9ee0454b0365b8ae178c"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_78b192268fe43059d116d94861"
        `);
    await queryRunner.query(`
            DROP TABLE "celebration"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."celebration_rank"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_c641dd934ab26d167a14988331"
        `);
    await queryRunner.query(`
            DROP TABLE "saint"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_70e84ef7d44c08c380c7f094b0"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_5dc55f3f799eec4272a6c4d832"
        `);
    await queryRunner.query(`
            DROP TABLE "liturgical_day"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."rosary_mystery_set"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."liturgical_color"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."weekday_cycle"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."sunday_cycle"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."liturgical_season"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."UQ_liturgical_year_import_one_committed"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_12b1ff4c81afcc142a57542497"
        `);
    await queryRunner.query(`
            DROP TABLE "liturgical_year_import"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."import_status"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_b3636d3eb801fad6d7c4012747"
        `);
    await queryRunner.query(`
            DROP TABLE "bible_translation"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."text_source_kind"
        `);
  }
}
