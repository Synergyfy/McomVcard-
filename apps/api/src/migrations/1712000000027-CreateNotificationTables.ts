import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateNotificationTables1712000000027 implements MigrationInterface {
  name = 'CreateNotificationTables1712000000027'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // notifications — spec §44. User 1 ───── N Notifications.
    // Delivery is abstracted (NotificationService provider, switchable later);
    // rows here are the durable in-app record.
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "type" character varying(50) NOT NULL,
        "title" character varying(150) NOT NULL,
        "message" character varying(2000),
        "data" jsonb,
        "read_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_notifications" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_notifications_user" ON "notifications" ("user_id")`)
    await queryRunner.query(`CREATE INDEX "idx_notifications_user_read" ON "notifications" ("user_id", "read_at")`)

    await queryRunner.query(`
      ALTER TABLE "notifications"
        ADD CONSTRAINT "fk_notifications_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`)
  }
}