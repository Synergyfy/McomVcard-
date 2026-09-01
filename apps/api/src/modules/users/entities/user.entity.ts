import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { UserRole } from '../../roles/entities/user-role.entity'
import { Membership } from '../../memberships/entities/membership.entity'
import { Wallet } from '../../finance/entities/wallet.entity'
import { RewardBalance } from '../../finance/entities/reward-balance.entity'
import { CashbackAccount } from '../../finance/entities/cashback-account.entity'
import { UserRelationship } from '../../relationships/entities/user-relationship.entity'
import { ChildCard } from '../../child-cards/entities/child-card.entity'
import { Wishlist } from '../../wishlists/entities/wishlist.entity'
import { Affiliate } from '../../affiliates/entities/affiliate.entity'

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

  @Column({ type: 'text', nullable: true })
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

  // ── MCOM Solutions Central Hub SSO/billing linkage ──
  // Nullable when the account was created through local email/password auth.
  @Column({ name: 'mcom_user_id', type: 'varchar', nullable: true })
  mcomUserId!: string | null

  @Column({ name: 'mcom_membership_level', type: 'varchar', nullable: true })
  mcomMembershipLevel!: string | null

  @Column({ name: 'mcom_membership_tier', type: 'varchar', nullable: true })
  mcomMembershipTier!: string | null

  @Column({ name: 'mcom_membership_status', type: 'varchar', nullable: true })
  mcomMembershipStatus!: string | null

  @Column({ name: 'mcom_can_access_vcard', type: 'boolean', default: false })
  mcomCanAccessVcard!: boolean

  // Central OAuth tokens, encrypted at rest (see lib/utils/mcom-crypto.util).
  @Column({ name: 'mcom_access_token', type: 'text', nullable: true })
  mcomAccessToken!: string | null

  @Column({ name: 'mcom_refresh_token', type: 'text', nullable: true })
  mcomRefreshToken!: string | null

  @Column({ name: 'mcom_token_expires_at', type: 'timestamptz', nullable: true })
  mcomTokenExpiresAt!: Date | null

  @Column({ name: 'mcom_tokens_updated_at', type: 'timestamptz', nullable: true })
  mcomTokensUpdatedAt!: Date | null

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

  @OneToMany(() => Affiliate, (affiliate) => affiliate.user)
  affiliate!: Affiliate[]
}