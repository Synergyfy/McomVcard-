import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse as SwaggerApiResponse, ApiTags } from '@nestjs/swagger'
import { SystemApiKeyGuard } from './system-api-key.guard'
import { SeasonsService } from '../seasons/seasons.service'
import { SeasonResponseDto } from '../seasons/dto/season-response.dto'

/**
 * Season list exposed to MCOM Solutions (spec §4.2, optional): active seasons
 * the connector can reference when creating SEASONAL plans. Authenticated with
 * the same `x-mcom-solution-api-key` as the plan API.
 */
@ApiTags('MCOM Solution - Seasons')
@ApiBearerAuth()
@UseGuards(SystemApiKeyGuard)
@Controller('v1/system/seasons')
export class SystemSeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Get()
  @ApiOperation({ summary: 'List active seasons (MCOM Solutions admin)' })
  @SwaggerApiResponse({ status: 200, type: [SeasonResponseDto] })
  @SwaggerApiResponse({ status: 401, description: 'Invalid or missing API key' })
  listActive() {
    return this.seasonsService.listActive().then((seasons) => seasons.map(SeasonResponseDto.fromEntity))
  }
}