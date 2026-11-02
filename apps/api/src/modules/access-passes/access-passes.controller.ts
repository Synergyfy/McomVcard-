import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ApiResponse } from '../../lib/utils/api-response'
import { AccessPassesService } from './access-passes.service'
import { AccessPassResponseDto } from './dto/access-pass-response.dto'

@ApiTags('access-passes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('access-passes')
export class AccessPassesController {
  constructor(private readonly accessPassesService: AccessPassesService) {}

  @Get()
  @ApiOperation({ summary: 'List access passes available for purchase' })
  @ApiOkResponse({ description: 'Active access passes', type: [AccessPassResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async findPurchasable() {
    const passes = await this.accessPassesService.findPurchasable()
    return ApiResponse.success(passes, 'Access passes retrieved', 200)
  }
}
