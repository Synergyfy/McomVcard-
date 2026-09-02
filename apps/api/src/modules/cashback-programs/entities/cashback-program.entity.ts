import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import { Business } from '../../businesses/entities/business.entity'

export enum CashbackProgramStatus {
  ACTIVE = 'active',
  OFF = 'off',
}

@Entity({ name: 'cashback_programs' })
@Index(['businessId'])
export class CashbackProgram {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'business_id', type: 'uuid' })
  businessId!: string

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business

  @Column({ length: 150 })
  title!: string

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  rate!: number

  @Column({ default: CashbackProgramStatus.ACTIVE })
  status!: CashbackProgramStatus

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  earned!: number

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}