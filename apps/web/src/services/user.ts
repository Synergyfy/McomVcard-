import axios from 'axios'
import { tokenStore } from './tokenStore'
import { attach401Retry } from './retry401'
import type { VCard, SocialLink, Service, Gallery, VCardTestimonial, BlogPost, AppointmentSlot, Appointment, VCardSEO, VCardCustomization, UserDashboardStats, AnalyticsData, Membership, Template } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

attach401Retry(api)

export const userService = {
  // Dashboard
  async getDashboardStats(): Promise<UserDashboardStats> {
    const res = await api.get('/dashboard/stats')
    return res.data
  },

  // vCards
  async getVcards(): Promise<VCard[]> {
    const res = await api.get('/users/me/cards')
    return res.data.data ?? res.data
  },

  async getVcard(id: string): Promise<VCard> {
    const res = await api.get(`/cards/${id}`)
    return res.data.data ?? res.data
  },

  async createVcard(data: FormData | Partial<VCard>): Promise<VCard> {
    if (data instanceof FormData) {
      const res = await api.post('/cards', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      return res.data.data ?? res.data
    }
    const res = await api.post('/cards', data)
    return res.data.data ?? res.data
  },

  async updateVcard(id: string, data: FormData | Partial<VCard>): Promise<VCard> {
    if (data instanceof FormData) {
      data.append('_method', 'PUT')
      const res = await api.post(`/cards/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      return res.data.data ?? res.data
    }
    const res = await api.patch(`/cards/${id}`, data)
    return res.data.data ?? res.data
  },

  async deleteVcard(id: string): Promise<void> {
    await api.delete(`/cards/${id}`)
  },

  // Templates (public, auth required)
  async getTemplates(): Promise<Template[]> {
    const res = await api.get('/templates')
    return res.data.data ?? res.data
  },

  // Social Links (card-scoped)
  async getSocialLinks(_cardId: string): Promise<SocialLink[]> {
    const res = await api.get(`/cards/${_cardId}/social-links`)
    return res.data.data ?? res.data
  },

  async createSocialLink(_cardId: string, data: Partial<SocialLink>): Promise<SocialLink> {
    const res = await api.post(`/cards/${_cardId}/social-links`, data)
    return res.data.data ?? res.data
  },

  async updateSocialLink(_cardId: string, linkId: string, data: Partial<SocialLink>): Promise<SocialLink> {
    const res = await api.patch(`/social-links/${linkId}`, data)
    return res.data.data ?? res.data
  },

  async deleteSocialLink(_cardId: string, linkId: string): Promise<void> {
    await api.delete(`/social-links/${linkId}`)
  },

  // Services (business-scoped)
  async getServices(businessId: string): Promise<Service[]> {
    const res = await api.get(`/businesses/${businessId}/services`)
    return res.data.data ?? res.data
  },

  async createService(businessId: string, data: FormData | Partial<Service>): Promise<Service> {
    if (data instanceof FormData) {
      const res = await api.post(`/businesses/${businessId}/services`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      return res.data.data ?? res.data
    }
    const res = await api.post(`/businesses/${businessId}/services`, data)
    return res.data.data ?? res.data
  },

  async updateService(serviceId: string, data: FormData | Partial<Service>): Promise<Service> {
    if (data instanceof FormData) {
      data.append('_method', 'PUT')
      const res = await api.post(`/services/${serviceId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      return res.data.data ?? res.data
    }
    const res = await api.patch(`/services/${serviceId}`, data)
    return res.data.data ?? res.data
  },

  async deleteService(serviceId: string): Promise<void> {
    await api.delete(`/services/${serviceId}`)
  },

  // Products (business-scoped, with gallery)
  async getProducts(businessId: string): Promise<Gallery[]> {
    const res = await api.get(`/businesses/${businessId}/products`)
    return res.data.data ?? res.data
  },

  async createProduct(businessId: string, data: FormData): Promise<Gallery> {
    const res = await api.post(`/businesses/${businessId}/products`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
    return res.data.data ?? res.data
  },

  async deleteProduct(productId: string): Promise<void> {
    await api.delete(`/products/${productId}`)
  },

  // Gallery (product images)
  async getGallery(productId: string): Promise<Gallery[]> {
    const res = await api.get(`/products/${productId}/images`)
    return res.data.data ?? res.data
  },

  async createGalleryImage(productId: string, data: FormData): Promise<Gallery> {
    const res = await api.post(`/products/${productId}/images`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
    return res.data.data ?? res.data
  },

  async deleteGalleryImage(_productId: string, imageId: string): Promise<void> {
    await api.delete(`/product-images/${imageId}`)
  },

  // Reviews (business-scoped)
  async getTestimonials(businessId: string): Promise<VCardTestimonial[]> {
    const res = await api.get(`/reviews/businesses/${businessId}`)
    return res.data.data ?? res.data
  },

  async createTestimonial(_businessId: string, data: FormData | Partial<VCardTestimonial>): Promise<VCardTestimonial> {
    if (data instanceof FormData) {
      const res = await api.post(`/reviews`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      return res.data.data ?? res.data
    }
    const res = await api.post(`/reviews`, data)
    return res.data.data ?? res.data
  },

  async updateTestimonial(reviewId: string, data: FormData | Partial<VCardTestimonial>): Promise<VCardTestimonial> {
    if (data instanceof FormData) {
      data.append('_method', 'PUT')
      const res = await api.post(`/reviews/${reviewId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      return res.data.data ?? res.data
    }
    const res = await api.patch(`/reviews/${reviewId}`, data)
    return res.data.data ?? res.data
  },

  async deleteTestimonial(reviewId: string): Promise<void> {
    await api.delete(`/reviews/${reviewId}`)
  },

  // Blog (not implemented in API yet - placeholder)
  async getBlogPosts(_cardId: string): Promise<BlogPost[]> {
    return []
  },

  async createBlogPost(_cardId: number, _data: FormData | Partial<BlogPost>): Promise<BlogPost> {
    throw new Error('Not implemented')
  },

  async updateBlogPost(_cardId: number, _postId: number, _data: FormData | Partial<BlogPost>): Promise<BlogPost> {
    throw new Error('Not implemented')
  },

  async deleteBlogPost(_cardId: number, _postId: number): Promise<void> {
    throw new Error('Not implemented')
  },

  // Appointments (business-scoped)
  async getAppointmentSlots(businessId: string): Promise<AppointmentSlot[]> {
    const res = await api.get(`/businesses/${businessId}/availability`)
    return res.data.data ?? res.data
  },

  async updateAppointmentSlots(businessId: string, slots: Partial<AppointmentSlot>[]): Promise<AppointmentSlot[]> {
    const res = await api.patch(`/businesses/${businessId}/availability`, slots)
    return res.data.data ?? res.data
  },

  async getAppointments(businessId: string): Promise<Appointment[]> {
    const res = await api.get(`/businesses/${businessId}/appointments`)
    return res.data.data ?? res.data
  },

  async updateAppointmentStatus(appointmentId: string, status: Appointment['status']): Promise<Appointment> {
    const res = await api.patch(`/appointments/${appointmentId}/status`, { status })
    return res.data.data ?? res.data
  },

  // Password protection (card-scoped)
  async updatePassword(cardId: string, password: string): Promise<void> {
    await api.patch(`/card-access/${cardId}`, { password })
  },

  async removePassword(cardId: string): Promise<void> {
    await api.patch(`/card-access/${cardId}`, { password: '' })
  },

  // SEO (not implemented in API yet - placeholder)
  async getSEO(_cardId: string): Promise<VCardSEO> {
    return { id: 0, vcard_id: 0, meta_keyword: '', meta_description: '', site_title: '', home_title: '', google_analytics: '' }
  },

  async updateSEO(_cardId: string, _data: Partial<VCardSEO>): Promise<VCardSEO> {
    throw new Error('Not implemented')
  },

  // Customization (card-scoped)
  async getCustomization(cardId: string): Promise<VCardCustomization> {
    const res = await api.get(`/cards/${cardId}/customization`)
    return res.data.data ?? res.data
  },

  async updateCustomization(cardId: string, data: Partial<VCardCustomization>): Promise<VCardCustomization> {
    const res = await api.patch(`/cards/${cardId}/customization`, data)
    return res.data.data ?? res.data
  },

  // Analytics (card-scoped)
  async getAnalytics(cardId: string): Promise<AnalyticsData> {
    const res = await api.get(`/cards/${cardId}/stats`)
    return res.data.data ?? res.data
  },

  // Subscriptions (memberships)
  async getSubscriptions(): Promise<Membership[]> {
    const res = await api.get('/memberships')
    return res.data.data ?? res.data
  },

  async getCurrentSubscription(): Promise<Membership | null> {
    const res = await api.get('/memberships')
    const memberships = res.data.data ?? res.data
    return memberships.find((m: Membership) => m.status === 'active') ?? null
  },
}