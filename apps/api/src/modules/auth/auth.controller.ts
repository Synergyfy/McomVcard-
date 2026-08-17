import { Controller, Post, Body, Get, UseGuards, HttpCode, Req } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger'
import { Request } from 'express'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { CurrentUser } from './current-user.decorator'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { LogoutDto } from './dto/logout.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'

@ApiTags('auth')
@ApiExtraModels(ApiResponse, UserResponseDto)
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Log in with email and password', description: 'Returns a JWT token and the authenticated user.' })
  @ApiBody({
    type: LoginDto,
    examples: {
      admin: {
        summary: 'Admin login',
        value: { email: 'admin@example.com', password: 'secret123' },
      },
      user: {
        summary: 'Regular user login',
        value: { email: 'user@example.com', password: 'secret123' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Login successful, returns token and user',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMzYwMH0.signature',
                },
                refresh_token: {
                  type: 'string',
                  example: 'opaque-random-refresh-token',
                  description: 'Single-use refresh token; exchange it at POST /api/refresh',
                },
                user: { $ref: getSchemaPath(UserResponseDto) },
              },
            },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Req() req: Request, @Body() body: LoginDto) {
    return this.authService.login(body.email, body.password, {
      userAgent: req.get('user-agent'),
      ip: req.ip,
    })
  }


  @Post('register')
  @ApiOperation({ summary: 'Create a new account', description: 'Creates a user, hashes the password, and returns a JWT token plus the user.' })
  @ApiBody({
    type: RegisterDto,
    examples: {
      default: {
        summary: 'New user registration',
        value: { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', password: 'secret123' },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Registration successful, returns token and user',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMzYwMH0.signature' },
                refresh_token: { type: 'string', example: 'opaque-random-refresh-token' },
                user: { $ref: getSchemaPath(UserResponseDto) },
              },
            },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Email already in use or invalid input' })
  async register(@Req() req: Request, @Body() body: RegisterDto) {
    return this.authService.register(body.email, body.password, body.firstName, body.lastName, {
      userAgent: req.get('user-agent'),
      ip: req.ip,
    })
  }


  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Exchange a refresh token for a new access token',
    description: 'Validates the refresh token, revokes it (rotation), and returns a fresh access token plus a new refresh token.',
  })
  @ApiBody({
    type: RefreshTokenDto,
    examples: {
      default: {
        summary: 'Refresh session',
        value: { refresh_token: 'opaque-random-refresh-token' },
      },
    },
  })
  @ApiOkResponse({
    description: 'New access + refresh token pair with the user',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMzYwMH0.signature' },
                refresh_token: { type: 'string', example: 'new-opaque-refresh-token' },
                user: { $ref: getSchemaPath(UserResponseDto) },
              },
            },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid, expired, or reused refresh token' })
  async refresh(@Req() req: Request, @Body() body: RefreshTokenDto) {
    return this.authService.refresh(body.refresh_token, {
      userAgent: req.get('user-agent'),
      ip: req.ip,
    })
  }


  @Post('logout')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Log out',
    description: 'Revokes the supplied refresh token (if any). The access token is short-lived and simply expires.',
  })
  @ApiBody({ type: LogoutDto, required: false })
  @ApiOkResponse({
    description: 'Logout acknowledged',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            message: { type: 'string', example: 'Logged out' },
          },
        },
      ],
    },
  })
  async logout(@Body() body: LogoutDto) {
    return this.authService.logout(body.refresh_token)
  }


  @UseGuards(JwtAuthGuard)
  @Get('user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated user profile', description: 'Requires a Bearer token. Returns the profile of the currently authenticated user.' })
  @ApiOkResponse({
    description: 'Authenticated user',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(UserResponseDto) },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async user(@CurrentUser() user: UserResponseDto) {
    return user
  }
}
