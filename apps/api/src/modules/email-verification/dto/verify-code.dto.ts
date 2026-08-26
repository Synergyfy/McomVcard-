import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Matches } from 'class-validator'

export class VerifyCodeDto {
  @ApiProperty({ example: '123456', description: 'The 6-digit code received by email' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'token must be a 6-digit code' })
  token!: string
}