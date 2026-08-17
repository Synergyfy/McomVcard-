import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { ApiResponse } from '../../common/responses/api-response'
import { UserResponseDto } from '../users/dto/user-response.dto'
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}


  async register(email: string, password: string, name?: string) {
    email = email.trim().toLowerCase()

    const existing = await this.usersService.findByEmail(email)
    if (existing) throw new BadRequestException('Email already in use')

    const hashed = await bcrypt.hash(password, 10)
    const saved = await this.usersService.create({ email, password: hashed, name })

    const token = this.jwtService.sign({ user_id: saved.id })
    return ApiResponse.success({ token, user: UserResponseDto.fromEntity(saved) }, 'Registration successful')
  }


  async login(email: string, password: string) {
    email = email.trim().toLowerCase()

    const user = await this.usersService.findByEmail(email)
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const ok = await bcrypt.compare(password, user.password || '')
    if (!ok) throw new UnauthorizedException('Invalid credentials')

    const token = this.jwtService.sign({ user_id: user.id })
    return ApiResponse.success({ token, user: UserResponseDto.fromEntity(user) }, 'Login successful')
  }


  async getUserFromToken(token?: string) {
    if (!token) throw new UnauthorizedException()

    try {
      const decoded = this.jwtService.verify(token.replace(/^Bearer /, '')) as any
      const id = decoded.user_id

      const user = await this.usersService.findById(id)
      if (!user) throw new UnauthorizedException()

      return UserResponseDto.fromEntity(user)
    } catch (err) {
      throw new UnauthorizedException()
    }
  }
}
