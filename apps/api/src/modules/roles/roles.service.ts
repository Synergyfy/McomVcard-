import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Role } from './entities/role.entity'
import { UserRole } from './entities/user-role.entity'


const DEFAULT_ROLE = 'USER'

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private rolesRepo: Repository<Role>,
    @InjectRepository(UserRole) private userRolesRepo: Repository<UserRole>,
  ) {}


  async getRoleNamesForUser(userId: string): Promise<string[]> {
    const rows = await this.userRolesRepo.find({ where: { userId }, relations: { role: true } })

    return rows.map((row) => row.role.name)
  }


  async assignRoleByName(userId: string, roleName: string): Promise<void> {
    const role = await this.rolesRepo.findOne({ where: { name: roleName } })
    if (!role) throw new BadRequestException(`Role "${roleName}" does not exist`)

    const existing = await this.userRolesRepo.findOne({ where: { userId, roleId: role.id } })
    if (existing) return

    await this.userRolesRepo.save(this.userRolesRepo.create({ userId, roleId: role.id }))
  }


  // Registration always grants the default role; the server controls assignment.
  async assignDefaultRole(userId: string): Promise<void> {
    await this.assignRoleByName(userId, DEFAULT_ROLE)
  }


  async ensureDefaultRole(roleName: string = DEFAULT_ROLE, description?: string): Promise<Role> {
    const role = await this.rolesRepo.findOne({ where: { name: roleName } })
    if (role) return role

    const created = this.rolesRepo.create({ name: roleName, description: description ?? null })

    return this.rolesRepo.save(created)
  }
}
