import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface EntitlementRule {
  id: number
  name: string
  section: string
  type: 'Limit' | 'Allocation' | 'Toggle' | 'Flag' | 'Threshold' | 'Duration'
  targetKey: string
  operator: string
  value: string
  scope: 'Per Plan' | 'Per Business' | 'Per Consumer' | 'Global'
  overridable: boolean
  status: 'Active' | 'Inactive' | 'Draft'
  priority: number
  lastModified: string
  version: number
  description: string
}

interface AllocationQuota {
  tier: string
  bizCards: number
  bizVCards: number
  conCards: number
  conVCards: number
  fnf: number
  additionalCards: number
  eCards: number
}

interface SimulationResult {
  scenario: string
  membershipTier: string
  action: string
  quantity: number
  result: 'PASS' | 'FAILED'
  reason: string
  checkedRules: string[]
}

interface RuleSection {
  id: string
  label: string
  icon: string
  description: string
  rules: EntitlementRule[]
}

const SECTIONS: RuleSection[] = [
  {
    id: 'business-entitlements',
    label: 'Business Entitlements',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    description: 'Defines what each Business receives — VCards, Cards, and feature access.',
    rules: [
      { id: 1, section: 'business-entitlements', name: 'Business VCard Enabled', type: 'Toggle', targetKey: 'bizVCardEnabled', operator: '== true', value: 'Enabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 3, description: 'Whether businesses can create Business VCards.' },
      { id: 2, section: 'business-entitlements', name: 'Max Business VCards', type: 'Limit', targetKey: 'bizVCardCount', operator: '<=', value: '5 / 10 / 25 / ∞', scope: 'Per Plan', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 5, description: 'Maximum number of Business VCards per business (varies by tier).' },
      { id: 3, section: 'business-entitlements', name: 'Premium VCard Templates', type: 'Flag', targetKey: 'bizVCardPremiumLayouts', operator: '== true', value: 'Granted', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Access to premium VCard layout templates.' },
      { id: 4, section: 'business-entitlements', name: 'Publishing Permissions', type: 'Toggle', targetKey: 'bizVCardPublishingRights', operator: '== true', value: 'Granted', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Allows publishing VCards via QR codes and links.' },
      { id: 5, section: 'business-entitlements', name: 'Dynamic QR Access', type: 'Toggle', targetKey: 'bizVCardDynamicQR', operator: '== true', value: 'Granted', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Enables the Dynamic Destination Engine for QR redirect rules.' },
      { id: 6, section: 'business-entitlements', name: 'Version History Access', type: 'Toggle', targetKey: 'bizVCardVersionHistory', operator: '== true', value: 'Granted', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 1, description: 'Access to VCard version history and restore capabilities.' },
      { id: 7, section: 'business-entitlements', name: 'VCard Custom Branding', type: 'Flag', targetKey: 'bizVCardCustomBranding', operator: '== true', value: 'Granted', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Allows custom branding on VCard designs.' },
      { id: 8, section: 'business-entitlements', name: 'Business Card Enabled', type: 'Toggle', targetKey: 'bizCardEnabled', operator: '== true', value: 'Enabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 3, description: 'Whether businesses can issue Business Cards.' },
      { id: 9, section: 'business-entitlements', name: 'Max Business Cards', type: 'Limit', targetKey: 'bizCardCount', operator: '<=', value: '1 / 3 / 5 / ∞', scope: 'Per Plan', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 4, description: 'Maximum Business Cards per business.' },
      { id: 10, section: 'business-entitlements', name: 'Digital Card', type: 'Toggle', targetKey: 'bizCardDigital', operator: '== true', value: 'Enabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Digital Business Card issuance and sharing.' },
      { id: 11, section: 'business-entitlements', name: 'Physical Card', type: 'Toggle', targetKey: 'bizCardPrinted', operator: '== true', value: 'Enabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Physical printed Business Card ordering and fulfillment.' },
      { id: 12, section: 'business-entitlements', name: 'NFC Card', type: 'Toggle', targetKey: 'bizCardNFC', operator: '== true', value: 'Coming Soon', scope: 'Per Plan', overridable: false, status: 'Draft', priority: 3, lastModified: '2026-07-26', version: 1, description: 'NFC-enabled Business Card issuance (Coming Soon).' },
      { id: 13, section: 'business-entitlements', name: 'QR Enabled', type: 'Toggle', targetKey: 'bizCardQR', operator: '== true', value: 'Enabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'QR code enabled on Business Cards.' },
      { id: 14, section: 'business-entitlements', name: 'Card Template Access', type: 'Allocation', targetKey: 'bizCardTemplates', operator: 'in', value: 'Standard / Premium / All', scope: 'Per Plan', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 3, description: 'Which Business Card template tiers are available.' },
      { id: 15, section: 'business-entitlements', name: 'Card Custom Branding', type: 'Flag', targetKey: 'bizCardCustomBranding', operator: '== true', value: 'Granted', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Allows custom branding on Business Cards.' },
    ],
  },
  {
    id: 'consumer-entitlements',
    label: 'Consumer Entitlements',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    description: 'Controls what Businesses can issue to Consumers — VCards, Cards, and membership rules.',
    rules: [
      { id: 16, section: 'consumer-entitlements', name: 'Max Issuable VCards', type: 'Limit', targetKey: 'conVCardMax', operator: '<=', value: '3 / 5 / 10 / ∞', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 5, description: 'Maximum Consumer VCards per consumer account.' },
      { id: 17, section: 'consumer-entitlements', name: 'Unlimited VCards', type: 'Flag', targetKey: 'conVCardUnlimited', operator: '== true', value: 'Unlimited', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 2, description: 'Removes the upper limit on Consumer VCards.' },
      { id: 18, section: 'consumer-entitlements', name: 'VCard Expiry Period', type: 'Duration', targetKey: 'conVCardExpiry', operator: '==', value: '30 / 90 / 365 days', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 3, description: 'Time after which unused Consumer VCards expire.' },
      { id: 19, section: 'consumer-entitlements', name: 'VCard Reissue Policy', type: 'Allocation', targetKey: 'conVCardReissue', operator: '==', value: 'Free / Paid / Limited', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Policy for reissuing Consumer VCards.' },
      { id: 20, section: 'consumer-entitlements', name: 'VCard Replacement Policy', type: 'Allocation', targetKey: 'conVCardReplacement', operator: '==', value: 'Free / Paid / Limited', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Policy for replacing Consumer VCards.' },
      { id: 21, section: 'consumer-entitlements', name: 'Max Issuable Cards', type: 'Limit', targetKey: 'conCardMax', operator: '<=', value: '1 / 3 / 5 / 10', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 4, description: 'Maximum physical/digital Consumer Cards per consumer.' },
      { id: 22, section: 'consumer-entitlements', name: 'Digital Cards Enabled', type: 'Toggle', targetKey: 'conCardDigital', operator: '== true', value: 'Enabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Enables digital Consumer Card issuance.' },
      { id: 23, section: 'consumer-entitlements', name: 'Physical Cards Enabled', type: 'Toggle', targetKey: 'conCardPhysical', operator: '== true', value: 'Enabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Enables physical Consumer Card ordering.' },
      { id: 24, section: 'consumer-entitlements', name: 'eCards Enabled', type: 'Toggle', targetKey: 'conCardECard', operator: '== true', value: 'Enabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Enables eCard issuance for consumers.' },
      { id: 25, section: 'consumer-entitlements', name: 'Card Replacement Rules', type: 'Allocation', targetKey: 'conCardReplacement', operator: '==', value: 'Free / Paid / Limited', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 3, description: 'Policy for replacing Consumer Cards.' },
      { id: 26, section: 'consumer-entitlements', name: 'Entry Level', type: 'Flag', targetKey: 'conEntryLevel', operator: '==', value: 'Bronze / Silver / Gold', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 2, description: 'Default consumer membership entry level.' },
      { id: 27, section: 'consumer-entitlements', name: 'Upgrade Eligibility', type: 'Toggle', targetKey: 'conUpgradeEligible', operator: '== true', value: 'Eligible', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Whether consumers can upgrade membership tier.' },
      { id: 28, section: 'consumer-entitlements', name: 'Downgrade Policy', type: 'Flag', targetKey: 'conDowngradePolicy', operator: '==', value: 'Immediate / End of Period / Disabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Policy for downgrading consumer membership.' },
      { id: 29, section: 'consumer-entitlements', name: 'Expiry Rules', type: 'Duration', targetKey: 'conExpiryRule', operator: '==', value: 'Never / 30d / 90d / 365d', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Consumer membership expiry rules.' },
    ],
  },
  {
    id: 'allocation-rules',
    label: 'Allocation Rules',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    description: 'Implements Henry\'s allocation model — every plan receives quota-based allocation pools.',
    rules: [
      { id: 30, section: 'allocation-rules', name: 'Business Card Allocation', type: 'Allocation', targetKey: 'allocBizCards', operator: '==', value: '1 / 3 / 5 / ∞', scope: 'Per Business', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 4, description: 'Business Card quota per business (varies by tier).' },
      { id: 31, section: 'allocation-rules', name: 'Business VCard Allocation', type: 'Allocation', targetKey: 'allocBizVCards', operator: '==', value: '1 / 5 / 10 / ∞', scope: 'Per Business', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 4, description: 'Business VCard quota per business.' },
      { id: 32, section: 'allocation-rules', name: 'Consumer Card Allocation', type: 'Allocation', targetKey: 'allocConCards', operator: '==', value: '50 / 200 / 500 / 2000', scope: 'Per Business', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 4, description: 'Consumer Cards a business can issue to consumers.' },
      { id: 33, section: 'allocation-rules', name: 'Consumer VCard Allocation', type: 'Allocation', targetKey: 'allocConVCards', operator: '==', value: '50 / 200 / 500 / 2000', scope: 'Per Business', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 4, description: 'Consumer VCards a business can issue.' },
      { id: 34, section: 'allocation-rules', name: 'F&F Allocation', type: 'Allocation', targetKey: 'allocFnF', operator: '==', value: '2 / 5 / 10 / 25', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 4, description: 'Friends & Family cards per consumer.' },
      { id: 35, section: 'allocation-rules', name: 'Additional Card Allocation', type: 'Allocation', targetKey: 'allocAdditionalCards', operator: '==', value: '1 / 3 / 5 / 10', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 3, description: 'Additional cards per consumer beyond F&F.' },
      { id: 36, section: 'allocation-rules', name: 'eCard Allocation', type: 'Allocation', targetKey: 'allocECards', operator: '==', value: '0 / 1 / 3 / 5', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 3, description: 'eCards per consumer.' },
      { id: 37, section: 'allocation-rules', name: 'Allocation Type: Fixed', type: 'Flag', targetKey: 'allocTypeFixed', operator: '== true', value: 'Available', scope: 'Global', overridable: false, status: 'Active', priority: 5, lastModified: '2026-07-25', version: 1, description: 'Fixed allocation — exact count, no variation.' },
      { id: 38, section: 'allocation-rules', name: 'Allocation Type: Unlimited', type: 'Flag', targetKey: 'allocTypeUnlimited', operator: '== true', value: 'Available', scope: 'Global', overridable: false, status: 'Active', priority: 5, lastModified: '2026-07-25', version: 1, description: 'Unlimited allocation — no upper cap.' },
      { id: 39, section: 'allocation-rules', name: 'Allocation Type: Pool', type: 'Flag', targetKey: 'allocTypePool', operator: '== true', value: 'Available', scope: 'Global', overridable: false, status: 'Active', priority: 5, lastModified: '2026-07-25', version: 1, description: 'Pool allocation — shared quota across categories.' },
      { id: 40, section: 'allocation-rules', name: 'Allocation Type: Seasonal', type: 'Flag', targetKey: 'allocTypeSeasonal', operator: '== true', value: 'Available', scope: 'Global', overridable: false, status: 'Active', priority: 5, lastModified: '2026-07-25', version: 1, description: 'Seasonal allocation — time-limited quota.' },
      { id: 41, section: 'allocation-rules', name: 'Allocation Type: Promotional', type: 'Flag', targetKey: 'allocTypePromo', operator: '== true', value: 'Available', scope: 'Global', overridable: false, status: 'Active', priority: 5, lastModified: '2026-07-25', version: 1, description: 'Promotional allocation — campaign-based bonus quota.' },
      { id: 42, section: 'allocation-rules', name: 'Expiry: Never Expire', type: 'Flag', targetKey: 'expiryNever', operator: '== true', value: 'Available', scope: 'Global', overridable: false, status: 'Active', priority: 5, lastModified: '2026-07-25', version: 1, description: 'Allocations never expire.' },
      { id: 43, section: 'allocation-rules', name: 'Expiry: After X Days', type: 'Duration', targetKey: 'expiryDays', operator: '==', value: '30 / 60 / 90 / 365', scope: 'Per Plan', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Allocations expire after configured days.' },
      { id: 44, section: 'allocation-rules', name: 'Expiry: With Membership', type: 'Flag', targetKey: 'expiryWithMembership', operator: '== true', value: 'Available', scope: 'Global', overridable: false, status: 'Active', priority: 5, lastModified: '2026-07-25', version: 1, description: 'Allocations expire when membership ends.' },
      { id: 45, section: 'allocation-rules', name: 'Expiry: After Issue', type: 'Flag', targetKey: 'expiryAfterIssue', operator: '== true', value: 'Available', scope: 'Global', overridable: false, status: 'Active', priority: 5, lastModified: '2026-07-25', version: 1, description: 'Allocations expire after being issued.' },
      { id: 46, section: 'allocation-rules', name: 'Carry Forward', type: 'Flag', targetKey: 'expiryCarryForward', operator: '== true', value: 'Available', scope: 'Global', overridable: false, status: 'Active', priority: 5, lastModified: '2026-07-25', version: 1, description: 'Unused allocations carry forward to next period.' },
      { id: 47, section: 'allocation-rules', name: 'Return to Pool', type: 'Flag', targetKey: 'expiryReturnToPool', operator: '== true', value: 'Available', scope: 'Global', overridable: false, status: 'Active', priority: 5, lastModified: '2026-07-25', version: 1, description: 'Unused allocations return to the shared pool.' },
    ],
  },
  {
    id: 'fnf-rules',
    label: 'Friends & Family Rules',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    description: 'Controls how Businesses allocate cards to family and friends without creating separate account types.',
    rules: [
      { id: 48, section: 'fnf-rules', name: 'Max Friends', type: 'Limit', targetKey: 'fnfMaxFriends', operator: '<=', value: '2 / 3 / 5 / 15', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 4, description: 'Maximum friends that can receive F&F cards.' },
      { id: 49, section: 'fnf-rules', name: 'Max Family Members', type: 'Limit', targetKey: 'fnfMaxFamily', operator: '<=', value: '2 / 3 / 5 / 10', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 4, description: 'Maximum family members that can receive F&F cards.' },
      { id: 50, section: 'fnf-rules', name: 'Combined Limit', type: 'Limit', targetKey: 'fnfTotalCards', operator: '<=', value: '2 / 5 / 10 / 25', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 4, description: 'Total F&F cards across all relationship types.' },
      { id: 51, section: 'fnf-rules', name: 'Mixed Allocation', type: 'Toggle', targetKey: 'fnfMixedAllocation', operator: '== true', value: 'Allowed', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Allows mixing family and friend allocations within the total limit.' },
      { id: 52, section: 'fnf-rules', name: 'Replacement Policy', type: 'Allocation', targetKey: 'fnfReplacement', operator: '==', value: 'Free / Paid / Limited', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Policy for replacing F&F cards.' },
      { id: 53, section: 'fnf-rules', name: 'Revocation Policy', type: 'Flag', targetKey: 'fnfRevocation', operator: '==', value: 'None / Soft / Hard', scope: 'Per Plan', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Ability to revoke issued F&F cards.' },
      { id: 54, section: 'fnf-rules', name: 'Transfer Allowed', type: 'Toggle', targetKey: 'fnfTransferAllowed', operator: '== true', value: 'Allowed', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Whether F&F allocations can be transferred between recipients.' },
      { id: 55, section: 'fnf-rules', name: 'Transfer Window', type: 'Duration', targetKey: 'fnfTransferWindow', operator: '==', value: '7 / 14 / 30 days', scope: 'Per Plan', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Time window for transferring F&F allocations.' },
      { id: 56, section: 'fnf-rules', name: 'Transfer Approval Required', type: 'Toggle', targetKey: 'fnfTransferApproval', operator: '== true', value: 'Required', scope: 'Per Plan', overridable: false, status: 'Active', priority: 2, lastModified: '2026-07-27', version: 2, description: 'Admin approval required for F&F transfers.' },
      { id: 57, section: 'fnf-rules', name: 'Admin Override', type: 'Toggle', targetKey: 'fnfAdminOverride', operator: '== true', value: 'Enabled', scope: 'Global', overridable: false, status: 'Active', priority: 1, lastModified: '2026-07-25', version: 1, description: 'Admin can override F&F restrictions (System Override).' },
      { id: 58, section: 'fnf-rules', name: 'Relationship: Spouse', type: 'Flag', targetKey: 'fnfRelSpouse', operator: '== true', value: 'Available', scope: 'Global', overridable: false, status: 'Active', priority: 5, lastModified: '2026-07-25', version: 1, description: 'Spouse relationship type available.' },
      { id: 59, section: 'fnf-rules', name: 'Relationship: Parent', type: 'Flag', targetKey: 'fnfRelParent', operator: '== true', value: 'Available', scope: 'Global', overridable: false, status: 'Active', priority: 5, lastModified: '2026-07-25', version: 1, description: 'Parent relationship type available.' },
      { id: 60, section: 'fnf-rules', name: 'Relationship: Child', type: 'Flag', targetKey: 'fnfRelChild', operator: '== true', value: 'Available', scope: 'Global', overridable: false, status: 'Active', priority: 5, lastModified: '2026-07-25', version: 1, description: 'Child relationship type available.' },
      { id: 61, section: 'fnf-rules', name: 'Relationship: Sibling', type: 'Flag', targetKey: 'fnfRelSibling', operator: '== true', value: 'Available', scope: 'Global', overridable: false, status: 'Active', priority: 5, lastModified: '2026-07-25', version: 1, description: 'Sibling relationship type available.' },
      { id: 62, section: 'fnf-rules', name: 'Relationship: Relative', type: 'Flag', targetKey: 'fnfRelRelative', operator: '== true', value: 'Available', scope: 'Global', overridable: false, status: 'Active', priority: 5, lastModified: '2026-07-25', version: 1, description: 'Relative relationship type available.' },
      { id: 63, section: 'fnf-rules', name: 'Relationship: Friend', type: 'Flag', targetKey: 'fnfRelFriend', operator: '== true', value: 'Available', scope: 'Global', overridable: false, status: 'Active', priority: 5, lastModified: '2026-07-25', version: 1, description: 'Friend relationship type available.' },
    ],
  },
  {
    id: 'additional-cards',
    label: 'Additional Card Rules',
    icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    description: 'Additional Cards are separate from Friends & Family — paid, complimentary, or promotional extras.',
    rules: [
      { id: 64, section: 'additional-cards', name: 'Max Additional Cards', type: 'Limit', targetKey: 'addCardMax', operator: '<=', value: '1 / 3 / 5 / 10', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 3, description: 'Maximum Additional Cards per consumer.' },
      { id: 65, section: 'additional-cards', name: 'Paid Additional Cards', type: 'Toggle', targetKey: 'addCardPaid', operator: '== true', value: 'Available', scope: 'Per Plan', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Allows consumers to purchase Additional Cards.' },
      { id: 66, section: 'additional-cards', name: 'Complimentary Additional Cards', type: 'Toggle', targetKey: 'addCardComplimentary', operator: '== true', value: 'Available', scope: 'Per Plan', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Provides complimentary Additional Cards with membership.' },
      { id: 67, section: 'additional-cards', name: 'Replacement Charges', type: 'Allocation', targetKey: 'addCardReplacement', operator: '==', value: 'Free / Paid / Limited', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Charges for replacing Additional Cards.' },
      { id: 68, section: 'additional-cards', name: 'Duplicate Policy', type: 'Allocation', targetKey: 'addCardDuplicate', operator: '==', value: 'Free / Paid / Disabled', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Policy for creating duplicate Additional Cards.' },
      { id: 69, section: 'additional-cards', name: 'Included with Plan', type: 'Toggle', targetKey: 'addCardIncluded', operator: '== true', value: 'Included', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 3, description: 'Additional Cards included as part of the plan.' },
      { id: 70, section: 'additional-cards', name: 'Purchasable', type: 'Toggle', targetKey: 'addCardPurchasable', operator: '== true', value: 'Purchasable', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Additional Cards can be purchased separately.' },
      { id: 71, section: 'additional-cards', name: 'Promotional Grant', type: 'Toggle', targetKey: 'addCardPromo', operator: '== true', value: 'Available', scope: 'Per Plan', overridable: true, status: 'Active', priority: 4, lastModified: '2026-07-26', version: 1, description: 'Additional Cards can be granted via promotions.' },
      { id: 72, section: 'additional-cards', name: 'Manually Granted', type: 'Toggle', targetKey: 'addCardManual', operator: '== true', value: 'Enabled', scope: 'Global', overridable: false, status: 'Active', priority: 1, lastModified: '2026-07-25', version: 1, description: 'Admin can manually grant Additional Cards (System Override).' },
    ],
  },
  {
    id: 'ecard-rules',
    label: 'eCard Rules',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    description: 'Controls digital stored-value cards — balance, reload, transfer, and redemption settings.',
    rules: [
      { id: 73, section: 'ecard-rules', name: 'Included with Plan', type: 'Toggle', targetKey: 'ecardIncluded', operator: '== true', value: 'Included', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 3, description: 'eCards included as part of the membership plan.' },
      { id: 74, section: 'ecard-rules', name: 'Initial Balance', type: 'Limit', targetKey: 'ecardInitialBalance', operator: '==', value: '$0 / $10 / $25 / $50', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 3, description: 'Starting balance when eCard is issued.' },
      { id: 75, section: 'ecard-rules', name: 'Maximum Balance', type: 'Limit', targetKey: 'ecardMaxBalance', operator: '<=', value: '$200 / $500 / $1,000', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Maximum cumulative balance a consumer can hold.' },
      { id: 76, section: 'ecard-rules', name: 'Reload Allowed', type: 'Toggle', targetKey: 'ecardReloadAllowed', operator: '== true', value: 'Allowed', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Allows consumers to reload eCard balances.' },
      { id: 77, section: 'ecard-rules', name: 'Transfer Allowed', type: 'Toggle', targetKey: 'ecardTransferAllowed', operator: '== true', value: 'Allowed', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Allows consumers to transfer eCard balances between accounts.' },
      { id: 78, section: 'ecard-rules', name: 'Redemption Enabled', type: 'Toggle', targetKey: 'ecardRedemption', operator: '== true', value: 'Enabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Enables eCard redemption at participating merchants.' },
      { id: 79, section: 'ecard-rules', name: 'Minimum Spend', type: 'Threshold', targetKey: 'ecardMinSpend', operator: '>=', value: '$0 / $10 / $25 / $50', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Minimum spend required before eCard can be redeemed.' },
      { id: 80, section: 'ecard-rules', name: 'MCOM Rewards Settlement', type: 'Toggle', targetKey: 'ecardRewardsSettlement', operator: '== true', value: 'Coming Soon', scope: 'Per Plan', overridable: false, status: 'Inactive', priority: 3, lastModified: '2026-07-25', version: 1, description: 'Future settlement through MCOM Rewards (Coming Soon).' },
      { id: 81, section: 'ecard-rules', name: 'Cashback Settlement', type: 'Toggle', targetKey: 'ecardCashbackSettlement', operator: '== true', value: 'Coming Soon', scope: 'Per Plan', overridable: false, status: 'Inactive', priority: 3, lastModified: '2026-07-25', version: 1, description: 'Future settlement through MCOMMall Cashback (Coming Soon).' },
    ],
  },
  {
    id: 'feature-access',
    label: 'Feature Access Rules',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    description: 'Instead of hardcoding permissions into code, Admin controls feature availability through switches.',
    rules: [
      { id: 82, section: 'feature-access', name: 'Publish VCard (Business)', type: 'Toggle', targetKey: 'featBizPublishVCard', operator: '== true', value: 'Permitted', scope: 'Per Business', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 3, description: 'Business can publish their own VCards.' },
      { id: 83, section: 'feature-access', name: 'Edit Business Card', type: 'Toggle', targetKey: 'featBizEditCard', operator: '== true', value: 'Permitted', scope: 'Per Business', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 3, description: 'Business can edit their Business Cards.' },
      { id: 84, section: 'feature-access', name: 'Issue Consumer Cards', type: 'Toggle', targetKey: 'featBizIssueConCards', operator: '== true', value: 'Permitted', scope: 'Per Business', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 3, description: 'Business can issue Consumer Cards.' },
      { id: 85, section: 'feature-access', name: 'View Analytics', type: 'Toggle', targetKey: 'featBizAnalytics', operator: '== true', value: 'Permitted', scope: 'Per Business', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Business can access analytics dashboards.' },
      { id: 86, section: 'feature-access', name: 'Export Data', type: 'Toggle', targetKey: 'featBizExport', operator: '== true', value: 'Permitted', scope: 'Per Business', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Business can export platform data.' },
      { id: 87, section: 'feature-access', name: 'Share (Consumer)', type: 'Toggle', targetKey: 'featConShare', operator: '== true', value: 'Permitted', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 3, description: 'Consumer can share their VCards.' },
      { id: 88, section: 'feature-access', name: 'Exchange (Consumer)', type: 'Toggle', targetKey: 'featConExchange', operator: '== true', value: 'Permitted', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 3, description: 'Consumer can exchange VCards with others.' },
      { id: 89, section: 'feature-access', name: 'Redeem (Consumer)', type: 'Toggle', targetKey: 'featConRedeem', operator: '== true', value: 'Permitted', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Consumer can redeem offers and rewards.' },
      { id: 90, section: 'feature-access', name: 'Wallet (Consumer)', type: 'Toggle', targetKey: 'featConWallet', operator: '== true', value: 'Permitted', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Consumer can access their digital wallet.' },
      { id: 91, section: 'feature-access', name: 'Invite Friends (Consumer)', type: 'Toggle', targetKey: 'featConInvite', operator: '== true', value: 'Permitted', scope: 'Per Consumer', overridable: true, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Consumer can invite friends to the platform.' },
      { id: 92, section: 'feature-access', name: 'Services Module', type: 'Toggle', targetKey: 'featBizServices', operator: '== true', value: 'Enabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Services dashboard module for businesses.' },
      { id: 93, section: 'feature-access', name: 'Products Module', type: 'Toggle', targetKey: 'featBizProducts', operator: '== true', value: 'Enabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Products dashboard module for businesses.' },
      { id: 94, section: 'feature-access', name: 'Team Members Module', type: 'Toggle', targetKey: 'featBizTeam', operator: '== true', value: 'Enabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Team Members dashboard module.' },
      { id: 95, section: 'feature-access', name: 'Booking Module', type: 'Toggle', targetKey: 'featBizBooking', operator: '== true', value: 'Enabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Booking management module for businesses.' },
      { id: 96, section: 'feature-access', name: 'Events Module', type: 'Toggle', targetKey: 'featBizEvents', operator: '== true', value: 'Enabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Events management module.' },
      { id: 97, section: 'feature-access', name: 'Gallery Module', type: 'Toggle', targetKey: 'featBizGallery', operator: '== true', value: 'Enabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Gallery/media module for businesses.' },
      { id: 98, section: 'feature-access', name: 'Testimonials Module', type: 'Toggle', targetKey: 'featBizTestimonials', operator: '== true', value: 'Enabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Testimonials module for businesses.' },
      { id: 99, section: 'feature-access', name: 'Lead Forms Module', type: 'Toggle', targetKey: 'featBizLeadForms', operator: '== true', value: 'Enabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Lead capture forms module.' },
      { id: 100, section: 'feature-access', name: 'Contact Forms Module', type: 'Toggle', targetKey: 'featBizContactForms', operator: '== true', value: 'Enabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Contact forms module for businesses.' },
      { id: 101, section: 'feature-access', name: 'Analytics Module', type: 'Toggle', targetKey: 'featBizAnalyticsModule', operator: '== true', value: 'Enabled', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-27', version: 2, description: 'Full analytics dashboard module.' },
    ],
  },
  {
    id: 'validation-rules',
    label: 'Validation Rules',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    description: 'Every action is checked before execution — these rules define what gets blocked and why.',
    rules: [
      { id: 102, section: 'validation-rules', name: 'Card Limit Enforcement', type: 'Threshold', targetKey: 'valCardLimit', operator: '>', value: 'Block with reason: Allocation Limit Reached', scope: 'Global', overridable: false, status: 'Active', priority: 1, lastModified: '2026-07-25', version: 2, description: 'If cards issued exceed maximum allocation, block the action.' },
      { id: 103, section: 'validation-rules', name: 'Membership Expiry Check', type: 'Threshold', targetKey: 'valMembershipExpired', operator: '== true', value: 'Deny with reason: Membership Expired', scope: 'Global', overridable: false, status: 'Active', priority: 1, lastModified: '2026-07-25', version: 2, description: 'Block all issuance actions if membership has expired.' },
      { id: 104, section: 'validation-rules', name: 'VCard Limit Enforcement', type: 'Threshold', targetKey: 'valVCardLimit', operator: '>', value: 'Block with reason: VCard Limit Reached', scope: 'Global', overridable: false, status: 'Active', priority: 1, lastModified: '2026-07-25', version: 2, description: 'If VCards created exceed maximum allocation, block creation.' },
      { id: 105, section: 'validation-rules', name: 'F&F Allocation Check', type: 'Threshold', targetKey: 'valFnFAllocation', operator: '>', value: 'Block with reason: F&F Allocation Exceeded', scope: 'Global', overridable: true, status: 'Active', priority: 2, lastModified: '2026-07-26', version: 2, description: 'Validate F&F allocation against remaining quota.' },
      { id: 106, section: 'validation-rules', name: 'eCard Balance Check', type: 'Threshold', targetKey: 'valECardBalance', operator: '>', value: 'Block with reason: Maximum Balance Exceeded', scope: 'Global', overridable: false, status: 'Active', priority: 1, lastModified: '2026-07-25', version: 2, description: 'Prevent eCard load if it exceeds maximum balance.' },
      { id: 107, section: 'validation-rules', name: 'Tier Eligibility Check', type: 'Threshold', targetKey: 'valTierEligibility', operator: '== false', value: 'Deny with reason: Tier Not Eligible', scope: 'Global', overridable: true, status: 'Active', priority: 2, lastModified: '2026-07-26', version: 2, description: 'Validate consumer tier eligibility for actions/benefits.' },
      { id: 108, section: 'validation-rules', name: 'Feature Permission Check', type: 'Flag', targetKey: 'valFeaturePermission', operator: '== false', value: 'Deny with reason: Feature Not Available', scope: 'Global', overridable: false, status: 'Active', priority: 1, lastModified: '2026-07-25', version: 2, description: 'Block usage of features not enabled by membership.' },
    ],
  },
  {
    id: 'future-integrations',
    label: 'Future Integrations',
    icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512a9.025 9.025 0 015.488 5.488z',
    description: 'Integration readiness — rules exist today so future platforms can be enabled without redesign.',
    rules: [
      { id: 109, section: 'future-integrations', name: 'MCOM Solutions Login', type: 'Toggle', targetKey: 'intMCOMLogin', operator: '== true', value: 'Connected', scope: 'Per Plan', overridable: false, status: 'Active', priority: 3, lastModified: '2026-07-28', version: 3, description: 'Central login via MCOM Solutions — connected and active.' },
      { id: 110, section: 'future-integrations', name: 'MCOM Rewards', type: 'Toggle', targetKey: 'intRewards', operator: '== true', value: 'Coming Soon', scope: 'Per Plan', overridable: false, status: 'Inactive', priority: 3, lastModified: '2026-07-25', version: 1, description: 'MCOM Rewards integration — placeholder rule ready for activation.' },
      { id: 111, section: 'future-integrations', name: 'MCOMMall Cashback', type: 'Toggle', targetKey: 'intCashback', operator: '== true', value: 'Coming Soon', scope: 'Per Plan', overridable: false, status: 'Inactive', priority: 3, lastModified: '2026-07-25', version: 1, description: 'MCOMMall Cashback integration — placeholder rule ready.' },
      { id: 112, section: 'future-integrations', name: 'FundOrDonate', type: 'Toggle', targetKey: 'intFundDonate', operator: '== true', value: 'Coming Soon', scope: 'Per Plan', overridable: false, status: 'Inactive', priority: 3, lastModified: '2026-07-25', version: 1, description: 'Fundraising and donation integration — placeholder rule.' },
      { id: 113, section: 'future-integrations', name: 'MCOM Spin', type: 'Toggle', targetKey: 'intSpin', operator: '== true', value: 'Coming Soon', scope: 'Per Plan', overridable: false, status: 'Inactive', priority: 3, lastModified: '2026-07-25', version: 1, description: 'MCOM Spin gamification integration — placeholder rule.' },
      { id: 114, section: 'future-integrations', name: 'Affiliate Platform', type: 'Toggle', targetKey: 'intAffiliate', operator: '== true', value: 'Coming Soon', scope: 'Per Plan', overridable: false, status: 'Inactive', priority: 3, lastModified: '2026-07-25', version: 1, description: 'Affiliate program integration — placeholder rule.' },
    ],
  },
]

const ALL_RULES = SECTIONS.flatMap(s => s.rules)

const ALLOCATION_QUOTAS: AllocationQuota[] = [
  { tier: 'Bronze', bizCards: 1, bizVCards: 1, conCards: 50, conVCards: 50, fnf: 2, additionalCards: 1, eCards: 0 },
  { tier: 'Bronze Pro', bizCards: 1, bizVCards: 3, conCards: 100, conVCards: 100, fnf: 3, additionalCards: 1, eCards: 0 },
  { tier: 'Bronze Pro+', bizCards: 2, bizVCards: 5, conCards: 150, conVCards: 150, fnf: 4, additionalCards: 2, eCards: 1 },
  { tier: 'Silver', bizCards: 3, bizVCards: 5, conCards: 200, conVCards: 200, fnf: 5, additionalCards: 3, eCards: 1 },
  { tier: 'Silver Pro', bizCards: 3, bizVCards: 10, conCards: 300, conVCards: 300, fnf: 7, additionalCards: 3, eCards: 2 },
  { tier: 'Silver Pro+', bizCards: 5, bizVCards: 10, conCards: 400, conVCards: 400, fnf: 8, additionalCards: 4, eCards: 2 },
  { tier: 'Gold', bizCards: 5, bizVCards: 25, conCards: 500, conVCards: 500, fnf: 10, additionalCards: 5, eCards: 3 },
  { tier: 'Gold Pro', bizCards: 10, bizVCards: 25, conCards: 1000, conVCards: 1000, fnf: 12, additionalCards: 5, eCards: 3 },
  { tier: 'Gold Pro+', bizCards: 10, bizVCards: 50, conCards: 1500, conVCards: 1500, fnf: 15, additionalCards: 8, eCards: 4 },
  { tier: 'Platinum', bizCards: 20, bizVCards: 100, conCards: 2000, conVCards: 2000, fnf: 25, additionalCards: 10, eCards: 5 },
  { tier: 'Platinum Pro', bizCards: 50, bizVCards: 100, conCards: 5000, conVCards: 5000, fnf: 30, additionalCards: 10, eCards: 5 },
  { tier: 'Platinum Pro+', bizCards: -1, bizVCards: -1, conCards: -1, conVCards: -1, fnf: -1, additionalCards: -1, eCards: -1 },
]

const PRIORITY_LEVELS = [
  { level: 1, label: 'System Overrides', desc: 'Global enforcement — cannot be overridden by any other rule.', color: 'bg-red-500' },
  { level: 2, label: 'Admin Overrides', desc: 'Manual overrides applied by Super Admin or Operations.', color: 'bg-orange-500' },
  { level: 3, label: 'Membership Rules', desc: 'Standard rules defined by the Membership Plan.', color: 'bg-blue-500' },
  { level: 4, label: 'Promotional Rules', desc: 'Temporary campaign or seasonal overrides.', color: 'bg-purple-500' },
  { level: 5, label: 'Default Rules', desc: 'Fallback rules when no other rule applies.', color: 'bg-gray-400' },
]

const INTEGRATION_STATUSES = [
  { name: 'MCOM Solutions Login', status: 'Connected', available: true, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-500/10' },
  { name: 'MCOM Rewards', status: 'Coming Soon', available: false, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  { name: 'MCOMMall Cashback', status: 'Coming Soon', available: false, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  { name: 'FundOrDonate', status: 'Coming Soon', available: false, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  { name: 'MCOM Spin', status: 'Coming Soon', available: false, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  { name: 'Affiliate Platform', status: 'Coming Soon', available: false, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
]

const RELATIONSHIP_TYPES = ['Spouse', 'Parent', 'Child', 'Sibling', 'Relative', 'Friend', 'Other']

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Active': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Inactive': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
    'Draft': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
  }
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[status] || 'bg-gray-50 text-gray-600'}`}>{status}</span>
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    'Limit': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Allocation': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Toggle': 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600',
    'Flag': 'bg-pink-50 dark:bg-pink-500/10 text-pink-600',
    'Threshold': 'bg-teal-50 dark:bg-teal-500/10 text-teal-600',
    'Duration': 'bg-sky-50 dark:bg-sky-500/10 text-sky-600',
  }
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[type] || 'bg-gray-50 text-gray-600'}`}>{type}</span>
}

function KpiCard({ label, value, sub, color, badge }: {
  label: string; value: string; sub: string; color: string; badge?: string
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-0.5">
        <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
        {badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 font-medium">{badge}</span>}
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[9px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}

function ToggleRow({ label, checked, comingSoon }: { label: string; checked: boolean; comingSoon?: boolean }) {
  return (
    <label className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${comingSoon ? 'opacity-50' : 'hover:bg-gray-50 dark:hover:bg-gray-700'} bg-gray-50 dark:bg-gray-700/30`}>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-700 dark:text-gray-300">{label}</span>
        {comingSoon && <span className="text-[8px] px-1 py-0.5 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-500 font-medium">Coming Soon</span>}
      </div>
      <input type="checkbox" checked={checked} disabled={comingSoon} readOnly className="rounded border-gray-300 accent-orange-500 w-3.5 h-3.5" />
    </label>
  )
}

export default function EntitlementsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'dashboard' | 'simulation' | 'versioning'>('dashboard')
  const [selectedRules, setSelectedRules] = useState<string[]>([])
  const [simTier, setSimTier] = useState('Gold')
  const [simAction, setSimAction] = useState('Issue Consumer Cards')
  const [simQuantity, setSimQuantity] = useState(25)
  const [simResults, setSimResults] = useState<SimulationResult[]>([])
  const [versionFilter, setVersionFilter] = useState('')
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id)
  }

  const handleBulkAction = (action: string) => {
    if (selectedRules.length === 0) { toast.error('No rules selected'); return }
    toast.success(`${action} applied to ${selectedRules.length} rule(s)`)
    setSelectedRules([])
  }

  const runSimulation = () => {
    const quota = ALLOCATION_QUOTAS.find(q => q.tier === simTier)
    let max = 0
    if (simAction.includes('Consumer Cards')) max = quota?.conCards ?? 0
    else if (simAction.includes('Business Cards')) max = quota?.bizCards ?? 0
    else if (simAction.includes('VCards')) max = quota?.bizVCards ?? 0
    else if (simAction.includes('F&F')) max = quota?.fnf ?? 0
    else max = 500

    const passed = max === -1 || simQuantity <= max
    const checkedRules = ALL_RULES.filter(r =>
      r.section === 'validation-rules' ||
      (r.section === 'allocation-rules' && r.type === 'Allocation') ||
      (simAction.includes('Consumer') ? r.section === 'consumer-entitlements' : r.section === 'business-entitlements')
    ).slice(0, 5).map(r => r.name)

    const result: SimulationResult = {
      scenario: `${simTier} → ${simAction} (${simQuantity})`,
      membershipTier: simTier,
      action: simAction,
      quantity: simQuantity,
      result: passed ? 'PASS' : 'FAILED',
      reason: passed ? 'All allocations within limits.' : `${simAction} allocation exceeded. Max allowed: ${max === -1 ? 'Unlimited' : max}`,
      checkedRules,
    }
    setSimResults(prev => [result, ...prev])
    toast.success(passed ? 'Scenario passed all validation rules' : 'Scenario failed — allocation exceeded')
  }

  const clearSimulation = () => setSimResults([])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 animate-pulse">
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-3 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 animate-pulse">
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
              <div className="h-2 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 animate-pulse">
          <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2">Unable to load Entitlement Rules</h3>
          <p className="text-[10px] text-gray-500 mb-4">{error}</p>
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => window.location.reload()} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Retry</button>
            <button onClick={() => toast.success('System status check initiated')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View System Status</button>
          </div>
        </div>
      </div>
    )
  }

  const activeRules = ALL_RULES.filter(r => r.status === 'Active').length
  const draftRules = ALL_RULES.filter(r => r.status === 'Draft').length
  const inactiveRules = ALL_RULES.filter(r => r.status === 'Inactive').length
  const bizRules = ALL_RULES.filter(r => r.section === 'business-entitlements').length
  const conRules = ALL_RULES.filter(r => r.section === 'consumer-entitlements').length

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{activeView === 'dashboard' ? 'Entitlements & Allocation Rules' : activeView === 'simulation' ? 'Rule Simulation' : 'Version History'} - MCOM VCard</title>
      </Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/admin" className="text-[10px] text-orange-600 hover:underline">Dashboard</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">Entitlements & Allocation Rules</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Central Entitlement Engine — every module consults this before allowing an action.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
              {[
                { key: 'dashboard' as const, label: 'Dashboard' },
                { key: 'simulation' as const, label: 'Simulation' },
                { key: 'versioning' as const, label: 'Version History' },
              ].map(v => (
                <button key={v.key} onClick={() => setActiveView(v.key)}
                  className={`px-3 py-1.5 text-[10px] font-medium rounded-md transition-colors ${activeView === v.key ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                  {v.label}
                </button>
              ))}
            </div>
            <button onClick={() => toast.success('New rule created (opens wizard)')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Rule
            </button>
          </div>
        </div>
      </div>

      {activeView === 'dashboard' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <KpiCard label="Active Rules" value={String(activeRules)} sub={`${Math.round(activeRules / ALL_RULES.length * 100)}% enforcement rate`} color="text-green-600" badge={`${ALL_RULES.length} Total`} />
            <KpiCard label="Draft Rules" value={String(draftRules)} sub="Awaiting activation" color="text-amber-600" />
            <KpiCard label="Archived/Inactive" value={String(inactiveRules)} sub="Not currently enforced" color="text-gray-500" />
            <KpiCard label="Business Entitlements" value={String(bizRules)} sub="Across 12 tiers" color="text-blue-600" />
            <KpiCard label="Consumer Entitlements" value={String(conRules)} sub="Across 4 consumer levels" color="text-emerald-600" />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Rule Priority</h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {PRIORITY_LEVELS.map(p => (
                <div key={p.level} className="px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg border-l-2" style={{ borderLeftColor: p.color.replace('bg-', '#') }}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`w-2 h-2 rounded-full ${p.color}`} />
                    <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">{p.label}</span>
                    <span className="text-[9px] text-gray-400 ml-auto">P{p.level}</span>
                  </div>
                  <p className="text-[9px] text-gray-400">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {selectedRules.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-100 dark:border-orange-500/20">
              <span className="text-[10px] text-orange-600 font-medium">{selectedRules.length} rule(s) from current section selected</span>
              <div className="flex-1" />
              {['Publish', 'Archive', 'Clone', 'Export', 'Assign to Plans', 'Restore Version'].map(action => (
                <button key={action} onClick={() => handleBulkAction(action)}
                  className="text-[10px] px-2 py-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{action}</button>
              ))}
              <button onClick={() => setSelectedRules([])} className="text-[10px] px-2 py-1 rounded text-gray-500 hover:text-gray-700">Clear</button>
            </div>
          )}

          <div className="space-y-2">
            {SECTIONS.map(section => (
              <div key={section.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <button onClick={() => toggleSection(section.id)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={section.icon} />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">{section.label}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-500">{section.rules.length} rules</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600">{section.rules.filter(r => r.status === 'Active').length} active</span>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-0.5">{section.description}</p>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === section.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedSection === section.id && (
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    {/* Section-specific content */}
                    {section.id === 'business-entitlements' && (
                      <div className="p-4 space-y-5">
                        <div>
                          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Business VCards</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {section.rules.filter(r => r.targetKey.includes('VCard') || r.targetKey.includes('vCard')).map(r => (
                              <div key={r.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-700 dark:text-gray-300">{r.name}</span>
                                    <TypeBadge type={r.type} />
                                  </div>
                                  <p className="text-[9px] text-gray-400">{r.value}</p>
                                </div>
                                <StatusBadge status={r.status} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Business Cards</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {section.rules.filter(r => r.targetKey.includes('Card') || r.targetKey.includes('card')).map(r => (
                              <div key={r.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-700 dark:text-gray-300">{r.name}</span>
                                    <TypeBadge type={r.type} />
                                  </div>
                                  <p className="text-[9px] text-gray-400">{r.value}</p>
                                </div>
                                <StatusBadge status={r.status} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Business Features</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                            {['Services', 'Products', 'Team Members', 'Booking', 'Events', 'Gallery', 'Testimonials', 'Lead Forms', 'Contact Forms', 'Analytics'].map(f => (
                              <ToggleRow key={f} label={f} checked={true} />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => toast.success('Business entitlements saved')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Save Changes</button>
                          <button onClick={() => toast.success('Changes reverted')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reset</button>
                          <button onClick={() => toast.success('Version snapshot created')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Create Version</button>
                        </div>
                      </div>
                    )}

                    {section.id === 'consumer-entitlements' && (
                      <div className="p-4 space-y-5">
                        <div>
                          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Consumer VCards</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {section.rules.filter(r => r.targetKey.includes('VCard') || r.targetKey.includes('vCard')).map(r => (
                              <div key={r.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-700 dark:text-gray-300">{r.name}</span>
                                    <TypeBadge type={r.type} />
                                  </div>
                                  <p className="text-[9px] text-gray-400">{r.value}</p>
                                </div>
                                <StatusBadge status={r.status} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Consumer Cards</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {section.rules.filter(r => r.targetKey.includes('Card') && !r.targetKey.includes('VCard')).map(r => (
                              <div key={r.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-700 dark:text-gray-300">{r.name}</span>
                                    <TypeBadge type={r.type} />
                                  </div>
                                  <p className="text-[9px] text-gray-400">{r.value}</p>
                                </div>
                                <StatusBadge status={r.status} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Consumer Membership</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {section.rules.filter(r => r.targetKey.includes('con') && !r.targetKey.includes('VCard') && !r.targetKey.includes('Card')).map(r => (
                              <div key={r.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-700 dark:text-gray-300">{r.name}</span>
                                    <TypeBadge type={r.type} />
                                  </div>
                                  <p className="text-[9px] text-gray-400">{r.value}</p>
                                </div>
                                <StatusBadge status={r.status} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => toast.success('Consumer entitlements saved')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Save Changes</button>
                          <button onClick={() => toast.success('Changes reverted')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reset</button>
                        </div>
                      </div>
                    )}

                    {section.id === 'allocation-rules' && (
                      <div className="p-4 space-y-5">
                        <div>
                          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Allocation Quotas by Tier</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-[10px]">
                              <thead>
                                <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                                  <th className="text-left px-2 py-1.5 font-medium">Tier</th>
                                  <th className="text-right px-2 py-1.5 font-medium">Biz Cards</th>
                                  <th className="text-right px-2 py-1.5 font-medium">Biz VCards</th>
                                  <th className="text-right px-2 py-1.5 font-medium">Consumer Cards</th>
                                  <th className="text-right px-2 py-1.5 font-medium">Consumer VCards</th>
                                  <th className="text-right px-2 py-1.5 font-medium">F&F</th>
                                  <th className="text-right px-2 py-1.5 font-medium">Additional Cards</th>
                                  <th className="text-right px-2 py-1.5 font-medium">eCards</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ALLOCATION_QUOTAS.map(q => (
                                  <tr key={q.tier} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                    <td className="px-2 py-1.5 font-medium text-gray-900 dark:text-white">{q.tier}</td>
                                    <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300">{q.bizCards === -1 ? '∞' : q.bizCards}</td>
                                    <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300">{q.bizVCards === -1 ? '∞' : q.bizVCards}</td>
                                    <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300">{q.conCards === -1 ? '∞' : q.conCards}</td>
                                    <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300">{q.conVCards === -1 ? '∞' : q.conVCards}</td>
                                    <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300">{q.fnf === -1 ? '∞' : q.fnf}</td>
                                    <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300">{q.additionalCards === -1 ? '∞' : q.additionalCards}</td>
                                    <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-300">{q.eCards === -1 ? '∞' : q.eCards}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Allocation Types</h4>
                            <div className="space-y-1.5">
                              {section.rules.filter(r => r.targetKey.includes('allocType')).map(r => (
                                <div key={r.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-700 dark:text-gray-300">{r.name.replace('Allocation Type: ', '')}</span>
                                    <TypeBadge type={r.type} />
                                  </div>
                                  <StatusBadge status={r.status} />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Expiry Rules</h4>
                            <div className="space-y-1.5">
                              {section.rules.filter(r => r.targetKey.includes('expiry')).map(r => (
                                <div key={r.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-700 dark:text-gray-300">{r.name.replace('Expiry: ', '')}</span>
                                    <TypeBadge type={r.type} />
                                  </div>
                                  <StatusBadge status={r.status} />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => toast.success('Allocation quotas updated')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Save Quotas</button>
                          <button onClick={() => toast.success('Allocation rules reset')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reset</button>
                        </div>
                      </div>
                    )}

                    {section.id === 'fnf-rules' && (
                      <div className="p-4 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          {section.rules.filter(r => !r.targetKey.includes('Rel') && !r.targetKey.includes('fnfAdmin')).map(r => (
                            <div key={r.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-gray-700 dark:text-gray-300">{r.name}</span>
                                  <TypeBadge type={r.type} />
                                </div>
                                <p className="text-[9px] text-gray-400">{r.value}</p>
                              </div>
                              <StatusBadge status={r.status} />
                            </div>
                          ))}
                        </div>
                        <div>
                          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Relationship Types</h4>
                          <div className="flex flex-wrap gap-2">
                            {RELATIONSHIP_TYPES.map(rt => (
                              <div key={rt} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                <span className="text-[10px] text-gray-700 dark:text-gray-300">{rt}</span>
                              </div>
                            ))}
                            <button onClick={() => toast.success('Add relationship type (opens dialog)')} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-[10px] text-gray-400 hover:text-gray-600 hover:border-gray-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                              Add Type
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => toast.success('F&F rules saved')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Save Changes</button>
                          <button onClick={() => toast.success('F&F rules reset')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reset</button>
                        </div>
                      </div>
                    )}

                    {section.id === 'additional-cards' && (
                      <div className="p-4 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          {section.rules.map(r => (
                            <div key={r.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-gray-700 dark:text-gray-300">{r.name}</span>
                                  <TypeBadge type={r.type} />
                                </div>
                                <p className="text-[9px] text-gray-400">{r.value}</p>
                              </div>
                              <StatusBadge status={r.status} />
                            </div>
                          ))}
                        </div>
                        <div>
                          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Pricing Override</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            {['Included', 'Purchasable', 'Promotional', 'Manual Grant'].map(opt => (
                              <ToggleRow key={opt} label={opt} checked={true} />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => toast.success('Additional Card rules saved')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Save Changes</button>
                          <button onClick={() => toast.success('Additional Card rules reset')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reset</button>
                        </div>
                      </div>
                    )}

                    {section.id === 'ecard-rules' && (
                      <div className="p-4 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          {section.rules.map(r => (
                            <div key={r.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-gray-700 dark:text-gray-300">{r.name}</span>
                                  <TypeBadge type={r.type} />
                                </div>
                                <p className="text-[9px] text-gray-400">{r.value}</p>
                              </div>
                              <StatusBadge status={r.status} />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => toast.success('eCard rules saved')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Save Changes</button>
                          <button onClick={() => toast.success('eCard rules reset')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reset</button>
                        </div>
                      </div>
                    )}

                    {section.id === 'feature-access' && (
                      <div className="p-4 space-y-5">
                        <div>
                          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Business Permissions</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {section.rules.filter(r => r.targetKey.includes('Biz') || r.targetKey.includes('featBiz')).slice(0, 5).map(r => (
                              <ToggleRow key={r.id} label={r.name} checked={r.status === 'Active'} />
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Consumer Permissions</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {section.rules.filter(r => r.targetKey.includes('Con') || r.targetKey.includes('featCon')).map(r => (
                              <ToggleRow key={r.id} label={r.name} checked={r.status === 'Active'} />
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Business Dashboard Modules</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                            {section.rules.filter(r => r.targetKey.includes('Module') || r.targetKey.includes('featBiz')).slice(5).map(r => (
                              <ToggleRow key={r.id} label={r.name.replace(' Module', '')} checked={r.status === 'Active'} />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => toast.success('Feature access rules saved')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Save Changes</button>
                          <button onClick={() => toast.success('Feature access reset')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reset</button>
                        </div>
                      </div>
                    )}

                    {section.id === 'validation-rules' && (
                      <div className="p-4 space-y-5">
                        <div className="space-y-1.5">
                          {section.rules.map(r => (
                            <div key={r.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{r.name}</span>
                                  <TypeBadge type={r.type} />
                                  <span className="text-[9px] text-gray-400">P{r.priority}</span>
                                </div>
                                <p className="text-[9px] text-gray-400 mt-0.5">{r.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-gray-500">{r.value}</span>
                                <StatusBadge status={r.status} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => toast.success('Validation rules saved')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Save Changes</button>
                          <button onClick={() => toast.success('Validation rules reset')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reset</button>
                        </div>
                      </div>
                    )}

                    {section.id === 'future-integrations' && (
                      <div className="p-4 space-y-5">
                        <div className="overflow-x-auto">
                          <table className="w-full text-[10px]">
                            <thead>
                              <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                                <th className="text-left px-2 py-1.5 font-medium">Platform</th>
                                <th className="text-left px-2 py-1.5 font-medium">Status</th>
                                <th className="text-left px-2 py-1.5 font-medium">Rule Available</th>
                                <th className="text-left px-2 py-1.5 font-medium">Priority</th>
                                <th className="text-left px-2 py-1.5 font-medium">Version</th>
                                <th className="text-left px-2 py-1.5 font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {INTEGRATION_STATUSES.map((int, i) => {
                                const rule = section.rules[i]
                                return (
                                  <tr key={int.name} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                    <td className="px-2 py-2 font-medium text-gray-900 dark:text-white">{int.name}</td>
                                    <td className="px-2 py-2"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${int.bg} ${int.color}`}>{int.status}</span></td>
                                    <td className="px-2 py-2">{rule ? <StatusBadge status={rule.status} /> : <span className="text-gray-400">N/A</span>}</td>
                                    <td className="px-2 py-2 text-gray-500">P{rule?.priority ?? '-'}</td>
                                    <td className="px-2 py-2 text-gray-500">v{rule?.version ?? '-'}</td>
                                    <td className="px-2 py-2">
                                      <button onClick={() => toast.success(`${int.name}: Rule configuration opened`)} className="text-[10px] px-2 py-1 rounded text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 font-medium">Configure</button>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <p className="text-[10px] font-medium text-amber-700 dark:text-amber-400">Integration rules already exist</p>
                              <p className="text-[9px] text-amber-600 dark:text-amber-500 mt-0.5">Rules for future integrations are pre-configured. When the integration launches, simply toggle the rule to Active — no UI redesign needed.</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => toast.success('Integration rules saved')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Save Changes</button>
                          <button onClick={() => toast.success('Integration rules reset')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reset</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {activeView === 'simulation' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-1">Rule Testing & Simulation</h3>
          <p className="text-[10px] text-gray-500 mb-5">Simulate membership scenarios before publishing rules. The Entitlement Engine evaluates every action against active rules.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-1 space-y-4">
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Membership Tier</label>
                <select value={simTier} onChange={(e) => setSimTier(e.target.value)}
                  className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
                  {ALLOCATION_QUOTAS.map(q => <option key={q.tier}>{q.tier}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Action</label>
                <select value={simAction} onChange={(e) => setSimAction(e.target.value)}
                  className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
                  {['Issue Consumer Cards', 'Issue Consumer VCards', 'Create Business Cards', 'Create Business VCards', 'Allocate F&F', 'Issue Additional Cards', 'Issue eCards'].map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Quantity</label>
                <input type="number" value={simQuantity} onChange={(e) => setSimQuantity(Number(e.target.value))}
                  className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div className="flex gap-2">
                <button onClick={runSimulation} className="flex-1 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Run Simulation
                </button>
                <button onClick={clearSimulation} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Clear</button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Simulation Results</h4>
              {simResults.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/20 rounded-xl">
                  <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  <p className="text-[10px] text-gray-400">Configure a scenario above and run simulation to validate entitlement rules.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {simResults.map((sr, i) => (
                    <div key={i} className={`px-4 py-3 rounded-lg border ${sr.result === 'PASS' ? 'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20' : 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sr.result === 'PASS' ? 'bg-green-200 dark:bg-green-500/20 text-green-700' : 'bg-red-200 dark:bg-red-500/20 text-red-700'}`}>{sr.result}</span>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">{sr.membershipTier}</span>
                          <span className="text-[10px] text-gray-500">{sr.action}</span>
                          <span className="text-[10px] font-mono text-gray-500">x{sr.quantity}</span>
                        </div>
                        <span className="text-[9px] text-gray-400">Scenario {simResults.length - i}</span>
                      </div>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-1.5">{sr.reason}</p>
                      <details className="text-[9px]">
                        <summary className="text-gray-400 cursor-pointer hover:text-gray-600">Rules checked ({sr.checkedRules.length})</summary>
                        <ul className="mt-1 space-y-0.5 pl-4">
                          {sr.checkedRules.map((rule, j) => (
                            <li key={j} className="text-gray-400">• {rule}</li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeView === 'versioning' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">Rule Version History</h3>
              <p className="text-[10px] text-gray-500">Every rule change creates a new version. Compare, restore, or schedule activations.</p>
            </div>
            <div className="flex items-center gap-2">
              <select value={versionFilter} onChange={(e) => setVersionFilter(e.target.value)}
                className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
                <option value="">All Sections</option>
                {SECTIONS.map(s => <option key={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { version: 'v2.4.1', date: '2026-07-28 14:30', author: 'System', section: 'allocation-rules', desc: 'Updated allocation quotas for Gold and Platinum tiers', rules: 7, type: 'bulk' as const },
              { version: 'v2.4.0', date: '2026-07-28 09:15', author: 'Admin', section: 'business-entitlements', desc: 'Added NFC Card rule (Draft) and updated Max Business VCards', rules: 3, type: 'edit' as const },
              { version: 'v2.3.2', date: '2026-07-27 16:00', author: 'System', section: 'consumer-entitlements', desc: 'Automatic snapshot: Max Issuable VCards changed from 5 to 10 for Silver', rules: 1, type: 'auto' as const },
              { version: 'v2.3.1', date: '2026-07-27 11:00', author: 'Admin', section: 'fnf-rules', desc: 'Added Relationship: Other type and updated transfer policy', rules: 2, type: 'edit' as const },
              { version: 'v2.3.0', date: '2026-07-26 15:45', author: 'Commercial Manager', section: 'feature-access', desc: 'Enabled Analytics Module, Lead Forms, Contact Forms for Gold+', rules: 4, type: 'bulk' as const },
              { version: 'v2.2.1', date: '2026-07-26 10:30', author: 'System', section: 'validation-rules', desc: 'Automatic snapshot: F&F Allocation Check priority changed from 3 to 2', rules: 1, type: 'auto' as const },
              { version: 'v2.2.0', date: '2026-07-25 14:00', author: 'Admin', section: 'future-integrations', desc: 'Pre-configured all 6 integration placeholder rules', rules: 6, type: 'bulk' as const },
            ].map((v, i) => (
              <div key={i} className="flex items-start gap-3 px-3 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-gray-700 dark:text-gray-300">{v.version}</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-500 font-mono text-[8px]">{v.type.toUpperCase()}</span>
                    <span className="text-[9px] text-gray-400">by {v.author}</span>
                    <span className="text-[9px] text-gray-400 ml-auto">{v.date}</span>
                  </div>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">{v.desc}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] text-gray-400">{v.rules} rule(s) affected</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-500">{v.section}</span>
                    <div className="flex-1" />
                    <button onClick={() => toast.success(`Comparing ${v.version} with current`)} className="text-[9px] px-2 py-0.5 rounded text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 font-medium">Compare</button>
                    <button onClick={() => toast.success(`${v.version} restored`)} className="text-[9px] px-2 py-0.5 rounded text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 font-medium">Restore</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-[10px] font-medium text-blue-700 dark:text-blue-400">Version Engine Integration</p>
              <p className="text-[9px] text-blue-600 dark:text-blue-500 mt-0.5">Snapshots are created automatically on save. Manual snapshots can be created from any section. Restoring a version creates a new entry in the timeline — nothing is permanently lost.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
