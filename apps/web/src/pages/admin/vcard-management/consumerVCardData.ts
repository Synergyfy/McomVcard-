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

export const CONSUMER_VCARDS: ConsumerVCard[] = []

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
