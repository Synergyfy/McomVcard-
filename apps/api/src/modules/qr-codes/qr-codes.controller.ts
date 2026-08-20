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
import { CurrentUser } from '../auth/current-user.decorator'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { QrCodesService } from './qr-codes.service'
import { CreateQrCodeDto, UpdateQrCodeDto } from './dto/qr-code.dto'
import { QrCodeResponseDto, QrResolveResponseDto } from './dto/qr-code-response.dto'

@ApiTags('qr-codes')
@ApiExtraModels(ApiResponse, QrCodeResponseDto, QrResolveResponseDto)
@Controller('qr-codes')
export class QrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a QR code for a card', description: 'Creates a QR code attached to one of the authenticated user\'s cards. Each QR targets a destination (VCARD, BUSINESS_PROFILE, OFFER, CAMPAIGN) and is scannable at its public url: https://mcomvcard.link/qr/<id>.' })
  @ApiBody({
    type: CreateQrCodeDto,
    examples: {
      vcard: { summary: 'QR pointing to a vCard', value: { card_id: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', destination_type: 'VCARD', destination: 'john-doe' } },
      business: { summary: 'QR pointing to a business profile', value: { card_id: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', destination_type: 'BUSINESS_PROFILE', destination: 'acme-corp' } },
    },
  })
  @ApiCreatedResponse({
    description: 'QR code created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(QrCodeResponseDto) } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Card not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async create(@CurrentUser() user: UserResponseDto, @Body() body: CreateQrCodeDto) {
    return this.qrCodesService.create(user, body)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my QR codes', description: 'Returns every QR code across the authenticated user\'s cards, newest first.' })
  @ApiOkResponse({
    description: 'QR codes',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { type: 'array', items: { $ref: getSchemaPath(QrCodeResponseDto) } } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listForUser(@CurrentUser() user: UserResponseDto) {
    return this.qrCodesService.listForUser(user)
  }

  @Get('cards/:cardId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List QR codes for a card', description: 'Returns every QR code attached to one of the authenticated user\'s cards.' })
  @ApiOkResponse({
    description: 'QR codes',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { type: 'array', items: { $ref: getSchemaPath(QrCodeResponseDto) } } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Card not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listForCard(@CurrentUser() user: UserResponseDto, @Param('cardId', new ParseUUIDPipe()) cardId: string) {
    return this.qrCodesService.listForCard(user, cardId)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a QR code', description: 'Updates the destination type, destination, or active state of a QR code belonging to one of the authenticated user\'s cards.' })
  @ApiBody({
    type: UpdateQrCodeDto,
    examples: { toggle: { summary: 'Deactivate a QR code', value: { is_active: false } } },
  })
  @ApiOkResponse({
    description: 'QR code updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(QrCodeResponseDto) } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'QR code not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async update(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateQrCodeDto) {
    return this.qrCodesService.update(user, id, body)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a QR code', description: 'Permanently deletes a QR code belonging to one of the authenticated user\'s cards.' })
  @ApiOkResponse({
    description: 'QR code deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { type: 'null', nullable: true } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'QR code not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async remove(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.qrCodesService.remove(user, id)
  }

  @Get(':id/resolve')
  @ApiOperation({ summary: 'Resolve a QR code (public)', description: 'Public endpoint: given a scanned QR code id, returns where to route the visitor ({ destination_type, destination }). Only active QR codes resolve; inactive or unknown codes return 404.' })
  @ApiOkResponse({
    description: 'Resolution',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(QrResolveResponseDto) } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'QR code not found or inactive' })
  async resolve(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.qrCodesService.resolve(id)
  }
}