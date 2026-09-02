import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateContactDto {
  @ApiProperty({ description: 'Sender name', example: 'John Doe' })
  @IsNotEmpty({ message: 'name is required' })
  @IsString()
  @MaxLength(100, { message: 'name must be at most 100 characters' })
  name!: string

  @ApiProperty({ description: 'Sender email', example: 'john@example.com' })
  @IsNotEmpty({ message: 'email is required' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MaxLength(255, { message: 'email must be at most 255 characters' })
  email!: string

  @ApiProperty({ description: 'Contact subject', example: 'General inquiry' })
  @IsNotEmpty({ message: 'subject is required' })
  @IsString()
  @MaxLength(200, { message: 'subject must be at most 200 characters' })
  subject!: string

  @ApiProperty({ description: 'Contact message', example: 'Hello, I would like to know more about your services.' })
  @IsNotEmpty({ message: 'message is required' })
  @IsString()
  @MaxLength(5000, { message: 'message must be at most 5000 characters' })
  message!: string
}