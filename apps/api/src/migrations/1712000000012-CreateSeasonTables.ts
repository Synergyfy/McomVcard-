import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateSeasonTables1712000000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // seasons (platform-wide — other entities may reference a season, e.g. campaigns)
    await queryRunner.query(`
      CREATE TABLE "seasons" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "starts_at" timestamptz NOT NULL,
        "ends_at" timestamptz NOT NULL,
        "status" character varying NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_seasons" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_seasons_status" ON "seasons" ("status")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "seasons"`)
  }
}