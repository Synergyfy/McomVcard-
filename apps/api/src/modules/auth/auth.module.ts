import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from '../users/users.module'
import { MailModule } from '../mail/mail.module'
import { EmailVerificationModule } from '../email-verification/email-verification.module'
import { RolesModule } from '../roles/roles.module'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtStrategy } from './jwt.strategy'
import { JwtAuthGuard } from './jwt-auth.guard'
import { RefreshToken } from './entities/refresh-token.entity'


@Module({
  imports: [
    UsersModule,
    MailModule,
    EmailVerificationModule,
    RolesModule,
    TypeOrmModule.forFeature([RefreshToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') || '1h' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
