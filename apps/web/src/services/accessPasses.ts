import { adminApi as api } from './adminAuth'
import type { PlanConfiguration, PlanFeature } from './plans'

export interface AccessPass {
  id: string
  name: string
  description: string
  price: number
  durationDays: number
  currency: string
  status: string
  features: PlanFeature[]
  configuration: PlanConfiguration | null
  stripePriceId: string | null
  paypalPlanId: string | null
  popular: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface AccessPassPayload {
  name: string
  description?: string
  price: number
  durationDays: number
  currency?: string
  status?: string
  features?: PlanFeature[]
  configuration?: PlanConfiguration
  stripePriceId?: string
  paypalPlanId?: string
  popular?: boolean
  sortOrder?: number
}

export const accessPassesService = {
  async list(status?: string): Promise<AccessPass[]> {
    const res = await api.get('/admin/access-passes', { params: status ? { status } : undefined })
    return res.data as AccessPass[]
  },

  async get(id: string): Promise<AccessPass> {
    const res = await api.get(`/admin/access-passes/${id}`)
    return res.data as AccessPass
  },

  async create(payload: AccessPassPayload): Promise<AccessPass> {
    const res = await api.post('/admin/access-passes', payload)
    return res.data as AccessPass
  },

  async update(id: string, payload: Partial<AccessPassPayload>): Promise<AccessPass> {
    const res = await api.patch(`/admin/access-passes/${id}`, payload)
    return res.data as AccessPass
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/admin/access-passes/${id}`)
  },
}
