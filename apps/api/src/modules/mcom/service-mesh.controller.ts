import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiResponse } from '../../lib/utils/api-response'
import { AuthenticatedServiceRequest, ServiceAuthGuard } from './service-auth'

/**
 * Inbound Service Mesh endpoints.
 *
 * Peer apps call these directly (never through Central) with a Bearer service
 * token. `ServiceAuthGuard` verifies the RS256 signature offline via Central's
 * JWKS and enforces the deny-by-default ingress allowlist.
 */
@ApiTags('service-mesh')
@ApiBearerAuth()
@UseGuards(ServiceAuthGuard)
@Controller('v1/service')
export class ServiceMeshController {
  /** Echo the verified caller identity — useful for peer connectivity checks. */
  @Get('whoami')
  @ApiOperation({
    summary: 'Return the verified service caller',
    description: 'Verifies an inbound RS256 service token offline and returns the caller identity/actor context.',
  })
  whoami(@Req() req: AuthenticatedServiceRequest) {
    const caller = req.serviceCaller!

    return ApiResponse.success(
      {
        client_id: process.env.MCOM_CLIENT_ID ?? null,
        caller_app_id: caller.callerAppId,
        is_delegated: caller.isDelegated,
        user_id: caller.userId ?? null,
        scopes: caller.scopes,
      },
      'Service token verified',
      200,
    )
  }

  /** Lightweight authenticated readiness probe for mesh policy tests. */
  @Get('health')
  @ApiOperation({ summary: 'Authenticated service health probe' })
  health(@Req() req: AuthenticatedServiceRequest) {
    return ApiResponse.success(
      {
        status: 'ok',
        service: process.env.MCOM_CLIENT_ID ?? null,
        caller_app_id: req.serviceCaller?.callerAppId ?? null,
      },
      'Service healthy',
      200,
    )
  }
}
