import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { McomService, McomUserPackage } from './mcom.service'

function makeConfigMock(): { get: jest.Mock } {
  return {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        MCOM_SOLUTIONS_URL: 'http://localhost:3010',
        MCOM_CLIENT_ID: 'mcom-vcard',
        MCOM_CLIENT_SECRET: 'secret',
        MCOM_HMAC_SECRET: 'hmac',
        MCOM_PLATFORM_SLUG: 'vcard',
        MCOM_REDIRECT_URI: 'http://localhost:8000/auth/callback',
        MCOM_SCOPES: 'profile email business membership packages',
      }
      return values[key] ?? ''
    }),
  }
}

describe('McomService entitlements', () => {
  let service: McomService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [McomService, { provide: ConfigService, useValue: makeConfigMock() }],
    }).compile()

    service = module.get(McomService)
  })

  afterEach(() => jest.clearAllMocks())

  describe('getUserPackages', () => {
    it('requests the central packages endpoint and returns the data array', async () => {
      const packages: McomUserPackage[] = [
        { packageId: 'p1', platformName: 'MCOM VCard', packageName: 'Gold', status: 'active', externalPlanId: 'plan-1' },
      ]
      jest.spyOn(service as any, 'request').mockResolvedValue({ data: packages })

      const result = await service.getUserPackages('user-1')

      expect((service as any).request).toHaveBeenCalledWith('/api/v1/data/user/user-1/packages', {
        method: 'GET',
      })
      expect(result).toEqual(packages)
    })

    it('returns an empty array when the response has no data', async () => {
      jest.spyOn(service as any, 'request').mockResolvedValue({ success: true })

      const result = await service.getUserPackages('user-1')

      expect(result).toEqual([])
    })
  })

  describe('getActiveVcardPackage', () => {
    it('returns the active Vcard package', async () => {
      jest.spyOn(service as any, 'request').mockResolvedValue({
        data: [
          { packageId: 'p1', platformName: 'MCOM Mall', packageName: 'Gold', status: 'active', externalPlanId: 'mall-1' },
          { packageId: 'p2', platformName: 'MCOM VCard', packageName: 'Gold', status: 'active', externalPlanId: 'plan-1' },
        ],
      })

      const result = await service.getActiveVcardPackage('user-1')

      expect(result).toEqual(
        expect.objectContaining({ platformName: 'MCOM VCard', externalPlanId: 'plan-1' }),
      )
    })

    it('matches the platform by slug too', async () => {
      jest.spyOn(service as any, 'request').mockResolvedValue({
        data: [{ packageId: 'p2', platformName: 'vcard', packageName: 'Gold', status: 'active', externalPlanId: 'plan-1' }],
      })

      const result = await service.getActiveVcardPackage('user-1')

      expect(result?.externalPlanId).toBe('plan-1')
    })

    it('returns null when the user has no active Vcard package', async () => {
      jest.spyOn(service as any, 'request').mockResolvedValue({
        data: [
          { packageId: 'p1', platformName: 'MCOM VCard', packageName: 'Gold', status: 'inactive', externalPlanId: 'plan-1' },
        ],
      })

      const result = await service.getActiveVcardPackage('user-1')

      expect(result).toBeNull()
    })

    it('returns null when there are no packages at all', async () => {
      jest.spyOn(service as any, 'request').mockResolvedValue({ data: [] })

      const result = await service.getActiveVcardPackage('user-1')

      expect(result).toBeNull()
    })
  })
})