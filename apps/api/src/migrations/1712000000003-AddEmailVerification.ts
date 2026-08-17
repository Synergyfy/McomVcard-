import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddEmailVerification1712000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "is_verified" boolean NOT NULL DEFAULT false`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "email_verified_at" TIMESTAMP WITH TIME ZONE`)

    await queryRunner.query(`
      CREATE TABLE "verification_codes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "code_hash" character varying NOT NULL,
        "type" character varying NOT NULL DEFAULT 'email_verify',
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "consumed_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "fk_verification_code_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_verification_codes_user_id" ON "verification_codes" ("user_id")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "verification_codes"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email_verified_at"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_verified"`)
  }
}