import axios from 'axios'
import type { LoginData, RegisterData, ForgotPasswordData, ResetPasswordData, ProfileData, ChangePasswordData, AuthResponse, User } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || ''
    if (url === '/user') {
      const raw = localStorage.getItem('auth_user')
      if (raw) {
        try { return Promise.resolve({ data: JSON.parse(raw) }) } catch {}
      }
    }
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
    return Promise.reject(err)
  },
)

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const res = await api.post('/login', data)
    return res.data
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await api.post('/register', data)
    return res.data
  },

  async logout(): Promise<void> {
    await api.post('/logout')
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
    return res.data
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
    return res.data
  },

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const res = await api.put('/password', data)
    return res.data
  },

  async updateLanguage(language: string): Promise<User> {
    const res = await api.put('/language', { language })
    return res.data
  },

  async updateTheme(theme_mode: 'light' | 'dark'): Promise<User> {
    const res = await api.put('/theme', { theme_mode })
    return res.data
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
    return res.data
  },

  async stopImpersonating(): Promise<void> {
    await api.post('/admin/impersonate/stop')
  },
}
