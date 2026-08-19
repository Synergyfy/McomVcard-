import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateServicesTables1712000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // services (Business 1:N Services)
    await queryRunner.query(`
      CREATE TABLE "services" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "business_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "price" numeric(10, 2),
        "currency" character varying(3) NOT NULL DEFAULT 'USD',
        "duration" integer,
        "image" character varying,
        "status" character varying NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_services" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "fk_services_business" FOREIGN KEY ("business_id") REFERENCES "businesses" (id) ON DELETE CASCADE`)
    await queryRunner.query(`CREATE INDEX "idx_services_business" ON "services" ("business_id")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "services"`)
  }
}