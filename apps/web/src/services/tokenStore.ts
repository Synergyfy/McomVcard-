// In-memory access-token store.
//
// The access token is kept ONLY in memory (never localStorage) so it cannot be
// exfiltrated via XSS. Sessions survive reloads via the HttpOnly refresh_token
// cookie, which is sent automatically and swapped for a fresh access token.
//
// The localStorage read fallback exists only for legacy mock/admin demo flows
// that seed a dummy token; real tokens are never written there.
let accessToken: string | null = null

export const tokenStore = {
  get(): string | null {
    if (accessToken) return accessToken

    // Backwards-compatible fallback for mock demo flows (fake tokens only).
    try {
      return localStorage.getItem('auth_token')
    } catch {
      return null
    }
  },

  set(token: string): void {
    accessToken = token
  },

  clear(): void {
    accessToken = null
  },
}
