import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

/**
 * Strict business-dashboard role guard.
 *
 * The business dashboard is isolated from the consumer and admin portals.
 * A caller must hold the canonical Central Hub Solution `BUSINESS` role, a
 * local business role (`BUSINESS_OWNER`, `STAFF`), or be an admin supporting
 * the account. Every other authenticated role is rejected with 403.
 */
export const BUSINESS_ROLES = ['BUSINESS', 'BUSINESS_OWNER', 'STAFF', 'ADMIN'] as const

@Injectable()
export class BusinessAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user) throw new UnauthorizedException('Authentication required')

    const centralRole = String(user.role ?? user.mcom_role ?? '').toUpperCase()
    const localRoles: string[] = Array.isArray(user.roles)
      ? user.roles.map((role: unknown) => String(role).toUpperCase())
      : []

    const allowed =
      BUSINESS_ROLES.includes(centralRole as (typeof BUSINESS_ROLES)[number]) ||
      localRoles.some((role) =>
        BUSINESS_ROLES.includes(role as (typeof BUSINESS_ROLES)[number]),
      )

    if (!allowed) {
      throw new ForbiddenException(
        'Business account required. Sign in with a business account to access this dashboard.',
      )
    }

    return true
  }
}
