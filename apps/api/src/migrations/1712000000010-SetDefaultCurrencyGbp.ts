import { MigrationInterface, QueryRunner } from 'typeorm'

export class SetDefaultCurrencyGbp1712000000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "currency" SET DEFAULT 'GBP'`)
    await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "currency" SET DEFAULT 'GBP'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "currency" SET DEFAULT 'USD'`)
    await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "currency" SET DEFAULT 'USD'`)
  }
}