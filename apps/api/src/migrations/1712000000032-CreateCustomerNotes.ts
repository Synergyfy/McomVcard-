import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCustomerNotes1712000000032 implements MigrationInterface {
  name = 'CreateCustomerNotes1712000000032'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // customer_notes — private notes a business keeps about a customer.
    // Customers are derived (grouped by email across appointments/reviews/shares),
    // so notes attach to (business_id, customer_email) rather than a customer row.
    await queryRunner.query(`
      CREATE TABLE "customer_notes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "business_id" uuid NOT NULL,
        "customer_email" character varying(255) NOT NULL,
        "author_id" uuid,
        "note" text NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_customer_notes" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`CREATE INDEX "idx_customer_notes_business" ON "customer_notes" ("business_id")`)
    await queryRunner.query(`CREATE INDEX "idx_customer_notes_business_email" ON "customer_notes" ("business_id", "customer_email")`)
    await queryRunner.query(`
      ALTER TABLE "customer_notes"
        ADD CONSTRAINT "fk_customer_notes_business" FOREIGN KEY ("business_id") REFERENCES "businesses" ("id") ON DELETE CASCADE
    `)
    await queryRunner.query(`
      ALTER TABLE "customer_notes"
        ADD CONSTRAINT "fk_customer_notes_author" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE SET NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "customer_notes"`)
  }
}
