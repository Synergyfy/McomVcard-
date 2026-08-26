import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCampaignTemplates1712000000034 implements MigrationInterface {
  name = 'CreateCampaignTemplates1712000000034'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "campaign_templates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(150) NOT NULL,
        "type" character varying(40) NOT NULL DEFAULT 'Evergreen',
        "description" text,
        "suggested_reward" character varying(255),
        "status" character varying(20) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_campaign_templates" PRIMARY KEY ("id")
      )
    `)

    // Seed the 3 default templates from the frontend mock
    await queryRunner.query(`
      INSERT INTO "campaign_templates" ("name", "type", "description", "suggested_reward", "status") VALUES
        ('Spring Expo Promo', 'Seasonal', 'Seasonal push timed to the Spring Expo — drive footfall and limited-time offers.', 'Seasonal vouchers and limited-time discounts', 'active'),
        ('Loyalty Boost', 'Evergreen', 'Always-on points boost to keep customers coming back all year round.', '2x loyalty points on every visit', 'active'),
        ('Referral Rewards', 'Referral', 'Reward customers who bring friends into your business.', 'Free item or discount for every friend referred', 'active')
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "campaign_templates"`)
  }
}
