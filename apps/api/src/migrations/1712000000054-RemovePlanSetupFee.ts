import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * There is no setup fee. A customer pays the variant price once and the
 * variant's benefits are activated immediately, so `setupFee` is removed from
 * both the legacy tier matrix and the variant JSON.
 */
export class RemovePlanSetupFee1712000000054 implements MigrationInterface {
  name = 'RemovePlanSetupFee1712000000054'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "plans"
      SET "tiers" = (
        SELECT jsonb_object_agg(key, value - 'setupFee')
        FROM jsonb_each("tiers")
      )
      WHERE "tiers" IS NOT NULL
    `)

    await queryRunner.query(`
      UPDATE "plans"
      SET "variants" = (
        SELECT jsonb_object_agg(key, value - 'setupFee')
        FROM jsonb_each("variants")
      )
      WHERE "variants" IS NOT NULL
    `)
  }

  public async down(): Promise<void> {
    // Removed data cannot be restored.
  }
}
