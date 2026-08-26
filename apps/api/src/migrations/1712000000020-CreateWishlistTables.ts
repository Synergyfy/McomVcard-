import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateWishlistTables1712000000020 implements MigrationInterface {
  name = 'CreateWishlistTables1712000000020'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // wishlists (User 1:N Wishlists per spec §37 — standard multi-wishlist model)
    await queryRunner.query(`
      CREATE TABLE "wishlists" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "is_private" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_wishlists" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_wishlists_user" ON "wishlists" ("user_id")`)

    await queryRunner.query(`
      ALTER TABLE "wishlists"
        ADD CONSTRAINT "fk_wishlists_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
    `)

    // wishlist_items (Wishlist 1:N WishlistItems, Product 1:N WishlistItems per spec §37)
    await queryRunner.query(`
      CREATE TABLE "wishlist_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "wishlist_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "note" text,
        "position" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_wishlist_items" PRIMARY KEY ("id"),
        CONSTRAINT "uq_wishlist_items_product" UNIQUE ("wishlist_id", "product_id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_wishlist_items_wishlist" ON "wishlist_items" ("wishlist_id")`)
    await queryRunner.query(`CREATE INDEX "idx_wishlist_items_product" ON "wishlist_items" ("product_id")`)

    await queryRunner.query(`
      ALTER TABLE "wishlist_items"
        ADD CONSTRAINT "fk_wishlist_items_wishlist" FOREIGN KEY ("wishlist_id") REFERENCES "wishlists" ("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "wishlist_items"
        ADD CONSTRAINT "fk_wishlist_items_product" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "wishlist_items"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "wishlists"`)
  }
}