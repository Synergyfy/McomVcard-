import { User } from '../entities/user.entity'

export class UserResponseDto {
  id!: number

  email!: string

  name!: string | null

  is_admin!: boolean

  created_at!: Date

  updated_at!: Date

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto()

    dto.id = user.id
    dto.email = user.email
    dto.name = user.name ?? null
    dto.is_admin = user.isAdmin
    dto.created_at = user.createdAt
    dto.updated_at = user.updatedAt

    return dto
  }
}
