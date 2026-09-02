import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { NewsletterCampaign } from './entities/newsletter-campaign.entity'
import { Subscriber } from './entities/subscriber.entity'
import { NewsletterService } from './newsletter.service'
import { SubscribersService } from './subscribers.service'

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([NewsletterCampaign, Subscriber]),
  ],
  providers: [NewsletterService, SubscribersService],
  exports: [NewsletterService, SubscribersService],
})
export class NewsletterModule {}
