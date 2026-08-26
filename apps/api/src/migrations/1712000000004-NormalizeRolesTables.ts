import { MigrationInterface, QueryRunner } from 'typeorm'

export class NormalizeRolesTables1712000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Dev data; the seed re-associates roles after the id type change
    await queryRunner.query(`DELETE FROM "user_roles"`)

    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "fk_user"`)
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "fk_role"`)
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "user_roles_pkey"`)

    // roles.id: SERIAL -> UUID
    await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "id" DROP DEFAULT`)
    await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid()`)
    await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`)
    await queryRunner.query(`DROP SEQUENCE IF EXISTS "roles_id_seq"`)

    // user_roles.role_id: integer -> uuid
    await queryRunner.query(`ALTER TABLE "user_roles" ALTER COLUMN "role_id" TYPE uuid USING gen_random_uuid()`)

    // camelCase -> snake_case on roles, plus updated_at
    await queryRunner.query(`ALTER TABLE "roles" RENAME COLUMN "createdAt" TO "created_at"`)
    await queryRunner.query(`ALTER TABLE "roles" ADD COLUMN "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)

    // association metadata
    await queryRunner.query(`ALTER TABLE "user_roles" ADD COLUMN "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)

    // Rebuild constraints
    await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id", "role_id")`)
    await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users" (id) ON DELETE CASCADE`)
    await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "fk_role" FOREIGN KEY ("role_id") REFERENCES "roles" (id) ON DELETE CASCADE`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "fk_role"`)
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "fk_user"`)
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "user_roles_pkey"`)

    await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN IF EXISTS "created_at"`)

    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN IF EXISTS "updated_at"`)
    await queryRunner.query(`ALTER TABLE "roles" RENAME COLUMN "created_at" TO "createdAt"`)

    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "roles_id_seq"`)
    await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "id" TYPE integer USING nextval('roles_id_seq')`)
    await queryRunner.query(`ALTER SEQUENCE "roles_id_seq" OWNED BY "roles"."id"`)
    await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "id" SET DEFAULT nextval('roles_id_seq')`)

    await queryRunner.query(`ALTER TABLE "user_roles" ALTER COLUMN "role_id" TYPE integer USING 0`)

    await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id", "role_id")`)
    await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users" (id) ON DELETE CASCADE`)
    await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "fk_role" FOREIGN KEY ("role_id") REFERENCES "roles" (id) ON DELETE CASCADE`)
  }
}