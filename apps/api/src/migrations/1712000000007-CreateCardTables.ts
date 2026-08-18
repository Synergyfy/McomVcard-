import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCardTables1712000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // templates
    await queryRunner.query(`
      CREATE TABLE "templates" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "path" character varying,
        "preview_url" character varying,
        "category" character varying,
        "status" character varying NOT NULL DEFAULT 'published',
        "is_business" boolean NOT NULL DEFAULT false,
        "is_consumer" boolean NOT NULL DEFAULT true,
        "font_family" character varying,
        "primary_color" character varying,
        "secondary_color" character varying,
        "button_style" character varying,
        "logo_position" character varying,
        "bg_style" character varying,
        "sections" jsonb,
        "usage" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_templates" PRIMARY KEY ("id"),
        CONSTRAINT "uq_templates_slug" UNIQUE ("slug")
      )
    `)

    // template_fields
    await queryRunner.query(`
      CREATE TABLE "template_fields" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "template_id" uuid NOT NULL,
        "field_key" character varying NOT NULL,
        "label" character varying NOT NULL,
        "field_type" character varying NOT NULL DEFAULT 'text',
        "is_editable" boolean NOT NULL DEFAULT true,
        "is_required" boolean NOT NULL DEFAULT false,
        "display_order" integer NOT NULL DEFAULT 0,
        "options" jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_template_fields" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`ALTER TABLE "template_fields" ADD CONSTRAINT "fk_template_fields_template" FOREIGN KEY ("template_id") REFERENCES "templates" (id) ON DELETE CASCADE`)
    await queryRunner.query(`CREATE INDEX "idx_template_fields_template" ON "template_fields" ("template_id")`)

    // cards
    await queryRunner.query(`
      CREATE TABLE "cards" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "owner_id" uuid NOT NULL,
        "business_id" uuid,
        "template_id" uuid,
        "type" character varying NOT NULL DEFAULT 'PERSONAL',
        "slug" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_cards" PRIMARY KEY ("id"),
        CONSTRAINT "uq_cards_slug" UNIQUE ("slug")
      )
    `)

    await queryRunner.query(`ALTER TABLE "cards" ADD CONSTRAINT "fk_cards_owner" FOREIGN KEY ("owner_id") REFERENCES "users" (id) ON DELETE CASCADE`)
    await queryRunner.query(`ALTER TABLE "cards" ADD CONSTRAINT "fk_cards_business" FOREIGN KEY ("business_id") REFERENCES "businesses" (id) ON DELETE CASCADE`)
    await queryRunner.query(`ALTER TABLE "cards" ADD CONSTRAINT "fk_cards_template" FOREIGN KEY ("template_id") REFERENCES "templates" (id) ON DELETE SET NULL`)
    await queryRunner.query(`CREATE INDEX "idx_cards_owner" ON "cards" ("owner_id")`)
    await queryRunner.query(`CREATE INDEX "idx_cards_business" ON "cards" ("business_id")`)
    await queryRunner.query(`CREATE INDEX "idx_cards_template" ON "cards" ("template_id")`)

    // card_profiles (Card 1:1 CardProfile)
    await queryRunner.query(`
      CREATE TABLE "card_profiles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "card_id" uuid NOT NULL,
        "display_name" character varying NOT NULL,
        "bio" text,
        "job_title" character varying,
        "email" character varying,
        "phone" character varying,
        "avatar" character varying,
        "cover_image" character varying,
        "location" character varying,
        "website" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_card_profiles" PRIMARY KEY ("id"),
        CONSTRAINT "uq_card_profiles_card" UNIQUE ("card_id")
      )
    `)

    await queryRunner.query(`ALTER TABLE "card_profiles" ADD CONSTRAINT "fk_card_profiles_card" FOREIGN KEY ("card_id") REFERENCES "cards" (id) ON DELETE CASCADE`)

    // card_customizations (Card 1:1 CardCustomization)
    await queryRunner.query(`
      CREATE TABLE "card_customizations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "card_id" uuid NOT NULL,
        "logo" character varying,
        "hero_image" character varying,
        "primary_color" character varying,
        "secondary_color" character varying,
        "font" character varying,
        "layout" character varying,
        "configuration" jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_card_customizations" PRIMARY KEY ("id"),
        CONSTRAINT "uq_card_customizations_card" UNIQUE ("card_id")
      )
    `)

    await queryRunner.query(`ALTER TABLE "card_customizations" ADD CONSTRAINT "fk_card_customizations_card" FOREIGN KEY ("card_id") REFERENCES "cards" (id) ON DELETE CASCADE`)

    // social_links (Card 1:N SocialLinks)
    await queryRunner.query(`
      CREATE TABLE "social_links" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "card_id" uuid NOT NULL,
        "platform" character varying NOT NULL,
        "url" character varying NOT NULL,
        "display_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_social_links" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`ALTER TABLE "social_links" ADD CONSTRAINT "fk_social_links_card" FOREIGN KEY ("card_id") REFERENCES "cards" (id) ON DELETE CASCADE`)
    await queryRunner.query(`CREATE INDEX "idx_social_links_card" ON "social_links" ("card_id")`)

    // card_access (Card 1:1 CardAccess)
    await queryRunner.query(`
      CREATE TABLE "card_access" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "card_id" uuid NOT NULL,
        "is_enabled" boolean NOT NULL DEFAULT false,
        "password_hash" character varying,
        "protected_sections" jsonb,
        "access_expiry" character varying NOT NULL DEFAULT 'never',
        "expires_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_card_access" PRIMARY KEY ("id"),
        CONSTRAINT "uq_card_access_card" UNIQUE ("card_id")
      )
    `)

    await queryRunner.query(`ALTER TABLE "card_access" ADD CONSTRAINT "fk_card_access_card" FOREIGN KEY ("card_id") REFERENCES "cards" (id) ON DELETE CASCADE`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "card_access"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "social_links"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "card_customizations"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "card_profiles"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "cards"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "template_fields"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "templates"`)
  }
}