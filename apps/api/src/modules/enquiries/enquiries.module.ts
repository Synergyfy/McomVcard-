import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Enquiry } from './entities/enquiry.entity'
import { EnquiriesService } from './enquiries.service'

@Module({
  imports: [TypeOrmModule.forFeature([Enquiry])],
  providers: [EnquiriesService],
  exports: [EnquiriesService],
})
export class EnquiriesModule {}
