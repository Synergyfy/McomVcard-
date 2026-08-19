import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateAppointmentTables1712000000011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // booking_rules (Business 1:1 BookingRules — booking engine configuration)
    await queryRunner.query(`
      CREATE TABLE "booking_rules" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "business_id" uuid NOT NULL,
        "enabled" boolean NOT NULL DEFAULT true,
        "default_duration" integer NOT NULL DEFAULT 60,
        "buffer" integer NOT NULL DEFAULT 15,
        "lead_time_hours" integer NOT NULL DEFAULT 24,
        "advance_window_days" integer NOT NULL DEFAULT 30,
        "require_payment" boolean NOT NULL DEFAULT false,
        "confirmation_message" text,
        "cancellation_policy" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_booking_rules" PRIMARY KEY ("id"),
        CONSTRAINT "uq_booking_rules_business" UNIQUE ("business_id")
      )
    `)

    await queryRunner.query(`ALTER TABLE "booking_rules" ADD CONSTRAINT "fk_booking_rules_business" FOREIGN KEY ("business_id") REFERENCES "businesses" (id) ON DELETE CASCADE`)

    // availability (Business 1:N Availability — weekly time slots)
    await queryRunner.query(`
      CREATE TABLE "availability" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "business_id" uuid NOT NULL,
        "day_of_week" integer NOT NULL,
        "start_time" time NOT NULL,
        "end_time" time NOT NULL,
        "is_closed" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_availability" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`ALTER TABLE "availability" ADD CONSTRAINT "fk_availability_business" FOREIGN KEY ("business_id") REFERENCES "businesses" (id) ON DELETE CASCADE`)
    await queryRunner.query(`CREATE INDEX "idx_availability_business" ON "availability" ("business_id")`)

    // appointments (Business 1:N Appointments, Service N:1 optional)
    await queryRunner.query(`
      CREATE TABLE "appointments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "business_id" uuid NOT NULL,
        "service_id" uuid,
        "customer_name" character varying NOT NULL,
        "customer_email" character varying NOT NULL,
        "customer_phone" character varying,
        "date" date NOT NULL,
        "start_time" time NOT NULL,
        "end_time" time NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "notes" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_appointments" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "fk_appointments_business" FOREIGN KEY ("business_id") REFERENCES "businesses" (id) ON DELETE CASCADE`)
    await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "fk_appointments_service" FOREIGN KEY ("service_id") REFERENCES "services" (id) ON DELETE SET NULL`)
    await queryRunner.query(`CREATE INDEX "idx_appointments_business_date" ON "appointments" ("business_id", "date")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "appointments"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "availability"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "booking_rules"`)
  }
}