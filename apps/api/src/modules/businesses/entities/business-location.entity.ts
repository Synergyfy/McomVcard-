import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Business } from './business.entity'

@Entity({ name: 'business_locations' })
export class BusinessLocation {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'business_id', type: 'uuid' })
  businessId!: string

  @ManyToOne(() => Business, (business) => business.locations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business

  @Column({ nullable: true })
  address!: string | null

  @Column({ nullable: true })
  city!: string | null

  @Column({ nullable: true })
  state!: string | null

  @Column({ nullable: true })
  country!: string | null

  @Column({ name: 'latitude', type: 'double precision', nullable: true })
  latitude!: number | null

  @Column({ name: 'longitude', type: 'double precision', nullable: true })
  longitude!: number | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}