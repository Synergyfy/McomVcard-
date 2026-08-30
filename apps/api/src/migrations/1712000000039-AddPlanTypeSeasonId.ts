import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPlanTypeSeasonId1712000000039 implements MigrationInterface {
  name = 'AddPlanTypeSeasonId1712000000039'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "plans" ADD COLUMN "type" character varying NOT NULL DEFAULT 'STANDARD'`)
    await queryRunner.query(`ALTER TABLE "plans" ADD COLUMN "season_id" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "season_id"`)
    await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "type"`)
  }
}