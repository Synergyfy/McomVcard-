import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Plans are now free-form by name and expose three fixed-duration variants:
 * Standard (90 days), Pro (180 days) and Pro+ (365 days). The legacy `level`
 * label becomes optional metadata.
 *
 * Existing plans keep working: when `variants` is null the API derives the
 * three variants from the legacy `tiers` pricing matrix.
 */
export class AddPlanVariants1712000000043 implements MigrationInterface {
  name = 'AddPlanVariants1712000000043'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "variants" jsonb`)
    await queryRunner.query(`ALTER TABLE "plans" ALTER COLUMN "level" DROP NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN IF EXISTS "variants"`)
    await queryRunner.query(`UPDATE "plans" SET "level" = 'Custom' WHERE "level" IS NULL`)
    await queryRunner.query(`ALTER TABLE "plans" ALTER COLUMN "level" SET NOT NULL`)
  }
}
