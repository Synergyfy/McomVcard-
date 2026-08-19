import { PartialType } from '@nestjs/swagger'
import { CreateBookingRuleDto } from './create-booking-rule.dto'

export class UpdateBookingRuleDto extends PartialType(CreateBookingRuleDto) {}