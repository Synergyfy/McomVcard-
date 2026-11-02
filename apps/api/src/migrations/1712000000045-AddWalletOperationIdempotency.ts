import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Local mirrors of centralized MCOM Wallet operations need their own
 * idempotency guards:
 *  - wallet_transactions.idempotency_key dedupes card top-ups mirrored from a
 *    wallet debit (a retried request must not credit the card twice).
 *  - child_cards.last_allocation_key dedupes the local allocation bookkeeping
 *    that follows a centralized debit.
 */
export class AddWalletOperationIdempotency1712000000045 implements MigrationInterface {
  name = 'AddWalletOperationIdempotency1712000000045'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD COLUMN IF NOT EXISTS "idempotency_key" character varying(255)`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_wallet_transactions_idempotency_key" ON "wallet_transactions" ("idempotency_key") WHERE "idempotency_key" IS NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "child_cards" ADD COLUMN IF NOT EXISTS "last_allocation_key" character varying(255)`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "child_cards" DROP COLUMN IF EXISTS "last_allocation_key"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_wallet_transactions_idempotency_key"`)
    await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP COLUMN IF EXISTS "idempotency_key"`)
  }
}
