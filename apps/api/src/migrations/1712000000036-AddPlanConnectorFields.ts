import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPlanConnectorFields1712000000036 implements MigrationInterface {
  name = 'AddPlanConnectorFields1712000000036'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "plans" ADD COLUMN "configuration" jsonb`)
    await queryRunner.query(`ALTER TABLE "plans" ADD COLUMN "is_default" boolean NOT NULL DEFAULT false`)
    await queryRunner.query(`ALTER TABLE "plans" ADD COLUMN "stripe_monthly_price_id" character varying`)
    await queryRunner.query(`ALTER TABLE "plans" ADD COLUMN "stripe_quarterly_price_id" character varying`)
    await queryRunner.query(`ALTER TABLE "plans" ADD COLUMN "stripe_annual_price_id" character varying`)
    await queryRunner.query(`ALTER TABLE "plans" ADD COLUMN "paypal_monthly_plan_id" character varying`)
    await queryRunner.query(`ALTER TABLE "plans" ADD COLUMN "paypal_quarterly_plan_id" character varying`)
    await queryRunner.query(`ALTER TABLE "plans" ADD COLUMN "paypal_annual_plan_id" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "paypal_annual_plan_id"`)
    await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "paypal_quarterly_plan_id"`)
    await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "paypal_monthly_plan_id"`)
    await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "stripe_annual_price_id"`)
    await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "stripe_quarterly_price_id"`)
    await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "stripe_monthly_price_id"`)
    await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "is_default"`)
    await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "configuration"`)
  }
}