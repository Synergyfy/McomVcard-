import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateUserRelationshipTables1712000000018 implements MigrationInterface {
  name = 'CreateUserRelationshipTables1712000000018'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // user_relationships (generalized single table per spec §35 — no separate per-type tables)
    await queryRunner.query(`
      CREATE TABLE "user_relationships" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "requester_id" uuid NOT NULL,
        "recipient_id" uuid NOT NULL,
        "relationship_type" character varying(20) NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_user_relationships" PRIMARY KEY ("id"),
        CONSTRAINT "uq_user_relationships_pair" UNIQUE ("requester_id", "recipient_id"),
        CONSTRAINT "chk_user_relationships_not_self" CHECK ("requester_id" <> "recipient_id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_user_relationships_requester" ON "user_relationships" ("requester_id")`)
    await queryRunner.query(`CREATE INDEX "idx_user_relationships_recipient" ON "user_relationships" ("recipient_id")`)
    await queryRunner.query(`CREATE INDEX "idx_user_relationships_status" ON "user_relationships" ("status")`)

    await queryRunner.query(`
      ALTER TABLE "user_relationships"
        ADD CONSTRAINT "fk_user_relationships_requester" FOREIGN KEY ("requester_id") REFERENCES "users" ("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "user_relationships"
        ADD CONSTRAINT "fk_user_relationships_recipient" FOREIGN KEY ("recipient_id") REFERENCES "users" ("id") ON DELETE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_relationships"`)
  }
}