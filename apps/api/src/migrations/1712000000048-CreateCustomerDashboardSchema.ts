import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Customer dashboard foundations:
 *  - canonical CUSTOMER role, back-filled for every Central customer profile;
 *  - consumer-owned free-form wish list (distinct from business wishlists);
 *  - relationship label on family/friend card allocations so the Friends &
 *    Family UI can show who each card belongs to.
 *
 * Numbered 0048 to avoid colliding with the parallel business-dashboard
 * migration that occupies 0047.
 */
export class CreateCustomerDashboardSchema1712000000048 implements MigrationInterface {
  name = 'CreateCustomerDashboardSchema1712000000048'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "roles" ("name", "description")
      SELECT 'CUSTOMER', 'MCOM customer / consumer dashboard account'
      WHERE NOT EXISTS (SELECT 1 FROM "roles" WHERE "name" = 'CUSTOMER')
    `)

    await queryRunner.query(`
      INSERT INTO "user_roles" ("user_id", "role_id")
      SELECT u."id", r."id"
      FROM "users" u
      CROSS JOIN "roles" r
      WHERE r."name" = 'CUSTOMER'
        AND (
          u."mcom_profile_type" = 'CUSTOMER'
          OR u."mcom_role" = 'CUSTOMER'
        )
        AND NOT EXISTS (
          SELECT 1 FROM "user_roles" ur
          WHERE ur."user_id" = u."id" AND ur."role_id" = r."id"
        )
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "consumer_wishlist_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "title" varchar(200) NOT NULL,
        "price" varchar(50),
        "image" text,
        "emoji" varchar(20) NOT NULL DEFAULT '🎁',
        "gradient" varchar(120) NOT NULL DEFAULT 'from-rose-50 to-pink-100 dark:from-rose-500/10 dark:to-pink-500/10',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_consumer_wishlist_items_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `)

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_consumer_wishlist_items_user"
      ON "consumer_wishlist_items" ("user_id", "created_at" DESC)
    `)

    await queryRunner.query(
      `ALTER TABLE "child_cards" ADD COLUMN IF NOT EXISTS "relationship" character varying(50) NOT NULL DEFAULT 'Family'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "child_cards" DROP COLUMN IF EXISTS "relationship"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "consumer_wishlist_items"`)
    await queryRunner.query(`
      DELETE FROM "user_roles" ur
      USING "roles" r
      WHERE ur."role_id" = r."id" AND r."name" = 'CUSTOMER'
    `)
    await queryRunner.query(`DELETE FROM "roles" WHERE "name" = 'CUSTOMER'`)
  }
}
