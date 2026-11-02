import { decideAccess, type McomEntitlement } from './access-decision'

const base = (overrides: Partial<McomEntitlement> = {}): McomEntitlement => ({
  version: '2026-10-01',
  access: { hasAccess: true, accessType: 'PAID_MEMBERSHIP', upgradeUrl: 'https://central.test/upgrade' },
  plan: {
    planId: 'plan-gold-vcards',
    planName: 'Vendor Pro',
    source: 'membership',
    status: 'active',
    expiresAt: null,
    quotas: { maxVCards: 500 },
    limits: { allowNfc: true },
    features: ['Priority support'],
  },
  membershipContext: {
    membershipPlanName: 'Gold',
    membershipLevel: 'Gold',
    membershipStatus: 'active',
    isIncludedInMembership: true,
  },
  trialContext: {
    isInTrial: false,
    hasPaidVerificationFee: true,
    trialExpiresAt: null,
    daysRemaining: 0,
    programmeTasks: [],
  },
  ...overrides,
})

describe('decideAccess', () => {
  it('grants membership access and exposes the included VCard plan', () => {
    const decision = decideAccess(base())

    expect(decision).toMatchObject({
      allowed: true,
      accessType: 'PAID_MEMBERSHIP',
      source: 'membership',
      planId: 'plan-gold-vcards',
      planName: 'Vendor Pro',
      membershipName: 'Gold',
      membershipLevel: 'Gold',
      isIncludedInMembership: true,
      expiresAt: null,
      quotas: { maxVCards: 500 },
      limits: { allowNfc: true },
      features: ['Priority support'],
    })
  })

  it('grants trial access with the countdown and programme tasks', () => {
    const decision = decideAccess(
      base({
        access: { hasAccess: true, accessType: 'TRIAL_PROGRAMME' },
        plan: {
          planId: 'trial_vcards',
          planName: 'Programme Trial Access',
          source: 'trial',
          status: 'trial',
          expiresAt: '2099-11-08T12:00:00.000Z',
          quotas: { trialAccess: true, daysRemaining: 14 },
        },
        membershipContext: { membershipPlanName: null, membershipLevel: 'Bronze', isIncludedInMembership: false },
        trialContext: {
          isInTrial: true,
          hasPaidVerificationFee: true,
          trialExpiresAt: '2099-11-08T12:00:00.000Z',
          daysRemaining: 14,
          programmeTasks: [
            {
              taskId: 'task_1',
              title: 'Publish your first listing',
              description: 'Create a product listing.',
              deadlineDays: 7,
              rewardPoints: 50,
              status: 'PENDING',
            },
          ],
        },
      }),
    )

    expect(decision).toMatchObject({
      allowed: true,
      accessType: 'TRIAL_PROGRAMME',
      source: 'trial',
      planId: 'trial_vcards',
      planName: 'Programme Trial Access',
      trialDaysRemaining: 14,
      trialExpiresAt: '2099-11-08T12:00:00.000Z',
      quotas: { trialAccess: true, daysRemaining: 14 },
    })
    expect(decision.tasks).toEqual([
      expect.objectContaining({ taskId: 'task_1', status: 'PENDING', rewardPoints: 50 }),
    ])
  })

  it('denies when the membership does not bundle the VCard plan', () => {
    const decision = decideAccess(
      base({
        access: {
          hasAccess: false,
          accessType: 'NONE',
          reason: 'PLATFORM_NOT_IN_MEMBERSHIP',
          upgradeUrl: 'https://central.test/memberships',
        },
        plan: null,
        membershipContext: {
          membershipPlanName: 'Gold',
          membershipLevel: 'Gold',
          membershipStatus: 'active',
          isIncludedInMembership: false,
        },
      }),
    )

    expect(decision.allowed).toBe(false)
    expect(decision.source).toBe('none')
    expect(decision.planId).toBeNull()
    expect(decision.reason).toBe('PLATFORM_NOT_IN_MEMBERSHIP')
    expect(decision.membershipName).toBe('Gold')
    expect(decision.upgradeUrl).toBe('https://central.test/memberships')
  })

  it('denies a trial window with no programme tasks for VCard', () => {
    const decision = decideAccess(
      base({
        access: { hasAccess: false, accessType: 'NONE', reason: 'TRIAL_NO_TASKS' },
        plan: null,
        trialContext: { isInTrial: true, programmeTasks: [] },
      }),
    )

    expect(decision.allowed).toBe(false)
    expect(decision.reason).toBe('TRIAL_NO_TASKS')
  })

  it('revokes access locally when the plan expiry has passed', () => {
    const decision = decideAccess(
      base({
        access: { hasAccess: true, accessType: 'TRIAL_PROGRAMME' },
        plan: {
          planId: 'trial_vcards',
          planName: 'Programme Trial Access',
          source: 'trial',
          status: 'trial',
          expiresAt: '2000-01-01T00:00:00.000Z',
        },
      }),
    )

    expect(decision.allowed).toBe(false)
    expect(decision.reason).toBe('NO_ACTIVE_ENTITLEMENT')
  })

  it('never grants access when Central says hasAccess is false', () => {
    const decision = decideAccess(
      base({
        access: { hasAccess: false, accessType: 'NONE', reason: 'NO_ACTIVE_ENTITLEMENT' },
        plan: null,
      }),
    )

    expect(decision.allowed).toBe(false)
    expect(decision.planId).toBeNull()
  })
})
