import { Controller, Post, Body, Req, Get, Headers, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'

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

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async user(@Req() req: any) {
    return req.user
  }
}
