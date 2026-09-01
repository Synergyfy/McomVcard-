import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'
import { CurrenciesService } from '../currencies/currencies.service'

@ApiTags('admin-currencies')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/currencies')
export class AdminCurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get('all-currencies')
  @ApiOperation({ summary: 'List all currencies without pagination (Admin only)', description: 'Returns the full currency list. Alias used by the frontend.' })
  @ApiOkResponse({ description: 'Full list of currencies' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAllCurrencies() {
    const currencies = await this.currenciesService.findAll()
    return ApiResponse.success(currencies, 'All currencies retrieved', 200)
  }

  @Get()
  @ApiOperation({ summary: 'List all currencies (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiOkResponse({ description: 'List of currencies' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
  ) {
    const all = await this.currenciesService.findAll()
    const filtered = search
      ? all.filter(c =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.toLowerCase().includes(search.toLowerCase()),
        )
      : all
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const paged = filtered.slice((page - 1) * limit, page * limit)

    return ApiResponse.success({ data: paged, meta: { total, page, limit, totalPages } }, 'Currencies retrieved', 200)
  }

  @Post()
  @ApiOperation({ summary: 'Create a currency (Admin only)' })
  @ApiBody({
    schema: {
      properties: {
        code: { type: 'string', example: 'USD' },
        name: { type: 'string', example: 'US Dollar' },
        symbol: { type: 'string', example: '$' },
        exchangeRate: { type: 'number', example: 1.0 },
      },
      required: ['code', 'name', 'symbol'],
    },
  })
  @ApiCreatedResponse({ description: 'Currency created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiNotFoundResponse({ description: 'Currency code already exists' })
  async create(@Body() body: { code: string; name: string; symbol: string; exchangeRate?: number }) {
    const currency = await this.currenciesService.create(body)
    return ApiResponse.success(currency, 'Currency created', 201)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a currency by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Currency found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Currency not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const currency = await this.currenciesService.findOne(id)
    return ApiResponse.success(currency, 'Currency retrieved', 200)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a currency (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({
    schema: {
      properties: {
        name: { type: 'string', example: 'US Dollar' },
        symbol: { type: 'string', example: '$' },
        isActive: { type: 'boolean', example: true },
        exchangeRate: { type: 'number', example: 1.0 },
      },
    },
  })
  @ApiOkResponse({ description: 'Currency updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Currency not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { name?: string; symbol?: string; isActive?: boolean; exchangeRate?: number },
  ) {
    const currency = await this.currenciesService.update(id, body)
    return ApiResponse.success(currency, 'Currency updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a currency (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Currency deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Currency not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.currenciesService.remove(id)
    return ApiResponse.message('Currency deleted', 200)
  }
}
