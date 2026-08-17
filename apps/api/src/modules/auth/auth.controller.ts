import { Controller, Post, Body, Req, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { ApiResponse } from '../../common/responses/api-response'

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Log in with email and password' })
  @SwaggerResponse({ status: 200, description: 'Login successful, returns token and user' })
  @SwaggerResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password)
  }

  @Post('register')
  @ApiOperation({ summary: 'Create a new account' })
  @SwaggerResponse({ status: 201, description: 'Registration successful, returns token and user' })
  @SwaggerResponse({ status: 400, description: 'Email already in use or invalid input' })
  async register(@Body() body: RegisterDto) {
    return this.auth.register(body.email, body.password, body.name)
  }

  @Post('logout')
  @ApiOperation({ summary: 'Log out (client-side token discard; stateless JWT)' })
  @SwaggerResponse({ status: 200, description: 'Logout acknowledged' })
  async logout() {
    return ApiResponse.message('Logged out')
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @SwaggerResponse({ status: 200, description: 'Authenticated user' })
  @SwaggerResponse({ status: 401, description: 'Missing or invalid token' })
  async user(@Req() req: any) {
    return req.user
  }
}
