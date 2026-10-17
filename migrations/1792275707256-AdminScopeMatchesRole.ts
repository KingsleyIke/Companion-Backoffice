import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminScopeMatchesRole1792275707256 implements MigrationInterface {
  name = 'AdminScopeMatchesRole1792275707256';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "admin_user" DROP CONSTRAINT "CHK_admin_user_diocese_admin_scoped"
        `);
    await queryRunner.query(`
            ALTER TABLE "admin_user"
            ADD CONSTRAINT "CHK_admin_user_scope_matches_role" CHECK (
                    ("role" = 'diocese_admin') = ("diocese_scope_id" IS NOT NULL)
                )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "admin_user" DROP CONSTRAINT "CHK_admin_user_scope_matches_role"
        `);
    await queryRunner.query(`
            ALTER TABLE "admin_user"
            ADD CONSTRAINT "CHK_admin_user_diocese_admin_scoped" CHECK (
                    (
                        (role <> 'diocese_admin'::admin_role)
                        OR (diocese_scope_id IS NOT NULL)
                    )
                )
        `);
  }
}
