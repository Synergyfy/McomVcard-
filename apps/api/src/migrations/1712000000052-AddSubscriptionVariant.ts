import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Persist the purchased plan variant (standard / pro / pro_plus) on the
 * subscription. Capability resolution needs the exact variant, not just the
 * plan, because each variant can override quotas and feature flags.
 */
export class AddSubscriptionVariant1712000000052 implements MigrationInterface {
  name = 'AddSubscriptionVariant1712000000052'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscribed_plans" ADD COLUMN IF NOT EXISTS "variant" character varying(20)`,
    )

    // Backfill from the tier the activation flow already wrote to the user.
    await queryRunner.query(`
      UPDATE "subscribed_plans" sp
      SET "variant" = CASE LOWER(TRIM(u."mcom_membership_tier"))
        WHEN 'standard' THEN 'standard'
        WHEN 'pro' THEN 'pro'
        WHEN 'pro+' THEN 'pro_plus'
        WHEN 'pro_plus' THEN 'pro_plus'
        ELSE NULL
      END
      FROM "users" u
      WHERE u."id" = sp."user_id" AND sp."variant" IS NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "subscribed_plans" DROP COLUMN IF EXISTS "variant"`)
  }
}
