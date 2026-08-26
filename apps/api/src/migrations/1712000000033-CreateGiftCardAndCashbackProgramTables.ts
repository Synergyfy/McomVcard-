import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateGiftCardAndCashbackProgramTables1712000000033 implements MigrationInterface {
  name = 'CreateGiftCardAndCashbackProgramTables1712000000033'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // gift_cards — pre-loaded value cards a business sells
    await queryRunner.query(`
      CREATE TABLE "gift_cards" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "business_id" uuid NOT NULL,
        "title" character varying(150) NOT NULL,
        "value" numeric(12, 2) NOT NULL,
        "price" numeric(12, 2) NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'active',
        "sold" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_gift_cards" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`CREATE INDEX "idx_gift_cards_business" ON "gift_cards" ("business_id")`)
    await queryRunner.query(`
      ALTER TABLE "gift_cards"
        ADD CONSTRAINT "fk_gift_cards_business" FOREIGN KEY ("business_id") REFERENCES "businesses" ("id") ON DELETE CASCADE
    `)

    // cashback_programs — business-level cashback offers
    await queryRunner.query(`
      CREATE TABLE "cashback_programs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "business_id" uuid NOT NULL,
        "title" character varying(150) NOT NULL,
        "rate" numeric(5, 2) NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'active',
        "earned" numeric(12, 2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_cashback_programs" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`CREATE INDEX "idx_cashback_programs_business" ON "cashback_programs" ("business_id")`)
    await queryRunner.query(`
      ALTER TABLE "cashback_programs"
        ADD CONSTRAINT "fk_cashback_programs_business" FOREIGN KEY ("business_id") REFERENCES "businesses" ("id") ON DELETE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "cashback_programs"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "gift_cards"`)
  }
}
