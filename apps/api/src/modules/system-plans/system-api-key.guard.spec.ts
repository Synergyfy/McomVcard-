import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SystemApiKeyGuard } from './system-api-key.guard'

function makeContext(headerValue?: string): any {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: headerValue === undefined ? {} : { 'x-mcom-solution-api-key': headerValue },
      }),
    }),
  }
}

function makeConfigMock(key: string): { get: jest.Mock } {
  return { get: jest.fn().mockReturnValue(key) }
}

describe('SystemApiKeyGuard', () => {
  it('allows a request whose header matches MCOM_API_KEY', () => {
    const guard = new SystemApiKeyGuard(makeConfigMock('secret-key') as unknown as ConfigService)

    expect(guard.canActivate(makeContext('secret-key'))).toBe(true)
  })

  it('rejects a request with a missing header', () => {
    const guard = new SystemApiKeyGuard(makeConfigMock('secret-key') as unknown as ConfigService)

    expect(() => guard.canActivate(makeContext())).toThrow(UnauthorizedException)
  })

  it('rejects a request with a wrong API key', () => {
    const guard = new SystemApiKeyGuard(makeConfigMock('secret-key') as unknown as ConfigService)

    expect(() => guard.canActivate(makeContext('wrong-key'))).toThrow(UnauthorizedException)
  })

  it('rejects when MCOM_API_KEY is not configured on the server', () => {
    const guard = new SystemApiKeyGuard(makeConfigMock('') as unknown as ConfigService)

    expect(() => guard.canActivate(makeContext('secret-key'))).toThrow(
      'MCOM_API_KEY not configured on server',
    )
  })
})