import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AboutUs } from './entities/about-us.entity'
import { AboutUsService } from './about-us.service'

@Module({
  imports: [TypeOrmModule.forFeature([AboutUs])],
  providers: [AboutUsService],
  exports: [AboutUsService],
})
export class AboutUsModule {}
