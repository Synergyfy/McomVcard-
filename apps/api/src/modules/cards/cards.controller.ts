import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { CardsService } from './cards.service'
import {
  CardResponseDto,
  CardProfileResponseDto,
  CardCustomizationResponseDto,
  SocialLinkResponseDto,
  CardAccessResponseDto,
  TemplateResponseDto,
} from './dto/card-response.dto'
import { CreateCardDto } from './dto/create-card.dto'
import { UpdateCardDto } from './dto/update-card.dto'
import { CreateCardProfileDto } from './dto/create-card-profile.dto'
import { UpdateCardProfileDto } from './dto/update-card-profile.dto'
import { CreateCardCustomizationDto } from './dto/create-card-customization.dto'
import { UpdateCardCustomizationDto } from './dto/update-card-customization.dto'
import { CreateSocialLinkDto } from './dto/create-social-link.dto'
import { UpdateSocialLinkDto } from './dto/update-social-link.dto'
import { CreateCardAccessDto } from './dto/create-card-access.dto'
import { UpdateCardAccessDto } from './dto/update-card-access.dto'
import { UpsertCardSectionDto } from './dto/upsert-card-section.dto'
import { UpsertCentreControlDto } from './dto/upsert-centre-controls.dto'
import { ApplyTemplateDto } from './dto/apply-template.dto'
import { CardSectionResponseDto } from './dto/card-section-response.dto'
import { CardCentreControlResponseDto } from './dto/card-centre-control-response.dto'
import { CardActivityResponseDto } from './dto/card-activity-response.dto'

@ApiTags('cards')
@ApiExtraModels(
  ApiResponse,
  CardResponseDto,
  CardProfileResponseDto,
  CardCustomizationResponseDto,
  SocialLinkResponseDto,
  CardAccessResponseDto,
  TemplateResponseDto,
  CardSectionResponseDto,
  CardCentreControlResponseDto,
  CardActivityResponseDto,
)
@UseGuards(JwtAuthGuard)
@Controller()
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  // ---- Cards ----

  @Post('cards')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a card', description: 'Creates a digital card owned by the authenticated user. A slug is generated if omitted.' })
  @ApiBody({ type: CreateCardDto, examples: { default: { summary: 'New card', value: { slug: 'jane-doe', type: 'PERSONAL', template_id: undefined } } } })
  @ApiCreatedResponse({
    description: 'Card created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CardResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiBadRequestResponse({ description: 'Invalid input, template or business not found' })
  @ApiForbiddenResponse({ description: 'You do not own the linked business' })
  async create(@CurrentUser() user: UserResponseDto, @Body() body: CreateCardDto) {
    return this.cardsService.create(user.id, body)
  }

  @Get('cards/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a card', description: 'Returns a card by ID with its profile, customization, social links, access settings, and template.' })
  @ApiOkResponse({
    description: 'Card found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CardResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return ApiResponse.success(CardResponseDto.fromEntity(await this.cardsService.findOne(id)), 'Card retrieved', 200)
  }

  @Get('cards/by-slug/:slug')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a card by slug', description: 'Returns a card for a public card URL slug, with its profile, customization, social links, access settings, and template.' })
  @ApiOkResponse({
    description: 'Card found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CardResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  async findBySlug(@Param('slug') slug: string) {
    return ApiResponse.success(CardResponseDto.fromEntity(await this.cardsService.findBySlug(slug)), 'Card retrieved', 200)
  }

  @Get('users/me/cards')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List the authenticated user cards', description: 'Returns every card owned by the authenticated user.' })
  @ApiOkResponse({
    description: 'Cards owned by the user',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(CardResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listMine(@CurrentUser() user: UserResponseDto) {
    return this.cardsService.listForOwner(user.id)
  }

  @Patch('cards/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a card', description: 'Updates a card owned by the authenticated user.' })
  @ApiBody({ type: UpdateCardDto, examples: { default: { summary: 'Update card', value: { type: 'BUSINESS', template_id: undefined } } } })
  @ApiOkResponse({
    description: 'Card updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CardResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this card' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  @ApiBadRequestResponse({ description: 'Invalid input, template or business not found' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: UpdateCardDto) {
    return this.cardsService.update(id, user.id, body)
  }

  @Delete('cards/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a card', description: 'Deletes a card owned by the authenticated user. Cascades to its profile, customization, social links, and access settings.' })
  @ApiOkResponse({
    description: 'Card deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Card deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this card' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto) {
    return this.cardsService.remove(id, user.id)
  }

  // ---- Profiles ----

  @Post('cards/:id/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a profile to a card', description: 'Creates the profile (one per card) for a card owned by the authenticated user.' })
  @ApiBody({ type: CreateCardProfileDto, examples: { default: { summary: 'New profile', value: { display_name: 'Jane Doe', bio: 'Digital marketer', job_title: 'Marketing Lead', email: 'jane@example.com', phone: '+15551234567' } } } })
  @ApiCreatedResponse({
    description: 'Card profile created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CardProfileResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this card' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  @ApiBadRequestResponse({ description: 'Card profile already exists for this card' })
  async createProfile(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: CreateCardProfileDto) {
    return this.cardsService.createProfile(id, user.id, body)
  }

  @Get('cards/:id/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a card profile', description: 'Returns the profile of a card. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Card profile found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CardProfileResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Card profile not found' })
  async getProfile(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cardsService.getProfile(id)
  }

  @Patch('card-profiles/:profileId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a card profile', description: 'Updates a profile. The profile must belong to a card the authenticated user owns.' })
  @ApiBody({ type: UpdateCardProfileDto, examples: { default: { summary: 'Update profile', value: { job_title: 'VP Marketing' } } } })
  @ApiOkResponse({
    description: 'Card profile updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CardProfileResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent card' })
  @ApiNotFoundResponse({ description: 'Card profile not found' })
  async updateProfile(@Param('profileId', new ParseUUIDPipe()) profileId: string, @CurrentUser() user: UserResponseDto, @Body() body: UpdateCardProfileDto) {
    return this.cardsService.updateProfileByProfile(profileId, user.id, body)
  }

  @Delete('card-profiles/:profileId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a card profile', description: 'Deletes a profile. The profile must belong to a card the authenticated user owns.' })
  @ApiOkResponse({
    description: 'Card profile deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Card profile deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent card' })
  @ApiNotFoundResponse({ description: 'Card profile not found' })
  async removeProfile(@Param('profileId', new ParseUUIDPipe()) profileId: string, @CurrentUser() user: UserResponseDto) {
    return this.cardsService.removeProfileByProfile(profileId, user.id)
  }

  // ---- Customizations ----

  @Post('cards/:id/customization')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a customization to a card', description: 'Creates the customization (one per card) for a card owned by the authenticated user.' })
  @ApiBody({ type: CreateCardCustomizationDto, examples: { default: { summary: 'New customization', value: { logo: 'https://cdn.example.com/logo.png', primary_color: '#0f172a', secondary_color: '#f59e0b', font: 'Poppins', layout: 'modern' } } } })
  @ApiCreatedResponse({
    description: 'Card customization created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CardCustomizationResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this card' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  @ApiBadRequestResponse({ description: 'Card customization already exists for this card' })
  async createCustomization(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: CreateCardCustomizationDto) {
    return this.cardsService.createCustomization(id, user.id, body)
  }

  @Get('cards/:id/customization')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a card customization', description: 'Returns the customization of a card. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Card customization found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CardCustomizationResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Card customization not found' })
  async getCustomization(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cardsService.getCustomization(id)
  }

  @Patch('cards/:cardId/customization')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a card customization by card ID', description: 'Updates a customization. The customization must belong to a card the authenticated user owns.' })
  @ApiBody({ type: UpdateCardCustomizationDto, examples: { default: { summary: 'Update customization', value: { primary_color: '#1e293b' } } } })
  @ApiOkResponse({
    description: 'Card customization updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CardCustomizationResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent card' })
  @ApiNotFoundResponse({ description: 'Card customization not found' })
  async updateCustomizationByCardId(@Param('cardId', new ParseUUIDPipe()) cardId: string, @CurrentUser() user: UserResponseDto, @Body() body: UpdateCardCustomizationDto) {
    return this.cardsService.updateCustomizationByCardId(cardId, user.id, body)
  }

  @Patch('card-customizations/:customizationId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a card customization', description: 'Updates a customization. The customization must belong to a card the authenticated user owns.' })
  @ApiBody({ type: UpdateCardCustomizationDto, examples: { default: { summary: 'Update customization', value: { primary_color: '#1e293b' } } } })
  @ApiOkResponse({
    description: 'Card customization updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CardCustomizationResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent card' })
  @ApiNotFoundResponse({ description: 'Card customization not found' })
  async updateCustomization(@Param('customizationId', new ParseUUIDPipe()) customizationId: string, @CurrentUser() user: UserResponseDto, @Body() body: UpdateCardCustomizationDto) {
    return this.cardsService.updateCustomizationByCustomization(customizationId, user.id, body)
  }

  @Delete('card-customizations/:customizationId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a card customization', description: 'Deletes a customization. The customization must belong to a card the authenticated user owns.' })
  @ApiOkResponse({
    description: 'Card customization deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Card customization deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent card' })
  @ApiNotFoundResponse({ description: 'Card customization not found' })
  async removeCustomization(@Param('customizationId', new ParseUUIDPipe()) customizationId: string, @CurrentUser() user: UserResponseDto) {
    return this.cardsService.removeCustomizationByCustomization(customizationId, user.id)
  }

  // ---- Social links ----

  @Post('cards/:id/social-links')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a social link to a card', description: 'Creates a social link for a card owned by the authenticated user.' })
  @ApiBody({ type: CreateSocialLinkDto, examples: { default: { summary: 'New social link', value: { platform: 'instagram', url: 'https://instagram.com/janedoe', display_order: 0 } } } })
  @ApiCreatedResponse({
    description: 'Social link created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(SocialLinkResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this card' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  async createSocialLink(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: CreateSocialLinkDto) {
    return this.cardsService.createSocialLink(id, user.id, body)
  }

  @Get('cards/:id/social-links')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List a card social links', description: 'Returns the social links of a card ordered by display order. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Card social links',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(SocialLinkResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listSocialLinks(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cardsService.listSocialLinks(id)
  }

  @Patch('social-links/:linkId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a card social link', description: 'Updates a social link. The link must belong to a card the authenticated user owns.' })
  @ApiBody({ type: UpdateSocialLinkDto, examples: { default: { summary: 'Update social link', value: { url: 'https://instagram.com/jane.doe' } } } })
  @ApiOkResponse({
    description: 'Social link updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(SocialLinkResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent card' })
  @ApiNotFoundResponse({ description: 'Social link not found' })
  async updateSocialLink(@Param('linkId', new ParseUUIDPipe()) linkId: string, @CurrentUser() user: UserResponseDto, @Body() body: UpdateSocialLinkDto) {
    return this.cardsService.updateSocialLinkByLink(linkId, user.id, body)
  }

  @Delete('social-links/:linkId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a card social link', description: 'Deletes a social link. The link must belong to a card the authenticated user owns.' })
  @ApiOkResponse({
    description: 'Social link deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Social link deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent card' })
  @ApiNotFoundResponse({ description: 'Social link not found' })
  async removeSocialLink(@Param('linkId', new ParseUUIDPipe()) linkId: string, @CurrentUser() user: UserResponseDto) {
    return this.cardsService.removeSocialLinkByLink(linkId, user.id)
  }

  // ---- Card access ----

  @Post('cards/:id/access')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add access settings to a card', description: 'Creates the access settings (one per card) for a card owned by the authenticated user.' })
  @ApiBody({ type: CreateCardAccessDto, examples: { default: { summary: 'New access settings', value: { is_enabled: true, password: 'secret123', protected_sections: { wallet: true }, access_expiry: 'never' } } } })
  @ApiCreatedResponse({
    description: 'Card access created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CardAccessResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this card' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  @ApiBadRequestResponse({ description: 'Card access already exists, or expires_at required for "until" expiry' })
  async createAccess(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: CreateCardAccessDto) {
    return this.cardsService.createAccess(id, user.id, body)
  }

  @Get('cards/:id/access')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a card access settings', description: 'Returns the access settings of a card. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Card access found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CardAccessResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Card access not found' })
  async getAccess(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cardsService.getAccess(id)
  }

  @Patch('card-access/:cardId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a card access settings', description: 'Updates access settings for a card by card ID. The settings must belong to a card the authenticated user owns.' })
  @ApiBody({ type: UpdateCardAccessDto, examples: { default: { summary: 'Update access settings', value: { is_enabled: false } } } })
  @ApiOkResponse({
    description: 'Card access updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CardAccessResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent card' })
  @ApiNotFoundResponse({ description: 'Card access not found' })
  @ApiBadRequestResponse({ description: 'expires_at required for "until" expiry' })
  async updateAccess(@Param('cardId', new ParseUUIDPipe()) cardId: string, @CurrentUser() user: UserResponseDto, @Body() body: UpdateCardAccessDto) {
    return this.cardsService.updateAccessByCardId(cardId, user.id, body)
  }

  @Delete('card-access/:cardId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a card access settings', description: 'Deletes access settings for a card by card ID. The settings must belong to a card the authenticated user owns.' })
  @ApiOkResponse({
    description: 'Card access deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Card access deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent card' })
  @ApiNotFoundResponse({ description: 'Card access not found' })
  async removeAccess(@Param('cardId', new ParseUUIDPipe()) cardId: string, @CurrentUser() user: UserResponseDto) {
    return this.cardsService.removeAccessByCardId(cardId, user.id)
  }

  // ---- Templates (system-defined, read-only) ----

  @Get('templates')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List card templates', description: 'Returns the system-defined card templates with their fields, for populating the template picker. Read-only.' })
  @ApiOkResponse({
    description: 'Card templates',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(TemplateResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listTemplates() {
    return this.cardsService.listTemplates()
  }

  @Get('templates/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a card template', description: 'Returns a single system-defined card template with its fields. Read-only.' })
  @ApiOkResponse({
    description: 'Card template found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(TemplateResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Template not found' })
  async findTemplate(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cardsService.findTemplate(id)
  }

  // ---- Business cards ----

  @Get('businesses/:businessId/cards')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List cards for a business', description: 'Returns all cards linked to a business owned by the authenticated user.' })
  @ApiOkResponse({
    description: 'Business cards',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(CardResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this business' })
  async listForBusiness(@Param('businessId', new ParseUUIDPipe()) businessId: string, @CurrentUser() user: UserResponseDto) {
    return this.cardsService.listForBusiness(businessId, user.id)
  }

  // ---- Template claiming ----

  @Post('cards/claim')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Claim a template', description: 'Creates a new card from a published template, linking it to a business.' })
  @ApiBody({ schema: { properties: { template_id: { type: 'string', format: 'uuid' }, business_id: { type: 'string', format: 'uuid' }, custom_slug: { type: 'string' } } } })
  @ApiCreatedResponse({
    description: 'Template claimed',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CardResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this business' })
  @ApiBadRequestResponse({ description: 'Template not found or not published' })
  async claimTemplate(@CurrentUser() user: UserResponseDto, @Body() body: { template_id: string; business_id: string; custom_slug?: string }) {
    return this.cardsService.claimTemplate(user.id, body.business_id, body.template_id, body.custom_slug)
  }

  // ---- Template applying (replace on an existing card) ----

  @Post('cards/:id/apply-template')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Apply a template to an existing card',
    description: 'Swaps the published template linked to one of your cards. Sections the new template enables are upserted (saved content is kept where section ids match); sections no longer part of the template are disabled, not deleted. Card name/category mirror the template.',
  })
  @ApiBody({ type: ApplyTemplateDto, examples: { default: { summary: 'Apply template', value: { template_id: undefined } } } })
  @ApiOkResponse({
    description: 'Template applied',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CardResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this card' })
  @ApiBadRequestResponse({ description: 'Template not found or not published' })
  async applyTemplate(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: ApplyTemplateDto) {
    return this.cardsService.applyTemplate(id, user.id, body.template_id)
  }

  // ---- Duplication ----

  @Post('cards/:id/duplicate')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Duplicate a card',
    description: 'Creates a copy of one of your cards with a fresh slug, zeroed stats and copied sections/centre controls. Access settings, profile, customization and social links are NOT copied — they belong to the original card.',
  })
  @ApiOkResponse({
    description: 'Card duplicated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CardResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this card' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  async duplicate(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto) {
    return this.cardsService.duplicate(id, user.id)
  }


  // ---- Card stats ----

  @Get('cards/:id/stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get card stats', description: 'Returns aggregated analytics stats (views, scans, shares, events) for a card.' })
  @ApiOkResponse({ description: 'Card stats' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  async getCardStats(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cardsService.getCardStats(id)
  }

  // ---- Card activity feed ----

  @Get('cards/:id/activity')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get card activity feed',
    description: 'Returns the 50 most recent activity log entries for the business linked to this card.',
  })
  @ApiOkResponse({
    description: 'Card activity feed',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(CardActivityResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  async getCardActivity(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cardsService.getCardActivity(id)
  }

  // ---- Sections ----

  @Get('cards/:id/sections')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List card sections', description: 'Returns all sections for a card, ordered by sort order.' })
  @ApiOkResponse({
    description: 'Card sections',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(CardSectionResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listSections(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cardsService.listSections(id)
  }

  @Patch('cards/:id/sections')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upsert card sections', description: 'Creates or updates sections for a card owned by the authenticated user. Sections are matched by schema_id.' })
  @ApiBody({ type: [UpsertCardSectionDto] })
  @ApiOkResponse({
    description: 'Sections upserted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(CardSectionResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this card' })
  async upsertSections(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: UpsertCardSectionDto[]) {
    return this.cardsService.upsertSections(id, user.id, body)
  }

  @Delete('sections/:sectionId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a section', description: 'Deletes a section. The section must belong to a card the authenticated user owns.' })
  @ApiOkResponse({
    description: 'Section deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Section deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent card' })
  @ApiNotFoundResponse({ description: 'Section not found' })
  async removeSection(@Param('sectionId', new ParseUUIDPipe()) sectionId: string, @CurrentUser() user: UserResponseDto) {
    return this.cardsService.removeSection(sectionId, user.id)
  }

  // ---- Centre controls ----

  @Get('cards/:id/centre-controls')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List card centre controls', description: 'Returns all centre controls for a card.' })
  @ApiOkResponse({
    description: 'Centre controls',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(CardCentreControlResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listCentreControls(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cardsService.listCentreControls(id)
  }

  @Patch('cards/:id/centre-controls')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upsert card centre controls', description: 'Creates or updates centre controls for a card owned by the authenticated user.' })
  @ApiBody({ type: [UpsertCentreControlDto] })
  @ApiOkResponse({
    description: 'Centre controls upserted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(CardCentreControlResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this card' })
  async upsertCentreControls(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: UpsertCentreControlDto[]) {
    return this.cardsService.upsertCentreControls(id, user.id, body)
  }

  // ---- Consumer Store Card ----

  @Get('cards/:id/store-data')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get consumer store card data',
    description: 'Returns the composite store data for a consumer store card, including the card owner\'s membership tier/benefits, wallet balance, reward balance, and the current active season.',
  })
  @ApiOkResponse({ description: 'Store data retrieved' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  @ApiBadRequestResponse({ description: 'Card is not a consumer store card' })
  async getStoreData(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cardsService.getStoreData(id)
  }

  // ---- Template membership gating ----

  @Get('templates/:id/access')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Check template membership access',
    description: 'Checks whether the authenticated user\'s membership tier satisfies the template\'s required membership level. Returns allowed/denied with details.',
  })
  @ApiOkResponse({ description: 'Template access checked' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Template not found' })
  @ApiForbiddenResponse({ description: 'Insufficient membership tier' })
  async checkTemplateAccess(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto) {
    return this.cardsService.checkTemplateAccess(id, user.id)
  }
}