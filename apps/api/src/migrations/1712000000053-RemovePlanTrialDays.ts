import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Local plan trials are not used. Trials come from MCOM Central Hub's
 * entitlement/trial programme, so plan variants and the legacy tier matrix no
 * longer carry `trialDays`.
 */
export class RemovePlanTrialDays1712000000053 implements MigrationInterface {
  name = 'RemovePlanTrialDays1712000000053'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "plans"
      SET "tiers" = (
        SELECT jsonb_object_agg(key, value - 'trialDays')
        FROM jsonb_each("tiers")
      )
      WHERE "tiers" IS NOT NULL
    `)

    await queryRunner.query(`
      UPDATE "plans"
      SET "variants" = (
        SELECT jsonb_object_agg(key, value - 'trialDays')
        FROM jsonb_each("variants")
      )
      WHERE "variants" IS NOT NULL
    `)
  }

  public async down(): Promise<void> {
    // Removed data cannot be restored.
  }
}
