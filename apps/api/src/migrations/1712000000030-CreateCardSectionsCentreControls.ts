import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCardSectionsCentreControls1712000000030 implements MigrationInterface {
  name = 'CreateCardSectionsCentreControls1712000000030'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // card_sections — stores the content for each VCard section (info, services, products, gallery, blog, etc.)
    await queryRunner.query(`
      CREATE TABLE "card_sections" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "card_id" uuid NOT NULL,
        "schema_id" character varying(80) NOT NULL,
        "name" character varying(150) NOT NULL,
        "locked" boolean NOT NULL DEFAULT false,
        "enabled" boolean NOT NULL DEFAULT true,
        "sort_order" integer NOT NULL DEFAULT 0,
        "content" jsonb NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_card_sections" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_card_sections_card_schema" ON "card_sections" ("card_id", "schema_id")`)
    await queryRunner.query(`CREATE INDEX "idx_card_sections_card" ON "card_sections" ("card_id")`)
    await queryRunner.query(`
      ALTER TABLE "card_sections"
        ADD CONSTRAINT "fk_card_sections_card" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE
    `)

    // card_centre_controls — stores share/exchange/redeem centre settings per VCard
    await queryRunner.query(`
      CREATE TABLE "card_centre_controls" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "card_id" uuid NOT NULL,
        "centre_id" character varying(30) NOT NULL,
        "enabled" boolean NOT NULL DEFAULT true,
        "edit_allowed" boolean NOT NULL DEFAULT true,
        "settings" jsonb NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_card_centre_controls" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_card_centre_controls_card_centre" ON "card_centre_controls" ("card_id", "centre_id")`)
    await queryRunner.query(`
      ALTER TABLE "card_centre_controls"
        ADD CONSTRAINT "fk_card_centre_controls_card" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE
    `)

    // Upgrade card_access: add hint column and protected_section_ids array
    await queryRunner.query(`ALTER TABLE "card_access" ADD COLUMN "hint" character varying(200)`)
    await queryRunner.query(`ALTER TABLE "card_access" ADD COLUMN "protected_section_ids" jsonb`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "card_access" DROP COLUMN "protected_section_ids"`)
    await queryRunner.query(`ALTER TABLE "card_access" DROP COLUMN "hint"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "card_centre_controls"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "card_sections"`)
  }
}
