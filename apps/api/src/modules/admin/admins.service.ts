import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/entities/user.entity'
import { UserRole } from '../roles/entities/user-role.entity'
import { Role } from '../roles/entities/role.entity'
import { AdminPaginatedQueryDto, PaginatedResult } from './dto/admin-paginated-query.dto'

export interface AdminUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  status: string
  createdAt: Date
  roles: string[]
}

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async listAdmins(query: AdminPaginatedQueryDto): Promise<PaginatedResult<AdminUser>> {
    const { page = 1, limit = 20, search } = query

    const qb = this.userRepository
      .createQueryBuilder('u')
      .innerJoin('u.userRoles', 'ur')
      .innerJoin('ur.role', 'r')
      .where('r.name = :roleName', { roleName: 'ADMIN' })

    if (search) {
      qb.andWhere('(u.email ILIKE :search OR u.first_name ILIKE :search OR u.last_name ILIKE :search)', {
        search: `%${search}%`,
      })
    }

    const [users, total] = await qb
      .orderBy('u.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    const admins: AdminUser[] = users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      status: u.status,
      createdAt: u.createdAt,
      roles: (u.userRoles ?? []).map((ur: any) => ur.role?.name).filter(Boolean),
    }))

    return {
      data: admins,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string): Promise<AdminUser> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    const roles = (user.userRoles ?? [])
      .map((ur) => ur.role?.name)
      .filter(Boolean) as string[]

    if (!roles.includes('ADMIN')) {
      throw new NotFoundException('User is not an admin')
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      createdAt: user.createdAt,
      roles,
    }
  }
}
