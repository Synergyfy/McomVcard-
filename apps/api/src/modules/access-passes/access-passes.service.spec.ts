import { BadRequestException } from '@nestjs/common'
import { AccessPassesService } from './access-passes.service'

const DAY_MS = 24 * 60 * 60 * 1000

function pass(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pass-1',
    name: '70-Day Business Boost',
    description: 'Short-term business access.',
    price: 30,
    durationDays: 70,
    currency: 'GBP',
    status: 'active',
    features: [],
    configuration: { quotas: { maxVCards: 20 }, featureFlags: { rewards: true } },
    stripePriceId: null,
    paypalPlanId: null,
    popular: false,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('AccessPassesService', () => {
  let service: AccessPassesService
  let passesRepo: any
  let purchasesRepo: any
  let usersRepo: any
  let subscriptionsRepo: any
  let manager: any

  beforeEach(() => {
    manager = {
      findOne: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue(undefined),
      create: jest.fn((_entity: unknown, value: unknown) => value),
      save: jest.fn(async (value: any) => ({ id: 'purchase-1', ...value })),
    }
    passesRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((value: unknown) => value),
      save: jest.fn(async (value: any) => ({ ...value, id: 'pass-1' })),
      remove: jest.fn(),
    }
    purchasesRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      save: jest.fn(),
      manager: { transaction: jest.fn(async (cb: any) => cb(manager)) },
    }
    usersRepo = { update: jest.fn() }
    subscriptionsRepo = { find: jest.fn() }

    service = new AccessPassesService(passesRepo, purchasesRepo, usersRepo, subscriptionsRepo)
  })

  it('rejects a duplicate access pass name', async () => {
    passesRepo.findOne.mockResolvedValue(pass())

    await expect(
      service.create({
        name: '70-Day Business Boost',
        price: 30,
        durationDays: 70,
      }),
    ).rejects.toBeInstanceOf(BadRequestException)

    expect(passesRepo.save).not.toHaveBeenCalled()
  })

  it('creates an access pass with the configured duration and configuration', async () => {
    passesRepo.findOne.mockResolvedValue(null)

    const created = await service.create({
      name: '70-Day Business Boost',
      description: 'Short-term business access.',
      price: 30,
      durationDays: 70,
      features: [{ text: 'NFC cards', description: '', scope: 'All' }],
      configuration: { quotas: { maxVCards: 20 }, featureFlags: { rewards: true } },
    })

    expect(passesRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '70-Day Business Boost',
        price: 30,
        durationDays: 70,
        configuration: { quotas: { maxVCards: 20 }, featureFlags: { rewards: true } },
      }),
    )
    expect(created).toMatchObject({
      id: 'pass-1',
      durationDays: 70,
      price: 30,
    })
  })

  it('activates a pass for exactly its configured number of days', async () => {
    passesRepo.findOne.mockResolvedValue(pass())

    const before = Date.now()
    const purchase = await service.activatePurchase({
      userId: 'user-1',
      accessPassId: 'pass-1',
      paymentReference: 'charge-1',
    })

    const expires = new Date(purchase.expiresAt).getTime()
    expect(expires).toBeGreaterThanOrEqual(before + 70 * DAY_MS - 1000)
    expect(expires).toBeLessThanOrEqual(Date.now() + 70 * DAY_MS + 1000)
    expect(manager.update).toHaveBeenCalledWith(
      expect.anything(),
      { id: 'user-1' },
      expect.objectContaining({ mcomCanAccessVcard: true, mcomMembershipStatus: 'active' }),
    )
  })

  it('is idempotent on the payment reference', async () => {
    passesRepo.findOne.mockResolvedValue(pass())
    manager.findOne.mockResolvedValue({ id: 'already-active' })

    const purchase = await service.activatePurchase({
      userId: 'user-1',
      accessPassId: 'pass-1',
      paymentReference: 'charge-1',
    })

    expect(purchase).toEqual({ id: 'already-active' })
    expect(manager.save).not.toHaveBeenCalled()
  })

  it('expires old pass windows and marks unexpired pass records expired', async () => {
    purchasesRepo.find.mockResolvedValue([
      {
        id: 'old',
        expiresAt: new Date(Date.now() - DAY_MS),
        status: 'active',
        accessPass: pass(),
      },
    ])
    purchasesRepo.save.mockImplementation(async (value: any) => value)

    const active = await service.findActivePurchaseForUser('user-1')

    expect(active).toBeNull()
    expect(purchasesRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'old', status: 'expired' }),
    )
  })
})
