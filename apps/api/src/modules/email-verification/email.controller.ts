import { Controller, Get, Post, Body, Param, UseGuards, HttpCode } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiOkResponse, ApiBadRequestResponse, ApiBearerAuth } from '@nestjs/swagger'
import { EmailVerificationService } from './email-verification.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { VerifyCodeDto } from './dto/verify-code.dto'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailVerificationService: EmailVerificationService) {}


  @Get('verify/:token')
  @ApiOperation({
    summary: 'Verify email via emailed link',
    description: 'Public endpoint. The token comes from the verification link sent by email; on success the user is marked verified.',
  })
  @ApiParam({ name: 'token', description: 'Signed verification token from the emailed link' })
  @ApiOkResponse({ description: 'Email verified' })
  @ApiBadRequestResponse({ description: 'Invalid/expired token or email already verified' })
  verifyLink(@Param('token') token: string) {
    return this.emailVerificationService.verifyLink(token)
  }


  @UseGuards(JwtAuthGuard)
  @Post('resend')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend verification email', description: 'Sends a fresh verification link to the authenticated user.' })
  @ApiOkResponse({ description: 'Verification email sent' })
  @ApiBadRequestResponse({ description: 'Email already verified' })
  resend(@CurrentUser() user: UserResponseDto) {
    return this.emailVerificationService.resendLink(user.id)
  }


  @UseGuards(JwtAuthGuard)
  @Post('send-token')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send 6-digit verification code', description: 'Sends a 6-digit one-time code to the authenticated user\'s email.' })
  @ApiOkResponse({ description: 'Verification code sent' })
  @ApiBadRequestResponse({ description: 'Email already verified' })
  sendToken(@CurrentUser() user: UserResponseDto) {
    return this.emailVerificationService.resendCode(user.id)
  }


  @UseGuards(JwtAuthGuard)
  @Post('verify-token')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify email with 6-digit code', description: 'Validates the code sent to the authenticated user\'s email and marks it verified.' })
  @ApiBody({ type: VerifyCodeDto, examples: { default: { summary: 'Verify', value: { token: '123456' } } } })
  @ApiOkResponse({ description: 'Email verified' })
  @ApiBadRequestResponse({ description: 'Invalid/expired code or email already verified' })
  verifyToken(@CurrentUser() user: UserResponseDto, @Body() body: VerifyCodeDto) {
    return this.emailVerificationService.verifyCode(user.id, body.token)
  }
}