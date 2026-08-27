import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'
import { SeasonsService } from './seasons.service'
import { SeasonResponseDto } from './dto/season-response.dto'
import { CreateSeasonDto } from './dto/create-season.dto'
import { UpdateSeasonDto } from './dto/update-season.dto'

@ApiTags('seasons')
@ApiExtraModels(ApiResponse, SeasonResponseDto)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller()
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Post('seasons')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a season', description: 'Creates a platform-wide season. Any authenticated user can manage seasons.' })
  @ApiBody({ type: CreateSeasonDto, examples: { default: { summary: 'Autumn season', value: { name: 'Autumn 2026', starts_at: '2026-09-01T00:00:00.000Z', ends_at: '2026-11-30T23:59:59.000Z' } } } })
  @ApiCreatedResponse({
    description: 'Season created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(SeasonResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() body: CreateSeasonDto) {
    return this.seasonsService.create(body)
  }

  @Get('seasons')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List seasons', description: 'Returns all platform-wide seasons ordered by start date. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Seasons list',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(SeasonResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async list() {
    return this.seasonsService.list()
  }

  @Get('seasons/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a season', description: 'Returns a single season. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Season found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(SeasonResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Season not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return ApiResponse.success(SeasonResponseDto.fromEntity(await this.seasonsService.findOne(id)), 'Season retrieved', 200)
  }

  @Patch('seasons/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a season', description: 'Updates a platform-wide season. Any authenticated user can manage seasons.' })
  @ApiBody({ type: UpdateSeasonDto, examples: { default: { summary: 'Extend end date', value: { ends_at: '2026-12-15T23:59:59.000Z' } } } })
  @ApiOkResponse({
    description: 'Season updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(SeasonResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Season not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateSeasonDto) {
    return this.seasonsService.update(id, body)
  }

  @Delete('seasons/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a season', description: 'Deletes a platform-wide season. Any authenticated user can manage seasons.' })
  @ApiOkResponse({
    description: 'Season deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Season deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Season not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.seasonsService.remove(id)
  }
}