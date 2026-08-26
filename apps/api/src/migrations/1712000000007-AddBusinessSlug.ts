import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddBusinessSlug1712000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add nullable first so existing rows can be backfilled.
    await queryRunner.query(`ALTER TABLE "businesses" ADD COLUMN "slug" character varying`)

    // Backfill slugs from the business name, guaranteeing uniqueness by
    // appending "-2", "-3", ... when a slug is already taken.
    await queryRunner.query(`
      DO $$
      DECLARE
        b RECORD;
        base_slug TEXT;
        candidate TEXT;
        suffix INTEGER;
      BEGIN
        FOR b IN SELECT id, name FROM "businesses" ORDER BY created_at, id LOOP
          base_slug := lower(regexp_replace(regexp_replace(coalesce(b.name, ''), '[^a-zA-Z0-9 -]', '', 'g'), '[\\s-]+', '-', 'g'));
          base_slug := trim(both '-' from base_slug);
          IF base_slug = '' THEN
            base_slug := 'business';
          END IF;

          candidate := base_slug;
          suffix := 2;

          WHILE EXISTS (SELECT 1 FROM "businesses" WHERE slug = candidate AND id <> b.id) LOOP
            candidate := base_slug || '-' || suffix;
            suffix := suffix + 1;
          END LOOP;

          UPDATE "businesses" SET slug = candidate WHERE id = b.id;
        END LOOP;
      END $$;
    `)

    await queryRunner.query(`ALTER TABLE "businesses" ALTER COLUMN "slug" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "businesses" ADD CONSTRAINT "uq_businesses_slug" UNIQUE ("slug")`)
    await queryRunner.query(`CREATE INDEX "idx_businesses_slug" ON "businesses" ("slug")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_businesses_slug"`)
    await queryRunner.query(`ALTER TABLE "businesses" DROP CONSTRAINT IF EXISTS "uq_businesses_slug"`)
    await queryRunner.query(`ALTER TABLE "businesses" DROP COLUMN IF EXISTS "slug"`)
  }
}