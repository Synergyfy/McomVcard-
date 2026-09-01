import { IsString, IsOptional, IsEmail, IsIn, IsNotEmpty, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateSubscriberDto {
  @ApiProperty({ example: 'subscriber@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string
}

export class UpdateSubscriberDto {
  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsIn(['active', 'unsubscribed'])
  status?: string
}
