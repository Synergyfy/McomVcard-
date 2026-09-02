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
import { TestimonialsService } from '../testimonials/testimonials.service'
import { CreateTestimonialDto, UpdateTestimonialDto } from '../testimonials/dto/testimonial.dto'

@ApiTags('admin-testimonials')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/testimonials')
export class AdminTestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  @ApiOperation({ summary: 'List all testimonials (Admin only)' })
  @ApiOkResponse({ description: 'List of testimonials' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll() {
    const testimonials = await this.testimonialsService.findAll()
    return ApiResponse.success(testimonials, 'Testimonials retrieved', 200)
  }

  @Post()
  @ApiOperation({ summary: 'Create a testimonial (Admin only)' })
  @ApiBody({ type: CreateTestimonialDto })
  @ApiCreatedResponse({ description: 'Testimonial created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() dto: CreateTestimonialDto) {
    const testimonial = await this.testimonialsService.create(dto)
    return ApiResponse.success(testimonial, 'Testimonial created', 201)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a testimonial by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Testimonial found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Testimonial not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const testimonial = await this.testimonialsService.findOne(id)
    return ApiResponse.success(testimonial, 'Testimonial retrieved', 200)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a testimonial (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateTestimonialDto })
  @ApiOkResponse({ description: 'Testimonial updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Testimonial not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateTestimonialDto) {
    const testimonial = await this.testimonialsService.update(id, dto)
    return ApiResponse.success(testimonial, 'Testimonial updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a testimonial (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Testimonial deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Testimonial not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.testimonialsService.remove(id)
    return ApiResponse.message('Testimonial deleted', 200)
  }
}
