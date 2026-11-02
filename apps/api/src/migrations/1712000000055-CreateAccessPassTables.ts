import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Access passes: a single-duration alternative to plans. Each pass grants one
 * bundle of quotas/feature flags for a configured number of days at a one-off
 * price. Purchases are tracked separately so entitlements can be resolved and
 * expired without touching the plan/subscription ledger.
 */
export class CreateAccessPassTables1712000000055 implements MigrationInterface {
  name = 'CreateAccessPassTables1712000000055'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "access_passes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "description" text,
        "price" numeric(10,2) NOT NULL DEFAULT 0,
        "duration_days" integer NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'GBP',
        "status" character varying(20) NOT NULL DEFAULT 'active',
        "features" jsonb,
        "configuration" jsonb,
        "stripe_price_id" character varying,
        "paypal_plan_id" character varying,
        "popular" boolean NOT NULL DEFAULT false,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_access_passes" PRIMARY KEY ("id"),
        CONSTRAINT "uq_access_passes_name" UNIQUE ("name")
      )
    `)

    await queryRunner.query(
      `CREATE INDEX "idx_access_passes_status_sort" ON "access_passes" ("status", "sort_order")`,
    )

    await queryRunner.query(`
      CREATE TABLE "access_pass_purchases" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "access_pass_id" uuid NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'active',
        "started_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "payment_reference" character varying(255),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_access_pass_purchases" PRIMARY KEY ("id"),
        CONSTRAINT "fk_access_pass_purchases_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_access_pass_purchases_pass" FOREIGN KEY ("access_pass_id") REFERENCES "access_passes"("id") ON DELETE CASCADE
      )
    `)

    await queryRunner.query(
      `CREATE INDEX "idx_access_pass_purchases_user_status" ON "access_pass_purchases" ("user_id", "status")`,
    )
    await queryRunner.query(
      `CREATE INDEX "idx_access_pass_purchases_pass" ON "access_pass_purchases" ("access_pass_id")`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_access_pass_purchases_payment_reference" ON "access_pass_purchases" ("payment_reference") WHERE "payment_reference" IS NOT NULL`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "access_pass_purchases"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "access_passes"`)
  }
}
