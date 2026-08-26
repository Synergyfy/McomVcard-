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
import { ServicesService } from './services.service'
import { ServiceResponseDto } from './dto/service-response.dto'
import { CreateServiceDto } from './dto/create-service.dto'
import { UpdateServiceDto } from './dto/update-service.dto'

@ApiTags('services')
@ApiExtraModels(ApiResponse, ServiceResponseDto)
@UseGuards(JwtAuthGuard)
@Controller()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post('businesses/:id/services')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a service to a business', description: 'Creates a service for a business owned by the authenticated user.' })
  @ApiBody({ type: CreateServiceDto, examples: { default: { summary: 'New service', value: { name: 'Haircut & Style', description: 'A signature cut with styling', price: 75, currency: 'GBP', duration: 45 } } } })
  @ApiCreatedResponse({
    description: 'Service created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(ServiceResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this business' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: CreateServiceDto) {
    return this.servicesService.create(id, user.id, body)
  }

  @Get('businesses/:id/services')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List a business services', description: 'Returns all services of a business. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Business services',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(ServiceResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async list(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.servicesService.list(id)
  }

  @Get('services/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a service', description: 'Returns a single service. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Service found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(ServiceResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return ApiResponse.success(ServiceResponseDto.fromEntity(await this.servicesService.findOne(id)), 'Service retrieved', 200)
  }

  @Patch('services/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a service', description: 'Updates a service. The service must belong to a business the authenticated user owns.' })
  @ApiBody({ type: UpdateServiceDto, examples: { default: { summary: 'Update service', value: { price: 85, duration: 60 } } } })
  @ApiOkResponse({
    description: 'Service updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(ServiceResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: UpdateServiceDto) {
    return this.servicesService.update(id, user.id, body)
  }

  @Delete('services/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a service', description: 'Deletes a service. The service must belong to a business the authenticated user owns.' })
  @ApiOkResponse({
    description: 'Service deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Service deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto) {
    return this.servicesService.remove(id, user.id)
  }
}