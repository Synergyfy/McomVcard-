import { IsString, MaxLength, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ChangePasswordDto {
  @ApiProperty({
    example: 'secret123',
    description: 'Current account password',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  current_password: string

  @ApiProperty({
    example: 'newSecret123',
    description: 'New account password (min 6 characters)',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string

  @ApiProperty({
    example: 'newSecret123',
    description: 'Must match the new password',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password_confirmation: string
}