import { ForbiddenException } from '@nestjs/common'
import { CapabilitiesService, type ResolvedCapabilities } from './capabilities.service'

function resolved(overrides: Partial<ResolvedCapabilities> = {}): ResolvedCapabilities {
  return {
    allowed: true,
    source: 'plan',
    planId: 'plan-1',
    planName: 'Business Growth',
    accessPassId: null,
    variant: 'standard',
    variantName: 'Standard',
    durationDays: 90,
    startedAt: '2026-01-01T00:00:00.000Z',
    expiresAt: '2026-04-01T00:00:00.000Z',
    features: [],
    quotas: { maxVCards: 3 },
    featureFlags: { rewards: false },
    capabilities: {
      maxVCards: { key: 'maxVCards', mode: 'limited', enabled: true, limit: 3 },
      maxBusinessCards: { key: 'maxBusinessCards', mode: 'unlimited', enabled: true, limit: null },
      rewards: { key: 'rewards', mode: 'disabled', enabled: false, limit: null },
    },
    ...overrides,
  }
}

describe('CapabilitiesService enforcement', () => {
  let service: CapabilitiesService

  beforeEach(() => {
    service = new CapabilitiesService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      { find: jest.fn().mockResolvedValue([]), save: jest.fn() } as any,
    )
  })

  it('allows usage below a finite quota', async () => {
    jest.spyOn(service, 'resolveForUser').mockResolvedValue(resolved())
    await expect(service.assertQuota('user-1', 'maxVCards', 2)).resolves.toBeTruthy()
  })

  it('denies usage at a finite quota', async () => {
    jest.spyOn(service, 'resolveForUser').mockResolvedValue(resolved())
    await expect(service.assertQuota('user-1', 'maxVCards', 3)).rejects.toBeInstanceOf(
      ForbiddenException,
    )
  })

  it('denies usage when the quota is disabled (0)', async () => {
    jest.spyOn(service, 'resolveForUser').mockResolvedValue(
      resolved({
        capabilities: {
          maxVCards: { key: 'maxVCards', mode: 'disabled', enabled: false, limit: null },
        },
      }),
    )
    await expect(service.assertQuota('user-1', 'maxVCards', 0)).rejects.toBeInstanceOf(
      ForbiddenException,
    )
  })

  it('allows unlimited quotas regardless of usage', async () => {
    jest.spyOn(service, 'resolveForUser').mockResolvedValue(resolved())
    await expect(service.assertQuota('user-1', 'maxBusinessCards', 999)).resolves.toBeTruthy()
  })

  it('denies a feature that is explicitly disabled', async () => {
    jest.spyOn(service, 'resolveForUser').mockResolvedValue(resolved())
    await expect(service.assertFeature('user-1', 'rewards')).rejects.toBeInstanceOf(
      ForbiddenException,
    )
  })

  it('prefers a locally purchased plan variant over a Central membership', async () => {
    const localPlan = {
      id: 'local-plan',
      name: 'Platinum',
      configuration: null,
      features: [],
      variants: [
        {
          key: 'pro',
          name: 'Pro',
          durationDays: 180,
          price: 100,
          description: '180 days',
          features: null,
          rules: null,
          configuration: { quotas: { maxVCards: 7 }, featureFlags: { rewards: true } },
          stripePriceId: null,
          paypalPlanId: null,
          isActive: true,
        },
      ],
    }
    const subscriptionsRepo = {
      find: jest.fn().mockResolvedValue([
        {
          planId: 'local-plan',
          plan: localPlan,
          variant: 'pro',
          status: 'active',
          startedAt: new Date('2026-01-01T00:00:00.000Z'),
          expiresAt: new Date(Date.now() + 86_400_000),
        },
      ]),
    }
    const usersRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'user-1',
        mcomCanAccessVcard: true,
        mcomAccess: {
          allowed: true,
          planId: 'central-plan',
          planName: 'Gold Standard',
          quotas: { maxVCards: 1 },
          limits: {},
        },
      }),
    }
    const serviceWithRepos = new CapabilitiesService(
      { findOne: jest.fn() } as any,
      subscriptionsRepo as any,
      usersRepo as any,
      { findOne: jest.fn() } as any,
      { findOne: jest.fn() } as any,
      { find: jest.fn().mockResolvedValue([]), save: jest.fn() } as any,
    )

    const result = await serviceWithRepos.resolveForUser('user-1')

    expect(result.source).toBe('plan')
    expect(result.planName).toBe('Platinum')
    expect(result.variant).toBe('pro')
    expect(result.capabilities.maxVCards).toMatchObject({ mode: 'limited', limit: 7 })
  })

  it('uses the local configuration of the VCard plan bundled with a Central membership', async () => {
    const centralPlan = {
      id: 'central-plan',
      name: 'Gold',
      configuration: null,
      features: [],
      variants: [
        {
          key: 'standard',
          name: 'Standard',
          durationDays: 90,
          price: 0,
          description: '90 days',
          features: null,
          rules: null,
          configuration: {
            quotas: { maxVCards: 50 },
            featureFlags: { rewards: false },
          },
          stripePriceId: null,
          paypalPlanId: null,
          isActive: true,
        },
      ],
    }
    const serviceWithRepos = new CapabilitiesService(
      {
        findOne: jest.fn().mockResolvedValue(centralPlan),
        createQueryBuilder: jest.fn(),
      } as any,
      { find: jest.fn().mockResolvedValue([]) } as any,
      {
        findOne: jest.fn().mockResolvedValue({
          id: 'user-1',
          mcomCanAccessVcard: true,
          mcomMembershipLevel: 'Gold',
          mcomMembershipTier: 'Pro',
          mcomAccess: {
            allowed: true,
            planId: 'central-plan',
            planName: 'Gold Standard',
            membershipLevel: 'Gold',
            quotas: { maxVCards: 999 },
            limits: {},
          },
        }),
      } as any,
      { findOne: jest.fn().mockResolvedValue(null) } as any,
      { findOne: jest.fn() } as any,
      { find: jest.fn().mockResolvedValue([]), save: jest.fn() } as any,
    )

    const result = await serviceWithRepos.resolveForUser('user-1')

    expect(result.source).toBe('central')
    expect(result.variant).toBe('standard')
    expect(result.planName).toBe('Gold')
    expect(result.capabilities.maxVCards).toMatchObject({ mode: 'limited', limit: 50 })
    expect(result.capabilities.rewards?.mode).toBe('disabled')
  })

  it('resolves a purchased access pass and enforces its configuration', async () => {
    const pass = {
      id: 'pass-1',
      name: '70-Day Business Boost',
      durationDays: 70,
      price: 30,
      status: 'active',
      features: [{ text: 'NFC cards', description: '', scope: 'All' }],
      configuration: {
        quotas: { maxVCards: 20 },
        featureFlags: { rewards: false },
      },
    }
    const serviceWithRepos = new CapabilitiesService(
      { findOne: jest.fn() } as any,
      { find: jest.fn().mockResolvedValue([]) } as any,
      { findOne: jest.fn().mockResolvedValue({ id: 'user-1', mcomCanAccessVcard: true }) } as any,
      { findOne: jest.fn().mockResolvedValue(null) } as any,
      { findOne: jest.fn() } as any,
      {
        find: jest.fn().mockResolvedValue([
          {
            accessPassId: pass.id,
            accessPass: pass,
            status: 'active',
            startedAt: new Date('2026-01-01T00:00:00.000Z'),
            expiresAt: new Date(Date.now() + 86_400_000),
          },
        ]),
        save: jest.fn(),
      } as any,
    )

    const result = await serviceWithRepos.resolveForUser('user-1')

    expect(result.source).toBe('access_pass')
    expect(result.planName).toBe('70-Day Business Boost')
    expect(result.durationDays).toBe(70)
    expect(result.features).toEqual(['NFC cards'])
    expect(result.capabilities.maxVCards).toMatchObject({ mode: 'limited', limit: 20 })
    expect(result.capabilities.rewards?.mode).toBe('disabled')
  })

  it('allows unknown feature flags but denies quota creation without a plan', async () => {
    jest.spyOn(service, 'resolveForUser').mockResolvedValue(resolved())
    await expect(service.assertFeature('user-1', 'unknownFeature')).resolves.toBeTruthy()

    jest.spyOn(service, 'resolveForUser').mockResolvedValue(
      resolved({ allowed: false, source: 'none', capabilities: {} }),
    )
    await expect(service.assertQuota('user-1', 'maxVCards', 999)).rejects.toBeInstanceOf(
      ForbiddenException,
    )
  })
})
