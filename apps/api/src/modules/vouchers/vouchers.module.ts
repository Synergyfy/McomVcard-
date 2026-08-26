import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { VoucherVendorsController } from './voucher-vendors.controller'
import { VouchersController } from './vouchers.controller'
import { VouchersService } from './vouchers.service'
import { VoucherVendor } from './entities/voucher-vendor.entity'
import { Voucher } from './entities/voucher.entity'
import { VoucherTransaction } from './entities/voucher-transaction.entity'

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([VoucherVendor, Voucher, VoucherTransaction]),
  ],
  controllers: [VoucherVendorsController, VouchersController],
  providers: [VouchersService],
  exports: [VouchersService],
})
export class VouchersModule {}