import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateShareTables1712000000023 implements MigrationInterface {
  name = 'CreateShareTables1712000000023'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // shares — attribution log per spec §40. Card ─── N Share. When the sharer is
    // an active affiliate their affiliate_id + referral_code are attached so the
    // code travels with the share (Card → Share → Visitor → Signup → Referral).
    await queryRunner.query(`
      CREATE TABLE "shares" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "card_id" uuid NOT NULL,
        "platform" character varying(50) NOT NULL,
        "affiliate_id" uuid,
        "referral_code" character varying(50),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_shares" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_shares_card" ON "shares" ("card_id")`)
    await queryRunner.query(`CREATE INDEX "idx_shares_user" ON "shares" ("user_id")`)
    await queryRunner.query(`CREATE INDEX "idx_shares_affiliate" ON "shares" ("affiliate_id")`)

    await queryRunner.query(`
      ALTER TABLE "shares"
        ADD CONSTRAINT "fk_shares_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "shares"
        ADD CONSTRAINT "fk_shares_card" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "shares"
        ADD CONSTRAINT "fk_shares_affiliate" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates" ("id") ON DELETE SET NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "shares"`)
  }
}