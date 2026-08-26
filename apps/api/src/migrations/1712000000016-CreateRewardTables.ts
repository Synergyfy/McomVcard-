import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateRewardTables1712000000016 implements MigrationInterface {
  name = 'CreateRewardTables1712000000016'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // reward_balances (one per user — USERS ── REWARD_BALANCE per spec §47)
    await queryRunner.query(`
      CREATE TABLE "reward_balances" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "balance" numeric(12,2) NOT NULL DEFAULT 0,
        "status" character varying(20) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_reward_balances" PRIMARY KEY ("id"),
        CONSTRAINT "uq_reward_balances_user" UNIQUE ("user_id")
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "reward_balances"
        ADD CONSTRAINT "fk_reward_balances_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
    `)

    // reward_transactions (the history ledger — EARN/REDEEM/EXPIRE/ADJUST per spec §32)
    await queryRunner.query(`
      CREATE TABLE "reward_transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "reward_balance_id" uuid NOT NULL,
        "type" character varying(10) NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "balance_after" numeric(12,2) NOT NULL,
        "description" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_reward_transactions" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_reward_transactions_balance" ON "reward_transactions" ("reward_balance_id")`)
    await queryRunner.query(`CREATE INDEX "idx_reward_transactions_created" ON "reward_transactions" ("created_at")`)

    await queryRunner.query(`
      ALTER TABLE "reward_transactions"
        ADD CONSTRAINT "fk_reward_transactions_balance" FOREIGN KEY ("reward_balance_id") REFERENCES "reward_balances" ("id") ON DELETE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "reward_transactions"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "reward_balances"`)
  }
}