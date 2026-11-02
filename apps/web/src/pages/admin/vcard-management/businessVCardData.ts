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

export const BUSINESS_VCARDS: BusinessVCard[] = []

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
