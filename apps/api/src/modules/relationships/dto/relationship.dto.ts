import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsUUID } from 'class-validator'

export class CreateRelationshipDto {
  @ApiProperty({ description: 'Recipient user ID', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  @IsUUID('4', { message: 'recipient_id must be a valid UUID' })
  recipient_id!: string

  @ApiProperty({ description: 'Relationship type', enum: ['FAMILY', 'FRIEND', 'CHILD'], example: 'FRIEND' })
  @IsIn(['FAMILY', 'FRIEND', 'CHILD'], { message: 'relationship_type must be FAMILY, FRIEND, or CHILD' })
  relationship_type!: 'FAMILY' | 'FRIEND' | 'CHILD'
}

export class RespondRelationshipDto {
  @ApiProperty({ description: 'New status (recipient accepts or declines)', enum: ['accepted', 'declined'], example: 'accepted' })
  @IsIn(['accepted', 'declined'], { message: 'status must be accepted or declined' })
  status!: 'accepted' | 'declined'
}