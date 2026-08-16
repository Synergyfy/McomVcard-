import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitUsersRoles00011690000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "email" character varying NOT NULL UNIQUE,
        "name" character varying,
        "password" character varying,
        "isAdmin" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "roles" (
        "id" SERIAL PRIMARY KEY,
        "name" character varying NOT NULL UNIQUE,
        "description" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_roles" (
        "user_id" integer NOT NULL,
        "role_id" integer NOT NULL,
        PRIMARY KEY ("user_id", "role_id"),
        CONSTRAINT fk_user FOREIGN KEY ("user_id") REFERENCES "users" (id) ON DELETE CASCADE,
        CONSTRAINT fk_role FOREIGN KEY ("role_id") REFERENCES "roles" (id) ON DELETE CASCADE
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_roles"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "roles"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`)
  }
}
