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

@ApiTags('cards')
@ApiExtraModels(
  ApiResponse,
  CardResponseDto,
  CardProfileResponseDto,
  CardCustomizationResponseDto,
  SocialLinkResponseDto,
  CardAccessResponseDto,
  TemplateResponseDto,
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

  @Patch('card-access/:accessId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a card access settings', description: 'Updates access settings. The settings must belong to a card the authenticated user owns.' })
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
  async updateAccess(@Param('accessId', new ParseUUIDPipe()) accessId: string, @CurrentUser() user: UserResponseDto, @Body() body: UpdateCardAccessDto) {
    return this.cardsService.updateAccessByAccess(accessId, user.id, body)
  }

  @Delete('card-access/:accessId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a card access settings', description: 'Deletes access settings. The settings must belong to a card the authenticated user owns.' })
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
  async removeAccess(@Param('accessId', new ParseUUIDPipe()) accessId: string, @CurrentUser() user: UserResponseDto) {
    return this.cardsService.removeAccessByAccess(accessId, user.id)
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
}