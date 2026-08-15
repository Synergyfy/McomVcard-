import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  email: string

  @Column({ nullable: true })
  name: string

  @Column({ nullable: true })
  password: string

  @Column({ default: false })
  isAdmin: boolean

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
