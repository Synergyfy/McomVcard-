import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { CapabilitiesService } from './capabilities.service'
import { CAPABILITY_KEY } from './require-capability.decorator'

/**
 * Enforces `@RequireCapability('featureKey')` against the caller's active plan
 * variant. Usage can be supplied via `?used=` (or `used` in the body) so a
 * finite quota can be checked without the guard needing to know the resource.
 */
@Injectable()
export class CapabilityGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly capabilities: CapabilitiesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const key = this.reflector.getAllAndOverride<string>(CAPABILITY_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!key) return true

    const request = context.switchToHttp().getRequest()
    const userId: string | undefined = request.user?.id
    if (!userId) throw new UnauthorizedException('Authentication required')

    // Feature flags are enforced here. Numeric quotas are enforced by the
    // service that creates the resource, because only that service can count
    // the caller's current usage reliably (never trust `?used=` from a client).
    await this.capabilities.assertFeature(userId, key)

    return true
  }
}
