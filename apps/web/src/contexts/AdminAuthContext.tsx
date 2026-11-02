import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { adminAuthService, type AdminLoginInput } from '../services/adminAuth'
import { adminSession } from '../services/adminSession'
import type { User } from '../types'

interface AdminAuthContextValue {
  admin: User | null
  roles: string[]
  isAdminAuthenticated: boolean
  isLoading: boolean
  login: (input: AdminLoginInput) => Promise<User>
  logout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<User | null>(() => adminSession.getUser())
  const [roles, setRoles] = useState<string[]>(() => (adminSession.getUser() ? ['ADMIN'] : []))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    if (!adminSession.hasSession()) {
      setIsLoading(false)
      return
    }

    adminAuthService.restore()
      .then((result) => {
        if (cancelled) return
        if (!result) {
          setAdmin(null)
          setRoles([])
          return
        }
        setAdmin(result.user)
        setRoles(result.roles)
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const handleExpired = () => { setAdmin(null); setRoles([]) }
    window.addEventListener('admin-session-expired', handleExpired)
    return () => window.removeEventListener('admin-session-expired', handleExpired)
  }, [])

  const login = useCallback(async (input: AdminLoginInput) => {
    const result = await adminAuthService.login(input)
    setAdmin(result.user)
    setRoles(result.roles)
    return result.user
  }, [])

  const logout = useCallback(async () => {
    await adminAuthService.logout()
    setAdmin(null)
    setRoles([])
  }, [])

  return (
    <AdminAuthContext.Provider
      value={{ admin, roles, isAdminAuthenticated: Boolean(admin) && roles.includes('ADMIN'), isLoading, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
