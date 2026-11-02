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
import type { McomAccessDecision } from '../../mcom/access-decision'

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ unique: true })
  email!: string

  @Column({ name: 'password_hash' })
  passwordHash!: string

  @Column({ name: 'first_name', type: 'text', nullable: true })
  firstName!: string | null

  @Column({ name: 'last_name', type: 'text', nullable: true })
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

  // ── Canonical central identity snapshot ──
  // Central Hub Solution is the source of truth for these fields; they are
  // refreshed on every SSO login/sync. Local copies exist so the app can render
  // without a round trip to Central.
  @Column({ name: 'mcom_role', type: 'varchar', nullable: true })
  mcomRole!: string | null

  @Column({ name: 'mcom_profile_type', type: 'varchar', nullable: true })
  mcomProfileType!: string | null

  @Column({ name: 'is_affiliate', type: 'boolean', default: false })
  isAffiliate!: boolean

  @Column({ name: 'job_title', type: 'varchar', nullable: true })
  jobTitle!: string | null

  @Column({ name: 'address', type: 'text', nullable: true })
  address!: string | null

  @Column({ name: 'postcode', type: 'varchar', nullable: true })
  postcode!: string | null

  @Column({ name: 'country', type: 'varchar', nullable: true })
  country!: string | null

  @Column({ name: 'company_name', type: 'varchar', nullable: true })
  companyName!: string | null

  @Column({ name: 'company_type', type: 'varchar', nullable: true })
  companyType!: string | null

  @Column({ name: 'company_industry', type: 'varchar', nullable: true })
  companyIndustry!: string | null

  @Column({ name: 'company_website', type: 'text', nullable: true })
  companyWebsite!: string | null

  @Column({ name: 'company_logo', type: 'text', nullable: true })
  companyLogo!: string | null

  @Column({ name: 'mcom_business_id', type: 'varchar', nullable: true })
  mcomBusinessId!: string | null

  // Raw role profile + entitlement snapshot from Central (businessProfile,
  // customerProfile, agentProfile, ... and access/plan/trialContext).
  @Column({ name: 'mcom_profile', type: 'jsonb', nullable: true })
  mcomProfile!: Record<string, unknown> | null

  @Column({ name: 'mcom_entitlement', type: 'jsonb', nullable: true })
  mcomEntitlement!: Record<string, unknown> | null

  // Normalized decision derived from the entitlement (access source, plan,
  // expiry, quotas/limits/features and trial tasks). Kept alongside the raw
  // entitlement so the SPA can render the source without re-deriving it.
  @Column({ name: 'mcom_access', type: 'jsonb', nullable: true })
  mcomAccess!: McomAccessDecision | null

  @Column({ name: 'mcom_last_sync_at', type: 'timestamptz', nullable: true })
  mcomLastSyncAt!: Date | null

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