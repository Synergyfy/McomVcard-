import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateQrCodeTables1712000000024 implements MigrationInterface {
  name = 'CreateQrCodeTables1712000000024'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // qr_codes — spec §41. Card 1 ─── N QR Codes. Each QR targets a destination
    // (VCARD / BUSINESS_PROFILE / OFFER / CAMPAIGN) and encodes
    // https://mcomvcard.link/qr/<id>, resolved publicly to { destination_type, destination }.
    await queryRunner.query(`
      CREATE TABLE "qr_codes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "card_id" uuid NOT NULL,
        "destination_type" character varying(40) NOT NULL,
        "destination" character varying(500) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_qr_codes" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "idx_qr_codes_card" ON "qr_codes" ("card_id")`)

    await queryRunner.query(`
      ALTER TABLE "qr_codes"
        ADD CONSTRAINT "fk_qr_codes_card" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "qr_codes"`)
  }
}