import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersContributions1792201507114 implements MigrationInterface {
  name = 'UsersContributions1792201507114';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."app_auth_provider" AS ENUM('email', 'google', 'apple')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."app_user_status" AS ENUM('active', 'suspended')
        `);
    await queryRunner.query(`
            CREATE TABLE "app_user" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "email" character varying(254),
                "phone" character varying(32),
                "display_name" character varying(160),
                "avatar_media_id" uuid,
                "auth_provider" "public"."app_auth_provider" NOT NULL,
                "provider_uid" character varying(255),
                "password_hash" character varying(255),
                "email_verified_at" TIMESTAMP WITH TIME ZONE,
                "status" "public"."app_user_status" NOT NULL DEFAULT 'active',
                "points" integer NOT NULL DEFAULT '0',
                "locale" character varying(10),
                "timezone" character varying(40),
                "country_id" uuid,
                CONSTRAINT "UQ_3fa909d0e37c531ebc237703391" UNIQUE ("email"),
                CONSTRAINT "UQ_922afebeb7d18b8bde2dacae783" UNIQUE ("auth_provider", "provider_uid"),
                CONSTRAINT "CHK_app_user_credentials" CHECK (
                    (
                        "auth_provider" = 'email'
                        AND "email" IS NOT NULL
                        AND "password_hash" IS NOT NULL
                    )
                    OR (
                        "auth_provider" <> 'email'
                        AND "provider_uid" IS NOT NULL
                    )
                ),
                CONSTRAINT "CHK_app_user_email_lowercase" CHECK ("email" = lower("email")),
                CONSTRAINT "PK_22a5c4a3d9b2fb8e4e73fc4ada1" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_fb2679426914d2b015af4151d7" ON "app_user" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_d36ec953e46f7aa001a6e74756" ON "app_user" ("status")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."device_platform" AS ENUM('android', 'ios')
        `);
    await queryRunner.query(`
            CREATE TABLE "device" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "user_id" uuid,
                "fcm_token" character varying(512) NOT NULL,
                "platform" "public"."device_platform" NOT NULL,
                "app_version" character varying(20) NOT NULL,
                "locale" character varying(10),
                "timezone" character varying(40) NOT NULL,
                "country_id" uuid,
                "last_seen_at" TIMESTAMP WITH TIME ZONE,
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "UQ_3c4ed5801431490290b69c78c62" UNIQUE ("fcm_token"),
                CONSTRAINT "PK_2dc10972aa4e27c01378dad2c72" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_7566311a14a913e5cc2ee33ade" ON "device" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_ae7154510495c7ddda951b07a0" ON "device" ("user_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_6ecc2a2c92d30a5d8ce69fdeb3" ON "device" ("is_active", "timezone")
        `);
    await queryRunner.query(`
            CREATE TABLE "diocese_interest" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "diocese_id" uuid,
                "requested_name" character varying(160),
                "device_id" uuid NOT NULL,
                "user_id" uuid,
                "state" character varying(120),
                CONSTRAINT "UQ_9f7bd75c49bf5bbf9cdbb25942b" UNIQUE ("device_id", "diocese_id"),
                CONSTRAINT "CHK_diocese_interest_names_a_diocese" CHECK (
                    "diocese_id" IS NOT NULL
                    OR "requested_name" IS NOT NULL
                ),
                CONSTRAINT "PK_ea89f605ef334b4e8be2ca44770" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_c18f8a6870633d432b7c6e1e06" ON "diocese_interest" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_d96e827b8877f173d0971af215" ON "diocese_interest" ("diocese_id")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_diocese_interest_one_unlisted_per_device" ON "diocese_interest" ("device_id")
            WHERE "diocese_id" IS NULL
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."submission_entity_type" AS ENUM(
                'parish',
                'parish_info',
                'mass_schedule',
                'gallery',
                'announcement'
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."submission_operation" AS ENUM('create', 'update', 'delete')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."submission_status" AS ENUM(
                'pending',
                'approved',
                'rejected',
                'withdrawn',
                'superseded'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "submission" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "submitter_user_id" uuid,
                "submitter_device_id" uuid,
                "contact_name" character varying(160),
                "contact_email" character varying(254),
                "contact_phone" character varying(32),
                "entity_type" "public"."submission_entity_type" NOT NULL,
                "target_entity_id" uuid,
                "operation" "public"."submission_operation" NOT NULL,
                "payload" jsonb NOT NULL,
                "diff" jsonb,
                "status" "public"."submission_status" NOT NULL DEFAULT 'pending',
                "reviewed_by_admin_id" uuid,
                "reviewed_at" TIMESTAMP WITH TIME ZONE,
                "rejection_reason" text,
                "applied_entity_version" integer,
                "diocese_id" uuid,
                CONSTRAINT "CHK_submission_rejection_reason" CHECK (
                    "status" <> 'rejected'
                    OR "rejection_reason" IS NOT NULL
                ),
                CONSTRAINT "CHK_submission_target_for_change" CHECK (
                    "operation" = 'create'
                    OR "target_entity_id" IS NOT NULL
                ),
                CONSTRAINT "CHK_submission_has_submitter" CHECK (
                    "submitter_user_id" IS NOT NULL
                    OR "submitter_device_id" IS NOT NULL
                ),
                CONSTRAINT "PK_7faa571d0e4a7076e85890c9bd0" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_23243929c1a1bafb7db2f43dec" ON "submission" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_336889e9f093e85dedff5e8e4f" ON "submission" ("submitter_user_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_72bb8e4933307c3e965f2bcdb5" ON "submission" ("submitter_device_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_c12a4109288a963e1d9a3db320" ON "submission" ("target_entity_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_978a8994757b45179262441d60" ON "submission" ("status", "diocese_id", "created_at")
        `);
    await queryRunner.query(`
            CREATE TABLE "submission_attachment" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "submission_id" uuid NOT NULL,
                "media_asset_id" uuid NOT NULL,
                "sort_order" smallint NOT NULL DEFAULT '0',
                CONSTRAINT "UQ_3430dedf9b70137e77787cd031a" UNIQUE ("submission_id", "media_asset_id"),
                CONSTRAINT "PK_add3c0a74622e9baca0ef2b7a27" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_de34719a9150a664127217c897" ON "submission_attachment" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_4f3caf6136555ffd4cea2dc5f0" ON "submission_attachment" ("media_asset_id")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."contributor_status" AS ENUM('pending', 'approved', 'rejected', 'revoked')
        `);
    await queryRunner.query(`
            CREATE TABLE "contributor_profile" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "user_id" uuid NOT NULL,
                "status" "public"."contributor_status" NOT NULL DEFAULT 'pending',
                "applied_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "reviewed_by_admin_id" uuid,
                "reviewed_at" TIMESTAMP WITH TIME ZONE,
                "diocese_id" uuid,
                "parish_affiliation_id" uuid,
                "bio" text,
                "verification_notes" text,
                "rejection_reason" text,
                CONSTRAINT "UQ_b284fd3c7a77f06b276dda3dae8" UNIQUE ("user_id"),
                CONSTRAINT "CHK_contributor_profile_rejection_reason" CHECK (
                    "status" <> 'rejected'
                    OR "rejection_reason" IS NOT NULL
                ),
                CONSTRAINT "PK_20b7293d31776e4899c2364775d" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_eb35173f9253196cef772110cc" ON "contributor_profile" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_2355eb49ec42f6873a9601c2b8" ON "contributor_profile" ("status")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_f596c40acd50abaa3e99132048" ON "contributor_profile" ("diocese_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "media_asset"
            ADD "uploaded_by_user_id" uuid
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_5395c09f1a3173b3970aca98ae" ON "media_asset" ("uploaded_by_user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "app_user"
            ADD CONSTRAINT "FK_8bfe7fd2ba67ae8d247cc40d271" FOREIGN KEY ("avatar_media_id") REFERENCES "media_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "app_user"
            ADD CONSTRAINT "FK_8b4b51bfc69cc8996bfe7770d5c" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "media_asset"
            ADD CONSTRAINT "FK_5395c09f1a3173b3970aca98ae3" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "app_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "device"
            ADD CONSTRAINT "FK_ae7154510495c7ddda951b07a07" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "device"
            ADD CONSTRAINT "FK_8ca82d3296100de41a6ffccf35e" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "diocese_interest"
            ADD CONSTRAINT "FK_d96e827b8877f173d0971af2154" FOREIGN KEY ("diocese_id") REFERENCES "diocese"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "diocese_interest"
            ADD CONSTRAINT "FK_9825afc515342f9cd78f0510ff6" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "diocese_interest"
            ADD CONSTRAINT "FK_1ac08f5e6320969b166c0e603b8" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "submission"
            ADD CONSTRAINT "FK_336889e9f093e85dedff5e8e4fc" FOREIGN KEY ("submitter_user_id") REFERENCES "app_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "submission"
            ADD CONSTRAINT "FK_72bb8e4933307c3e965f2bcdb5e" FOREIGN KEY ("submitter_device_id") REFERENCES "device"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "submission"
            ADD CONSTRAINT "FK_b010aa47be7b314a37d6719b44e" FOREIGN KEY ("reviewed_by_admin_id") REFERENCES "admin_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "submission"
            ADD CONSTRAINT "FK_e0941f2352d87831d0894b5d3cb" FOREIGN KEY ("diocese_id") REFERENCES "diocese"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "submission_attachment"
            ADD CONSTRAINT "FK_48eaf8f482bd629d3bfa1fdddcd" FOREIGN KEY ("submission_id") REFERENCES "submission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "submission_attachment"
            ADD CONSTRAINT "FK_4f3caf6136555ffd4cea2dc5f05" FOREIGN KEY ("media_asset_id") REFERENCES "media_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "contributor_profile"
            ADD CONSTRAINT "FK_b284fd3c7a77f06b276dda3dae8" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "contributor_profile"
            ADD CONSTRAINT "FK_ccd3e67bed119702e5b422f1b6a" FOREIGN KEY ("reviewed_by_admin_id") REFERENCES "admin_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "contributor_profile"
            ADD CONSTRAINT "FK_f596c40acd50abaa3e99132048b" FOREIGN KEY ("diocese_id") REFERENCES "diocese"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "contributor_profile"
            ADD CONSTRAINT "FK_af01e88008ac37ff629980bbe11" FOREIGN KEY ("parish_affiliation_id") REFERENCES "parish"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "contributor_profile" DROP CONSTRAINT "FK_af01e88008ac37ff629980bbe11"
        `);
    await queryRunner.query(`
            ALTER TABLE "contributor_profile" DROP CONSTRAINT "FK_f596c40acd50abaa3e99132048b"
        `);
    await queryRunner.query(`
            ALTER TABLE "contributor_profile" DROP CONSTRAINT "FK_ccd3e67bed119702e5b422f1b6a"
        `);
    await queryRunner.query(`
            ALTER TABLE "contributor_profile" DROP CONSTRAINT "FK_b284fd3c7a77f06b276dda3dae8"
        `);
    await queryRunner.query(`
            ALTER TABLE "submission_attachment" DROP CONSTRAINT "FK_4f3caf6136555ffd4cea2dc5f05"
        `);
    await queryRunner.query(`
            ALTER TABLE "submission_attachment" DROP CONSTRAINT "FK_48eaf8f482bd629d3bfa1fdddcd"
        `);
    await queryRunner.query(`
            ALTER TABLE "submission" DROP CONSTRAINT "FK_e0941f2352d87831d0894b5d3cb"
        `);
    await queryRunner.query(`
            ALTER TABLE "submission" DROP CONSTRAINT "FK_b010aa47be7b314a37d6719b44e"
        `);
    await queryRunner.query(`
            ALTER TABLE "submission" DROP CONSTRAINT "FK_72bb8e4933307c3e965f2bcdb5e"
        `);
    await queryRunner.query(`
            ALTER TABLE "submission" DROP CONSTRAINT "FK_336889e9f093e85dedff5e8e4fc"
        `);
    await queryRunner.query(`
            ALTER TABLE "diocese_interest" DROP CONSTRAINT "FK_1ac08f5e6320969b166c0e603b8"
        `);
    await queryRunner.query(`
            ALTER TABLE "diocese_interest" DROP CONSTRAINT "FK_9825afc515342f9cd78f0510ff6"
        `);
    await queryRunner.query(`
            ALTER TABLE "diocese_interest" DROP CONSTRAINT "FK_d96e827b8877f173d0971af2154"
        `);
    await queryRunner.query(`
            ALTER TABLE "device" DROP CONSTRAINT "FK_8ca82d3296100de41a6ffccf35e"
        `);
    await queryRunner.query(`
            ALTER TABLE "device" DROP CONSTRAINT "FK_ae7154510495c7ddda951b07a07"
        `);
    await queryRunner.query(`
            ALTER TABLE "media_asset" DROP CONSTRAINT "FK_5395c09f1a3173b3970aca98ae3"
        `);
    await queryRunner.query(`
            ALTER TABLE "app_user" DROP CONSTRAINT "FK_8b4b51bfc69cc8996bfe7770d5c"
        `);
    await queryRunner.query(`
            ALTER TABLE "app_user" DROP CONSTRAINT "FK_8bfe7fd2ba67ae8d247cc40d271"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_5395c09f1a3173b3970aca98ae"
        `);
    await queryRunner.query(`
            ALTER TABLE "media_asset" DROP COLUMN "uploaded_by_user_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_f596c40acd50abaa3e99132048"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_2355eb49ec42f6873a9601c2b8"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_eb35173f9253196cef772110cc"
        `);
    await queryRunner.query(`
            DROP TABLE "contributor_profile"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."contributor_status"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_4f3caf6136555ffd4cea2dc5f0"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_de34719a9150a664127217c897"
        `);
    await queryRunner.query(`
            DROP TABLE "submission_attachment"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_978a8994757b45179262441d60"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_c12a4109288a963e1d9a3db320"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_72bb8e4933307c3e965f2bcdb5"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_336889e9f093e85dedff5e8e4f"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_23243929c1a1bafb7db2f43dec"
        `);
    await queryRunner.query(`
            DROP TABLE "submission"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."submission_status"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."submission_operation"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."submission_entity_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."UQ_diocese_interest_one_unlisted_per_device"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_d96e827b8877f173d0971af215"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_c18f8a6870633d432b7c6e1e06"
        `);
    await queryRunner.query(`
            DROP TABLE "diocese_interest"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_6ecc2a2c92d30a5d8ce69fdeb3"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_ae7154510495c7ddda951b07a0"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_7566311a14a913e5cc2ee33ade"
        `);
    await queryRunner.query(`
            DROP TABLE "device"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."device_platform"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_d36ec953e46f7aa001a6e74756"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_fb2679426914d2b015af4151d7"
        `);
    await queryRunner.query(`
            DROP TABLE "app_user"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."app_user_status"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."app_auth_provider"
        `);
  }
}
