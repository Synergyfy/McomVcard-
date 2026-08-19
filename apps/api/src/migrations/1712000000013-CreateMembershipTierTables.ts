import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateMembershipTierTables1712000000013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // membership_tiers (platform-wide — tier holds its own discount, DB-driven, no hardcoded rules)
    await queryRunner.query(`
      CREATE TABLE "membership_tiers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "description" text,
        "discount_type" character varying NOT NULL DEFAULT 'percentage',
        "discount_value" numeric(10,2) NOT NULL DEFAULT 0,
        "sort_order" integer NOT NULL DEFAULT 0,
        "status" character varying NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_membership_tiers" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_membership_tiers_status" ON "membership_tiers" ("status")`)

    // benefits (platform-wide perks attached to tiers via the join table)
    await queryRunner.query(`
      CREATE TABLE "benefits" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "description" text,
        "benefit_type" character varying NOT NULL DEFAULT 'perk',
        "status" character varying NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_benefits" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_benefits_status" ON "benefits" ("status")`)

    // membership_benefits (MembershipTier N:M Benefit — join with metadata)
    await queryRunner.query(`
      CREATE TABLE "membership_benefits" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "membership_tier_id" uuid NOT NULL,
        "benefit_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_membership_benefits" PRIMARY KEY ("id"),
        CONSTRAINT "uq_membership_benefits_tier_benefit" UNIQUE ("membership_tier_id", "benefit_id")
      )
    `)

    await queryRunner.query(`ALTER TABLE "membership_benefits" ADD CONSTRAINT "fk_membership_benefits_tier" FOREIGN KEY ("membership_tier_id") REFERENCES "membership_tiers" (id) ON DELETE CASCADE`)
    await queryRunner.query(`ALTER TABLE "membership_benefits" ADD CONSTRAINT "fk_membership_benefits_benefit" FOREIGN KEY ("benefit_id") REFERENCES "benefits" (id) ON DELETE CASCADE`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "membership_benefits"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "benefits"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "membership_tiers"`)
  }
}