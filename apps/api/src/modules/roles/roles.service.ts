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

  /**
   * Canonical Central Hub profile type → local role name.
   *
   * Central is the source of truth for who a user is. Customers must hold the
   * CUSTOMER role for the customer dashboard APIs to accept them; business and
   * admin identities keep their dedicated roles so the three dashboards never
   * cross over. Unknown/agent identities fall back to USER and gain no
   * dashboard-specific privileges.
   */
  canonicalRoleForProfile(profileType?: string | null): string {
    const normalized = String(profileType || '').trim().toUpperCase()
    const map: Record<string, string> = {
      CUSTOMER: 'CUSTOMER',
      BUSINESS: 'BUSINESS_OWNER',
      BUSINESS_OWNER: 'BUSINESS_OWNER',
      ADMIN: 'ADMIN',
      STAFF: 'STAFF',
    }
    return map[normalized] ?? DEFAULT_ROLE
  }

  /**
   * Ensure the canonical role exists, then grant it to the user. The default
   * USER role is kept (it is the base authenticated identity); the canonical
   * role is additive and is what the customer/business/admin guards check.
   */
  async syncCanonicalRole(userId: string, profileType?: string | null): Promise<string> {
    const roleName = this.canonicalRoleForProfile(profileType)
    await this.ensureRole(roleName)

    // A Central profile has exactly one dashboard identity. Drop the other
    // dashboard roles so an account that changed from CUSTOMER to BUSINESS (or
    // vice versa) cannot keep access to the dashboard it left behind.
    const dashboardRoles = ['CUSTOMER', 'BUSINESS_OWNER', 'STAFF']
    for (const other of dashboardRoles) {
      if (other === roleName) continue
      const role = await this.rolesRepo.findOne({ where: { name: other } })
      if (role) await this.userRolesRepo.delete({ userId, roleId: role.id })
    }

    await this.assignRoleByName(userId, roleName)
    return roleName
  }

  /** Idempotently ensure a named role exists. */
  async ensureRole(roleName: string, description?: string): Promise<Role> {
    return this.ensureDefaultRole(roleName, description)
  }


  async ensureDefaultRole(roleName: string = DEFAULT_ROLE, description?: string): Promise<Role> {
    const role = await this.rolesRepo.findOne({ where: { name: roleName } })
    if (role) return role

    const created = this.rolesRepo.create({ name: roleName, description: description ?? null })

    return this.rolesRepo.save(created)
  }

  async getAllRoles(): Promise<Role[]> {
    return this.rolesRepo.find({ order: { name: 'ASC' } })
  }

  async getRoleById(id: string): Promise<Role | null> {
    return this.rolesRepo.findOne({ where: { id } })
  }

  async getRoleByName(name: string): Promise<Role | null> {
    return this.rolesRepo.findOne({ where: { name } })
  }

  async createRole(name: string, description?: string): Promise<Role> {
    const existing = await this.rolesRepo.findOne({ where: { name } })
    if (existing) throw new BadRequestException('Role already exists')

    const role = this.rolesRepo.create({ name, description: description ?? null })
    return this.rolesRepo.save(role)
  }

  async updateRole(role: Role): Promise<Role> {
    return this.rolesRepo.save(role)
  }

  async deleteRole(id: string): Promise<void> {
    await this.rolesRepo.delete({ id })
  }
}
