import 'reflect-metadata'
import { appDataSource } from '../data-source'
import * as bcrypt from 'bcryptjs'
import crypto from 'crypto'

import { User } from '../modules/users/entities/user.entity'
import { Role } from '../modules/roles/entities/role.entity'
import { UserRole } from '../modules/roles/entities/user-role.entity'

const DEFAULT_ROLES = [
  { name: 'USER', description: 'Standard authenticated user' },
  { name: 'ADMIN', description: 'Administrator with full access' },
  { name: 'BUSINESS_OWNER', description: 'Owns and manages a business on the platform' },
  { name: 'STAFF', description: 'Staff member with limited business access' },
]

async function seed() {
  await appDataSource.initialize()

  const queryRunner = appDataSource.createQueryRunner()
  await queryRunner.connect()
  await queryRunner.startTransaction()

  try {
    // Upsert default roles
    for (const role of DEFAULT_ROLES) {
      await queryRunner.manager.upsert(Role, role, ['name'])
    }

    const adminRole = await queryRunner.manager.findOneBy(Role, { name: 'ADMIN' })

    // Insert admin user if missing (idempotent)
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
    let adminPassword = process.env.SEED_ADMIN_PASSWORD || ''
    let generatedPassword = false
    if (!adminPassword) {
      adminPassword = crypto.randomBytes(10).toString('base64').replace(/\+/g, 'A').replace(/\//g, 'B')
      generatedPassword = true
    }

    let admin = await queryRunner.manager.findOneBy(User, { email: adminEmail })

    if (!admin) {
      const hashed = await bcrypt.hash(adminPassword, 10)

      admin = await queryRunner.manager.save(
        queryRunner.manager.create(User, {
          email: adminEmail,
          passwordHash: hashed,
          firstName: 'Admin',
          lastName: null,
          status: 'active',
          isVerified: true,
          emailVerifiedAt: new Date(),
        }),
      )
    }

    // Associate admin role
    if (adminRole) {
      await queryRunner.manager.upsert(
        UserRole,
        { userId: admin.id, roleId: adminRole.id },
        ['userId', 'roleId'],
      )
    }

    await queryRunner.commitTransaction()

    if (admin && generatedPassword) {
      // eslint-disable-next-line no-console
      console.log(`Created admin user: ${adminEmail} / ${adminPassword} (password generated)`)
      // eslint-disable-next-line no-console
      console.log('NOTE: This password is printed only once. Store it securely.')
    } else if (admin) {
      // eslint-disable-next-line no-console
      console.log(`Admin user ready: ${adminEmail}`)
    }
  } catch (err) {
    await queryRunner.rollbackTransaction()
    // eslint-disable-next-line no-console
    console.error('Seed failed', err)
    process.exit(1)
  } finally {
    await queryRunner.release()
    await appDataSource.destroy()
  }
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed', err)
  process.exit(1)
})