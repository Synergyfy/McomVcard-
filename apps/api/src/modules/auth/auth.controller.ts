import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common'
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
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { CurrentUser } from './current-user.decorator'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { ApiResponse } from '../../common/responses/api-response'
import { UserResponseDto } from '../users/dto/user-response.dto'

@ApiTags('auth')
@ApiExtraModels(ApiResponse, UserResponseDto)
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('login')
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
                user: { $ref: getSchemaPath(UserResponseDto) },
              },
            },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password)
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
                user: { $ref: getSchemaPath(UserResponseDto) },
              },
            },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Email already in use or invalid input' })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.email, body.password, body.firstName, body.lastName)
  }


  @Post('logout')
  @ApiOperation({ summary: 'Log out', description: 'Acknowledges logout. The client discards its token (stateless JWT).' })
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
  async logout() {
    return ApiResponse.message('Logged out')
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
