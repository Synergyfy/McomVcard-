import { MigrationInterface, QueryRunner } from 'typeorm'

export class NormalizeUsersTable1712000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // user_roles.user_id still references users.id as integer; drop the FK so users.id can change type
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "fk_user"`)

    // id -> UUID (default so TypeORM inserts without an explicit id work)
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`)
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid()`)
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`)
    await queryRunner.query(`DROP SEQUENCE IF EXISTS "users_id_seq"`)

    // password -> password_hash
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "password" TO "password_hash"`)

    // camelCase columns -> snake_case
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "firstName" TO "first_name"`)
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "lastName" TO "last_name"`)
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at"`)
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at"`)

    // new columns
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "phone" character varying`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "status" character varying NOT NULL DEFAULT 'active'`)

    // is_admin removed; role-based admin arrives with the RBAC task
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isAdmin"`)

    // Rebuild user_roles to match the new users.id type (dev data; the seed re-associates roles)
    await queryRunner.query(`DELETE FROM "user_roles"`)
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "user_roles_pkey"`)
    await queryRunner.query(`ALTER TABLE "user_roles" ALTER COLUMN "user_id" TYPE uuid USING gen_random_uuid()`)
    await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id", "role_id")`)
    await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users" (id) ON DELETE CASCADE`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "fk_user"`)
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "user_roles_pkey"`)
    await queryRunner.query(`ALTER TABLE "user_roles" ALTER COLUMN "user_id" TYPE integer USING 0`)
    await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id", "role_id")`)
    await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users" (id) ON DELETE CASCADE`)

    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "isAdmin" boolean NOT NULL DEFAULT false`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`)
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "updated_at" TO "updatedAt"`)
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "created_at" TO "createdAt"`)
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "last_name" TO "lastName"`)
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "first_name" TO "firstName"`)
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "password_hash" TO "password"`)

    // id back to integer (lossy: existing uuids are renumbered)
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "users_id_seq"`)
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" TYPE integer USING nextval('users_id_seq')`)
    await queryRunner.query(`ALTER SEQUENCE "users_id_seq" OWNED BY "users"."id"`)
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT nextval('users_id_seq')`)
  }
}