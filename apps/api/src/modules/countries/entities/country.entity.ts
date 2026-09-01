import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

@Entity({ name: 'countries' })
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 10, unique: true })
  code!: string

  @Column({ type: 'varchar', length: 200 })
  name!: string

  @Column({ type: 'varchar', length: 10, name: 'phone_code' })
  phoneCode!: string

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'flag_emoji' })
  flagEmoji!: string | null

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
