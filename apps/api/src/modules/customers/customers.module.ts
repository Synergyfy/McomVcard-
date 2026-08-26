import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { CustomersController } from './customers.controller'
import { CustomersService } from './customers.service'
import { Appointment } from '../appointments/entities/appointment.entity'
import { Review } from '../reviews/entities/review.entity'
import { Share } from '../shares/entities/share.entity'
import { Business } from '../businesses/entities/business.entity'
import { Membership } from '../memberships/entities/membership.entity'
import { ActivityLog } from '../activity/entities/activity-log.entity'
import { User } from '../users/entities/user.entity'
import { CustomerNote } from './entities/customer-note.entity'

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Appointment, Review, Share, Business, Membership, ActivityLog, User, CustomerNote]),
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
