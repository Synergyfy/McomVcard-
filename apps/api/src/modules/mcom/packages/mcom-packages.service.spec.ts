import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { McomPackagesService } from './mcom-packages.service'
import { McomService } from '../mcom.service'
import { PlansService } from '../../plans/plans.service'
import { UsersService } from '../../users/users.service'
import { encryptMcomToken } from '../../../lib/utils/mcom-crypto.util'

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

function makeMcomMock() {
  return {
    platformPermissionKey: 'can_access_vcard',
    getUserInfo: jest.fn(),
    refreshTokens: jest.fn(),
    fetchPermissions: jest.fn(),
  }
}

function linkedUser() {
  return {
    id: 'user-1',
    mcomUserId: 'mcom-1',
    mcomAccessToken: encryptMcomToken('test-access-token'),
    mcomRefreshToken: encryptMcomToken('test-refresh-token'),
  }
}

function fakeResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  } as unknown as Response
}

describe('McomPackagesService', () => {
  let service: McomPackagesService
  let configMock: { get: jest.Mock }
  let mcomMock: { platformPermissionKey: string; getUserInfo: jest.Mock; refreshTokens: jest.Mock; fetchPermissions: jest.Mock }
  let plansMock: { findAll: jest.Mock }
  let usersMock: { findById: jest.Mock }

  beforeEach(async () => {
    configMock = makeConfigMock()
    mcomMock = makeMcomMock()
    plansMock = { findAll: jest.fn() }
    usersMock = { findById: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McomPackagesService,
        { provide: ConfigService, useValue: configMock },
        { provide: McomService, useValue: mcomMock as unknown as McomService },
        { provide: PlansService, useValue: plansMock },
        { provide: UsersService, useValue: usersMock },
      ],
    }).compile()

    service = module.get(McomPackagesService)
    jest.spyOn(global, 'fetch').mockReset()
    usersMock.findById.mockResolvedValue(linkedUser())
    mcomMock.getUserInfo.mockResolvedValue({ sub: 'mcom-1', email: 'x@y.com' })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('listPlans', () => {
    it('maps active business plans to purchasable plans (Pro tier prices)', async () => {
      plansMock.findAll.mockResolvedValue([
        {
          id: 'p-1',
          name: 'Gold',
          level: 'Gold',
          audience: 'business',
          status: 'active',
          features: [{ text: 'NFC cards' }],
          tiers: { Pro: { monthly: 449, quarterly: 1212.3, annual: 4490, trialDays: 14 } },
          configuration: { quotas: { maxVCards: 100 } },
        },
        { id: 'p-2', name: 'Legacy', level: 'Bronze', audience: 'business', status: 'inactive', features: [], tiers: { Pro: { monthly: 1, quarterly: 1, annual: 1 } } },
      ])

      const plans = await service.listPlans()

      expect(plans).toHaveLength(1)
      expect(plans[0]).toMatchObject({
        id: 'p-1',
        name: 'Gold',
        level: 'Gold',
        monthlyPrice: 449,
        quarterlyPrice: 1212.3,
        annualPrice: 4490,
        features: ['NFC cards'],
      })
    })
  })

  describe('initiate', () => {
    it('calls the central initiate endpoint with the user token and vcard platform slug', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(
        fakeResponse(200, { clientSecret: 'pi_xxx_secret_yyy', type: 'payment' }),
      )

      const result = await service.initiate('user-1', {
        externalPlanId: 'p-1',
        billingCycle: 'monthly',
        provider: 'stripe',
      })

      const [url, init] = (global.fetch as jest.Mock).mock.calls[0]
      expect(url).toBe('http://localhost:3010/api/v1/payment/platform/stripe/initiate')
      expect(init.headers['Authorization']).toBe('Bearer test-access-token')
      const body = JSON.parse(init.body)
      expect(body).toMatchObject({
        platform: 'vcard',
        externalPlanId: 'p-1',
        billingCycle: 'monthly',
        returnUrl: 'http://localhost:3000/b/payment/success',
      })
      expect(result).toMatchObject({ clientSecret: 'pi_xxx_secret_yyy' })
    })

    it('refreshes the central token when the stored one is invalid', async () => {
      mcomMock.getUserInfo.mockRejectedValueOnce(new Error('expired'))
      mcomMock.refreshTokens.mockResolvedValue({ accessToken: 'refreshed-token', expiresIn: 3600 })
      ;(global.fetch as jest.Mock).mockResolvedValue(fakeResponse(200, { approvalUrl: 'https://paypal/approve' }))

      await service.initiate('user-1', { externalPlanId: 'p-1', billingCycle: 'annual', provider: 'paypal' })

      const [, init] = (global.fetch as jest.Mock).mock.calls[0]
      expect(init.headers['Authorization']).toBe('Bearer refreshed-token')
    })

    it('rejects a user that is not linked to MCOM Solutions', async () => {
      usersMock.findById.mockResolvedValue({ id: 'user-2', mcomUserId: null, mcomAccessToken: null })

      await expect(
        service.initiate('user-2', { externalPlanId: 'p-1', billingCycle: 'monthly', provider: 'stripe' }),
      ).rejects.toBeInstanceOf(BadRequestException)
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('surfaces a friendly error when the Central refresh token is also dead', async () => {
      mcomMock.getUserInfo.mockRejectedValueOnce(new Error('expired'))
      mcomMock.refreshTokens.mockRejectedValueOnce(new Error('Invalid or expired refresh token'))

      await expect(
        service.initiate('user-1', { externalPlanId: 'p-1', billingCycle: 'monthly', provider: 'stripe' }),
      ).rejects.toMatchObject({
        name: 'UnauthorizedException',
        message: 'Your MCOM session has expired — sign in with MCOM again to continue',
      })
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('confirmStripe', () => {
    it('confirms with the user token and reports canAccessVcard', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(
        fakeResponse(201, { id: 'pkg-1', platform: 'vcard', status: 'active' }),
      )
      mcomMock.fetchPermissions.mockResolvedValue({ can_access_vcard: true })

      const result = await service.confirmStripe('user-1', {
        externalPlanId: 'p-1',
        billingCycle: 'monthly',
        paymentIntentId: 'pi_123',
      })

      const [url, init] = (global.fetch as jest.Mock).mock.calls[0]
      expect(url).toBe('http://localhost:3010/api/v1/payment/platform/stripe/confirm')
      expect(JSON.parse(init.body)).toMatchObject({ platform: 'vcard', paymentIntentId: 'pi_123' })
      expect(result.canAccessVcard).toBe(true)
    })
  })

  describe('capturePaypal', () => {
    it('calls the public capture endpoint without auth and verifies access', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(
        fakeResponse(200, { id: 'pkg-1', platform: 'vcard', status: 'active' }),
      )
      mcomMock.fetchPermissions.mockResolvedValue({ can_access_vcard: false, can_access_mall: true })

      const result = await service.capturePaypal('user-1', { orderId: 'order-9' })

      const [url, init] = (global.fetch as jest.Mock).mock.calls[0]
      expect(url).toBe('http://localhost:3010/api/v1/payment/platform/paypal/capture')
      expect(init.headers['Authorization']).toBeUndefined()
      expect(JSON.parse(init.body)).toEqual({ orderId: 'order-9' })
      expect(result.canAccessVcard).toBe(false)
    })
  })

  describe('error mapping', () => {
    it('maps a 401 to UnauthorizedException', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(fakeResponse(401, { message: 'Invalid token' }))

      await expect(
        service.initiate('user-1', { externalPlanId: 'p-1', billingCycle: 'monthly', provider: 'stripe' }),
      ).rejects.toBeInstanceOf(UnauthorizedException)
    })
  })
})