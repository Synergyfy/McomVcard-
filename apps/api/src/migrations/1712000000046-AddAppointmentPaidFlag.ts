import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAppointmentPaidFlag1712000000046 implements MigrationInterface {
  name = 'AddAppointmentPaidFlag1712000000046'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "is_paid" boolean NOT NULL DEFAULT false`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN IF EXISTS "is_paid"`)
  }
}
