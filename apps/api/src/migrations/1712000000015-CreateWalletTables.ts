import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateWalletTables1712000000015 implements MigrationInterface {
  name = 'CreateWalletTables1712000000015'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // wallets (one per user — USERS ── WALLET per spec §47)
    await queryRunner.query(`
      CREATE TABLE "wallets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "balance" numeric(12,2) NOT NULL DEFAULT 0,
        "currency" character varying(3) NOT NULL DEFAULT 'GBP',
        "status" character varying(20) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_wallets" PRIMARY KEY ("id"),
        CONSTRAINT "uq_wallets_user" UNIQUE ("user_id")
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "wallets"
        ADD CONSTRAINT "fk_wallets_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
    `)

    // wallet_transactions (the ledger — every balance change writes a row)
    await queryRunner.query(`
      CREATE TABLE "wallet_transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "wallet_id" uuid NOT NULL,
        "type" character varying(10) NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "balance_after" numeric(12,2) NOT NULL,
        "description" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_wallet_transactions" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_wallet_transactions_wallet" ON "wallet_transactions" ("wallet_id")`)
    await queryRunner.query(`CREATE INDEX "idx_wallet_transactions_created" ON "wallet_transactions" ("created_at")`)

    await queryRunner.query(`
      ALTER TABLE "wallet_transactions"
        ADD CONSTRAINT "fk_wallet_transactions_wallet" FOREIGN KEY ("wallet_id") REFERENCES "wallets" ("id") ON DELETE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "wallet_transactions"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "wallets"`)
  }
}