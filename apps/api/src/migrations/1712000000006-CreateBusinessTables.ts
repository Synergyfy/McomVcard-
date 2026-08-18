import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateBusinessTables1712000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // business_categories
    await queryRunner.query(`
      CREATE TABLE "business_categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "description" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_business_categories" PRIMARY KEY ("id"),
        CONSTRAINT "uq_business_categories_name" UNIQUE ("name")
      )
    `)

    // businesses
    await queryRunner.query(`
      CREATE TABLE "businesses" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "owner_id" uuid NOT NULL,
        "category_id" uuid,
        "name" character varying NOT NULL,
        "description" text,
        "email" character varying,
        "phone" character varying,
        "website" character varying,
        "status" character varying NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_businesses" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`ALTER TABLE "businesses" ADD CONSTRAINT "fk_businesses_owner" FOREIGN KEY ("owner_id") REFERENCES "users" (id) ON DELETE CASCADE`)
    await queryRunner.query(`ALTER TABLE "businesses" ADD CONSTRAINT "fk_businesses_category" FOREIGN KEY ("category_id") REFERENCES "business_categories" (id) ON DELETE SET NULL`)
    await queryRunner.query(`CREATE INDEX "idx_businesses_owner" ON "businesses" ("owner_id")`)

    // business_locations
    await queryRunner.query(`
      CREATE TABLE "business_locations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "business_id" uuid NOT NULL,
        "address" character varying,
        "city" character varying,
        "state" character varying,
        "country" character varying,
        "latitude" double precision,
        "longitude" double precision,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_business_locations" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`ALTER TABLE "business_locations" ADD CONSTRAINT "fk_locations_business" FOREIGN KEY ("business_id") REFERENCES "businesses" (id) ON DELETE CASCADE`)
    await queryRunner.query(`CREATE INDEX "idx_locations_business" ON "business_locations" ("business_id")`)

    // business_hours
    await queryRunner.query(`
      CREATE TABLE "business_hours" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "business_id" uuid NOT NULL,
        "day_of_week" integer NOT NULL,
        "opens_at" time,
        "closes_at" time,
        "is_closed" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_business_hours" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`ALTER TABLE "business_hours" ADD CONSTRAINT "fk_hours_business" FOREIGN KEY ("business_id") REFERENCES "businesses" (id) ON DELETE CASCADE`)
    await queryRunner.query(`CREATE INDEX "idx_hours_business" ON "business_hours" ("business_id")`)

    // brands (Business 1:N Brands)
    await queryRunner.query(`
      CREATE TABLE "brands" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "business_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "logo_url" character varying,
        "status" character varying NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_brands" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`ALTER TABLE "brands" ADD CONSTRAINT "fk_brands_business" FOREIGN KEY ("business_id") REFERENCES "businesses" (id) ON DELETE CASCADE`)
    await queryRunner.query(`CREATE INDEX "idx_brands_business" ON "brands" ("business_id")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "brands"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "business_hours"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "business_locations"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "businesses"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "business_categories"`)
  }
}