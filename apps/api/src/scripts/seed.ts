import 'reflect-metadata'
import { AppDataSource } from '../data-source'
import * as bcrypt from 'bcryptjs'

import { User } from '../modules/users/entities/user.entity'

async function seed() {
  await AppDataSource.initialize()

  const manager = AppDataSource.manager

  // Ensure roles and user_roles tables exist (create if missing)
  await manager.query(`
    CREATE TABLE IF NOT EXISTS "roles" (
      "id" SERIAL PRIMARY KEY,
      "name" character varying NOT NULL UNIQUE,
      "description" character varying,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  `)

  await manager.query(`
    CREATE TABLE IF NOT EXISTS "user_roles" (
      "user_id" integer NOT NULL,
      "role_id" integer NOT NULL,
      PRIMARY KEY ("user_id", "role_id")
    )
  `)

  // Ensure roles table exists (migration should create it)
  const role = await manager.query(`SELECT id FROM roles WHERE name = $1`, ['admin'])
  let adminRoleId: number | null = null
  if (role && role.length > 0) {
    adminRoleId = role[0].id
  } else {
    const res = await manager.query(`INSERT INTO roles(name, description) VALUES($1, $2) RETURNING id`, ['admin', 'Administrator role'])
    adminRoleId = res[0].id
  }

  // Create admin user if not exists
  const existing = await manager.findOne(User, { where: { email: 'admin@example.com' } as any })
  if (!existing) {
    const hashed = await bcrypt.hash('changeme', 10)
    const saved = await manager.save(User, manager.create(User, { email: 'admin@example.com', password: hashed, name: 'Admin', isAdmin: true }))
    if (adminRoleId) {
      await manager.query(`INSERT INTO user_roles(user_id, role_id) VALUES($1, $2) ON CONFLICT DO NOTHING`, [saved.id, adminRoleId])
    }
    // eslint-disable-next-line no-console
    console.log('Created admin user: admin@example.com / changeme')
  } else {
    // eslint-disable-next-line no-console
    console.log('Admin user already exists')
  }

  await AppDataSource.destroy()
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed', err)
  process.exit(1)
})
