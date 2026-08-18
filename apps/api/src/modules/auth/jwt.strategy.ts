import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { UsersService } from '../users/users.service'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService, private users: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    })
  }

  async validate(payload: any) {
    const user = await this.users.findById(payload.user_id)
    if (!user) throw new UnauthorizedException('User not found')

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is deactivated')
    }

    return { ...UserResponseDto.fromEntity(user), roles: Array.isArray(payload.roles) ? payload.roles : [] }
  }
}
