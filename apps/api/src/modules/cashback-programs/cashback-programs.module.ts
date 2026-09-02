import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BusinessesModule } from '../businesses/businesses.module'
import { CashbackProgramsService } from './cashback-programs.service'
import { CashbackProgramsController } from './cashback-programs.controller'
import { CashbackProgram } from './entities/cashback-program.entity'

@Module({
  imports: [TypeOrmModule.forFeature([CashbackProgram]), BusinessesModule],
  controllers: [CashbackProgramsController],
  providers: [CashbackProgramsService],
  exports: [CashbackProgramsService],
})
export class CashbackProgramsModule {}