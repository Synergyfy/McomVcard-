import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { BusinessesModule } from '../businesses/businesses.module'
import { ReviewsController } from './reviews.controller'
import { ReviewsService } from './reviews.service'
import { Review } from './entities/review.entity'

@Module({
  imports: [AuthModule, BusinessesModule, TypeOrmModule.forFeature([Review])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}