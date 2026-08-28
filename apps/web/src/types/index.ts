export interface Feature {
  id: number
  name: string
  description: string
  profile_image: string
}

export interface FrontTestimonial {
  id: number
  name: string
  description: string
  testimonial_url: string
}

export interface AboutUs {
  id: number
  title: string
  description: string
  about_url: string
}

export interface Plan {
  id: number
  name: string
  currency_id: number
  price: number
  frequency: number
  is_default: number
  trial_days: number
  no_of_vcards: number
  status: number
  currency?: Currency
  plan_feature?: PlanFeature
}

export interface Currency {
  id: number
  currency_name: string
  currency_icon: string
  currency_code: string
}

export interface PlanFeature {
  id: number
  plan_id: number
  products_services: number
  testimonials: number
  hide_branding: number
  enquiry_form: number
  social_links: number
  password: number
  custom_css: number
  custom_js: number
  custom_fonts: number
  products: number
  appointments: number
  gallery: number
  analytics: number
  seo: number
  blog: number
  affiliation: number
  custom_qrcode: number
}

export interface Template {
  id: number
  name: string
  path: string
  template_url: string
  category?: string
  status?: string
  usage?: number
  created?: string
  is_business?: boolean
  is_consumer?: boolean
  font_family?: string
  primary_color?: string
  secondary_color?: string
  sections?: Record<string, boolean>
}

export interface AdminTemplate {
  id: number
  name: string
  path: string
  template_url: string
  category: string
  status: 'published' | 'draft' | 'archived'
  usage: number
  created: string
  font_family: string
  primary_color: string
  secondary_color: string
  button_style: string
  logo_position: string
  bg_style: string
  sections: Record<string, boolean>
  is_business: boolean
  is_consumer: boolean
}

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export interface Meta {
  site_title: string
  home_title: string
  meta_keyword: string
  meta_description: string
  google_analytics: string
}

export interface Setting {
  key: string
  value: string
  logo_url: string
  favicon_url: string
}

export interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  status: string
  is_verified: boolean
  email_verified_at?: string | null
  language?: string
  theme_mode?: 'light' | 'dark'
  created_at?: string
  updated_at?: string
  /** Computed display name — derived from first_name + last_name */
  name?: string
  /** @deprecated Use phone instead */
  contact?: string
  /** @deprecated No longer returned by API */
  profile_image?: string
  /** @deprecated No longer returned by API */
  referral_code?: string
  /** @deprecated Use status === 'active' */
  is_active?: boolean
}

export interface AuthResponse {
  token: string
  refresh_token: string
  user: User
  message?: string
}

export interface LoginData {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  referral_code?: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  email: string
  token: string
  password: string
  password_confirmation: string
}

export interface ProfileData {
  first_name?: string
  last_name?: string
  phone?: string
  email?: string
}

export interface ChangePasswordData {
  current_password: string
  password: string
  password_confirmation: string
}

export interface AdminStats {
  total_users: number
  total_vcards: number
  total_plans: number
  total_enquiries: number
  total_subscribers: number
  total_testimonials: number
  recent_users: User[]
  recent_vcards: VCard[]
  monthly_users: { month: string; count: number }[]
  monthly_vcards: { month: string; count: number }[]
}

export interface UserDashboardStats {
  total_vcards: number
  total_views: number
  total_contacts: number
  total_appointments: number
  recent_vcards: VCard[]
  monthly_views: { month: string; count: number }[]
  vcard_breakdown: { name: string; views: number }[]
}

export interface VCard {
  id: number
  user_id: number
  name: string
  url_slug: string
  occupation?: string
  description?: string
  email?: string
  phone?: string
  location?: string
  website?: string
  template_id?: number
  cover_image?: string
  profile_image?: string
  branding?: number
  password?: string
  status: number
  created_at: string
  updated_at: string
  user?: User
  template?: Template
}

export interface VCardSection {
  id: number
  vcard_id: number
}

export interface SocialLink extends VCardSection {
  whatsapp_url?: string
  whatsapp_number?: string
  instagram_url?: string
  facebook_url?: string
  twitter_url?: string
  linkedin_url?: string
  youtube_url?: string
  tiktok_url?: string
  telegram?: string
  snapchat?: string
  website_url?: string
}

export interface Service extends VCardSection {
  name: string
  description?: string
  price?: number
  image?: string
}

export interface Gallery extends VCardSection {
  image: string
  title?: string
  description?: string
}

export interface VCardTestimonial extends VCardSection {
  name: string
  description: string
  image?: string
}

export interface BlogPost extends VCardSection {
  title: string
  description: string
  image?: string
  status: number
  created_at: string
}

export interface AppointmentSlot {
  id: number
  vcard_id: number
  day_of_week: number
  start_time: string
  end_time: string
}

export interface Appointment {
  id: number
  vcard_id: number
  name: string
  email: string
  phone?: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}

export interface AdminBooking {
  id: number
  customer_name: string
  customer_email: string
  customer_phone?: string
  business_id: number
  business_name: string
  vcard_id: number
  type: 'Appointment' | 'Consultation' | 'Class' | 'Reservation' | 'Event'
  date: string
  time: string
  duration_minutes: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  amount: number
  notes?: string
  created_at: string
}

export interface VCardSEO {
  id: number
  vcard_id: number
  meta_keyword?: string
  meta_description?: string
  site_title?: string
  home_title?: string
  google_analytics?: string
}

export interface VCardCustomization {
  id: number
  vcard_id: number
  custom_css?: string
  custom_js?: string
  custom_fonts?: string
  font_family?: string
}

export interface Subscription {
  id: number
  user_id: number
  plan_id: number
  plan_name?: string
  starts_at: string
  ends_at: string
  status: 'active' | 'expired' | 'cancelled'
  plan?: Plan
}

export interface AnalyticsData {
  total_views: number
  total_contacts: number
  views_today: number
  views_this_week: number
  views_this_month: number
  daily_views: { date: string; count: number }[]
  device_breakdown: { device: string; count: number }[]
  location_breakdown: { country: string; count: number }[]
}

export interface Enquiry {
  id: number
  vcard_id?: number
  name: string
  email: string
  subject?: string
  message: string
  created_at: string
  read_at?: string | null
}

export interface Subscriber {
  id: number
  email: string
  created_at: string
}

export interface Role {
  id: number
  name: string
  display_name?: string
  description?: string
  permissions_count?: number
  users_count?: number
}

export interface Permission {
  id: number
  name: string
  display_name?: string
  description?: string
}

export interface DashboardMeta {
  site_title: string
  home_title: string
  meta_keyword: string
  meta_description: string
  google_analytics: string
}

export interface EmailSetting {
  mail_driver: string
  mail_host: string
  mail_port: string
  mail_username: string
  mail_password: string
  mail_encryption: string
  mail_from_address: string
  mail_from_name: string
}

export interface PaymentSetting {
  stripe_key: string
  stripe_secret: string
  stripe_enabled: boolean
  paypal_client_id: string
  paypal_secret: string
  paypal_enabled: boolean
  currency: string
}

export type SupportedLanguage = 'ar' | 'de' | 'en' | 'es' | 'fr' | 'pt' | 'ru' | 'tr' | 'zh'

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; name: string; native: string }[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'zh', name: 'Chinese', native: '中文' },
]

export interface AdminUser {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  role?: string
  status: number
  created_at: string
  updated_at: string
}

export interface SubscribedUserPlan {
  id: number
  user_id: number
  plan_id: number
  plan_name?: string
  user_name?: string
  user_email?: string
  start_date: string
  end_date: string
  status: string
  transaction_id?: string
  payment_type?: string
  created_at: string
}

export interface CashPayment {
  id: number
  user_id: number
  plan_id: number
  user_name?: string
  plan_name?: string
  amount: number
  currency?: string
  transaction_id: string
  attachment?: string
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
  created_at: string
  updated_at: string
}

export interface AffiliateUser {
  id: number
  user_id: number
  referral_code: string
  commission_rate: number
  total_earned: number
  total_withdrawn: number
  balance: number
  referred_count: number
  user_name?: string
  user_email?: string
  status: number
  created_at: string
}

export interface AffiliateTransaction {
  id: number
  affiliate_user_id: number
  referred_user_id: number
  referred_user_name?: string
  amount: number
  description?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface WithdrawTransaction {
  id: number
  affiliate_user_id: number
  user_name?: string
  amount: number
  payment_method: string
  payment_details: string
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
  created_at: string
  updated_at: string
}

export interface Country {
  id: number
  name: string
  code: string
  phone_code: string
  currency_code?: string
  status: number
  created_at: string
}

export interface Language {
  id: number
  name: string
  code: string
  native_name?: string
  is_default: number
  status: number
  created_at: string
}

export interface TranslationEntry {
  id: number
  language_id: number
  group: string
  key: string
  value: string
}

export interface CouponCode {
  id: number
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses: number
  used_count: number
  plan_id?: number
  plan_name?: string
  min_amount?: number
  expires_at?: string
  status: number
  created_at: string
}

export interface FrontCMS {
  hero_title?: string
  hero_subtitle?: string
  hero_image?: string
  about_title?: string
  about_description?: string
  about_image?: string
  features_title?: string
  features_subtitle?: string
  testimonials_title?: string
  testimonials_subtitle?: string
  contact_email?: string
  contact_phone?: string
  contact_address?: string
  faq_title?: string
  faq_items?: FaqItem[]
}

export interface FaqItem {
  id: number
  question: string
  answer: string
  order: number
}

export interface EmailTemplate {
  id: number
  name: string
  subject: string
  body: string
  variables: string
  created_at: string
}

export interface ActivityLog {
  id: number
  admin_id: number
  admin_name?: string
  action: string
  module: string
  description: string
  ip_address?: string
  created_at: string
}

export interface NewsletterCampaign {
  id: number
  subject: string
  content: string
  sent_count: number
  status: 'draft' | 'sent'
  created_at: string
}

export interface AdminReport {
  type: string
  label: string
  data: Record<string, number | string>
}

// ── API response envelope & mapping helpers ──────────────────────────────────

/** Raw shape returned by the NestJS API for user endpoints */
export interface ApiUserResponse {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  status: string
  is_verified: boolean
  email_verified_at?: string | null
  language?: string
  theme_mode?: string
  created_at?: string
  updated_at?: string
}

/** Standard API envelope wrapping data in { success, data, message } */
export interface ApiResponseEnvelope<T> {
  success: boolean
  data: T
  message?: string
}

/**
 * Map a raw API user object to the frontend User type.
 * Adds computed `name`, `contact`, and `is_active` for backward compat.
 */
export function mapApiUser(api: ApiUserResponse): User {
  const firstName = api.first_name ?? ''
  const lastName = api.last_name ?? ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || api.email

  return {
    ...api,
    name: fullName,
    contact: api.phone ?? undefined,
    is_active: api.status === 'active',
    theme_mode: (api.theme_mode === 'light' || api.theme_mode === 'dark') ? api.theme_mode : undefined,
  }
}

// ── Card Type Constants (matches backend CardType enum) ──────────────────────

export const CardType = {
  BUSINESS_VCARD: 'BUSINESS_VCARD',
  BUSINESS_CARD: 'BUSINESS_CARD',
  CONSUMER_VCARD: 'CONSUMER_VCARD',
  CONSUMER_STORE_CARD: 'CONSUMER_STORE_CARD',
  EVENT: 'EVENT',
} as const

export type CardType = typeof CardType[keyof typeof CardType]

export const CardProduct = {
  VCARD: 'VCARD',
  CARD: 'CARD',
} as const

export type CardProduct = typeof CardProduct[keyof typeof CardProduct]

export const CardAudience = {
  BUSINESS: 'BUSINESS',
  CONSUMER: 'CONSUMER',
} as const

export type CardAudience = typeof CardAudience[keyof typeof CardAudience]
