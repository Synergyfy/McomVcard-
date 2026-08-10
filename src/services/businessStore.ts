/* ------------------------------------------------------------------ */
/*  MCOMVCard Business Operations Dashboard — mock data store.         */
/*  Businesses only view admin-assigned templates. No create flows.    */
/* ------------------------------------------------------------------ */

import type {
    ActivityEvent,
    AssignedCard,
    AssignedVCard,
    BusinessPermissions,
    BusinessProfile,
    FeatureKey,
    IntegrationItem,
    ReportData,
} from '../types/business'
import { loadMembershipPricing } from './membershipPricingStore'
import { getPlanLevelFromName, getRuleValue, parseLimit } from './membershipEnforcement'

export const BUSINESS_ID = 1

/* ── Business identity (comes from MCOM Solutions) ───────────────── */

export const mockBusinessProfile: BusinessProfile = {
    id: BUSINESS_ID,
    name: 'GreenLeaf Coffee',
    logoUrl: '',
    storefrontUrl: 'https://storefront.greenleaf.coffee',
    category: 'Café',
    sector: 'Hospitality & Retail',
    description: 'Specialty coffee roasters and artisan café serving single-origin brews, fresh pastries and seasonal menus across central London.',
    location: 'London, UK · 51.5072° N, 0.1276° W',
    membership: 'Gold',
    tier: 'Pro',
    owner: 'Sarah Johnson',
    ownerEmail: 'sarah@greenleaf.coffee',
    verificationStatus: 'verified',
    brandId: 'BRD-0001234',
    affiliateId: 'AFF-0005678',
    email: 'info@greenleaf.coffee',
    phone: '+44 20 7946 0958',
    website: 'https://greenleaf.coffee',
    address: '123 King Street, London, UK',
    openingHours: 'Mon–Fri: 7:00–18:00 · Sat: 8:00–19:00 · Sun: 8:00–16:00',
    socialLinks: [
        { platform: 'Instagram', url: 'https://instagram.com/greenleaf.coffee' },
        { platform: 'Facebook', url: 'https://facebook.com/greenleafcoffee' },
        { platform: 'X (Twitter)', url: 'https://x.com/greenleafcoffee' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/company/greenleaf-coffee' },
    ],
    businessImages: [
        'https://example.com/greenleaf-storefront.jpg',
        'https://example.com/greenleaf-interior.jpg',
        'https://example.com/greenleaf-menu.jpg',
    ],
    branches: [
        { id: 1, name: 'Headquarters — King Street', address: '123 King Street, London', phone: '+44 20 7946 0958', isHeadquarters: true },
        { id: 2, name: 'GreenLeaf — Borough Market', address: '8 Stoney Street, London', phone: '+44 20 7946 0123', isHeadquarters: false },
    ],
    joinedAt: 'Jan 2026',
    renewalDate: '15 Oct 2026',
}

/* ── Claimed VCards (business claimed an Admin template) ─────────── */

const CLAIMED_VCARDS_KEY = 'mcom.business.claimed.vcards'

function loadClaimedVCards(): AssignedVCard[] {
    try {
        const raw = localStorage.getItem(CLAIMED_VCARDS_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

function persistClaimedVCards(list: AssignedVCard[]) {
    try { localStorage.setItem(CLAIMED_VCARDS_KEY, JSON.stringify(list)) } catch { /* ignore quota */ }
}

export function isClaimedVCard(id: number): boolean {
    return loadClaimedVCards().some(v => v.id === id)
}

export function getAllAssignedVCards(): AssignedVCard[] {
    return [...mockAssignedVCards, ...loadClaimedVCards()]
}

export function nextVCardId(): number {
    const all = getAllAssignedVCards()
    return all.reduce((m, v) => Math.max(m, v.id), 100) + 1
}

export function claimVCard(input: {
    name: string
    type: string
    category: string
    description: string
    urlSlug: string
    sections: string[]
    previewColor?: string
    previewGradient?: string
}): AssignedVCard {
    const claimed: AssignedVCard = {
        id: nextVCardId(),
        name: input.name,
        type: input.type,
        category: input.category,
        description: input.description,
        status: 'active',
        assignedAt: 'just now',
        lastAdminUpdate: '—',
        urlSlug: input.urlSlug,
        views: 0,
        shares: 0,
        scans: 0,
        previewColor: input.previewColor ?? '#F97316',
        previewGradient: input.previewGradient ?? 'from-orange-500 to-amber-500',
        sections: input.sections,
    }
    persistClaimedVCards([claimed, ...loadClaimedVCards()])
    return claimed
}

export function removeClaimedVCard(id: number): boolean {
    const list = loadClaimedVCards()
    const idx = list.findIndex(v => v.id === id)
    if (idx < 0) return false
    list.splice(idx, 1)
    persistClaimedVCards(list)
    return true
}

/* ── Assigned VCards (admin-controlled) ──────────────────────────── */

export const mockAssignedVCards: AssignedVCard[] = [
    {
        id: 1,
        name: 'Business VCard',
        type: 'Business VCard',
        category: 'Hospitality',
        description: 'Primary digital profile for GreenLeaf Coffee with menu, opening hours and booking links.',
        status: 'active',
        assignedAt: '1 Jun 2026',
        lastAdminUpdate: '22 Jul 2026',
        urlSlug: 'greenleaf-coffee',
        views: 1240,
        shares: 89,
        scans: 342,
        previewColor: '#FF5C00',
        previewGradient: 'from-orange-500 to-amber-500',
        sections: ['About', 'Menu', 'Opening Hours', 'Location', 'Bookings', 'Reviews', 'Social Media'],
    },
    {
        id: 2,
        name: 'Retail VCard',
        type: 'Retail VCard',
        category: 'Retail',
        description: 'Seasonal retail profile for the coffee bean & merchandise storefront.',
        status: 'active',
        assignedAt: '18 Mar 2026',
        lastAdminUpdate: '10 Jul 2026',
        urlSlug: 'greenleaf-retail',
        views: 872,
        shares: 54,
        scans: 198,
        previewColor: '#059669',
        previewGradient: 'from-emerald-500 to-teal-500',
        sections: ['About', 'Store Links', 'Products', 'Offers', 'Contact'],
    },
    {
        id: 3,
        name: 'Seasonal VCard',
        type: 'Seasonal VCard',
        category: 'Seasonal',
        description: 'Summer promotional profile — cold brew & iced coffee specials.',
        status: 'needs_update',
        assignedAt: '1 Jun 2026',
        lastAdminUpdate: '28 Jul 2026',
        urlSlug: 'greenleaf-summer',
        views: 1560,
        shares: 132,
        scans: 410,
        previewColor: '#0EA5E9',
        previewGradient: 'from-sky-500 to-blue-500',
        sections: ['Banner', 'Seasonal Menu', 'Promotions', 'Location'],
    },
    {
        id: 4,
        name: 'International VCard',
        type: 'International VCard',
        category: 'International',
        description: 'International profile for overseas customers and export enquiries.',
        status: 'locked',
        assignedAt: '—',
        lastAdminUpdate: '—',
        urlSlug: '—',
        views: 0,
        shares: 0,
        scans: 0,
        previewColor: '#7C3AED',
        previewGradient: 'from-violet-500 to-purple-500',
        sections: ['About', 'Contact', 'Export Enquiries'],
    },
]

/* ── Assigned Cards (admin-controlled, 85×55 mm) ─────────────────── */

export const mockAssignedCards: AssignedCard[] = [
    {
        id: 1,
        name: 'Business Card',
        type: 'Business Card',
        category: 'Identity',
        description: 'Company identity card with contact details, QR and NFC.',
        status: 'active',
        assignedAt: '1 Jun 2026',
        lastAdminUpdate: '15 Jul 2026',
        cardNumber: 'BC-1001-3490',
        views: 1240,
        shares: 89,
        scans: 342,
        previewColor: '#0F172A',
        previewSecondary: '#D4AF37',
        previewAccent: '#FFFFFF',
    },
    {
        id: 2,
        name: 'Consumer Store Card',
        type: 'Consumer Store Card',
        category: 'Loyalty',
        description: 'In-store loyalty card issued to customers with points tracking.',
        status: 'active',
        assignedAt: '1 Jun 2026',
        lastAdminUpdate: '20 Jul 2026',
        cardNumber: 'CSC-2210-7714',
        views: 2100,
        shares: 156,
        scans: 890,
        previewColor: '#0D9488',
        previewSecondary: '#F0FDFA',
        previewAccent: '#FFFFFF',
    },
    {
        id: 3,
        name: 'Friends & Family Card',
        type: 'Friends & Family Card',
        category: 'Allocation',
        description: 'Additional card for staff and family allocation.',
        status: 'active',
        assignedAt: '1 Jun 2026',
        lastAdminUpdate: '5 Jul 2026',
        cardNumber: 'FFC-1180-2234',
        views: 320,
        shares: 12,
        scans: 45,
        previewColor: '#7C3AED',
        previewSecondary: '#EC4899',
        previewAccent: '#FFFFFF',
    },
    {
        id: 4,
        name: 'E-Gift Card',
        type: 'E Gift Card',
        category: 'Value',
        description: 'Pre-loaded gift card with £2,500 available face value.',
        status: 'active',
        assignedAt: '1 Jun 2026',
        lastAdminUpdate: '18 Jul 2026',
        cardNumber: 'EGC-4410-0092',
        views: 540,
        shares: 34,
        scans: 120,
        faceValue: '£2,500',
        previewColor: '#DC2626',
        previewSecondary: '#1F2937',
        previewAccent: '#FFFFFF',
    },
    {
        id: 5,
        name: 'Seasonal Card',
        type: 'Seasonal Card',
        category: 'Seasonal',
        description: 'Summer campaign card for seasonal promotions.',
        status: 'needs_update',
        assignedAt: '1 Jun 2026',
        lastAdminUpdate: '28 Jul 2026',
        cardNumber: 'SNC-9021-5567',
        views: 780,
        shares: 67,
        scans: 210,
        previewColor: '#0EA5E9',
        previewSecondary: '#F59E0B',
        previewAccent: '#FFFFFF',
    },
    {
        id: 6,
        name: 'International Card',
        type: 'International Card',
        category: 'International',
        description: 'International identity card for overseas partners.',
        status: 'locked',
        assignedAt: '—',
        lastAdminUpdate: '—',
        cardNumber: '—',
        views: 0,
        shares: 0,
        scans: 0,
        previewColor: '#0891B2',
        previewSecondary: '#0F172A',
        previewAccent: '#FFFFFF',
    },
]

/* ── Permissions (from membership rules + admin assignment) ──────── */

export function getBusinessPermissions(): BusinessPermissions {
    const pricing = loadMembershipPricing()
    const planLevel = getPlanLevelFromName(mockBusinessProfile.membership)
    const tier = mockBusinessProfile.tier

    const limitValue = (label: string) => parseLimit(getRuleValue(pricing, planLevel, label, tier))

    const base: Record<FeatureKey, boolean> = {
        share: true,
        exchange: true,
        redeem: true,
        friendsFamily: true,
        passwordAccess: true,
        qr: true,
        analytics: true,
        history: true,
        content: true,
        reports: true,
        integrations: true,
        membership: true,
        help: true,
        settings: true,
    }

    // Example admin-controlled gates — Admin can flip these to false
    // and the business page will never render the feature.
    if (mockBusinessProfile.sector === 'Hospitality & Retail') {
        base.integrations = false // Admin disabled integrations for this sector
    }

    return {
        canSee: base,
        planLevel,
        tier,
        limits: {
            businessVCards: limitValue('Business VCards'),
            businessCards: limitValue('Business Cards'),
            friendsFamily: limitValue('Friends & Family'),
            qrRoutingRules: limitValue('QR routing rules'),
        },
    }
}

/* ── Activity feed ───────────────────────────────────────────────── */

export const mockActivity: ActivityEvent[] = [
    { id: 1, type: 'scan', title: 'QR scanned', description: 'Business Card QR scanned at Borough Market branch', time: '12 min ago', source: 'Business Card' },
    { id: 2, type: 'share', title: 'VCard shared', description: 'Business VCard shared via WhatsApp to 3 contacts', time: '1 hr ago', source: 'Business VCard' },
    { id: 3, type: 'redeem', title: 'E-Gift Card redeemed', description: '£5.00 E-Gift Card redeemed at King Street store', time: '3 hrs ago', source: 'E-Gift Card' },
    { id: 4, type: 'update', title: 'Template updated by Admin', description: 'Seasonal VCard received a new promotional banner', time: 'Yesterday', source: 'Seasonal VCard' },
    { id: 5, type: 'exchange', title: 'Card exchanged', description: 'Exchanged contact details with a vendor partner', time: 'Yesterday', source: 'Business Card' },
    { id: 6, type: 'view', title: 'Profile views spike', description: 'Business VCard received 48 views in one day', time: '2 days ago', source: 'Business VCard' },
    { id: 7, type: 'system', title: 'Friends & Family allocated', description: '1 F&F allocation used — 24 of 25 remaining', time: '3 days ago', source: 'Friends & Family Card' },
    { id: 8, type: 'update', title: 'Template updated by Admin', description: 'Consumer Store Card received new loyalty design', time: '5 days ago', source: 'Consumer Store Card' },
]

/* ── Reports ─────────────────────────────────────────────────────── */

export const mockReportData: ReportData = {
    metrics: [
        { label: 'Total Views', value: '4,128', change: '+12.4%', trend: 'up' },
        { label: 'QR Scans', value: '1,890', change: '+8.1%', trend: 'up' },
        { label: 'Profile Views', value: '3,204', change: '+15.2%', trend: 'up' },
        { label: 'Customer Activity', value: '2,451', change: '-3.0%', trend: 'down' },
    ],
    dailyViews: [
        { label: 'Mon', value: 340 }, { label: 'Tue', value: 420 }, { label: 'Wed', value: 385 },
        { label: 'Thu', value: 510 }, { label: 'Fri', value: 468 }, { label: 'Sat', value: 621 },
        { label: 'Sun', value: 388 },
    ],
    dailyScans: [
        { label: 'Mon', value: 120 }, { label: 'Tue', value: 165 }, { label: 'Wed', value: 142 },
        { label: 'Thu', value: 198 }, { label: 'Fri', value: 176 }, { label: 'Sat', value: 245 },
        { label: 'Sun', value: 158 },
    ],
    topLocations: [
        { country: 'United Kingdom', count: 1890 },
        { country: 'United States', count: 640 },
        { country: 'Germany', count: 312 },
        { country: 'France', count: 208 },
    ],
    deviceBreakdown: [
        { device: 'Mobile', count: 3040 },
        { device: 'Tablet', count: 420 },
        { device: 'Desktop', count: 668 },
    ],
    customerActivity: [
        { action: 'QR scans', count: 1890 },
        { action: 'Card shares', count: 430 },
        { action: 'E-Gift redemptions', count: 87 },
        { action: 'Offer views', count: 44 },
    ],
    membershipUsage: [
        { resource: 'Business VCards', used: 4, limit: '20' },
        { resource: 'Business Cards', used: 6, limit: '50' },
        { resource: 'Friends & Family', used: 1, limit: '25' },
        { resource: 'QR routing rules', used: 3, limit: '10' },
    ],
}

/* ── Integrations (external MCOM platforms — Coming Soon) ────────── */

export const mockIntegrations: IntegrationItem[] = [
    { id: 'rewards', name: 'MCOM Rewards', description: 'Connect your MCOM Rewards account to let customers earn and redeem points.', status: 'coming-soon', icon: 'gift' },
    { id: 'campaigns', name: 'MCOM Campaigns', description: 'Build seasonal and evergreen campaigns and run promotions into events and Expos.', status: 'coming-soon', icon: 'sparkles' },
    { id: 'mall', name: 'MCOMMall', description: 'List your products in the MCOM mall and drive sales from your cards.', status: 'coming-soon', icon: 'store' },
    { id: 'donate', name: 'FundOrDonate', description: 'Add a donation button to your VCard for your favourite cause.', status: 'coming-soon', icon: 'heart' },
    { id: 'spin', name: 'MCOM Spin', description: 'Add a gamified spin-the-wheel to engage customers on your VCard.', status: 'coming-soon', icon: 'sparkles' },
    { id: 'audit', name: '247 GBS Audit', description: 'Audit your business listings and ensure your data is accurate across MCOM.', status: 'coming-soon', icon: 'clipboard' },
    { id: 'pay', name: 'Global Pay', description: 'Accept payments securely from your VCard and storefront.', status: 'coming-soon', icon: 'card' },
    { id: 'storefront', name: 'Hyperlocal Storefronts', description: 'Showcase your business in hyperlocal storefronts near your customers.', status: 'coming-soon', icon: 'map' },
    { id: 'brand', name: 'Brand Assets', description: 'Central hub for your brand logos, colours and downloadable assets.', status: 'coming-soon', icon: 'image' },
    { id: 'future', name: 'Future Integrations', description: 'More MCOM platform integrations are on the way.', status: 'future', icon: 'spark' },
]

/* ── Lookup helpers ──────────────────────────────────────────────── */

export function getVCardById(id: number): AssignedVCard | undefined {
    return getAllAssignedVCards().find(v => v.id === id)
}

export function getCardById(id: number): AssignedCard | undefined {
    return mockAssignedCards.find(c => c.id === id)
}

/* The business's primary (first active) VCard — the one Share / Exchange /
   Redeem shortcuts land on so they work inside the VCard itself. */
export function getPrimaryVCardId(): number {
    return getAllAssignedVCards().find(v => v.status === 'active')?.id ?? 1
}

export function businessVCardLink(centre?: string): string {
    const id = getPrimaryVCardId()
    return centre ? `/business/vcards/${id}?centre=${centre}` : `/business/vcards/${id}`
}