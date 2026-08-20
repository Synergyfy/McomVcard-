import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateAffiliateTables1712000000022 implements MigrationInterface {
  name = 'CreateAffiliateTables1712000000022'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // affiliates — user-level capability (User 1 ─── 1 Affiliate per spec §39). NOT tied to a Business.
    await queryRunner.query(`
      CREATE TABLE "affiliates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "affiliate_code" character varying(50) NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'active',
        "joined_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_affiliates" PRIMARY KEY ("id"),
        CONSTRAINT "uq_affiliates_user" UNIQUE ("user_id"),
        CONSTRAINT "uq_affiliates_code" UNIQUE ("affiliate_code")
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "affiliates"
        ADD CONSTRAINT "fk_affiliates_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
    `)

    // referrals — attribution: Affiliate 1 ─── N Referral (spec §39 + §40 workflow: Visitor → Signup → Referral)
    await queryRunner.query(`
      CREATE TABLE "referrals" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "affiliate_id" uuid NOT NULL,
        "referred_user_id" uuid NOT NULL,
        "source" character varying(50) NOT NULL DEFAULT 'register',
        "status" character varying(20) NOT NULL DEFAULT 'TRACKED',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_referrals" PRIMARY KEY ("id"),
        CONSTRAINT "uq_referrals_referred_user" UNIQUE ("referred_user_id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_referrals_affiliate" ON "referrals" ("affiliate_id")`)

    await queryRunner.query(`
      ALTER TABLE "referrals"
        ADD CONSTRAINT "fk_referrals_affiliate" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates" ("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "referrals"
        ADD CONSTRAINT "fk_referrals_referred_user" FOREIGN KEY ("referred_user_id") REFERENCES "users" ("id") ON DELETE CASCADE
    `)

    // affiliate_transactions — commission ledger with admin approval (pending/approved/rejected)
    await queryRunner.query(`
      CREATE TABLE "affiliate_transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "affiliate_id" uuid NOT NULL,
        "referral_id" uuid,
        "type" character varying(20) NOT NULL DEFAULT 'COMMISSION',
        "amount" numeric(12,2) NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'pending',
        "description" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_affiliate_transactions" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_affiliate_transactions_affiliate" ON "affiliate_transactions" ("affiliate_id")`)
    await queryRunner.query(`CREATE INDEX "idx_affiliate_transactions_status" ON "affiliate_transactions" ("status")`)

    await queryRunner.query(`
      ALTER TABLE "affiliate_transactions"
        ADD CONSTRAINT "fk_affiliate_transactions_affiliate" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates" ("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "affiliate_transactions"
        ADD CONSTRAINT "fk_affiliate_transactions_referral" FOREIGN KEY ("referral_id") REFERENCES "referrals" ("id") ON DELETE SET NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "affiliate_transactions"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "referrals"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "affiliates"`)
  }
}