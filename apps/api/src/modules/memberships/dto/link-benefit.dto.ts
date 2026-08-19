import { IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LinkBenefitDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e', description: 'Benefit to link to the tier' })
  @IsUUID()
  benefit_id: string
}