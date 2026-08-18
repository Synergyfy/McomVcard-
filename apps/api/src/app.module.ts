import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { validationSchema } from './lib/config/validation'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { HealthModule } from './modules/health/health.module'
import { AdminModule } from './modules/admin/admin.module'
import { APP_GUARD } from '@nestjs/core'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'mcomvcard',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // Disable synchronize in production regardless of TYPEORM_SYNC
      synchronize: process.env.NODE_ENV === 'production' ? false : process.env.TYPEORM_SYNC === 'true',
    }),
    ThrottlerModule.forRoot({ ttl: 60, limit: 20 }),
    AuthModule,
    UsersModule,
    HealthModule,
    AdminModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
