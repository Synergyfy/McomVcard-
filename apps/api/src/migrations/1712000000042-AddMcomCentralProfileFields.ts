import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Persist the canonical Central Hub Solution identity snapshot on the local
 * user. Central remains the source of truth; these columns are refreshed on
 * every SSO login / sync so the app can render and authorize locally.
 */
export class AddMcomCentralProfileFields1712000000042 implements MigrationInterface {
  name = 'AddMcomCentralProfileFields1712000000042'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mcom_role" character varying`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mcom_profile_type" character varying`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_affiliate" boolean NOT NULL DEFAULT false`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "job_title" character varying`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address" text`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "postcode" character varying`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "country" character varying`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "company_name" character varying`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "company_type" character varying`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "company_industry" character varying`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "company_website" text`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "company_logo" text`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mcom_business_id" character varying`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mcom_profile" jsonb`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mcom_entitlement" jsonb`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mcom_last_sync_at" timestamptz`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "mcom_last_sync_at"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "mcom_entitlement"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "mcom_profile"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "mcom_business_id"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "company_logo"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "company_website"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "company_industry"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "company_type"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "company_name"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "country"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "postcode"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "address"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "job_title"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "is_affiliate"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "mcom_profile_type"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "mcom_role"`)
  }
}
