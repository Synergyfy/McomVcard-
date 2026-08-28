import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMcomSsoFields1712000000035 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "mcom_user_id" character varying`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "mcom_membership_level" character varying`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "mcom_membership_status" character varying`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "mcom_can_access_vcard" boolean NOT NULL DEFAULT false`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "mcom_access_token" text`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "mcom_refresh_token" text`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "mcom_tokens_updated_at" timestamptz`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mcom_tokens_updated_at"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mcom_refresh_token"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mcom_access_token"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mcom_can_access_vcard"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mcom_membership_status"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mcom_membership_level"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mcom_user_id"`)
  }
}