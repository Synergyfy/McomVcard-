import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UsersModule } from '../users/users.module'
import { MailModule } from '../mail/mail.module'
import { EmailVerificationService } from './email-verification.service'
import { EmailController } from './email.controller'
import { VerificationCode } from './entities/verification-code.entity'


@Module({
  imports: [
    UsersModule,
    MailModule,
    TypeOrmModule.forFeature([VerificationCode]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') || '1h' },
      }),
    }),
  ],
  providers: [EmailVerificationService],
  controllers: [EmailController],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
