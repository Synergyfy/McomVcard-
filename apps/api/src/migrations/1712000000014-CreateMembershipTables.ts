import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateMembershipTables1712000000014 implements MigrationInterface {
  name = 'CreateMembershipTables1712000000014'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // memberships (per-user link to a membership_tier — USERS ── MEMBERSHIPS ── MEMBERSHIP_TIERS per spec §47)
    await queryRunner.query(`
      CREATE TABLE "memberships" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "membership_tier_id" uuid NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'active',
        "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "expires_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_memberships" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_memberships_user" ON "memberships" ("user_id")`)
    await queryRunner.query(`CREATE INDEX "idx_memberships_status" ON "memberships" ("status")`)

    await queryRunner.query(`
      ALTER TABLE "memberships"
        ADD CONSTRAINT "fk_memberships_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "memberships"
        ADD CONSTRAINT "fk_memberships_tier" FOREIGN KEY ("membership_tier_id") REFERENCES "membership_tiers" ("id") ON DELETE RESTRICT
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "memberships"`)
  }
}