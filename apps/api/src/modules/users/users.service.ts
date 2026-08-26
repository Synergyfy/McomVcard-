import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } })
  }

  findAll() {
    return this.usersRepo.find()
  }

  async update(id: string, patch: Partial<User>): Promise<User | null> {
    await this.usersRepo.update({ id }, patch)

    return this.findById(id)
  }

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } })
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepo.create(user as any)
    const saved = await this.usersRepo.save(newUser)
    if (Array.isArray(saved)) return saved[0] as User
    return saved as User
  }
}
