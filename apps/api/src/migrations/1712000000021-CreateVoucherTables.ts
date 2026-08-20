import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateVoucherTables1712000000021 implements MigrationInterface {
  name = 'CreateVoucherTables1712000000021'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // voucher_vendors (platform-wide config — per spec §38)
    await queryRunner.query(`
      CREATE TABLE "voucher_vendors" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "description" text,
        "website" character varying(255),
        "status" character varying(20) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_voucher_vendors" PRIMARY KEY ("id")
      )
    `)

    // vouchers (AVAILABLE → ASSIGNED → REDEEMED; EXPIRED/CANCELLED terminal — per spec §38)
    await queryRunner.query(`
      CREATE TABLE "vouchers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "vendor_id" uuid NOT NULL,
        "code" character varying(50) NOT NULL,
        "title" character varying(100) NOT NULL,
        "description" text,
        "value" numeric(12,2) NOT NULL,
        "currency" character varying(10) NOT NULL DEFAULT 'GBP',
        "status" character varying(20) NOT NULL DEFAULT 'AVAILABLE',
        "expires_at" TIMESTAMPTZ,
        "assigned_to_user_id" uuid,
        "assigned_at" TIMESTAMPTZ,
        "redeemed_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_vouchers" PRIMARY KEY ("id"),
        CONSTRAINT "uq_vouchers_code" UNIQUE ("code")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_vouchers_vendor" ON "vouchers" ("vendor_id")`)
    await queryRunner.query(`CREATE INDEX "idx_vouchers_status" ON "vouchers" ("status")`)
    await queryRunner.query(`CREATE INDEX "idx_vouchers_assigned_user" ON "vouchers" ("assigned_to_user_id")`)

    await queryRunner.query(`
      ALTER TABLE "vouchers"
        ADD CONSTRAINT "fk_vouchers_vendor" FOREIGN KEY ("vendor_id") REFERENCES "voucher_vendors" ("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "vouchers"
        ADD CONSTRAINT "fk_vouchers_assigned_user" FOREIGN KEY ("assigned_to_user_id") REFERENCES "users" ("id") ON DELETE SET NULL
    `)

    // voucher_transactions (the history ledger — spec §38: "Maintain a clear transaction/history model")
    await queryRunner.query(`
      CREATE TABLE "voucher_transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "voucher_id" uuid NOT NULL,
        "type" character varying(20) NOT NULL,
        "user_id" uuid,
        "note" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_voucher_transactions" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_voucher_transactions_voucher" ON "voucher_transactions" ("voucher_id")`)
    await queryRunner.query(`CREATE INDEX "idx_voucher_transactions_created" ON "voucher_transactions" ("created_at")`)

    await queryRunner.query(`
      ALTER TABLE "voucher_transactions"
        ADD CONSTRAINT "fk_voucher_transactions_voucher" FOREIGN KEY ("voucher_id") REFERENCES "vouchers" ("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "voucher_transactions"
        ADD CONSTRAINT "fk_voucher_transactions_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "voucher_transactions"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "vouchers"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "voucher_vendors"`)
  }
}