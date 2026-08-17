import { ApiProperty } from '@nestjs/swagger'
import { User } from '../entities/user.entity'

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id!: number

  @ApiProperty({ example: 'admin@example.com' })
  email!: string

  @ApiProperty({ example: 'John', nullable: true })
  firstName!: string | null

  @ApiProperty({ example: 'Doe', nullable: true })
  lastName!: string | null

  @ApiProperty({ example: true })
  is_admin!: boolean

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at!: Date

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updated_at!: Date

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto()

    dto.id = user.id
    dto.email = user.email
    dto.firstName = user.firstName ?? null
    dto.lastName = user.lastName ?? null
    dto.is_admin = user.isAdmin
    dto.created_at = user.createdAt
    dto.updated_at = user.updatedAt

    return dto
  }
}