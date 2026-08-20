import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { UserRole } from '../../roles/entities/user-role.entity'
import { Membership } from '../../memberships/entities/membership.entity'
import { Wallet } from '../../finance/entities/wallet.entity'
import { RewardBalance } from '../../finance/entities/reward-balance.entity'
import { CashbackAccount } from '../../finance/entities/cashback-account.entity'
import { UserRelationship } from '../../relationships/entities/user-relationship.entity'
import { ChildCard } from '../../child-cards/entities/child-card.entity'
import { Wishlist } from '../../wishlists/entities/wishlist.entity'

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ unique: true })
  email!: string

  @Column({ name: 'password_hash' })
  passwordHash!: string

  @Column({ name: 'first_name', nullable: true })
  firstName!: string | null

  @Column({ name: 'last_name', nullable: true })
  lastName!: string | null

  @Column({ nullable: true })
  phone!: string | null

  @Column({ default: 'active' })
  status!: string

  @Column({ name: 'is_verified', default: false })
  isVerified!: boolean

  @Column({ name: 'email_verified_at', type: 'timestamptz', nullable: true })
  emailVerifiedAt!: Date | null

  @Column({ default: 'en' })
  language!: string

  @Column({ name: 'theme_mode', default: 'light' })
  themeMode!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles!: UserRole[]

  @OneToMany(() => Membership, (membership) => membership.user)
  memberships!: Membership[]

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallet!: Wallet[]

  @OneToMany(() => RewardBalance, (rewardBalance) => rewardBalance.user)
  rewardBalance!: RewardBalance[]

  @OneToMany(() => CashbackAccount, (cashbackAccount) => cashbackAccount.user)
  cashbackAccount!: CashbackAccount[]

  @OneToMany(() => UserRelationship, (relationship) => relationship.requester)
  sentRelationships!: UserRelationship[]

  @OneToMany(() => UserRelationship, (relationship) => relationship.recipient)
  receivedRelationships!: UserRelationship[]

  @OneToMany(() => ChildCard, (childCard) => childCard.child)
  childCards!: ChildCard[]

  @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
  wishlists!: Wishlist[]
}