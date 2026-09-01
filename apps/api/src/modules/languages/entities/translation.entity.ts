import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Language } from './language.entity'


@Entity({ name: 'translations' })
export class Translation {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'language_id', type: 'uuid' })
  languageId!: string

  @ManyToOne(() => Language, (language) => language.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'language_id' })
  language!: Language

  @Column()
  key!: string

  @Column({ type: 'text' })
  value!: string

  @Column({ type: 'text', nullable: true })
  context!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
