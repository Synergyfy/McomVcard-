import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

@Entity({ name: 'subscribers' })
@Index(['email'], { unique: true })
export class Subscriber {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string

  @Column({ type: 'varchar', length: 200, nullable: true })
  name!: string | null

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string

  @Column({ type: 'timestamptz', default: () => 'now()', name: 'subscribed_at' })
  subscribedAt!: Date

  @Column({ type: 'timestamptz', nullable: true, name: 'unsubscribed_at' })
  unsubscribedAt!: Date | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
