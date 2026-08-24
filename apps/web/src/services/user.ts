import axios from 'axios'
import { tokenStore } from './tokenStore'
import { attach401Retry } from './retry401'
import type { VCard, SocialLink, Service, Gallery, VCardTestimonial, BlogPost, AppointmentSlot, Appointment, VCardSEO, VCardCustomization, UserDashboardStats, AnalyticsData, Subscription } from '../types'

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
    const res = await api.get('/user/dashboard')
    return res.data
  },

  // vCards
  async getVcards(): Promise<VCard[]> {
    const res = await api.get('/user/vcards')
    return res.data
  },

  async getVcard(id: number): Promise<VCard> {
    const res = await api.get(`/user/vcards/${id}`)
    return res.data
  },

  async createVcard(data: FormData | Partial<VCard>): Promise<VCard> {
    if (data instanceof FormData) {
      const res = await api.post('/user/vcards', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      return res.data
    }
    const res = await api.post('/user/vcards', data)
    return res.data
  },

  async updateVcard(id: number, data: FormData | Partial<VCard>): Promise<VCard> {
    if (data instanceof FormData) {
      data.append('_method', 'PUT')
      const res = await api.post(`/user/vcards/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      return res.data
    }
    const res = await api.put(`/user/vcards/${id}`, data)
    return res.data
  },

  async deleteVcard(id: number): Promise<void> {
    await api.delete(`/user/vcards/${id}`)
  },

  // Templates
  async getTemplates(): Promise<{ id: number; name: string; path: string; template_url: string }[]> {
    const res = await api.get('/user/templates')
    return res.data
  },

  // Social Links
  async getSocialLinks(vcardId: number): Promise<SocialLink> {
    const res = await api.get(`/user/vcards/${vcardId}/social-links`)
    return res.data
  },

  async updateSocialLinks(vcardId: number, data: Partial<SocialLink>): Promise<SocialLink> {
    const res = await api.put(`/user/vcards/${vcardId}/social-links`, data)
    return res.data
  },

  // Services
  async getServices(vcardId: number): Promise<Service[]> {
    const res = await api.get(`/user/vcards/${vcardId}/services`)
    return res.data
  },

  async createService(vcardId: number, data: FormData | Partial<Service>): Promise<Service> {
    if (data instanceof FormData) {
      const res = await api.post(`/user/vcards/${vcardId}/services`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      return res.data
    }
    const res = await api.post(`/user/vcards/${vcardId}/services`, data)
    return res.data
  },

  async updateService(vcardId: number, serviceId: number, data: FormData | Partial<Service>): Promise<Service> {
    if (data instanceof FormData) {
      data.append('_method', 'PUT')
      const res = await api.post(`/user/vcards/${vcardId}/services/${serviceId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      return res.data
    }
    const res = await api.put(`/user/vcards/${vcardId}/services/${serviceId}`, data)
    return res.data
  },

  async deleteService(vcardId: number, serviceId: number): Promise<void> {
    await api.delete(`/user/vcards/${vcardId}/services/${serviceId}`)
  },

  // Gallery
  async getGallery(vcardId: number): Promise<Gallery[]> {
    const res = await api.get(`/user/vcards/${vcardId}/gallery`)
    return res.data
  },

  async createGalleryImage(vcardId: number, data: FormData): Promise<Gallery> {
    const res = await api.post(`/user/vcards/${vcardId}/gallery`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
    return res.data
  },

  async deleteGalleryImage(vcardId: number, imageId: number): Promise<void> {
    await api.delete(`/user/vcards/${vcardId}/gallery/${imageId}`)
  },

  // Testimonials
  async getTestimonials(vcardId: number): Promise<VCardTestimonial[]> {
    const res = await api.get(`/user/vcards/${vcardId}/testimonials`)
    return res.data
  },

  async createTestimonial(vcardId: number, data: FormData | Partial<VCardTestimonial>): Promise<VCardTestimonial> {
    if (data instanceof FormData) {
      const res = await api.post(`/user/vcards/${vcardId}/testimonials`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      return res.data
    }
    const res = await api.post(`/user/vcards/${vcardId}/testimonials`, data)
    return res.data
  },

  async updateTestimonial(vcardId: number, testimonialId: number, data: FormData | Partial<VCardTestimonial>): Promise<VCardTestimonial> {
    if (data instanceof FormData) {
      data.append('_method', 'PUT')
      const res = await api.post(`/user/vcards/${vcardId}/testimonials/${testimonialId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      return res.data
    }
    const res = await api.put(`/user/vcards/${vcardId}/testimonials/${testimonialId}`, data)
    return res.data
  },

  async deleteTestimonial(vcardId: number, testimonialId: number): Promise<void> {
    await api.delete(`/user/vcards/${vcardId}/testimonials/${testimonialId}`)
  },

  // Blog
  async getBlogPosts(vcardId: number): Promise<BlogPost[]> {
    const res = await api.get(`/user/vcards/${vcardId}/blog`)
    return res.data
  },

  async createBlogPost(vcardId: number, data: FormData | Partial<BlogPost>): Promise<BlogPost> {
    if (data instanceof FormData) {
      const res = await api.post(`/user/vcards/${vcardId}/blog`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      return res.data
    }
    const res = await api.post(`/user/vcards/${vcardId}/blog`, data)
    return res.data
  },

  async updateBlogPost(vcardId: number, postId: number, data: FormData | Partial<BlogPost>): Promise<BlogPost> {
    if (data instanceof FormData) {
      data.append('_method', 'PUT')
      const res = await api.post(`/user/vcards/${vcardId}/blog/${postId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      return res.data
    }
    const res = await api.put(`/user/vcards/${vcardId}/blog/${postId}`, data)
    return res.data
  },

  async deleteBlogPost(vcardId: number, postId: number): Promise<void> {
    await api.delete(`/user/vcards/${vcardId}/blog/${postId}`)
  },

  // Appointments
  async getAppointmentSlots(vcardId: number): Promise<AppointmentSlot[]> {
    const res = await api.get(`/user/vcards/${vcardId}/appointment-slots`)
    return res.data
  },

  async updateAppointmentSlots(vcardId: number, slots: Partial<AppointmentSlot>[]): Promise<AppointmentSlot[]> {
    const res = await api.put(`/user/vcards/${vcardId}/appointment-slots`, { slots })
    return res.data
  },

  async getAppointments(vcardId?: number): Promise<Appointment[]> {
    const params = vcardId ? { vcard_id: vcardId } : {}
    const res = await api.get('/user/appointments', { params })
    return res.data
  },

  async updateAppointmentStatus(id: number, status: Appointment['status']): Promise<Appointment> {
    const res = await api.put(`/user/appointments/${id}`, { status })
    return res.data
  },

  // Password
  async updatePassword(vcardId: number, password: string): Promise<void> {
    await api.put(`/user/vcards/${vcardId}/password`, { password })
  },

  async removePassword(vcardId: number): Promise<void> {
    await api.delete(`/user/vcards/${vcardId}/password`)
  },

  // SEO
  async getSEO(vcardId: number): Promise<VCardSEO> {
    const res = await api.get(`/user/vcards/${vcardId}/seo`)
    return res.data
  },

  async updateSEO(vcardId: number, data: Partial<VCardSEO>): Promise<VCardSEO> {
    const res = await api.put(`/user/vcards/${vcardId}/seo`, data)
    return res.data
  },

  // Customization
  async getCustomization(vcardId: number): Promise<VCardCustomization> {
    const res = await api.get(`/user/vcards/${vcardId}/customization`)
    return res.data
  },

  async updateCustomization(vcardId: number, data: Partial<VCardCustomization>): Promise<VCardCustomization> {
    const res = await api.put(`/user/vcards/${vcardId}/customization`, data)
    return res.data
  },

  // Analytics
  async getAnalytics(vcardId: number): Promise<AnalyticsData> {
    const res = await api.get(`/user/vcards/${vcardId}/analytics`)
    return res.data
  },

  // Subscriptions
  async getSubscriptions(): Promise<Subscription[]> {
    const res = await api.get('/user/subscriptions')
    return res.data
  },

  async getCurrentSubscription(): Promise<Subscription | null> {
    const res = await api.get('/user/subscriptions/current')
    return res.data
  },
}
