import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common'
import {
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
import { CurrentUser } from '../auth/current-user.decorator'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { CatalogService } from './catalog.service'
import { GiftCardResponseDto, CashbackProgramResponseDto } from './dto/catalog-response.dto'
import { CreateGiftCardDto, UpdateGiftCardDto, CreateCashbackProgramDto, UpdateCashbackProgramDto } from './dto/catalog.dto'

@ApiTags('finance')
@ApiExtraModels(ApiResponse, GiftCardResponseDto, CashbackProgramResponseDto)
@UseGuards(JwtAuthGuard)
@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // ── Gift Cards ──

  @Get('gift-cards')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List gift cards' })
  @ApiOkResponse({ description: 'Gift cards', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'array', items: { $ref: getSchemaPath(GiftCardResponseDto) } } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listGiftCards(@CurrentUser() user: UserResponseDto) {
    return this.catalogService.listGiftCards(user)
  }

  @Post('gift-cards')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a gift card' })
  @ApiBody({ type: CreateGiftCardDto })
  @ApiCreatedResponse({ description: 'Gift card created', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(GiftCardResponseDto) } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async createGiftCard(@CurrentUser() user: UserResponseDto, @Body() body: CreateGiftCardDto) {
    return this.catalogService.createGiftCard(user, body)
  }

  @Get('gift-cards/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a gift card' })
  @ApiOkResponse({ description: 'Gift card', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(GiftCardResponseDto) } } }] } })
  @ApiNotFoundResponse({ description: 'Gift card not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async getGiftCard(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.catalogService.getGiftCard(user, id)
  }

  @Patch('gift-cards/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a gift card' })
  @ApiBody({ type: UpdateGiftCardDto })
  @ApiOkResponse({ description: 'Gift card updated', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(GiftCardResponseDto) } } }] } })
  @ApiNotFoundResponse({ description: 'Gift card not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async updateGiftCard(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateGiftCardDto) {
    return this.catalogService.updateGiftCard(user, id, body)
  }

  @Delete('gift-cards/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a gift card' })
  @ApiOkResponse({ description: 'Gift card deleted' })
  @ApiNotFoundResponse({ description: 'Gift card not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async deleteGiftCard(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.catalogService.deleteGiftCard(user, id)
  }

  // ── Cashback Programs ──

  @Get('cashback-programs')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List cashback programs' })
  @ApiOkResponse({ description: 'Cashback programs', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'array', items: { $ref: getSchemaPath(CashbackProgramResponseDto) } } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listCashbackPrograms(@CurrentUser() user: UserResponseDto) {
    return this.catalogService.listCashbackPrograms(user)
  }

  @Post('cashback-programs')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a cashback program' })
  @ApiBody({ type: CreateCashbackProgramDto })
  @ApiCreatedResponse({ description: 'Cashback program created', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(CashbackProgramResponseDto) } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async createCashbackProgram(@CurrentUser() user: UserResponseDto, @Body() body: CreateCashbackProgramDto) {
    return this.catalogService.createCashbackProgram(user, body)
  }

  @Get('cashback-programs/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a cashback program' })
  @ApiOkResponse({ description: 'Cashback program', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(CashbackProgramResponseDto) } } }] } })
  @ApiNotFoundResponse({ description: 'Cashback program not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async getCashbackProgram(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.catalogService.getCashbackProgram(user, id)
  }

  @Patch('cashback-programs/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a cashback program' })
  @ApiBody({ type: UpdateCashbackProgramDto })
  @ApiOkResponse({ description: 'Cashback program updated', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(CashbackProgramResponseDto) } } }] } })
  @ApiNotFoundResponse({ description: 'Cashback program not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async updateCashbackProgram(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateCashbackProgramDto) {
    return this.catalogService.updateCashbackProgram(user, id, body)
  }

  @Delete('cashback-programs/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a cashback program' })
  @ApiOkResponse({ description: 'Cashback program deleted' })
  @ApiNotFoundResponse({ description: 'Cashback program not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async deleteCashbackProgram(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.catalogService.deleteCashbackProgram(user, id)
  }
}
