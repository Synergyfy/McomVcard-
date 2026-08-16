import 'reflect-metadata'
import { AppDataSource } from '../data-source'
import * as bcrypt from 'bcryptjs'

import { User } from '../modules/users/entities/user.entity'

async function seed() {
  await AppDataSource.initialize()

  const queryRunner = AppDataSource.createQueryRunner()
  await queryRunner.connect()
  await queryRunner.startTransaction()

  try {
    // Ensure roles and user_roles tables exist (migration should create them, but be defensive)
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
        PRIMARY KEY ("user_id", "role_id")
      )
    `)

    // Upsert admin role
    await queryRunner.query(
      `INSERT INTO roles(name, description) VALUES($1, $2) ON CONFLICT (name) DO NOTHING`,
      ['admin', 'Administrator role'],
    )

    const roleRes = await queryRunner.query(`SELECT id FROM roles WHERE name = $1`, ['admin'])
    const adminRoleId = roleRes && roleRes[0] ? roleRes[0].id : null

    // Insert admin user if missing (idempotent)
    const existing = await queryRunner.query(`SELECT id FROM users WHERE email = $1`, ['admin@example.com'])
    let adminId: number | null = null
    if (!existing || existing.length === 0) {
      const hashed = await bcrypt.hash('changeme', 10)
      const insertRes = await queryRunner.query(
        `INSERT INTO users(email, password, name, "isAdmin", "createdAt", "updatedAt") VALUES($1, $2, $3, $4, now(), now()) ON CONFLICT (email) DO NOTHING RETURNING id`,
        ['admin@example.com', hashed, 'Admin', true],
      )
      if (insertRes && insertRes[0]) adminId = insertRes[0].id
    } else {
      adminId = existing[0].id
    }

    // Associate role
    if (adminId && adminRoleId) {
      await queryRunner.query(
        `INSERT INTO user_roles(user_id, role_id) VALUES($1, $2) ON CONFLICT DO NOTHING`,
        [adminId, adminRoleId],
      )
    }

    await queryRunner.commitTransaction()

    if (adminId && (!existing || existing.length === 0)) {
      // eslint-disable-next-line no-console
      console.log('Created admin user: admin@example.com / changeme')
    } else {
      // eslint-disable-next-line no-console
      console.log('Admin user already exists')
    }
  } catch (err) {
    await queryRunner.rollbackTransaction()
    // eslint-disable-next-line no-console
    console.error('Seed failed', err)
    process.exit(1)
  } finally {
    await queryRunner.release()
    await AppDataSource.destroy()
  }
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed', err)
  process.exit(1)
})
