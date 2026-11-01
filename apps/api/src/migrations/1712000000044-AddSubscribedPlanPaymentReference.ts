import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Local plan entitlements are activated by MCOM Pay wallet charges. The charge
 * id is stored on the subscription so an at-least-once webhook or a client
 * retry can never extend the same paid period twice.
 */
export class AddSubscribedPlanPaymentReference1712000000044 implements MigrationInterface {
  name = 'AddSubscribedPlanPaymentReference1712000000044'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscribed_plans" ADD COLUMN IF NOT EXISTS "payment_reference" character varying(255)`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_subscribed_plans_payment_reference" ON "subscribed_plans" ("payment_reference") WHERE "payment_reference" IS NOT NULL`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_subscribed_plans_payment_reference"`)
    await queryRunner.query(`ALTER TABLE "subscribed_plans" DROP COLUMN IF EXISTS "payment_reference"`)
  }
}
