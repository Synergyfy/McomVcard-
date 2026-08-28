import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { createHmac } from 'crypto'
import { McomWalletError, McomWalletService } from './mcom-wallet.service'

function makeConfigMock(walletEnabled = true): { get: jest.Mock } {
  return {
    get: jest.fn((key: string) => {
      if (key === 'mcom.walletEnabled') return walletEnabled
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

describe('McomWalletService', () => {
  let service: McomWalletService
  let configMock: { get: jest.Mock }

  beforeEach(async () => {
    configMock = makeConfigMock()
    const module: TestingModule = await Test.createTestingModule({
      providers: [McomWalletService, { provide: ConfigService, useValue: configMock }],
    }).compile()

    service = module.get(McomWalletService)
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

    it('is false when the feature flag is off', async () => {
      configMock.get.mockImplementation((key: string) => {
        if (key === 'mcom.walletEnabled') return false
        return ''
      })
      const module = await Test.createTestingModule({
        providers: [McomWalletService, { provide: ConfigService, useValue: configMock }],
      }).compile()
      const svc = module.get(McomWalletService)
      expect(svc.enabled).toBe(false)
    })

    it('is false when the HMAC secret is missing', async () => {
      configMock.get.mockImplementation((key: string) => (key === 'mcom.walletEnabled' ? true : ''))
      const module = await Test.createTestingModule({
        providers: [McomWalletService, { provide: ConfigService, useValue: configMock }],
      }).compile()
      const svc = module.get(McomWalletService)
      expect(svc.enabled).toBe(false)
    })
  })

  describe('signing', () => {
    it('HMAC-SHA256 signs the exact JSON body for writes', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(fakeResponse(201, { success: true }))
      const body = { userId: 'u1', amount: 10, category: 'REWARD' }

      await service.credit('u1', 10, { category: 'REWARD' }, 'key-1')

      const [url, init] = (global.fetch as jest.Mock).mock.calls[0]
      expect(url).toBe('http://localhost:3010/api/v1/wallet/partner/credit')
      const expectedSig = 'sha256=' + createHmac('sha256', 'hm_testsecret').update(JSON.stringify(body)).digest('hex')
      expect(init.headers['X-Mcom-Signature']).toBe(expectedSig)
      expect(init.headers['X-Mcom-Client-ID']).toBe('mcom-vcard')
    })

    it('GET requests sign the empty string', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(fakeResponse(200, { success: true, balance: 0 }))

      await service.getBalance('u1')

      const [, init] = (global.fetch as jest.Mock).mock.calls[0]
      const expectedSig = 'sha256=' + createHmac('sha256', 'hm_testsecret').update('').digest('hex')
      expect(init.headers['X-Mcom-Signature']).toBe(expectedSig)
      expect(init.headers['X-Idempotency-Key']).toBeUndefined()
    })

    it('sends the idempotency key header on writes', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(fakeResponse(201, { success: true }))

      await service.debit('u1', 5, { category: 'PURCHASE' }, 'mcom-vcard-purchase-ORDER_1')

      const [, init] = (global.fetch as jest.Mock).mock.calls[0]
      expect(init.headers['X-Idempotency-Key']).toBe('mcom-vcard-purchase-ORDER_1')
    })
  })

  describe('idempotencyKey', () => {
    it('prefixes the client id and sanitizes the parts', () => {
      expect(service.idempotencyKey('purchase', 'order 123/4')).toBe('mcom-vcard-purchase-order_123_4')
    })
  })

  describe('category validation', () => {
    it('rejects an invalid debit category without calling the API', async () => {
      await expect(service.debit('u1', 5, { category: 'REWARD' as never }, 'k')).rejects.toMatchObject({
        name: 'McomWalletError',
        code: 'INVALID_CATEGORY',
        httpStatus: 400,
      })
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('rejects an invalid credit category', async () => {
      await expect(service.credit('u1', 5, { category: 'SUBSCRIPTION' as never }, 'k')).rejects.toMatchObject({
        code: 'INVALID_CATEGORY',
      })
    })
  })

  describe('error handling', () => {
    it('maps a permanent partner error to McomWalletError with its code', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue(
        fakeResponse(422, { statusCode: 422, error: 'INSUFFICIENT_BALANCE', message: 'Not enough funds' }),
      )

      const err = await service.debit('u1', 999, { category: 'PURCHASE' }, 'k').catch((e) => e)

      expect(err).toBeInstanceOf(McomWalletError)
      expect(err.code).toBe('INSUFFICIENT_BALANCE')
      expect(err.httpStatus).toBe(422)
      expect(err.retryable).toBe(false)
      // Permanent errors are NOT retried.
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('retries transient failures (500) with the same idempotency key then succeeds', async () => {
      jest.useFakeTimers()
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(fakeResponse(500, { error: 'INTERNAL_ERROR', message: 'boom' }))
        .mockResolvedValueOnce(fakeResponse(201, { success: true, transactionId: 'txn-1' }))

      const promise = service.debit('u1', 5, { category: 'PURCHASE' }, 'same-key')
      await jest.advanceTimersByTimeAsync(2000)
      const receipt = await promise

      expect(receipt.transactionId).toBe('txn-1')
      expect(global.fetch).toHaveBeenCalledTimes(2)
      const keys = (global.fetch as jest.Mock).mock.calls.map((c) => c[1].headers['X-Idempotency-Key'])
      expect(keys).toEqual(['same-key', 'same-key'])
    })

    it('gives up after the max retries on a persistent transient error', async () => {
      jest.useFakeTimers()
      ;(global.fetch as jest.Mock).mockResolvedValue(fakeResponse(503, { error: 'SERVICE_UNAVAILABLE', message: 'db down' }))

      const promise = service.credit('u1', 5, { category: 'REWARD' }, 'k').catch((e) => e)
      await jest.advanceTimersByTimeAsync(2000)
      await jest.advanceTimersByTimeAsync(4000)
      await jest.advanceTimersByTimeAsync(8000)
      const err = await promise

      expect(err).toBeInstanceOf(McomWalletError)
      expect(err.httpStatus).toBe(503)
      expect(global.fetch).toHaveBeenCalledTimes(3)
    })
  })

  describe('reads', () => {
    it('returns the balance response from Central', async () => {
      const balance = { success: true, balance: 100, availableBalance: 50, status: 'ACTIVE', currency: 'MCOM' }
      ;(global.fetch as jest.Mock).mockResolvedValue(fakeResponse(200, balance))

      await expect(service.getBalance('u1')).resolves.toEqual(balance)
      expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('/api/v1/wallet/partner/balance/u1')
    })

    it('returns the paginated transaction list', async () => {
      const list = { success: true, data: [], total: 0, page: 1, limit: 20, totalPages: 0 }
      ;(global.fetch as jest.Mock).mockResolvedValue(fakeResponse(200, list))

      await expect(service.getTransactions('u1')).resolves.toEqual(list)
    })
  })
})