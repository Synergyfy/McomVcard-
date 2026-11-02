/** Business dashboard navigation helpers (no mock/demo data). */
export function businessVCardLink(centre?: string): string {
  return centre ? `/b/vcards?centre=${encodeURIComponent(centre)}` : '/b/vcards'
}
