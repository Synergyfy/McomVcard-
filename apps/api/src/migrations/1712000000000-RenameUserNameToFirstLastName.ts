import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameUserNameToFirstLastName1712000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "firstName" character varying`)
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "lastName" character varying`)

    // Migrate existing data: first word -> firstName, remainder -> lastName
    await queryRunner.query(`UPDATE "users" SET "firstName" = split_part("name", ' ', 1)`)
    await queryRunner.query(`
      UPDATE "users"
      SET "lastName" = NULLIF(substr("name", strpos("name", ' ') + 1), '')
      WHERE strpos("name", ' ') > 0
    `)

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "name" character varying`)
    await queryRunner.query(`UPDATE "users" SET "name" = trim(concat("firstName", ' ', "lastName"))`)

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "firstName"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastName"`)
  }
}