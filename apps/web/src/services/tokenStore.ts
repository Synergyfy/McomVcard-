// In-memory access-token store.
//
// The access token is kept ONLY in memory (never localStorage) so it cannot be
// exfiltrated via XSS. Sessions survive reloads via the HttpOnly refresh_token
// cookie, which is sent automatically and swapped for a fresh access token.
let accessToken: string | null = null

export const tokenStore = {
  get(): string | null {
    return accessToken
  },

  set(token: string): void {
    accessToken = token
  },

  clear(): void {
    accessToken = null
  },
}
