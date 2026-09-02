import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FrontCms } from './entities/front-cms.entity'
import { FrontCmsService } from './front-cms.service'

@Module({
  imports: [TypeOrmModule.forFeature([FrontCms])],
  providers: [FrontCmsService],
  exports: [FrontCmsService],
})
export class CmsModule {}
