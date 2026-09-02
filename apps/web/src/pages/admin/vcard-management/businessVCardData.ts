/* ------------------------------------------------------------------ */
/*  Claimed-business data shared by the merged Business VCard flows.   */
/*  A template is "claimed" by a business when the business adopts the */
/*  template for its live VCard. TEMPLATE_BUSINESS_LINKS associates    */
/*  template ids (mock platform ids 1-20) with the businesses below.   */
/* ------------------------------------------------------------------ */

export interface BusinessVCard {
  id: string; preview: string; businessName: string; businessId: string; membership: string
  version: string; status: string; theme: string; published: string; lastUpdated: string
  assignedBuilder: string; views: number; shares: number; qrScans: number; exchangeCount: number
  redeemCount: number; createdDate: string; visibility: string
}

export const BUSINESS_VCARDS: BusinessVCard[] = [
  { id: '1', preview: 'MC', businessName: 'Modern Café', businessId: 'BIZ-001', membership: 'Gold', version: 'v2.4', status: 'Published', theme: 'Restaurant', published: 'Yes', lastUpdated: '2 hours ago', assignedBuilder: 'Admin', views: 12400, shares: 3400, qrScans: 8900, exchangeCount: 1200, redeemCount: 450, createdDate: '15 Jan 2025', visibility: 'Public' },
  { id: '2', preview: 'TC', businessName: 'TechCorp Solutions', businessId: 'BIZ-002', membership: 'Platinum Pro+', version: 'v3.1', status: 'Published', theme: 'Corporate', published: 'Yes', lastUpdated: '1 day ago', assignedBuilder: 'Admin', views: 9800, shares: 2800, qrScans: 7200, exchangeCount: 890, redeemCount: 320, createdDate: '20 Mar 2025', visibility: 'Public' },
  { id: '3', preview: 'LH', businessName: 'Luxury Hotels Ltd', businessId: 'BIZ-003', membership: 'Platinum', version: 'v1.8', status: 'Published', theme: 'Corporate', published: 'Yes', lastUpdated: '3 days ago', assignedBuilder: 'Designer', views: 7200, shares: 2100, qrScans: 5400, exchangeCount: 670, redeemCount: 280, createdDate: '10 Jun 2025', visibility: 'Public' },
  { id: '4', preview: 'GR', businessName: 'Global Retail Inc', businessId: 'BIZ-004', membership: 'Silver Pro', version: 'v2.0', status: 'Draft', theme: 'Retail', published: 'No', lastUpdated: '5 days ago', assignedBuilder: 'Admin', views: 0, shares: 0, qrScans: 0, exchangeCount: 0, redeemCount: 0, createdDate: '1 Aug 2025', visibility: 'Private' },
  { id: '5', preview: 'GE', businessName: 'Green Energy Co', businessId: 'BIZ-005', membership: 'Gold', version: 'v1.2', status: 'Pending Review', theme: 'Corporate', published: 'No', lastUpdated: '1 week ago', assignedBuilder: 'Designer', views: 0, shares: 0, qrScans: 0, exchangeCount: 0, redeemCount: 0, createdDate: '15 Sep 2025', visibility: 'Hidden' },
  { id: '6', preview: 'BH', businessName: 'Boutique Hotel', businessId: 'BIZ-006', membership: 'Silver', version: 'v1.0', status: 'Draft', theme: 'Default', published: 'No', lastUpdated: '2 weeks ago', assignedBuilder: '—', views: 0, shares: 0, qrScans: 0, exchangeCount: 0, redeemCount: 0, createdDate: '20 Oct 2025', visibility: 'Private' },
  { id: '7', preview: 'FS', businessName: 'Fitness Studio Pro', businessId: 'BIZ-007', membership: 'Gold Pro', version: 'v1.5', status: 'Published', theme: 'Custom', published: 'Yes', lastUpdated: '3 days ago', assignedBuilder: 'Admin', views: 5600, shares: 1800, qrScans: 4100, exchangeCount: 540, redeemCount: 190, createdDate: '5 Nov 2025', visibility: 'Public' },
  { id: '8', preview: 'AR', businessName: 'ABC Restaurant', businessId: 'BIZ-008', membership: 'Gold', version: 'v2.1', status: 'Suspended', theme: 'Restaurant', published: 'Yes', lastUpdated: '1 month ago', assignedBuilder: 'Admin', views: 3400, shares: 1200, qrScans: 2800, exchangeCount: 320, redeemCount: 0, createdDate: '10 Dec 2024', visibility: 'Password Protected' },
  { id: '9', preview: 'HW', businessName: 'Health & Wellness Spa', businessId: 'BIZ-009', membership: 'Silver Pro+', version: 'v1.0', status: 'Archived', theme: 'Healthcare', published: 'No', lastUpdated: '2 months ago', assignedBuilder: '—', views: 1800, shares: 600, qrScans: 1200, exchangeCount: 0, redeemCount: 0, createdDate: '1 Feb 2025', visibility: 'Hidden' },
  { id: '10', preview: 'RE', businessName: 'Real Estate Partners', businessId: 'BIZ-010', membership: 'Bronze Pro', version: 'v0.9', status: 'Draft', theme: 'Estate Agent', published: 'No', lastUpdated: '3 weeks ago', assignedBuilder: 'Designer', views: 0, shares: 0, qrScans: 0, exchangeCount: 0, redeemCount: 0, createdDate: '15 Jan 2026', visibility: 'Private' },
]

/* Template id -> ids of the businesses that have claimed it. */
export const TEMPLATE_BUSINESS_LINKS: Record<number, number[]> = {
  1: [2, 3, 5],
  2: [1, 8],
  3: [4],
  4: [9],
  6: [10],
  7: [7],
  8: [6],
}

export function businessesForTemplate(templateId: number): BusinessVCard[] {
  const ids = TEMPLATE_BUSINESS_LINKS[templateId] ?? []
  return ids.map(id => BUSINESS_VCARDS.find(v => v.id === String(id))).filter((v): v is BusinessVCard => Boolean(v))
}

export function claimedCount(templateId: number): number {
  return businessesForTemplate(templateId).length
}
