import { MigrationInterface, QueryRunner } from 'typeorm'

export class RelaxPlanLevelAudienceUnique1712000000037 implements MigrationInterface {
  name = 'RelaxPlanLevelAudienceUnique1712000000037'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Plans are identified by their free-form `name` (matching how Mall and
    // Rewards store tiers). `level`/`audience` become non-unique metadata so
    // MCOM Solutions can create plans with arbitrary names.
    await queryRunner.query(`ALTER TABLE "plans" DROP CONSTRAINT "uq_plans_level_audience"`)
    await queryRunner.query(`CREATE UNIQUE INDEX "uq_plans_name" ON "plans" ("name") WHERE "name" IS NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "uq_plans_name"`)
    await queryRunner.query(`ALTER TABLE "plans" ADD CONSTRAINT "uq_plans_level_audience" UNIQUE ("level", "audience")`)
  }
}