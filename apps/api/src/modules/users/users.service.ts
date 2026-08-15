import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  findById(id: number) {
    return this.usersRepo.findOne({ where: { id } })
  }

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } })
  }

  async create(user: Partial<User>): Promise<User> {
    const u = this.usersRepo.create(user as any)
    const saved = await this.usersRepo.save(u)
    if (Array.isArray(saved)) return saved[0] as User
    return saved as User
  }
}
