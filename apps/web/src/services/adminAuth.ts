import axios from 'axios'
import { adminSession } from './adminSession'
import { mapApiUser, type ApiUserResponse, type User } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const adminApi = axios.create({
  baseURL: API_BASE,
  headers: { Accept: 'application/json' },
  withCredentials: true,
  timeout: 15000,
})

adminApi.interceptors.request.use((config) => {
  const token = adminSession.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

interface AdminAuthPayload {
  token: string
  refresh_token: string
  user: ApiUserResponse
  roles?: string[]
}

function toSession(payload: AdminAuthPayload): { user: User; roles: string[] } {
  const user = mapApiUser(payload.user)
  const roles = payload.roles ?? []
  if (!roles.includes('ADMIN')) {
    adminSession.clear()
    throw new Error('This account does not have administrator access')
  }
  adminSession.setToken(payload.token)
  adminSession.setUser(user)
  return { user, roles }
}

adminApi.interceptors.response.use((res) => {
  if (res.data && typeof res.data === 'object' && 'success' in res.data && 'data' in res.data) {
    res.data = res.data.data
  }
  return res
})

type RetriableConfig = Parameters<typeof adminApi.request>[0] & { _adminRetried?: boolean }
let refreshInFlight: Promise<boolean> | null = null
let restoreInFlight: Promise<{ user: User; roles: string[] } | null> | null = null

async function refreshAdminToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = adminApi
      .post<AdminAuthPayload>('/admin/auth/refresh')
      .then((res) => {
        if (!(res.data.roles ?? []).includes('ADMIN')) return false
        adminSession.setToken(res.data.token)
        adminSession.setUser(mapApiUser(res.data.user))
        return true
      })
      .catch(() => false)
      .finally(() => { refreshInFlight = null })
  }
  return refreshInFlight
}

adminApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config as RetriableConfig | undefined
    const url = original?.url ?? ''
    const isAuthEndpoint = url.includes('/admin/auth/')

    if (error?.response?.status === 401 && original && !original._adminRetried && !isAuthEndpoint) {
      original._adminRetried = true
      const refreshed = await refreshAdminToken()
      if (refreshed) {
        const token = adminSession.getToken()
        if (token) original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${token}` }
        return adminApi.request(original)
      }
      adminSession.clear()
      window.dispatchEvent(new CustomEvent('admin-session-expired'))
    }
    return Promise.reject(error)
  },
)

export interface AdminLoginInput {
  email: string
  password: string
}

export const adminAuthService = {
  async login(input: AdminLoginInput): Promise<{ user: User; roles: string[] }> {
    const res = await adminApi.post<AdminAuthPayload>('/admin/auth/login', input)
    return toSession(res.data)
  },

  async restore(): Promise<{ user: User; roles: string[] } | null> {
    if (!adminSession.hasSession()) return null
    if (restoreInFlight) return restoreInFlight

    restoreInFlight = adminApi
      .post<AdminAuthPayload>('/admin/auth/refresh')
      .then((res) => toSession(res.data))
      .catch((error: any) => {
        if (error?.response?.status === 401 || error?.response?.status === 403) adminSession.clear()
        return null
      })
      .finally(() => { restoreInFlight = null })

    return restoreInFlight
  },

  async me(): Promise<{ user: User; roles: string[] }> {
    const res = await adminApi.get<{ user: ApiUserResponse; roles: string[] }>('/admin/auth/me')
    const user = mapApiUser(res.data.user)
    adminSession.setUser(user)
    return { user, roles: res.data.roles ?? [] }
  },

  async logout(): Promise<void> {
    try { await adminApi.post('/admin/auth/logout') } finally { adminSession.clear() }
  },
}

export { adminApi }
