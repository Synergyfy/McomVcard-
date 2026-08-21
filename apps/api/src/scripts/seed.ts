import 'reflect-metadata'
import { appDataSource } from '../data-source'
import * as bcrypt from 'bcryptjs'
import crypto from 'crypto'

import { User } from '../modules/users/entities/user.entity'
import { Role } from '../modules/roles/entities/role.entity'
import { UserRole } from '../modules/roles/entities/user-role.entity'
import { BusinessCategory } from '../modules/businesses/entities/business-category.entity'
import { Template } from '../modules/cards/entities/template.entity'
import { TemplateField } from '../modules/cards/entities/template-field.entity'

const DEFAULT_ROLES = [
  { name: 'USER', description: 'Standard authenticated user' },
  { name: 'ADMIN', description: 'Administrator with full access' },
  { name: 'BUSINESS_OWNER', description: 'Owns and manages a business on the platform' },
  { name: 'STAFF', description: 'Staff member with limited business access' },
]

const DEFAULT_CATEGORIES = [
  { name: 'Restaurant', description: 'Restaurants, cafes, and food services' },
  { name: 'Retail', description: 'Retail stores and shops' },
  { name: 'Health & Fitness', description: 'Gyms, clinics, and wellness services' },
  { name: 'Beauty & Salon', description: 'Hair, nails, and beauty services' },
  { name: 'Services', description: 'Professional and home services' },
  { name: 'Entertainment', description: 'Events, venues, and leisure' },
  { name: 'Education', description: 'Schools, tutors, and training' },
  { name: 'Other', description: 'Anything else' },
]

const DEFAULT_TEMPLATES: Array<Record<string, unknown>> = []

const DEFAULT_TEMPLATE_FIELDS: Record<string, Array<Record<string, unknown>>> = {}

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

    // Upsert default business categories
    for (const category of DEFAULT_CATEGORIES) {
      await queryRunner.manager.upsert(BusinessCategory, category, ['name'])
    }

    // Upsert default templates + their fields (idempotent by template slug)
    // No default templates — templates are created by Admin at runtime.
    // This section is intentionally left empty.

    const adminRole = await queryRunner.manager.findOneBy(Role, { name: 'ADMIN' })
    const userRole = await queryRunner.manager.findOneBy(Role, { name: 'USER' })
    const ownerRole = await queryRunner.manager.findOneBy(Role, { name: 'BUSINESS_OWNER' })
    const staffRole = await queryRunner.manager.findOneBy(Role, { name: 'STAFF' })

    // Seed users for each role (idempotent — skips existing emails)
    const seedUsers = [
      { email: 'admin@example.com', password: 'admin123', firstName: 'Admin', lastName: 'User', role: adminRole },
      { email: 'user@example.com', password: 'user123', firstName: 'Regular', lastName: 'User', role: userRole },
      { email: 'owner@example.com', password: 'owner123', firstName: 'Business', lastName: 'Owner', role: ownerRole },
      { email: 'staff@example.com', password: 'staff123', firstName: 'Staff', lastName: 'Member', role: staffRole },
    ]

    for (const seed of seedUsers) {
      let user = await queryRunner.manager.findOneBy(User, { email: seed.email })

      if (!user) {
        const hashed = await bcrypt.hash(seed.password, 10)
        user = await queryRunner.manager.save(
          queryRunner.manager.create(User, {
            email: seed.email,
            passwordHash: hashed,
            firstName: seed.firstName,
            lastName: seed.lastName,
            status: 'active',
            isVerified: true,
            emailVerifiedAt: new Date(),
          }),
        )
      }

      if (seed.role) {
        await queryRunner.manager.upsert(
          UserRole,
          { userId: user.id, roleId: seed.role.id },
          ['userId', 'roleId'],
        )
      }
    }

    await queryRunner.commitTransaction()

    console.log('\n=== Seeded users ===')
    for (const seed of seedUsers) {
      console.log(`  ${seed.email} / ${seed.password}  [${seed.role?.name}]`)
    }
    console.log('')
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