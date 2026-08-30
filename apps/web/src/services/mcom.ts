import api from './api'
import { tokenStore } from './tokenStore'
import { mapApiUser, type ApiUserResponse, type User } from '../types'

/* ------------------------------------------------------------------ */
/*  MCOM Solutions SSO helpers (frontend side).                        */
/*                                                                    */
/*  All secrets live server-side — the SPA only triggers the flow and */
/*  completes it. The OAuth `state` is generated + stored by the API  */
/*  in an HttpOnly cookie, so nothing sensitive touches the browser.  */
/* ------------------------------------------------------------------ */

export interface SsoStartResponse {
  authorizeUrl: string
}

/** The user's purchased VCard plan resolved back to a local Plan (see /v1/auth/sso/status). */
export interface ActivePlan {
  id: string
  name: string
  level: string
  audience: string
  status: string
  isDefault: boolean
  trialDays?: number
  monthlyPrice?: number
  quarterlyPrice?: number
  annualPrice?: number
  features?: string[]
  configuration?: { quotas?: Record<string, number | boolean>; featureFlags?: Record<string, boolean> } | null
  stripeMonthlyPriceId?: string
  expiresAt?: string | null
}

export interface SsoStatusResponse {
  permissions?: { can_access_vcard?: boolean } | null
  can_access_vcard: boolean
  membership_level?: string | null
  membership_status?: string | null
  active_plan?: ActivePlan | null
}

export interface SsoCompleteResult {
  user: User
  returnTo?: string
}

export const mcomService = {
  /** Ask the API for the Central authorize URL (state cookie is set server-side), then redirect. */
  async startLogin(card?: string, business?: string, redirect?: string): Promise<void> {
    const params = new URLSearchParams()
    if (card) params.set('card', card)
    if (business) params.set('business', business)
    if (redirect) params.set('redirect', redirect)
    const qs = params.toString()
    const res = await api.get<SsoStartResponse>(`/v1/auth/sso/login${qs ? `?${qs}` : ''}`)
    const authorizeUrl = (res.data as unknown as SsoStartResponse)?.authorizeUrl
    if (!authorizeUrl) throw new Error('MCOM did not return an authorize URL')

    window.location.assign(authorizeUrl)
  },

  /** Complete the OAuth callback: exchange code + validate state against the cookie. */
  async completeLogin(code: string, state: string): Promise<SsoCompleteResult> {
    const res = await api.post('/v1/auth/sso/callback', { code, state })
    const body = res.data as { token: string; user: ApiUserResponse; return_to?: string }
    tokenStore.set(body.token)
    return {
      user: mapApiUser(body.user as ApiUserResponse),
      returnTo: body.return_to,
    }
  },

  /** Refresh the stored MCOM access token and resync permissions from Central. */
  async refreshSession(): Promise<User> {
    const res = await api.post('/v1/auth/sso/refresh')
    const body = res.data as { user: ApiUserResponse }
    return mapApiUser(body.user as ApiUserResponse)
  },

  /** Current access status. `sync=1` forces a fresh profile pull from Central. */
  async getStatus(sync = false): Promise<SsoStatusResponse> {
    const res = await api.get<SsoStatusResponse>(`/v1/auth/sso/status${sync ? '?sync=1' : ''}`)
    return res.data as unknown as SsoStatusResponse
  },

  /** Public, secret-free config (membership upgrade URL for the access-denied CTA). */
  async getConfig(): Promise<{ membershipUrl: string }> {
    const res = await api.get<{ membershipUrl: string }>('/v1/auth/sso/config')
    return res.data as unknown as { membershipUrl: string }
  },

  /** Complete the Direct Dashboard Handshake: exchange a Central-signed JWT for a local session. */
  async completeHandshake(token: string): Promise<{ user: User; role?: string | null }> {
    const res = await api.get(`/v1/auth/sso-login?token=${encodeURIComponent(token)}`)
    const body = res.data as { token: string; user: ApiUserResponse; role?: string | null }
    tokenStore.set(body.token)
    return { user: mapApiUser(body.user as ApiUserResponse), role: body.role }
  },
}