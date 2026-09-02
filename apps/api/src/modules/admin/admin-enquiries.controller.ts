import { Controller, Get, Patch, Delete, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
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
import { EnquiriesService } from '../enquiries/enquiries.service'

@ApiTags('admin-enquiries')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/enquiries')
export class AdminEnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all enquiries (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiOkResponse({ description: 'List of enquiries' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  async findAll(@Query() query: { status?: string; search?: string; page?: number; limit?: number }) {
    const result = await this.enquiriesService.findAll(query)
    return ApiResponse.success(result, 'Enquiries retrieved', 200)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an enquiry by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Enquiry found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Enquiry not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const enquiry = await this.enquiriesService.findOne(id)
    return ApiResponse.success(enquiry, 'Enquiry retrieved', 200)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an enquiry (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ schema: { properties: { status: { type: 'string', enum: ['new', 'read', 'replied', 'archived'] }, adminNotes: { type: 'string' } } } })
  @ApiOkResponse({ description: 'Enquiry updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Enquiry not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: { status?: string; adminNotes?: string }) {
    const enquiry = await this.enquiriesService.update(id, body)
    return ApiResponse.success(enquiry, 'Enquiry updated', 200)
  }

  @Patch(':id/mark-read')
  @ApiOperation({ summary: 'Mark an enquiry as read (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Enquiry marked as read' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Enquiry not found' })
  async markRead(@Param('id', new ParseUUIDPipe()) id: string) {
    const enquiry = await this.enquiriesService.markRead(id)
    return ApiResponse.success(enquiry, 'Enquiry marked as read', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an enquiry (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Enquiry deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions (not ADMIN)' })
  @ApiNotFoundResponse({ description: 'Enquiry not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.enquiriesService.remove(id)
    return ApiResponse.message('Enquiry deleted', 200)
  }
}