import api from './api'

export type CapabilityMode = 'disabled' | 'limited' | 'unlimited'
export type PlanVariantKey = 'standard' | 'pro' | 'pro_plus'

export interface ResolvedCapability {
  key: string
  mode: CapabilityMode
  enabled: boolean
  limit: number | null
}

export type CapabilitySource = 'plan' | 'access_pass' | 'membership' | 'central' | 'none'

export interface ResolvedCapabilities {
  allowed: boolean
  source: CapabilitySource
  planId: string | null
  planName: string | null
  accessPassId?: string | null
  variant: PlanVariantKey | null
  variantName: string | null
  durationDays: number | null
  startedAt: string | null
  expiresAt: string | null
  features: string[]
  quotas: Record<string, number | boolean>
  featureFlags: Record<string, boolean>
  capabilities: Record<string, ResolvedCapability>
  reason?: string
}

/**
 * Server-resolved capabilities for the signed-in user. This is the client-side
 * mirror of the API's CapabilityGuard: use it to hide/disable UI, while the
 * API remains authoritative for enforcement.
 */
let inFlight: Promise<ResolvedCapabilities> | null = null

export const capabilitiesService = {
  async get(): Promise<ResolvedCapabilities> {
    // Several dashboard components mount together (sidebar, nav, page gate,
    // quota widgets). Share one request instead of firing one per component.
    if (!inFlight) {
      inFlight = api
        .get('/capabilities/me')
        .then((res) => res.data as ResolvedCapabilities)
        .finally(() => { inFlight = null })
    }
    return inFlight
  },

  async check(key: string, used = 0): Promise<{ allowed: boolean; mode: CapabilityMode; limit: number | null; used: number }> {
    const res = await api.get(`/capabilities/check/${encodeURIComponent(key)}`, { params: { used } })
    return res.data
  },
}
