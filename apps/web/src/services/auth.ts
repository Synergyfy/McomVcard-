import axios from 'axios'
import { tokenStore } from './tokenStore'
import { attach401Retry } from './retry401'
import { mapApiUser, type ApiUserResponse } from '../types'
import type { LoginData, RegisterData, ForgotPasswordData, ResetPasswordData, ProfileData, ChangePasswordData, AuthResponse, User } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
  withCredentials: true,
})

// Attach access token from memory to every outgoing request.
api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401 (token expired) — swap HttpOnly cookie for fresh JWT.
attach401Retry(api)

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const res = await api.post('/login', data)
    const body = res.data.data
    tokenStore.set(body.token)
    return {
      token: body.token,
      refresh_token: body.refresh_token,
      user: mapApiUser(body.user as ApiUserResponse),
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await api.post('/register', data)
    const body = res.data.data
    tokenStore.set(body.token)
    return {
      token: body.token,
      refresh_token: body.refresh_token,
      user: mapApiUser(body.user as ApiUserResponse),
    }
  },

  async logout(): Promise<{ message: string }> {
    const res = await api.post('/logout')
    tokenStore.clear()
    return res.data
  },

  async refresh(): Promise<AuthResponse> {
    const res = await api.post('/refresh')
    const body = res.data.data
    tokenStore.set(body.token)
    return {
      token: body.token,
      refresh_token: body.refresh_token,
      user: mapApiUser(body.user as ApiUserResponse),
    }
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
    const res = await api.get('/users/me')
    return mapApiUser(res.data.data as ApiUserResponse)
  },

  async updateProfile(data: ProfileData): Promise<User> {
    const res = await api.patch('/users/me', data)
    return mapApiUser(res.data.data as ApiUserResponse)
  },

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const res = await api.put('/password', data)
    return res.data
  },

  async updateSettings(
    settings: { language?: string; theme_mode?: 'light' | 'dark' },
    currentUser: User
  ): Promise<User> {
    const res = await api.patch('/users/me/settings', settings)
    const data = res.data.data as { language?: string; theme_mode?: string }
    return {
      ...currentUser,
      language: data.language ?? currentUser.language,
      theme_mode: (data.theme_mode === 'light' || data.theme_mode === 'dark')
        ? data.theme_mode
        : currentUser.theme_mode,
    }
  },

  async updateLanguage(language: string, currentUser: User): Promise<User> {
    return authService.updateSettings({ language }, currentUser)
  },

  async updateTheme(theme_mode: 'light' | 'dark', currentUser: User): Promise<User> {
    return authService.updateSettings({ theme_mode }, currentUser)
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

  async impersonate(userId: string): Promise<AuthResponse> {
    const res = await api.post(`/admin/impersonate/${userId}`)
    const body = res.data.data
    tokenStore.set(body.token)
    return {
      token: body.token,
      refresh_token: body.refresh_token,
      user: mapApiUser(body.user as ApiUserResponse),
    }
  },

  async stopImpersonating(): Promise<void> {
    await api.post('/admin/impersonate/stop')
  },
}
