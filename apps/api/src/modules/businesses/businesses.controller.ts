import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseUUIDPipe, HttpCode } from '@nestjs/common'
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
import { BusinessesService } from './businesses.service'
import { BusinessResponseDto, BusinessLocationResponseDto, BusinessHourResponseDto, BrandResponseDto, BusinessCategoryResponseDto } from './dto/business-response.dto'
import { CreateBusinessDto } from './dto/create-business.dto'
import { UpdateBusinessDto } from './dto/update-business.dto'
import { CreateLocationDto } from './dto/create-location.dto'
import { UpdateLocationDto } from './dto/update-location.dto'
import { CreateBusinessHourDto } from './dto/create-business-hour.dto'
import { UpdateBusinessHourDto } from './dto/update-business-hour.dto'
import { CreateBrandDto } from './dto/create-brand.dto'
import { UpdateBrandDto } from './dto/update-brand.dto'


@ApiTags('businesses')
@ApiExtraModels(ApiResponse, BusinessResponseDto, BusinessLocationResponseDto, BusinessHourResponseDto, BrandResponseDto, BusinessCategoryResponseDto)
@UseGuards(JwtAuthGuard)
@Controller()
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}


  @Post('businesses')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a business', description: 'Creates a business owned by the authenticated user.' })
  @ApiBody({ type: CreateBusinessDto, examples: { default: { summary: 'New business', value: { name: 'Acme Cafe', category_id: undefined, email: 'hello@acmecafe.com', phone: '+15551234567', website: 'https://acmecafe.com' } } } })
  @ApiCreatedResponse({
    description: 'Business created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(BusinessResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiBadRequestResponse({ description: 'Invalid input or category not found' })
  async create(@CurrentUser() user: UserResponseDto, @Body() body: CreateBusinessDto) {
    return this.businessesService.create(user.id, body)
  }


  @Get('businesses/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a business', description: 'Returns a business by ID with its category, locations, hours, and brands.' })
  @ApiOkResponse({
    description: 'Business found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(BusinessResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this business' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return ApiResponse.success(BusinessResponseDto.fromEntity(await this.businessesService.findOne(id)), 'Business retrieved', 200)
  }


  @Get('businesses/by-slug/:slug')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a business by slug', description: 'Returns a business for a public storefront URL slug, with its category, locations, hours, and brands.' })
  @ApiOkResponse({
    description: 'Business found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(BusinessResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async findBySlug(@Param('slug') slug: string) {
    return ApiResponse.success(BusinessResponseDto.fromEntity(await this.businessesService.findBySlug(slug)), 'Business retrieved', 200)
  }


  @Get('business-categories')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List business categories', description: 'Returns the system-defined business categories, for populating the category dropdown. Read-only.' })
  @ApiOkResponse({
    description: 'Business categories',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(BusinessCategoryResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listCategories() {
    return this.businessesService.listCategories()
  }


  @Get('users/me/businesses')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List the authenticated user businesses', description: 'Returns every business owned by the authenticated user.' })
  @ApiOkResponse({
    description: 'Businesses owned by the user',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(BusinessResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listMine(@CurrentUser() user: UserResponseDto) {
    return this.businessesService.listForOwner(user.id)
  }


  @Patch('businesses/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a business', description: 'Updates a business owned by the authenticated user.' })
  @ApiBody({ type: UpdateBusinessDto, examples: { default: { summary: 'Update business', value: { name: 'Acme Cafe (Updated)', phone: '+15559876543' } } } })
  @ApiOkResponse({
    description: 'Business updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(BusinessResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this business' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: UpdateBusinessDto) {
    return this.businessesService.update(id, user.id, body)
  }


  @Delete('businesses/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a business', description: 'Deletes a business owned by the authenticated user. Cascades to locations, hours, and brands.' })
  @ApiOkResponse({
    description: 'Business deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Business deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this business' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto) {
    return this.businessesService.remove(id, user.id)
  }


  // ---- Locations ----


  @Post('businesses/:id/locations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a location to a business', description: 'Creates a location for a business owned by the authenticated user.' })
  @ApiBody({ type: CreateLocationDto, examples: { default: { summary: 'New location', value: { address: '123 Main St', city: 'San Francisco', state: 'CA', country: 'USA', latitude: 37.7749, longitude: -122.4194 } } } })
  @ApiCreatedResponse({
    description: 'Location created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(BusinessLocationResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this business' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async createLocation(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: CreateLocationDto) {
    return this.businessesService.createLocation(id, user.id, body)
  }


  @Get('businesses/:id/locations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List a business locations', description: 'Returns all locations of a business owned by the authenticated user.' })
  @ApiOkResponse({
    description: 'Business locations',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(BusinessLocationResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this business' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async listLocations(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto) {
    return this.businessesService.listLocations(id, user.id)
  }


  @Patch('locations/:locationId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a business location', description: 'Updates a location. The location must belong to a business the authenticated user owns.' })
  @ApiBody({ type: UpdateLocationDto, examples: { default: { summary: 'Update location', value: { city: 'Oakland', latitude: 37.8044 } } } })
  @ApiOkResponse({
    description: 'Location updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(BusinessLocationResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Location not found' })
  async updateLocation(@Param('locationId', new ParseUUIDPipe()) locationId: string, @CurrentUser() user: UserResponseDto, @Body() body: UpdateLocationDto) {
    return this.businessesService.updateLocationByLocation(locationId, user.id, body)
  }


  @Delete('locations/:locationId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a business location', description: 'Deletes a location. The location must belong to a business the authenticated user owns.' })
  @ApiOkResponse({
    description: 'Location deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Location deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Location not found' })
  async removeLocation(@Param('locationId', new ParseUUIDPipe()) locationId: string, @CurrentUser() user: UserResponseDto) {
    return this.businessesService.removeLocationByLocation(locationId, user.id)
  }


  // ---- Hours ----


  @Post('businesses/:id/hours')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add opening hours to a business', description: 'Creates an opening-hours row (one per day of the week) for a business owned by the authenticated user.' })
  @ApiBody({ type: CreateBusinessHourDto, examples: { default: { summary: 'New hours', value: { day_of_week: 1, opens_at: '09:00', closes_at: '17:00', is_closed: false } } } })
  @ApiCreatedResponse({
    description: 'Business hours created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(BusinessHourResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this business' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  @ApiBadRequestResponse({ description: 'Hours already defined for that day' })
  async createHour(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: CreateBusinessHourDto) {
    return this.businessesService.createHour(id, user.id, body)
  }


  @Get('businesses/:id/hours')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List a business opening hours', description: 'Returns the opening hours of a business owned by the authenticated user, ordered by day of the week.' })
  @ApiOkResponse({
    description: 'Business hours',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(BusinessHourResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this business' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async listHours(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto) {
    return this.businessesService.listHours(id, user.id)
  }


  @Patch('business-hours/:hourId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a business opening-hours row', description: 'Updates opening hours. The row must belong to a business the authenticated user owns.' })
  @ApiBody({ type: UpdateBusinessHourDto, examples: { default: { summary: 'Update hours', value: { closes_at: '18:00' } } } })
  @ApiOkResponse({
    description: 'Business hours updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(BusinessHourResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Business hours not found' })
  async updateHour(@Param('hourId', new ParseUUIDPipe()) hourId: string, @CurrentUser() user: UserResponseDto, @Body() body: UpdateBusinessHourDto) {
    return this.businessesService.updateHourByHour(hourId, user.id, body)
  }


  @Delete('business-hours/:hourId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a business opening-hours row', description: 'Deletes opening hours. The row must belong to a business the authenticated user owns.' })
  @ApiOkResponse({
    description: 'Business hours deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Business hours deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Business hours not found' })
  async removeHour(@Param('hourId', new ParseUUIDPipe()) hourId: string, @CurrentUser() user: UserResponseDto) {
    return this.businessesService.removeHourByHour(hourId, user.id)
  }


  // ---- Brands ----


  @Post('businesses/:id/brands')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a brand to a business', description: 'Creates a brand for a business owned by the authenticated user.' })
  @ApiBody({ type: CreateBrandDto, examples: { default: { summary: 'New brand', value: { name: 'Acme Signature', description: 'Premium line', logo_url: 'https://cdn.example.com/logo.png' } } } })
  @ApiCreatedResponse({
    description: 'Brand created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(BrandResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this business' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async createBrand(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: CreateBrandDto) {
    return this.businessesService.createBrand(id, user.id, body)
  }


  @Get('businesses/:id/brands')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List a business brands', description: 'Returns all brands of a business owned by the authenticated user.' })
  @ApiOkResponse({
    description: 'Business brands',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(BrandResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this business' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async listBrands(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto) {
    return this.businessesService.listBrands(id, user.id)
  }


  @Patch('brands/:brandId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a business brand', description: 'Updates a brand. The brand must belong to a business the authenticated user owns.' })
  @ApiBody({ type: UpdateBrandDto, examples: { default: { summary: 'Update brand', value: { name: 'Acme Reserve' } } } })
  @ApiOkResponse({
    description: 'Brand updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(BrandResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Brand not found' })
  async updateBrand(@Param('brandId', new ParseUUIDPipe()) brandId: string, @CurrentUser() user: UserResponseDto, @Body() body: UpdateBrandDto) {
    return this.businessesService.updateBrandByBrand(brandId, user.id, body)
  }


  @Delete('brands/:brandId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a business brand', description: 'Deletes a brand. The brand must belong to a business the authenticated user owns.' })
  @ApiOkResponse({
    description: 'Brand deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Brand deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Brand not found' })
  async removeBrand(@Param('brandId', new ParseUUIDPipe()) brandId: string, @CurrentUser() user: UserResponseDto) {
    return this.businessesService.removeBrandByBrand(brandId, user.id)
  }
}