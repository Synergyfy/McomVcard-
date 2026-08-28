import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

/**
 * Machine-to-machine guard for the MCOM Solutions-facing plan API.
 *
 * MCOM Solutions' Generic HTTP Connector calls every registered app with an
 * `x-mcom-solution-api-key` header set to the per-app API key issued by the
 * MCOM Console. Vcard validates that header against its own `MCOM_API_KEY`
 * env var (the apiKey assigned to the `mcom-vcard` client in the Console).
 */
@Injectable()
export class SystemApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const apiKey = request.headers['x-mcom-solution-api-key'] as string | undefined
    const validKey = this.config.get<string>('MCOM_API_KEY') || ''

    if (!validKey) {
      throw new UnauthorizedException('MCOM_API_KEY not configured on server')
    }
    if (!apiKey || apiKey !== validKey) {
      throw new UnauthorizedException('Invalid or missing MCOM Solution API key')
    }
    return true
  }
}