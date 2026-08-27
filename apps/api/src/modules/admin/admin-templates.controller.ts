import { UseGuards, Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe, NotFoundException, BadRequestException } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiBody, ApiQuery, getSchemaPath, ApiExtraModels } from '@nestjs/swagger'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../roles/guards/roles.guard'
import { Roles } from '../roles/decorators/roles.decorator'
import { ApiResponse } from '../../lib/utils/api-response'
import { Template } from '../cards/entities/template.entity'
import { AdminPaginatedQueryDto } from './dto/admin-paginated-query.dto'

class CreateTemplateDto {
  @ApiProperty({ example: 'Minimal Pro' })
  @IsString()
  @MaxLength(100)
  name!: string

  @ApiPropertyOptional({ example: 'Clean minimal layout' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string

  @ApiPropertyOptional({ example: 'business' })
  @IsOptional()
  @IsString()
  category?: string

  @ApiPropertyOptional({ enum: ['published', 'draft'], default: 'draft' })
  @IsOptional()
  @IsIn(['published', 'draft'])
  status?: string
}

class UpdateTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string

  @ApiPropertyOptional({ enum: ['published', 'draft'] })
  @IsOptional()
  @IsIn(['published', 'draft'])
  status?: string
}

@ApiTags('admin-templates')
@ApiExtraModels(ApiResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/templates')
export class AdminTemplatesController {
  constructor(
    @InjectRepository(Template) private templateRepo: Repository<Template>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all templates (admin)' })
  @ApiOkResponse({ description: 'Paginated templates' })
  async list(@Query() query: AdminPaginatedQueryDto) {
    const { page = 1, limit = 20, search, status, sort = 'created_at', order = 'DESC' } = query
    const sortMap: Record<string, string> = { created_at: 't.createdAt', updated_at: 't.updatedAt', name: 't.name', slug: 't.slug', id: 't.id', status: 't.status' }
    const sortField = sortMap[sort] || 't.createdAt'
    const qb = this.templateRepo.createQueryBuilder('t')

    if (search) {
      qb.andWhere('(t.name ILIKE :s OR t.slug ILIKE :s)', { s: `%${search}%` })
    }
    if (status) {
      qb.andWhere('t.status = :status', { status })
    }

    qb.orderBy(sortField, order)
    const total = await qb.getCount()
    const data = await qb.skip((page - 1) * limit).take(limit).getMany()

    return ApiResponse.success({ data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }, 'Templates retrieved', 200)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a template (admin)' })
  @ApiOkResponse({ description: 'Template detail' })
  @ApiNotFoundResponse({ description: 'Template not found' })
  async get(@Param('id', new ParseUUIDPipe()) id: string) {
    const t = await this.templateRepo.findOne({ where: { id }, relations: ['fields'] })
    if (!t) throw new NotFoundException('Template not found')
    return ApiResponse.success(t, 'Template retrieved', 200)
  }

  @Post()
  @ApiOperation({ summary: 'Create a template (admin)' })
  @ApiBody({ type: CreateTemplateDto })
  @ApiCreatedResponse({ description: 'Template created' })
  async create(@Body() body: CreateTemplateDto) {
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const existing = await this.templateRepo.findOne({ where: { slug } })
    if (existing) throw new BadRequestException('Template slug already exists')

    const saved = await this.templateRepo.save(this.templateRepo.create({ ...body, slug }))
    return ApiResponse.success(saved, 'Template created', 201)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a template (admin)' })
  @ApiBody({ type: UpdateTemplateDto })
  @ApiOkResponse({ description: 'Template updated' })
  @ApiNotFoundResponse({ description: 'Template not found' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateTemplateDto) {
    const t = await this.templateRepo.findOne({ where: { id } })
    if (!t) throw new NotFoundException('Template not found')

    Object.assign(t, body)
    const saved = await this.templateRepo.save(t)
    return ApiResponse.success(saved, 'Template updated', 200)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a template (admin)' })
  @ApiOkResponse({ description: 'Template deleted' })
  @ApiNotFoundResponse({ description: 'Template not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const t = await this.templateRepo.findOne({ where: { id } })
    if (!t) throw new NotFoundException('Template not found')
    await this.templateRepo.remove(t)
    return ApiResponse.success(null, 'Template deleted', 200)
  }
}
