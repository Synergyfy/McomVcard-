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

function makePlan(overrides: Partial<PlanResponseDto> = {}): PlanResponseDto {
  return {
    id: 'plan-1',
    level: 'Gold',
    audience: 'business',
    name: 'Gold',
    tagline: 'High-tier access',
    popular: false,
    sortOrder: 2,
    features: [{ text: '50 Business VCards', description: '', scope: 'All' }],
    rules: [],
    tiers: {
      Normal: { monthly: 10, quarterly: 27, semiannual: 54, annual: 100, setupFee: 0, trialDays: 14, description: '', scope: 'All' },
      Pro: { monthly: 10, quarterly: 27, semiannual: 54, annual: 100, setupFee: 0, trialDays: 14, description: '', scope: 'All' },
      'Pro+': { monthly: 10, quarterly: 27, semiannual: 54, annual: 100, setupFee: 0, trialDays: 14, description: '', scope: 'All' },
    },
    sections: { price: { description: '' }, feature: { description: '' }, rule: { description: '' } },
    annualDiscount: { type: 'months', value: 2 },
    currency: 'GBP',
    status: 'active',
    configuration: null,
    isDefault: false,
    stripeMonthlyPriceId: null,
    stripeQuarterlyPriceId: null,
    stripeAnnualPriceId: null,
    paypalMonthlyPlanId: null,
    paypalQuarterlyPlanId: null,
    paypalAnnualPlanId: null,
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
    it('maps a flat connector plan onto the business Gold plan (Pro-tier pricing)', async () => {
      plansService.create!.mockResolvedValue(makePlan())

      const result = await service.create({
        name: 'Gold',
        description: 'High-tier access',
        monthlyPrice: 10,
        trialDuration: 14,
        features: ['50 Business VCards'],
        configuration: { quotas: { maxVCards: 50 }, featureFlags: { customDomains: true } },
        isDefault: false,
      })

      expect(plansService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'Gold',
          audience: 'business',
          name: 'Gold',
          tagline: 'High-tier access',
          isDefault: false,
          configuration: { quotas: { maxVCards: 50 }, featureFlags: { customDomains: true } },
          features: [{ text: '50 Business VCards', description: '', scope: 'All' }],
        }),
      )

      const createArg = plansService.create!.mock.calls[0][0] as any
      expect(createArg.tiers.Pro).toEqual({
        monthly: 10,
        quarterly: 27,
        semiannual: 54,
        annual: 100,
        setupFee: 0,
        trialDays: 14,
        description: '',
        scope: 'All',
      })
      expect(createArg.tiers.Normal.trialDays).toBe(14)
      expect(createArg.tiers['Pro+'].monthly).toBe(10)

      // Read side surfaces Pro-tier pricing
      expect(result).toMatchObject({
        id: 'plan-1',
        name: 'Gold',
        monthlyPrice: 10,
        quarterlyPrice: 27,
        annualPrice: 100,
        trialDuration: 14,
        isActive: true,
        type: 'STANDARD',
        features: ['50 Business VCards'],
      })
    })

    it('infers the plan level from the name', async () => {
      plansService.create!.mockResolvedValue(makePlan({ level: 'Platinum', name: 'Platinum' }))

      await service.create({ name: 'Platinum', monthlyPrice: 1499 })

      const createArg = plansService.create!.mock.calls[0][0] as any
      expect(createArg.level).toBe('Platinum')
    })

    it('defaults to Gold level when the name does not match a known level', async () => {
      plansService.create!.mockResolvedValue(makePlan())

      await service.create({ name: 'Custom Plan', monthlyPrice: 5 })

      const createArg = plansService.create!.mock.calls[0][0] as any
      expect(createArg.level).toBe('Gold')
    })

    it('uses a 14-day trial when type is TRIAL and no trialDuration given', async () => {
      plansService.create!.mockResolvedValue(makePlan())

      await service.create({ name: 'Gold', monthlyPrice: 10, type: 'TRIAL' })

      const createArg = plansService.create!.mock.calls[0][0] as any
      expect(createArg.tiers.Pro.trialDays).toBe(14)
    })

    it('marks the plan as the free/default tier when isDefault is true', async () => {
      plansService.create!.mockResolvedValue(makePlan({ isDefault: true }))

      await service.create({ name: 'Bronze', monthlyPrice: 0, isDefault: true })

      const createArg = plansService.create!.mock.calls[0][0] as any
      expect(createArg.isDefault).toBe(true)
      expect(createArg.level).toBe('Bronze')
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
        name: 'Gold',
        monthlyPrice: 10,
        quarterlyPrice: 27,
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
      expect(result.monthlyPrice).toBe(10)
    })

    it('propagates NotFound when the plan does not exist', async () => {
      plansService.findOne!.mockRejectedValue(new NotFoundException('Plan not found'))

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('merges pricing updates with the current tiers and maps isActive to status', async () => {
      const current = makePlan()
      plansService.findOne!.mockResolvedValue(current)
      plansService.update!.mockResolvedValue(makePlan({ status: 'inactive' }))

      const result = await service.update('plan-1', { monthlyPrice: 20, isActive: false })

      expect(plansService.update).toHaveBeenCalledWith(
        'plan-1',
        expect.objectContaining({
          status: 'inactive',
        }),
      )
      const updateArg = plansService.update!.mock.calls[0][1] as any
      expect(updateArg.tiers.Pro.monthly).toBe(20)
      // Unchanged fields preserved from the current plan
      expect(updateArg.tiers.Pro.quarterly).toBe(27)
      expect(updateArg.tiers.Pro.annual).toBe(100)
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
      expect(updateArg.tagline).toBe('New tagline')
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