import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'currencies' })
export class Currency {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ unique: true, length: 3 })
  code!: string

  @Column()
  name!: string

  @Column()
  symbol!: string

  @Column({ name: 'is_active', default: true })
  isActive!: boolean

  @Column({ name: 'exchange_rate', type: 'numeric', precision: 12, scale: 6, default: 1.0 })
  exchangeRate!: number

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
