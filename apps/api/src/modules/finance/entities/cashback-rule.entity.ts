import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'cashback_rules' })
export class CashbackRule {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'numeric', precision: 5, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => Number(value),
  } })
  percentage!: number

  @Column({ name: 'minimum_amount', type: 'numeric', precision: 12, scale: 2, nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: string | null) => (value === null ? null : Number(value)),
  } })
  minimumAmount!: number | null

  @Column({ name: 'maximum_amount', type: 'numeric', precision: 12, scale: 2, nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: string | null) => (value === null ? null : Number(value)),
  } })
  maximumAmount!: number | null

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt!: Date | null

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt!: Date | null

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}