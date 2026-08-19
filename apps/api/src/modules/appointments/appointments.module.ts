import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { BusinessesModule } from '../businesses/businesses.module'
import { ServicesModule } from '../services/services.module'
import { AppointmentsController } from './appointments.controller'
import { AppointmentsService } from './appointments.service'
import { Appointment } from './entities/appointment.entity'
import { Availability } from './entities/availability.entity'
import { BookingRule } from './entities/booking-rule.entity'

@Module({
  imports: [
    AuthModule,
    BusinessesModule,
    ServicesModule,
    TypeOrmModule.forFeature([Appointment, Availability, BookingRule]),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}