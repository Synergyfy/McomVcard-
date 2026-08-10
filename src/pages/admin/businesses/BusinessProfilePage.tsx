import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { mockBusinesses, type MockBusiness } from '../../../services/mockData'
import { loadMembershipPricing } from '../../../services/membershipPricingStore'
import { formatLimit, getPlanLevelFromName, rulesForContext } from '../../../services/membershipEnforcement'

const TABS = ['Overview', 'Business VCard', 'Business Card', 'Consumer Cards', 'Membership & Allocation', 'Activity', 'Account & Integrations']
const SUSPEND_REASONS = ['Policy violation', 'Inactive account', 'Payment issue', 'Security concern', 'Admin decision', 'Other']


interface BizExtra { businessId: string; membership: string; membershipStatus: string; membershipStart: string; membershipRenewal: string; billingCycle: string; paymentStatus: string; autoRenewal: boolean; assignedBy: string; lastUpdated: string; planTier: string; planLevel: string; amountPaid: string; businessVCard: any; businessCard: any; consumerVCards: any[]; consumerCards: any[]; consumerVTotal: number; consumerCTotal: number; vcardsUsed: number; cardsUsed: number; totalConsumers: number; activeConsumers: number; consumersWithVCards: number; consumersWithCards: number; consumersWithFF: number; requiresAttention: boolean; lastActiveLabel: string; lastActiveFull: string; hoursAgo: number; centralUserId: string; centralEmail: string; lastSync: string; integrationStatus: Record<string,string>; activity: any[]; centralAccountId: string; localBusinessId: string; accountType: string; registrationSource: string; authenticationStatus: string; lastSuccessfulSync: string; lastAttemptedSync: string; syncStatus: string; syncError: string; accountStatus: string; ecosystemIds: Record<string, string>; integrations: any[]; integrationActivity: any[] }
const bizData = mockBusinesses.map((b: any): MockBusiness & BizExtra => {
  const planMap: Record<string, string> = { Free: 'Bronze Standard', Starter: 'Bronze Pro', Business: 'Silver Pro', Enterprise: 'Enterprise Pro' }
  const membership = planMap[b.plan] || 'Bronze Standard'
  const vcardActive = b.status === 'verified'
  const cardActive = b.cards > 0
  const hoursAgo = Math.floor(Math.random() * 336)
  const relativeTime = (h: number) => h < 1 ? 'Just now' : h < 2 ? '1 hour ago' : h < 24 ? `${h}h ago` : h < 48 ? 'Yesterday' : `${Math.floor(h / 24)}d ago`
  const formatDate = (d: string) => {
    const months: Record<string, string> = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' }
    const [m, y] = d.split(' ')
    return `${y}-${months[m]}-01`
  }
  const consumerVTotal = b.plan === 'Free' ? 10 : b.plan === 'Starter' ? 100 : b.plan === 'Business' ? 500 : 1000
  const consumerCTotal = b.plan === 'Free' ? 5 : b.plan === 'Starter' ? 50 : b.plan === 'Business' ? 500 : 1000
  const vcardsUsed = Math.floor(Math.random() * Math.min(consumerVTotal, 30))
  const cardsUsed = Math.floor(Math.random() * Math.min(consumerCTotal, 25))

  return {
    ...b,
    businessId: `BUS-${String(b.id).padStart(6, '0')}`,
    membership,
    membershipStatus: b.status === 'suspended' ? 'Expired' : b.status === 'pending' ? 'Pending' : 'Active',
    membershipStart: formatDate(b.joined),
    membershipRenewal: '2026-10-01',
    billingCycle: b.plan === 'Enterprise' ? 'Annual' : '90-Day',
    paymentStatus: 'Paid',
    autoRenewal: true,
    assignedBy: 'System',
    lastUpdated: relativeTime(Math.floor(Math.random() * 72)),
    planTier: b.plan === 'Free' ? 'Starter' : b.plan === 'Starter' ? 'Professional' : b.plan === 'Business' ? 'Business' : 'Enterprise',
    planLevel: b.plan === 'Free' ? 'Basic' : b.plan === 'Starter' ? 'Plus' : b.plan === 'Business' ? 'Pro' : 'Ultimate',
    amountPaid: b.plan === 'Free' ? '$0' : b.plan === 'Starter' ? '$2,500' : b.plan === 'Business' ? '$8,000' : '$24,000',
    businessVCard: vcardActive ? {
      status: 'Active', id: `BVC-${String(b.id).padStart(6, '0')}`,
      views: Math.floor(Math.random() * 5000) + 500, shares: Math.floor(Math.random() * 800) + 100,
      scans: Math.floor(Math.random() * 1200) + 200,
      url: `https://mcomvcard.com/biz/${b.name.toLowerCase().replace(/\s+/g, '-')}`,
      preview: '/preview/vcard', created: b.joined, updated: relativeTime(Math.floor(Math.random() * 72)),
      lastViewed: relativeTime(Math.floor(Math.random() * 24)),
    } : { status: 'Not Created', id: '', views: 0, shares: 0, scans: 0, url: '', preview: '', created: '', updated: '', lastViewed: '' },
    businessCard: cardActive ? {
      status: 'Active', id: `BC-${String(b.id).padStart(6, '0')}`,
      design: ['Premium Executive', 'Modern Tide', 'Bold Statement'][Math.floor(Math.random() * 3)],
      scans: Math.floor(Math.random() * 3000) + 300,
      url: `https://mcomvcard.com/card/${b.name.toLowerCase().replace(/\s+/g, '-')}`,
      preview: '/preview/card', updated: relativeTime(Math.floor(Math.random() * 72)),
    } : { status: 'Not Created', id: '', design: '', scans: 0, url: '', preview: '', updated: '' },
    consumerVCards: Array.from({ length: vcardsUsed }, (_, i) => {
      const vLevel = ['Standard', 'Premium', 'VIP'][Math.floor(Math.random() * 3)]
      const vStatus = ['Active', 'Active', 'Active', 'Pending', 'Inactive'][Math.floor(Math.random() * 5)]
      return {
        id: 100 + i, consumer: ['Emma Rodriguez', 'Mike Patel', 'Sarah Wilson', 'Tom Baker', 'Sophie Laurent', 'David Kim', 'Anna Martinez', 'Oscar Hernandez', 'Lisa Thompson', 'James Chen'][i % 10],
        consumerId: `CNS-${String(b.id).padStart(3, '0')}-${String(100 + i).padStart(4, '0')}`,
        consumerEmail: `consumer${100 + i}@email.com`,
        vcardId: `CVC-${String(b.id).padStart(3, '0')}-${String(i + 1).padStart(3, '0')}`,
        level: vLevel,
        allocationType: ['Reward', 'Campaign', 'Business Allocation', 'Promotional', 'Other'][Math.floor(Math.random() * 5)],
        status: vStatus,
        issued: `${Math.floor(Math.random() * 90) + 1}d ago`,
        issuedDate: new Date(Date.now() - Math.floor(Math.random() * 90) * 86400000).toISOString().split('T')[0],
        activatedDate: vStatus === 'Active' ? new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000).toISOString().split('T')[0] : null,
        familyMember: Math.random() > 0.7 ? { relation: ['Wife', 'Husband', 'Son', 'Daughter', 'Friend'][Math.floor(Math.random() * 5)], name: ['Mary', 'John', 'Alex', 'Lucy', 'Sam'][Math.floor(Math.random() * 5)], allocated: true, locked: Math.random() > 0.3 } : null,
        eCard: Math.random() > 0.4 ? { enabled: true, value: [1, 2, 5, 10][Math.floor(Math.random() * 4)], status: ['Active', 'Active', 'Redeemed', 'Expired'][Math.floor(Math.random() * 4)], expiry: new Date(Date.now() + Math.floor(Math.random() * 365) * 86400000).toISOString().split('T')[0], remaining: Math.floor(Math.random() * 10) } : null,
        allocationLocked: Math.random() > 0.6,
        lastActivity: relativeTime(Math.floor(Math.random() * 72)),
      }
    }),
    consumerCards: Array.from({ length: cardsUsed }, (_, i) => {
      const cStatus = ['Active', 'Active', 'Active', 'Pending', 'Inactive', 'Suspended'][Math.floor(Math.random() * 6)]
      const hasFF = Math.random() > 0.75
      const addCards = hasFF ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
        id: 300 + i * 10 + j, name: ['Mary', 'John', 'Alex', 'Lucy', 'Sam', 'Ella', 'Max'][Math.floor(Math.random() * 7)], relation: j === 0 ? 'Family' : j === 1 ? 'Family' : 'Friend', cardId: `SUB-${String(b.id).padStart(3, '0')}-${String(i + 1).padStart(3, '0')}-${String(j + 1)}`, status: 'Active', eCard: Math.random() > 0.5 ? { enabled: true, value: [1, 2, 5][Math.floor(Math.random() * 3)], status: 'Active' } : null, allocationLocked: true,
      })) : []
      return {
        id: 200 + i, consumer: ['Emma Rodriguez', 'James Chen', 'Sarah Wilson', 'Lisa Thompson', 'Sophie Laurent', 'David Kim', 'Mike Patel', 'Anna Martinez'][i % 8],
        consumerId: `CNS-${String(b.id).padStart(3, '0')}-${String(200 + i).padStart(4, '0')}`,
        consumerEmail: `consumer${200 + i}@email.com`,
        cardId: `CC-${String(b.id).padStart(3, '0')}-${String(i + 1).padStart(3, '0')}`,
        type: ['Loyalty', 'Rewards', 'Membership', 'Business'][Math.floor(Math.random() * 4)],
        membershipLevel: ['Bronze', 'Silver', 'Gold', 'Platinum'][Math.floor(Math.random() * 4)],
        allocationType: ['Reward', 'Campaign', 'Business Allocation', 'Promotional', 'Other'][Math.floor(Math.random() * 5)],
        status: cStatus,
        created: `${Math.floor(Math.random() * 90) + 1}d ago`,
        issuedDate: new Date(Date.now() - Math.floor(Math.random() * 90) * 86400000).toISOString().split('T')[0],
        activatedDate: cStatus === 'Active' ? new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000).toISOString().split('T')[0] : null,
        faceValue: ['$50', '$100', '$200', '$500'][Math.floor(Math.random() * 4)],
        eCard: Math.random() > 0.3 ? { enabled: true, value: [1, 2, 5, 10, 25][Math.floor(Math.random() * 5)], status: ['Active', 'Active', 'Redeemed', 'Expired'][Math.floor(Math.random() * 4)], expiry: new Date(Date.now() + Math.floor(Math.random() * 365) * 86400000).toISOString().split('T')[0], remaining: Math.floor(Math.random() * 25) + 1, spendableAt: 'Participating Business', minSpend: ['$0', '$5', '$10'][Math.floor(Math.random() * 3)] } : null,
        additionalCards: addCards.length > 0 ? addCards : null,
        additionalEntitlement: addCards.length > 0 ? { total: 3, allocated: addCards.length, available: 3 - addCards.length } : null,
        allocationLocked: Math.random() > 0.5,
        lastActivity: relativeTime(Math.floor(Math.random() * 120)),
      }
    }),
    consumerVTotal,
    consumerCTotal,
    vcardsUsed,
    cardsUsed,
    totalConsumers: vcardsUsed + cardsUsed,
    activeConsumers: Math.floor((vcardsUsed + cardsUsed) * 0.7),
    consumersWithVCards: vcardsUsed,
    consumersWithCards: cardsUsed,
    consumersWithFF: Math.floor((vcardsUsed + cardsUsed) * 0.15),
    requiresAttention: !vcardActive || !cardActive || b.status === 'suspended',
    lastActiveLabel: relativeTime(hoursAgo),
    lastActiveFull: new Date(Date.now() - hoursAgo * 3600000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    hoursAgo,
    centralUserId: `MCOM-${String(b.id).padStart(8, '0')}`,
    centralEmail: b.owner_email || b.email,
    lastSync: relativeTime(Math.floor(Math.random() * 60)),
    integrationStatus: {
      mcomSolutions: 'connected',
      mcomRewards: 'coming-soon',
      mcommallCashback: 'coming-soon',
      mcomSpin: 'coming-soon',
      fundOrDonate: 'coming-soon',
    },
    activity: [
      { activityId: `ACT-${String(b.id).padStart(6, '0')}-001`, action: 'Business account created', time: b.joined, type: 'account', actor: 'System', actorType: 'System', actorName: 'System', consumer: '', ref: `BUS-${String(b.id).padStart(6, '0')}`, objectType: 'Business Account', objectId: `BUS-${String(b.id).padStart(6, '0')}`, description: 'Business account was created and registered on MCOMVCard.', previousValue: '', newValue: 'Active', status: 'Successful', source: 'MCOMVCard' },
      { activityId: `ACT-${String(b.id).padStart(6, '0')}-002`, action: 'Business VCard created', time: relativeTime(336), type: 'vcard', actor: 'Business Owner', actorType: 'Business Owner', actorName: 'Business Owner', consumer: '', ref: `BVC-${String(b.id).padStart(6, '0')}`, objectType: 'Business VCard', objectId: `BVC-${String(b.id).padStart(6, '0')}`, description: 'Business VCard was created for the business.', previousValue: 'Not Created', newValue: 'Draft', status: 'Successful', source: 'MCOMVCard' },
      { activityId: `ACT-${String(b.id).padStart(6, '0')}-003`, action: 'Membership plan activated', time: relativeTime(168), type: 'membership', actor: 'System', actorType: 'System', actorName: 'System', consumer: '', ref: '', objectType: 'Membership', objectId: `MEM-${String(b.id).padStart(6, '0')}`, description: `${membership} plan activated for the business.`, previousValue: 'None', newValue: membership, status: 'Successful', source: 'MCOMVCard' },
      { activityId: `ACT-${String(b.id).padStart(6, '0')}-004`, action: 'Business VCard updated', time: relativeTime(96), type: 'vcard', actor: 'Business Owner', actorType: 'Business Owner', actorName: 'Business Owner', consumer: '', ref: `BVC-${String(b.id).padStart(6, '0')}`, objectType: 'Business VCard', objectId: `BVC-${String(b.id).padStart(6, '0')}`, description: 'Business VCard content and settings were updated.', previousValue: '', newValue: '', status: 'Successful', source: 'MCOMVCard' },
      { activityId: `ACT-${String(b.id).padStart(6, '0')}-005`, action: 'Business VCard published', time: relativeTime(72), type: 'vcard', actor: 'Business Owner', actorType: 'Business Owner', actorName: 'Business Owner', consumer: '', ref: `BVC-${String(b.id).padStart(6, '0')}`, objectType: 'Business VCard', objectId: `BVC-${String(b.id).padStart(6, '0')}`, description: 'Business VCard was published and is now visible to users.', previousValue: 'Draft', newValue: 'Published', status: 'Successful', source: 'MCOMVCard' },
      { activityId: `ACT-${String(b.id).padStart(6, '0')}-006`, action: 'Business Card created', time: relativeTime(72), type: 'card', actor: 'Business Owner', actorType: 'Business Owner', actorName: 'Business Owner', consumer: '', ref: `BC-${String(b.id).padStart(6, '0')}`, objectType: 'Business Card', objectId: `BC-${String(b.id).padStart(6, '0')}`, description: 'Business Card was created.', previousValue: 'Not Created', newValue: 'Draft', status: 'Successful', source: 'MCOMVCard' },
      { activityId: `ACT-${String(b.id).padStart(6, '0')}-007`, action: 'Card template assigned', time: relativeTime(72), type: 'card', actor: 'System', actorType: 'System', actorName: 'System', consumer: '', ref: `BC-${String(b.id).padStart(6, '0')}`, objectType: 'Business Card', objectId: `BC-${String(b.id).padStart(6, '0')}`, description: 'Business Card template was assigned.', previousValue: 'None', newValue: ['Premium Executive', 'Modern Tide', 'Bold Statement'][Math.floor(Math.random() * 3)], status: 'Successful', source: 'MCOMVCard' },
      { activityId: `ACT-${String(b.id).padStart(6, '0')}-008`, action: 'Consumer VCard issued', time: relativeTime(48), type: 'consumer', actor: 'System', actorType: 'System', actorName: 'System', consumer: 'Emma Rodriguez', ref: `CVC-${String(b.id).padStart(3, '0')}-001`, objectType: 'Consumer VCard', objectId: `CVC-${String(b.id).padStart(3, '0')}-001`, description: 'Consumer VCard issued to Emma Rodriguez as a reward.', previousValue: 'Unallocated', newValue: 'Allocated', status: 'Successful', source: 'MCOMVCard' },
      { activityId: `ACT-${String(b.id).padStart(6, '0')}-009`, action: 'Consumer Card allocated', time: relativeTime(36), type: 'consumer', actor: 'System', actorType: 'System', actorName: 'System', consumer: 'Mike Patel', ref: `CC-${String(b.id).padStart(3, '0')}-001`, objectType: 'Consumer Card', objectId: `CC-${String(b.id).padStart(3, '0')}-001`, description: 'Consumer Card allocated to Mike Patel via Business Allocation.', previousValue: 'Available', newValue: 'Allocated', status: 'Successful', source: 'MCOMVCard' },
      { activityId: `ACT-${String(b.id).padStart(6, '0')}-010`, action: 'Consumer VCard activated', time: relativeTime(24), type: 'consumer', actor: 'Consumer', actorType: 'Consumer', actorName: 'Emma Rodriguez', consumer: 'Emma Rodriguez', ref: `CVC-${String(b.id).padStart(3, '0')}-001`, objectType: 'Consumer VCard', objectId: `CVC-${String(b.id).padStart(3, '0')}-001`, description: 'Consumer VCard was activated by Emma Rodriguez.', previousValue: 'Pending', newValue: 'Active', status: 'Successful', source: 'MCOMVCard' },
      { activityId: `ACT-${String(b.id).padStart(6, '0')}-011`, action: 'Additional card allocated', time: relativeTime(12), type: 'consumer', actor: 'System', actorType: 'System', actorName: 'System', consumer: 'Sarah Wilson', ref: `SUB-${String(b.id).padStart(3, '0')}-001`, objectType: 'Consumer Card', objectId: `CC-${String(b.id).padStart(3, '0')}-002`, description: 'Additional family card allocated for Sarah Wilson.', previousValue: 'Unallocated', newValue: 'Family', status: 'Successful', source: 'MCOMVCard' },
      { activityId: `ACT-${String(b.id).padStart(6, '0')}-012`, action: 'Business Card activated', time: relativeTime(72), type: 'card', actor: 'Business Owner', actorType: 'Business Owner', actorName: 'Business Owner', consumer: '', ref: `BC-${String(b.id).padStart(6, '0')}`, objectType: 'Business Card', objectId: `BC-${String(b.id).padStart(6, '0')}`, description: 'Business Card was activated.', previousValue: 'Draft', newValue: 'Active', status: 'Successful', source: 'MCOMVCard' },
      { activityId: `ACT-${String(b.id).padStart(6, '0')}-013`, action: 'QR code regenerated', time: relativeTime(12), type: 'vcard', actor: 'Business Owner', actorType: 'Business Owner', actorName: 'Business Owner', consumer: '', ref: `BVC-${String(b.id).padStart(6, '0')}`, objectType: 'Business VCard', objectId: `BVC-${String(b.id).padStart(6, '0')}`, description: 'Business VCard QR code was regenerated.', previousValue: '', newValue: '', status: 'Successful', source: 'MCOMVCard' },
      { activityId: `ACT-${String(b.id).padStart(6, '0')}-014`, action: 'Admin allocation adjusted', time: relativeTime(6), type: 'admin', actor: 'Admin', actorType: 'Admin', actorName: 'Admin', consumer: '', ref: '', objectType: 'Allocation', objectId: `ALLOC-${String(b.id).padStart(6, '0')}`, description: 'Admin increased Consumer VCard allocation by 50 units (promotional).', previousValue: `${consumerVTotal}`, newValue: `${consumerVTotal + 50}`, status: 'Successful', source: 'MCOMVCard' },
      { activityId: `ACT-${String(b.id).padStart(6, '0')}-015`, action: 'MCOM Solutions connected', time: relativeTime(336), type: 'integration', actor: 'System', actorType: 'System', actorName: 'System', consumer: '', ref: '', objectType: 'Integration', objectId: `INT-${String(b.id).padStart(6, '0')}-001`, description: 'MCOM Solutions central authentication was connected.', previousValue: 'Disconnected', newValue: 'Connected', status: 'Successful', source: 'MCOM Solutions' },
    ].slice(0, Math.floor(Math.random() * 5) + 10), // each biz gets 10-14 activity items
    centralAccountId: `MCOM-BUS-${String(b.id).padStart(6, '0')}`,
    localBusinessId: `BUS-${String(b.id).padStart(6, '0')}`,
    accountType: 'Business',
    registrationSource: b.id === 1 ? 'MCOM Solutions' : b.id === 2 ? 'Admin Created' : b.id === 3 ? 'Existing MCOM Business' : b.id % 2 === 0 ? 'Imported' : 'External Platform',
    authenticationStatus: b.status === 'verified' ? 'Connected' : b.status === 'pending' ? 'Pending' : b.status === 'suspended' ? 'Suspended' : 'Connected',
    lastSuccessfulSync: new Date(Date.now() - Math.floor(Math.random() * 24) * 3600000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    lastAttemptedSync: new Date(Date.now() - 1 * 3600000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    syncStatus: b.id % 5 === 0 ? 'Failed' : 'Successful',
    syncError: b.id % 5 === 0 ? 'Unable to retrieve account information.' : '',
    accountStatus: b.status === 'verified' ? 'Active' : b.status === 'pending' ? 'Pending' : b.status === 'suspended' ? 'Suspended' : 'Active',
    ecosystemIds: { mcomVCard: `BUS-${String(b.id).padStart(6, '0')}`, mcomRewards: 'Not Connected', mcommall: 'Not Connected', mcomSpin: 'Not Connected', fundOrDonate: 'Not Connected' },
    integrations: [
      { platform: 'mcom_solutions', platformName: 'MCOM Solutions', purpose: 'Central Authentication & Identity', status: 'connected', externalBusinessId: `MCOM-BUS-${String(b.id).padStart(6, '0')}`, connectedAt: new Date(Date.now() - 365 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), lastSyncedAt: new Date(Date.now() - Math.floor(Math.random() * 24) * 3600000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), syncStatus: 'successful', dataOwner: 'MCOM Solutions', mcomVCardRole: 'Authentication & Identity Provider' },
      { platform: 'mcom_rewards', platformName: 'MCOM Rewards', purpose: 'Rewards & Loyalty', status: 'coming-soon', externalBusinessId: null, connectedAt: null, lastSyncedAt: null, syncStatus: null, dataOwner: 'MCOM Rewards', mcomVCardRole: 'Display/consume reward data' },
      { platform: 'mcommall', platformName: 'MCOMMall', purpose: 'Cashback', status: 'coming-soon', externalBusinessId: null, connectedAt: null, lastSyncedAt: null, syncStatus: null, dataOwner: 'MCOMMall', mcomVCardRole: 'Display/consume cashback data' },
      { platform: 'mcom_spin', platformName: 'MCOMSpin', purpose: 'Gamification', status: 'coming-soon', externalBusinessId: null, connectedAt: null, lastSyncedAt: null, syncStatus: null, dataOwner: 'MCOMSpin', mcomVCardRole: 'Display/consume gamification data' },
      { platform: 'fund_donate', platformName: 'FundOrDonate', purpose: 'Fundraising & Donations', status: 'coming-soon', externalBusinessId: null, connectedAt: null, lastSyncedAt: null, syncStatus: null, dataOwner: 'FundOrDonate', mcomVCardRole: 'Display/consume fundraising data' },
    ],
    integrationActivity: [
      { id: `IA-${String(b.id).padStart(6, '0')}-001`, date: new Date(Date.now() - 1 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), action: 'MCOM Solutions Account Synced', status: 'successful', platform: 'MCOM Solutions' },
      { id: `IA-${String(b.id).padStart(6, '0')}-002`, date: new Date(Date.now() - 2 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), action: 'MCOM Rewards Connection Attempted', status: 'coming-soon', platform: 'MCOM Rewards' },
      { id: `IA-${String(b.id).padStart(6, '0')}-003`, date: new Date(Date.now() - 7 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), action: 'MCOMMall Integration Requested', status: 'pending', platform: 'MCOMMall' },
    ],
  }
})

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-100 dark:bg-gray-700 rounded animate-pulse ${className}`} />
}

function LoadingTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4"><SkeletonBlock className="h-20" /><SkeletonBlock className="h-20" /><SkeletonBlock className="h-20" /></div>
      <SkeletonBlock className="h-32" />
      <div className="grid grid-cols-2 gap-4"><SkeletonBlock className="h-24" /><SkeletonBlock className="h-24" /></div>
    </div>
  )
}

function EmptyState({ icon, title, desc, action }: { icon: string; title: string; desc: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
        <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} /></svg>
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{title}</p>
      <p className="text-xs text-gray-400 max-w-sm mb-3">{desc}</p>
      {action && <button onClick={action.onClick} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">{action.label}</button>}
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-3">
        <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{message}</p>
      <button onClick={onRetry} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Retry</button>
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = { Active: 'bg-green-500', Inactive: 'bg-gray-400', 'Not Created': 'bg-gray-300', Suspended: 'bg-red-500', Pending: 'bg-yellow-500', Expired: 'bg-red-400', Connected: 'bg-green-500', 'Coming Soon': 'bg-gray-300', Draft: 'bg-yellow-500', Archived: 'bg-gray-400' }
  return <span className={`w-2 h-2 rounded-full ${colors[status] || 'bg-gray-400'} shrink-0`} />
}

function Badge({ status, variant = 'default' }: { status: string; variant?: 'default' | 'dot' }) {
  const colors: Record<string, string> = {
    Active: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300',
    Inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-500',
    'Not Created': 'bg-gray-100 dark:bg-gray-700 text-gray-400',
    Suspended: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300',
    Pending: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
    Expired: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    Connected: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300',
    'Coming Soon': 'bg-gray-100 dark:bg-gray-700 text-gray-500',
    verified: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300',
    pending: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
    suspended: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300',
    Draft: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
    Archived: 'bg-gray-100 dark:bg-gray-700 text-gray-500',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${colors[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
      {variant === 'dot' && <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'Active' || status === 'Connected' || status === 'verified' ? 'bg-green-500' :
        status === 'Pending' || status === 'pending' || status === 'Draft' ? 'bg-yellow-500' :
        status === 'Suspended' || status === 'suspended' || status === 'Expired' ? 'bg-red-500' : 'bg-gray-400'
      }`} />}
      {status}
    </span>
  )
}

export default function BusinessProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const biz = bizData.find(b => b.id === Number(id)) || bizData[0]
  const [tab, setTab] = useState('Overview')
  const [subTab, setSubTab] = useState<'vcards' | 'cards'>('vcards')
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Unable to Load Business</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">We couldn't retrieve this business's data right now.</p>
        <button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 500) }} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600">Try Again</button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-64" />
      </div>
    )
  }

  const renderTabContent = () => {
    switch (tab) {
      case 'Overview': return <OverviewTab biz={biz as any} onTabChange={setTab} onSubTabChange={setSubTab as (v: string) => void} />
      case 'Business VCard': return <BusinessVCardTab biz={biz as any} />
      case 'Business Card': return <BusinessCardTab biz={biz as any} />
      case 'Consumer Cards': return <ConsumerCardsTab biz={biz as any} subTab={subTab} setSubTab={setSubTab} />
      case 'Membership & Allocation': return <MembershipTab biz={biz as any} />
      case 'Activity': return <ActivityTab biz={biz as any} />
      case 'Account & Integrations': return <IntegrationsTab biz={biz as any} />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <Helmet><title>{biz.name} - Business Details - MCOM VCard</title></Helmet>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Link to="/admin/businesses" className="hover:text-orange-600">Businesses</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 dark:text-white font-medium">{biz.name}</span>
      </div>

      {/* Business Context Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-md">
              {biz.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">{biz.name}</h1>
                <Badge status={biz.status} variant="dot" />
                <Badge status={biz.membership} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 space-x-2">
                <span className="font-mono text-gray-400">{biz.businessId}</span>
                <span>·</span>
                <span>{biz.industry}</span>
                <span>·</span>
                <span>{biz.address.split(',')[0]}</span>
                <span>·</span>
                <span>Owner: {biz.owner}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 space-x-2">
                <span>{biz.email}</span>
                <span>·</span>
                <span>{biz.phone}</span>
                <span>·</span>
                <span>Joined: {biz.joined}</span>
                <span>·</span>
                <span>Last active: {biz.lastActiveLabel}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => toast.success('Edit mode opened')} className="px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25">Edit Business</button>
            <button onClick={() => setShowSuspendModal(true)} className="px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">Suspend</button>
            <div className="relative">
              <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
              </button>
              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1.5 z-50" onClick={() => setShowMoreMenu(false)} onMouseLeave={() => setShowMoreMenu(false)}>
                  <button onClick={() => { window.open(biz.businessVCard.url, '_blank'); toast.success('Opening public VCard') }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">View Public VCard</button>
                  <button onClick={() => { window.open(biz.businessCard.url, '_blank'); toast.success('Opening public Card') }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">View Public Card</button>
                  <button onClick={() => { navigator.clipboard.writeText(biz.businessId); toast.success('Business ID copied') }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Copy Business ID</button>
                  <button onClick={() => setTab('Activity')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">View Audit Log</button>
                  <button onClick={() => toast.success('Export started')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Export Business Data</button>
                  <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                  {biz.status === 'suspended' ? (
                    <button onClick={() => toast.success('Business reactivated')} className="w-full text-left px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700">Reactivate Business</button>
                  ) : (
                    <button onClick={() => setShowSuspendModal(true)} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700">Suspend Business</button>
                  )}
                </div>
              )}
            </div>
            <button onClick={() => navigate(-1)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Back</button>
          </div>
        </div>

        {/* Status Mini Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
          {[
            { label: 'Account', value: biz.status === 'verified' ? 'Active' : biz.status === 'pending' ? 'Pending' : 'Suspended', color: biz.status === 'verified' ? 'text-green-600' : biz.status === 'pending' ? 'text-yellow-600' : 'text-red-600' },
            { label: 'Membership', value: biz.membershipStatus, color: biz.membershipStatus === 'Active' ? 'text-green-600' : biz.membershipStatus === 'Pending' ? 'text-yellow-600' : 'text-red-400' },
            { label: 'Business VCard', value: biz.businessVCard.status, color: biz.businessVCard.status === 'Active' ? 'text-green-600' : 'text-gray-400' },
            { label: 'Business Card', value: biz.businessCard.status, color: biz.businessCard.status === 'Active' ? 'text-orange-600' : 'text-gray-400' },
            { label: 'Central Account', value: 'Connected', color: 'text-green-600' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2.5 flex items-center gap-2.5">
              <StatusDot status={s.value} />
              <div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{s.label}</p>
                <p className={`text-xs font-bold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-700 px-4">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}>{t}</button>
          ))}
        </div>
        <div className="p-5">{renderTabContent()}</div>
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowSuspendModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Suspend Business?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This will temporarily disable this business's MCOMVCard activities. This action can be reversed.</p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><span className="text-gray-500">Business VCard</span><span className="font-medium text-green-600">Active → Disabled</span></div>
              <div className="flex justify-between text-xs px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><span className="text-gray-500">Business Card</span><span className="font-medium text-green-600">Active → Disabled</span></div>
              <div className="flex justify-between text-xs px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><span className="text-gray-500">Consumer Card Issuance</span><span className="font-medium text-orange-600">Disabled</span></div>
            </div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Reason for suspension</label>
            <select className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
              {SUSPEND_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowSuspendModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={() => { toast.success(`${biz.name} has been suspended`); setShowSuspendModal(false) }} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600">Suspend Business</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ===== OVERVIEW TAB ===== */
function OverviewTab({ biz, onTabChange, onSubTabChange }: { biz: any; onTabChange: (tab: string) => void; onSubTabChange?: (v: 'vcards' | 'cards') => void }) {
  const [ovState, setOvState] = useState<'loading' | 'ready' | 'error' | 'sectionError'>('ready')
  if (ovState === 'loading') return <LoadingTab />
  if (ovState === 'error') return <ErrorState message="Unable to load Business Overview." onRetry={() => setOvState('ready')} />

  const vPct = biz.consumerVTotal > 0 ? Math.round((biz.vcardsUsed / biz.consumerVTotal) * 100) : 0
  const cPct = biz.consumerCTotal > 0 ? Math.round((biz.cardsUsed / biz.consumerCTotal) * 100) : 0

  const activityDrillDown = (a: any) => {
    const typeTabs: Record<string, string> = { vcard: 'Business VCard', card: 'Business Card', consumer: 'Consumer Cards', membership: 'Membership & Allocation', account: 'Account & Integrations' }
    onTabChange(typeTabs[a.type] || 'Activity')
  }

  return (
    <div className="space-y-6">
      {/* Business Status — 5 clickable cards */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Business Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Account', value: biz.status === 'verified' ? 'Active' : biz.status === 'pending' ? 'Pending' : 'Suspended', status: biz.status === 'verified' ? 'Active' : biz.status === 'pending' ? 'Pending' : 'Suspended', onClick: () => onTabChange('Account & Integrations') },
            { label: 'Membership', value: biz.membershipStatus, status: biz.membershipStatus, onClick: () => onTabChange('Membership & Allocation') },
            { label: 'Business VCard', value: biz.businessVCard.status, status: biz.businessVCard.status, onClick: () => onTabChange('Business VCard') },
            { label: 'Business Card', value: biz.businessCard.status, status: biz.businessCard.status, onClick: () => onTabChange('Business Card') },
            { label: 'Central Account', value: 'Connected', status: 'Connected', onClick: () => onTabChange('Account & Integrations') },
          ].map((s) => (
            <button key={s.label} onClick={s.onClick} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{s.label}</p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <StatusDot status={s.status} />
                <span className="text-xs font-bold text-gray-900 dark:text-white">{s.value}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Membership & Allocation Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Membership & Allocation</h3>
          <button onClick={() => onTabChange('Membership & Allocation')} className="text-[11px] text-orange-600 hover:underline font-medium">Manage Membership & Allocation</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-orange-50 dark:bg-orange-500/5 rounded-lg p-4">
            <p className="text-[10px] text-orange-600 dark:text-orange-400 font-medium mb-1">Plan</p>
            <p className="text-base font-bold text-gray-900 dark:text-white">{biz.membership}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <StatusDot status={biz.membershipStatus} />
              <span className="text-xs text-gray-500 dark:text-gray-400">{biz.membershipStatus}</span>
            </div>
          </div>
          <button onClick={() => onTabChange('Membership & Allocation')} className="text-left">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 h-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mb-2">Consumer VCard Allocation</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-lg font-bold text-gray-900 dark:text-white">{biz.vcardsUsed}</span>
                <span className="text-xs text-gray-400">/ {biz.consumerVTotal} Used</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px] text-gray-500 mb-2">
                <span>{biz.consumerVTotal} Total</span>
                <span>{biz.consumerVTotal - biz.vcardsUsed} Available</span>
                <span>{vPct}% Used</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${vPct >= 90 ? 'bg-red-500' : vPct >= 80 ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${vPct}%` }} />
              </div>
              {vPct >= 90 && (
                <p className="text-[10px] text-red-600 dark:text-red-400 mt-2 font-medium">
                  {vPct >= 100 ? 'No Consumer VCard allocation remaining.' : `Consumer VCard allocation is almost exhausted (${biz.vcardsUsed} of ${biz.consumerVTotal} issued).`}
                </p>
              )}
            </div>
          </button>
          <button onClick={() => onTabChange('Membership & Allocation')} className="text-left">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 h-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mb-2">Consumer Card Allocation</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-lg font-bold text-gray-900 dark:text-white">{biz.cardsUsed}</span>
                <span className="text-xs text-gray-400">/ {biz.consumerCTotal} Used</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px] text-gray-500 mb-2">
                <span>{biz.consumerCTotal} Total</span>
                <span>{biz.consumerCTotal - biz.cardsUsed} Available</span>
                <span>{cPct}% Used</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${cPct >= 90 ? 'bg-red-500' : cPct >= 80 ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${cPct}%` }} />
              </div>
              {cPct >= 90 && (
                <p className="text-[10px] text-red-600 dark:text-red-400 mt-2 font-medium">
                  {cPct >= 100 ? 'No Consumer Card allocation remaining.' : `Consumer Card allocation is almost exhausted (${biz.cardsUsed} of ${biz.consumerCTotal} issued).`}
                </p>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Card Overview — VCard + Card side by side */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Card Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-500/5 rounded-xl border border-blue-100 dark:border-blue-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">Business VCard</span>
              <Badge status={biz.businessVCard.status} />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-3">
              <div><span className="text-blue-600 dark:text-blue-400">Last Updated</span><p className="font-medium text-blue-900 dark:text-blue-100">{biz.businessVCard.updated || '--'}</p></div>
              <div><span className="text-blue-600 dark:text-blue-400">Public</span><p className="font-medium text-blue-900 dark:text-blue-100">{biz.businessVCard.status === 'Active' ? 'Yes' : 'No'}</p></div>
              <div><span className="text-blue-600 dark:text-blue-400">QR Code</span><p className="font-medium text-blue-900 dark:text-blue-100">{biz.businessVCard.status === 'Active' ? 'Active' : 'Inactive'}</p></div>
              <div><span className="text-blue-600 dark:text-blue-400">Views</span><p className="font-medium text-blue-900 dark:text-blue-100">{biz.businessVCard.views?.toLocaleString() || '0'}</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { window.open(biz.businessVCard.url, '_blank'); toast.success('Opening public VCard') }} className="px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-700 text-[10px] font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/10">Preview</button>
              <button onClick={() => onTabChange('Business VCard')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Manage</button>
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-500/5 rounded-xl border border-orange-100 dark:border-orange-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-orange-800 dark:text-orange-300">Business Card</span>
              <Badge status={biz.businessCard.status} />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-3">
              <div><span className="text-orange-600 dark:text-orange-400">Last Updated</span><p className="font-medium text-orange-900 dark:text-orange-100">{biz.businessCard.updated || '--'}</p></div>
              <div><span className="text-orange-600 dark:text-orange-400">Public</span><p className="font-medium text-orange-900 dark:text-orange-100">{biz.businessCard.status === 'Active' ? 'Yes' : 'No'}</p></div>
              <div><span className="text-orange-600 dark:text-orange-400">QR Code</span><p className="font-medium text-orange-900 dark:text-orange-100">{biz.businessCard.status === 'Active' ? 'Active' : 'Inactive'}</p></div>
              <div><span className="text-orange-600 dark:text-orange-400">Scans</span><p className="font-medium text-orange-900 dark:text-orange-100">{biz.businessCard.scans?.toLocaleString() || '0'}</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { window.open(biz.businessCard.url, '_blank'); toast.success('Opening public Card') }} className="px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-700 text-[10px] font-medium text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-500/10">Preview</button>
              <button onClick={() => onTabChange('Business Card')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Manage</button>
            </div>
          </div>
        </div>
      </div>

      {/* Consumer Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Consumer Summary</h3>
          <button onClick={() => onTabChange('Consumer Cards')} className="text-[11px] text-orange-600 hover:underline font-medium">View Consumer Cards</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button onClick={() => onTabChange('Consumer Cards')} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{biz.totalConsumers}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Total Consumers</p>
          </button>
          <button onClick={() => { onTabChange('Consumer Cards'); onSubTabChange?.('vcards') }} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{biz.consumersWithVCards}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">VCard Holders</p>
          </button>
          <button onClick={() => { onTabChange('Consumer Cards'); onSubTabChange?.('cards') }} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{biz.consumersWithCards}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Card Holders</p>
          </button>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 text-center">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{biz.consumersWithFF}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Additional Cards</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          <button onClick={() => onTabChange('Activity')} className="text-[11px] text-orange-600 hover:underline font-medium">View All Activity</button>
        </div>
        {biz.activity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No recent activity.</p>
            <p className="text-xs text-gray-400 mt-1">Activity will appear here when actions are performed on this business.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {biz.activity.slice(0, 6).map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg px-2 -mx-2 transition-colors" onClick={() => activityDrillDown(a)}>
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  a.type === 'vcard' ? 'bg-blue-500' : a.type === 'card' ? 'bg-orange-500' : a.type === 'consumer' ? 'bg-green-500' : a.type === 'membership' ? 'bg-purple-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{a.action}</p>
                    {a.consumer && <span className="text-xs text-gray-400">— {a.consumer}</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time} · by {a.actor}</p>
                </div>
                {a.ref && <span className="text-[10px] text-gray-400 font-mono shrink-0">{a.ref}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Integration Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Integration Status</h3>
          <button onClick={() => onTabChange('Account & Integrations')} className="text-[11px] text-orange-600 hover:underline font-medium">View Account & Integrations</button>
        </div>
        <div className="space-y-2">
          {[
            { name: 'MCOM Solutions', status: 'Connected', color: 'text-green-700 dark:text-green-400', dot: 'bg-green-500', onClick: () => onTabChange('Account & Integrations') },
            { name: 'MCOM Rewards / 247GBS Rewards', status: 'Coming Soon', color: 'text-gray-400', dot: 'bg-gray-300 dark:bg-gray-600', onClick: () => toast.success('MCOM Rewards integration is coming soon.') },
            { name: 'MCOMMall Cashback', status: 'Coming Soon', color: 'text-gray-400', dot: 'bg-gray-300 dark:bg-gray-600', onClick: () => toast.success('MCOMMall Cashback integration is coming soon.') },
            { name: 'MCOMSpin', status: 'Coming Soon', color: 'text-gray-400', dot: 'bg-gray-300 dark:bg-gray-600', onClick: () => toast.success('MCOMSpin integration is coming soon.') },
            { name: 'FundOrDonate', status: 'Coming Soon', color: 'text-gray-400', dot: 'bg-gray-300 dark:bg-gray-600', onClick: () => toast.success('FundOrDonate integration is coming soon.') },
          ].map((int) => (
            <button key={int.name} onClick={int.onClick} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <span className={`w-2 h-2 rounded-full shrink-0 ${int.dot}`} />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">{int.name}</span>
              <span className={`text-[11px] font-medium ${int.color}`}>{int.status}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ===== BUSINESS VCARD TAB ===== */
const VCARD_SECTIONS = ['Overview', 'Content', 'Share', 'Exchange', 'Redeem', 'Dynamic QR', 'Preview', 'Publishing', 'Integrations', 'Activity'] as const
const CONTENT_SUBSECTIONS = ['Basic Information', 'Brand & Appearance', 'Business Profile', 'Contact', 'Location', 'Products & Services', 'Offers', 'Events'] as const

function BusinessVCardTab({ biz }: { biz: any }) {
  const [vSection, setVSection] = useState<string>('Overview')
  const [cSub, setCSub] = useState<string>('Basic Information')
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('ready')
  const [vMoreMenu, setVMoreMenu] = useState(false)
  const [vPreviewMode, setVPreviewMode] = useState<'desktop' | 'mobile'>('desktop')

  if (state === 'loading') return <LoadingTab />
  if (state === 'error') return <ErrorState message="Unable to load Business VCard." onRetry={() => setState('ready')} />
  if (biz.businessVCard.status === 'Not Created') {
    return (
      <EmptyState
        icon="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1"
        title="No Business VCard Yet"
        desc={biz.membership === 'Free' ? "This business's membership does not currently include a Business VCard allocation." : 'This business has not created its Business VCard yet.'}
        action={{ label: biz.membership === 'Free' ? 'View Membership & Allocation' : 'Create Business VCard', onClick: () => toast.success(biz.membership === 'Free' ? 'Opening Membership & Allocation' : 'Business VCard creation started') }}
      />
    )
  }

  const v = biz.businessVCard
  const status = v.status
  const isPublished = status === 'Published' || status === 'Active'
  const isDraft = status === 'Draft' || status === 'Not Created'
  const isSuspended = status === 'Suspended'

  const renderVCardContent = () => {
    switch (vSection) {
      /* ── Overview ── */
      case 'Overview': return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">VCard Preview</span>
                <div className="flex gap-2">
                  <span className="text-[10px] text-gray-400">Completion: <span className="font-semibold text-gray-700 dark:text-gray-300">80%</span></span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 max-w-[320px]">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg p-4 text-white text-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 mx-auto mb-2 flex items-center justify-center text-xl font-bold">{biz.name.charAt(0)}</div>
                  <p className="font-semibold text-sm">{biz.name}</p>
                  <p className="text-[11px] text-white/80">{biz.description?.slice(0, 60) || 'Premium business services'}</p>
                </div>
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>{biz.email}</div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>{biz.phone}</div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 truncate"><svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg><span className="truncate">{biz.website}</span></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-500/5 rounded-lg p-3">
                <p className="text-[10px] text-blue-600 dark:text-blue-400">Total Views</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{v.views?.toLocaleString() || '--'}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-500/5 rounded-lg p-3">
                <p className="text-[10px] text-purple-600 dark:text-purple-400">Total Shares</p>
                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{v.shares?.toLocaleString() || '--'}</p>
              </div>
              <div className="bg-teal-50 dark:bg-teal-500/5 rounded-lg p-3">
                <p className="text-[10px] text-teal-600 dark:text-teal-400">Exchanges</p>
                <p className="text-lg font-bold text-teal-900 dark:text-teal-100">Coming Soon</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-500/5 rounded-lg p-3">
                <p className="text-[10px] text-orange-600 dark:text-orange-400">Redemptions</p>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-100">Coming Soon</p>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>Created: {v.created || biz.joined} · Last updated: {v.updated || '--'}</p>
              <p>Public URL: <span className="text-orange-600 font-mono text-[10px]">{v.url}</span> <button onClick={() => { navigator.clipboard.writeText(v.url); toast.success('URL copied') }} className="text-orange-600 hover:underline ml-1">Copy</button></p>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">QR Code</h4>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center mb-3">
                  <svg className="w-20 h-20 text-gray-900 dark:text-white" viewBox="0 0 100 100"><rect x="10" y="10" width="30" height="30" fill="currentColor" rx="2" /><rect x="10" y="60" width="30" height="30" fill="currentColor" rx="2" /><rect x="60" y="10" width="30" height="30" fill="currentColor" rx="2" /><rect x="50" y="50" width="8" height="8" fill="currentColor" /><rect x="65" y="50" width="8" height="8" fill="currentColor" /><rect x="80" y="50" width="8" height="8" fill="currentColor" /><rect x="50" y="65" width="8" height="25" fill="currentColor" /><rect x="65" y="65" width="20" height="8" fill="currentColor" /><rect x="65" y="80" width="20" height="8" fill="currentColor" /><rect x="50" y="50" width="8" height="8" fill="currentColor" /></svg>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button onClick={() => toast.success('QR downloaded')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Download QR</button>
                  <button onClick={() => { navigator.clipboard.writeText(v.url); toast.success('Link copied') }} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Copy Link</button>
                  <button onClick={() => toast.success('QR regenerated')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Regenerate</button>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">VCard Analytics</h4>
              <div className="space-y-3">
                {[
                  { label: 'Total Views', value: v.views?.toLocaleString() || '--', color: 'text-blue-600' },
                  { label: 'Total Shares', value: v.shares?.toLocaleString() || '--', color: 'text-purple-600' },
                  { label: 'QR Scans', value: v.scans?.toLocaleString() || '--', color: 'text-teal-600' },
                  { label: 'Exchanges', value: 'Coming Soon', color: 'text-gray-400' },
                  { label: 'Redemptions', value: 'Coming Soon', color: 'text-gray-400' },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{m.label}</span>
                    <span className={`text-xs font-bold ${m.color}`}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )

      /* ── Content ── */
      case 'Content': return (
        <div>
          <div className="flex gap-4 border-b border-gray-100 dark:border-gray-700 mb-5 overflow-x-auto">
            {CONTENT_SUBSECTIONS.map((s) => (
              <button key={s} onClick={() => setCSub(s)} className={`pb-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${cSub === s ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>{s}</button>
            ))}
          </div>
          {cSub === 'Basic Information' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Business Name', value: biz.name, source: 'MCOM Solutions', editable: true },
                { label: 'Display Name', value: biz.name, source: 'VCard', editable: true },
                { label: 'Short Description', value: biz.description?.slice(0, 120) || 'Premium business services', source: 'VCard', editable: true },
                { label: 'Full Description', value: 'Full business description can be managed here. This appears on the public VCard.', source: 'VCard', editable: true },
                { label: 'Business Category', value: biz.industry, source: 'MCOM Solutions', editable: false },
                { label: 'Subcategory', value: '— Select —', source: 'VCard', editable: true },
              ].map((f) => (
                <div key={f.label} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{f.label}</span>
                    <span className={`text-[9px] font-medium ${f.source === 'MCOM Solutions' ? 'text-blue-500' : 'text-gray-400'}`}>{f.source === 'MCOM Solutions' ? 'Managed by MCOM' : 'VCard'}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{f.value}</p>
                  {f.editable && <button onClick={() => toast.success(`Editing ${f.label}`)} className="text-[10px] text-orange-600 hover:underline mt-1">Edit</button>}
                </div>
              ))}
            </div>
          )}
          {cSub === 'Brand & Appearance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">Logo</p>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">{biz.name.charAt(0)}</div>
                  <button onClick={() => toast.success('Logo upload')} className="text-[10px] text-orange-600 hover:underline mt-2 block">Change Logo</button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">Cover Image</p>
                  <div className="w-full h-20 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-gray-400 text-[10px]">No cover image set</div>
                  <button onClick={() => toast.success('Cover upload')} className="text-[10px] text-orange-600 hover:underline mt-2 block">Upload Cover</button>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-3">Template & Branding</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['Premium Executive', 'Modern Tide', 'Bold Statement', 'Royal Purple'].map((t) => (
                    <button key={t} onClick={() => toast.success(`Template: ${t}`)} className={`p-3 rounded-lg border text-center transition-colors ${t === 'Premium Executive' ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                      <div className="w-full h-8 rounded bg-gradient-to-r from-gray-900 to-gray-700 mb-1" />
                      <span className="text-[9px] text-gray-600 dark:text-gray-400">{t}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Admin controls available templates. Businesses choose from approved templates.</p>
              </div>
            </div>
          )}
          {cSub === 'Business Profile' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'About the Business', value: biz.description || 'Business description not yet provided.', multiline: true },
                { label: 'Business Story', value: 'Share the story behind your business.', multiline: true },
                { label: 'Years in Operation', value: `${new Date().getFullYear() - 2020}+ years` },
                { label: 'Key Services', value: biz.industry === 'Cafe' ? 'Coffee, Pastries, Catering' : biz.industry === 'Technology' ? 'Software, Consulting, Support' : 'Consulting, Support' },
                { label: 'Areas Served', value: biz.address?.split(',')[0] || 'Local area' },
              ].map((f: any) => (
                <div key={f.label} className={`bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 ${f.multiline ? 'sm:col-span-2' : ''}`}>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">{f.label}</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{f.value}</p>
                  <button onClick={() => toast.success(`Editing ${f.label}`)} className="text-[10px] text-orange-600 hover:underline mt-1">Edit</button>
                </div>
              ))}
            </div>
          )}
          {cSub === 'Contact' && (
            <div className="space-y-4">
              {[
                { label: 'Phone', value: biz.phone, visible: true },
                { label: 'Email', value: biz.email, visible: true },
                { label: 'Website', value: biz.website, visible: true },
                { label: 'WhatsApp', value: '+1 (555) 000-0000', visible: true },
                { label: 'Address', value: biz.address, visible: true },
                { label: 'Opening Hours', value: 'Mon–Fri: 9:00–18:00 · Sat: 10:00–16:00', visible: true },
              ].map((f) => (
                <div key={f.label} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                  <div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{f.label}</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{f.value}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] ${f.visible ? 'text-green-600' : 'text-gray-400'}`}>{f.visible ? 'Visible' : 'Hidden'}</span>
                    <button onClick={() => toast.success(`${f.label} visibility toggled`)} className="text-[10px] text-orange-600 hover:underline">Toggle</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {cSub === 'Location' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Address', value: biz.address },
                  { label: 'Postcode', value: 'EC1A 1BB' },
                  { label: 'City', value: biz.address?.split(',')[0] || 'London' },
                  { label: 'Borough', value: 'Westminster' },
                  { label: 'High Street', value: 'Oxford Street' },
                ].map((f) => (
                  <div key={f.label} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{f.label}</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{f.value}</p>
                    <button onClick={() => toast.success(`Editing ${f.label}`)} className="text-[10px] text-orange-600 hover:underline mt-1">Edit</button>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">MCOMMall Location Integration</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Connect to MCOMMall for location-based services and local business discovery.</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-500">Coming Soon</span>
                </div>
              </div>
            </div>
          )}
          {cSub === 'Products & Services' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage products and services displayed on the Business VCard.</p>
                <button onClick={() => toast.success('Add product/service')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">+ Add</button>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Coffee & Beverages', desc: 'Speciality coffee, tea, and refreshments', price: '£3–£8' },
                  { name: 'Pastries & Snacks', desc: 'Freshly baked pastries and light snacks', price: '£2–£6' },
                  { name: 'Catering Services', desc: 'Full catering for events and corporate orders', price: 'Custom' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.desc} · {p.price}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => toast.success(`Edit ${p.name}`)} className="text-[10px] text-orange-600 hover:underline">Edit</button>
                      <button onClick={() => toast.success(`${p.name} removed`)} className="text-[10px] text-red-500 hover:underline">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">MCOMMall Product Integration</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-500">Coming Soon</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Products synced from MCOMMall will appear here automatically.</p>
              </div>
            </div>
          )}
          {cSub === 'Offers' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">Special offers, discounts, and promotions displayed on the VCard.</p>
                <button onClick={() => toast.success('New offer created')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">+ Create Offer</button>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Morning Coffee Deal', desc: 'Buy one get one free on all coffee before 11am', expires: 'Expires 31 Aug 2026' },
                  { name: 'Loyalty Discount', desc: '10% off on your 5th visit', expires: 'No expiry' },
                ].map((o, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{o.name}</p>
                      <p className="text-xs text-gray-500">{o.desc} · {o.expires}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => toast.success(`Edit ${o.name}`)} className="text-[10px] text-orange-600 hover:underline">Edit</button>
                      <button onClick={() => toast.success(`${o.name} removed`)} className="text-[10px] text-red-500 hover:underline">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">External Offer Integration</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-500">Coming Soon</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Offers can be managed dynamically once connected to the MCOM platform.</p>
              </div>
            </div>
          )}
          {cSub === 'Events' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">Events connected to this business displayed on the VCard.</p>
                <button onClick={() => toast.success('New event created')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">+ Create Event</button>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Summer Coffee Festival', date: '15 Aug 2026', desc: 'Annual community coffee festival with live music' },
                  { name: 'Business Networking Hour', date: 'Every Thursday', desc: 'Weekly networking event for local businesses' },
                ].map((e, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{e.name}</p>
                      <p className="text-xs text-gray-500">{e.date} · {e.desc}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => toast.success(`Edit ${e.name}`)} className="text-[10px] text-orange-600 hover:underline">Edit</button>
                      <button onClick={() => toast.success(`${e.name} removed`)} className="text-[10px] text-red-500 hover:underline">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Event Integration</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-500">Coming Soon</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Connect to 247GBS Expo / MCOM event systems for dynamic event management.</p>
              </div>
            </div>
          )}
        </div>
      )

      /* ── Share ── */
      case 'Share': return (
        <div className="max-w-2xl space-y-5">
          <p className="text-xs text-gray-500 dark:text-gray-400">Configure how this Business VCard is shared. Share content including the business, products, services, offers, and events.</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', label: 'Copy Link', desc: 'Share a direct link to the VCard', action: () => { navigator.clipboard.writeText(v.url); toast.success('Link copied') } },
              { icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1', label: 'Share on WhatsApp', desc: 'Share via WhatsApp', action: () => toast.success('Opening WhatsApp share') },
              { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Share via Email', desc: 'Share business details via email', action: () => toast.success('Opening email share') },
              { icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z', label: 'Share via QR', desc: 'Display QR code for instant sharing', action: () => toast.success('QR share displayed') },
            ].map((s) => (
              <button key={s.label} onClick={s.action} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={s.icon} /></svg>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{s.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{s.desc}</p>
              </button>
            ))}
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Share Configuration</h4>
            <div className="space-y-2 text-xs">
              {['Share Business', 'Share VCard', 'Share Products', 'Share Offers', 'Share Events'].map((item) => (
                <label key={item} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )

      /* ── Exchange ── */
      case 'Exchange': return (
        <div className="max-w-2xl space-y-5">
          <p className="text-xs text-gray-500 dark:text-gray-400">Configure contact and business information exchange settings for this VCard.</p>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Exchange Settings</h4>
            <div className="space-y-3">
              {[
                { label: 'Business Name', desc: 'Shared when exchanging', enabled: true },
                { label: 'Contact Information', desc: 'Phone, email, and website', enabled: true },
                { label: 'Business Address', desc: 'Physical location details', enabled: true },
                { label: 'Social Links', desc: 'Social media profiles', enabled: false },
                { label: 'Products & Services', desc: 'Business offerings', enabled: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-[10px] text-gray-500">{item.desc}</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className={`text-[10px] ${item.enabled ? 'text-green-600' : 'text-gray-400'}`}>{item.enabled ? 'Enabled' : 'Disabled'}</span>
                    <input type="checkbox" defaultChecked={item.enabled} className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500" />
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Exchange Confirmation</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Require confirmation before information is exchanged.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
              </label>
            </div>
          </div>
        </div>
      )

      /* ── Redeem ── */
      case 'Redeem': return (
        <div className="max-w-2xl space-y-5">
          <p className="text-xs text-gray-500 dark:text-gray-400">Redemption functionality allows consumers to redeem rewards, offers, vouchers, and other benefits through this VCard.</p>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            </div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Rewards & Redemption Integration</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Redemption functionality will be available when connected to MCOM Rewards / 247GBS Rewards.</p>
            <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-500">Coming Soon</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Redemption Entry Points</h4>
            <div className="space-y-2 text-xs">
              {['VCard Redemption Button', 'QR Code Redirection', 'Offer Redemption', 'Reward Code Entry'].map((item) => (
                <label key={item} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )

      /* ── Dynamic QR ── */
      case 'Dynamic QR': return (
        <div className="max-w-2xl space-y-5">
          <p className="text-xs text-gray-500 dark:text-gray-400">Configure dynamic QR code behaviour. The destination can be updated without reprinting the QR code.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 flex flex-col items-center">
              <div className="w-28 h-28 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center mb-3">
                <svg className="w-20 h-20 text-gray-900 dark:text-white" viewBox="0 0 100 100"><rect x="10" y="10" width="30" height="30" fill="currentColor" rx="2" /><rect x="10" y="60" width="30" height="30" fill="currentColor" rx="2" /><rect x="60" y="10" width="30" height="30" fill="currentColor" rx="2" /><rect x="50" y="50" width="8" height="8" fill="currentColor" /><rect x="65" y="50" width="8" height="8" fill="currentColor" /><rect x="80" y="50" width="8" height="8" fill="currentColor" /><rect x="50" y="65" width="8" height="25" fill="currentColor" /><rect x="65" y="65" width="20" height="8" fill="currentColor" /><rect x="65" y="80" width="20" height="8" fill="currentColor" /><rect x="50" y="50" width="8" height="8" fill="currentColor" /></svg>
              </div>
              <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">Main Business QR</p>
              <p className="text-[10px] text-gray-400">Dynamic · Destination: VCard</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => toast.success('QR downloaded')} className="px-3 py-1 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Download</button>
                <button onClick={() => toast.success('QR regenerated')} className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Regenerate</button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                <label className="text-[10px] text-gray-500 block mb-1">QR Code Name</label>
                <input type="text" defaultValue="Main Business QR" className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                <label className="text-[10px] text-gray-500 block mb-1">QR Type</label>
                <select className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>VCard</option>
                  <option>Dynamic Content</option>
                </select>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                <label className="text-[10px] text-gray-500 block mb-1">Destination</label>
                <select className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>Business VCard</option>
                  <option>Current Offer</option>
                  <option>Events Page</option>
                  <option>Product Showcase</option>
                </select>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                <label className="text-[10px] text-gray-500 block mb-1">Update Frequency</label>
                <select className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>Manual</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Seasonal</option>
                  <option>Campaign-based</option>
                </select>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Content Schedule</h4>
            <div className="space-y-2 text-xs">
              {[
                { day: 'Monday', content: 'Current Offer — Morning Coffee Deal' },
                { day: 'Tuesday', content: 'Product — Coffee & Beverages' },
                { day: 'Wednesday', content: 'Event — Business Networking Hour' },
                { day: 'Seasonal', content: 'Summer Campaign — Coffee Festival' },
              ].map((s) => (
                <div key={s.day} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="font-medium text-gray-700 dark:text-gray-300 w-20">{s.day}</span>
                  <span className="text-gray-500 flex-1 mx-2">{s.content}</span>
                  <button onClick={() => toast.success(`Editing ${s.day} schedule`)} className="text-[10px] text-orange-600 hover:underline">Change</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

      /* ── Preview ── */
      case 'Preview': return (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Switch between desktop and mobile preview to see how the VCard appears to users.</p>
            <div className="flex bg-gray-200 dark:bg-gray-600 rounded-lg p-0.5 ml-auto">
              {(['Desktop', 'Mobile'] as const).map((m) => (
                <button key={m} onClick={() => setVPreviewMode(m.toLowerCase() as any)} className={`px-3 py-1 rounded text-[10px] font-medium transition-colors ${vPreviewMode === m.toLowerCase() ? 'bg-white dark:bg-gray-800 text-gray-900 shadow-sm' : 'text-gray-500'}`}>{m}</button>
              ))}
            </div>
          </div>
          <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm ${vPreviewMode === 'mobile' ? 'max-w-[320px] mx-auto' : ''}`}>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl p-5 text-white text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 mx-auto mb-3 flex items-center justify-center text-2xl font-bold">{biz.name.charAt(0)}</div>
              <p className="font-bold text-lg">{biz.name}</p>
              <p className="text-xs text-white/80 mt-1">{biz.description?.slice(0, 80) || 'Premium business services'}</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg><span>{biz.email}</span></div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg><span>{biz.phone}</span></div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 truncate"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg><span className="truncate">{biz.website}</span></div>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <h5 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">About</h5>
                <p className="text-xs text-gray-500 dark:text-gray-400">{biz.description || 'Business description not available.'}</p>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <h5 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Location</h5>
                <p className="text-xs text-gray-500 dark:text-gray-400">{biz.address}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => toast.success('Share action')} className="flex-1 px-3 py-2 rounded-lg bg-blue-500 text-white text-xs font-semibold text-center hover:bg-blue-600">Share</button>
                <button onClick={() => toast.success('Save contact')} className="flex-1 px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold text-center hover:bg-orange-600">Save Contact</button>
              </div>
            </div>
          </div>
        </div>
      )

      /* ── Publishing ── */
      case 'Publishing': return (
        <div className="max-w-2xl space-y-5">
          <p className="text-xs text-gray-500 dark:text-gray-400">Manage publication status. The VCard must meet readiness requirements before publishing.</p>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Current Status</h4>
              <Badge status={status} variant="dot" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {isPublished ? 'VCard is publicly accessible' : isDraft ? 'VCard is in draft mode' : isSuspended ? 'VCard is suspended' : 'VCard is unpublished'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Last published: {v.updated || 'Never'} · Created: {v.created || biz.joined}</p>
              </div>
              <div className="flex gap-2">
                {isPublished ? (
                  <button onClick={() => toast.success('VCard unpublished')} className="px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-800 text-orange-600 text-[10px] font-medium hover:bg-orange-50 dark:hover:bg-orange-500/10">Unpublish</button>
                ) : (
                  <button onClick={() => toast.success('VCard published')} className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-[10px] font-semibold hover:bg-green-600">Publish</button>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">VCard Readiness</h4>
            <div className="space-y-2">
              {[
                { label: 'Business Name', ok: true },
                { label: 'Logo', ok: true },
                { label: 'Description', ok: !!biz.description },
                { label: 'Contact Information', ok: true },
                { label: 'Location', ok: true },
                { label: 'Required Sections', ok: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-gray-700 dark:text-gray-300">{item.label}</span>
                  {item.ok ? (
                    <span className="text-green-600 text-xs">✓</span>
                  ) : (
                    <span className="text-orange-500 text-xs">Missing</span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">VCard can be published. {!biz.description ? 'Consider adding a description.' : ''}</p>
          </div>
          <div className="flex gap-2">
            {!isPublished && <button onClick={() => toast.success('VCard published')} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Publish VCard</button>}
            {isPublished && <button onClick={() => toast.success('VCard unpublished')} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Unpublish VCard</button>}
            <button onClick={() => toast.success('VCard archived')} className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-500/10">Archive</button>
          </div>
        </div>
      )

      /* ── Integrations ── */
      case 'Integrations': return (
        <div className="max-w-2xl space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Integration status for services connected to this Business VCard.</p>
          {[
            { name: 'MCOM Solutions Login', status: 'Connected', detail: 'Authentication and identity management active' },
            { name: 'MCOM Rewards / 247GBS Rewards', status: 'Coming Soon' },
            { name: 'MCOMMall Cashback', status: 'Coming Soon' },
            { name: 'MCOMSpin', status: 'Coming Soon' },
            { name: 'FundOrDonate', status: 'Coming Soon' },
            { name: 'MCOMMall', status: 'Coming Soon' },
            { name: '247GBS Expo', status: 'Coming Soon' },
          ].map((int) => (
            <div key={int.name} className={`rounded-xl border p-4 ${int.status === 'Connected' ? 'bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${int.status === 'Connected' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{int.name}</p>
                    {int.detail && <p className="text-[10px] text-green-700 dark:text-green-400 mt-0.5">{int.detail}</p>}
                  </div>
                </div>
                {int.status === 'Connected' ? (
                  <Badge status="Connected" />
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-500">Coming Soon</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )

      /* ── Activity ── */
      case 'Activity': return (
        <div className="max-w-2xl space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">VCard-specific activity feed. Full business activity is available under Business Details → Activity.</p>
          {biz.activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No VCard activity yet.</p>
              <p className="text-xs text-gray-400 mt-1">Activity will appear here when actions are performed on this VCard.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {[
                { action: 'VCard content updated', time: '2 hours ago', actor: 'Business Owner' },
                { action: 'VCard published', time: '3 days ago', actor: 'Admin: Michael' },
                { action: 'QR code regenerated', time: '1 week ago', actor: 'Business Owner' },
                { action: 'VCard created', time: biz.joined, actor: 'System' },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{a.action}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.time} · by {a.actor}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )

      default: return null
    }
  }

  return (
    <div className="space-y-5">
      {/* Header bar with status, ID, actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Business VCard</h3>
          <Badge status={status} variant="dot" />
          <span className="text-[11px] text-gray-400 font-mono">{v.id}</span>
          <span className="text-[10px] text-gray-400">Updated {v.updated || '--'}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setVSection('Preview')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Preview</button>
          <button onClick={() => toast.success('Edit mode opened')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Edit</button>
          {isPublished ? (
            <button onClick={() => toast.success('VCard unpublished')} className="px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-800 text-orange-600 text-[10px] font-medium hover:bg-orange-50 dark:hover:bg-orange-500/10">Unpublish</button>
          ) : (
            <button onClick={() => toast.success('VCard published')} className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-[10px] font-semibold hover:bg-green-600">Publish</button>
          )}
          <div className="relative" onMouseLeave={() => setVMoreMenu(false)}>
            <button onClick={() => setVMoreMenu(!vMoreMenu)} className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
            </button>
            {vMoreMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1.5 z-50" onClick={() => setVMoreMenu(false)}>
                <button onClick={() => toast.success('VCard duplicated')} className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Duplicate</button>
                <button onClick={() => toast.success('VCard archived')} className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Archive</button>
                <button onClick={() => toast.success('VCard suspended')} className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700">Suspend</button>
                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                <button onClick={() => setVSection('Activity')} className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">View Activity</button>
                <button onClick={() => { navigator.clipboard.writeText(v.url); toast.success('Link copied') }} className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Copy VCard Link</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-section tabs */}
      <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-700 gap-0">
        {VCARD_SECTIONS.map((s) => (
          <button key={s} onClick={() => setVSection(s)}
            className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              vSection === s ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}>{s}</button>
        ))}
      </div>

      {renderVCardContent()}
    </div>
  )
}

/* ===== BUSINESS CARD TAB (Instance) ===== */
function BusinessCardTab({ biz }: { biz: any }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('ready')
  const [cPreviewMode, setCPreviewMode] = useState<'desktop' | 'mobile'>('mobile')
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  if (state === 'loading') return <LoadingTab />
  if (state === 'error') return <ErrorState message="Unable to load Business Card." onRetry={() => setState('ready')} />
  if (biz.businessCard.status === 'Not Created') {
    return (
      <EmptyState
        icon="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        title="No Business Card Yet"
        desc={biz.membership === 'Free' ? "This business's membership does not include a Business Card allocation." : 'This business has not been assigned a Business Card yet.'}
        action={{ label: biz.membership === 'Free' ? 'View Membership & Allocation' : 'Create Business Card', onClick: () => toast.success(biz.membership === 'Free' ? 'Opening Membership & Allocation' : 'Business Card creation started') }}
      />
    )
  }

  const c = biz.businessCard
  const isActive = c.status === 'Active' || c.status === 'Published'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Business Card</h3>
          <Badge status={c.status} variant="dot" />
          <span className="text-[11px] text-gray-400 font-mono">{c.id}</span>
          <span className="text-[10px] text-gray-400">Template: <span className="font-medium text-gray-600 dark:text-gray-300">{c.design || 'Business Professional'}</span></span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => toast.success('Opening preview')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Preview</button>
          <button onClick={() => toast.success('Edit mode opened')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Edit</button>
          <button onClick={() => setShowTemplateModal(true)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Change Template</button>
          {isActive ? (
            <button onClick={() => toast.success('Card deactivated')} className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 text-[10px] font-medium hover:bg-red-50 dark:hover:bg-red-500/10">Deactivate</button>
          ) : (
            <button onClick={() => toast.success('Card activated')} className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-[10px] font-semibold hover:bg-green-600">Activate</button>
          )}
          <button onClick={() => { navigator.clipboard.writeText(c.url); toast.success('URL copied') }} className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          </button>
        </div>
      </div>

      {/* Created/Updated info */}
      <div className="text-[11px] text-gray-500 dark:text-gray-400 -mt-2">
        Created: {c.created || biz.joined} · Last updated: {c.updated || '--'} · Card ID: {c.id}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          {/* Card Preview */}
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Card Preview</span>
              <div className="flex bg-gray-200 dark:bg-gray-600 rounded-lg p-0.5">
                <button onClick={() => setCPreviewMode('desktop')} className={`px-3 py-1 rounded text-[10px] font-medium transition-colors ${cPreviewMode === 'desktop' ? 'bg-white dark:bg-gray-800 text-gray-900 shadow-sm' : 'text-gray-500'}`}>Desktop</button>
                <button onClick={() => setCPreviewMode('mobile')} className={`px-3 py-1 rounded text-[10px] font-medium transition-colors ${cPreviewMode === 'mobile' ? 'bg-white dark:bg-gray-800 text-gray-900 shadow-sm' : 'text-gray-500'}`}>Mobile</button>
              </div>
            </div>
            <div className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white ${cPreviewMode === 'mobile' ? 'max-w-[280px] mx-auto' : ''}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-sm font-bold">{biz.name.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-sm">{biz.name}</p>
                  <p className="text-[10px] text-gray-400">{biz.industry}</p>
                  <p className="text-[10px] text-gray-400">{biz.owner}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-[11px] text-gray-300">
                <p>{biz.email}</p>
                <p>{biz.phone}</p>
                <p className="truncate">{biz.website}</p>
                <p className="truncate">{biz.address}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
                <span className="text-[9px] text-gray-400">View Full VCard →</span>
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-900" viewBox="0 0 100 100"><rect x="10" y="10" width="25" height="25" fill="currentColor" rx="2" /><rect x="10" y="55" width="25" height="25" fill="currentColor" rx="2" /><rect x="55" y="10" width="25" height="25" fill="currentColor" rx="2" /><rect x="55" y="55" width="8" height="8" fill="currentColor" /><rect x="70" y="55" width="8" height="8" fill="currentColor" /><rect x="55" y="70" width="8" height="20" fill="currentColor" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Card Content</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              {[
                { label: 'Business Name', value: biz.name },
                { label: 'Representative', value: biz.owner },
                { label: 'Job Title', value: biz.industry === 'Cafe' ? 'Owner & Barista' : biz.industry === 'Technology' ? 'CEO' : 'Director' },
                { label: 'Phone', value: biz.phone },
                { label: 'Email', value: biz.email },
                { label: 'Website', value: biz.website },
                { label: 'Address', value: biz.address },
                { label: 'VCard Link', value: 'View Full VCard', link: true },
              ].map((f) => (
                <div key={f.label} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                  <span className="text-[10px] text-gray-400">{f.label}</span>
                  <p className={`text-sm font-medium text-gray-900 dark:text-white mt-0.5 ${f.link ? 'text-orange-600 cursor-pointer' : ''}`} onClick={() => f.link && toast.success('Opening Business VCard')}>{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Social Links</h4>
            <div className="flex flex-wrap gap-2">
              {['Facebook', 'Instagram', 'LinkedIn', 'X', 'YouTube', 'TikTok'].map((s) => (
                <button key={s} onClick={() => toast.success(`Opening ${s}`)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v12M6 12h12" /></svg>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          {/* QR Code */}
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">QR Code</h4>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center mb-3">
                <svg className="w-20 h-20 text-gray-900 dark:text-white" viewBox="0 0 100 100"><rect x="10" y="10" width="25" height="25" fill="currentColor" rx="2" /><rect x="10" y="55" width="25" height="25" fill="currentColor" rx="2" /><rect x="55" y="10" width="25" height="25" fill="currentColor" rx="2" /><rect x="55" y="55" width="8" height="8" fill="currentColor" /><rect x="70" y="55" width="8" height="8" fill="currentColor" /><rect x="55" y="70" width="8" height="20" fill="currentColor" /></svg>
              </div>
              <p className="text-[10px] text-gray-500 mb-2">Scan to open <span className="font-medium text-gray-700 dark:text-gray-300">Business VCard</span></p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button onClick={() => toast.success('QR downloaded')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Download QR</button>
                <button onClick={() => { navigator.clipboard.writeText(c.url); toast.success('Link copied') }} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Copy Link</button>
                <button onClick={() => toast.success('QR regenerated')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Regenerate</button>
              </div>
            </div>
          </div>

          {/* Activity Metrics */}
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Card Activity</h4>
            <div className="space-y-3">
              {[
                { label: 'Card Views', value: (Math.floor(Math.random() * 500) + 50).toLocaleString(), color: 'text-blue-600' },
                { label: 'QR Scans', value: c.scans?.toLocaleString() || '0', color: 'text-teal-600' },
                { label: 'Shares', value: Math.floor(Math.random() * 200).toLocaleString(), color: 'text-purple-600' },
                { label: 'Exchanges', value: 'Coming Soon', color: 'text-gray-400' },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{m.label}</span>
                  <span className={`text-xs font-bold ${m.color}`}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Template History */}
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Template History</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-400">Current Template</span><span className="font-medium text-gray-900 dark:text-white">{c.design || 'Business Professional'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Previous Template</span><span className="font-medium text-gray-900 dark:text-white">—</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Last Changed</span><span className="font-medium text-gray-900 dark:text-white">—</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Changed By</span><span className="font-medium text-gray-900 dark:text-white">—</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowTemplateModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Change Card Template</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Select a new template for this Business Card. Only the visual design will change — business information is preserved.</p>
            <div className="space-y-2 mb-4">
              {[
                { name: 'Business Professional', status: 'Active', desc: 'Modern business design for professional businesses', current: true },
                { name: 'Premium Executive', status: 'Active', desc: 'Premium dark design with gold accents' },
                { name: 'Modern Tide', status: 'Active', desc: 'Clean contemporary teal design' },
                { name: 'Bold Statement', status: 'Inactive', desc: 'Bold red and charcoal design' },
              ].map((t) => (
                <button key={t.name} onClick={() => toast.success(`Template changed to ${t.name}`)} className={`w-full text-left p-3 rounded-lg border transition-colors ${t.current ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10' : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{t.name}{t.current && <span className="text-[10px] text-orange-600 ml-2">Current</span>}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{t.desc}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-medium ${t.status === 'Active' ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'}`}>{t.status}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowTemplateModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={() => { toast.success('Template applied'); setShowTemplateModal(false) }} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Apply Template</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ===== CONSUMER CARDS & ALLOCATIONS TAB (3.2.4) ===== */
function ConsumerCardsTab({ biz, subTab, setSubTab }: { biz: any; subTab: 'vcards' | 'cards'; setSubTab: (v: 'vcards' | 'cards') => void }) {
  const [search, setSearch] = useState('')
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('ready')
  const [showNewIssue, setShowNewIssue] = useState<'vcards' | 'cards' | null>(null)
  const [showAllocate, setShowAllocate] = useState(false)
  const [drawerConsumer, setDrawerConsumer] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterAllocType, setFilterAllocType] = useState('All')
  const [filterCardholder, setFilterCardholder] = useState('All')
  const [filterECard, setFilterECard] = useState('All')
  const [filterLevel, setFilterLevel] = useState('All')
  const [filterDate, setFilterDate] = useState('All')

  if (state === 'loading') return <LoadingTab />
  if (state === 'error') return <ErrorState message="We couldn't load the consumer card data." onRetry={() => setState('ready')} />

  /* Derived KPIs */
  const totalEntitlement = biz.consumerVTotal + biz.consumerCTotal
  const totalAllocated = biz.vcardsUsed + biz.cardsUsed
  const totalAvailable = totalEntitlement - totalAllocated
  const activeCards = biz.consumerVCards.filter((c: any) => c.status === 'Active').length + biz.consumerCards.filter((c: any) => c.status === 'Active').length
  const pendingCards = biz.consumerVCards.filter((c: any) => c.status === 'Pending').length + biz.consumerCards.filter((c: any) => c.status === 'Pending').length
  const suspendedRevoked = biz.consumerVCards.filter((c: any) => c.status === 'Inactive' || c.status === 'Suspended').length + biz.consumerCards.filter((c: any) => c.status === 'Inactive' || c.status === 'Suspended').length
  const eCardEntitlements = biz.consumerVCards.filter((c: any) => c.eCard?.enabled).length + biz.consumerCards.filter((c: any) => c.eCard?.enabled).length

  const ffTotal = Math.floor((biz.consumerVTotal + biz.consumerCTotal) * 0.2)
  const ffUsed = biz.consumerVCards.filter((c: any) => c.familyMember?.allocated).length + biz.consumerCards.filter((c: any) => c.additionalCards?.length > 0).length

  const vPct = biz.consumerVTotal > 0 ? Math.round((biz.vcardsUsed / biz.consumerVTotal) * 100) : 0
  const cPct = biz.consumerCTotal > 0 ? Math.round((biz.cardsUsed / biz.consumerCTotal) * 100) : 0
  const noEntitlement = biz.consumerVTotal === 0 && biz.consumerCTotal === 0
  const hasMembershipIssue = biz.membershipStatus !== 'Active'

  /* Filter + search */
  const applyFilters = (arr: any[], isVCard: boolean) => {
    return arr.filter((c: any) => {
      if (search && !c.consumer.toLowerCase().includes(search.toLowerCase()) && !(isVCard ? c.vcardId : c.cardId).toLowerCase().includes(search.toLowerCase()) && !(c.consumerId || '').toLowerCase().includes(search.toLowerCase()) && !(c.consumerEmail || '').toLowerCase().includes(search.toLowerCase())) return false
      if (filterStatus !== 'All' && c.status !== filterStatus) return false
      if (filterAllocType !== 'All' && c.allocationType !== filterAllocType) return false
      if (filterECard !== 'All') { if (filterECard === 'Enabled' && !c.eCard?.enabled) return false; if (filterECard === 'Disabled' && c.eCard?.enabled) return false; if (filterECard === 'Active' && c.eCard?.status !== 'Active') return false; if (filterECard === 'Redeemed' && c.eCard?.status !== 'Redeemed') return false; if (filterECard === 'Expired' && c.eCard?.status !== 'Expired') return false }
      if (filterLevel !== 'All' && isVCard && c.level !== filterLevel) return false
      if (filterLevel !== 'All' && !isVCard && c.membershipLevel !== filterLevel) return false
      if (filterCardholder !== 'All') { if (filterCardholder === 'Primary' && (isVCard ? !c.familyMember : !c.additionalCards)) return true; if (filterCardholder === 'Family' && (isVCard ? c.familyMember?.relation !== 'Wife' && c.familyMember?.relation !== 'Husband' && c.familyMember?.relation !== 'Son' && c.familyMember?.relation !== 'Daughter' : !c.additionalCards?.some((a: any) => a.relation === 'Family'))) return false; if (filterCardholder === 'Friend' && (isVCard ? c.familyMember?.relation !== 'Friend' : !c.additionalCards?.some((a: any) => a.relation === 'Friend'))) return false }
      return true
    })
  }
  const filteredVCards = applyFilters(biz.consumerVCards, true)
  const filteredCards = applyFilters(biz.consumerCards, false)

  /* Detail Drawer */
  function DetailDrawer() {
    if (!drawerConsumer) return null
    const isV = drawerConsumer.vcardId !== undefined
    const ac = isV ? null : drawerConsumer.additionalCards
    const subcards = ac || []
    return (
      <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDrawerConsumer(null)}>
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-5 py-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Consumer Allocation Detail</h3>
            <button onClick={() => setDrawerConsumer(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="p-5 space-y-5">
            {/* Consumer Info */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Consumer Information</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span className="text-gray-400">Name</span><span className="text-gray-900 dark:text-white font-medium">{drawerConsumer.consumer}</span>
                <span className="text-gray-400">ID</span><span className="text-gray-900 dark:text-white font-mono text-[10px]">{drawerConsumer.consumerId}</span>
                <span className="text-gray-400">Email</span><span className="text-gray-900 dark:text-white">{drawerConsumer.consumerEmail}</span>
                <span className="text-gray-400">Account Status</span><Badge status={drawerConsumer.status} />
              </div>
            </div>
            {/* Primary Card */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Primary {isV ? 'VCard' : 'Card'}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span className="text-gray-400">{isV ? 'VCard ID' : 'Card ID'}</span><span className="text-gray-900 dark:text-white font-mono text-[10px]">{isV ? drawerConsumer.vcardId : drawerConsumer.cardId}</span>
                <span className="text-gray-400">Status</span><Badge status={drawerConsumer.status} />
                <span className="text-gray-400">Membership Level</span><span className="text-gray-900 dark:text-white">{isV ? drawerConsumer.level : drawerConsumer.membershipLevel}</span>
                <span className="text-gray-400">Issued Date</span><span className="text-gray-900 dark:text-white">{drawerConsumer.issuedDate || drawerConsumer.issued}</span>
                {drawerConsumer.activatedDate && <><span className="text-gray-400">Activated Date</span><span className="text-gray-900 dark:text-white">{drawerConsumer.activatedDate}</span></>}
                <span className="text-gray-400">Allocation Type</span><span className="text-gray-900 dark:text-white">{drawerConsumer.allocationType}</span>
                <span className="text-gray-400">Allocation Locked</span><span className={drawerConsumer.allocationLocked ? 'text-amber-600' : 'text-green-600'}>{drawerConsumer.allocationLocked ? 'Yes' : 'No'}</span>
              </div>
            </div>
            {/* Additional Cards */}
            {!isV && drawerConsumer.additionalEntitlement && (
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Additional Cards</p>
                <p className="text-xs text-gray-500 mb-2">Entitlement: {drawerConsumer.additionalEntitlement.allocated}/{drawerConsumer.additionalEntitlement.total} allocated · {drawerConsumer.additionalEntitlement.available} remaining</p>
                {subcards.length > 0 ? (
                  <div className="space-y-2">
                    {subcards.map((sc: any, idx: number) => (
                      <div key={sc.id || idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-gray-900 dark:text-white">{sc.name}</p>
                            <p className="text-[10px] text-gray-400">{sc.relation} · {sc.cardId}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge status={sc.status} />
                            {sc.eCard && <span className="text-[9px] text-green-600 font-medium">E-Card</span>}
                            {sc.allocationLocked && <svg className="w-3 h-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-gray-400 italic">No additional cards allocated</p>}
              </div>
            )}
            {/* F&F for VCards */}
            {isV && drawerConsumer.familyMember?.allocated && (
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">F&F Allocation</p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{drawerConsumer.familyMember.name} ({drawerConsumer.familyMember.relation})</p>
                      <p className="text-[10px] text-gray-400">Linked to {drawerConsumer.vcardId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-green-600">Allocated</span>
                      {drawerConsumer.familyMember.locked && <svg className="w-3 h-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* E-Card */}
            {drawerConsumer.eCard?.enabled && (
              <div className="bg-green-50 dark:bg-green-500/5 rounded-xl border border-green-200 dark:border-green-800 p-4">
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">E-Card Entitlement</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="text-green-600">Face Value</span><span className="text-gray-900 dark:text-white font-medium">${drawerConsumer.eCard.value}</span>
                  <span className="text-green-600">Status</span><Badge status={drawerConsumer.eCard.status === 'Active' ? 'Active' : drawerConsumer.eCard.status === 'Redeemed' ? 'Inactive' : 'Expired'} />
                  <span className="text-green-600">Expiry</span><span className="text-gray-900 dark:text-white">{drawerConsumer.eCard.expiry}</span>
                  <span className="text-green-600">Remaining</span><span className="text-gray-900 dark:text-white">${drawerConsumer.eCard.remaining}</span>
                  {drawerConsumer.eCard.spendableAt && <><span className="text-green-600">Spendable At</span><span className="text-gray-900 dark:text-white">{drawerConsumer.eCard.spendableAt}</span></>}
                  {drawerConsumer.eCard.minSpend && <><span className="text-green-600">Minimum Spend</span><span className="text-gray-900 dark:text-white">{drawerConsumer.eCard.minSpend}</span></>}
                </div>
              </div>
            )}
            {/* Activity */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Recent Activity</p>
              <div className="space-y-2">
                {[
                  { action: `${isV ? 'VCard' : 'Card'} issued`, time: drawerConsumer.issuedDate || drawerConsumer.issued },
                  drawerConsumer.activatedDate ? { action: `${isV ? 'VCard' : 'Card'} activated`, time: drawerConsumer.activatedDate } : null,
                  drawerConsumer.eCard?.enabled ? { action: `E-Card issued ($${drawerConsumer.eCard.value})`, time: drawerConsumer.issuedDate || drawerConsumer.issued } : null,
                  drawerConsumer.allocationLocked ? { action: 'Allocation locked', time: drawerConsumer.issuedDate || drawerConsumer.issued } : null,
                ].filter(Boolean).map((a: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{a.action}</span>
                    <span className="text-gray-400 ml-auto">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button onClick={() => { toast.success(`Viewing consumer profile: ${drawerConsumer.consumer}`); setDrawerConsumer(null) }} className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">View Consumer</button>
              <button onClick={() => { toast.success(`${isV ? 'VCard' : 'Card'} suspended`); setDrawerConsumer(null) }} className="flex-1 px-3 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 text-xs font-medium hover:bg-yellow-100 dark:hover:bg-yellow-500/20">Suspend</button>
              {drawerConsumer.allocationLocked && (
                <button onClick={() => { toast((t) => (<div className="text-xs"><p className="font-medium mb-2">Override this allocation? This may affect the current cardholder and E-Card entitlement.</p><div className="flex gap-2 justify-end"><button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 rounded border text-gray-600">Cancel</button><button onClick={() => { toast.dismiss(t.id); toast.success('Allocation overridden (audit logged)'); setDrawerConsumer(null) }} className="px-3 py-1 rounded bg-red-500 text-white">Confirm Override</button></div></div>), { duration: 8000 }) }} className="flex-1 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-500/20">Override</button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* Issue Modal */
  function IssueModal() {
    const cardType = showNewIssue === 'vcards' ? 'Consumer VCard' : 'Consumer Card'
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowNewIssue(null)}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Issue New {cardType}</h3>
            <button onClick={() => setShowNewIssue(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Consumer</label>
              <select className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                {['Emma Rodriguez', 'James Chen', 'Sarah Wilson', 'Mike Patel', 'Lisa Thompson', 'David Kim', 'Anna Martinez', 'Tom Baker', 'Sophie Laurent', 'Oscar Hernandez'].map((n) => (<option key={n} value={n}>{n}</option>))}
              </select>
            </div>
            {showNewIssue === 'cards' && (
              <div>
                <label className="text-[10px] text-gray-500 block mb-1">Card Type</label>
                <select className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>Loyalty</option><option>Rewards</option><option>Membership</option><option>Business</option>
                </select>
              </div>
            )}
            {showNewIssue === 'cards' && (
              <div>
                <label className="text-[10px] text-gray-500 block mb-1">Membership Level</label>
                <select className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>Bronze</option><option>Silver</option><option>Gold</option><option>Platinum</option>
                </select>
              </div>
            )}
            {showNewIssue === 'vcards' && (
              <div>
                <label className="text-[10px] text-gray-500 block mb-1">Level</label>
                <select className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>Standard</option><option>Premium</option><option>VIP</option>
                </select>
              </div>
            )}
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Allocation Type</label>
              <select className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>Reward</option><option>Campaign</option><option>Business Allocation</option><option>Promotional</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Additional Card Allowance</label>
              <select className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>None</option><option>1 Additional</option><option>2 Additional</option><option>3 Additional</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">E-Card Enabled</label>
              <select className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>Yes</option><option>No</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Issue Note (optional)</label>
              <input type="text" placeholder="e.g. Welcome bonus allocation" className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400" />
            </div>
          </div>
          <div className="flex gap-2 justify-end px-5 pb-5">
            <button onClick={() => setShowNewIssue(null)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button onClick={() => { toast.success(`${cardType} issued successfully`); setShowNewIssue(null) }} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Issue {cardType}</button>
          </div>
        </div>
      </div>
    )
  }

  /* Allocate Modal */
  function AllocateModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAllocate(false)}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Allocate Cards</h3>
            <button onClick={() => setShowAllocate(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Card Type</label>
              <select className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>Consumer VCard</option><option>Consumer Card</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Quantity</label>
              <input type="number" defaultValue={10} min={1} max={totalAvailable} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Allocation Reason</label>
              <select className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>Reward</option><option>Campaign</option><option>Promotional</option><option>Business Allocation</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">E-Card Value</label>
              <select className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>None</option><option>$1</option><option>$2</option><option>$5</option><option>$10</option><option>$25</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Note</label>
              <input type="text" placeholder="e.g. Seasonal promotion allocation" className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400" />
            </div>
            <p className="text-[10px] text-gray-400">Available to allocate: {totalAvailable} units</p>
          </div>
          <div className="flex gap-2 justify-end px-5 pb-5">
            <button onClick={() => setShowAllocate(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button onClick={() => { toast.success('Cards allocated. Entitlement updated.'); setShowAllocate(false) }} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Confirm Allocation</button>
          </div>
        </div>
      </div>
    )
  }

  /* Empty state cases */
  if (noEntitlement) {
    return (
      <EmptyState icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" title="No Consumer Card Entitlement"
        desc={hasMembershipIssue ? "This business's current membership is inactive and does not provide consumer-card allocation." : "This business's current membership does not provide consumer-card allocation."}
        action={hasMembershipIssue ? { label: 'View Membership', onClick: () => toast.success('Navigate to Membership & Allocation tab') } : undefined} />
    )
  }

  const noCards = !biz.consumerVCards.length && !biz.consumerCards.length
  if (noCards) {
    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Consumer Cards & Allocations</h3>
            <p className="text-xs text-gray-400">This business has allocation available ({totalAvailable} units) but no cards issued yet.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAllocate(true)} className="px-3 py-1.5 rounded-lg border border-orange-500 text-orange-600 text-xs font-semibold hover:bg-orange-50 dark:hover:bg-orange-500/10">Allocate Cards</button>
            <button onClick={() => setShowNewIssue('vcards')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Issue Consumer Card</button>
          </div>
        </div>
        <KpiSection />
        <MembershipPanel />
      </div>
    )
  }

  /* KPI Section */
  function KpiSection() {
    const kpis = [
      { label: 'Total Card Entitlement', value: totalEntitlement, color: 'text-gray-900', sub: `${biz.consumerVTotal} V · ${biz.consumerCTotal} C` },
      { label: 'Cards Allocated', value: totalAllocated, color: 'text-orange-600', sub: `${((totalAllocated / totalEntitlement) * 100).toFixed(0)}% of entitlement`, filter: 'Allocated' },
      { label: 'Cards Available', value: totalAvailable, color: totalAvailable > 0 ? 'text-green-600' : 'text-red-500', sub: `${((totalAvailable / totalEntitlement) * 100).toFixed(0)}% remaining`, filter: 'Available' },
      { label: 'Active Consumer Cards', value: activeCards, color: 'text-green-600', sub: `${activeCards > 0 ? ((activeCards / totalAllocated) * 100).toFixed(0) : 0}% of allocated` },
      { label: 'Pending Activation', value: pendingCards, color: 'text-yellow-600', sub: `Awaiting consumer activation` },
      { label: 'Suspended / Revoked', value: suspendedRevoked, color: 'text-red-500', sub: 'No longer active' },
      { label: 'E-Card Entitlements', value: eCardEntitlements, color: 'text-purple-600', sub: `${eCardEntitlements > 0 ? ((eCardEntitlements / totalAllocated) * 100).toFixed(0) : 0}% of cards have E-Card` },
    ]
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-5">
        {kpis.map((k) => (
          <button key={k.label} onClick={() => { if (k.filter) toast.success(`Filtering by ${k.filter}`) }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 text-left hover:shadow-sm transition-shadow">
            <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">{k.label}</p>
            <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">{k.sub}</p>
          </button>
        ))}
      </div>
    )
  }

  /* Membership Panel */
  function MembershipPanel() {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-500/5 dark:to-orange-600/5 rounded-xl border border-orange-200 dark:border-orange-800 p-4 mb-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <p className="text-[10px] text-orange-700 dark:text-orange-400 font-medium">Current Membership</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{biz.membership}</p>
                <Badge status={biz.membershipStatus} variant="dot" />
              </div>
            </div>
            <div className="h-6 w-px bg-orange-200 dark:bg-orange-700 hidden sm:block" />
            <div className="grid grid-cols-2 sm:flex gap-x-3 gap-y-1 text-[10px]">
              <span className="text-gray-500">Billing: <strong className="text-gray-700 dark:text-gray-300">Annual</strong></span>
              <span className="text-gray-500">Consumer VCards: <strong className="text-gray-700 dark:text-gray-300">{biz.consumerVTotal}</strong></span>
              <span className="text-gray-500">Consumer Cards: <strong className="text-gray-700 dark:text-gray-300">{biz.consumerCTotal}</strong></span>
              <span className="text-gray-500">E-Card: <strong className="text-green-600">Enabled</strong></span>
              <span className="text-gray-500">Add. Cards: <strong className="text-gray-700 dark:text-gray-300">Per Plan</strong></span>
            </div>
          </div>
          <button onClick={() => toast.success('Navigate to Membership & Allocation tab')} className="text-[10px] text-orange-600 font-medium hover:underline shrink-0">Manage Membership →</button>
        </div>
      </div>
    )
  }

  /* Available Inventory */
  function InventorySection() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Consumer VCard Inventory</p>
            <span className={`text-[10px] font-medium ${vPct >= 90 ? 'text-red-500' : vPct >= 75 ? 'text-orange-500' : 'text-green-600'}`}>{biz.vcardsUsed}/{biz.consumerVTotal} used ({vPct}%)</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-3">
            <div className={`h-full rounded-full ${vPct >= 90 ? 'bg-red-500' : vPct >= 75 ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${vPct}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><p className="text-base font-bold text-gray-900 dark:text-white">{biz.consumerVTotal}</p><p className="text-[9px] text-gray-400">Entitled</p></div>
            <div><p className="text-base font-bold text-orange-600">{biz.vcardsUsed}</p><p className="text-[9px] text-gray-400">Allocated</p></div>
            <div><p className={`text-base font-bold ${biz.consumerVTotal - biz.vcardsUsed > 0 ? 'text-green-600' : 'text-red-500'}`}>{biz.consumerVTotal - biz.vcardsUsed}</p><p className="text-[9px] text-gray-400">Available</p></div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Consumer Card Inventory</p>
            <span className={`text-[10px] font-medium ${cPct >= 90 ? 'text-red-500' : cPct >= 75 ? 'text-orange-500' : 'text-green-600'}`}>{biz.cardsUsed}/{biz.consumerCTotal} used ({cPct}%)</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-3">
            <div className={`h-full rounded-full ${cPct >= 90 ? 'bg-red-500' : cPct >= 75 ? 'bg-orange-500' : 'bg-purple-500'}`} style={{ width: `${cPct}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><p className="text-base font-bold text-gray-900 dark:text-white">{biz.consumerCTotal}</p><p className="text-[9px] text-gray-400">Entitled</p></div>
            <div><p className="text-base font-bold text-orange-600">{biz.cardsUsed}</p><p className="text-[9px] text-gray-400">Allocated</p></div>
            <div><p className={`text-base font-bold ${biz.consumerCTotal - biz.cardsUsed > 0 ? 'text-green-600' : 'text-red-500'}`}>{biz.consumerCTotal - biz.cardsUsed}</p><p className="text-[9px] text-gray-400">Available</p></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Modals */}
      {showNewIssue && <IssueModal />}
      {showAllocate && <AllocateModal />}
      {drawerConsumer && <DetailDrawer />}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Consumer Cards & Allocations</h3>
          <p className="text-xs text-gray-400">Managing card inventory and issuance for this business</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowAllocate(true)} className="px-3 py-1.5 rounded-lg border border-orange-500 text-orange-600 text-xs font-semibold hover:bg-orange-50 dark:hover:bg-orange-500/10">Allocate Cards</button>
          <button onClick={() => setShowNewIssue('vcards')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Issue Consumer Card</button>
          <button onClick={() => toast.success('Exporting allocation report...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Export Report</button>
          <button onClick={() => toast.success('Viewing all allocation activity')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View Activity</button>
        </div>
      </div>

      {/* KPIs */}
      <KpiSection />

      {/* Membership Entitlement Panel */}
      <MembershipPanel />

      {/* Available Inventory */}
      <InventorySection />

      {/* Filters + Search + Sub-tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-4 border-b border-gray-100 dark:border-gray-700">
          <button onClick={() => setSubTab('vcards')} className={`pb-2.5 text-sm font-medium border-b-2 transition-colors ${subTab === 'vcards' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>Consumer VCards ({biz.consumerVCards.length})</button>
          <button onClick={() => setSubTab('cards')} className={`pb-2.5 text-sm font-medium border-b-2 transition-colors ${subTab === 'cards' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>Consumer Cards ({biz.consumerCards.length})</button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search consumer, ID, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 w-44" />
          </div>
          <button onClick={() => setShowNewIssue(subTab)} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 whitespace-nowrap">+ Issue New</button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-[10px] text-gray-600 dark:text-gray-300">
          <option>All Status</option><option>Active</option><option>Pending</option><option>Inactive</option><option>Suspended</option>
        </select>
        <select value={filterAllocType} onChange={(e) => setFilterAllocType(e.target.value)} className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-[10px] text-gray-600 dark:text-gray-300">
          <option>All Allocation Types</option><option>Reward</option><option>Campaign</option><option>Business Allocation</option><option>Promotional</option><option>Other</option>
        </select>
        <select value={filterCardholder} onChange={(e) => setFilterCardholder(e.target.value)} className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-[10px] text-gray-600 dark:text-gray-300">
          <option>All Cardholders</option><option>Primary</option><option>Family</option><option>Friend</option>
        </select>
        <select value={filterECard} onChange={(e) => setFilterECard(e.target.value)} className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-[10px] text-gray-600 dark:text-gray-300">
          <option>All E-Card</option><option>Enabled</option><option>Disabled</option><option>Active</option><option>Redeemed</option><option>Expired</option>
        </select>
        <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-[10px] text-gray-600 dark:text-gray-300">
          <option>All Levels</option>
          {subTab === 'vcards' ? <><option>Standard</option><option>Premium</option><option>VIP</option></> : <><option>Bronze</option><option>Silver</option><option>Gold</option><option>Platinum</option></>}
        </select>
        <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-[10px] text-gray-600 dark:text-gray-300">
          <option>All Dates</option><option>Today</option><option>Last 7 days</option><option>Last 30 days</option>
        </select>
        {(filterStatus !== 'All' || filterAllocType !== 'All' || filterCardholder !== 'All' || filterECard !== 'All' || filterLevel !== 'All' || filterDate !== 'All' || search) && (
          <button onClick={() => { setFilterStatus('All'); setFilterAllocType('All'); setFilterCardholder('All'); setFilterECard('All'); setFilterLevel('All'); setFilterDate('All'); setSearch('') }} className="text-[10px] text-orange-600 hover:underline">Clear filters</button>
        )}
      </div>

      {/* Consumer VCards Table */}
      {subTab === 'vcards' && (
        !filteredVCards.length ? (
          <EmptyState icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" title={search || filterStatus !== 'All' ? 'No Results' : 'No Consumer VCards Issued'} desc={search || filterStatus !== 'All' ? 'Try adjusting your search or filters.' : 'This business has not issued any Consumer VCards yet.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-3 py-2.5 font-medium">Consumer</th>
                  <th className="text-left px-3 py-2.5 font-medium">Consumer ID</th>
                  <th className="text-left px-3 py-2.5 font-medium">VCard ID</th>
                  <th className="text-left px-3 py-2.5 font-medium">Level</th>
                  <th className="text-left px-3 py-2.5 font-medium">Allocation Type</th>
                  <th className="text-left px-3 py-2.5 font-medium">Status</th>
                  <th className="text-left px-3 py-2.5 font-medium">Issued</th>
                  <th className="text-left px-3 py-2.5 font-medium">Activated</th>
                  <th className="text-left px-3 py-2.5 font-medium">E-Card</th>
                  <th className="text-right px-3 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVCards.map((c: any) => (
                  <tr key={c.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer" onClick={() => setDrawerConsumer(c)}>
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{c.consumer}</td>
                    <td className="px-3 py-2.5 text-gray-500 font-mono text-[10px]">{c.consumerId}</td>
                    <td className="px-3 py-2.5 text-gray-500 font-mono text-[10px]">{c.vcardId}</td>
                    <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${c.level === 'VIP' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600' : c.level === 'Premium' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>{c.level}</span></td>
                    <td className="px-3 py-2.5"><span className="text-[10px] text-gray-500">{c.allocationType}</span></td>
                    <td className="px-3 py-2.5"><Badge status={c.status} /></td>
                    <td className="px-3 py-2.5 text-gray-500">{c.issued}</td>
                    <td className="px-3 py-2.5 text-gray-500">{c.activatedDate || '--'}</td>
                    <td className="px-3 py-2.5">{c.eCard?.enabled ? <span className="text-green-600 text-[10px] font-medium">Yes ${c.eCard.value}</span> : <span className="text-gray-300">--</span>}</td>
                    <td className="px-3 py-2.5 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setDrawerConsumer(c) }} className="text-orange-600 dark:text-orange-400 hover:underline text-[10px] font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Consumer Cards Table */}
      {subTab === 'cards' && (
        !filteredCards.length ? (
          <EmptyState icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" title={search || filterStatus !== 'All' ? 'No Results' : 'No Consumer Cards Issued'} desc={search || filterStatus !== 'All' ? 'Try adjusting your search or filters.' : 'This business has not issued any Consumer Cards yet.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-3 py-2.5 font-medium">Consumer</th>
                  <th className="text-left px-3 py-2.5 font-medium">Card ID</th>
                  <th className="text-left px-3 py-2.5 font-medium">Card Type</th>
                  <th className="text-left px-3 py-2.5 font-medium">Membership Level</th>
                  <th className="text-left px-3 py-2.5 font-medium">Status</th>
                  <th className="text-left px-3 py-2.5 font-medium">Allocation Type</th>
                  <th className="text-left px-3 py-2.5 font-medium">Issued</th>
                  <th className="text-left px-3 py-2.5 font-medium">E-Card</th>
                  <th className="text-left px-3 py-2.5 font-medium">Add. Cards</th>
                  <th className="text-right px-3 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((c: any) => (
                  <tr key={c.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer" onClick={() => setDrawerConsumer(c)}>
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{c.consumer}</td>
                    <td className="px-3 py-2.5 text-gray-500 font-mono text-[10px]">{c.cardId}</td>
                    <td className="px-3 py-2.5"><span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{c.type}</span></td>
                    <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${c.membershipLevel === 'Platinum' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600' : c.membershipLevel === 'Gold' ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600' : c.membershipLevel === 'Silver' ? 'bg-gray-100 dark:bg-gray-700 text-gray-500' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700'}`}>{c.membershipLevel}</span></td>
                    <td className="px-3 py-2.5"><Badge status={c.status} /></td>
                    <td className="px-3 py-2.5"><span className="text-[10px] text-gray-500">{c.allocationType}</span></td>
                    <td className="px-3 py-2.5 text-gray-500">{c.created}</td>
                    <td className="px-3 py-2.5">{c.eCard?.enabled ? <span className="text-green-600 text-[10px] font-medium">Yes ${c.eCard.value}</span> : <span className="text-gray-300">--</span>}</td>
                    <td className="px-3 py-2.5 text-gray-500">{c.additionalCards ? `${c.additionalCards.length}` : '0'}</td>
                    <td className="px-3 py-2.5 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setDrawerConsumer(c) }} className="text-orange-600 dark:text-orange-400 hover:underline text-[10px] font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* F&F Summary */}
      {!noCards && (
        <div className="mt-5 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Friends & Family Summary</h4>
            <span className="text-[10px] text-gray-400">Total F&F allocation: {ffUsed}/{ffTotal}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="text-[9px] text-gray-400 mb-0.5">VCards with F&F</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">{biz.consumerVCards.filter((c: any) => c.familyMember?.allocated).length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="text-[9px] text-gray-400 mb-0.5">Cards with Add. Cards</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">{biz.consumerCards.filter((c: any) => c.additionalCards?.length > 0).length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="text-[9px] text-gray-400 mb-0.5">Total Add. Cardholders</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">{biz.consumerCards.reduce((s: number, c: any) => s + (c.additionalCards?.length || 0), 0)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="text-[9px] text-gray-400 mb-0.5">Allocations Locked</p>
              <p className="text-base font-bold text-amber-600">{biz.consumerCards.filter((c: any) => c.allocationLocked).length + biz.consumerVCards.filter((c: any) => c.allocationLocked).length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ===== MEMBERSHIP & ALLOCATION TAB ===== */
function MembershipTab({ biz }: { biz: any }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('ready')
  const [showChangePlan, setShowChangePlan] = useState(false)
  const [showAdjust, setShowAdjust] = useState(false)

  if (state === 'loading') return <LoadingTab />
  if (state === 'error') return <ErrorState message="We couldn't load the membership data." onRetry={() => setState('ready')} />

  const vPct = biz.consumerVTotal > 0 ? Math.round((biz.vcardsUsed / biz.consumerVTotal) * 100) : 0
  const cPct = biz.consumerCTotal > 0 ? Math.round((biz.cardsUsed / biz.consumerCTotal) * 100) : 0

  const vActive = biz.consumerVCards.filter((c: any) => c.status === 'Active').length
  const vPending = biz.consumerVCards.filter((c: any) => c.status === 'Pending').length
  const vSuspended = biz.consumerVCards.filter((c: any) => c.status === 'Suspended' || c.status === 'Inactive').length
  const vAvailable = biz.consumerVTotal - biz.vcardsUsed
  const cActive = biz.consumerCards.filter((c: any) => c.status === 'Active').length
  const cPending = biz.consumerCards.filter((c: any) => c.status === 'Pending').length
  const cSuspended = biz.consumerCards.filter((c: any) => c.status === 'Suspended' || c.status === 'Inactive').length
  const cAvailable = biz.consumerCTotal - biz.cardsUsed
  const ffTotal = Math.floor((biz.consumerVTotal + biz.consumerCTotal) * 0.2)
  const ffUsed = biz.consumerVCards.filter((c: any) => c.familyMember?.allocated).length + biz.consumerCards.filter((c: any) => c.additionalCards?.length > 0).length
  const eCardTotal = biz.consumerVCards.filter((c: any) => c.eCard?.enabled).length + biz.consumerCards.filter((c: any) => c.eCard?.enabled).length

  /* Live plan rules from Pricing & Plans — enforced for admin setup. */
  const pricingState = loadMembershipPricing()
  const livePlanLevel = getPlanLevelFromName(biz.membership)
  const liveRules = rulesForContext(pricingState, livePlanLevel, 'admin')

  if (biz.membershipStatus !== 'Active' && !biz.consumerVTotal && !biz.consumerCTotal) {
    return (
      <EmptyState icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" title="No Active Membership"
        desc="This business does not currently have an active MCOMVCard membership."
        action={{ label: 'Assign Membership', onClick: () => setShowChangePlan(true) }} />
    )
  }

  /* Change Membership Modal */
  function ChangePlanModal() {
    const plans = [
      { name: 'Bronze Standard', tier: 'Starter', level: 'Basic', v: 10, c: 5, addCards: 1, eCard: 'Coming Soon', billing: '90-Day', amount: '$0' },
      { name: 'Bronze Pro', tier: 'Professional', level: 'Plus', v: 100, c: 50, addCards: 2, eCard: 'Coming Soon', billing: '90-Day', amount: '$2,500' },
      { name: 'Silver Pro', tier: 'Business', level: 'Pro', v: 500, c: 500, addCards: 3, eCard: 'Coming Soon', billing: '90-Day', amount: '$8,000' },
      { name: 'Enterprise Pro', tier: 'Enterprise', level: 'Ultimate', v: 1000, c: 1000, addCards: 5, eCard: 'Coming Soon', billing: 'Annual', amount: '$24,000' },
    ]
    const [selected, setSelected] = useState(plans.findIndex((p) => p.name === biz.membership))
    const target = plans[selected >= 0 ? selected : 0]
    const isSame = target.name === biz.membership

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowChangePlan(false)}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{isSame ? 'Current Membership' : 'Change Membership'}</h3>
            <button onClick={() => setShowChangePlan(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Select a new plan to see how the entitlement changes.</p>
            <div className="grid gap-2">
              {plans.map((p, i) => {
                const isCurrent = p.name === biz.membership
                return (
                  <button key={p.name} onClick={() => setSelected(i)} className={`w-full text-left p-3 rounded-lg border transition-colors ${selected === i ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10' : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'} ${isCurrent ? 'ring-1 ring-orange-300' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.name}{isCurrent && <span className="text-[10px] text-orange-600 ml-2 font-normal">Current</span>}</p>
                        <p className="text-[10px] text-gray-500">{p.tier} · {p.level} · {p.billing} · {p.amount}</p>
                      </div>
                      <div className="text-right text-[10px] text-gray-500">
                        <p>{p.v} V · {p.c} C</p>
                        <p>{p.addCards} add. cards</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {!isSame && (
              <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">Entitlement Change Preview</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 mb-1">Current ({biz.membership})</p>
                    <p className="font-medium text-gray-900 dark:text-white">VCards: {biz.consumerVTotal} · Cards: {biz.consumerCTotal}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 mb-1">New ({target.name})</p>
                    <p className="font-medium text-green-600">VCards: {target.v} · Cards: {target.c}</p>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-gray-500">
                  {target.v >= biz.consumerVTotal ? (
                    <span className="text-green-600">✓ Upgrade — Existing allocations remain valid. {target.v - biz.consumerVTotal} additional VCard units will be available.</span>
                  ) : (
                    <span className="text-amber-600">⚠ Downgrade — Existing allocations ({biz.vcardsUsed}) exceed or may exceed new plan limit ({target.v}). No automatic revocation. New issuance will be blocked until within limit.</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowChangePlan(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              {!isSame && <button onClick={() => { toast.success(`Membership changed to ${target.name}. Entitlement recalculated.`); setShowChangePlan(false) }} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Apply Change to {target.name}</button>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* Adjust Allocation Modal */
  function AdjustAllocationModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAdjust(false)}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Adjust Allocation</h3>
            <button onClick={() => setShowAdjust(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Allocation Type</label>
              <select className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>Consumer VCard</option><option>Consumer Card</option><option>Additional Subcard</option><option>E-Card Entitlement</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Adjustment Type</label>
              <select className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>Increase entitlement</option><option>Decrease entitlement</option><option>Grant temporary allocation</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Quantity</label>
              <input type="number" defaultValue={10} min={1} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Reason <span className="text-red-400">*</span></label>
              <input type="text" placeholder="e.g. Approved promotional campaign" className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Notes (optional)</label>
              <textarea rows={2} placeholder="Additional context for audit log" className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none" />
            </div>
          </div>
          <div className="flex gap-2 justify-end px-5 pb-5">
            <button onClick={() => setShowAdjust(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button onClick={() => { toast.success('Allocation adjusted. Audit record created.'); setShowAdjust(false) }} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Apply Adjustment</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {showChangePlan && <ChangePlanModal />}
      {showAdjust && <AdjustAllocationModal />}

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Membership & Allocation</h3>
          <p className="text-xs text-gray-400">Manage this business's membership entitlement, consumer VCard and Card allocations, and associated e-card benefits.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowChangePlan(true)} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Change Membership</button>
          <button onClick={() => setShowAdjust(true)} className="px-3 py-1.5 rounded-lg border border-orange-500 text-orange-600 text-xs font-semibold hover:bg-orange-50 dark:hover:bg-orange-500/10">Adjust Allocation</button>
          <button onClick={() => toast.success('Opening full allocation history')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View Allocation History</button>
        </div>
      </div>

      {/* Membership Summary Card */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-500/5 dark:to-orange-600/5 rounded-xl border border-orange-200 dark:border-orange-800 p-5 mb-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{biz.membership}</p>
              <Badge status={biz.membershipStatus} variant="dot" />
              <span className="text-[10px] text-gray-400 bg-white/50 dark:bg-gray-800/50 px-2 py-0.5 rounded">{biz.planTier} · {biz.planLevel}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500 mt-2">
              <span>Start: <strong className="text-gray-700 dark:text-gray-300">{biz.membershipStart}</strong></span>
              <span>Renewal: <strong className="text-gray-700 dark:text-gray-300">{biz.membershipRenewal}</strong></span>
              <span>Billing: <strong className="text-gray-700 dark:text-gray-300">{biz.billingCycle}</strong></span>
              <span>Payment: <strong className="text-green-600">{biz.paymentStatus}</strong></span>
              <span>Auto-Renewal: <strong className="text-gray-700 dark:text-gray-300">{biz.autoRenewal ? 'Enabled' : 'Disabled'}</strong></span>
              <span>Assigned By: <strong className="text-gray-700 dark:text-gray-300">{biz.assignedBy}</strong></span>
              <span>Amount: <strong className="text-gray-700 dark:text-gray-300">{biz.amountPaid}</strong></span>
              <span>Updated: <strong className="text-gray-700 dark:text-gray-300">{biz.lastUpdated}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Live plan rules (from Pricing & Plans) — drive admin setup */}
      {liveRules.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Live plan rules — {livePlanLevel}</h4>
            <span className="text-[10px] text-gray-400">Set in Pricing &amp; Plans · updated {pricingState.updatedAt || '—'}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {liveRules.map(r => (
              <div key={r.label} className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/20 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 truncate">{r.label}</p>
                  <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${r.scope === 'All' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600'}`}>{r.scope === 'All' ? 'All' : r.scope}</span>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{formatLimit(r.values.Normal)}</p>
                {r.description && <p className="text-[9px] text-gray-400 mt-0.5 truncate" title={r.description}>{r.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Membership Entitlements Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-5">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Membership Entitlements</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-3 py-2 font-medium">Entitlement</th>
                <th className="text-right px-3 py-2 font-medium">Plan Allows</th>
                <th className="text-right px-3 py-2 font-medium">Used</th>
                <th className="text-right px-3 py-2 font-medium">Remaining</th>
                <th className="text-right px-3 py-2 font-medium">Utilisation</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Consumer VCards', allows: biz.consumerVTotal, used: biz.vcardsUsed, remaining: vAvailable, pct: vPct },
                { label: 'Consumer Cards', allows: biz.consumerCTotal, used: biz.cardsUsed, remaining: cAvailable, pct: cPct },
                { label: 'Face-Value E-Cards', allows: `${biz.consumerVTotal + biz.consumerCTotal} max`, used: eCardTotal, remaining: (biz.consumerVTotal + biz.consumerCTotal) - eCardTotal, pct: Math.round((eCardTotal / Math.max(biz.consumerVTotal + biz.consumerCTotal, 1)) * 100) },
                { label: 'F&F Subcards', allows: `${ffTotal} max`, used: ffUsed, remaining: ffTotal - ffUsed, pct: Math.round((ffUsed / Math.max(ffTotal, 1)) * 100) },
              ].map((e) => (
                <tr key={e.label} className="border-b border-gray-50 dark:border-gray-700/50">
                  <td className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300">{e.label}</td>
                  <td className="px-3 py-2.5 text-right text-gray-900 dark:text-white font-mono">{e.allows}</td>
                  <td className="px-3 py-2.5 text-right text-orange-600 font-mono">{e.used}</td>
                  <td className="px-3 py-2.5 text-right"><span className={`font-mono ${e.remaining > 0 ? 'text-green-600' : 'text-red-500'}`}>{e.remaining}</span></td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[10px] text-gray-400 w-8 text-right">{e.pct}%</span>
                      <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${e.pct >= 90 ? 'bg-red-500' : e.pct >= 75 ? 'bg-orange-500' : e.pct >= 50 ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(e.pct, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VCard + Card Allocation Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* VCard Allocation */}
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Consumer VCard Allocation</h4>
            <span className={`text-[10px] font-medium ${vPct >= 90 ? 'text-red-500' : 'text-gray-400'}`}>{biz.consumerVTotal} entitled</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center mb-3">
            <div><p className="text-lg font-bold text-gray-900 dark:text-white">{biz.vcardsUsed}</p><p className="text-[9px] text-gray-400">Allocated</p></div>
            <div><p className="text-lg font-bold text-green-600">{vActive}</p><p className="text-[9px] text-gray-400">Active</p></div>
            <div><p className="text-lg font-bold text-yellow-600">{vPending}</p><p className="text-[9px] text-gray-400">Pending</p></div>
            <div><p className="text-lg font-bold text-red-500">{vSuspended}</p><p className="text-[9px] text-gray-400">Suspended</p></div>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-3">
            <div className={`h-full rounded-full ${vPct >= 90 ? 'bg-red-500' : vPct >= 75 ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${vPct}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-400">Available: <strong className={`${vAvailable > 0 ? 'text-green-600' : 'text-red-500'}`}>{vAvailable}</strong></span>
            <button onClick={() => toast.success('Navigating to Consumer Cards & Allocations > VCards')} className="text-orange-600 hover:underline">View Consumer VCards →</button>
          </div>
        </div>

        {/* Card Allocation */}
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Consumer Card Allocation</h4>
            <span className={`text-[10px] font-medium ${cPct >= 90 ? 'text-red-500' : 'text-gray-400'}`}>{biz.consumerCTotal} entitled</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center mb-3">
            <div><p className="text-lg font-bold text-gray-900 dark:text-white">{biz.cardsUsed}</p><p className="text-[9px] text-gray-400">Allocated</p></div>
            <div><p className="text-lg font-bold text-green-600">{cActive}</p><p className="text-[9px] text-gray-400">Active</p></div>
            <div><p className="text-lg font-bold text-yellow-600">{cPending}</p><p className="text-[9px] text-gray-400">Pending</p></div>
            <div><p className="text-lg font-bold text-red-500">{cSuspended}</p><p className="text-[9px] text-gray-400">Suspended</p></div>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-3">
            <div className={`h-full rounded-full ${cPct >= 90 ? 'bg-red-500' : cPct >= 75 ? 'bg-orange-500' : 'bg-purple-500'}`} style={{ width: `${cPct}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-400">Available: <strong className={`${cAvailable > 0 ? 'text-green-600' : 'text-red-500'}`}>{cAvailable}</strong></span>
            <button onClick={() => toast.success('Navigating to Consumer Cards & Allocations > Cards')} className="text-orange-600 hover:underline">View Consumer Cards →</button>
          </div>
        </div>
      </div>

      {/* F&F + E-Card Side by Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="bg-blue-50 dark:bg-blue-500/5 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
          <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">Friends & Family Entitlement</h4>
          <div className="grid grid-cols-3 gap-2 text-center mb-2">
            <div><p className="text-base font-bold text-gray-900 dark:text-white">{ffTotal}</p><p className="text-[9px] text-blue-600 dark:text-blue-500">Allowed</p></div>
            <div><p className="text-base font-bold text-orange-600">{ffUsed}</p><p className="text-[9px] text-blue-600 dark:text-blue-500">Allocated</p></div>
            <div><p className={`text-base font-bold ${ffTotal - ffUsed > 0 ? 'text-green-600' : 'text-red-500'}`}>{ffTotal - ffUsed}</p><p className="text-[9px] text-blue-600 dark:text-blue-500">Available</p></div>
          </div>
          <p className="text-[9px] text-blue-600 dark:text-blue-400 italic">Consumers allocate their subcards via their Consumer Dashboard. Admin can view allocations in the consumer detail drawer.</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-500/5 rounded-xl border border-purple-200 dark:border-purple-800 p-4">
          <h4 className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2">E-Card / Face Value</h4>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-500">Coming Soon — External Integration</span>
          </div>
          <p className="text-[9px] text-purple-600 dark:text-purple-400">E-Card and face-value functionality will connect to the MCOMMall cashback/e-card system. MCOMVCard is prepared to store external references, face values, currency, issuer, recipient, status, and expiry data.</p>
          <p className="text-[9px] text-purple-600 dark:text-purple-400 mt-1">Currently <strong>{eCardTotal}</strong> cards have E-Card enabled in preparation.</p>
        </div>
      </div>

      {/* Allocation History */}
      <div>
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Allocation History</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-3 py-2 font-medium">Date</th>
                <th className="text-left px-3 py-2 font-medium">Action</th>
                <th className="text-left px-3 py-2 font-medium">Allocation Type</th>
                <th className="text-right px-3 py-2 font-medium">Quantity</th>
                <th className="text-right px-3 py-2 font-medium">Previous</th>
                <th className="text-right px-3 py-2 font-medium">New</th>
                <th className="text-left px-3 py-2 font-medium">Source</th>
                <th className="text-left px-3 py-2 font-medium">Performed By</th>
                <th className="text-left px-3 py-2 font-medium">Reason</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: biz.membershipStart, action: 'Plan Activated', type: 'Membership', qty: `+${biz.consumerVTotal + biz.consumerCTotal}`, prev: '0', next: `${biz.consumerVTotal + biz.consumerCTotal}`, source: 'System', by: 'System', reason: 'New plan' },
                ...biz.consumerVCards.slice(0, 3).map((c: any) => ({
                  date: c.issued, action: 'VCard Issued', type: 'VCard', qty: '-1', prev: `${biz.consumerVTotal - biz.consumerVCards.indexOf(c) - 1}`, next: `${biz.consumerVTotal - biz.consumerVCards.indexOf(c)}`, source: 'Business', by: 'Business Owner', reason: `Issued to ${c.consumer}`
                })),
                { date: '2d ago', action: 'Bonus Added', type: 'Promotion', qty: '+50', prev: `${biz.consumerVTotal}`, next: `${biz.consumerVTotal + 50}`, source: 'Admin', by: 'Admin', reason: 'Promotional bonus' },
                { date: '5d ago', action: 'Expired', type: 'System', qty: '-3', prev: `${biz.cardsUsed + 3}`, next: `${biz.cardsUsed}`, source: 'System', by: 'System', reason: 'Cards expired' },
              ].map((row: any, i: number) => (
                <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30" onClick={() => toast.success(`Opening allocation event: ${row.action}`)}>
                  <td className="px-3 py-2 text-gray-500">{row.date}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300 font-medium">{row.action}</td>
                  <td className="px-3 py-2"><span className="text-[10px] text-gray-500">{row.type}</span></td>
                  <td className={`px-3 py-2 text-right font-mono font-medium ${row.qty.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{row.qty}</td>
                  <td className="px-3 py-2 text-right text-gray-400 font-mono">{row.prev}</td>
                  <td className="px-3 py-2 text-right text-gray-900 dark:text-white font-mono">{row.next}</td>
                  <td className="px-3 py-2 text-gray-500">{row.source}</td>
                  <td className="px-3 py-2 text-gray-500">{row.by}</td>
                  <td className="px-3 py-2 text-gray-400 text-[10px] max-w-[120px] truncate">{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ===== ACTIVITY TAB ===== */
function ActivityTab({ biz }: { biz: any }) {
  const [filterType, setFilterType] = useState('All')
  const [filterAction, setFilterAction] = useState('All')
  const [filterActor, setFilterActor] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [loading, setLoading] = useState(false)

  const allActivities = biz.activity || []
  const actors: string[] = Array.from(new Set(allActivities.map((a: any) => a.actorName || 'System')))

  const actionOptions: Record<string, string[]> = {
    All: [],
    VCard: ['Issued', 'Activated', 'Suspended', 'Reactivated'],
    Card: ['Issued', 'Activated', 'Suspended', 'Reactivated'],
    Allocations: ['Allocated', 'Increased', 'Decreased', 'Expired'],
    Membership: ['Upgraded', 'Downgraded', 'Renewed', 'Changed'],
    Admin: ['Login', 'Export', 'Created', 'Updated', 'Deleted'],
  }

  const getTypeFromObject = (objType: string) => {
    if (!objType || objType === 'N/A') return 'Admin'
    const t = objType.toLowerCase()
    if (t.includes('vcard')) return 'VCard'
    if (t.includes('card') && !t.includes('vcard')) return 'Card'
    if (t.includes('alloc')) return 'Allocations'
    if (t.includes('membership') || t.includes('plan')) return 'Membership'
    return 'Admin'
  }

  const getActionOptions = () => actionOptions[filterType] || []

  const filtered = allActivities.filter((a: any) => {
    if (filterType !== 'All' && getTypeFromObject(a.objectType) !== filterType) return false
    if (filterAction !== 'All' && !(a.description || '').toLowerCase().includes(filterAction.toLowerCase())) return false
    if (filterActor !== 'All' && a.actorName !== filterActor) return false
    if (filterStatus !== 'All' && a.status !== filterStatus) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchStr = `${a.activityId || ''} ${a.description || ''} ${a.objectType || ''} ${a.objectId || ''} ${a.actorName || ''}`.toLowerCase()
      if (!matchStr.includes(q)) return false
    }
    return true
  })

  const summaryCards = [
    { label: 'Total Events', count: allActivities.length, active: filterType === 'All', onClick: () => setFilterType('All'), color: 'bg-gray-900 dark:bg-white', bg: 'bg-gray-50 dark:bg-gray-700/30' },
    { label: 'VCards', count: allActivities.filter((a: any) => getTypeFromObject(a.objectType) === 'VCard').length, active: filterType === 'VCard', onClick: () => setFilterType('VCard'), color: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/5' },
    { label: 'Cards', count: allActivities.filter((a: any) => getTypeFromObject(a.objectType) === 'Card').length, active: filterType === 'Card', onClick: () => setFilterType('Card'), color: 'bg-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/5' },
    { label: 'Allocations', count: allActivities.filter((a: any) => getTypeFromObject(a.objectType) === 'Allocations').length, active: filterType === 'Allocations', onClick: () => setFilterType('Allocations'), color: 'bg-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/5' },
    { label: 'Membership', count: allActivities.filter((a: any) => getTypeFromObject(a.objectType) === 'Membership').length, active: filterType === 'Membership', onClick: () => setFilterType('Membership'), color: 'bg-green-500', bg: 'bg-green-50 dark:bg-green-500/5' },
    { label: 'Admin Actions', count: allActivities.filter((a: any) => getTypeFromObject(a.objectType) === 'Admin').length, active: filterType === 'Admin', onClick: () => setFilterType('Admin'), color: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-500/5' },
  ]

  const typeDotColors: Record<string, string> = {
    VCard: 'border-blue-500', Card: 'border-purple-500', Allocations: 'border-orange-500',
    Membership: 'border-green-500', Admin: 'border-red-500',
  }
  const statusStyles: Record<string, string> = {
    success: 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400',
    failed: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
    pending: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  }

  const handleViewObject = (a: any) => {
    const type = getTypeFromObject(a.objectType)
    if (type === 'VCard' || type === 'Card') {
      toast.success(`Navigating to Consumer Cards & Allocations > ${type}s tab`)
    } else if (type === 'Allocations' || type === 'Membership') {
      toast.success('Navigating to Membership & Allocation tab')
    } else {
      toast.success(`Viewing ${a.objectType || 'object'} details`)
    }
  }

  const formatDateTime = (dt: string) => {
    if (!dt) return '—'
    if (dt.includes('T')) {
      const d = new Date(dt)
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    }
    return dt
  }

  if (loading) return <LoadingTab />
  if (!allActivities.length) {
    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Activity</h3>
            <p className="text-xs text-gray-400">Historical record of all activity for this business.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1000) }} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Refresh</button>
            <button onClick={() => toast.success('Exporting activity data')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Export</button>
            <button onClick={() => toast.success('Opening overview dashboard')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">View Overview</button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No activity recorded yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Activity will appear here as events occur.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Activity</h3>
          <p className="text-xs text-gray-400">Historical record of all activity for this business.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1000) }} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Refresh</button>
          <button onClick={() => toast.success('Exporting activity data')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Export</button>
          <button onClick={() => toast.success('Opening overview dashboard')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">View Overview</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {summaryCards.map((card) => (
          <button key={card.label} onClick={card.onClick} className={`${card.bg} rounded-xl border ${card.active ? 'border-orange-500 ring-1 ring-orange-500' : 'border-gray-100 dark:border-gray-700'} p-3 text-left hover:shadow-sm transition-shadow`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${card.color}`} />
              <span className="text-[10px] text-gray-500 dark:text-gray-400">{card.label}</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{card.count}</p>
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[120px]">
            <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1">Type</label>
            <select value={filterType} onChange={e => { setFilterType(e.target.value); setFilterAction('All') }} className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              {['All', 'VCard', 'Card', 'Allocations', 'Membership', 'Admin'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="min-w-[120px]">
            <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1">Action</label>
            <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="All">All Actions</option>
              {getActionOptions().map((a: string) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="min-w-[120px]">
            <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1">Actor</label>
            <select value={filterActor} onChange={e => setFilterActor(e.target.value)} className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="All">All Actors</option>
              {actors.map((a: string) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="min-w-[100px]">
            <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              {['All', 'success', 'pending', 'failed'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1">Search</label>
            <input type="text" placeholder="Search by ID, description, object, actor..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
          </div>
          <button onClick={() => { setFilterType('All'); setFilterAction('All'); setFilterActor('All'); setFilterStatus('All'); setSearchQuery('') }} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Clear Filters</button>
        </div>
      </div>

      {/* Activity Timeline */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No matching activity</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search or filters.</p>
          <button onClick={() => { setFilterType('All'); setFilterAction('All'); setFilterActor('All'); setFilterStatus('All'); setSearchQuery('') }} className="mt-3 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Clear All Filters</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a: any, idx: number) => {
            const type = getTypeFromObject(a.objectType)
            return (
              <div key={a.activityId || idx} onClick={() => { setSelectedActivity(a); setShowDrawer(true) }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 hover:shadow-sm transition-shadow cursor-pointer">
                <div className="flex items-start gap-3">
                  {/* Type-colored dot */}
                  <div className={`w-3 h-3 rounded-full border-2 ${typeDotColors[type] || 'border-gray-400'} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">{a.description || 'Activity event'}</span>
                      {a.status && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusStyles[a.status] || 'bg-gray-100 text-gray-600'}`}>{a.status}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                      <span>{formatDateTime(a.dateTime || a.date || '')}</span>
                      <span>·</span>
                      <span className="font-medium">{type}</span>
                      {a.objectId && a.objectId !== 'N/A' && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-[10px]">{a.objectId}</span>
                        </>
                      )}
                      {a.actorName && (
                        <>
                          <span>·</span>
                          <span>by {a.actorName}</span>
                        </>
                      )}
                      {a.activityId && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-[10px] text-gray-400">#{a.activityId}</span>
                        </>
                      )}
                    </div>
                    {/* Change details */}
                    {(a.previousValue || a.newValue) && (
                      <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                        {a.previousValue && <span className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded line-through">{a.previousValue}</span>}
                        {(a.previousValue && a.newValue) && <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
                        {a.newValue && <span className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded">{a.newValue}</span>}
                        {a.source && <span className="text-gray-400 ml-1">({a.source})</span>}
                      </div>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Drawer */}
      {showDrawer && selectedActivity && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowDrawer(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-5 py-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Activity Details</h3>
              <button onClick={() => setShowDrawer(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[10px] text-gray-400 mb-0.5">Activity ID</p><p className="font-mono text-gray-900 dark:text-white">{selectedActivity.activityId || '—'}</p></div>
                <div><p className="text-[10px] text-gray-400 mb-0.5">Date & Time</p><p className="text-gray-900 dark:text-white">{formatDateTime(selectedActivity.dateTime || selectedActivity.date || '')}</p></div>
                <div><p className="text-[10px] text-gray-400 mb-0.5">Type</p><p className="text-gray-900 dark:text-white">{getTypeFromObject(selectedActivity.objectType)}</p></div>
                <div><p className="text-[10px] text-gray-400 mb-0.5">Object</p><p className="text-gray-900 dark:text-white">{selectedActivity.objectType || 'N/A'}</p></div>
                <div><p className="text-[10px] text-gray-400 mb-0.5">Object ID</p><p className="font-mono text-gray-900 dark:text-white">{selectedActivity.objectId || 'N/A'}</p></div>
                <div><p className="text-[10px] text-gray-400 mb-0.5">Source</p><p className="text-gray-900 dark:text-white">{selectedActivity.source || '—'}</p></div>
                <div><p className="text-[10px] text-gray-400 mb-0.5">Actor</p><p className="text-gray-900 dark:text-white">{selectedActivity.actorType || 'System'} · {selectedActivity.actorName || 'System'}</p></div>
                <div><p className="text-[10px] text-gray-400 mb-0.5">Status</p><p className="text-gray-900 dark:text-white">{selectedActivity.status ? <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusStyles[selectedActivity.status] || 'bg-gray-100'}`}>{selectedActivity.status}</span> : '—'}</p></div>
              </div>

              {(selectedActivity.previousValue || selectedActivity.newValue) && (
                <div>
                  <p className="text-[10px] text-gray-400 mb-1.5">Change Details</p>
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-3 text-xs">
                      {selectedActivity.previousValue && (
                        <div><p className="text-[9px] text-gray-400 mb-0.5">Previous</p><span className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded line-through">{selectedActivity.previousValue}</span></div>
                      )}
                      {(selectedActivity.previousValue && selectedActivity.newValue) && <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
                      {selectedActivity.newValue && (
                        <div><p className="text-[9px] text-gray-400 mb-0.5">New</p><span className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded">{selectedActivity.newValue}</span></div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedActivity.consumerId && (
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">Related Consumer</p>
                  <p className="text-gray-900 dark:text-white font-mono">{selectedActivity.consumerId}{selectedActivity.consumerEmail ? ` · ${selectedActivity.consumerEmail}` : ''}</p>
                </div>
              )}

              <div className="pt-2">
                <button onClick={() => { setShowDrawer(false); handleViewObject(selectedActivity) }} className="w-full px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">
                  View {selectedActivity.objectType || 'Object'} →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ===== ACCOUNT & INTEGRATIONS TAB ===== */
function IntegrationsTab({ biz }: { biz: any }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('ready')
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [integrationErrors, setIntegrationErrors] = useState<Record<string, boolean>>({})

  if (state === 'loading') {
    return (
      <div className="space-y-5">
        <SkeletonBlock className="h-16" />
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-24" />
        <div className="grid grid-cols-2 gap-4"><SkeletonBlock className="h-28" /><SkeletonBlock className="h-28" /></div>
        <div className="grid grid-cols-2 gap-4"><SkeletonBlock className="h-28" /><SkeletonBlock className="h-28" /></div>
        <SkeletonBlock className="h-20" />
      </div>
    )
  }

  if (state === 'error') {
    return <ErrorState message="Unable to load account information." onRetry={() => setState('ready')} />
  }

  const formatDateTime = (dt: string) => dt || '—'

  const statusDot: Record<string, string> = {
    connected: 'bg-green-500',
    'coming-soon': 'bg-gray-300 dark:bg-gray-600',
    pending: 'bg-yellow-500',
    successful: 'bg-green-500',
    failed: 'bg-red-500',
    syncing: 'bg-blue-500',
    Active: 'bg-green-500',
    Suspended: 'bg-red-500',
    Pending: 'bg-yellow-500',
    Disconnected: 'bg-gray-400',
    Deactivated: 'bg-gray-500',
  }

  const accountStatuses = [
    { label: 'Active', desc: 'The business can use MCOMVCard normally.' },
    { label: 'Pending', desc: 'The account exists but setup is incomplete.' },
    { label: 'Suspended', desc: 'The business cannot use selected MCOMVCard features.' },
    { label: 'Disconnected', desc: 'The MCOM Solutions connection is no longer active.' },
    { label: 'Deactivated', desc: 'The account has been deactivated.' },
  ]

  const handleRetrySync = () => {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      toast.success('Account sync completed successfully')
    }, 2000)
  }

  const handleIntegrationRetry = (platform: string) => {
    setIntegrationErrors(prev => ({ ...prev, [platform]: false }))
    toast.success(`Retrying ${platform} connection`)
  }

  const handleSuspend = () => toast.success('MCOMVCard access suspended for this business')
  const handleReactivate = () => toast.success('MCOMVCard access reactivated')
  const handleArchive = () => toast.success('Business profile archived')

  return (
    <div className="space-y-6">
      {/* Business Identity Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
            {biz.name ? biz.name.charAt(0).toUpperCase() : 'B'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{biz.name}</h3>
            <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
              <span className="font-mono">{biz.businessId}</span>
              <StatusDot status={biz.status} />
              <span className="capitalize">{biz.status}</span>
              <span>·</span>
              <span>{biz.membership}</span>
              <span>·</span>
              <span>Account: {biz.accountStatus}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setState('loading'); setTimeout(() => setState('ready'), 800) }} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Refresh</button>
          <button onClick={() => toast.success('Navigating to Business Details > Overview')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View Overview</button>
          <button onClick={() => toast.success('Navigating to Business Details > Activity')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">View Activity</button>
        </div>
      </div>

      {/* Section A - Account Connection Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex items-center gap-2 mb-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">MCOM Account</h4>
          <span className={`w-2 h-2 rounded-full ${biz.authenticationStatus === 'Connected' ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className={`text-[10px] font-medium ${biz.authenticationStatus === 'Connected' ? 'text-green-600' : 'text-yellow-600'}`}>{biz.authenticationStatus}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-[9px] text-gray-400 mb-0.5">Central Account ID</p>
            <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">{biz.centralAccountId}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 mb-0.5">MCOMVCard Business ID</p>
            <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">{biz.localBusinessId}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 mb-0.5">Registration Source</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{biz.registrationSource}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 mb-0.5">Account Type</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{biz.accountType}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 mb-0.5">Authentication</p>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${statusDot[biz.authenticationStatus] || 'bg-gray-400'}`} />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{biz.authenticationStatus}</span>
            </div>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 mb-0.5">Account Status</p>
            <Badge status={biz.accountStatus} />
          </div>
        </div>
      </div>

      {/* Central MCOM Solutions Account Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Central MCOM Solutions Account</h4>
        <div className="bg-blue-50 dark:bg-blue-500/5 rounded-lg p-3 mb-3 text-[11px] text-blue-700 dark:text-blue-400">
          Business registration flows through MCOM Solutions. MCOMVCard receives the authenticated identity and links it to the local business profile. Central account management remains with MCOM Solutions.
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-[9px] text-gray-400 mb-0.5">MCOM Solutions Account ID</p>
            <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">{biz.centralAccountId}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 mb-0.5">Local MCOMVCard Business ID</p>
            <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">{biz.localBusinessId}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 mb-0.5">Account Type</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{biz.accountType}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 mb-0.5">Registration Source</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{biz.registrationSource}</p>
          </div>
        </div>
      </div>

      {/* Authentication Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Authentication</h4>
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2.5 h-2.5 rounded-full ${statusDot[biz.authenticationStatus] || 'bg-gray-400'}`} />
          <span className="text-sm font-bold text-gray-900 dark:text-white">{biz.authenticationStatus}</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {biz.authenticationStatus === 'Connected'
            ? 'The business can access MCOMVCard using its MCOM Solutions account.'
            : biz.authenticationStatus === 'Pending'
            ? 'Authentication setup is in progress.'
            : biz.authenticationStatus === 'Failed'
            ? 'Authentication verification failed. Please check the central account status.'
            : biz.authenticationStatus === 'Suspended'
            ? 'Authentication has been suspended. Contact MCOM Solutions support.'
            : 'Authentication status unavailable.'}
        </p>
        <div className="text-[10px] text-gray-400 dark:text-gray-500 italic">
          MCOMVCard does not manage or store the business owner's central password. Authentication is owned by MCOM Solutions.
        </div>
      </div>

      {/* Account Synchronization */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Synchronization</h4>
          {biz.syncStatus === 'Failed' && (
            <button onClick={handleRetrySync} disabled={syncing} className="px-3 py-1 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600 disabled:opacity-50">
              {syncing ? 'Syncing...' : 'Retry Sync'}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[9px] text-gray-400 mb-0.5">Last Successful Sync</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDateTime(biz.lastSuccessfulSync)}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 mb-0.5">Last Attempted Sync</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDateTime(biz.lastAttemptedSync)}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 mb-0.5">Sync Status</p>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${biz.syncStatus === 'Successful' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${biz.syncStatus === 'Successful' ? 'text-green-600' : 'text-red-600'}`}>{biz.syncStatus}</span>
            </div>
          </div>
        </div>
        {biz.syncError && (
          <div className="mt-3 bg-red-50 dark:bg-red-500/10 rounded-lg p-3 text-[11px] text-red-700 dark:text-red-400">
            Error: {biz.syncError}
          </div>
        )}
      </div>

      {/* Account Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Account Status</h4>
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-2.5 h-2.5 rounded-full ${statusDot[biz.accountStatus] || 'bg-gray-400'}`} />
          <span className="text-sm font-bold text-gray-900 dark:text-white">{biz.accountStatus}</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {accountStatuses.find(s => s.label === biz.accountStatus)?.desc || 'Status information unavailable.'}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500">
          <span>Central Account:</span>
          <span className="font-medium text-gray-600 dark:text-gray-300">Managed by MCOM Solutions</span>
        </div>
      </div>

      {/* Admin Account Actions */}
      {biz.accountStatus !== 'Deleted' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Admin Account Actions</h4>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setState('loading'); setTimeout(() => setState('ready'), 800) }} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Refresh Account Connection</button>
            <button onClick={handleRetrySync} disabled={syncing} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">{syncing ? 'Syncing...' : 'Retry Synchronization'}</button>
            {biz.accountStatus === 'Suspended' ? (
              <button onClick={handleReactivate} className="px-3 py-1.5 rounded-lg border border-green-500 text-green-600 text-xs font-medium hover:bg-green-50 dark:hover:bg-green-500/10">Reactivate MCOMVCard Access</button>
            ) : (
              <button onClick={handleSuspend} className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-500/10">Suspend MCOMVCard Access</button>
            )}
            <button onClick={handleArchive} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">Archive Business Profile</button>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 italic">
            To permanently delete the central account, please use MCOM Solutions. MCOMVCard cannot delete the MCOM Solutions central account.
          </p>
        </div>
      )}

      {/* Section B - MCOM Ecosystem Identity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Ecosystem Identity</h4>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">These IDs allow MCOMVCard to recognise this business as a single entity across the ecosystem.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-3 py-2 font-medium">Platform</th>
                <th className="text-left px-3 py-2 font-medium">Business ID</th>
                <th className="text-left px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { platform: 'MCOM Solutions', id: biz.centralAccountId, status: 'Connected' },
                { platform: 'MCOMVCard', id: biz.ecosystemIds?.mcomVCard || biz.localBusinessId, status: 'Active' },
                { platform: 'MCOM Rewards', id: biz.ecosystemIds?.mcomRewards || 'Not Connected', status: biz.ecosystemIds?.mcomRewards && biz.ecosystemIds.mcomRewards !== 'Not Connected' ? 'Connected' : 'Coming Soon' },
                { platform: 'MCOMMall', id: biz.ecosystemIds?.mcommall || 'Not Connected', status: biz.ecosystemIds?.mcommall && biz.ecosystemIds.mcommall !== 'Not Connected' ? 'Connected' : 'Coming Soon' },
                { platform: 'MCOMSpin', id: biz.ecosystemIds?.mcomSpin || 'Not Connected', status: biz.ecosystemIds?.mcomSpin && biz.ecosystemIds.mcomSpin !== 'Not Connected' ? 'Connected' : 'Coming Soon' },
                { platform: 'FundOrDonate', id: biz.ecosystemIds?.fundOrDonate || 'Not Connected', status: biz.ecosystemIds?.fundOrDonate && biz.ecosystemIds.fundOrDonate !== 'Not Connected' ? 'Connected' : 'Coming Soon' },
              ].map((row) => (
                <tr key={row.platform} className="border-b border-gray-50 dark:border-gray-700/50">
                  <td className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300">{row.platform}</td>
                  <td className="px-3 py-2.5 font-mono text-gray-900 dark:text-white">{row.id}</td>
                  <td className="px-3 py-2.5"><Badge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section C - Integration Cards */}
      <div>
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Ecosystem Integrations</h4>
        {(!biz.integrations || biz.integrations.length === 0) ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 text-center">
            <svg className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4a2 2 0 012-2z" /></svg>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No integrations connected</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm mx-auto">This business is currently using the core MCOMVCard functionality. Additional ecosystem integrations will appear here when they become available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {biz.integrations.filter((i: any) => i.platform !== 'mcom_solutions').map((int: any) => {
              const hasError = integrationErrors[int.platform]
              const isConnected = int.status === 'connected'
              const isComingSoon = int.status === 'coming-soon' || int.status === 'coming_soon'
              return (
                <div key={int.platform} onClick={() => { setSelectedIntegration(int); setShowDrawer(true) }} className={`bg-white dark:bg-gray-800 rounded-xl border p-4 cursor-pointer hover:shadow-sm transition-shadow ${isConnected ? 'border-green-200 dark:border-green-800' : 'border-gray-100 dark:border-gray-700'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="text-xs font-bold text-gray-900 dark:text-white">{int.platformName}</h5>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{int.purpose}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </div>
                  {hasError ? (
                    <div className="bg-red-50 dark:bg-red-500/10 rounded-lg p-2 mb-2">
                      <p className="text-[10px] text-red-600 dark:text-red-400">Connection status unavailable.</p>
                      <button onClick={(e) => { e.stopPropagation(); handleIntegrationRetry(int.platform) }} className="mt-1 text-[10px] text-orange-600 hover:underline">Retry</button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        <span className={`text-[11px] font-medium ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                          {isConnected ? 'Connected' : isComingSoon ? 'Coming Soon' : int.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] mt-2">
                        <span className="text-gray-400">Business ID:</span>
                        <span className="text-gray-700 dark:text-gray-300 font-mono text-right">{int.externalBusinessId || '—'}</span>
                        <span className="text-gray-400">Last Sync:</span>
                        <span className="text-gray-700 dark:text-gray-300 text-right">{int.lastSyncedAt || '—'}</span>
                        {int.syncStatus && (
                          <>
                            <span className="text-gray-400">Sync:</span>
                            <span className={`text-right font-medium ${int.syncStatus === 'successful' ? 'text-green-600' : 'text-yellow-600'}`}>
                              {int.syncStatus === 'successful' ? 'Successful' : int.syncStatus}
                            </span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                  <div className="mt-2 pt-2 border-t border-gray-50 dark:border-gray-700/50">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-medium ${isConnected ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-gray-50 dark:bg-gray-700/30 text-gray-400'}`}>
                      {isConnected ? 'Connected' : 'Coming Soon'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Integration Detail Drawer */}
      {showDrawer && selectedIntegration && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowDrawer(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-5 py-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{selectedIntegration.platformName}</h3>
              <button onClick={() => setShowDrawer(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[9px] text-gray-400 mb-0.5">Platform</p><p className="font-medium text-gray-900 dark:text-white">{selectedIntegration.platformName}</p></div>
                <div><p className="text-[9px] text-gray-400 mb-0.5">Purpose</p><p className="font-medium text-gray-900 dark:text-white">{selectedIntegration.purpose || '—'}</p></div>
                <div><p className="text-[9px] text-gray-400 mb-0.5">Status</p><p className="font-medium text-gray-900 dark:text-white">{selectedIntegration.status === 'connected' ? 'Connected' : selectedIntegration.status === 'coming-soon' ? 'Coming Soon' : selectedIntegration.status}</p></div>
                <div><p className="text-[9px] text-gray-400 mb-0.5">Business ID</p><p className="font-mono text-gray-900 dark:text-white">{selectedIntegration.externalBusinessId || 'Not Connected'}</p></div>
                <div className="col-span-2"><p className="text-[9px] text-gray-400 mb-0.5">Data Owner</p><p className="font-medium text-gray-900 dark:text-white">{selectedIntegration.dataOwner || '—'}</p></div>
                <div className="col-span-2"><p className="text-[9px] text-gray-400 mb-0.5">MCOMVCard Role</p><p className="font-medium text-gray-900 dark:text-white">{selectedIntegration.mcomVCardRole || '—'}</p></div>
              </div>
              {selectedIntegration.connectedAt && (
                <div><p className="text-[9px] text-gray-400 mb-0.5">Connected At</p><p className="font-medium text-gray-900 dark:text-white">{selectedIntegration.connectedAt}</p></div>
              )}
              {selectedIntegration.lastSyncedAt && (
                <div><p className="text-[9px] text-gray-400 mb-0.5">Last Synced</p><p className="font-medium text-gray-900 dark:text-white">{selectedIntegration.lastSyncedAt}</p></div>
              )}
              <div className="pt-2">
                <button onClick={() => { setShowDrawer(false); toast.success(`Opening ${selectedIntegration.platformName} details`) }} className="w-full px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">
                  {selectedIntegration.status === 'connected' ? `View ${selectedIntegration.platformName}` : 'Coming Soon – External Integration'}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 italic text-center">
                MCOMVCard does not own or manage {selectedIntegration.platformName} data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Integration Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Integration Activity</h4>
          <button onClick={() => toast.success('Navigating to Integrations > Integration Activity')} className="text-[10px] text-orange-600 hover:underline">View Integration Activity →</button>
        </div>
        {(!biz.integrationActivity || biz.integrationActivity.length === 0) ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 py-4 text-center">No integration activity recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {biz.integrationActivity.map((act: any) => (
              <div key={act.id} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${act.status === 'successful' ? 'bg-green-500' : act.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{act.action}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${act.status === 'successful' ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' : act.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' : 'bg-gray-50 dark:bg-gray-700/30 text-gray-500'}`}>
                      {act.status === 'successful' ? 'Successful' : act.status === 'coming-soon' ? 'Coming Soon' : act.status === 'pending' ? 'Pending' : act.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{act.date} · {act.platform}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

