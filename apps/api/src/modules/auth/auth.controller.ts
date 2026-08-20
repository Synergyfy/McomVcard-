import { Controller, Post, Body, Get, UseGuards, HttpCode, Req, Put, Res } from '@nestjs/common'
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
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { CurrentUser } from './current-user.decorator'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { LogoutDto } from './dto/logout.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { setRefreshTokenCookie, clearRefreshTokenCookie, getRefreshTokenCookie } from '../../lib/utils/refresh-cookie.util'

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
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() body: LoginDto) {
    const result = await this.authService.login(body.email, body.password, {
      userAgent: req.get('user-agent'),
      ip: req.ip,
    })

    setRefreshTokenCookie(res, result.data.refresh_token, this.authService.refreshTokenTtl())

    return result
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
  async register(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() body: RegisterDto) {
    const result = await this.authService.register(body.email, body.password, body.firstName, body.lastName, {
      userAgent: req.get('user-agent'),
      ip: req.ip,
    })

    setRefreshTokenCookie(res, result.data.refresh_token, this.authService.refreshTokenTtl())

    return result
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
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() body: RefreshTokenDto) {
    const cookieToken = getRefreshTokenCookie(req)
    const refreshToken = cookieToken ?? body.refresh_token

    const result = await this.authService.refresh(refreshToken, {
      userAgent: req.get('user-agent'),
      ip: req.ip,
    })

    setRefreshTokenCookie(res, result.data.refresh_token, this.authService.refreshTokenTtl())

    return result
  }


  @Post('logout')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Log out',
    description: 'Revokes the refresh token (from the HttpOnly cookie or request body) and clears the cookie. The access token is short-lived and simply expires.',
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
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() body: LogoutDto) {
    const cookieToken = getRefreshTokenCookie(req)

    await this.authService.logout(cookieToken ?? body.refresh_token)

    clearRefreshTokenCookie(res)

    return ApiResponse.message('Logged out', 200)
  }


  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Request a password reset link',
    description: 'Emails a password reset link to the account (dev: logged instead of sent). Always returns the same message to prevent account enumeration.',
  })
  @ApiBody({
    type: ForgotPasswordDto,
    examples: {
      default: {
        summary: 'Forgot password request',
        value: { email: 'admin@example.com' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Reset link dispatched (if the account exists)',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            message: { type: 'string', example: 'If an account exists for that email, a password reset link has been sent' },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid email' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email)
  }


  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reset the password using the emailed token',
    description: 'Verifies the reset token, updates the password, and revokes all active sessions.',
  })
  @ApiBody({
    type: ResetPasswordDto,
    examples: {
      default: {
        summary: 'Reset password',
        value: { email: 'admin@example.com', token: 'reset-token-from-link', password: 'newSecret123', password_confirmation: 'newSecret123' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Password reset successful',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            message: { type: 'string', example: 'Password has been reset. You can now log in.' },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid/expired token or passwords do not match' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.email, body.token, body.password, body.password_confirmation)
  }


  @UseGuards(JwtAuthGuard)
  @Put('password')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change the authenticated user password',
    description: 'Requires the current password. On success, all existing sessions are revoked.',
  })
  @ApiBody({
    type: ChangePasswordDto,
    examples: {
      default: {
        summary: 'Change password',
        value: { current_password: 'secret123', password: 'newSecret123', password_confirmation: 'newSecret123' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Password changed successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            message: { type: 'string', example: 'Password changed successfully' },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiBadRequestResponse({ description: 'Current password is incorrect or passwords do not match' })
  async changePassword(@CurrentUser() user: UserResponseDto, @Body() body: ChangePasswordDto) {
    return this.authService.changePassword(user.id, body.current_password, body.password, body.password_confirmation)
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


  @UseGuards(JwtAuthGuard)
  @Get('user/roles')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated user roles', description: 'Requires a Bearer token. Returns the roles assigned to the currently authenticated user.' })
  @ApiOkResponse({
    description: 'Authenticated user roles',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                roles: {
                  type: 'array',
                  items: { type: 'string', example: 'USER' },
                },
              },
            },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async userRoles(@CurrentUser() user: UserResponseDto & { roles: string[] }) {
    return ApiResponse.success({ roles: user.roles ?? [] }, 'User roles', 200)
  }
}
