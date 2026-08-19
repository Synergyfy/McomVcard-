import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { BusinessesModule } from '../businesses/businesses.module'
import { ServicesController } from './services.controller'
import { ServicesService } from './services.service'
import { Service } from './entities/service.entity'

@Module({
  imports: [
    AuthModule,
    BusinessesModule,
    TypeOrmModule.forFeature([Service]),
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}