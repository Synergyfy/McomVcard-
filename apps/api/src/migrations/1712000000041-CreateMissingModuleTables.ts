import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Creates module tables that were never covered by earlier migrations.
 * Generated from the entity metadata; safe to run on an existing database
 * because every object here is missing from the migration history.
 */
export class CreateMissingModuleTables1712000000041 implements MigrationInterface {
  name = 'CreateMissingModuleTables1712000000041'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const queries: string[] = [
    `CREATE TABLE "wishlist_shares" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "wishlist_id" uuid NOT NULL, "shared_with_user_id" uuid NOT NULL, "permission" character varying(10) NOT NULL DEFAULT 'view', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "uq_wishlist_shares" UNIQUE ("wishlist_id", "shared_with_user_id"), CONSTRAINT "PK_acb449396d8fe70d97015d271cb" PRIMARY KEY ("id"))`,
    `CREATE TABLE "testimonials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "authorName" character varying(255) NOT NULL, "author_email" character varying(255), "author_avatar" character varying(500), "content" text NOT NULL, "rating" integer, "is_active" boolean NOT NULL DEFAULT true, "display_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_63b03c608bd258f115a0a4a1060" PRIMARY KEY ("id"))`,
    `CREATE INDEX "IDX_fe4ef5692545e239a464f2ba8f" ON "testimonials" ("display_order") `,
    `CREATE TABLE "subscribed_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "plan_id" uuid NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'active', "started_at" TIMESTAMP WITH TIME ZONE NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9da3ee900aff5087af02a616eea" PRIMARY KEY ("id"))`,
    `CREATE INDEX "IDX_0a64e442392975a3fa4c48890a" ON "subscribed_plans" ("plan_id") `,
    `CREATE INDEX "IDX_066cf0b1db60beec5405ac3409" ON "subscribed_plans" ("user_id", "status") `,
    `CREATE TABLE "settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "value" text NOT NULL DEFAULT '', "group" character varying NOT NULL DEFAULT 'general', "type" character varying NOT NULL DEFAULT 'string', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_c8639b7626fa94ba8265628f214" UNIQUE ("key"), CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`,
    `CREATE UNIQUE INDEX "IDX_c8639b7626fa94ba8265628f21" ON "settings" ("key") `,
    `CREATE TABLE "subscribers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "name" character varying(200), "status" character varying(20) NOT NULL DEFAULT 'active', "subscribed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "unsubscribed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_1a7163c08f0e57bd1c9821508b1" UNIQUE ("email"), CONSTRAINT "PK_cbe0a7a9256c826f403c0236b67" PRIMARY KEY ("id"))`,
    `CREATE UNIQUE INDEX "IDX_1a7163c08f0e57bd1c9821508b" ON "subscribers" ("email") `,
    `CREATE TABLE "newsletter_campaigns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(200) NOT NULL, "subject" character varying(500) NOT NULL, "body" text NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'draft', "sent_count" integer NOT NULL DEFAULT '0', "scheduled_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1be7d98b30fb6093017fc531b04" PRIMARY KEY ("id"))`,
    `CREATE TABLE "languages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "name" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_7397752718d1c9eb873722ec9b2" UNIQUE ("code"), CONSTRAINT "PK_b517f827ca496b29f4d549c631d" PRIMARY KEY ("id"))`,
    `CREATE TABLE "translations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "language_id" uuid NOT NULL, "key" character varying NOT NULL, "value" text NOT NULL, "context" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_aca248c72ae1fb2390f1bf4cd87" PRIMARY KEY ("id"))`,
    `CREATE TABLE "withdraw_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "amount" numeric(12,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'GBP', "status" character varying(20) NOT NULL DEFAULT 'pending', "bankDetails" jsonb, "notes" text, "processed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1b3149d965151ef1024505f7c2d" PRIMARY KEY ("id"))`,
    `CREATE INDEX "IDX_7d91a372f76401d367db204953" ON "withdraw_transactions" ("status") `,
    `CREATE INDEX "IDX_de1a19aff2a1a103ce440f59c6" ON "withdraw_transactions" ("user_id") `,
    `CREATE TABLE "faqs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question" text NOT NULL, "answer" text NOT NULL, "category" character varying(100) NOT NULL DEFAULT 'General', "display_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2ddf4f2c910f8e8fa2663a67bf0" PRIMARY KEY ("id"))`,
    `CREATE INDEX "IDX_dc8a474e26d77eab12931618c8" ON "faqs" ("category", "display_order") `,
    `CREATE TABLE "enquiries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(50), "subject" character varying(500) NOT NULL, "message" text NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'new', "admin_notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1516c8a887df94dc119a1db749e" PRIMARY KEY ("id"))`,
    `CREATE TABLE "email_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "subject" character varying(500) NOT NULL, "body" text NOT NULL, "category" character varying(100) NOT NULL DEFAULT 'transactional', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_06c564c515d8cdb40b6f3bfbbb4" PRIMARY KEY ("id"))`,
    `CREATE TABLE "currencies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(3) NOT NULL, "name" character varying NOT NULL, "symbol" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "exchange_rate" numeric(12,6) NOT NULL DEFAULT '1', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_9f8d0972aeeb5a2277e40332d29" UNIQUE ("code"), CONSTRAINT "PK_d528c54860c4182db13548e08c4" PRIMARY KEY ("id"))`,
    `CREATE TABLE "coupon_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(50) NOT NULL, "discount_type" character varying(20) NOT NULL, "discount_value" numeric(10,2) NOT NULL, "max_uses" integer, "used_count" integer NOT NULL DEFAULT '0', "expires_at" TIMESTAMP WITH TIME ZONE, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_8b05c8017abc4f01fff1254671a" UNIQUE ("code"), CONSTRAINT "PK_5ac86428f1fa43972e1ea4a23e0" PRIMARY KEY ("id"))`,
    `CREATE TABLE "countries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(10) NOT NULL, "name" character varying(200) NOT NULL, "phone_code" character varying(10) NOT NULL, "flag_emoji" character varying(10), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_b47cbb5311bad9c9ae17b8c1eda" UNIQUE ("code"), CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18" PRIMARY KEY ("id"))`,
    `CREATE TABLE "front_cms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying(255) NOT NULL, "value" text NOT NULL DEFAULT '', "group" character varying NOT NULL DEFAULT 'general', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_ae4af1ff53b7bbeafda2a15e804" UNIQUE ("key"), CONSTRAINT "PK_9d5dc0a37c970445a1af4994c6c" PRIMARY KEY ("id"))`,
    `CREATE INDEX "IDX_99cd010082d888216a8a2095db" ON "front_cms" ("group") `,
    `CREATE UNIQUE INDEX "IDX_ae4af1ff53b7bbeafda2a15e80" ON "front_cms" ("key") `,
    `CREATE TABLE "cash_payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "amount" numeric(12,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'GBP', "reference" character varying(255), "status" character varying(20) NOT NULL DEFAULT 'pending', "notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d6981f80b555ef2c5f5429a03e3" PRIMARY KEY ("id"))`,
    `CREATE INDEX "IDX_4857b488378d489765fc356a3c" ON "cash_payments" ("status") `,
    `CREATE INDEX "IDX_1392fa69b105412b9882a4802e" ON "cash_payments" ("user_id") `,
    `CREATE TABLE "features" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text, "icon" character varying(500), "display_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5c1e336df2f4a7051e5bf08a941" PRIMARY KEY ("id"))`,
    `CREATE TABLE "about_us" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "section" character varying(50) NOT NULL, "title" character varying(255) NOT NULL, "content" text NOT NULL, "image_url" character varying(500), "display_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f9643a00dea811eecf941ab4fdc" PRIMARY KEY ("id"))`,
    `CREATE INDEX "IDX_f06c17c276c757a67bb6677072" ON "about_us" ("display_order") `,
    `CREATE INDEX "IDX_1ad147b1946c00a008af654f59" ON "about_us" ("section") `,
    `ALTER TABLE "wishlist_items" ADD "fulfilled_by" uuid`,
    `ALTER TABLE "wishlist_items" ADD CONSTRAINT "FK_60cd5dddfe3d4a27f482ccda529" FOREIGN KEY ("fulfilled_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    `ALTER TABLE "wishlist_shares" ADD CONSTRAINT "FK_4f15e7d363333227d05f5e72814" FOREIGN KEY ("wishlist_id") REFERENCES "wishlists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    `ALTER TABLE "wishlist_shares" ADD CONSTRAINT "FK_976e03fec4b6369f6c2be4d88c1" FOREIGN KEY ("shared_with_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    `ALTER TABLE "subscribed_plans" ADD CONSTRAINT "FK_11e5d14543cd7166f0034e52dbf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    `ALTER TABLE "subscribed_plans" ADD CONSTRAINT "FK_0a64e442392975a3fa4c48890aa" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    `ALTER TABLE "translations" ADD CONSTRAINT "FK_914fcf1be64606618e76b06e821" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    `ALTER TABLE "withdraw_transactions" ADD CONSTRAINT "FK_de1a19aff2a1a103ce440f59c6a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    `ALTER TABLE "cash_payments" ADD CONSTRAINT "FK_1392fa69b105412b9882a4802e5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    ]

    for (const query of queries) {
      await queryRunner.query(query)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'about_us',
      'cash_payments',
      'countries',
      'coupon_codes',
      'currencies',
      'email_templates',
      'enquiries',
      'faqs',
      'features',
      'front_cms',
      'languages',
      'newsletter_campaigns',
      'settings',
      'subscribers',
      'subscribed_plans',
      'testimonials',
      'withdraw_transactions',
      'translations',
      'wishlist_shares',
    ]

    await queryRunner.query('ALTER TABLE "wishlist_items" DROP CONSTRAINT IF EXISTS "FK_60cd5dddfe3d4a27f482ccda529"')
    await queryRunner.query('ALTER TABLE "wishlist_items" DROP COLUMN IF EXISTS "fulfilled_by"')
    for (const table of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS "${table}" CASCADE`)
    }
  }
}
