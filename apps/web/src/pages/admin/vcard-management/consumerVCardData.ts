/* ------------------------------------------------------------------ */
/*  Claimed-consumer data shared by the merged Consumer VCard flows.   */
/*  A consumer template is "claimed" when a consumer's live VCard uses */
/*  it. TEMPLATE_CONSUMER_LINKS associates consumer template ids with  */
/*  the consumer VCards below.                                          */
/* ------------------------------------------------------------------ */

export interface ConsumerVCard {
  id: string; preview: string; consumerName: string; memberId: string; membership: string
  businessSource: string; version: string; status: string; qrStatus: string; friendsCards: number
  familyCards: number; views: number; shares: number; exchangeCount: number; redeemCount: number
  createdDate: string; updatedDate: string; email: string; phone: string; qrId: string
}

export const CONSUMER_VCARDS: ConsumerVCard[] = [
  { id: '1', preview: 'JS', consumerName: 'John Smith', memberId: 'MEM-001', membership: 'Gold Pro', businessSource: 'TechCorp Solutions', version: 'v1.5', status: 'Published', qrStatus: 'Active', friendsCards: 2, familyCards: 1, views: 8900, shares: 3400, exchangeCount: 1200, redeemCount: 450, createdDate: '15 Jan 2026', updatedDate: '2 hours ago', email: 'john@email.com', phone: '+44 7700 100001', qrId: 'QR-JS-001' },
  { id: '2', preview: 'SJ', consumerName: 'Sarah Johnson', memberId: 'MEM-002', membership: 'Platinum', businessSource: 'Luxury Hotels Ltd', version: 'v2.0', status: 'Published', qrStatus: 'Active', friendsCards: 3, familyCards: 2, views: 7200, shares: 2800, exchangeCount: 980, redeemCount: 320, createdDate: '20 Mar 2026', updatedDate: '1 day ago', email: 'sarah@email.com', phone: '+44 7700 100002', qrId: 'QR-SJ-001' },
  { id: '3', preview: 'ED', consumerName: 'Emily Davis', memberId: 'MEM-003', membership: 'Silver', businessSource: 'Café Mocha', version: 'v1.2', status: 'Published', qrStatus: 'Active', friendsCards: 1, familyCards: 0, views: 5600, shares: 2100, exchangeCount: 670, redeemCount: 280, createdDate: '10 Jun 2025', updatedDate: '3 days ago', email: 'emily@email.com', phone: '+44 7700 100003', qrId: 'QR-ED-001' },
  { id: '4', preview: 'JW', consumerName: 'James Wilson', memberId: 'MEM-004', membership: 'Platinum', businessSource: 'Luxury Hotels Ltd', version: 'v1.0', status: 'Draft', qrStatus: 'Inactive', friendsCards: 1, familyCards: 0, views: 0, shares: 0, exchangeCount: 0, redeemCount: 0, createdDate: '1 Aug 2025', updatedDate: '1 week ago', email: 'james@email.com', phone: '+44 7700 100004', qrId: 'QR-JW-001' },
  { id: '5', preview: 'OT', consumerName: 'Olivia Taylor', memberId: 'MEM-005', membership: 'Silver Pro', businessSource: 'Global Retail Inc', version: 'v0.9', status: 'Pending Review', qrStatus: 'Scheduled', friendsCards: 0, familyCards: 0, views: 0, shares: 0, exchangeCount: 0, redeemCount: 0, createdDate: '15 Sep 2025', updatedDate: '5 days ago', email: 'olivia@email.com', phone: '+44 7700 100005', qrId: 'QR-OT-001' },
  { id: '6', preview: 'MB', consumerName: 'Michael Brown', memberId: 'MEM-006', membership: 'Bronze', businessSource: 'TechCorp Solutions', version: 'v1.0', status: 'Suspended', qrStatus: 'Disabled', friendsCards: 0, familyCards: 0, views: 3400, shares: 600, exchangeCount: 0, redeemCount: 0, createdDate: '10 Dec 2024', updatedDate: '1 month ago', email: 'michael@email.com', phone: '+44 7700 100006', qrId: 'QR-MB-001' },
  { id: '7', preview: 'DA', consumerName: 'Daniel Anderson', memberId: 'MEM-007', membership: 'Bronze', businessSource: 'TechCorp Solutions', version: 'v1.0', status: 'Archived', qrStatus: 'Expired', friendsCards: 0, familyCards: 0, views: 1200, shares: 300, exchangeCount: 0, redeemCount: 0, createdDate: '1 Feb 2025', updatedDate: '2 months ago', email: 'daniel@email.com', phone: '+44 7700 100007', qrId: 'QR-DA-001' },
  { id: '8', preview: 'LW', consumerName: 'Lisa Wilson', memberId: 'MEM-008', membership: 'Gold', businessSource: 'Luxury Hotels Ltd', version: 'v1.3', status: 'Published', qrStatus: 'Active', friendsCards: 2, familyCards: 1, views: 4100, shares: 1500, exchangeCount: 540, redeemCount: 190, createdDate: '5 Nov 2025', updatedDate: '3 days ago', email: 'lisa@email.com', phone: '+44 7700 100008', qrId: 'QR-LW-001' },
  { id: '9', preview: 'TT', consumerName: 'Tom Thompson', memberId: 'MEM-009', membership: 'Gold Pro', businessSource: 'Green Energy Co', version: 'v0.5', status: 'Draft', qrStatus: 'Inactive', friendsCards: 0, familyCards: 0, views: 0, shares: 0, exchangeCount: 0, redeemCount: 0, createdDate: '15 Jan 2026', updatedDate: '3 weeks ago', email: 'tom@email.com', phone: '+44 7700 100009', qrId: 'QR-TT-001' },
  { id: '10', preview: 'AK', consumerName: 'Anna Kelly', memberId: 'MEM-010', membership: 'Silver Pro+', businessSource: 'Global Retail Inc', version: 'v1.0', status: 'Published', qrStatus: 'Active', friendsCards: 1, familyCards: 2, views: 2800, shares: 1100, exchangeCount: 320, redeemCount: 140, createdDate: '20 Feb 2026', updatedDate: '1 week ago', email: 'anna@email.com', phone: '+44 7700 100010', qrId: 'QR-AK-001' },
]

/* Consumer template id -> ids of the consumers using it. */
export const TEMPLATE_CONSUMER_LINKS: Record<number, number[]> = {
  1: [3, 6, 9],
  2: [1, 8],
  3: [2, 4],
  4: [5, 10],
  5: [6, 7],
  6: [8],
  7: [1, 2],
  9: [4],
}

export function consumersForTemplate(templateId: number): ConsumerVCard[] {
  const ids = TEMPLATE_CONSUMER_LINKS[templateId] ?? []
  return ids.map(id => CONSUMER_VCARDS.find(v => v.id === String(id))).filter((v): v is ConsumerVCard => Boolean(v))
}

export function claimedConsumerCount(templateId: number): number {
  return consumersForTemplate(templateId).length
}
