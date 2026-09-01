import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { CouponCode } from './entities/coupon-code.entity'
import { CouponCodesService } from './coupon-codes.service'

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([CouponCode]),
  ],
  providers: [CouponCodesService],
  exports: [CouponCodesService],
})
export class CouponCodesModule {}
