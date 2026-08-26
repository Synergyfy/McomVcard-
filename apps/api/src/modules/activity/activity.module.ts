import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { ActivityController } from './activity.controller'
import { ActivityService } from './activity.service'
import { ActivityLog } from './entities/activity-log.entity'
import { Business } from '../businesses/entities/business.entity'

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([ActivityLog, Business]),
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
