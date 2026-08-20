import { ApiProperty } from '@nestjs/swagger'
import { UserRelationship } from '../entities/user-relationship.entity'

export class RelationshipUserSummaryDto {
  @ApiProperty({ description: 'User ID', example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e' })
  id!: string

  @ApiProperty({ description: 'First name', example: 'Jane', nullable: true })
  first_name!: string | null

  @ApiProperty({ description: 'Last name', example: 'Doe', nullable: true })
  last_name!: string | null

  @ApiProperty({ description: 'Email', example: 'jane@example.com' })
  email!: string
}

export class RelationshipResponseDto {
  @ApiProperty({ description: 'Relationship ID', example: 'b9e0e8d4-6f1a-4c4e-9b1d-2c3d4e5f6a7b' })
  id!: string

  @ApiProperty({ description: 'Requester summary', type: RelationshipUserSummaryDto })
  requester!: RelationshipUserSummaryDto

  @ApiProperty({ description: 'Recipient summary', type: RelationshipUserSummaryDto })
  recipient!: RelationshipUserSummaryDto

  @ApiProperty({ description: 'Relationship type', enum: ['FAMILY', 'FRIEND', 'CHILD'], example: 'FRIEND' })
  relationship_type!: string

  @ApiProperty({ description: 'Relationship status', enum: ['pending', 'accepted', 'declined'], example: 'pending' })
  status!: string

  @ApiProperty({ description: 'Created at', example: '2026-08-19T09:00:00.000Z' })
  created_at!: string

  @ApiProperty({ description: 'Updated at', example: '2026-08-19T09:00:00.000Z' })
  updated_at!: string

  private static summarize(user: { id: string; firstName: string | null; lastName: string | null; email: string }): RelationshipUserSummaryDto {
    return { id: user.id, first_name: user.firstName, last_name: user.lastName, email: user.email }
  }

  static fromEntity(relationship: UserRelationship): RelationshipResponseDto {
    const dto = new RelationshipResponseDto()

    dto.id = relationship.id
    dto.requester = this.summarize(relationship.requester)
    dto.recipient = this.summarize(relationship.recipient)
    dto.relationship_type = relationship.relationshipType
    dto.status = relationship.status
    dto.created_at = relationship.createdAt instanceof Date ? relationship.createdAt.toISOString() : relationship.createdAt
    dto.updated_at = relationship.updatedAt instanceof Date ? relationship.updatedAt.toISOString() : relationship.updatedAt

    return dto
  }
}