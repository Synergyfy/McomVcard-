/* ------------------------------------------------------------------ */
/*  MCOMVCard Business Operations Dashboard — domain types.            */
/*  Businesses only receive admin-configured templates. Read-only.     */
/* ------------------------------------------------------------------ */

import type { PlanLevel, PlanTier } from '../services/membershipPricingStore'

export interface BusinessBranch {
    id: number
    name: string
    address: string
    phone: string
    isHeadquarters: boolean
}

export interface BusinessSocialLink {
    platform: string
    url: string
}

export interface BusinessProfile {
    id: number
    name: string
    logoUrl: string
    storefrontUrl: string
    category: string
    sector: string
    description: string
    location: string
    membership: PlanLevel
    tier: PlanTier
    owner: string
    ownerEmail: string
    verificationStatus: 'verified' | 'pending' | 'suspended'
    brandId: string
    affiliateId: string
    email: string
    phone: string
    website: string
    address: string
    openingHours: string
    socialLinks: BusinessSocialLink[]
    businessImages: string[]
    branches: BusinessBranch[]
    joinedAt: string
    renewalDate: string
}

export type TemplateStatus = 'active' | 'needs_update' | 'locked' | 'suspended'

export interface AssignedVCard {
    id: number
    name: string
    type: string
    category: string
    description: string
    status: TemplateStatus
    assignedAt: string
    lastAdminUpdate: string
    urlSlug: string
    views: number
    shares: number
    scans: number
    previewColor: string
    previewGradient: string
    sections: string[]
}

export interface AssignedCard {
    id: number
    name: string
    type: string
    category: string
    description: string
    status: TemplateStatus
    assignedAt: string
    lastAdminUpdate: string
    cardNumber: string
    views: number
    shares: number
    scans: number
    faceValue?: string
    previewColor: string
    previewSecondary: string
    previewAccent: string
}

export type FeatureKey =
    | 'share' | 'exchange' | 'redeem' | 'friendsFamily' | 'passwordAccess'
    | 'qr' | 'analytics' | 'history' | 'content' | 'reports'
    | 'integrations' | 'membership' | 'help' | 'settings'

export interface BusinessPermissions {
    canSee: Record<FeatureKey, boolean>
    planLevel: PlanLevel
    tier: PlanTier
    limits: {
        businessVCards: number | null
        businessCards: number | null
        friendsFamily: number | null
        qrRoutingRules: number | null
    }
}

export type ActivityType = 'scan' | 'share' | 'redeem' | 'exchange' | 'update' | 'view' | 'system'

export interface ActivityEvent {
    id: number
    type: ActivityType
    title: string
    description: string
    time: string
    source: string
}

export type ReportSection =
    | 'summary' | 'cardAnalytics' | 'vcardAnalytics' | 'qrAnalytics'
    | 'traffic' | 'profileViews' | 'customerActivity' | 'membershipUsage' | 'exports'

export interface ReportMetric {
    label: string
    value: string
    change: string
    trend: 'up' | 'down' | 'flat'
}

export interface ChartPoint {
    label: string
    value: number
}

export interface ReportData {
    metrics: ReportMetric[]
    dailyViews: ChartPoint[]
    dailyScans: ChartPoint[]
    topLocations: { country: string; count: number }[]
    deviceBreakdown: { device: string; count: number }[]
    customerActivity: { action: string; count: number }[]
    membershipUsage: { resource: string; used: number; limit: string }[]
}

export interface IntegrationItem {
    id: string
    name: string
    description: string
    status: 'coming-soon' | 'future'
    icon: string
}

export type DetailTabKey =
    | 'overview' | 'content' | 'share' | 'exchange' | 'redeem'
    | 'friendsFamily' | 'passwordAccess' | 'qr' | 'analytics' | 'history'

export interface DetailItemMeta {
    id: number
    name: string
    urlSlug?: string
    category: string
    status: TemplateStatus
    lastAdminUpdate: string
}