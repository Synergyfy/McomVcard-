import { Controller, Post, Param, Body } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger'
import { CardsService } from './cards.service'
import { TrackCardEventDto } from './dto/track-card-event.dto'

/**
 * Public (unauthenticated) card endpoints.
 *
 * Deliberately NOT behind JwtAuthGuard — views/scans/shares happen when
 * anyone opens a shared card link (/c/:slug), usually logged out.
 * The global ThrottlerGuard still applies for basic rate limiting.
 */
@ApiTags('cards')
@Controller('cards/public')
export class CardsPublicController {
  constructor(private readonly cardsService: CardsService) {}

  @Post(':slug/track')
  @ApiOperation({
    summary: 'Track a public card event',
    description: 'Records a view, scan or share against a card by its public slug. No authentication required. Increments the card counters and appends an analytics event.',
  })
  @ApiBody({ type: TrackCardEventDto })
  @ApiOkResponse({ description: 'Event tracked' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  @ApiBadRequestResponse({ description: 'Invalid event type' })
  async track(@Param('slug') slug: string, @Body() body: TrackCardEventDto) {
    return this.cardsService.trackPublicEvent(slug, body.event)
  }
}
