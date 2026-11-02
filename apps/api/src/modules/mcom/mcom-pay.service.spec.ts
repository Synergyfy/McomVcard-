import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { createHmac } from 'crypto'
import { McomPayError, McomPayService } from './mcom-pay.service'

function makeConfigMock(payEnabled = true): { get: jest.Mock } {
  return {
    get: jest.fn((key: string) => {
      if (key === 'mcom.payEnabled') return payEnabled
      const values: Record<string, string> = {
        MCOM_SOLUTIONS_URL: 'http://localhost:3010',
        MCOM_CLIENT_ID: 'mcom-vcard',
        MCOM_HMAC_SECRET: 'hm_testsecret',
      }
      return values[key] ?? ''
    }),
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

describe('McomPayService', () => {
  let service: McomPayService
  let configMock: { get: jest.Mock }

  beforeEach(async () => {
    configMock = makeConfigMock()
    const module: TestingModule = await Test.createTestingModule({
      providers: [McomPayService, { provide: ConfigService, useValue: configMock }],
    }).compile()

    service = module.get(McomPayService)
    jest.spyOn(global, 'fetch').mockReset()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  describe('enabled', () => {
    it('is true when the feature flag is on and credentials are set', () => {
      expect(service.enabled).toBe(true)
    })

    it('is false when the feature flag is off', () => {
      configMock.get.mockImplementation((key: string) => (key === 'mcom.payEnabled' ? false : 'hm_testsecret'))
      expect(service.enabled).toBe(false)
    })
  })

  describe('createCharge', () => {
    it('signs the exact JSON body and sends the idempotency key', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(fakeResponse(201, { charge: { id: 'ch_1', status: 'paid' } }))
      const body = {
        amountMinor: '4900',
        currency: 'GBP',
        method: 'wallet' as const,
        reference: 'vcards:plan:abc:standard',
        mcomUserId: 'mcom-1',
      }

      await service.createCharge(body, 'key-1')

      const [url, init] = (global.fetch as jest.Mock).mock.calls[0]
      expect(url).toBe('http://localhost:3010/api/v1/app-payments/charges')
      const expectedSig =
        'sha256=' + createHmac('sha256', 'hm_testsecret').update(JSON.stringify(body)).digest('hex')
      expect(init.headers['X-Mcom-Signature']).toBe(expectedSig)
      expect(init.headers['X-Mcom-Client-ID']).toBe('mcom-vcard')
      expect(init.headers['X-Idempotency-Key']).toBe('key-1')
      expect(JSON.parse(init.body)).toEqual(body)
    })

    it('GET requests sign the empty string', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(fakeResponse(200, { id: 'ch_1', status: 'paid' }))

      await service.getCharge('ch_1')

      const [url, init] = (global.fetch as jest.Mock).mock.calls[0]
      expect(url).toBe('http://localhost:3010/api/v1/app-payments/charges/ch_1')
      const expectedSig = 'sha256=' + createHmac('sha256', 'hm_testsecret').update('').digest('hex')
      expect(init.headers['X-Mcom-Signature']).toBe(expectedSig)
    })
  })

  describe('idempotencyKey', () => {
    it('prefixes the client id and sanitizes the parts', () => {
      expect(service.idempotencyKey('plan', 'attempt 123/4')).toBe('mcom-vcard-plan-attempt_123_4')
    })
  })

  describe('error handling', () => {
    it('maps a permanent partner error to McomPayError', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(
        fakeResponse(422, { statusCode: 422, error: 'INSUFFICIENT_BALANCE', message: 'Not enough funds' }),
      )

      const err = await service.createCharge(
        { amountMinor: '999', method: 'wallet', reference: 'r' },
        'k',
      ).catch((e) => e)

      expect(err).toBeInstanceOf(McomPayError)
      expect(err.code).toBe('INSUFFICIENT_BALANCE')
      expect(err.httpStatus).toBe(422)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('retries transient failures with the same idempotency key', async () => {
      jest.useFakeTimers()
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(fakeResponse(503, { error: 'SERVICE_UNAVAILABLE', message: 'db down' }))
        .mockResolvedValueOnce(fakeResponse(201, { charge: { id: 'ch_1', status: 'paid' } }))

      const promise = service.createCharge({ amountMinor: '1', method: 'wallet', reference: 'r' }, 'same-key')
      await jest.advanceTimersByTimeAsync(2000)
      await promise

      expect(global.fetch).toHaveBeenCalledTimes(2)
      const keys = (global.fetch as jest.Mock).mock.calls.map((c) => c[1].headers['X-Idempotency-Key'])
      expect(keys).toEqual(['same-key', 'same-key'])
    })
  })
})
