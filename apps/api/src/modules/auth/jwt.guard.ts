import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const authHeader = req.headers['authorization'] || req.headers['Authorization']
    if (!authHeader) throw new UnauthorizedException()
    try {
      const user = await this.authService.getUserFromToken(Array.isArray(authHeader) ? authHeader[0] : authHeader)
      req.user = user
      return true
    } catch (err) {
      throw new UnauthorizedException()
    }
  }
}
