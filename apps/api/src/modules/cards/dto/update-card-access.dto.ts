import { PartialType } from '@nestjs/swagger'
import { CreateCardAccessDto } from './create-card-access.dto'

export class UpdateCardAccessDto extends PartialType(CreateCardAccessDto) {}