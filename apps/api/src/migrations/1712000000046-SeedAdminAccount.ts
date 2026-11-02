import { MigrationInterface, QueryRunner } from 'typeorm'

/** Seeds the initial administrator account for the isolated admin dashboard. */
export class SeedAdminAccount1712000000046 implements MigrationInterface {
  name = 'SeedAdminAccount1712000000046'

  private readonly adminEmail = 'admin@centralhubsolution.com'
  private readonly adminPasswordHash = '$2a$10$FwSE9O/Uw6GqfFYraGEHSuUcRMZ/1UDMvJt7dA5f1DsPLwhpm3GQ6'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "roles" ("name", "description")
       VALUES ('ADMIN', 'Administrator with full access')
       ON CONFLICT ("name") DO NOTHING`,
    )

    await queryRunner.query(
      `INSERT INTO "users" (
         "email", "password_hash", "first_name", "last_name",
         "status", "is_verified", "email_verified_at", "language", "theme_mode"
       )
       VALUES ($1, $2, 'Central Hub', 'Administrator', 'active', true, now(), 'en', 'light')
       ON CONFLICT ("email") DO UPDATE SET
         "password_hash" = EXCLUDED."password_hash",
         "first_name" = EXCLUDED."first_name",
         "last_name" = EXCLUDED."last_name",
         "status" = 'active',
         "is_verified" = true,
         "email_verified_at" = COALESCE("users"."email_verified_at", now())`,
      [this.adminEmail, this.adminPasswordHash],
    )

    await queryRunner.query(
      `INSERT INTO "user_roles" ("user_id", "role_id")
       SELECT u."id", r."id"
       FROM "users" u
       CROSS JOIN "roles" r
       WHERE u."email" = $1 AND r."name" = 'ADMIN'
       ON CONFLICT ("user_id", "role_id") DO NOTHING`,
      [this.adminEmail],
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "user_roles" WHERE "user_id" IN (SELECT "id" FROM "users" WHERE "email" = $1)`,
      [this.adminEmail],
    )
    await queryRunner.query(`DELETE FROM "users" WHERE "email" = $1`, [this.adminEmail])
  }
}
