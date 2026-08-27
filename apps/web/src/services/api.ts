import axios from 'axios'
import { tokenStore } from './tokenStore'
import { attach401Retry } from './retry401'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401 — swap HttpOnly cookie for fresh JWT, retry once.
attach401Retry(api)

/**
 * Unwrap the standard API envelope { success, data, message }.
 * After this interceptor, `res.data` is the inner `data` payload directly.
 */
api.interceptors.response.use((res) => {
  if (res.data && typeof res.data === 'object' && 'success' in res.data) {
    res.data = res.data.data
  }
  return res
})

export default api
