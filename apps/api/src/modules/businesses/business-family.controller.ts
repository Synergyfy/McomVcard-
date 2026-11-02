import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { BusinessAccessGuard } from './guards/business-access.guard'
import { BusinessFamilyService } from './business-family.service'
import { CreateBusinessFamilyMemberDto, UpdateBusinessFamilyMemberStatusDto } from './dto/business-family-member.dto'

@ApiTags('business-family')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, BusinessAccessGuard)
@Controller()
export class BusinessFamilyController {
  constructor(private readonly familyService: BusinessFamilyService) {}

  @Get('businesses/:id/family-members')
  @ApiOperation({ summary: 'List the business Friends & Family allocations' })
  async list(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.familyService.list(user.id, id)
  }

  @Post('businesses/:id/family-members')
  @ApiOperation({ summary: 'Allocate a Friends & Family card' })
  @ApiBody({ type: CreateBusinessFamilyMemberDto })
  async create(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string, @Body() body: CreateBusinessFamilyMemberDto) {
    return this.familyService.create(user.id, id, body)
  }

  @Patch('family-members/:memberId')
  @ApiOperation({ summary: 'Update a Friends & Family allocation status' })
  @ApiBody({ type: UpdateBusinessFamilyMemberStatusDto })
  async updateStatus(@CurrentUser() user: UserResponseDto, @Param('memberId', new ParseUUIDPipe()) memberId: string, @Body() body: UpdateBusinessFamilyMemberStatusDto) {
    return this.familyService.updateStatus(user.id, memberId, body)
  }

  @Delete('family-members/:memberId')
  @ApiOperation({ summary: 'Remove a Friends & Family allocation' })
  async remove(@CurrentUser() user: UserResponseDto, @Param('memberId', new ParseUUIDPipe()) memberId: string) {
    return this.familyService.remove(user.id, memberId)
  }
}
