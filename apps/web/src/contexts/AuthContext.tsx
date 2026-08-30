import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authService } from '../services/auth'
import { mcomService, type SsoCompleteResult } from '../services/mcom'
import { tokenStore } from '../services/tokenStore'
import type { User, LoginData, RegisterData } from '../types'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isImpersonating: boolean
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
  impersonate: (userId: string) => Promise<void>
  stopImpersonating: () => Promise<void>
  loginWithMcom: (options?: { card?: string; business?: string; redirect?: string }) => Promise<void>
  completeMcomCallback: (code: string, state: string) => Promise<SsoCompleteResult>
  completeMcomHandshake: (token: string) => Promise<{ user: User; role?: string | null }>
  refreshMcomStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('auth_user')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Map backend first_name/last_name to single name field if needed
    if (!parsed.name && (parsed.first_name || parsed.last_name)) {
      parsed.name = [parsed.first_name, parsed.last_name].filter(Boolean).join(' ') || parsed.email
    }
    return parsed
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser)
  const [isLoading, setIsLoading] = useState(true)
  const [isImpersonating, setIsImpersonating] = useState(false)

  const isAuthenticated = !!user

  const setStoredUser = useCallback((u: User | null) => {
    // Map backend first_name/last_name to single name field if needed
    if (u && !u.name && ((u as any).first_name || (u as any).last_name)) {
      u.name = [(u as any).first_name, (u as any).last_name].filter(Boolean).join(' ') || u.email
    }
    setUser(u)
    if (u) {
      localStorage.setItem('auth_user', JSON.stringify(u))
    } else {
      localStorage.removeItem('auth_user')
    }
  }, [])

  useEffect(() => {
    // The access token lives only in memory, so on a fresh page load we
    // exchange the HttpOnly refresh cookie for a new access token, then load
    // the profile. No refresh cookie = not authenticated.
    authService
      .refresh()
      .then((res) => setStoredUser(res.user))
      .catch(() => {
        tokenStore.clear()
        setStoredUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [setStoredUser])

  const login = useCallback(
    async (data: LoginData) => {
      const res = await authService.login(data)
      setStoredUser(res.user)
    },
    [setStoredUser],
  )

  const register = useCallback(
    async (data: RegisterData) => {
      const res = await authService.register(data)
      setStoredUser(res.user)
    },
    [setStoredUser],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // continue logging out locally
    }
    tokenStore.clear()
    setStoredUser(null)
  }, [setStoredUser])

  const updateUser = useCallback(
    (u: User) => {
      setStoredUser(u)
    },
    [setStoredUser],
  )

  const impersonate = useCallback(
    async (userId: string) => {
      const res = await authService.impersonate(userId)
      setStoredUser(res.user)
      setIsImpersonating(true)
    },
    [setStoredUser],
  )

  const stopImpersonating = useCallback(async () => {
    try {
      await authService.stopImpersonating()
    } catch {
      // continue
    }
    const res = await authService.getUser()
    setStoredUser(res)
    setIsImpersonating(false)
  }, [setStoredUser])

  const loginWithMcom = useCallback(
    async (options?: { card?: string; business?: string; redirect?: string }) => {
      // The API generates + stores the OAuth `state` in an HttpOnly cookie and
      // returns the Central authorize URL; the browser is redirected there.
      await mcomService.startLogin(options?.card, options?.business, options?.redirect)
    },
    [],
  )

  const completeMcomCallback = useCallback(
    async (code: string, state: string) => {
      const result = await mcomService.completeLogin(code, state)
      setStoredUser(result.user)
      return result
    },
    [setStoredUser],
  )

  const completeMcomHandshake = useCallback(
    async (token: string) => {
      const result = await mcomService.completeHandshake(token)
      setStoredUser(result.user)
      return result
    },
    [setStoredUser],
  )

  const refreshMcomStatus = useCallback(async () => {
    const user = await mcomService.refreshSession()
    setStoredUser(user)
  }, [setStoredUser])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isImpersonating,
        login,
        register,
        logout,
        updateUser,
        impersonate,
        stopImpersonating,
        loginWithMcom,
        completeMcomCallback,
        completeMcomHandshake,
        refreshMcomStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}