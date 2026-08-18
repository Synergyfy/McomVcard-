import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserSettings1712000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "language" character varying NOT NULL DEFAULT 'en'`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "theme_mode" character varying NOT NULL DEFAULT 'light'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "theme_mode"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "language"`)
  }
}