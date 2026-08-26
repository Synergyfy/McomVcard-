import axios from 'axios'
import { tokenStore } from './tokenStore'
import type { LoginData, RegisterData, ForgotPasswordData, ResetPasswordData, ProfileData, ChangePasswordData, AuthResponse, User } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
  withCredentials: true,
})

// The access token is kept in memory only (never localStorage). The refresh
// token lives in an HttpOnly cookie sent automatically with each request.
api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config

    // One silent refresh-and-retry on 401 (access token expired), guarded so we
    // never loop on the refresh call itself or replay a failed login.
    const isAuthEndpoint = ['/login', '/register', '/refresh'].some((p) => (original?.url || '').startsWith(p))
    const alreadyRetried = original?._retried === true

    if (err.response?.status === 401 && !isAuthEndpoint && !alreadyRetried) {
      original._retried = true

      try {
        const res = await api.post('/refresh')
        tokenStore.set(res.data.data.token)
        original.headers.Authorization = `Bearer ${res.data.data.token}`
        return api(original)
      } catch {
        tokenStore.clear()
        return Promise.reject(err)
      }
    }

    return Promise.reject(err)
  },
)

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const res = await api.post('/login', data)
    tokenStore.set(res.data.data.token)
    return res.data.data
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await api.post('/register', data)
    tokenStore.set(res.data.data.token)
    return res.data.data
  },

  async logout(): Promise<{ message: string }> {
    const res = await api.post('/logout')
    tokenStore.clear()
    return res.data
  },

  async refresh(): Promise<AuthResponse> {
    const res = await api.post('/refresh')
    tokenStore.set(res.data.data.token)
    return res.data.data
  },

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    const res = await api.post('/forgot-password', data)
    return res.data
  },

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const res = await api.post('/reset-password', data)
    return res.data
  },

  async getUser(): Promise<User> {
    const res = await api.get('/user')
    return res.data.data
  },

  async updateProfile(data: ProfileData): Promise<User> {
    const fd = new FormData()
    if (data.name) fd.append('name', data.name)
    if (data.email) fd.append('email', data.email)
    if (data.contact) fd.append('contact', data.contact)
    if (data.profile_image) fd.append('profile_image', data.profile_image)
    if (data.remove_image) fd.append('remove_image', '1')
    fd.append('_method', 'PUT')
    const res = await api.post('/profile', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const res = await api.put('/password', data)
    return res.data
  },

  async updateLanguage(language: string): Promise<User> {
    const res = await api.put('/language', { language })
    return res.data.data
  },

  async updateTheme(theme_mode: 'light' | 'dark'): Promise<User> {
    const res = await api.put('/theme', { theme_mode })
    return res.data.data
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const res = await api.get(`/email/verify/${token}`)
    return res.data
  },

  async resendVerification(): Promise<{ message: string }> {
    const res = await api.post('/email/resend')
    return res.data
  },

  async sendVerificationToken(): Promise<{ message: string }> {
    const res = await api.post('/email/send-token')
    return res.data
  },

  async verifyWithToken(token: string): Promise<{ message: string }> {
    const res = await api.post('/email/verify-token', { token })
    return res.data
  },

  async impersonate(userId: number): Promise<AuthResponse> {
    const res = await api.post(`/admin/impersonate/${userId}`)
    tokenStore.set(res.data.data.token)
    return res.data.data
  },

  async stopImpersonating(): Promise<void> {
    await api.post('/admin/impersonate/stop')
  },
}
