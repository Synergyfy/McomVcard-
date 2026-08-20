import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { RelationshipsController } from './relationships.controller'
import { RelationshipsService } from './relationships.service'
import { UserRelationship } from './entities/user-relationship.entity'

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([UserRelationship]),
  ],
  controllers: [RelationshipsController],
  providers: [RelationshipsService],
  exports: [RelationshipsService],
})
export class RelationshipsModule {}