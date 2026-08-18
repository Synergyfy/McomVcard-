import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { RolesModule } from '../roles/roles.module'
import { AdminController } from './admin.controller'


@Module({
  imports: [AuthModule, UsersModule, RolesModule],
  controllers: [AdminController],
})
export class AdminModule {}