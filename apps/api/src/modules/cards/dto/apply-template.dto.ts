import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class ApplyTemplateDto {
  @ApiProperty({ format: 'uuid', description: 'The published template to apply to the card' })
  @IsUUID()
  template_id!: string
}
