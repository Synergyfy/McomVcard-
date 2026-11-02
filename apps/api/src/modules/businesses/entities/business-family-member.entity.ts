import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Business } from './business.entity'

export type BusinessFamilyStatus = 'allocated' | 'active' | 'suspended' | 'removed'

@Entity({ name: 'business_family_members' })
export class BusinessFamilyMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'business_id', type: 'uuid' })
  businessId!: string

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business

  @Column({ type: 'varchar', length: 255 }) name!: string
  @Column({ type: 'varchar', length: 255, nullable: true }) email!: string | null
  @Column({ type: 'text', nullable: true }) phone!: string | null
  @Column({ type: 'varchar', length: 40, default: 'Family' }) relationship!: string
  @Column({ type: 'text', nullable: true }) avatar!: string | null
  @Column({ type: 'varchar', length: 20, default: 'allocated' }) status!: BusinessFamilyStatus

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date
}
