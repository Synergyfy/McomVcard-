import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCampaignTables1712000000025 implements MigrationInterface {
  name = 'CreateCampaignTables1712000000025'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // campaigns — spec §42. Business 1 ─── N Campaign 1 ─── N Offer 1 ─── N Coupon.
    // Campaigns may optionally be associated with a Season (season_id nullable).
    await queryRunner.query(`
      CREATE TABLE "campaigns" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "business_id" uuid NOT NULL,
        "season_id" uuid,
        "name" character varying(150) NOT NULL,
        "type" character varying(40) NOT NULL DEFAULT 'EVERGREEN',
        "status" character varying(40) NOT NULL DEFAULT 'draft',
        "description" text,
        "budget" numeric(12, 2),
        "starts_at" TIMESTAMPTZ,
        "ends_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_campaigns" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_campaigns_business" ON "campaigns" ("business_id")`)
    await queryRunner.query(`CREATE INDEX "idx_campaigns_season" ON "campaigns" ("season_id")`)

    await queryRunner.query(`
      ALTER TABLE "campaigns"
        ADD CONSTRAINT "fk_campaigns_business" FOREIGN KEY ("business_id") REFERENCES "businesses" ("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "campaigns"
        ADD CONSTRAINT "fk_campaigns_season" FOREIGN KEY ("season_id") REFERENCES "seasons" ("id") ON DELETE SET NULL
    `)

    // offers — a single promotion inside a campaign, with a discount.
    await queryRunner.query(`
      CREATE TABLE "offers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "campaign_id" uuid NOT NULL,
        "business_id" uuid NOT NULL,
        "title" character varying(150) NOT NULL,
        "description" text,
        "discount_type" character varying(20) NOT NULL DEFAULT 'PERCENT',
        "discount_value" numeric(10, 2) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_offers" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_offers_campaign" ON "offers" ("campaign_id")`)
    await queryRunner.query(`CREATE INDEX "idx_offers_business" ON "offers" ("business_id")`)

    await queryRunner.query(`
      ALTER TABLE "offers"
        ADD CONSTRAINT "fk_offers_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns" ("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "offers"
        ADD CONSTRAINT "fk_offers_business" FOREIGN KEY ("business_id") REFERENCES "businesses" ("id") ON DELETE CASCADE
    `)

    // coupons — redeemable discount codes attached to an offer.
    await queryRunner.query(`
      CREATE TABLE "coupons" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "offer_id" uuid NOT NULL,
        "business_id" uuid NOT NULL,
        "code" character varying(50) NOT NULL,
        "discount_type" character varying(20) NOT NULL DEFAULT 'PERCENT',
        "discount_value" numeric(10, 2) NOT NULL,
        "max_uses" integer NOT NULL DEFAULT 0,
        "used_count" integer NOT NULL DEFAULT 0,
        "expires_at" TIMESTAMPTZ,
        "status" character varying(40) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_coupons" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`CREATE UNIQUE INDEX "uq_coupons_code" ON "coupons" ("code")`)
    await queryRunner.query(`CREATE INDEX "idx_coupons_offer" ON "coupons" ("offer_id")`)
    await queryRunner.query(`CREATE INDEX "idx_coupons_business" ON "coupons" ("business_id")`)

    await queryRunner.query(`
      ALTER TABLE "coupons"
        ADD CONSTRAINT "fk_coupons_offer" FOREIGN KEY ("offer_id") REFERENCES "offers" ("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "coupons"
        ADD CONSTRAINT "fk_coupons_business" FOREIGN KEY ("business_id") REFERENCES "businesses" ("id") ON DELETE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "coupons"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "offers"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "campaigns"`)
  }
}