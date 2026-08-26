import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCardMetadataColumns1712000000031 implements MigrationInterface {
  name = 'AddCardMetadataColumns1712000000031'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cards" ADD COLUMN "name" varchar(200)`)
    await queryRunner.query(`ALTER TABLE "cards" ADD COLUMN "description" text`)
    await queryRunner.query(`ALTER TABLE "cards" ADD COLUMN "category" varchar(100)`)
    await queryRunner.query(`ALTER TABLE "cards" ADD COLUMN "url_slug" varchar(200)`)
    await queryRunner.query(`ALTER TABLE "cards" ADD COLUMN "assigned_at" timestamptz`)
    await queryRunner.query(`ALTER TABLE "cards" ADD COLUMN "last_admin_update" timestamptz`)
    await queryRunner.query(`ALTER TABLE "cards" ADD COLUMN "views" integer NOT NULL DEFAULT 0`)
    await queryRunner.query(`ALTER TABLE "cards" ADD COLUMN "scans" integer NOT NULL DEFAULT 0`)
    await queryRunner.query(`ALTER TABLE "cards" ADD COLUMN "shares" integer NOT NULL DEFAULT 0`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cards" DROP COLUMN "shares"`)
    await queryRunner.query(`ALTER TABLE "cards" DROP COLUMN "scans"`)
    await queryRunner.query(`ALTER TABLE "cards" DROP COLUMN "views"`)
    await queryRunner.query(`ALTER TABLE "cards" DROP COLUMN "last_admin_update"`)
    await queryRunner.query(`ALTER TABLE "cards" DROP COLUMN "assigned_at"`)
    await queryRunner.query(`ALTER TABLE "cards" DROP COLUMN "url_slug"`)
    await queryRunner.query(`ALTER TABLE "cards" DROP COLUMN "category"`)
    await queryRunner.query(`ALTER TABLE "cards" DROP COLUMN "description"`)
    await queryRunner.query(`ALTER TABLE "cards" DROP COLUMN "name"`)
  }
}
