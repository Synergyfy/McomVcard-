import { PartialType } from '@nestjs/swagger'
import { CreateCardProfileDto } from './create-card-profile.dto'

export class UpdateCardProfileDto extends PartialType(CreateCardProfileDto) {}