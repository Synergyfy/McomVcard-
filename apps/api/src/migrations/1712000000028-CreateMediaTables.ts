import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateMediaTables1712000000028 implements MigrationInterface {
  name = 'CreateMediaTables1712000000028'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // media — spec §45. Metadata records only; the bytes live on an external
    // provider (local disk in dev, S3-compatible later). Never in PostgreSQL.
    await queryRunner.query(`
      CREATE TABLE "media" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "uploaded_by" uuid NOT NULL,
        "provider" character varying(50) NOT NULL DEFAULT 'local',
        "key" character varying(500) NOT NULL,
        "url" character varying(1000) NOT NULL,
        "mime_type" character varying(120) NOT NULL,
        "size" bigint NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_media" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_media_uploaded_by" ON "media" ("uploaded_by")`)

    await queryRunner.query(`
      ALTER TABLE "media"
        ADD CONSTRAINT "fk_media_uploaded_by" FOREIGN KEY ("uploaded_by") REFERENCES "users" ("id") ON DELETE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "media"`)
  }
}