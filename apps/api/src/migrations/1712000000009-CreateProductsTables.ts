import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateProductsTables1712000000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // products (Business 1:N Products)
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "business_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "price" numeric(10, 2),
        "currency" character varying(3) NOT NULL DEFAULT 'GBP',
        "image" character varying,
        "status" character varying NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_products" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "fk_products_business" FOREIGN KEY ("business_id") REFERENCES "businesses" (id) ON DELETE CASCADE`)
    await queryRunner.query(`CREATE INDEX "idx_products_business" ON "products" ("business_id")`)

    // product_images (Product 1:N ProductImages)
    await queryRunner.query(`
      CREATE TABLE "product_images" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "product_id" uuid NOT NULL,
        "image_url" character varying NOT NULL,
        "position" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_product_images" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`ALTER TABLE "product_images" ADD CONSTRAINT "fk_product_images_product" FOREIGN KEY ("product_id") REFERENCES "products" (id) ON DELETE CASCADE`)
    await queryRunner.query(`CREATE INDEX "idx_product_images_product" ON "product_images" ("product_id")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "product_images"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`)
  }
}