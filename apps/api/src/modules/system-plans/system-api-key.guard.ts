import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

/**
 * Machine-to-machine guard for the Central Hub Solution-facing plan API.
 *
 * Central's Generic HTTP Connector calls every registered app with an
 * `x-mcom-solution-api-key` header (some integrations use `x-api-key`) set to
 * the per-app API key issued by the MCOM Console. The app validates it against
 * `MCOM_API_KEY` (legacy alias: MCOM_SOLUTION_API_KEY).
 */
@Injectable()
export class SystemApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const apiKey = (request.headers['x-mcom-solution-api-key'] || request.headers['x-api-key']) as
      | string
      | undefined
    const validKey =
      this.config.get<string>('MCOM_API_KEY') || this.config.get<string>('MCOM_SOLUTION_API_KEY') || ''

    if (!validKey) {
      throw new UnauthorizedException('MCOM_API_KEY not configured on server')
    }
    if (!apiKey || apiKey !== validKey) {
      throw new UnauthorizedException('Invalid or missing MCOM API key')
    }
    return true
  }
}