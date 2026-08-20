import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateReviewTables1712000000026 implements MigrationInterface {
  name = 'CreateReviewTables1712000000026'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // reviews — spec §43. User 1 ───── N Reviews N ───── 1 Business.
    // One review per user per business; status gates visibility (moderation).
    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "business_id" uuid NOT NULL,
        "rating" integer NOT NULL,
        "comment" text,
        "status" character varying(40) NOT NULL DEFAULT 'approved',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_reviews" PRIMARY KEY ("id"),
        CONSTRAINT "uq_reviews_user_business" UNIQUE ("user_id", "business_id"),
        CONSTRAINT "chk_reviews_rating" CHECK ("rating" >= 1 AND "rating" <= 5)
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_reviews_business" ON "reviews" ("business_id")`)
    await queryRunner.query(`CREATE INDEX "idx_reviews_user" ON "reviews" ("user_id")`)

    await queryRunner.query(`
      ALTER TABLE "reviews"
        ADD CONSTRAINT "fk_reviews_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "reviews"
        ADD CONSTRAINT "fk_reviews_business" FOREIGN KEY ("business_id") REFERENCES "businesses" ("id") ON DELETE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "reviews"`)
  }
}