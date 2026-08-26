import { ApiProperty } from '@nestjs/swagger'
import { MaxLength, MinLength } from 'class-validator'

export class CreateCustomerNoteDto {
  @ApiProperty({ example: 'Prefers oat milk, always tips well.', description: 'The note text' })
  @MinLength(1)
  @MaxLength(2000)
  note!: string
}
