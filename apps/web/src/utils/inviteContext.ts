export function inviteQuery(card?: string | null, business?: string | null): string {
  const params = new URLSearchParams()
  if (card) params.set('card', card)
  if (business) params.set('business', business)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}
