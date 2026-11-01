import type { User } from '../types'

const ADMIN_USER_KEY = 'admin_auth_user'
const ADMIN_TOKEN_KEY = 'admin_access_token'

let adminAccessToken: string | null = null

export const adminSession = {
  getToken(): string | null {
    if (adminAccessToken) return adminAccessToken
    try {
      adminAccessToken = sessionStorage.getItem(ADMIN_TOKEN_KEY)
    } catch {
      adminAccessToken = null
    }
    return adminAccessToken
  },
  setToken(token: string): void {
    adminAccessToken = token
    try { sessionStorage.setItem(ADMIN_TOKEN_KEY, token) } catch { /* ignore */ }
  },
  getUser(): User | null {
    try {
      const raw = sessionStorage.getItem(ADMIN_USER_KEY)
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      return null
    }
  },
  setUser(user: User): void {
    try { sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user)) } catch { /* ignore */ }
  },
  hasSession(): boolean {
    return Boolean(this.getUser())
  },
  clear(): void {
    adminAccessToken = null
    try {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY)
      sessionStorage.removeItem(ADMIN_USER_KEY)
    } catch { /* ignore */ }
  },
}
