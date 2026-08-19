import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { BusinessCategory } from './business-category.entity'
import { BusinessLocation } from './business-location.entity'
import { BusinessHour } from './business-hour.entity'
import { Brand } from './brand.entity'
import { Service } from '../../services/entities/service.entity'
import { Product } from '../../products/entities/product.entity'

@Entity({ name: 'businesses' })
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner!: User

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId!: string | null

  @ManyToOne(() => BusinessCategory, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category!: BusinessCategory | null

  @Column()
  name!: string

  @Column({ unique: true })
  slug!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ nullable: true })
  email!: string | null

  @Column({ nullable: true })
  phone!: string | null

  @Column({ nullable: true })
  website!: string | null

  @Column({ default: 'active' })
  status!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date

  @OneToMany(() => BusinessLocation, (location) => location.business)
  locations!: BusinessLocation[]

  @OneToMany(() => BusinessHour, (hour) => hour.business)
  hours!: BusinessHour[]

  @OneToMany(() => Brand, (brand) => brand.business)
  brands!: Brand[]

  @OneToMany(() => Service, (service) => service.business)
  services!: Service[]

  @OneToMany(() => Product, (product) => product.business)
  products!: Product[]
}