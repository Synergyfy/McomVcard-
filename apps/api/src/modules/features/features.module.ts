import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Feature } from './entities/feature.entity'
import { FeaturesService } from './features.service'

@Module({
  imports: [TypeOrmModule.forFeature([Feature])],
  providers: [FeaturesService],
  exports: [FeaturesService],
})
export class FeaturesModule {}
