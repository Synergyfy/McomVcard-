import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { Role } from './role.entity'


@Entity({ name: 'user_roles' })
export class UserRole {
  @PrimaryColumn({ name: 'user_id' })
  userId!: string

  @PrimaryColumn({ name: 'role_id' })
  roleId!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @ManyToOne(() => User, (user) => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @ManyToOne(() => Role, (role) => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role!: Role
}
