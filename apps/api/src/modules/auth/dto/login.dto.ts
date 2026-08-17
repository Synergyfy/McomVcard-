import { Transform } from 'class-transformer'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'User email address',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'secret123',
    description: 'Account password (min 6 characters)',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string
}
