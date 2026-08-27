import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { tokenStore } from './tokenStore'

/**
 * Attach a 401 auto-refresh interceptor to an axios instance.
 *
 * When a request returns 401 (access token expired), this interceptor:
 * 1. Calls POST /api/refresh to交换 the HttpOnly refresh cookie for a new JWT
 * 2. Stores the new access token in memory (tokenStore)
 * 3. Retries the original request once with the fresh token
 *
 * Guards against looping on the /refresh call itself or replaying failed logins.
 */
export function attach401Retry(api: AxiosInstance): void {
  api.interceptors.response.use(
    (res) => res,
    async (err) => {
      const original = err.config as InternalAxiosRequestConfig & { _retried?: boolean }

      const url = original?.url || ''
      const isAuthEndpoint = ['/login', '/register', '/refresh', '/logout'].some((p) => url.startsWith(p))
      const alreadyRetried = original?._retried === true

      if (err.response?.status === 401 && !isAuthEndpoint && !alreadyRetried) {
        original._retried = true

        try {
          const res = await api.post('/refresh')
          const newToken = res.data?.data?.token
          if (newToken) {
            tokenStore.set(newToken)
            original.headers.Authorization = `Bearer ${newToken}`
            return api(original)
          }
        } catch {
          // Refresh failed — token is dead, clear everything
        }

        tokenStore.clear()
      }

      return Promise.reject(err)
    },
  )
}
