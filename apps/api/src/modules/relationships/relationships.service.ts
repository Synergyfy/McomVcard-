import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserRelationship } from './entities/user-relationship.entity'
import { CreateRelationshipDto, RespondRelationshipDto } from './dto/relationship.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { RelationshipResponseDto } from './dto/relationship-response.dto'

@Injectable()
export class RelationshipsService {
  constructor(
    @InjectRepository(UserRelationship) private relationshipsRepo: Repository<UserRelationship>,
  ) {}

  async requestRelationship(userId: string, dto: CreateRelationshipDto) {
    if (dto.recipient_id === userId) throw new BadRequestException('Cannot create a relationship with yourself')

    // A pair may only have one relationship — check both directions
    const existing = await this.relationshipsRepo.findOne({
      where: [
        { requesterId: userId, recipientId: dto.recipient_id },
        { requesterId: dto.recipient_id, recipientId: userId },
      ],
    })

    if (existing) throw new BadRequestException('A relationship already exists between these users')

    const saved = await this.relationshipsRepo.save(
      this.relationshipsRepo.create({
        requesterId: userId,
        recipientId: dto.recipient_id,
        relationshipType: dto.relationship_type,
        status: 'pending',
      }),
    )

    return ApiResponse.success(RelationshipResponseDto.fromEntity(await this.findOne(saved.id, userId)), 'Relationship requested', 201)
  }

  async listMyRelationships(userId: string) {
    const relationships = await this.relationshipsRepo.find({
      where: [{ requesterId: userId }, { recipientId: userId }],
      relations: { requester: true, recipient: true },
      order: { createdAt: 'DESC' },
    })

    return ApiResponse.success(relationships.map((relationship) => RelationshipResponseDto.fromEntity(relationship)), 'Relationships retrieved', 200)
  }

  async getRelationship(userId: string, relationshipId: string) {
    const relationship = await this.relationshipsRepo.findOne({
      where: { id: relationshipId },
      relations: { requester: true, recipient: true },
    })

    if (!relationship) throw new NotFoundException('Relationship not found')

    if (relationship.requesterId !== userId && relationship.recipientId !== userId) {
      throw new ForbiddenException('You are not part of this relationship')
    }

    return ApiResponse.success(RelationshipResponseDto.fromEntity(relationship), 'Relationship retrieved', 200)
  }

  async respondToRelationship(userId: string, relationshipId: string, dto: RespondRelationshipDto) {
    const relationship = await this.relationshipsRepo.findOne({
      where: { id: relationshipId },
      relations: { requester: true, recipient: true },
    })

    if (!relationship) throw new NotFoundException('Relationship not found')

    if (relationship.recipientId !== userId) throw new ForbiddenException('Only the recipient can respond to this relationship')

    if (relationship.status !== 'pending') throw new BadRequestException('This relationship is no longer pending')

    await this.relationshipsRepo.update({ id: relationship.id }, { status: dto.status })

    const updated = await this.relationshipsRepo.findOne({
      where: { id: relationship.id },
      relations: { requester: true, recipient: true },
    })

    return ApiResponse.success(RelationshipResponseDto.fromEntity(updated!), 'Relationship updated', 200)
  }

  async removeRelationship(userId: string, relationshipId: string) {
    const relationship = await this.relationshipsRepo.findOne({ where: { id: relationshipId } })

    if (!relationship) throw new NotFoundException('Relationship not found')

    if (relationship.requesterId !== userId && relationship.recipientId !== userId) {
      throw new ForbiddenException('You are not part of this relationship')
    }

    await this.relationshipsRepo.delete({ id: relationship.id })

    return ApiResponse.message('Relationship removed', 200)
  }

  private async findOne(id: string, userId: string) {
    const relationship = await this.relationshipsRepo.findOne({
      where: { id },
      relations: { requester: true, recipient: true },
    })

    if (!relationship) throw new NotFoundException('Relationship not found')

    if (relationship.requesterId !== userId && relationship.recipientId !== userId) {
      throw new ForbiddenException('You are not part of this relationship')
    }

    return relationship
  }
}