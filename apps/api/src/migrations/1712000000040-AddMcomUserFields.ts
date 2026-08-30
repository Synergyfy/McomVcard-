import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMcomUserFields1712000000040 implements MigrationInterface {
  name = 'AddMcomUserFields1712000000040'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "mcom_membership_tier" character varying`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "mcom_token_expires_at" timestamptz`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mcom_token_expires_at"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mcom_membership_tier"`)
  }
}