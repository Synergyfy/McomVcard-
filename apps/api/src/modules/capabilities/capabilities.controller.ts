import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { CapabilitiesService } from './capabilities.service'

@ApiTags('capabilities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('capabilities')
export class CapabilitiesController {
  constructor(private readonly capabilities: CapabilitiesService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get the current plan, variant and resolved capabilities',
    description:
      'Resolves the active plan variant and merges the plan-level configuration with the variant overrides. ' +
      'Quotas can be a finite number, -1 for unlimited, or a boolean feature flag.',
  })
  @ApiOkResponse({ description: 'Resolved capabilities' })
  async me(@CurrentUser() user: UserResponseDto) {
    const resolved = await this.capabilities.resolveForUser(user.id)
    return ApiResponse.success(resolved, 'Capabilities retrieved', 200)
  }

  @Get('check/:key')
  @ApiOperation({
    summary: 'Check a single capability, optionally with current usage',
    description: 'Pass ?used=N to check a finite quota. Unconfigured capabilities are allowed.',
  })
  @ApiOkResponse({ description: 'Capability check result' })
  async check(
    @CurrentUser() user: UserResponseDto,
    @Param('key') key: string,
    @Query('used') used?: string,
  ) {
    const usedCount = Number(used)
    const resolved = await this.capabilities.assert(
      user.id,
      key,
      Number.isFinite(usedCount) && usedCount > 0 ? usedCount : 0,
    )
    const capability = resolved.capabilities[key]
    return ApiResponse.success(
      {
        key,
        allowed: capability ? capability.enabled : true,
        mode: capability?.mode ?? 'unlimited',
        limit: capability?.limit ?? null,
        used: Number.isFinite(usedCount) && usedCount > 0 ? usedCount : 0,
        planId: resolved.planId,
        planName: resolved.planName,
        variant: resolved.variant,
      },
      'Capability checked',
      200,
    )
  }
}
