import { Controller, Post, Body, Req, Get, Headers } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller()
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password)
  }

  @Post('register')
  async register(@Body() body: { email: string; password: string; name?: string }) {
    return this.auth.register(body.email, body.password, body.name)
  }

  @Post('logout')
  async logout() {
    return { ok: true }
  }

  @Get('user')
  async user(@Headers('authorization') authHeader?: string) {
    return this.auth.getUserFromToken(authHeader)
  }
}
