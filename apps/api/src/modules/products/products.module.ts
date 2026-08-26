import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { BusinessesModule } from '../businesses/businesses.module'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'
import { Product } from './entities/product.entity'
import { ProductImage } from './entities/product-image.entity'

@Module({
  imports: [
    AuthModule,
    BusinessesModule,
    TypeOrmModule.forFeature([Product, ProductImage]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}