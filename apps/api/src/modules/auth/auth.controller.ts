import { Controller, Post, Body, Req, Get, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Controller()
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password)
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
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
