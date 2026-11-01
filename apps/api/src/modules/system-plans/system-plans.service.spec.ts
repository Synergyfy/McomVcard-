import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { SystemPlansService } from './system-plans.service'
import { PlansService } from '../plans/plans.service'
import { PlanResponseDto } from '../plans/dto/plan-response.dto'

type MockPlansService = Partial<Record<keyof PlansService, jest.Mock>>

function makePlansServiceMock(): MockPlansService {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }
}

function makeVariant(
  key: 'standard' | 'pro' | 'pro_plus',
  name: string,
  durationDays: number,
  price: number,
  trialDays = 14,
) {
  return {
    key,
    name,
    durationDays,
    price,
    setupFee: 0,
    trialDays,
    description: `${durationDays} days of access`,
    features: null,
    rules: null,
    configuration: null,
    stripePriceId: null,
    paypalPlanId: null,
    isActive: true,
  }
}

function makePlan(overrides: Partial<PlanResponseDto> = {}): PlanResponseDto {
  return {
    id: 'plan-1',
    level: null,
    audience: 'business',
    name: 'Business Growth',
    description: 'High-tier access',
    popular: false,
    sortOrder: 0,
    features: [{ text: '50 Business VCards', description: '', scope: 'All' }],
    rules: [],
    configuration: null,
    currency: 'GBP',
    status: 'active',
    type: 'STANDARD',
    seasonId: null,
    isDefault: false,
    variants: [
      makeVariant('standard', 'Standard', 90, 27),
      makeVariant('pro', 'Pro', 180, 54),
      makeVariant('pro_plus', 'Pro+', 365, 100),
    ],
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

describe('SystemPlansService', () => {
  let service: SystemPlansService
  let plansService: MockPlansService

  beforeEach(async () => {
    plansService = makePlansServiceMock()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemPlansService,
        { provide: PlansService, useValue: plansService },
      ],
    }).compile()

    service = module.get(SystemPlansService)
  })

  afterEach(() => jest.clearAllMocks())

  describe('create', () => {
    it('maps flat connector pricing onto the three variants', async () => {
      plansService.create!.mockResolvedValue(makePlan())

      const result = await service.create({
        name: 'Business Growth',
        description: 'High-tier access',
        monthlyPrice: 10,
        trialDuration: 14,
        features: ['50 Business VCards'],
        configuration: { quotas: { maxVCards: 50 }, featureFlags: { customDomains: true } },
        isDefault: false,
      })

      expect(plansService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          audience: 'business',
          name: 'Business Growth',
          description: 'High-tier access',
          isDefault: false,
          configuration: { quotas: { maxVCards: 50 }, featureFlags: { customDomains: true } },
          features: [{ text: '50 Business VCards', description: '', scope: 'All' }],
        }),
      )

      const createArg = plansService.create!.mock.calls[0][0] as any
      expect(createArg.level).toBeUndefined()
      expect(createArg.variants).toEqual([
        expect.objectContaining({ key: 'standard', price: 10, trialDays: 14 }),
        expect.objectContaining({ key: 'pro', price: 30, trialDays: 14 }),
        expect.objectContaining({ key: 'pro_plus', price: 120, trialDays: 14 }),
      ])

      // Read side surfaces the variant prices on the flat connector fields.
      expect(result).toMatchObject({
        id: 'plan-1',
        name: 'Business Growth',
        monthlyPrice: 27,
        quarterlyPrice: 54,
        semiannualPrice: 54,
        annualPrice: 100,
        trialDuration: 14,
        isActive: true,
        type: 'STANDARD',
        features: ['50 Business VCards'],
      })
    })

    it('prefers explicit variant prices over monthly multiplication', async () => {
      plansService.create!.mockResolvedValue(makePlan())

      await service.create({
        name: 'Growth',
        monthlyPrice: 10,
        quarterlyPrice: 35,
        semiannualPrice: 60,
        annualPrice: 110,
      })

      const createArg = plansService.create!.mock.calls[0][0] as any
      expect(createArg.variants).toEqual([
        expect.objectContaining({ key: 'standard', price: 10 }),
        expect.objectContaining({ key: 'pro', price: 35 }),
        expect.objectContaining({ key: 'pro_plus', price: 110 }),
      ])
    })

    it('accepts canonical Standard/Pro/Pro+ variants from the Central connector', async () => {
      plansService.create!.mockResolvedValue(makePlan())

      await service.create({
        name: 'Variant Plan',
        variants: [
          {
            tier: 'STANDARD',
            price: 12,
            features: ['Standard feature'],
            configuration: { quotas: { maxVCards: 5 } },
            stripePriceId: 'price_std',
          },
          {
            tier: 'PRO',
            price: 24,
            features: ['Pro feature'],
            configuration: { quotas: { maxVCards: 10 } },
          },
          {
            tier: 'PRO_PLUS',
            price: 48,
            features: ['Pro+ feature'],
            configuration: { quotas: { maxVCards: 20 } },
          },
        ],
      })

      const createArg = plansService.create!.mock.calls[0][0] as any
      expect(createArg.variants[0]).toMatchObject({
        key: 'standard',
        price: 12,
        features: [{ text: 'Standard feature', description: '', scope: 'All' }],
        configuration: { quotas: { maxVCards: 5 } },
        stripePriceId: 'price_std',
      })
      expect(createArg.variants[1]).toMatchObject({ key: 'pro', price: 24 })
      expect(createArg.variants[2]).toMatchObject({ key: 'pro_plus', price: 48 })
    })

    it('keeps the connector name verbatim for arbitrary plan names', async () => {
      plansService.create!.mockResolvedValue(makePlan({ name: 'Tes Plan' }))

      await service.create({ name: 'Tes Plan', monthlyPrice: 10 })

      const createArg = plansService.create!.mock.calls[0][0] as any
      expect(createArg.name).toBe('Tes Plan')
      expect(createArg.level).toBeUndefined()
    })

    it('uses a 14-day trial when type is TRIAL and no trialDuration given', async () => {
      plansService.create!.mockResolvedValue(makePlan())

      await service.create({ name: 'Trial Plan', monthlyPrice: 10, type: 'TRIAL' })

      const createArg = plansService.create!.mock.calls[0][0] as any
      expect(createArg.variants[0].trialDays).toBe(14)
    })

    it('marks the plan as the free/default plan when isDefault is true', async () => {
      plansService.create!.mockResolvedValue(makePlan({ isDefault: true }))

      await service.create({ name: 'Starter', monthlyPrice: 0, isDefault: true })

      const createArg = plansService.create!.mock.calls[0][0] as any
      expect(createArg.isDefault).toBe(true)
    })
  })

  describe('findAll', () => {
    it('returns only business-audience plans mapped to the connector contract', async () => {
      plansService.findAll!.mockResolvedValue([makePlan()])

      const result = await service.findAll()

      expect(plansService.findAll).toHaveBeenCalledWith('business')
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'plan-1',
        name: 'Business Growth',
        quarterlyPrice: 54,
        semiannualPrice: 54,
        annualPrice: 100,
        isActive: true,
        isDefault: false,
        type: 'STANDARD',
      })
    })

    it('returns an empty list when no business plans exist', async () => {
      plansService.findAll!.mockResolvedValue([])

      const result = await service.findAll()

      expect(result).toEqual([])
    })
  })

  describe('findOne', () => {
    it('returns the mapped plan for an existing id', async () => {
      plansService.findOne!.mockResolvedValue(makePlan())

      const result = await service.findOne('plan-1')

      expect(plansService.findOne).toHaveBeenCalledWith('plan-1')
      expect(result.id).toBe('plan-1')
      expect(result.quarterlyPrice).toBe(54)
      expect(result.semiannualPrice).toBe(54)
      expect(result.annualPrice).toBe(100)
    })

    it('propagates NotFound when the plan does not exist', async () => {
      plansService.findOne!.mockRejectedValue(new NotFoundException('Plan not found'))

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('updates variant prices and maps isActive to status', async () => {
      plansService.findOne!.mockResolvedValue(makePlan())
      plansService.update!.mockResolvedValue(makePlan({ status: 'inactive' }))

      const result = await service.update('plan-1', { monthlyPrice: 20, isActive: false })

      expect(plansService.update).toHaveBeenCalledWith(
        'plan-1',
        expect.objectContaining({ status: 'inactive' }),
      )
      const updateArg = plansService.update!.mock.calls[0][1] as any
      expect(updateArg.variants).toEqual([
        expect.objectContaining({ key: 'standard', price: 20 }),
        expect.objectContaining({ key: 'pro', price: 60 }),
        expect.objectContaining({ key: 'pro_plus', price: 240 }),
      ])
      expect(result.isActive).toBe(false)
    })

    it('maps description and features when provided', async () => {
      plansService.findOne!.mockResolvedValue(makePlan())
      plansService.update!.mockResolvedValue(makePlan())

      await service.update('plan-1', {
        description: 'New tagline',
        features: ['Feature A', 'Feature B'],
      })

      const updateArg = plansService.update!.mock.calls[0][1] as any
      expect(updateArg.description).toBe('New tagline')
      expect(updateArg.features).toEqual([
        { text: 'Feature A', description: '', scope: 'All' },
        { text: 'Feature B', description: '', scope: 'All' },
      ])
    })
  })

  describe('remove', () => {
    it('delegates deletion to the plans service', async () => {
      plansService.remove!.mockResolvedValue(undefined)

      await service.remove('plan-1')

      expect(plansService.remove).toHaveBeenCalledWith('plan-1')
    })
  })
})
