import { PartialType } from '@nestjs/swagger'
import { CreateCashbackProgramDto } from './create-cashback-program.dto'

export class UpdateCashbackProgramDto extends PartialType(CreateCashbackProgramDto) {}