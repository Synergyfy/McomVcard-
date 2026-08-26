import { Controller, Get, Query, Param, Post, Patch, Delete, Body, UseGuards, NotFoundException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiUnauthorizedResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiCreatedResponse, ApiQuery } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { CustomersService } from './customers.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Business } from '../businesses/entities/business.entity'
import { CreateCustomerNoteDto } from './dto/create-customer-note.dto'
import { UpdateCustomerNoteDto } from './dto/update-customer-note.dto'

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    @InjectRepository(Business) private businesses: Repository<Business>,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get customers derived from appointments, reviews and shares',
    description: 'Groups interactions by email across appointments, reviews (via user) and card shares (share -> card -> business). Each record carries a derived status (new: first activity within 30 days; at-risk: no activity for 90+ days; active: otherwise), the customer\'s membership tier + member-since from their latest active membership, and interaction counts. user_id is set when the customer has a linked account.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getCustomers(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const business = await this.businesses.findOne({ where: { ownerId: user.id } })
    if (!business) return { items: [], total: 0, limit: 50, offset: 0 }

    return this.customersService.getCustomers(
      business.id,
      limit ? Number(limit) : 50,
      offset ? Number(offset) : 0,
    )
  }

  @Get(':email/detail')
  @ApiOperation({
    summary: 'Get one customer in detail',
    description: 'Aggregated view of a single customer matched case-insensitively by email. Returns the enriched customer summary (same shape as the list, incl. derived status and membership tier) plus their appointments, reviews, card shares, business activity log and active membership block. 404 when the email has no interactions, account or membership with this business.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Business not found or customer not found' })
  @ApiBadRequestResponse({ description: 'Invalid email' })
  async getCustomerDetail(@CurrentUser() user: any, @Param('email') email: string) {
    const business = await this.businesses.findOne({ where: { ownerId: user.id } })
    if (!business) throw new NotFoundException('Business not found')

    return this.customersService.getCustomerDetail(business.id, decodeURIComponent(email))
  }

  // ---- Customer notes ----

  @Get(':email/notes')
  @ApiOperation({
    summary: 'List notes for a customer',
    description: 'Returns the private notes the authenticated user\'s business keeps about one customer (matched case-insensitively by email), newest first.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async listNotes(@CurrentUser() user: any, @Param('email') email: string) {
    const business = await this.businesses.findOne({ where: { ownerId: user.id } })
    if (!business) return { items: [], total: 0 }

    return this.customersService.listNotes(business.id, decodeURIComponent(email))
  }

  @Post(':email/notes')
  @ApiOperation({
    summary: 'Add a note for a customer',
    description: 'Creates a private note about one customer on behalf of the authenticated user. The customer does not need to have interacted with the business yet.',
  })
  @ApiCreatedResponse({ description: 'Note created' })
  @ApiBadRequestResponse({ description: 'Invalid email or empty note' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async createNote(@CurrentUser() user: any, @Param('email') email: string, @Body() body: CreateCustomerNoteDto) {
    const business = await this.businesses.findOne({ where: { ownerId: user.id } })
    if (!business) throw new NotFoundException('Business not found')

    return this.customersService.createNote(business.id, user.id, decodeURIComponent(email), body)
  }

  @Patch('notes/:noteId')
  @ApiOperation({
    summary: 'Update a customer note',
    description: 'Updates the text of a note belonging to the authenticated user\'s business.',
  })
  @ApiBadRequestResponse({ description: 'Empty note text' })
  @ApiNotFoundResponse({ description: 'Note not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateNote(@CurrentUser() user: any, @Param('noteId') noteId: string, @Body() body: UpdateCustomerNoteDto) {
    const business = await this.businesses.findOne({ where: { ownerId: user.id } })
    if (!business) throw new NotFoundException('Business not found')

    return this.customersService.updateNote(business.id, noteId, body)
  }

  @Delete('notes/:noteId')
  @ApiOperation({
    summary: 'Delete a customer note',
    description: 'Permanently deletes a note belonging to the authenticated user\'s business.',
  })
  @ApiNotFoundResponse({ description: 'Note not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async deleteNote(@CurrentUser() user: any, @Param('noteId') noteId: string) {
    const business = await this.businesses.findOne({ where: { ownerId: user.id } })
    if (!business) throw new NotFoundException('Business not found')

    return this.customersService.deleteNote(business.id, noteId)
  }
}
