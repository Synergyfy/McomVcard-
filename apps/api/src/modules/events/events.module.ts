import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EventsService } from './events.service'
import { EventsController } from './events.controller'
import { Event } from './entities/event.entity'
import { EventTicket } from './entities/event-ticket.entity'
import { EventRegistration } from './entities/event-registration.entity'
import { BusinessesModule } from '../businesses/businesses.module'
import { CardsModule } from '../cards/cards.module'

@Module({
  imports: [
    BusinessesModule,
    CardsModule,
    TypeOrmModule.forFeature([Event, EventTicket, EventRegistration]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}