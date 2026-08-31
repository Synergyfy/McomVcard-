import { ApiProperty } from '@nestjs/swagger'
import { User } from '../entities/user.entity'

export class UserBasicResponseDto {
  @ApiProperty({ example: 'd36e1d51-2c53-4b8c-9e6c-4f1b2a3c4d5e', description: 'UUID of the user' })
  id!: string

  @ApiProperty({ example: 'John' })
  name!: string

  @ApiProperty({ example: 'john@example.com' })
  email!: string

  @ApiProperty({ example: 'active' })
  status!: string

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at!: string

  static fromEntity(user: User): UserBasicResponseDto {
    const dto = new UserBasicResponseDto()

    dto.id = user.id
    dto.name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    dto.email = user.email
    dto.status = user.status
    dto.created_at = user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt

    return dto
  }
}
