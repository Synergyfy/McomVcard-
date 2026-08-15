import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../users/entities/user.entity'
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const existing = await this.usersRepo.findOne({ where: { email } })
    if (existing) throw new BadRequestException('Email already in use')
    const hashed = await bcrypt.hash(password, 10)
    const user = this.usersRepo.create({ email, password: hashed, name })
    const saved = await this.usersRepo.save(user)
    const token = this.jwtService.sign({ userId: saved.id })
    return { token, user: this.sanitize(saved) }
  }

  async login(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email } })
    if (!user) throw new UnauthorizedException('Invalid credentials')
    const ok = await bcrypt.compare(password, user.password || '')
    if (!ok) throw new UnauthorizedException('Invalid credentials')
    const token = this.jwtService.sign({ userId: user.id })
    return { token, user: this.sanitize(user) }
  }

  async getUserFromToken(token?: string) {
    if (!token) throw new UnauthorizedException()
    try {
      const decoded = this.jwtService.verify(token.replace(/^Bearer /, '')) as any
      const id = decoded.userId
      const user = await this.usersRepo.findOne({ where: { id } })
      if (!user) throw new UnauthorizedException()
      return this.sanitize(user)
    } catch (err) {
      throw new UnauthorizedException()
    }
  }

  sanitize(user: User) {
    const { password, ...rest } = user as any
    return rest as Partial<User>
  }
}
