import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { BusinessesController } from './businesses.controller'
import { BusinessesService } from './businesses.service'
import { Business } from './entities/business.entity'
import { BusinessCategory } from './entities/business-category.entity'
import { BusinessLocation } from './entities/business-location.entity'
import { BusinessHour } from './entities/business-hour.entity'
import { Brand } from './entities/brand.entity'

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Business, BusinessCategory, BusinessLocation, BusinessHour, Brand]),
  ],
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService],
})
export class BusinessesModule {}