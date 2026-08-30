import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateMcomWebhookEvents1712000000038 implements MigrationInterface {
  name = 'CreateMcomWebhookEvents1712000000038'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "mcom_webhook_events" (
        "event_hash" character varying(64) PRIMARY KEY,
        "event" character varying NOT NULL,
        "platform" character varying NOT NULL,
        "package_id" character varying,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `)
    await queryRunner.query(`CREATE INDEX "idx_mcom_webhook_events_package" ON "mcom_webhook_events" ("package_id")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_mcom_webhook_events_package"`)
    await queryRunner.query(`DROP TABLE "mcom_webhook_events"`)
  }
}