import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreatePlanTables1712000000029 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "plans" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "level" character varying(20) NOT NULL,
        "audience" character varying(20) NOT NULL,
        "name" character varying,
        "tagline" text,
        "popular" boolean NOT NULL DEFAULT false,
        "sort_order" integer NOT NULL DEFAULT 0,
        "features" jsonb,
        "rules" jsonb,
        "tiers" jsonb,
        "sections" jsonb,
        "annual_discount" jsonb,
        "currency" character varying(3) NOT NULL DEFAULT 'GBP',
        "status" character varying NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_plans" PRIMARY KEY ("id"),
        CONSTRAINT "uq_plans_level_audience" UNIQUE ("level", "audience")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_plans_audience_sort" ON "plans" ("audience", "sort_order")`)
    await queryRunner.query(`CREATE INDEX "idx_plans_status" ON "plans" ("status")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "plans"`)
  }
}