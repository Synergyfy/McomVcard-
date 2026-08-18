import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Role } from './entities/role.entity'
import { UserRole } from './entities/user-role.entity'
import { RolesService } from './roles.service'
import { RolesGuard } from './guards/roles.guard'


@Module({
  imports: [TypeOrmModule.forFeature([Role, UserRole])],
  providers: [RolesService, RolesGuard],
  exports: [RolesService, RolesGuard],
})
export class RolesModule {}
