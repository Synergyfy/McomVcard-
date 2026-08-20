import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateChildCardTables1712000000019 implements MigrationInterface {
  name = 'CreateChildCardTables1712000000019'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // child_cards (minimal explicit-access model per spec §36 — parent-owned card linked to a child user with explicit per-card permission flags + optional wallet allocation)
    await queryRunner.query(`
      CREATE TABLE "child_cards" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "card_id" uuid NOT NULL,
        "child_id" uuid NOT NULL,
        "can_view" boolean NOT NULL DEFAULT true,
        "can_use_wallet" boolean NOT NULL DEFAULT false,
        "can_manage" boolean NOT NULL DEFAULT false,
        "wallet_allocation" numeric(12,2),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_child_cards" PRIMARY KEY ("id"),
        CONSTRAINT "uq_child_cards_pair" UNIQUE ("card_id", "child_id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_child_cards_card" ON "child_cards" ("card_id")`)
    await queryRunner.query(`CREATE INDEX "idx_child_cards_child" ON "child_cards" ("child_id")`)

    await queryRunner.query(`
      ALTER TABLE "child_cards"
        ADD CONSTRAINT "fk_child_cards_card" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "child_cards"
        ADD CONSTRAINT "fk_child_cards_child" FOREIGN KEY ("child_id") REFERENCES "users" ("id") ON DELETE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "child_cards"`)
  }
}