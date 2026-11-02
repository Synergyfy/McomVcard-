import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateBusinessFamilyMembers1712000000047 implements MigrationInterface {
  name = 'CreateBusinessFamilyMembers1712000000047'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "business_family_members" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "business_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "email" character varying,
        "phone" text,
        "relationship" character varying NOT NULL DEFAULT 'Family',
        "avatar" text,
        "status" character varying NOT NULL DEFAULT 'allocated',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_business_family_members" PRIMARY KEY ("id"),
        CONSTRAINT "FK_business_family_members_business" FOREIGN KEY ("business_id")
          REFERENCES "businesses"("id") ON DELETE CASCADE
      )
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_business_family_members_business" ON "business_family_members" ("business_id")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "business_family_members"`)
  }
}
