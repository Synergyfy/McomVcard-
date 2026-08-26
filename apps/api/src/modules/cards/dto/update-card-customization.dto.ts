import { PartialType } from '@nestjs/swagger'
import { CreateCardCustomizationDto } from './create-card-customization.dto'

export class UpdateCardCustomizationDto extends PartialType(CreateCardCustomizationDto) {}