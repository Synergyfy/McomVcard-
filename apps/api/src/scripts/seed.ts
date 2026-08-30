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
import { Plan, PlanLevel, PlanTierPricingMap, PlanFeature, PricingSections, AnnualDiscount, PlanConfiguration } from '../modules/plans/entities/plan.entity'

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

const BUSINESS_PLANS: Array<{
  level: PlanLevel
  sortOrder: number
  tagline: string
  popular: boolean
  isDefault: boolean
  monthly: number
  trialDays: number
  features: string[]
  quotas: Record<string, number | boolean>
  featureFlags: Record<string, boolean>
}> = [
  {
    level: 'Bronze',
    sortOrder: 0,
    tagline: 'The essential start for small businesses building their digital presence.',
    popular: false,
    isDefault: true,
    monthly: 49,
    trialDays: 14,
    features: ['10 Business VCards', 'Standard QR codes', 'Email support'],
    quotas: { maxVCards: 10, maxTeamMembers: 1 },
    featureFlags: { allowNfc: false, customDomains: false },
  },
  {
    level: 'Silver',
    sortOrder: 1,
    tagline: 'Mid-tier growth with more cards, consumer VCards and QR power.',
    popular: false,
    isDefault: false,
    monthly: 149,
    trialDays: 14,
    features: ['50 Business VCards', 'Custom QR codes', 'Priority support'],
    quotas: { maxVCards: 50, maxTeamMembers: 5 },
    featureFlags: { allowNfc: true, customDomains: false },
  },
  {
    level: 'Gold',
    sortOrder: 2,
    tagline: 'High-tier access with the full VCard suite and premium QR features.',
    popular: true,
    isDefault: false,
    monthly: 449,
    trialDays: 14,
    features: ['Unlimited Business VCards', 'Analytics dashboard', 'Custom domains'],
    quotas: { maxVCards: 999, maxTeamMembers: 20 },
    featureFlags: { allowNfc: true, customDomains: true },
  },
]

function buildTiers(monthly: number, trialDays: number): PlanTierPricingMap {
  const createTier = (m: number, annual: number, trial = trialDays) => ({
    monthly: m,
    quarterly: Math.round(m * 2.7),
    semiannual: Math.round(m * 5.4),
    annual,
    setupFee: 0,
    trialDays: trial,
    description: '',
    scope: 'All' as const,
  })

  return {
    Normal: createTier(0, 0),
    Pro: createTier(monthly, monthly * 10),
    'Pro+': createTier(Math.round(monthly * 1.5), Math.round(monthly * 1.5) * 10, 7),
  }
}

const DEFAULT_SECTIONS: PricingSections = {
  price: { description: 'Prices for the selected tier, per billing cycle. Includes the one-off setup fee and free-trial days.' },
  feature: { description: 'Check-list items shown on the plan cards.' },
  rule: { description: 'Limits enforced across admin setup, business usage and consumer usage, and shown in the public comparison table.' },
}

const DEFAULT_ANNUAL_DISCOUNT: AnnualDiscount = { type: 'months', value: 2 }

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

      const hashed = await bcrypt.hash(seed.password, 10)

      if (!user) {
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
      } else {
        // Always sync password hash so the seed credentials stay valid.
        user.passwordHash = hashed
        await queryRunner.manager.save(user)
      }

      if (seed.role) {
        await queryRunner.manager.upsert(
          UserRole,
          { userId: user.id, roleId: seed.role.id },
          ['userId', 'roleId'],
        )
      }
    }

    // Seed business plans (guarded — only when the plans table is empty)
    const existingPlans = await queryRunner.manager.count(Plan)
    if (existingPlans > 0) {
      console.log('  Plans already present — skipping plan seed')
    } else {
      for (const spec of BUSINESS_PLANS) {
        const features: PlanFeature[] = spec.features.map((text) => ({
          text,
          description: '',
          scope: 'All' as const,
        }))
        const configuration: PlanConfiguration = {
          quotas: spec.quotas,
          featureFlags: spec.featureFlags,
        }
        const plan = queryRunner.manager.create(Plan, {
          level: spec.level,
          audience: 'business',
          name: spec.level,
          tagline: spec.tagline,
          popular: spec.popular,
          sortOrder: spec.sortOrder,
          features,
          rules: [],
          tiers: buildTiers(spec.monthly, spec.trialDays),
          sections: DEFAULT_SECTIONS,
          annualDiscount: DEFAULT_ANNUAL_DISCOUNT,
          currency: 'GBP',
          status: 'active',
          configuration,
          isDefault: spec.isDefault,
        })
        await queryRunner.manager.save(plan)
      }
    }

    await queryRunner.commitTransaction()

    console.log('\n=== Seeded users ===')
    for (const seed of seedUsers) {
      console.log(`  ${seed.email} / ${seed.password}  [${seed.role?.name}]`)
    }
    console.log('\n=== Seeded business plans ===')
    if (existingPlans > 0) {
      console.log(`  (skipped — ${existingPlans} plan(s) already in the plans table)`)
    } else {
      for (const spec of BUSINESS_PLANS) {
        console.log(`  ${spec.level} / business  [GBP ${spec.monthly}/mo, default=${spec.isDefault}]`)
      }
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