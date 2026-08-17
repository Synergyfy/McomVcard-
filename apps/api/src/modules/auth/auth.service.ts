import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { QueryFailedError } from 'typeorm'
import { UsersService } from '../users/users.service'
import { ApiResponse } from '../../common/responses/api-response'
import { UserResponseDto } from '../users/dto/user-response.dto'
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'

const DUMMY_PASSWORD_HASH = '$2a$10$RF/CnYUA.cgdY7yxwC5m3ejBtM4Oqnj1Ka.LUGy7j29woMBj4B2HW'

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}


  async register(email: string, password: string, firstName?: string, lastName?: string) {
    email = email.trim().toLowerCase()

    const existing = await this.usersService.findByEmail(email)
    if (existing) throw new BadRequestException('Email already in use')

    const hashed = await bcrypt.hash(password, 10)

    try {
      const saved = await this.usersService.create({ email, password: hashed, firstName, lastName })

      const token = this.jwtService.sign({ user_id: saved.id })
      return ApiResponse.success({ token, user: UserResponseDto.fromEntity(saved) }, 'Registration successful')
    } catch (err) {
      // Concurrent registration with the same email hits the DB unique constraint
      if (this.isUniqueViolation(err)) throw new BadRequestException('Email already in use')

      throw err
    }
  }


  async login(email: string, password: string) {
    email = email.trim().toLowerCase()

    const user = await this.usersService.findByEmail(email)

    // Run a dummy compare when the user is missing so response timing is identical
    // for "unknown email" and "wrong password" (prevents user enumeration).
    if (!user) {
      await bcrypt.compare(password, DUMMY_PASSWORD_HASH)
      throw new UnauthorizedException('Invalid credentials')
    }

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


  private isUniqueViolation(err: unknown): boolean {
    if (err instanceof QueryFailedError) {
      const driverError = err.driverError as { code?: string } | undefined

      return driverError?.code === '23505'
    }

    return false
  }
}