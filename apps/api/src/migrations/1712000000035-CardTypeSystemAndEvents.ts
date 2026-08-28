import { MigrationInterface, QueryRunner } from 'typeorm'

export class CardTypeSystemAndEvents1712000000035 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Extend cards table with new type system
    await queryRunner.query(`
      ALTER TABLE "cards"
      ADD COLUMN "card_product" character varying NOT NULL DEFAULT 'VCARD',
      ADD COLUMN "audience" character varying NOT NULL DEFAULT 'BUSINESS'
    `)

    // Update existing cards based on current type
    await queryRunner.query(`
      UPDATE "cards"
      SET "card_product" = 'VCARD',
          "audience" = 'BUSINESS'
      WHERE "type" = 'BUSINESS'
    `)

    await queryRunner.query(`
      UPDATE "cards"
      SET "card_product" = 'VCARD',
          "audience" = 'CONSUMER'
      WHERE "type" = 'PERSONAL'
    `)

    // 2. Create events table
    await queryRunner.query(`
      CREATE TABLE "events" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "business_id" uuid NOT NULL,
        "card_id" uuid,
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "hero_image" character varying,
        "starts_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "ends_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "timezone" character varying NOT NULL DEFAULT 'UTC',
        "location" character varying,
        "is_virtual" boolean NOT NULL DEFAULT false,
        "virtual_url" character varying,
        "status" character varying NOT NULL DEFAULT 'draft',
        "max_attendees" integer,
        "waitlist_enabled" boolean NOT NULL DEFAULT false,
        "cancellation_policy" text,
        "requires_approval" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_events" PRIMARY KEY ("id"),
        CONSTRAINT "uq_events_slug" UNIQUE ("slug")
      )
    `)

    await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "fk_events_business" FOREIGN KEY ("business_id") REFERENCES "businesses" ("id") ON DELETE CASCADE`)
    await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "fk_events_card" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE SET NULL`)
    await queryRunner.query(`CREATE INDEX "idx_events_business" ON "events" ("business_id")`)
    await queryRunner.query(`CREATE INDEX "idx_events_card" ON "events" ("card_id")`)
    await queryRunner.query(`CREATE INDEX "idx_events_starts_at" ON "events" ("starts_at")`)
    await queryRunner.query(`CREATE INDEX "idx_events_status" ON "events" ("status")`)

    // 3. Create event_tickets table
    await queryRunner.query(`
      CREATE TABLE "event_tickets" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "event_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "price" numeric(10,2) NOT NULL DEFAULT 0,
        "currency" character varying(3) NOT NULL DEFAULT 'GBP',
        "quantity" integer,
        "sold" integer NOT NULL DEFAULT 0,
        "max_per_order" integer NOT NULL DEFAULT 10,
        "sales_starts_at" TIMESTAMP WITH TIME ZONE,
        "sales_ends_at" TIMESTAMP WITH TIME ZONE,
        "is_active" boolean NOT NULL DEFAULT true,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_event_tickets" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`ALTER TABLE "event_tickets" ADD CONSTRAINT "fk_event_tickets_event" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE`)
    await queryRunner.query(`CREATE INDEX "idx_event_tickets_event" ON "event_tickets" ("event_id")`)

    // 4. Create event_registrations table
    await queryRunner.query(`
      CREATE TABLE "event_registrations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "event_id" uuid NOT NULL,
        "ticket_id" uuid NOT NULL,
        "user_id" uuid,
        "customer_name" character varying NOT NULL,
        "customer_email" character varying NOT NULL,
        "customer_phone" character varying,
        "quantity" integer NOT NULL DEFAULT 1,
        "total_paid" numeric(10,2) NOT NULL DEFAULT 0,
        "currency" character varying(3) NOT NULL DEFAULT 'GBP',
        "status" character varying NOT NULL DEFAULT 'pending',
        "checked_in_at" TIMESTAMP WITH TIME ZONE,
        "notes" text,
        "metadata" jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_event_registrations" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`ALTER TABLE "event_registrations" ADD CONSTRAINT "fk_event_registrations_event" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE`)
    await queryRunner.query(`ALTER TABLE "event_registrations" ADD CONSTRAINT "fk_event_registrations_ticket" FOREIGN KEY ("ticket_id") REFERENCES "event_tickets" ("id") ON DELETE RESTRICT`)
    await queryRunner.query(`ALTER TABLE "event_registrations" ADD CONSTRAINT "fk_event_registrations_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL`)
    await queryRunner.query(`CREATE INDEX "idx_event_registrations_event" ON "event_registrations" ("event_id")`)
    await queryRunner.query(`CREATE INDEX "idx_event_registrations_user" ON "event_registrations" ("user_id")`)
    await queryRunner.query(`CREATE INDEX "idx_event_registrations_status" ON "event_registrations" ("status")`)

    // 5. Add template customization fields
    await queryRunner.query(`
      ALTER TABLE "templates"
      ADD COLUMN "required_membership_level" character varying,
      ADD COLUMN "is_premium" boolean NOT NULL DEFAULT false
    `)

    await queryRunner.query(`
      ALTER TABLE "template_fields"
      ADD COLUMN "editable_by_membership_level" character varying
    `)

    // 6. Add password protection and access layers to card_access
    // Note: protected_sections already exists from migration 007
    await queryRunner.query(`
      ALTER TABLE "card_access"
      ADD COLUMN IF NOT EXISTS "public_sections" jsonb DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS "interactive_sections" jsonb DEFAULT '[]'::jsonb
    `)

    // Initialize new columns for existing rows
    await queryRunner.query(`
      UPDATE "card_access"
      SET "public_sections" = '[]'::jsonb,
          "interactive_sections" = '[]'::jsonb
      WHERE "public_sections" IS NULL OR "interactive_sections" IS NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "event_registrations"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "event_tickets"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "events"`)
    await queryRunner.query(`ALTER TABLE "card_access" DROP COLUMN IF EXISTS "public_sections", DROP COLUMN IF EXISTS "interactive_sections"`)
    await queryRunner.query(`ALTER TABLE "template_fields" DROP COLUMN IF EXISTS "editable_by_membership_level"`)
    await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN IF EXISTS "required_membership_level", DROP COLUMN IF EXISTS "is_premium"`)
    await queryRunner.query(`ALTER TABLE "cards" DROP COLUMN IF EXISTS "card_product", DROP COLUMN IF EXISTS "audience"`)
  }
}