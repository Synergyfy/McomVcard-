import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { SystemPlansController } from './system-plans.controller'
import { SystemPlansService } from './system-plans.service'
import { ApiResponse } from '../../lib/utils/api-response'
import { SystemPlanResponseDto } from './dto/system-plan.dto'

type MockSystemPlansService = Partial<Record<keyof SystemPlansService, jest.Mock>>

function makePlan(): SystemPlanResponseDto {
  return {
    id: 'plan-1',
    name: 'Gold',
    description: 'High-tier access',
    monthlyPrice: 10,
    quarterlyPrice: 27,
    annualPrice: 100,
    features: ['50 Business VCards'],
    configuration: { quotas: { maxVCards: 50 } },
    isActive: true,
    isDefault: false,
    type: 'STANDARD',
    trialDuration: 14,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  }
}

describe('SystemPlansController', () => {
  let controller: SystemPlansController
  let service: MockSystemPlansService

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemPlansController],
      providers: [
        { provide: SystemPlansService, useValue: service },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('secret-key') } },
      ],
    }).compile()

    controller = module.get(SystemPlansController)
  })

  afterEach(() => jest.clearAllMocks())

  describe('GET /', () => {
    it('returns the bare array so the interceptor wraps it under data (getPlans contract)', async () => {
      service.findAll!.mockResolvedValue([makePlan()])

      const result = await controller.findAll()

      expect(Array.isArray(result)).toBe(true)
      expect((result as SystemPlanResponseDto[])[0].monthlyPrice).toBe(10)
    })
  })

  describe('POST /', () => {
    it('returns an ApiResponse whose plan fields are flattened onto the top level', async () => {
      service.create!.mockResolvedValue(makePlan())

      const result = await controller.create({ name: 'Gold' } as any) as ApiResponse<SystemPlanResponseDto> & SystemPlanResponseDto

      expect(result instanceof ApiResponse).toBe(true)
      expect(result.data).toMatchObject({ id: 'plan-1', monthlyPrice: 10 })
      // Flat access for GenericHttpConnector.createPlan
      expect((result as any).id).toBe('plan-1')
      expect((result as any).monthlyPrice).toBe(10)
    })
  })

  describe('GET /:id', () => {
    it('returns a flattened ApiResponse so getPlanById reads prices off the body', async () => {
      service.findOne!.mockResolvedValue(makePlan())

      const result = await controller.findOne('plan-1') as ApiResponse<SystemPlanResponseDto> & SystemPlanResponseDto

      expect(result instanceof ApiResponse).toBe(true)
      expect(result.data?.id).toBe('plan-1')
      expect((result as any).monthlyPrice).toBe(10)
      expect((result as any).quarterlyPrice).toBe(27)
      expect((result as any).annualPrice).toBe(100)
      expect((result as any).trialDuration).toBe(14)
      expect(service.findOne).toHaveBeenCalledWith('plan-1')
    })
  })

  describe('PATCH /:id', () => {
    it('returns a flattened ApiResponse for the updated plan', async () => {
      service.update!.mockResolvedValue(makePlan())

      const result = await controller.update('plan-1', { isActive: false } as any) as ApiResponse<SystemPlanResponseDto> & SystemPlanResponseDto

      expect(result instanceof ApiResponse).toBe(true)
      expect(result.data?.id).toBe('plan-1')
      expect((result as any).monthlyPrice).toBe(10)
      expect(service.update).toHaveBeenCalledWith('plan-1', { isActive: false })
    })
  })

  describe('DELETE /:id', () => {
    it('returns a message ApiResponse with null data', async () => {
      service.remove!.mockResolvedValue(undefined)

      const result = await controller.remove('plan-1')

      expect(result instanceof ApiResponse).toBe(true)
      expect(result.message).toBe('Plan deleted')
      expect(result.data).toBeNull()
      expect(service.remove).toHaveBeenCalledWith('plan-1')
    })
  })
})