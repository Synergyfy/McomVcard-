import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Friends & Family wish lists are free-form: a family member can ask for
 * something that is not in the business catalogue. Allow wishlist items to be
 * stored without a product_id and carry their own display fields.
 */
export class AddFreeformWishlistItems1712000000050 implements MigrationInterface {
  name = 'AddFreeformWishlistItems1712000000050'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "wishlist_items" ALTER COLUMN "product_id" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "wishlist_items" ADD COLUMN IF NOT EXISTS "title" character varying(200)`)
    await queryRunner.query(`ALTER TABLE "wishlist_items" ADD COLUMN IF NOT EXISTS "price" character varying(50)`)
    await queryRunner.query(`ALTER TABLE "wishlist_items" ADD COLUMN IF NOT EXISTS "image" text`)
    await queryRunner.query(`ALTER TABLE "wishlist_items" ADD COLUMN IF NOT EXISTS "emoji" character varying(20) NOT NULL DEFAULT '🎁'`)
    await queryRunner.query(
      `ALTER TABLE "wishlist_items" ADD COLUMN IF NOT EXISTS "gradient" character varying(120) NOT NULL DEFAULT 'from-rose-50 to-pink-100 dark:from-rose-500/10 dark:to-pink-500/10'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "wishlist_items" DROP COLUMN IF EXISTS "gradient"`)
    await queryRunner.query(`ALTER TABLE "wishlist_items" DROP COLUMN IF EXISTS "emoji"`)
    await queryRunner.query(`ALTER TABLE "wishlist_items" DROP COLUMN IF EXISTS "image"`)
    await queryRunner.query(`ALTER TABLE "wishlist_items" DROP COLUMN IF EXISTS "price"`)
    await queryRunner.query(`ALTER TABLE "wishlist_items" DROP COLUMN IF EXISTS "title"`)
    await queryRunner.query(`ALTER TABLE "wishlist_items" ALTER COLUMN "product_id" SET NOT NULL`)
  }
}
