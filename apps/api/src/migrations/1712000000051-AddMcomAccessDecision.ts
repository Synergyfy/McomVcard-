import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Persist the normalized Central entitlement decision alongside the raw
 * entitlement. The decision records the access source (membership / direct /
 * trial), the resolved plan, expiry, quotas/limits/features and trial tasks so
 * the API and SPA can render and enforce access without re-deriving it.
 */
export class AddMcomAccessDecision1712000000051 implements MigrationInterface {
  name = 'AddMcomAccessDecision1712000000051'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mcom_access" jsonb`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "mcom_access"`)
  }
}
