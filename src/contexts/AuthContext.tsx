import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authService } from '../services/auth'
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
  impersonate: (userId: number) => Promise<void>
  stopImpersonating: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('auth_user')
    return raw ? JSON.parse(raw) : null
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
    setUser(u)
    if (u) {
      localStorage.setItem('auth_user', JSON.stringify(u))
    } else {
      localStorage.removeItem('auth_user')
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setIsLoading(false)
      return
    }
    authService
      .getUser()
      .then((u) => setStoredUser(u))
      .catch(() => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      })
      .finally(() => setIsLoading(false))
  }, [setStoredUser])

  const login = useCallback(
    async (data: LoginData) => {
      const res = await authService.login(data)
      localStorage.setItem('auth_token', res.token)
      setStoredUser(res.user)
    },
    [setStoredUser],
  )

  const register = useCallback(
    async (data: RegisterData) => {
      const res = await authService.register(data)
      localStorage.setItem('auth_token', res.token)
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
    localStorage.removeItem('auth_token')
    setStoredUser(null)
  }, [setStoredUser])

  const updateUser = useCallback(
    (u: User) => {
      setStoredUser(u)
    },
    [setStoredUser],
  )

  const impersonate = useCallback(
    async (userId: number) => {
      const res = await authService.impersonate(userId)
      localStorage.setItem('auth_token', res.token)
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
