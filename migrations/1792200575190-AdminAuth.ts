import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminAuth1792200575190 implements MigrationInterface {
  name = 'AdminAuth1792200575190';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."admin_role" AS ENUM(
                'super_admin',
                'admin',
                'diocese_admin',
                'content_editor'
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."admin_status" AS ENUM('pending', 'active', 'suspended')
        `);
    await queryRunner.query(`
            CREATE TABLE "admin_user" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "email" character varying(254) NOT NULL,
                "name" character varying(160) NOT NULL,
                "password_hash" character varying(255),
                "role" "public"."admin_role" NOT NULL,
                "diocese_scope_id" uuid,
                "status" "public"."admin_status" NOT NULL DEFAULT 'pending',
                "mfa_secret_ciphertext" text,
                "last_login_at" TIMESTAMP WITH TIME ZONE,
                "invited_by_id" uuid,
                CONSTRAINT "UQ_840ac5cd67be99efa5cd989bf9f" UNIQUE ("email"),
                CONSTRAINT "CHK_admin_user_diocese_admin_scoped" CHECK (
                    "role" <> 'diocese_admin'
                    OR "diocese_scope_id" IS NOT NULL
                ),
                CONSTRAINT "CHK_admin_user_active_has_password" CHECK (
                    "status" <> 'active'
                    OR "password_hash" IS NOT NULL
                ),
                CONSTRAINT "CHK_admin_user_email_lowercase" CHECK ("email" = lower("email")),
                CONSTRAINT "PK_a28028ba709cd7e5053a86857b4" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_1c93d3da8edaabf09c0d97e6d1" ON "admin_user" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_b3b091eb588aeb9623757acc1e" ON "admin_user" ("diocese_scope_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "admin_password_reset" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "admin_user_id" uuid NOT NULL,
                "token_hash" character varying(64) NOT NULL,
                "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "used_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_860de5b28294cd54389ead13dcb" UNIQUE ("token_hash"),
                CONSTRAINT "PK_bf4d03614550f9689b7ba810f22" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_739ac74f79d8fcc6d4bd4514e4" ON "admin_password_reset" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_4caf28e0de954d080da4d0c33f" ON "admin_password_reset" ("admin_user_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "admin_session" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "updated_by" uuid,
                "admin_user_id" uuid NOT NULL,
                "token_hash" character varying(64) NOT NULL,
                "family_id" uuid NOT NULL,
                "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "revoked_at" TIMESTAMP WITH TIME ZONE,
                "replaced_by_id" uuid,
                CONSTRAINT "UQ_3779826166c68e21087087f20b8" UNIQUE ("token_hash"),
                CONSTRAINT "PK_031b46c28b79cc8e17984c9f1a2" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_249173961578f98e02befeb4b2" ON "admin_session" ("updated_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_18838f203555a6c14dea55389c" ON "admin_session" ("admin_user_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_c0e7286b65d3dfa759016c4535" ON "admin_session" ("family_id")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."audit_actor_type" AS ENUM('admin', 'user', 'system')
        `);
    await queryRunner.query(`
            CREATE TABLE "audit_log" (
                "id" uuid NOT NULL DEFAULT uuid_v7(),
                "actor_type" "public"."audit_actor_type" NOT NULL,
                "actor_id" uuid,
                "action" character varying(80) NOT NULL,
                "entity_type" character varying(80) NOT NULL,
                "entity_id" uuid,
                "before" jsonb,
                "after" jsonb,
                "reason" text,
                "ip_address" inet,
                "user_agent" character varying(500),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id")
            )
        `);
    // Hand-written: TypeORM cannot express triggers. audit_log is append-only.
    await queryRunner.query(`
            CREATE FUNCTION audit_log_reject_change() RETURNS trigger
            LANGUAGE plpgsql AS $$
            BEGIN
                RAISE EXCEPTION 'audit_log is append-only';
            END
            $$
        `);
    await queryRunner.query(`
            CREATE TRIGGER "TRG_audit_log_append_only"
            BEFORE UPDATE OR DELETE ON "audit_log"
            FOR EACH ROW EXECUTE FUNCTION audit_log_reject_change()
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_ee05d310491240fb8ea3bbc28e" ON "audit_log" ("actor_type", "actor_id", "created_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_9dee3678d9e3942b6424e5b07b" ON "audit_log" ("entity_type", "entity_id", "created_at")
        `);
    await queryRunner.query(`
            ALTER TABLE "admin_user"
            ADD CONSTRAINT "FK_b3b091eb588aeb9623757acc1e5" FOREIGN KEY ("diocese_scope_id") REFERENCES "diocese"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "admin_user"
            ADD CONSTRAINT "FK_a1a125cd4a4fc966bb177890c8e" FOREIGN KEY ("invited_by_id") REFERENCES "admin_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "admin_password_reset"
            ADD CONSTRAINT "FK_4caf28e0de954d080da4d0c33f6" FOREIGN KEY ("admin_user_id") REFERENCES "admin_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "admin_session"
            ADD CONSTRAINT "FK_18838f203555a6c14dea55389cc" FOREIGN KEY ("admin_user_id") REFERENCES "admin_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "admin_session"
            ADD CONSTRAINT "FK_d7afd74e2870b1b0101ea343f47" FOREIGN KEY ("replaced_by_id") REFERENCES "admin_session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "admin_session" DROP CONSTRAINT "FK_d7afd74e2870b1b0101ea343f47"
        `);
    await queryRunner.query(`
            ALTER TABLE "admin_session" DROP CONSTRAINT "FK_18838f203555a6c14dea55389cc"
        `);
    await queryRunner.query(`
            ALTER TABLE "admin_password_reset" DROP CONSTRAINT "FK_4caf28e0de954d080da4d0c33f6"
        `);
    await queryRunner.query(`
            ALTER TABLE "admin_user" DROP CONSTRAINT "FK_a1a125cd4a4fc966bb177890c8e"
        `);
    await queryRunner.query(`
            ALTER TABLE "admin_user" DROP CONSTRAINT "FK_b3b091eb588aeb9623757acc1e5"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_9dee3678d9e3942b6424e5b07b"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_ee05d310491240fb8ea3bbc28e"
        `);
    await queryRunner.query(`
            DROP TABLE "audit_log"
        `);
    await queryRunner.query(`
            DROP FUNCTION audit_log_reject_change()
        `);
    await queryRunner.query(`
            DROP TYPE "public"."audit_actor_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_c0e7286b65d3dfa759016c4535"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_18838f203555a6c14dea55389c"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_249173961578f98e02befeb4b2"
        `);
    await queryRunner.query(`
            DROP TABLE "admin_session"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_4caf28e0de954d080da4d0c33f"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_739ac74f79d8fcc6d4bd4514e4"
        `);
    await queryRunner.query(`
            DROP TABLE "admin_password_reset"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_b3b091eb588aeb9623757acc1e"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_1c93d3da8edaabf09c0d97e6d1"
        `);
    await queryRunner.query(`
            DROP TABLE "admin_user"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."admin_status"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."admin_role"
        `);
  }
}
