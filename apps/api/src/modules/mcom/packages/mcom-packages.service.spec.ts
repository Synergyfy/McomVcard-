import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { McomPackagesService } from './mcom-packages.service'
import { PlansService } from '../../plans/plans.service'
import { UsersService } from '../../users/users.service'
import { SubscriptionsService } from '../../subscriptions/subscriptions.service'
import { McomPayError, McomPayService } from '../mcom-pay.service'

function makeConfigMock() {
  return {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        MCOM_SOLUTIONS_URL: 'http://localhost:3010',
        WEB_PUBLIC_URL: 'http://localhost:3000',
        MCOM_PLATFORM_SLUG: 'vcard',
      }
      return values[key] ?? ''
    }),
  }
}

function linkedUser() {
  return {
    id: 'user-1',
    mcomUserId: 'mcom-1',
  }
}

function mockPlan() {
  return {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Business Growth',
    description: 'Grow your business.',
    audience: 'business',
    currency: 'GBP',
    status: 'active',
    level: 'Gold',
    features: [{ text: 'NFC cards', description: '', scope: 'All' }],
    rules: [],
    configuration: { quotas: { maxVCards: 100 } },
    variants: [
      { key: 'standard', name: 'Standard', durationDays: 90, price: 49, setupFee: 0, trialDays: 14, description: '90 days', features: null, rules: null, configuration: { quotas: { maxVCards: 50 } }, stripePriceId: null, paypalPlanId: null, isActive: true },
      { key: 'pro', name: 'Pro', durationDays: 180, price: 89, setupFee: 0, trialDays: 14, description: '180 days', features: null, rules: null, configuration: null, stripePriceId: null, paypalPlanId: null, isActive: true },
      { key: 'pro_plus', name: 'Pro+', durationDays: 365, price: 149, setupFee: 0, trialDays: 7, description: '1 year', features: null, rules: null, configuration: null, stripePriceId: null, paypalPlanId: null, isActive: true },
    ],
  }
}

function paidCharge(overrides: Record<string, unknown> = {}) {
  return {
    id: 'charge-1',
    appClientId: 'mcom-vcard',
    amountMinor: '4900',
    currency: 'GBP',
    feeMinor: '162',
    netMinor: '4738',
    method: 'wallet',
    status: 'paid',
    reference: 'vcards:plan:a1b2c3d4-e5f6-7890-abcd-ef1234567890:standard',
    externalCustomerId: 'user-1',
    mcomUserId: 'mcom-1',
    createdAt: '2026-11-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('McomPackagesService', () => {
  let service: McomPackagesService
  let plansMock: { findAll: jest.Mock; findOne: jest.Mock }
  let usersMock: { findById: jest.Mock }
  let payMock: {
    enabled: boolean
    idempotencyKey: jest.Mock
    createCharge: jest.Mock
    getCharge: jest.Mock
    confirmCharge: jest.Mock
  }
  let subscriptionsMock: {
    activatePlan: jest.Mock
    cancelPaidPlan: jest.Mock
    findActiveForUser: jest.Mock
  }

  beforeEach(async () => {
    plansMock = { findAll: jest.fn(), findOne: jest.fn() }
    usersMock = { findById: jest.fn() }
    payMock = {
      enabled: true,
      idempotencyKey: jest.fn((op: string, ...parts: string[]) =>
        `mcom-vcard-${op}-${parts.join('-')}`,
      ),
      createCharge: jest.fn(),
      getCharge: jest.fn(),
      confirmCharge: jest.fn(),
    }
    subscriptionsMock = {
      activatePlan: jest.fn().mockResolvedValue({ id: 'sub-1' }),
      cancelPaidPlan: jest.fn().mockResolvedValue(undefined),
      findActiveForUser: jest.fn().mockResolvedValue(null),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McomPackagesService,
        { provide: ConfigService, useValue: makeConfigMock() },
        { provide: PlansService, useValue: plansMock },
        { provide: UsersService, useValue: usersMock },
        { provide: McomPayService, useValue: payMock },
        { provide: SubscriptionsService, useValue: subscriptionsMock },
      ],
    }).compile()

    service = module.get(McomPackagesService)
    usersMock.findById.mockResolvedValue(linkedUser())
    plansMock.findOne.mockResolvedValue(mockPlan())
  })

  afterEach(() => jest.clearAllMocks())

  describe('listPlans', () => {
    it('maps active business plans and their three variants', async () => {
      plansMock.findAll.mockResolvedValue([mockPlan(), { ...mockPlan(), id: 'p-2', status: 'inactive' }])

      const plans = await service.listPlans()

      expect(plans).toHaveLength(1)
      expect(plans[0].variants.map((variant) => variant.key)).toEqual(['standard', 'pro', 'pro_plus'])
      expect(plans[0].variants[0]).toMatchObject({ name: 'Standard', durationDays: 90, price: 49, features: ['NFC cards'] })
      expect(plans[0].variants[0].configuration).toEqual({ quotas: { maxVCards: 50 } })
      expect(plans[0].variants[2].configuration).toEqual({ quotas: { maxVCards: 100 } })
    })
  })

  describe('initiate', () => {
    it('creates a server-priced wallet charge and activates the plan', async () => {
      payMock.createCharge.mockResolvedValue({ charge: paidCharge() })

      const result = await service.initiate('user-1', {
        externalPlanId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        variant: 'standard',
        provider: 'wallet',
        idempotencyKey: 'attempt-1234',
      })

      const [body, key] = payMock.createCharge.mock.calls[0]
      expect(key).toBe('mcom-vcard-plan-user-1-attempt-1234')
      expect(body).toMatchObject({
        amountMinor: '4900',
        currency: 'GBP',
        method: 'wallet',
        reference: 'vcards:plan:a1b2c3d4-e5f6-7890-abcd-ef1234567890:standard',
        mcomUserId: 'mcom-1',
        externalCustomerId: 'user-1',
      })
      expect(body.metadata).toMatchObject({ purpose: 'vcard-plan', variant: 'standard', durationDays: 90 })
      expect(subscriptionsMock.activatePlan).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          planId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          durationDays: 90,
          paymentReference: 'charge-1',
        }),
      )
      expect(result.canAccessVcard).toBe(true)
    })

    it('does not activate when the charge is still pending', async () => {
      payMock.createCharge.mockResolvedValue({ charge: paidCharge({ status: 'pending' }) })

      const result = await service.initiate('user-1', {
        externalPlanId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        variant: 'standard',
        provider: 'wallet',
        idempotencyKey: 'attempt-1234',
      })

      expect(subscriptionsMock.activatePlan).not.toHaveBeenCalled()
      expect(result.canAccessVcard).toBe(false)
    })

    it('returns a Stripe clientSecret for a pending card charge', async () => {
      payMock.createCharge.mockResolvedValue({
        charge: paidCharge({ status: 'pending', method: 'stripe' }),
        clientSecret: 'pi_secret_123',
      })

      const result = await service.initiate('user-1', {
        externalPlanId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        variant: 'standard',
        provider: 'stripe',
        idempotencyKey: 'attempt-stripe-1234',
      })

      expect(payMock.createCharge.mock.calls[0][0].method).toBe('stripe')
      expect(result.clientSecret).toBe('pi_secret_123')
      expect(result.canAccessVcard).toBe(false)
      expect(subscriptionsMock.activatePlan).not.toHaveBeenCalled()
    })

    it('returns a PayPal approvalUrl for a pending PayPal charge', async () => {
      payMock.createCharge.mockResolvedValue({
        charge: paidCharge({ status: 'pending', method: 'paypal' }),
        approvalUrl: 'https://www.sandbox.paypal.com/checkoutnow?token=5O1',
      })

      const result = await service.initiate('user-1', {
        externalPlanId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        variant: 'standard',
        provider: 'paypal',
        idempotencyKey: 'attempt-paypal-1234',
      })

      expect(payMock.createCharge.mock.calls[0][0].method).toBe('paypal')
      expect(result.approvalUrl).toContain('sandbox.paypal.com')
      expect(result.canAccessVcard).toBe(false)
    })

    it('activates a free variant without creating a wallet charge', async () => {
      plansMock.findOne.mockResolvedValue({
        ...mockPlan(),
        variants: mockPlan().variants.map((variant) =>
          variant.key === 'standard' ? { ...variant, price: 0 } : variant,
        ),
      })

      const result = await service.initiate('user-1', {
        externalPlanId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        variant: 'standard',
        provider: 'wallet',
        idempotencyKey: 'attempt-free-1234',
      })

      expect(payMock.createCharge).not.toHaveBeenCalled()
      expect(subscriptionsMock.activatePlan).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          planId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          durationDays: 90,
          paymentReference: 'mcom-vcard-free-plan-user-1-attempt-free-1234',
        }),
      )
      expect(result.canAccessVcard).toBe(true)
      expect(result.charge.amountMinor).toBe('0')
      expect(result.charge.status).toBe('paid')
    })

    it('maps INSUFFICIENT_BALANCE to a 402 with the Central top-up URL', async () => {
      payMock.createCharge.mockRejectedValue(new McomPayError('INSUFFICIENT_BALANCE', 'Not enough funds', 422))

      await expect(
        service.initiate('user-1', {
          externalPlanId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          variant: 'standard',
          provider: 'wallet',
          idempotencyKey: 'attempt-1234',
        }),
      ).rejects.toMatchObject({
        status: 402,
        response: {
          error: 'WALLET_INSUFFICIENT_FUNDS',
          topUpUrl: 'http://localhost:3010/dashboard/wallet',
        },
      })
    })

    it('rejects an unknown/inactive variant before charging', async () => {
      plansMock.findOne.mockResolvedValue({
        ...mockPlan(),
        variants: mockPlan().variants.map((variant) =>
          variant.key === 'pro' ? { ...variant, isActive: false } : variant,
        ),
      })

      await expect(
        service.initiate('user-1', {
          externalPlanId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          variant: 'pro',
          provider: 'wallet',
          idempotencyKey: 'attempt-1234',
        }),
      ).rejects.toBeInstanceOf(BadRequestException)
      expect(payMock.createCharge).not.toHaveBeenCalled()
    })

    it('rejects a user that is not linked to MCOM Solutions', async () => {
      usersMock.findById.mockResolvedValue({ id: 'user-2', mcomUserId: null })

      await expect(
        service.initiate('user-2', {
          externalPlanId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          variant: 'standard',
          provider: 'wallet',
          idempotencyKey: 'attempt-1234',
        }),
      ).rejects.toBeInstanceOf(BadRequestException)
      expect(payMock.createCharge).not.toHaveBeenCalled()
    })

    it('maps a 401 from MCOM to UnauthorizedException', async () => {
      payMock.createCharge.mockRejectedValue(new McomPayError('INVALID_SIGNATURE', 'bad signature', 401))

      await expect(
        service.initiate('user-1', {
          externalPlanId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          variant: 'standard',
          provider: 'wallet',
          idempotencyKey: 'attempt-1234',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException)
    })
  })

  describe('confirm', () => {
    it('fetches the charge and activates the plan', async () => {
      payMock.getCharge.mockResolvedValue(paidCharge())

      const result = await service.confirm('user-1', {
        externalPlanId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        variant: 'standard',
        chargeId: 'charge-1',
      })

      expect(payMock.getCharge).toHaveBeenCalledWith('charge-1')
      expect(subscriptionsMock.activatePlan).toHaveBeenCalledWith(
        expect.objectContaining({ paymentReference: 'charge-1' }),
      )
      expect(result.canAccessVcard).toBe(true)
    })

    it('confirms a pending Stripe charge with the PaymentIntent then activates', async () => {
      payMock.getCharge.mockResolvedValue(paidCharge({ status: 'pending', method: 'stripe' }))
      payMock.confirmCharge.mockResolvedValue(paidCharge({ method: 'stripe' }))

      const result = await service.confirm('user-1', {
        externalPlanId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        variant: 'standard',
        chargeId: 'charge-1',
        paymentIntentId: 'pi_123',
      })

      expect(payMock.confirmCharge).toHaveBeenCalledWith('charge-1', { paymentIntentId: 'pi_123' })
      expect(result.canAccessVcard).toBe(true)
    })

    it('confirms a pending PayPal charge with the order id then activates', async () => {
      payMock.getCharge.mockResolvedValue(paidCharge({ status: 'pending', method: 'paypal' }))
      payMock.confirmCharge.mockResolvedValue(paidCharge({ method: 'paypal' }))

      const result = await service.confirm('user-1', {
        externalPlanId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        variant: 'standard',
        chargeId: 'charge-1',
        orderId: '5O1',
      })

      expect(payMock.confirmCharge).toHaveBeenCalledWith('charge-1', { orderId: '5O1' })
      expect(result.canAccessVcard).toBe(true)
    })
  })

  describe('webhook activation', () => {
    it('activates from a plan reference', async () => {
      const activated = await service.activateFromCharge(paidCharge())
      expect(activated).toBe(true)
      expect(subscriptionsMock.activatePlan).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          planId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          durationDays: 90,
          paymentReference: 'charge-1',
        }),
      )
    })

    it('ignores non-plan charges', async () => {
      const activated = await service.activateFromCharge(paidCharge({ reference: 'other:thing' }))
      expect(activated).toBe(false)
      expect(subscriptionsMock.activatePlan).not.toHaveBeenCalled()
    })

    it('revokes the plan on a refund', async () => {
      const revoked = await service.revokeFromCharge(paidCharge())
      expect(revoked).toBe(true)
      expect(subscriptionsMock.cancelPaidPlan).toHaveBeenCalledWith(
        'user-1',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      )
    })
  })
})
