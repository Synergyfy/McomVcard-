import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@centralhubsolution.com', description: 'Admin account email address' })
  @IsEmail({}, { message: 'A valid email address is required' })
  email!: string

  @ApiProperty({ example: 'AdminPass2026!', description: 'Admin account password (minimum 8 characters)' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string
}
