import axios from 'axios'
import type {
  AdminStats, User, VCard, Enquiry, Subscriber, Plan, PlanFeature, Template, Currency, Role,
  DashboardMeta, EmailSetting, PaymentSetting, FrontTestimonial, Feature as FrontFeature, AboutUs,
  AdminUser, SubscribedUserPlan, CashPayment, AffiliateUser, AffiliateTransaction,
  WithdrawTransaction, Country, Language, TranslationEntry, CouponCode, FrontCMS,
  EmailTemplate, ActivityLog, NewsletterCampaign, FaqItem, AdminBooking,
} from '../types'
import * as mock from './mockData'

const api = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
  timeout: 5000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      const url = err.config?.url || ''
      if (url.startsWith('/admin/')) {
        return Promise.resolve({ data: getMockForUrl(url) })
      }
    }
    return Promise.reject(err)
  }
)

function getMockForUrl(url: string): any {
  if (url.includes('/admin/admins')) return { data: [], total: 0 }
  if (url.includes('/admin/users')) return { data: mock.mockUsers, total: mock.mockUsers.length }
  if (url.includes('/admin/vcards')) return { data: mock.mockVcards, total: mock.mockVcards.length }
  if (url.includes('/admin/plans') && !url.includes('subscribed') && !url.includes('cash')) return { data: mock.mockPlans, total: mock.mockPlans.length }
  if (url.includes('/admin/subscribed-plans')) return { data: mock.mockSubscribedPlans, total: mock.mockSubscribedPlans.length }
  if (url.includes('/admin/cash-payments')) return { data: mock.mockCashPayments, total: mock.mockCashPayments.length }
  if (url.includes('/admin/affiliate-users')) return { data: mock.mockAffiliateUsers, total: mock.mockAffiliateUsers.length }
  if (url.includes('/admin/affiliate-transactions')) return { data: mock.mockAffiliateTransactions, total: mock.mockAffiliateTransactions.length }
  if (url.includes('/admin/withdraw-transactions')) return { data: mock.mockWithdrawTransactions, total: mock.mockWithdrawTransactions.length }
  if (url.includes('/admin/countries')) return { data: mock.mockCountries, total: mock.mockCountries.length }
  if (url.includes('/admin/languages')) {
    if (url.includes('/translations')) return mock.mockTranslations
    return { data: mock.mockLanguages, total: mock.mockLanguages.length }
  }
  if (url.includes('/admin/coupon-codes')) return { data: mock.mockCouponCodes, total: mock.mockCouponCodes.length }
  if (url.includes('/admin/faqs')) return mock.mockFaqs
  if (url.includes('/admin/front-cms')) return mock.mockFrontCMS
  if (url.includes('/admin/email-templates')) return { data: mock.mockEmailTemplates, total: mock.mockEmailTemplates.length }
  if (url.includes('/admin/templates')) return { data: mock.mockTemplates, total: mock.mockTemplates.length }
  if (url.includes('/admin/activity-logs')) return { data: mock.mockActivityLogs, total: mock.mockActivityLogs.length }
  if (url.includes('/admin/newsletter')) return { data: mock.mockNewsletterCampaigns, total: mock.mockNewsletterCampaigns.length }
  if (url.includes('/admin/enquiries')) return mock.mockEnquiries
  if (url.includes('/admin/subscribers')) return mock.mockSubscribers
  if (url.includes('/admin/currencies')) return mock.mockCurrencies
  if (url.includes('/admin/testimonials')) return mock.mockTestimonials
  if (url.includes('/admin/features')) return mock.mockFrontFeatures
  if (url.includes('/admin/about-us')) return mock.mockAboutUs
  if (url.includes('/admin/settings')) return {}
  if (url.includes('/admin/dashboard')) return {
    total_users: mock.mockUsers.length,
    total_vcards: mock.mockVcards.length,
    total_plans: mock.mockPlans.length,
    total_enquiries: mock.mockEnquiries.length,
    total_subscribers: mock.mockSubscribers.length,
    total_testimonials: mock.mockTestimonials.length,
    recent_users: mock.mockUsers.slice(0, 5),
    recent_vcards: mock.mockVcards.slice(0, 5),
    monthly_users: [],
    monthly_vcards: [],
  }
  if (url.includes('/admin/roles')) return mock.mockUsers
  if (url.includes('/admin/permissions')) return []
  if (url.includes('/admin/permissions')) return []
  if (url.includes('/admin/all-currencies')) return mock.mockCurrencies
  if (url.includes('/admin/bookings')) return { data: mock.mockAdminBookings, total: mock.mockAdminBookings.length }
  return { data: [], total: 0 }
}

export const adminService = {
  // Dashboard
  async getStats(): Promise<AdminStats> {
    const res = await api.get('/admin/dashboard')
    return res.data
  },

  // Users
  async getUsers(params?: Record<string, any>): Promise<{ data: User[]; total: number }> {
    const res = await api.get('/admin/users', { params })
    return res.data
  },

  async getUser(id: number): Promise<User> {
    const res = await api.get(`/admin/users/${id}`)
    return res.data
  },

  async createUser(data: Partial<User> & { password: string; password_confirmation: string }): Promise<User> {
    const res = await api.post('/admin/users', data)
    return res.data
  },

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const res = await api.put(`/admin/users/${id}`, data)
    return res.data
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`)
  },

  async impersonateUser(id: number): Promise<{ token: string }> {
    const res = await api.post(`/admin/users/${id}/impersonate`)
    return res.data
  },

  // vCards
  async getVcards(params?: Record<string, any>): Promise<{ data: VCard[]; total: number }> {
    const res = await api.get('/admin/vcards', { params })
    return res.data
  },

  async deleteVcard(id: number): Promise<void> {
    await api.delete(`/admin/vcards/${id}`)
  },

  // Plans
  async getPlans(params?: Record<string, any>): Promise<{ data: Plan[]; total: number }> {
    const res = await api.get('/admin/plans', { params })
    return res.data
  },

  async getPlan(id: number): Promise<Plan> {
    const res = await api.get(`/admin/plans/${id}`)
    return res.data
  },

  async createPlan(data: Partial<Plan> & { plan_feature?: Partial<PlanFeature> }): Promise<Plan> {
    const res = await api.post('/admin/plans', data)
    return res.data
  },

  async updatePlan(id: number, data: Partial<Plan> & { plan_feature?: Partial<PlanFeature> }): Promise<Plan> {
    const res = await api.put(`/admin/plans/${id}`, data)
    return res.data
  },

  async deletePlan(id: number): Promise<void> {
    await api.delete(`/admin/plans/${id}`)
  },

  // Templates
  async getTemplates(params?: Record<string, any>): Promise<{ data: Template[]; total: number }> {
    const res = await api.get('/admin/templates', { params })
    return res.data
  },

  async createTemplate(data: Partial<Template>): Promise<Template> {
    const res = await api.post('/admin/templates', data)
    return res.data
  },

  async updateTemplate(id: number, data: Partial<Template>): Promise<Template> {
    const res = await api.put(`/admin/templates/${id}`, data)
    return res.data
  },

  async deleteTemplate(id: number): Promise<void> {
    await api.delete(`/admin/templates/${id}`)
  },

  // Currencies
  async getCurrencies(): Promise<Currency[]> {
    const res = await api.get('/admin/currencies')
    return res.data
  },

  async createCurrency(data: Partial<Currency>): Promise<Currency> {
    const res = await api.post('/admin/currencies', data)
    return res.data
  },

  async updateCurrency(id: number, data: Partial<Currency>): Promise<Currency> {
    const res = await api.put(`/admin/currencies/${id}`, data)
    return res.data
  },

  async deleteCurrency(id: number): Promise<void> {
    await api.delete(`/admin/currencies/${id}`)
  },

  // Roles
  async getRoles(): Promise<Role[]> {
    const res = await api.get('/admin/roles')
    return res.data
  },

  async getRole(id: number): Promise<Role> {
    const res = await api.get(`/admin/roles/${id}`)
    return res.data
  },

  async createRole(data: Partial<Role> & { permissions?: string[] }): Promise<Role> {
    const res = await api.post('/admin/roles', data)
    return res.data
  },

  async updateRole(id: number, data: Partial<Role> & { permissions?: string[] }): Promise<Role> {
    const res = await api.put(`/admin/roles/${id}`, data)
    return res.data
  },

  async deleteRole(id: number): Promise<void> {
    await api.delete(`/admin/roles/${id}`)
  },

  async getPermissions(): Promise<Permission[]> {
    const res = await api.get('/admin/permissions')
    return res.data
  },

  // Testimonials
  async getTestimonials(): Promise<FrontTestimonial[]> {
    const res = await api.get('/admin/testimonials')
    return res.data
  },

  async createTestimonial(data: Partial<FrontTestimonial>): Promise<FrontTestimonial> {
    const res = await api.post('/admin/testimonials', data)
    return res.data
  },

  async updateTestimonial(id: number, data: Partial<FrontTestimonial>): Promise<FrontTestimonial> {
    const res = await api.put(`/admin/testimonials/${id}`, data)
    return res.data
  },

  async deleteTestimonial(id: number): Promise<void> {
    await api.delete(`/admin/testimonials/${id}`)
  },

  // Front Features
  async getFrontFeatures(): Promise<FrontFeature[]> {
    const res = await api.get('/admin/features')
    return res.data
  },

  async createFrontFeature(data: Partial<FrontFeature>): Promise<FrontFeature> {
    const res = await api.post('/admin/features', data)
    return res.data
  },

  async updateFrontFeature(id: number, data: Partial<FrontFeature>): Promise<FrontFeature> {
    const res = await api.put(`/admin/features/${id}`, data)
    return res.data
  },

  async deleteFrontFeature(id: number): Promise<void> {
    await api.delete(`/admin/features/${id}`)
  },

  // About Us
  async getAboutUs(): Promise<AboutUs[]> {
    const res = await api.get('/admin/about-us')
    return res.data
  },

  async updateAboutUs(id: number, data: Partial<AboutUs>): Promise<AboutUs> {
    const res = await api.put(`/admin/about-us/${id}`, data)
    return res.data
  },

  // Enquiries
  async getEnquiries(): Promise<Enquiry[]> {
    const res = await api.get('/admin/enquiries')
    return res.data
  },

  async getEnquiry(id: number): Promise<Enquiry> {
    const res = await api.get(`/admin/enquiries/${id}`)
    return res.data
  },

  async deleteEnquiry(id: number): Promise<void> {
    await api.delete(`/admin/enquiries/${id}`)
  },

  // Subscribers
  async getSubscribers(): Promise<Subscriber[]> {
    const res = await api.get('/admin/subscribers')
    return res.data
  },

  async deleteSubscriber(id: number): Promise<void> {
    await api.delete(`/admin/subscribers/${id}`)
  },

  // Settings
  async getGeneralSettings(): Promise<DashboardMeta> {
    const res = await api.get('/admin/settings/general')
    return res.data
  },

  async updateGeneralSettings(data: Partial<DashboardMeta>): Promise<void> {
    await api.put('/admin/settings/general', data)
  },

  async getEmailSettings(): Promise<EmailSetting> {
    const res = await api.get('/admin/settings/email')
    return res.data
  },

  async updateEmailSettings(data: Partial<EmailSetting>): Promise<void> {
    await api.put('/admin/settings/email', data)
  },

  async getPaymentSettings(): Promise<PaymentSetting> {
    const res = await api.get('/admin/settings/payment')
    return res.data
  },

  async updatePaymentSettings(data: Partial<PaymentSetting>): Promise<void> {
    await api.put('/admin/settings/payment', data)
  },

  // Currencies (for dropdowns)
  async getAllCurrencies(): Promise<Currency[]> {
    const res = await api.get('/admin/all-currencies')
    return res.data
  },

  // New modules
  // Admins
  async getAdmins(params?: Record<string, any>): Promise<{ data: AdminUser[]; total: number }> {
    const res = await api.get('/admin/admins', { params })
    return res.data
  },
  async getAdmin(id: number): Promise<AdminUser> {
    const res = await api.get(`/admin/admins/${id}`)
    return res.data
  },
  async createAdmin(data: Partial<AdminUser> & { password: string; password_confirmation: string }): Promise<AdminUser> {
    const res = await api.post('/admin/admins', data)
    return res.data
  },
  async updateAdmin(id: number, data: Partial<AdminUser>): Promise<AdminUser> {
    const res = await api.put(`/admin/admins/${id}`, data)
    return res.data
  },
  async deleteAdmin(id: number): Promise<void> {
    await api.delete(`/admin/admins/${id}`)
  },
  // Subscribed User Plans
  async getSubscribedUserPlans(params?: Record<string, any>): Promise<{ data: SubscribedUserPlan[]; total: number }> {
    const res = await api.get('/admin/subscribed-plans', { params })
    return res.data
  },
  async updateSubscribedUserPlan(id: number, data: Partial<SubscribedUserPlan>): Promise<SubscribedUserPlan> {
    const res = await api.put(`/admin/subscribed-plans/${id}`, data)
    return res.data
  },
  // Cash Payments
  async getCashPayments(params?: Record<string, any>): Promise<{ data: CashPayment[]; total: number }> {
    const res = await api.get('/admin/cash-payments', { params })
    return res.data
  },
  async updateCashPayment(id: number, data: Partial<CashPayment>): Promise<CashPayment> {
    const res = await api.put(`/admin/cash-payments/${id}`, data)
    return res.data
  },
  // Affiliate Users
  async getAffiliateUsers(params?: Record<string, any>): Promise<{ data: AffiliateUser[]; total: number }> {
    const res = await api.get('/admin/affiliate-users', { params })
    return res.data
  },
  // Affiliation Transactions
  async getAffiliateTransactions(params?: Record<string, any>): Promise<{ data: AffiliateTransaction[]; total: number }> {
    const res = await api.get('/admin/affiliate-transactions', { params })
    return res.data
  },
  async updateAffiliateTransaction(id: number, data: Partial<AffiliateTransaction>): Promise<AffiliateTransaction> {
    const res = await api.put(`/admin/affiliate-transactions/${id}`, data)
    return res.data
  },
  // Withdraw Transactions
  async getWithdrawTransactions(params?: Record<string, any>): Promise<{ data: WithdrawTransaction[]; total: number }> {
    const res = await api.get('/admin/withdraw-transactions', { params })
    return res.data
  },
  async updateWithdrawTransaction(id: number, data: Partial<WithdrawTransaction>): Promise<WithdrawTransaction> {
    const res = await api.put(`/admin/withdraw-transactions/${id}`, data)
    return res.data
  },
  // Countries
  async getCountries(params?: Record<string, any>): Promise<{ data: Country[]; total: number }> {
    const res = await api.get('/admin/countries', { params })
    return res.data
  },
  async getCountry(id: number): Promise<Country> {
    const res = await api.get(`/admin/countries/${id}`)
    return res.data
  },
  async createCountry(data: Partial<Country>): Promise<Country> {
    const res = await api.post('/admin/countries', data)
    return res.data
  },
  async updateCountry(id: number, data: Partial<Country>): Promise<Country> {
    const res = await api.put(`/admin/countries/${id}`, data)
    return res.data
  },
  async deleteCountry(id: number): Promise<void> {
    await api.delete(`/admin/countries/${id}`)
  },
  // Languages
  async getLanguages(params?: Record<string, any>): Promise<{ data: Language[]; total: number }> {
    const res = await api.get('/admin/languages', { params })
    return res.data
  },
  async getLanguage(id: number): Promise<Language> {
    const res = await api.get(`/admin/languages/${id}`)
    return res.data
  },
  async createLanguage(data: Partial<Language>): Promise<Language> {
    const res = await api.post('/admin/languages', data)
    return res.data
  },
  async updateLanguage(id: number, data: Partial<Language>): Promise<Language> {
    const res = await api.put(`/admin/languages/${id}`, data)
    return res.data
  },
  async deleteLanguage(id: number): Promise<void> {
    await api.delete(`/admin/languages/${id}`)
  },
  async getTranslations(languageId: number): Promise<TranslationEntry[]> {
    const res = await api.get(`/admin/languages/${languageId}/translations`)
    return res.data
  },
  async updateTranslation(languageId: number, id: number, data: Partial<TranslationEntry>): Promise<void> {
    await api.put(`/admin/languages/${languageId}/translations/${id}`, data)
  },
  // Coupon Codes
  async getCouponCodes(params?: Record<string, any>): Promise<{ data: CouponCode[]; total: number }> {
    const res = await api.get('/admin/coupon-codes', { params })
    return res.data
  },
  async getCouponCode(id: number): Promise<CouponCode> {
    const res = await api.get(`/admin/coupon-codes/${id}`)
    return res.data
  },
  async createCouponCode(data: Partial<CouponCode>): Promise<CouponCode> {
    const res = await api.post('/admin/coupon-codes', data)
    return res.data
  },
  async updateCouponCode(id: number, data: Partial<CouponCode>): Promise<CouponCode> {
    const res = await api.put(`/admin/coupon-codes/${id}`, data)
    return res.data
  },
  async deleteCouponCode(id: number): Promise<void> {
    await api.delete(`/admin/coupon-codes/${id}`)
  },
  // Front CMS
  async getFrontCMS(): Promise<FrontCMS> {
    const res = await api.get('/admin/front-cms')
    return res.data
  },
  async updateFrontCMS(data: Partial<FrontCMS>): Promise<void> {
    await api.put('/admin/front-cms', data)
  },
  async getFaqs(): Promise<FaqItem[]> {
    const res = await api.get('/admin/faqs')
    return res.data
  },
  async createFaq(data: Partial<FaqItem>): Promise<FaqItem> {
    const res = await api.post('/admin/faqs', data)
    return res.data
  },
  async updateFaq(id: number, data: Partial<FaqItem>): Promise<FaqItem> {
    const res = await api.put(`/admin/faqs/${id}`, data)
    return res.data
  },
  async deleteFaq(id: number): Promise<void> {
    await api.delete(`/admin/faqs/${id}`)
  },
  // Email Templates
  async getEmailTemplates(params?: Record<string, any>): Promise<{ data: EmailTemplate[]; total: number }> {
    const res = await api.get('/admin/email-templates', { params })
    return res.data
  },
  async getEmailTemplate(id: number): Promise<EmailTemplate> {
    const res = await api.get(`/admin/email-templates/${id}`)
    return res.data
  },
  async updateEmailTemplate(id: number, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const res = await api.put(`/admin/email-templates/${id}`, data)
    return res.data
  },
  // Activity Logs
  async getActivityLogs(params?: Record<string, any>): Promise<{ data: ActivityLog[]; total: number }> {
    const res = await api.get('/admin/activity-logs', { params })
    return res.data
  },
  // Newsletter
  async getNewsletterCampaigns(params?: Record<string, any>): Promise<{ data: NewsletterCampaign[]; total: number }> {
    const res = await api.get('/admin/newsletter', { params })
    return res.data
  },
  async createNewsletterCampaign(data: Partial<NewsletterCampaign>): Promise<NewsletterCampaign> {
    const res = await api.post('/admin/newsletter', data)
    return res.data
  },
  async sendNewsletter(id: number): Promise<void> {
    await api.post(`/admin/newsletter/${id}/send`)
  },
  // Bookings
  async getBookings(params?: Record<string, any>): Promise<{ data: AdminBooking[]; total: number }> {
    const res = await api.get('/admin/bookings', { params })
    return res.data
  },
  async getBooking(id: number): Promise<AdminBooking> {
    const res = await api.get(`/admin/bookings/${id}`)
    return res.data
  },
  async updateBookingStatus(id: number, status: AdminBooking['status']): Promise<AdminBooking> {
    const res = await api.put(`/admin/bookings/${id}`, { status })
    return res.data
  },
  async deleteBooking(id: number): Promise<void> {
    await api.delete(`/admin/bookings/${id}`)
  },
  // System
  async getSystemInfo(): Promise<Record<string, string>> {
    const res = await api.get('/admin/system/info')
    return res.data
  },
  async clearCache(): Promise<void> {
    await api.post('/admin/system/clear-cache')
  },
}

// Re-export Permission type for use in roles
export interface Permission {
  id: number
  name: string
  display_name?: string
  description?: string
}
