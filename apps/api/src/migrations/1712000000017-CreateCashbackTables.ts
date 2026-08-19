import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCashbackTables1712000000017 implements MigrationInterface {
  name = 'CreateCashbackTables1712000000017'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // cashback_rules (platform-wide config — percentage/min/max/starts/ends/status per spec §33)
    await queryRunner.query(`
      CREATE TABLE "cashback_rules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "percentage" numeric(5,2) NOT NULL,
        "minimum_amount" numeric(12,2),
        "maximum_amount" numeric(12,2),
        "starts_at" TIMESTAMPTZ,
        "ends_at" TIMESTAMPTZ,
        "status" character varying(20) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_cashback_rules" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_cashback_rules_status" ON "cashback_rules" ("status")`)

    // cashback_accounts (one per user — USERS ── CASHBACK_ACCOUNT per spec §47)
    await queryRunner.query(`
      CREATE TABLE "cashback_accounts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "balance" numeric(12,2) NOT NULL DEFAULT 0,
        "status" character varying(20) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_cashback_accounts" PRIMARY KEY ("id"),
        CONSTRAINT "uq_cashback_accounts_user" UNIQUE ("user_id")
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "cashback_accounts"
        ADD CONSTRAINT "fk_cashback_accounts_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
    `)

    // cashback_transactions (the history ledger — spec §33: "Maintain transaction history")
    await queryRunner.query(`
      CREATE TABLE "cashback_transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "cashback_account_id" uuid NOT NULL,
        "type" character varying(10) NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "balance_after" numeric(12,2) NOT NULL,
        "description" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_cashback_transactions" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_cashback_transactions_account" ON "cashback_transactions" ("cashback_account_id")`)
    await queryRunner.query(`CREATE INDEX "idx_cashback_transactions_created" ON "cashback_transactions" ("created_at")`)

    await queryRunner.query(`
      ALTER TABLE "cashback_transactions"
        ADD CONSTRAINT "fk_cashback_transactions_account" FOREIGN KEY ("cashback_account_id") REFERENCES "cashback_accounts" ("id") ON DELETE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "cashback_transactions"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "cashback_accounts"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "cashback_rules"`)
  }
}