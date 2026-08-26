import { PartialType } from '@nestjs/swagger'
import { CreateCashbackRuleDto } from './create-cashback-rule.dto'

export class UpdateCashbackRuleDto extends PartialType(CreateCashbackRuleDto) {}