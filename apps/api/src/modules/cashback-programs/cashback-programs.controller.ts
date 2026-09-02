import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  getSchemaPath,
  ApiExtraModels,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { CashbackProgramsService } from './cashback-programs.service'
import { CreateCashbackProgramDto } from './dto/create-cashback-program.dto'
import { UpdateCashbackProgramDto } from './dto/update-cashback-program.dto'
import { CashbackProgramResponseDto } from './dto/cashback-program-response.dto'

@ApiTags('cashback-programs')
@ApiExtraModels(ApiResponse, CashbackProgramResponseDto)
@UseGuards(JwtAuthGuard)
@Controller('cashback-programs')
export class CashbackProgramsController {
  constructor(private readonly cashbackProgramsService: CashbackProgramsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a cashback program', description: 'Creates a cashback program for a business owned by the authenticated user.' })
  @ApiBody({
    type: CreateCashbackProgramDto,
    examples: {
      default: {
        summary: 'Create cashback program',
        value: { business_id: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b', title: 'Summer Cashback', rate: 5.5 },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Cashback program created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CashbackProgramResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this business' })
  @ApiBadRequestResponse({ description: 'Invalid input or business not found' })
  async create(@CurrentUser() user: UserResponseDto, @Body() body: CreateCashbackProgramDto) {
    return this.cashbackProgramsService.create(user.id, body)
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my cashback programs', description: 'Returns all cashback programs for businesses owned by the authenticated user.' })
  @ApiOkResponse({
    description: 'Cashback programs',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { type: 'array', items: { $ref: getSchemaPath(CashbackProgramResponseDto) } } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listMine(@CurrentUser() user: UserResponseDto) {
    const programs = await this.cashbackProgramsService.listForOwner(user.id)
    return programs.map((p) => CashbackProgramResponseDto.fromEntity(p))
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a cashback program', description: 'Returns a single cashback program.' })
  @ApiOkResponse({
    description: 'Cashback program found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CashbackProgramResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Cashback program not found' })
  async findOne(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    const program = await this.cashbackProgramsService.findOne(id)
    await this.cashbackProgramsService['businessesService'].findOwned(program.businessId, user.id)
    return CashbackProgramResponseDto.fromEntity(program)
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a cashback program', description: 'Updates a cashback program owned by the authenticated user.' })
  @ApiBody({
    type: UpdateCashbackProgramDto,
    examples: { default: { summary: 'Update cashback program', value: { status: 'off' } } },
  })
  @ApiOkResponse({
    description: 'Cashback program updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(CashbackProgramResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Cashback program not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateCashbackProgramDto) {
    const program = await this.cashbackProgramsService.update(user.id, id, body)
    return CashbackProgramResponseDto.fromEntity(program)
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a cashback program', description: 'Permanently deletes a cashback program owned by the authenticated user.' })
  @ApiOkResponse({
    description: 'Cashback program deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Cashback program deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Cashback program not found' })
  async remove(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    await this.cashbackProgramsService.remove(user.id, id)
    return ApiResponse.message('Cashback program deleted', 200)
  }
}