import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateDashboardAnalyticsTables1712000000029 implements MigrationInterface {
  name = 'CreateDashboardAnalyticsTables1712000000029'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // activity_logs — unified chronological event feed per business
    await queryRunner.query(`
      CREATE TABLE "activity_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "business_id" uuid NOT NULL,
        "user_id" uuid,
        "type" character varying(50) NOT NULL,
        "title" character varying(200) NOT NULL,
        "description" character varying(500),
        "metadata" jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_activity_logs" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`CREATE INDEX "idx_activity_logs_business" ON "activity_logs" ("business_id")`)
    await queryRunner.query(`CREATE INDEX "idx_activity_logs_business_created" ON "activity_logs" ("business_id", "created_at" DESC)`)
    await queryRunner.query(`
      ALTER TABLE "activity_logs"
        ADD CONSTRAINT "fk_activity_logs_business" FOREIGN KEY ("business_id") REFERENCES "businesses" ("id") ON DELETE CASCADE
    `)
    await queryRunner.query(`
      ALTER TABLE "activity_logs"
        ADD CONSTRAINT "fk_activity_logs_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL
    `)

    // analytics_events — tracks profile views, QR scans, and card visits
    await queryRunner.query(`
      CREATE TABLE "analytics_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "business_id" uuid NOT NULL,
        "event_type" character varying(50) NOT NULL,
        "card_id" uuid,
        "metadata" jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_analytics_events" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`CREATE INDEX "idx_analytics_events_business" ON "analytics_events" ("business_id")`)
    await queryRunner.query(`CREATE INDEX "idx_analytics_events_business_type" ON "analytics_events" ("business_id", "event_type")`)
    await queryRunner.query(`CREATE INDEX "idx_analytics_events_business_created" ON "analytics_events" ("business_id", "created_at" DESC)`)
    await queryRunner.query(`
      ALTER TABLE "analytics_events"
        ADD CONSTRAINT "fk_analytics_events_business" FOREIGN KEY ("business_id") REFERENCES "businesses" ("id") ON DELETE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "analytics_events"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "activity_logs"`)
  }
}
