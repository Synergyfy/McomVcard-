import { adminApi as api } from './adminAuth'

export type PlanVariantKey = 'standard' | 'pro' | 'pro_plus'
export type PlanAudience = 'business' | 'consumer'
export type RuleScope = 'All' | 'Admin setup' | 'Business usage' | 'Consumer usage' | 'Public page'

export interface PlanFeature {
  text: string
  description: string
  scope: RuleScope
}

export interface PlanRule {
  label: string
  values: Record<string, string>
  description: string
  scope: RuleScope
}

export interface PlanConfiguration {
  quotas?: Record<string, number | boolean>
  featureFlags?: Record<string, boolean>
}

export interface PlanVariant {
  key: PlanVariantKey
  name: string
  durationDays: number
  price: number
  description: string
  features: PlanFeature[] | null
  rules: PlanRule[] | null
  configuration: PlanConfiguration | null
  stripePriceId: string | null
  paypalPlanId: string | null
  isActive: boolean
}

export interface Plan {
  id: string
  name: string
  description: string
  audience: PlanAudience
  level: string | null
  popular: boolean
  sortOrder: number
  features: PlanFeature[]
  rules: PlanRule[]
  configuration: PlanConfiguration | null
  currency: string
  status: string
  type: string
  seasonId: string | null
  isDefault: boolean
  variants: PlanVariant[]
  createdAt: string
  updatedAt: string
}

export interface PlanVariantPayload {
  key: PlanVariantKey
  price: number
  description?: string
  features?: PlanFeature[]
  rules?: PlanRule[]
  configuration?: PlanConfiguration
  stripePriceId?: string
  paypalPlanId?: string
  isActive?: boolean
}

export interface PlanPayload {
  name: string
  description?: string
  audience: PlanAudience
  level?: string
  popular?: boolean
  sortOrder?: number
  features?: PlanFeature[]
  rules?: PlanRule[]
  configuration?: PlanConfiguration
  variants: PlanVariantPayload[]
  currency?: string
  status?: string
  type?: string
  seasonId?: string
  isDefault?: boolean
}

export const plansService = {
  async list(audience?: PlanAudience): Promise<Plan[]> {
    const res = await api.get('/admin/plans', { params: audience ? { audience } : undefined })
    return res.data as Plan[]
  },

  async get(id: string): Promise<Plan> {
    const res = await api.get(`/admin/plans/${id}`)
    return res.data as Plan
  },

  async create(payload: PlanPayload): Promise<Plan> {
    const res = await api.post('/admin/plans', payload)
    return res.data as Plan
  },

  async update(id: string, payload: Partial<PlanPayload> & { status?: string }): Promise<Plan> {
    const res = await api.patch(`/admin/plans/${id}`, payload)
    return res.data as Plan
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/admin/plans/${id}`)
  },
}
