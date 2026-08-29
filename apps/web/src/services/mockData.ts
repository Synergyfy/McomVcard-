import type {
  User, VCard, SubscribedUserPlan, CashPayment, AffiliateUser,
  AffiliateTransaction, WithdrawTransaction, Country, Language, TranslationEntry,
  CouponCode, FrontCMS, FaqItem, EmailTemplate, ActivityLog, NewsletterCampaign,
  Plan, Currency, FrontTestimonial, Feature as FrontFeature, AboutUs, Enquiry, Subscriber,
  AdminTemplate, AdminBooking,
} from '../types'

export const mockUsers: User[] = [
  { id: '1', name: 'Sarah Johnson', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@example.com', phone: '+1-555-0101', status: 'active', is_active: true, is_verified: true, email_verified_at: '2025-01-15' },
  { id: '2', name: 'Mike Chen', first_name: 'Mike', last_name: 'Chen', email: 'mike@example.com', phone: '+1-555-0102', status: 'active', is_active: true, is_verified: true, email_verified_at: '2025-02-03' },
  { id: '3', name: 'Emily Williams', first_name: 'Emily', last_name: 'Williams', email: 'emily@example.com', phone: '+1-555-0103', status: 'active', is_active: true, is_verified: true, email_verified_at: '2025-02-20' },
  { id: '4', name: 'David Smith', first_name: 'David', last_name: 'Smith', email: 'david@example.com', phone: '+1-555-0104', status: 'inactive', is_active: false, is_verified: false, email_verified_at: null },
  { id: '5', name: 'Anna Garcia', first_name: 'Anna', last_name: 'Garcia', email: 'anna@example.com', phone: '+1-555-0105', status: 'active', is_active: true, is_verified: true, email_verified_at: '2025-03-12' },
  { id: '6', name: 'James Brown', first_name: 'James', last_name: 'Brown', email: 'james@example.com', phone: '+1-555-0106', status: 'active', is_active: true, is_verified: true, email_verified_at: '2025-03-28' },
  { id: '7', name: 'Lisa Anderson', first_name: 'Lisa', last_name: 'Anderson', email: 'lisa@example.com', phone: '+1-555-0107', status: 'active', is_active: true, is_verified: true, email_verified_at: '2025-04-02' },
  { id: '8', name: 'Robert Taylor', first_name: 'Robert', last_name: 'Taylor', email: 'robert@example.com', phone: '+1-555-0108', status: 'inactive', is_active: false, is_verified: false, email_verified_at: null },
]

export const mockVcards: VCard[] = [
  { id: '1', name: 'Sarah\'s Business Card', url_slug: 'sarah-johnson', user_id: 1, template_id: 1, occupation: 'Marketing Director', description: 'Digital marketing professional', status: 1, created_at: '2025-02-01', updated_at: '2025-06-10' },
  { id: '2', name: 'Tech Connect', url_slug: 'mike-chen', user_id: 2, template_id: 3, occupation: 'Software Engineer', description: 'Full-stack developer', status: 1, created_at: '2025-02-15', updated_at: '2025-06-09' },
  { id: '3', name: 'Design Portfolio', url_slug: 'emily-design', user_id: 3, template_id: 5, occupation: 'UI/UX Designer', description: 'Creative design solutions', status: 1, created_at: '2025-03-01', updated_at: '2025-06-08' },
  { id: '4', name: 'Smith Consulting', url_slug: 'david-consult', user_id: 4, template_id: 2, occupation: 'Business Consultant', description: 'Strategic business advisory', status: 0, created_at: '2025-03-20', updated_at: '2025-05-20' },
  { id: '5', name: 'Anna\'s Art Studio', url_slug: 'anna-art', user_id: 5, template_id: 7, occupation: 'Artist', description: 'Custom artwork and commissions', status: 1, created_at: '2025-04-01', updated_at: '2025-06-07' },
  { id: '6', name: 'Brown Law', url_slug: 'james-law', user_id: 6, template_id: 1, occupation: 'Attorney', description: 'Legal services', status: 1, created_at: '2025-04-15', updated_at: '2025-06-06' },
]

export const mockPlans: Plan[] = [
  {
    id: '1', name: 'Free', currency_id: 3, price: 0, frequency: 1, is_default: 1, trial_days: 0, no_of_vcards: 1, status: 1,
    currency: { id: '3', currency_name: 'British Pound', currency_icon: '£', currency_code: 'GBP' },
    plan_feature: { id: '1', plan_id: 1, products_services: 0, testimonials: 0, hide_branding: 0, enquiry_form: 1, social_links: 1, password: 0, custom_css: 0, custom_js: 0, custom_fonts: 0, products: 0, appointments: 0, gallery: 0, analytics: 0, seo: 0, blog: 0, affiliation: 0, custom_qrcode: 0 },
  },
  {
    id: '2', name: 'Basic', currency_id: 3, price: 9.99, frequency: 1, is_default: 0, trial_days: 7, no_of_vcards: 5, status: 1,
    currency: { id: '3', currency_name: 'British Pound', currency_icon: '£', currency_code: 'GBP' },
    plan_feature: { id: '2', plan_id: 2, products_services: 1, testimonials: 1, hide_branding: 0, enquiry_form: 1, social_links: 1, password: 0, custom_css: 0, custom_js: 0, custom_fonts: 0, products: 1, appointments: 1, gallery: 0, analytics: 0, seo: 0, blog: 0, affiliation: 0, custom_qrcode: 0 },
  },
  {
    id: '3', name: 'Pro', currency_id: 3, price: 19.99, frequency: 1, is_default: 0, trial_days: 7, no_of_vcards: 15, status: 1,
    currency: { id: '3', currency_name: 'British Pound', currency_icon: '£', currency_code: 'GBP' },
    plan_feature: { id: '3', plan_id: 3, products_services: 1, testimonials: 1, hide_branding: 1, enquiry_form: 1, social_links: 1, password: 1, custom_css: 0, custom_js: 0, custom_fonts: 0, products: 1, appointments: 1, gallery: 1, analytics: 1, seo: 1, blog: 0, affiliation: 0, custom_qrcode: 1 },
  },
  {
    id: '4', name: 'Enterprise', currency_id: 3, price: 49.99, frequency: 1, is_default: 0, trial_days: 14, no_of_vcards: -1, status: 1,
    currency: { id: '3', currency_name: 'British Pound', currency_icon: '£', currency_code: 'GBP' },
    plan_feature: { id: '4', plan_id: 4, products_services: 1, testimonials: 1, hide_branding: 1, enquiry_form: 1, social_links: 1, password: 1, custom_css: 1, custom_js: 1, custom_fonts: 1, products: 1, appointments: 1, gallery: 1, analytics: 1, seo: 1, blog: 1, affiliation: 1, custom_qrcode: 1 },
  },
]

export const mockSubscribedPlans: SubscribedUserPlan[] = [
  { id: '1', user_id: 1, plan_id: 3, plan_name: 'Pro', user_name: 'Sarah Johnson', user_email: 'sarah@example.com', start_date: '2025-03-01', end_date: '2025-07-01', status: 'active', payment_type: 'stripe', created_at: '2025-03-01' },
  { id: '2', user_id: 2, plan_id: 2, plan_name: 'Basic', user_name: 'Mike Chen', user_email: 'mike@example.com', start_date: '2025-04-01', end_date: '2025-07-01', status: 'active', payment_type: 'paypal', created_at: '2025-04-01' },
  { id: '3', user_id: 3, plan_id: 4, plan_name: 'Enterprise', user_name: 'Emily Williams', user_email: 'emily@example.com', start_date: '2025-02-15', end_date: '2025-08-15', status: 'active', payment_type: 'stripe', created_at: '2025-02-15' },
  { id: '4', user_id: 4, plan_id: 2, plan_name: 'Basic', user_name: 'David Smith', user_email: 'david@example.com', start_date: '2025-03-01', end_date: '2025-06-01', status: 'expired', payment_type: 'cash', created_at: '2025-03-01' },
  { id: '5', user_id: 5, plan_id: 3, plan_name: 'Pro', user_name: 'Anna Garcia', user_email: 'anna@example.com', start_date: '2025-05-01', end_date: '2025-08-01', status: 'active', payment_type: 'stripe', created_at: '2025-05-01' },
]

export const mockCashPayments: CashPayment[] = [
  { id: '1', user_id: 4, plan_id: 2, user_name: 'David Smith', plan_name: 'Basic', amount: 9.99, currency: '£', transaction_id: 'CASH-001', attachment: '', status: 'pending', notes: 'Cash payment at office', created_at: '2025-05-15', updated_at: '2025-05-15' },
  { id: '2', user_id: 7, plan_id: 3, user_name: 'Lisa Anderson', plan_name: 'Pro', amount: 19.99, currency: '£', transaction_id: 'CASH-002', attachment: '', status: 'approved', notes: 'Paid at event', created_at: '2025-05-20', updated_at: '2025-05-21' },
  { id: '3', user_id: 8, plan_id: 2, user_name: 'Robert Taylor', plan_name: 'Basic', amount: 9.99, currency: '£', transaction_id: 'CASH-003', attachment: '', status: 'rejected', notes: 'Insufficient funds', created_at: '2025-06-01', updated_at: '2025-06-02' },
]

export const mockAffiliateUsers: AffiliateUser[] = [
  { id: '1', user_id: 2, referral_code: 'MIKE2025', commission_rate: 10, total_earned: 450.00, total_withdrawn: 200.00, balance: 250.00, referred_count: 12, user_name: 'Mike Chen', user_email: 'mike@example.com', status: 1, created_at: '2025-03-01' },
  { id: '2', user_id: 5, referral_code: 'ANNAART', commission_rate: 15, total_earned: 320.50, total_withdrawn: 100.00, balance: 220.50, referred_count: 8, user_name: 'Anna Garcia', user_email: 'anna@example.com', status: 1, created_at: '2025-03-15' },
  { id: '3', user_id: 6, referral_code: 'BROWNLAW', commission_rate: 10, total_earned: 180.00, total_withdrawn: 180.00, balance: 0.00, referred_count: 5, user_name: 'James Brown', user_email: 'james@example.com', status: 1, created_at: '2025-04-01' },
]

export const mockAffiliateTransactions: AffiliateTransaction[] = [
  { id: '1', affiliate_user_id: 1, referred_user_id: 10, referred_user_name: 'Tom Wilson', amount: 9.99, description: 'Commission from Basic plan', status: 'approved', created_at: '2025-05-01' },
  { id: '2', affiliate_user_id: 1, referred_user_id: 11, referred_user_name: 'Nina Patel', amount: 19.99, description: 'Commission from Pro plan', status: 'approved', created_at: '2025-05-15' },
  { id: '3', affiliate_user_id: 2, referred_user_id: 12, referred_user_name: 'Oscar Lee', amount: 19.99, description: 'Commission from Pro plan', status: 'pending', created_at: '2025-06-01' },
  { id: '4', affiliate_user_id: 1, referred_user_id: 13, referred_user_name: 'Paul Green', amount: 9.99, description: 'Commission from Basic plan', status: 'pending', created_at: '2025-06-05' },
]

export const mockWithdrawTransactions: WithdrawTransaction[] = [
  { id: '1', affiliate_user_id: 1, user_name: 'Mike Chen', amount: 100.00, payment_method: 'PayPal', payment_details: 'mike@example.com', status: 'approved', notes: 'Processed', created_at: '2025-04-15', updated_at: '2025-04-16' },
  { id: '2', affiliate_user_id: 1, user_name: 'Mike Chen', amount: 100.00, payment_method: 'Bank Transfer', payment_details: 'Chase ****1234', status: 'approved', created_at: '2025-05-15', updated_at: '2025-05-16' },
  { id: '3', affiliate_user_id: 2, user_name: 'Anna Garcia', amount: 100.00, payment_method: 'PayPal', payment_details: 'anna@example.com', status: 'pending', created_at: '2025-06-10', updated_at: '2025-06-10' },
  { id: '4', affiliate_user_id: 3, user_name: 'James Brown', amount: 50.00, payment_method: 'PayPal', payment_details: 'james@example.com', status: 'pending', created_at: '2025-06-12', updated_at: '2025-06-12' },
]

export const mockCountries: Country[] = [
  { id: '1', name: 'United States', code: 'US', phone_code: '+1', currency_code: 'USD', status: 1, created_at: '2025-01-01' },
  { id: '2', name: 'United Kingdom', code: 'GB', phone_code: '+44', currency_code: 'GBP', status: 1, created_at: '2025-01-01' },
  { id: '3', name: 'Canada', code: 'CA', phone_code: '+1', currency_code: 'CAD', status: 1, created_at: '2025-01-01' },
  { id: '4', name: 'Australia', code: 'AU', phone_code: '+61', currency_code: 'AUD', status: 1, created_at: '2025-01-01' },
  { id: '5', name: 'Germany', code: 'DE', phone_code: '+49', currency_code: 'EUR', status: 1, created_at: '2025-01-01' },
  { id: '6', name: 'France', code: 'FR', phone_code: '+33', currency_code: 'EUR', status: 1, created_at: '2025-01-01' },
  { id: '7', name: 'Japan', code: 'JP', phone_code: '+81', currency_code: 'JPY', status: 1, created_at: '2025-01-01' },
  { id: '8', name: 'Brazil', code: 'BR', phone_code: '+55', currency_code: 'BRL', status: 1, created_at: '2025-01-01' },
]

export const mockLanguages: Language[] = [
  { id: '1', name: 'English', code: 'en', native_name: 'English', is_default: 1, status: 1, created_at: '2025-01-01' },
  { id: '2', name: 'Spanish', code: 'es', native_name: 'Español', is_default: 0, status: 1, created_at: '2025-01-01' },
  { id: '3', name: 'French', code: 'fr', native_name: 'Français', is_default: 0, status: 1, created_at: '2025-01-01' },
  { id: '4', name: 'German', code: 'de', native_name: 'Deutsch', is_default: 0, status: 1, created_at: '2025-01-01' },
  { id: '5', name: 'Arabic', code: 'ar', native_name: 'العربية', is_default: 0, status: 1, created_at: '2025-01-01' },
  { id: '6', name: 'Portuguese', code: 'pt', native_name: 'Português', is_default: 0, status: 0, created_at: '2025-01-01' },
]

export const mockTranslations: TranslationEntry[] = [
  { id: '1', language_id: 1, group: 'nav', key: 'home', value: 'Home' },
  { id: '2', language_id: 1, group: 'nav', key: 'templates', value: 'Templates' },
  { id: '3', language_id: 1, group: 'hero', key: 'title', value: 'Create Your Digital Business Card in Minutes' },
  { id: '4', language_id: 1, group: 'hero', key: 'subtitle', value: 'Transform the way you share contact information.' },
  { id: '5', language_id: 2, group: 'nav', key: 'home', value: 'Inicio' },
  { id: '6', language_id: 2, group: 'nav', key: 'templates', value: 'Plantillas' },
  { id: '7', language_id: 2, group: 'hero', key: 'title', value: 'Crea tu tarjeta de presentación digital en minutos' },
]

export const mockCouponCodes: CouponCode[] = [
  { id: '1', code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, max_uses: 100, used_count: 45, plan_id: 2, plan_name: 'Basic', min_amount: 0, expires_at: '2025-12-31', status: 1, created_at: '2025-01-01' },
  { id: '2', code: 'PRO50', discount_type: 'fixed', discount_value: 50, max_uses: 20, used_count: 8, plan_id: 3, plan_name: 'Pro', min_amount: 100, expires_at: '2025-09-30', status: 1, created_at: '2025-03-01' },
  { id: '3', code: 'SUMMER25', discount_type: 'percentage', discount_value: 25, max_uses: 50, used_count: 0, plan_id: 0, plan_name: 'All Plans', min_amount: 0, expires_at: '2025-08-31', status: 1, created_at: '2025-06-01' },
]

export const mockFaqs: FaqItem[] = [
  { id: '1', question: 'How do I create a vCard?', answer: 'Sign up for an account, choose a template, fill in your details, and publish. It takes less than 5 minutes.', order: 1 },
  { id: '2', question: 'Can I customize my vCard design?', answer: 'Yes, you can choose from multiple templates and customize colors, fonts, and layout to match your brand.', order: 2 },
  { id: '3', question: 'Is there a free plan available?', answer: 'Yes, we offer a free plan with 1 vCard. Upgrade to Basic or Pro for more features and unlimited vCards.', order: 3 },
  { id: '4', question: 'How does payment work?', answer: 'We accept credit cards via Stripe and PayPal. You can also pay with cash and we will manually approve your subscription.', order: 4 },
]

export const mockEmailTemplates: EmailTemplate[] = [
  { id: '1', name: 'Welcome Email', subject: 'Welcome to Mobile VCard Link!', body: 'Hi {{name}},\n\nThank you for joining Mobile VCard Link. We are excited to have you on board!\n\nYour account has been created successfully. You can now start creating your digital vCards.\n\nBest regards,\nThe Mobile VCard Link Team', variables: '{{name}}, {{email}}', created_at: '2025-01-01' },
  { id: '2', name: 'Password Reset', subject: 'Reset Your Password', body: 'Hi {{name}},\n\nYou recently requested to reset your password. Click the link below to reset it:\n\n{{reset_link}}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe Mobile VCard Link Team', variables: '{{name}}, {{reset_link}}', created_at: '2025-01-01' },
  { id: '3', name: 'Subscription Confirmation', subject: 'Subscription Activated', body: 'Hi {{name}},\n\nYour {{plan_name}} subscription has been activated. You now have access to all the features included in your plan.\n\nYour subscription will renew on {{renewal_date}}.\n\nThank you for choosing Mobile VCard Link!', variables: '{{name}}, {{plan_name}}, {{renewal_date}}', created_at: '2025-01-01' },
]

export const mockActivityLogs: ActivityLog[] = [
  { id: '1', admin_id: 1, admin_name: 'Super Admin', action: 'login', module: 'Auth', description: 'Logged into admin panel', ip_address: '192.168.1.1', created_at: '2025-06-14T08:30:00Z' },
  { id: '2', admin_id: 1, admin_name: 'Super Admin', action: 'create', module: 'User', description: 'Created new user: Sarah Johnson', ip_address: '192.168.1.1', created_at: '2025-06-14T09:15:00Z' },
  { id: '3', admin_id: 1, admin_name: 'Super Admin', action: 'update', module: 'Plan', description: 'Updated Pro plan pricing', ip_address: '192.168.1.1', created_at: '2025-06-13T14:00:00Z' },
  { id: '4', admin_id: 1, admin_name: 'Super Admin', action: 'delete', module: 'VCard', description: 'Deleted vCard ID #12', ip_address: '192.168.1.1', created_at: '2025-06-13T11:30:00Z' },
  { id: '5', admin_id: 1, admin_name: 'Super Admin', action: 'create', module: 'Coupon', description: 'Created coupon code SUMMER25', ip_address: '192.168.1.1', created_at: '2025-06-12T16:45:00Z' },
  { id: '6', admin_id: 1, admin_name: 'Super Admin', action: 'update', module: 'Settings', description: 'Updated email SMTP settings', ip_address: '192.168.1.1', created_at: '2025-06-12T10:00:00Z' },
]

export const mockNewsletterCampaigns: NewsletterCampaign[] = [
  { id: '1', subject: 'Welcome to Mobile VCard Link!', content: 'Thank you for joining our platform...', sent_count: 643, status: 'sent', created_at: '2025-01-15' },
  { id: '2', subject: 'New Templates Available', content: 'Check out our latest template designs...', sent_count: 580, status: 'sent', created_at: '2025-03-01' },
  { id: '3', subject: 'Summer Special Offer', content: 'Get 25% off on Pro plan this summer...', sent_count: 0, status: 'draft', created_at: '2025-06-01' },
]

export const mockEnquiries: Enquiry[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', subject: 'Partnership Inquiry', message: 'We would like to partner with Mobile VCard Link for our upcoming event.', created_at: '2025-06-10' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', subject: 'Feature Request', message: 'It would be great to have QR code generation built into the platform.', created_at: '2025-06-08' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', subject: 'Billing Question', message: 'I was charged twice for my subscription. Please look into this.', created_at: '2025-06-05' },
]

export const mockSubscribers: Subscriber[] = [
  { id: '1', email: 'subscriber1@example.com', created_at: '2025-05-01' },
  { id: '2', email: 'subscriber2@example.com', created_at: '2025-05-15' },
  { id: '3', email: 'subscriber3@example.com', created_at: '2025-06-01' },
  { id: '4', email: 'subscriber4@example.com', created_at: '2025-06-10' },
]

export const mockCurrencies: Currency[] = [
  { id: '1', currency_name: 'US Dollar', currency_icon: '$', currency_code: 'USD' },
  { id: '2', currency_name: 'Euro', currency_icon: '\u20ac', currency_code: 'EUR' },
  { id: '3', currency_name: 'British Pound', currency_icon: '\u00a3', currency_code: 'GBP' },
  { id: '4', currency_name: 'Indian Rupee', currency_icon: '\u20b9', currency_code: 'INR' },
  { id: '5', currency_name: 'Canadian Dollar', currency_icon: 'CA$', currency_code: 'CAD' },
  { id: '6', currency_name: 'Australian Dollar', currency_icon: 'A$', currency_code: 'AUD' },
  { id: '7', currency_name: 'Japanese Yen', currency_icon: '\u00a5', currency_code: 'JPY' },
  { id: '8', currency_name: 'Chinese Yuan', currency_icon: '\u00a5', currency_code: 'CNY' },
  { id: '9', currency_name: 'Swiss Franc', currency_icon: 'CHF', currency_code: 'CHF' },
  { id: '10', currency_name: 'Brazilian Real', currency_icon: 'R$', currency_code: 'BRL' },
  { id: '11', currency_name: 'Mexican Peso', currency_icon: 'MX$', currency_code: 'MXN' },
  { id: '12', currency_name: 'South Korean Won', currency_icon: '\u20a9', currency_code: 'KRW' },
  { id: '13', currency_name: 'Turkish Lira', currency_icon: '\u20ba', currency_code: 'TRY' },
  { id: '14', currency_name: 'Russian Ruble', currency_icon: '\u20bd', currency_code: 'RUB' },
  { id: '15', currency_name: 'South African Rand', currency_icon: 'R', currency_code: 'ZAR' },
  { id: '16', currency_name: 'Singapore Dollar', currency_icon: 'S$', currency_code: 'SGD' },
  { id: '17', currency_name: 'Hong Kong Dollar', currency_icon: 'HK$', currency_code: 'HKD' },
  { id: '18', currency_name: 'Swedish Krona', currency_icon: 'kr', currency_code: 'SEK' },
  { id: '19', currency_name: 'Norwegian Krone', currency_icon: 'kr', currency_code: 'NOK' },
  { id: '20', currency_name: 'Danish Krone', currency_icon: 'kr', currency_code: 'DKK' },
  { id: '21', currency_name: 'Polish Zloty', currency_icon: 'z\u0142', currency_code: 'PLN' },
  { id: '22', currency_name: 'Thai Baht', currency_icon: '\u0e3f', currency_code: 'THB' },
  { id: '23', currency_name: 'Indonesian Rupiah', currency_icon: 'Rp', currency_code: 'IDR' },
  { id: '24', currency_name: 'Malaysian Ringgit', currency_icon: 'RM', currency_code: 'MYR' },
  { id: '25', currency_name: 'Philippine Peso', currency_icon: '\u20b1', currency_code: 'PHP' },
  { id: '26', currency_name: 'New Zealand Dollar', currency_icon: 'NZ$', currency_code: 'NZD' },
  { id: '27', currency_name: 'UAE Dirham', currency_icon: 'AED', currency_code: 'AED' },
  { id: '28', currency_name: 'Saudi Riyal', currency_icon: 'SAR', currency_code: 'SAR' },
  { id: '29', currency_name: 'Israeli Shekel', currency_icon: '\u20aa', currency_code: 'ILS' },
  { id: '30', currency_name: 'Egyptian Pound', currency_icon: 'E\u00a3', currency_code: 'EGP' },
]

export const mockTestimonials: FrontTestimonial[] = [
  { id: '1', name: 'Sarah Johnson', description: 'Mobile VCard Link transformed how I share my business contacts. So professional!', testimonial_url: '' },
  { id: '2', name: 'Mike Chen', description: 'The template designs are stunning. I get compliments on my digital card all the time.', testimonial_url: '' },
  { id: '3', name: 'Emily Williams', description: 'Easy to use and the analytics feature helps me track engagement. Highly recommended!', testimonial_url: '' },
]

export const mockFrontFeatures: FrontFeature[] = [
  { id: '1', name: 'Custom Templates', description: 'Choose from dozens of professionally designed templates.', profile_image: '' },
  { id: '2', name: 'Digital Analytics', description: 'Track views, clicks, and engagement on your vCard.', profile_image: '' },
  { id: '3', name: 'Appointment Booking', description: 'Let clients book appointments directly from your vCard.', profile_image: '' },
]

export const mockAboutUs: AboutUs[] = [
  { id: '1', title: 'Our Mission', description: 'We help professionals and businesses create stunning digital business cards that make lasting impressions. Our platform makes it easy to share contact information, showcase work, and connect with clients.', about_url: '' },
]

export const mockTemplates: AdminTemplate[] = [
  { id: '1', name: 'vcard1', path: 'assets/img/templates/vcard1.png', template_url: '/assets/img/templates/vcard1.png', category: 'Restaurant', status: 'published', usage: 342, created: '2025-01-15', font_family: 'Inter', primary_color: '#FF5C00', secondary_color: '#1F2937', button_style: 'rounded', logo_position: 'center', bg_style: 'gradient', sections: { About: true, Contact: true, Website: true, Products: true, Rewards: false, Bookings: true, Reviews: true, 'Social Media': true, Gallery: true, Videos: false, Downloads: false, Payments: false, 'Store Links': false }, is_business: true, is_consumer: true },
  { id: '2', name: 'vcard2', path: 'assets/img/templates/vcard2.png', template_url: '/assets/img/templates/vcard2.png', category: 'Café', status: 'published', usage: 287, created: '2025-01-20', font_family: 'Roboto', primary_color: '#D97706', secondary_color: '#111827', button_style: 'pill', logo_position: 'left', bg_style: 'solid', sections: { About: true, Contact: true, Website: true, Products: true, Rewards: true, Bookings: false, Reviews: true, 'Social Media': true, Gallery: true, Videos: false, Downloads: false, Payments: true, 'Store Links': false }, is_business: true, is_consumer: false },
  { id: '3', name: 'vcard3', path: 'assets/img/templates/vcard3.png', template_url: '/assets/img/templates/vcard3.png', category: 'Barber', status: 'published', usage: 198, created: '2025-02-01', font_family: 'Poppins', primary_color: '#059669', secondary_color: '#0F172A', button_style: 'rounded', logo_position: 'center', bg_style: 'gradient', sections: { About: true, Contact: true, Website: true, Products: false, Rewards: false, Bookings: true, Reviews: true, 'Social Media': true, Gallery: true, Videos: false, Downloads: false, Payments: false, 'Store Links': false }, is_business: true, is_consumer: false },
  { id: '4', name: 'vcard4', path: 'assets/img/templates/vcard4.png', template_url: '/assets/img/templates/vcard4.png', category: 'Beauty Salon', status: 'published', usage: 423, created: '2025-02-10', font_family: 'Playfair Display', primary_color: '#EC4899', secondary_color: '#1E293B', button_style: 'pill', logo_position: 'center', bg_style: 'solid', sections: { About: true, Contact: true, Website: true, Products: true, Rewards: true, Bookings: true, Reviews: true, 'Social Media': true, Gallery: true, Videos: true, Downloads: false, Payments: true, 'Store Links': false }, is_business: true, is_consumer: true },
  { id: '5', name: 'vcard5', path: 'assets/img/templates/vcard5.png', template_url: '/assets/img/templates/vcard5.png', category: 'Accountant', status: 'published', usage: 156, created: '2025-02-15', font_family: 'Inter', primary_color: '#2563EB', secondary_color: '#0F172A', button_style: 'square', logo_position: 'left', bg_style: 'gradient', sections: { About: true, Contact: true, Website: true, Products: false, Rewards: false, Bookings: true, Reviews: true, 'Social Media': true, Gallery: false, Videos: false, Downloads: true, Payments: false, 'Store Links': false }, is_business: true, is_consumer: false },
  { id: '6', name: 'vcard6', path: 'assets/img/templates/vcard6.png', template_url: '/assets/img/templates/vcard6.png', category: 'Estate Agent', status: 'published', usage: 534, created: '2025-02-20', font_family: 'Montserrat', primary_color: '#7C3AED', secondary_color: '#0F172A', button_style: 'rounded', logo_position: 'center', bg_style: 'solid', sections: { About: true, Contact: true, Website: true, Products: true, Rewards: false, Bookings: true, Reviews: true, 'Social Media': true, Gallery: true, Videos: true, Downloads: false, Payments: false, 'Store Links': false }, is_business: true, is_consumer: false },
  { id: '7', name: 'vcard7', path: 'assets/img/templates/vcard7.png', template_url: '/assets/img/templates/vcard7.png', category: 'Solicitor', status: 'published', usage: 212, created: '2025-03-01', font_family: 'Lora', primary_color: '#DC2626', secondary_color: '#1E293B', button_style: 'square', logo_position: 'center', bg_style: 'gradient', sections: { About: true, Contact: true, Website: true, Products: false, Rewards: false, Bookings: true, Reviews: true, 'Social Media': true, Gallery: false, Videos: false, Downloads: true, Payments: false, 'Store Links': false }, is_business: true, is_consumer: false },
  { id: '8', name: 'vcard8', path: 'assets/img/templates/vcard8.png', template_url: '/assets/img/templates/vcard8.png', category: 'Consultant', status: 'published', usage: 678, created: '2025-03-05', font_family: 'DM Sans', primary_color: '#0891B2', secondary_color: '#0F172A', button_style: 'pill', logo_position: 'left', bg_style: 'solid', sections: { About: true, Contact: true, Website: true, Products: true, Rewards: false, Bookings: true, Reviews: true, 'Social Media': true, Gallery: true, Videos: false, Downloads: true, Payments: false, 'Store Links': false }, is_business: true, is_consumer: false },
  { id: '9', name: 'vcard9', path: 'assets/img/templates/vcard9.png', template_url: '/assets/img/templates/vcard9.png', category: 'Coach', status: 'draft', usage: 89, created: '2025-03-10', font_family: 'Space Grotesk', primary_color: '#F59E0B', secondary_color: '#1E293B', button_style: 'rounded', logo_position: 'center', bg_style: 'gradient', sections: { About: true, Contact: true, Website: true, Products: false, Rewards: false, Bookings: true, Reviews: true, 'Social Media': true, Gallery: false, Videos: true, Downloads: false, Payments: false, 'Store Links': false }, is_business: true, is_consumer: true },
  { id: '10', name: 'vcard10', path: 'assets/img/templates/vcard10.png', template_url: '/assets/img/templates/vcard10.png', category: 'Retail Store', status: 'published', usage: 445, created: '2025-03-15', font_family: 'Poppins', primary_color: '#EF4444', secondary_color: '#0F172A', button_style: 'pill', logo_position: 'center', bg_style: 'solid', sections: { About: true, Contact: true, Website: true, Products: true, Rewards: true, Bookings: false, Reviews: true, 'Social Media': true, Gallery: true, Videos: false, Downloads: false, Payments: true, 'Store Links': true }, is_business: true, is_consumer: false },
  { id: '11', name: 'vcard11', path: 'assets/img/templates/vcard11.png', template_url: '/assets/img/templates/vcard11.png', category: 'Service Provider', status: 'published', usage: 321, created: '2025-03-20', font_family: 'Roboto', primary_color: '#14B8A6', secondary_color: '#111827', button_style: 'square', logo_position: 'left', bg_style: 'gradient', sections: { About: true, Contact: true, Website: true, Products: true, Rewards: false, Bookings: true, Reviews: true, 'Social Media': true, Gallery: true, Videos: false, Downloads: true, Payments: false, 'Store Links': false }, is_business: true, is_consumer: false },
  { id: '12', name: 'vcard12', path: 'assets/img/templates/vcard12.png', template_url: '/assets/img/templates/vcard12.png', category: 'Healthcare', status: 'published', usage: 267, created: '2025-04-01', font_family: 'Inter', primary_color: '#0EA5E9', secondary_color: '#0F172A', button_style: 'pill', logo_position: 'center', bg_style: 'solid', sections: { About: true, Contact: true, Website: true, Products: false, Rewards: false, Bookings: true, Reviews: true, 'Social Media': true, Gallery: false, Videos: false, Downloads: false, Payments: false, 'Store Links': false }, is_business: true, is_consumer: true },
  { id: '13', name: 'vcard13', path: 'assets/img/templates/vcard13.png', template_url: '/assets/img/templates/vcard13.png', category: 'Fitness', status: 'published', usage: 534, created: '2025-04-05', font_family: 'Montserrat', primary_color: '#10B981', secondary_color: '#0F172A', button_style: 'rounded', logo_position: 'center', bg_style: 'gradient', sections: { About: true, Contact: true, Website: true, Products: true, Rewards: true, Bookings: true, Reviews: true, 'Social Media': true, Gallery: true, Videos: true, Downloads: false, Payments: true, 'Store Links': false }, is_business: true, is_consumer: true },
  { id: '14', name: 'vcard14', path: 'assets/img/templates/vcard14.png', template_url: '/assets/img/templates/vcard14.png', category: 'Hotel', status: 'published', usage: 189, created: '2025-04-10', font_family: 'Playfair Display', primary_color: '#B45309', secondary_color: '#1E293B', button_style: 'pill', logo_position: 'center', bg_style: 'solid', sections: { About: true, Contact: true, Website: true, Products: true, Rewards: true, Bookings: true, Reviews: true, 'Social Media': true, Gallery: true, Videos: false, Downloads: false, Payments: false, 'Store Links': false }, is_business: true, is_consumer: false },
  { id: '15', name: 'vcard15', path: 'assets/img/templates/vcard15.png', template_url: '/assets/img/templates/vcard15.png', category: 'Events', status: 'draft', usage: 67, created: '2025-04-15', font_family: 'Space Grotesk', primary_color: '#8B5CF6', secondary_color: '#0F172A', button_style: 'square', logo_position: 'left', bg_style: 'gradient', sections: { About: true, Contact: true, Website: true, Products: false, Rewards: false, Bookings: true, Reviews: true, 'Social Media': true, Gallery: true, Videos: false, Downloads: false, Payments: true, 'Store Links': false }, is_business: true, is_consumer: false },
  { id: '16', name: 'vcard16', path: 'assets/img/templates/vcard16.png', template_url: '/assets/img/templates/vcard16.png', category: 'Photography', status: 'published', usage: 756, created: '2025-04-20', font_family: 'Lora', primary_color: '#18181B', secondary_color: '#FAFAFA', button_style: 'pill', logo_position: 'center', bg_style: 'solid', sections: { About: true, Contact: true, Website: true, Products: true, Rewards: false, Bookings: true, Reviews: true, 'Social Media': true, Gallery: true, Videos: true, Downloads: false, Payments: false, 'Store Links': false }, is_business: true, is_consumer: true },
  { id: '17', name: 'vcard17', path: 'assets/img/templates/vcard17.png', template_url: '/assets/img/templates/vcard17.png', category: 'Restaurant', status: 'published', usage: 445, created: '2025-05-01', font_family: 'DM Sans', primary_color: '#E11D48', secondary_color: '#0F172A', button_style: 'rounded', logo_position: 'center', bg_style: 'gradient', sections: { About: true, Contact: true, Website: true, Products: true, Rewards: true, Bookings: true, Reviews: true, 'Social Media': true, Gallery: true, Videos: false, Downloads: false, Payments: true, 'Store Links': false }, is_business: true, is_consumer: true },
]

export interface MockBusiness {
  id: string
  name: string
  owner: string
  owner_email: string
  email: string
  phone: string
  logo?: string
  industry: string
  plan: string
  membership: string
  status: 'verified' | 'pending' | 'suspended'
  joined: string
  website: string
  address: string
  employees: number
  description: string
  cards: number
  campaigns: number
  scans: number
  bookings: number
  nfcCards: number
  wallet: { balance: number; points: number; cashback: number }
  platforms: { name: string; connected: boolean; url: string }[]
  team: { name: string; role: string; email: string }[]
}

export const mockBusinesses: MockBusiness[] = [
  { id: '1', name: 'GreenLeaf Coffee', owner: 'Sarah Johnson', owner_email: 'sarah@greenleaf.com', email: 'info@greenleaf.coffee', phone: '+1 (555) 123-4567', industry: 'Café', plan: 'Business', membership: 'Bronze Pro', status: 'verified', joined: 'Jan 2026', website: 'https://greenleaf.coffee', address: '123 Main St, New York, NY 10001', employees: 12, description: 'Artisan coffee shop serving organic, locally-sourced beverages and fresh pastries.', cards: 12, campaigns: 3, scans: 12800, bookings: 45, nfcCards: 50, wallet: { balance: 12800, points: 45000, cashback: 3200 }, platforms: [{ name: 'Google Business', connected: true, url: 'https://google.com/greenleaf' }, { name: 'Instagram', connected: true, url: 'https://instagram.com/greenleaf' }, { name: 'Facebook', connected: false, url: '' }], team: [{ name: 'Sarah Johnson', role: 'Owner', email: 'sarah@greenleaf.com' }, { name: 'Mike Barista', role: 'Manager', email: 'mike@greenleaf.com' }] },
  { id: '2', name: 'TechVision Inc', owner: 'Mike Chen', owner_email: 'mike@techvision.io', email: 'contact@techvision.io', phone: '+1 (555) 234-5678', industry: 'Technology', plan: 'Enterprise', membership: 'Platinum Pro+', status: 'verified', joined: 'Mar 2025', website: 'https://techvision.io', address: '456 Tech Blvd, San Francisco, CA 94102', employees: 85, description: 'B2B SaaS platform for digital identity and contact management solutions.', cards: 45, campaigns: 8, scans: 45200, bookings: 120, nfcCards: 200, wallet: { balance: 89200, points: 120000, cashback: 15600 }, platforms: [{ name: 'LinkedIn', connected: true, url: 'https://linkedin.com/company/techvision' }, { name: 'Twitter', connected: true, url: 'https://twitter.com/techvision' }, { name: 'Crunchbase', connected: true, url: 'https://crunchbase.com/techvision' }], team: [{ name: 'Mike Chen', role: 'CEO', email: 'mike@techvision.io' }, { name: 'Lisa Wang', role: 'CTO', email: 'lisa@techvision.io' }, { name: 'James Park', role: 'Marketing', email: 'james@techvision.io' }] },
  { id: '3', name: 'Pizza Roma', owner: 'Luigi Rossi', owner_email: 'luigi@pizzaroma.com', email: 'order@pizzaroma.com', phone: '+1 (555) 345-6789', industry: 'Restaurant', plan: 'Starter', membership: 'Bronze Standard', status: 'verified', joined: 'Jun 2026', website: 'https://pizzaroma.com', address: '789 Oak Ave, Chicago, IL 60601', employees: 8, description: 'Authentic Italian pizzeria serving wood-fired Neapolitan pizza since 2019.', cards: 6, campaigns: 1, scans: 3800, bookings: 89, nfcCards: 0, wallet: { balance: 3400, points: 12000, cashback: 800 }, platforms: [{ name: 'Google Business', connected: true, url: 'https://google.com/pizzaroma' }, { name: 'Instagram', connected: true, url: 'https://instagram.com/pizzaroma' }, { name: 'Uber Eats', connected: true, url: 'https://ubereats.com/pizzaroma' }], team: [{ name: 'Luigi Rossi', role: 'Owner', email: 'luigi@pizzaroma.com' }, { name: 'Marco Rossi', role: 'Chef', email: 'marco@pizzaroma.com' }] },
  { id: '4', name: 'FitLife Studio', owner: 'Emma Wilson', owner_email: 'emma@fitlife.com', email: 'info@fitlife.com', phone: '+1 (555) 456-7890', industry: 'Fitness', plan: 'Business', membership: 'Silver Pro', status: 'verified', joined: 'Feb 2026', website: 'https://fitlife.studio', address: '321 Fitness Way, Austin, TX 73301', employees: 22, description: 'Premium fitness studio offering yoga, HIIT, and personal training sessions.', cards: 18, campaigns: 4, scans: 18400, bookings: 320, nfcCards: 100, wallet: { balance: 25600, points: 78000, cashback: 5100 }, platforms: [{ name: 'Instagram', connected: true, url: 'https://instagram.com/fitlife' }, { name: 'MindBody', connected: true, url: 'https://mindbody.com/fitlife' }, { name: 'Facebook', connected: true, url: 'https://facebook.com/fitlife' }], team: [{ name: 'Emma Wilson', role: 'Owner', email: 'emma@fitlife.com' }, { name: 'Tom Trainer', role: 'Head Coach', email: 'tom@fitlife.com' }, { name: 'Amy Yoga', role: 'Instructor', email: 'amy@fitlife.com' }] },
  { id: '5', name: 'Bloom Beauty Salon', owner: 'Anna Garcia', owner_email: 'anna@bloomsalon.com', email: 'book@bloomsalon.com', phone: '+1 (555) 567-8901', industry: 'Beauty', plan: 'Starter', membership: 'Bronze Standard', status: 'pending', joined: 'Jul 2026', website: 'https://bloomsalon.com', address: '555 Pine St, Miami, FL 33101', employees: 6, description: 'Full-service beauty salon specializing in haircuts, coloring, and skincare treatments.', cards: 8, campaigns: 0, scans: 2100, bookings: 56, nfcCards: 0, wallet: { balance: 1200, points: 4500, cashback: 300 }, platforms: [{ name: 'Instagram', connected: true, url: 'https://instagram.com/bloomsalon' }, { name: 'Facebook', connected: false, url: '' }], team: [{ name: 'Anna Garcia', role: 'Owner', email: 'anna@bloomsalon.com' }, { name: 'Sophie Hair', role: 'Stylist', email: 'sophie@bloomsalon.com' }] },
  { id: '6', name: 'Swift Legal LLP', owner: 'David Brown', owner_email: 'david@swiftlegal.com', email: 'info@swiftlegal.com', phone: '+1 (555) 678-9012', industry: 'Legal', plan: 'Enterprise', membership: 'Platinum Pro', status: 'verified', joined: 'Sep 2025', website: 'https://swiftlegal.com', address: '100 Law St, Boston, MA 02108', employees: 34, description: 'Full-service law firm specializing in corporate law, intellectual property, and litigation.', cards: 28, campaigns: 2, scans: 9600, bookings: 78, nfcCards: 150, wallet: { balance: 45300, points: 92000, cashback: 8700 }, platforms: [{ name: 'LinkedIn', connected: true, url: 'https://linkedin.com/company/swiftlegal' }, { name: 'Google Business', connected: true, url: 'https://google.com/swiftlegal' }, { name: 'Avvo', connected: true, url: 'https://avvo.com/swiftlegal' }], team: [{ name: 'David Brown', role: 'Partner', email: 'david@swiftlegal.com' }, { name: 'Jane Grey', role: 'Associate', email: 'jane@swiftlegal.com' }, { name: 'Mark Stone', role: 'Paralegal', email: 'mark@swiftlegal.com' }] },
  { id: '7', name: 'Coastal Realty', owner: 'Lisa Anderson', owner_email: 'lisa@coastalrealty.com', email: 'info@coastalrealty.com', phone: '+1 (555) 789-0123', industry: 'Real Estate', plan: 'Business', membership: 'Gold Pro+', status: 'verified', joined: 'Apr 2026', website: 'https://coastalrealty.com', address: '888 Harbor Dr, Seattle, WA 98101', employees: 18, description: 'Premier real estate agency specializing in luxury waterfront properties.', cards: 15, campaigns: 5, scans: 15200, bookings: 134, nfcCards: 75, wallet: { balance: 18900, points: 56000, cashback: 4200 }, platforms: [{ name: 'Zillow', connected: true, url: 'https://zillow.com/coastalrealty' }, { name: 'Instagram', connected: true, url: 'https://instagram.com/coastalrealty' }, { name: 'Facebook', connected: true, url: 'https://facebook.com/coastalrealty' }], team: [{ name: 'Lisa Anderson', role: 'Broker', email: 'lisa@coastalrealty.com' }, { name: 'Tom Waters', role: 'Agent', email: 'tom@coastalrealty.com' }] },
  { id: '8', name: 'Fresh Market Grocery', owner: 'James Taylor', owner_email: 'james@freshmarket.com', email: 'contact@freshmarket.com', phone: '+1 (555) 890-1234', industry: 'Retail', plan: 'Free', membership: 'Bronze Standard', status: 'suspended', joined: 'Nov 2025', website: 'https://freshmarket.com', address: '222 Market Sq, Denver, CO 80202', employees: 45, description: 'Neighborhood grocery store with organic produce and local artisan goods.', cards: 3, campaigns: 0, scans: 8900, bookings: 0, nfcCards: 0, wallet: { balance: 0, points: 2800, cashback: 0 }, platforms: [{ name: 'Google Business', connected: true, url: 'https://google.com/freshmarket' }], team: [{ name: 'James Taylor', role: 'Owner', email: 'james@freshmarket.com' }, { name: 'Nina Checkout', role: 'Manager', email: 'nina@freshmarket.com' }] },
  { id: '9', name: 'Peak Performance Coaching', owner: 'Chris Evans', owner_email: 'chris@peakperf.com', email: 'hello@peakperf.com', phone: '+1 (555) 901-2345', industry: 'Coach', plan: 'Starter', membership: 'Silver Standard', status: 'pending', joined: 'Aug 2026', website: 'https://peakperf.com', address: '444 Growth Rd, Portland, OR 97201', employees: 3, description: 'Executive coaching and leadership development programs for professionals.', cards: 5, campaigns: 1, scans: 1400, bookings: 23, nfcCards: 0, wallet: { balance: 800, points: 3200, cashback: 100 }, platforms: [{ name: 'LinkedIn', connected: true, url: 'https://linkedin.com/in/chrisevans' }], team: [{ name: 'Chris Evans', role: 'Founder', email: 'chris@peakperf.com' }] },
  { id: '10', name: 'Hotel Splendido', owner: 'Maria Rossi', owner_email: 'maria@splendido.com', email: 'reservations@splendido.com', phone: '+1 (555) 012-3456', industry: 'Hotel', plan: 'Enterprise', membership: 'Platinum Standard', status: 'verified', joined: 'Oct 2025', website: 'https://hotelsplendido.com', address: '1 Grand Blvd, Las Vegas, NV 89101', employees: 120, description: 'Luxury boutique hotel with world-class dining, spa, and event spaces.', cards: 32, campaigns: 6, scans: 32100, bookings: 890, nfcCards: 300, wallet: { balance: 67500, points: 180000, cashback: 12400 }, platforms: [{ name: 'Google Business', connected: true, url: 'https://google.com/splendido' }, { name: 'Instagram', connected: true, url: 'https://instagram.com/splendido' }, { name: 'TripAdvisor', connected: true, url: 'https://tripadvisor.com/splendido' }, { name: 'Booking.com', connected: true, url: 'https://booking.com/splendido' }], team: [{ name: 'Maria Rossi', role: 'Owner', email: 'maria@splendido.com' }, { name: 'Pierre Concierge', role: 'Manager', email: 'pierre@splendido.com' }] },
  { id: '11', name: 'Dr. Smith Dentistry', owner: 'Michael Smith', owner_email: 'dr.smith@smiledental.com', email: 'appt@smiledental.com', phone: '+1 (555) 111-2222', industry: 'Healthcare', plan: 'Business', membership: 'Silver Standard', status: 'verified', joined: 'May 2026', website: 'https://smiledental.com', address: '77 Health Way, Dallas, TX 75201', employees: 15, description: 'Family dentistry practice offering general and cosmetic dental services.', cards: 9, campaigns: 2, scans: 6700, bookings: 156, nfcCards: 40, wallet: { balance: 9800, points: 31000, cashback: 2100 }, platforms: [{ name: 'Google Business', connected: true, url: 'https://google.com/smiledental' }, { name: 'Healthgrades', connected: true, url: 'https://healthgrades.com/smiledental' }], team: [{ name: 'Michael Smith', role: 'Dentist', email: 'dr.smith@smiledental.com' }, { name: 'Linda Hygienist', role: 'Hygienist', email: 'linda@smiledental.com' }] },
  { id: '12', name: 'Elite Barber Co', owner: 'Tyrone Johnson', owner_email: 'tyrone@elitebarber.com', email: 'book@elitebarber.com', phone: '+1 (555) 222-3333', industry: 'Barber', plan: 'Starter', membership: 'Bronze Pro+', status: 'verified', joined: 'Mar 2026', website: 'https://elitebarber.com', address: '55 Cuts Ln, Atlanta, GA 30301', employees: 5, description: 'Premium barbershop offering classic cuts, hot towel shaves, and beard grooming.', cards: 7, campaigns: 2, scans: 5200, bookings: 210, nfcCards: 25, wallet: { balance: 4600, points: 15000, cashback: 900 }, platforms: [{ name: 'Instagram', connected: true, url: 'https://instagram.com/elitebarber' }, { name: 'Google Business', connected: true, url: 'https://google.com/elitebarber' }], team: [{ name: 'Tyrone Johnson', role: 'Owner', email: 'tyrone@elitebarber.com' }, { name: 'Carlos Cuts', role: 'Barber', email: 'carlos@elitebarber.com' }] },
]

export interface MockConsumer {
  id: string
  name: string
  email: string
  phone: string
  location: string
  status: 'active' | 'inactive' | 'suspended'
  joined: string
  consumerId: string
  centralUserId: string
  membership: string
  membershipStatus: string
  vcardStatus: string
  cardStatus: string
  additionalEntitlements: number
  allocatedAdditionalCards: number
  familyAllocations: number
  friendAllocations: number
  unallocatedEntitlements: number
  primaryIssuingBusiness: string
  primaryIssuingBusinessId: number
  businessCount: number
  registrationSource: string
  lastActivityAt: string
  allocationType: string
  wallet: { balance: number; points: number; cashback: number; giftCards: number; coupons: number; vouchers: number; pending?: number; locked?: number }
  cardBalance?: number
  stats: { cards: number; rewards: number; referrals: number; scans: number }
  savedCards: { id: string; name: string; business: string; type: string; source?: string; editable?: boolean }[]
  rewardHistory: { id: string; reward: string; points: number; date: string; status: string }[]
  referrals: { name: string; email: string; joined: string; reward: string }[]
  recentActivity: { action: string; time: string; type: string; status?: string; value?: string; source?: string; detailTo?: string }[]
  cardId: string
  cardTemplate: string
  cardCreated: string
  cardUpdated: string
  cardSource: string
  cardAcquisitionMethod: string
  cardSourcePlatform: string
  qrStatus: string
  qrId: string
  qrLastScanned: string
  qrUpdateFrequency: string
  qrLastContentUpdate: string
  eCardStatus: string
  eCardFaceValue: string
  eCardSource: string
  eCardId: string
  eCardIssueDate: string
  eCardExpiryDate: string
  additionalCards: { id: string; name: string; relationship: string; status: string; locked: boolean; allocatedAt: string }[]
  shareContent: { id: string; title: string; source: string; status: string; availableUntil: string }[]
  cardActivity: { action: string; time: string; type: string; actor: string; source: string; status: string }[]
  membershipHistory?: { state: string; date: string }[]
}

export const mockConsumers: MockConsumer[] = [
  {
    id: '1', name: 'James Anderson', email: 'james.a@email.com', phone: '+44 7700 900123', location: 'London, UK', status: 'active', joined: 'Jan 2026',
    consumerId: 'MC-CNS-000001',
    centralUserId: 'MCOM-U-000001',
    membership: 'Bronze Pro',
    membershipStatus: 'Active',
    vcardStatus: 'Active',
    cardStatus: 'Active',
    additionalEntitlements: 4,
    allocatedAdditionalCards: 2,
    familyAllocations: 4,
    friendAllocations: 0,
    unallocatedEntitlements: 2,
    primaryIssuingBusiness: 'GreenLeaf Coffee',
    primaryIssuingBusinessId: 1,
    businessCount: 3,
    registrationSource: 'Business',
    lastActivityAt: '5 min ago',
    allocationType: 'Family',
    wallet: { balance: 45, points: 120, cashback: 18, giftCards: 1, coupons: 2, vouchers: 2, pending: 5, locked: 0 }, cardBalance: 45, stats: { cards: 4, rewards: 6, referrals: 2, scans: 180 },
    savedCards: [{ id: '1', name: "James' Card", business: 'GreenLeaf Coffee', type: 'Loyalty', source: 'Issuing Business', editable: true }, { id: '2', name: 'FitLife Pass', business: 'FitLife Studio', type: 'Membership', source: 'MCOMVCard', editable: true }, { id: '3', name: 'Bloom Beauty', business: 'Bloom Beauty Salon', type: 'Rewards', source: 'Referral', editable: false }],
    rewardHistory: [{ id: '1', reward: 'Free Coffee', points: 200, date: '2026-06-10', status: 'redeemed' }, { id: '2', reward: '10% Discount', points: 500, date: '2026-06-01', status: 'redeemed' }, { id: '3', reward: 'Birthday Bonus', points: 1000, date: '2026-05-15', status: 'available' }, { id: '4', reward: 'Cashback £5', points: 750, date: '2026-05-01', status: 'available' }, { id: '5', reward: 'Free Session', points: 1500, date: '2026-04-20', status: 'expired' }],
    referrals: [{ name: 'Tom Wilson', email: 'tom.w@email.com', joined: 'Mar 2026', reward: '200 pts' }, { name: 'Nina Diaz', email: 'nina.d@email.com', joined: 'May 2026', reward: '200 pts' }],
    recentActivity: [{ action: 'Shared card via WhatsApp', time: '5 min ago', type: 'referral', status: 'Completed', detailTo: '/c/cards' }, { action: 'Opened your VCard from a shared link', time: '30 min ago', type: 'vcard', status: 'Completed', source: 'MCOMVCard', detailTo: '/c/vcard' }, { action: 'Received £2 cashback from GreenLeaf Coffee', time: '2 hours ago', type: 'earn', status: 'Completed', value: '+£2.00', source: 'GreenLeaf Coffee' }, { action: 'Wallet funded with £10.00', time: '5 hours ago', type: 'funding', status: 'Completed', value: '+£10.00', source: 'Stripe', detailTo: '/c/wallet' }, { action: 'Redeemed "Free Coffee" voucher', time: '1 day ago', type: 'reward', status: 'Completed', value: '−200 pts', source: 'GreenLeaf Coffee', detailTo: '/c/rewards' }, { action: 'Exchanged a coupon at FitLife Studio', time: '2 days ago', type: 'exchange', status: 'Completed', value: '1 coupon', source: 'FitLife Studio' }, { action: 'Family card updated for Sarah Anderson', time: '3 days ago', type: 'family', status: 'Completed', source: 'Family', detailTo: '/c/family' }, { action: 'Completed NFC tap at GreenLeaf Coffee', time: '4 days ago', type: 'nfc', status: 'Completed', source: 'GreenLeaf Coffee' }, { action: 'Membership tier reviewed — Bronze Pro', time: '5 days ago', type: 'membership', status: 'Completed', source: 'MCOMVCard', detailTo: '/c/membership' }, { action: 'Joined Summer Savings campaign', time: '6 days ago', type: 'campaign', status: 'Active', value: '+50 pts', source: 'GreenLeaf Coffee' }],
    cardId: 'CARD-CNS-000001', cardTemplate: 'Consumer Card — Bronze Pro', cardCreated: 'Jan 2026', cardUpdated: '28 Jul 2026',
    cardSource: 'Business Reward', cardAcquisitionMethod: 'Points Redemption', cardSourcePlatform: '',
    qrStatus: 'Active', qrId: 'QR-000001', qrLastScanned: '1 hour ago', qrUpdateFrequency: 'Weekly', qrLastContentUpdate: '22 Jul 2026',
    eCardStatus: 'Available', eCardFaceValue: '£2.00', eCardSource: 'Business Reward', eCardId: 'EC-000001', eCardIssueDate: '15 Jul 2026', eCardExpiryDate: '15 Jan 2027',
    additionalCards: [
      { id: '1', name: 'Sarah Anderson', relationship: 'Wife', status: 'Active', locked: true, allocatedAt: 'Feb 2026' },
      { id: '2', name: 'David Anderson', relationship: 'Son', status: 'Active', locked: true, allocatedAt: 'Feb 2026' },
    ],
    shareContent: [
      { id: '1', title: 'Summer High Street Event', source: 'External Platform', status: 'Active', availableUntil: '31 Aug 2026' },
      { id: '2', title: 'GreenLeaf Coffee Offer', source: 'Issuing Business', status: 'Active', availableUntil: '15 Sep 2026' },
    ],
    cardActivity: [
      { action: 'Card issued', time: 'Jan 2026', type: 'card', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Card activated', time: 'Jan 2026', type: 'card', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
      { action: 'QR scanned at GreenLeaf Coffee', time: '1 hour ago', type: 'nfc', actor: 'James Anderson', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Card shared via WhatsApp', time: '5 min ago', type: 'referral', actor: 'James Anderson', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Additional Card 1 allocated to Sarah', time: 'Feb 2026', type: 'card', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Additional Card 2 allocated to David', time: 'Feb 2026', type: 'card', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
      { action: 'E-card issued', time: '15 Jul 2026', type: 'reward', actor: 'System', source: 'MCOM Rewards', status: 'Pending' },
      { action: 'Card template updated to Bronze Pro', time: '20 Jul 2026', type: 'card', actor: 'Admin', source: 'MCOMVCard', status: 'Successful' },
    ],
    membershipHistory: [
      { state: 'Bronze Standard', date: 'Jan 2026' },
      { state: 'Bronze Pro', date: 'Mar 2026' },
    ]
  },
  {
    id: '2', name: 'James Chen', email: 'james.c@email.com', phone: '+1 (555) 222-3333', location: 'San Francisco, CA', status: 'active', joined: 'Mar 2025',
    consumerId: 'MC-CNS-000002',
    centralUserId: 'MCOM-U-000002',
    membership: 'Gold Pro',
    membershipStatus: 'Active',
    vcardStatus: 'Active',
    cardStatus: 'Active',
    additionalEntitlements: 5,
    allocatedAdditionalCards: 4,
    familyAllocations: 3,
    friendAllocations: 1,
    unallocatedEntitlements: 1,
    primaryIssuingBusiness: 'TechVision Inc',
    primaryIssuingBusinessId: 2,
    businessCount: 5,
    registrationSource: 'MCOM Solutions',
    lastActivityAt: '30 min ago',
    allocationType: 'Mixed Family & Friends',
    wallet: { balance: 3420, points: 12000, cashback: 890, giftCards: 5, coupons: 3, vouchers: 1 }, stats: { cards: 7, rewards: 12, referrals: 5, scans: 520 },
    savedCards: [{ id: '4', name: "James' Card", business: 'TechVision Inc', type: 'Business' }, { id: '5', name: 'Swift Legal', business: 'Swift Legal LLP', type: 'Business' }, { id: '6', name: 'Coastal Realty', business: 'Coastal Realty', type: 'Business' }, { id: '7', name: 'Hotel Splendido', business: 'Hotel Splendido', type: 'Membership' }, { id: '8', name: 'Elite Barber', business: 'Elite Barber Co', type: 'Loyalty' }, { id: '9', name: 'Dr. Smith Dental', business: 'Dr. Smith Dentistry', type: 'Appointment' }, { id: '10', name: 'Peak Performance', business: 'Peak Performance Coaching', type: 'Business' }],
    rewardHistory: [{ id: '6', reward: 'Premium Upgrade', points: 5000, date: '2026-06-12', status: 'redeemed' }, { id: '7', reward: 'Cashback $20', points: 2000, date: '2026-06-05', status: 'redeemed' }, { id: '8', reward: 'Free Consultation', points: 1000, date: '2026-05-28', status: 'available' }, { id: '9', reward: 'VIP Access', points: 8000, date: '2026-05-15', status: 'available' }, { id: '10', reward: 'Gift Card $50', points: 5000, date: '2026-04-30', status: 'available' }, { id: '11', reward: '10% Cashback', points: 1500, date: '2026-04-10', status: 'expired' }, { id: '12', reward: 'Free Night Stay', points: 10000, date: '2026-03-20', status: 'redeemed' }],
    referrals: [{ name: 'Alice Wang', email: 'alice.w@email.com', joined: 'May 2025', reward: '200 pts' }, { name: 'Bob Kim', email: 'bob.k@email.com', joined: 'Aug 2025', reward: '200 pts' }, { name: 'Carol Lee', email: 'carol.l@email.com', joined: 'Dec 2025', reward: '200 pts' }, { name: 'Dan Brown', email: 'dan.b@email.com', joined: 'Feb 2026', reward: '200 pts' }, { name: 'Eve Taylor', email: 'eve.t@email.com', joined: 'Apr 2026', reward: '200 pts' }],
    recentActivity: [{ action: 'Earned 100 points from TechVision check-in', time: '30 min ago', type: 'earn' }, { action: 'Redeemed "Premium Upgrade" (-5000 pts)', time: '2 hours ago', type: 'reward' }, { action: 'Referred friend - Eve Taylor joined', time: '1 day ago', type: 'referral' }, { action: 'Added card "Elite Barber Co"', time: '3 days ago', type: 'card' }, { action: 'NFC tap at Hotel Splendido', time: '5 days ago', type: 'nfc' }],
    cardId: 'CARD-CNS-000002', cardTemplate: 'Consumer Card — Premium', cardCreated: 'Mar 2025', cardUpdated: '28 Jul 2026',
    cardSource: 'MCOM Solutions', cardAcquisitionMethod: 'Direct Registration', cardSourcePlatform: 'MCOM Solutions',
    qrStatus: 'Active', qrId: 'QR-000002', qrLastScanned: '30 min ago', qrUpdateFrequency: 'Daily', qrLastContentUpdate: '28 Jul 2026',
    eCardStatus: 'Available', eCardFaceValue: '£5.00', eCardSource: 'Membership', eCardId: 'EC-000002', eCardIssueDate: '20 Jun 2026', eCardExpiryDate: '20 Dec 2026',
    additionalCards: [
      { id: '3', name: 'Alice Chen', relationship: 'Family', status: 'Active', locked: true, allocatedAt: 'Apr 2025' },
      { id: '4', name: 'Bob Chen', relationship: 'Family', status: 'Active', locked: true, allocatedAt: 'Apr 2025' },
      { id: '5', name: 'Carol Chen', relationship: 'Family', status: 'Active', locked: true, allocatedAt: 'May 2025' },
      { id: '6', name: 'Dan Friend', relationship: 'Friend', status: 'Active', locked: true, allocatedAt: 'Jun 2025' },
    ],
    shareContent: [
      { id: '3', title: 'TechVision Product Launch', source: 'Issuing Business', status: 'Active', availableUntil: '15 Aug 2026' },
      { id: '4', title: 'High Street Summer Festival', source: 'External Platform', status: 'Coming Soon', availableUntil: '–' },
    ],
    cardActivity: [
      { action: 'Card issued', time: 'Mar 2025', type: 'card', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Card activated', time: 'Mar 2025', type: 'card', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
      { action: 'QR scanned at Hotel Splendido', time: '30 min ago', type: 'nfc', actor: 'James Chen', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Card shared via email', time: '2 days ago', type: 'referral', actor: 'James Chen', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Additional Card 3 allocated', time: 'Apr 2025', type: 'card', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
      { action: 'E-card issued', time: '20 Jun 2026', type: 'reward', actor: 'System', source: 'MCOM Rewards', status: 'Successful' },
      { action: 'Card template updated', time: '15 Jun 2026', type: 'card', actor: 'Admin', source: 'MCOMVCard', status: 'Successful' },
    ]
  },
  {
    id: '3', name: 'Sarah Wilson', email: 'sarah.w@email.com', phone: '+1 (555) 333-4444', location: 'Chicago, IL', status: 'active', joined: 'Jun 2026',
    consumerId: 'MC-CNS-000003',
    centralUserId: 'MCOM-U-000003',
    membership: 'Bronze',
    membershipStatus: 'Active',
    vcardStatus: 'Active',
    cardStatus: 'Not Assigned',
    additionalEntitlements: 1,
    allocatedAdditionalCards: 0,
    familyAllocations: 0,
    friendAllocations: 0,
    unallocatedEntitlements: 1,
    primaryIssuingBusiness: 'Pizza Roma',
    primaryIssuingBusinessId: 3,
    businessCount: 1,
    registrationSource: 'Campaign',
    lastActivityAt: '1 week ago',
    allocationType: 'Unallocated',
    wallet: { balance: 560, points: 1800, cashback: 90, giftCards: 0, coupons: 0, vouchers: 0 }, stats: { cards: 1, rewards: 2, referrals: 0, scans: 45 },
    savedCards: [{ id: '11', name: "Sarah's Card", business: 'Pizza Roma', type: 'Loyalty' }],
    rewardHistory: [{ id: '13', reward: 'Free Dessert', points: 300, date: '2026-06-08', status: 'available' }, { id: '14', reward: '10% Off', points: 500, date: '2026-06-01', status: 'available' }],
    referrals: [],
    recentActivity: [{ action: 'Signed up for Pizza Roma loyalty', time: '1 week ago', type: 'card' }, { action: 'Earned 50 points from first purchase', time: '1 week ago', type: 'earn' }],
    cardId: '', cardTemplate: '', cardCreated: '', cardUpdated: '',
    cardSource: '', cardAcquisitionMethod: '', cardSourcePlatform: '',
    qrStatus: 'Inactive', qrId: '', qrLastScanned: '', qrUpdateFrequency: '', qrLastContentUpdate: '',
    eCardStatus: 'Not Available', eCardFaceValue: '', eCardSource: '', eCardId: '', eCardIssueDate: '', eCardExpiryDate: '',
    additionalCards: [],
    shareContent: [],
    cardActivity: []
  },
  {
    id: '4', name: 'Mike Patel', email: 'mike.p@email.com', phone: '+1 (555) 987-6543', location: 'Brooklyn, NY', status: 'active', joined: 'Feb 2026',
    consumerId: 'MC-CNS-000004',
    centralUserId: 'MCOM-U-000004',
    membership: 'Silver Pro',
    membershipStatus: 'Active',
    vcardStatus: 'Active',
    cardStatus: 'Active',
    additionalEntitlements: 3,
    allocatedAdditionalCards: 3,
    familyAllocations: 2,
    friendAllocations: 1,
    unallocatedEntitlements: 0,
    primaryIssuingBusiness: 'GreenLeaf Coffee',
    primaryIssuingBusinessId: 1,
    businessCount: 4,
    registrationSource: 'Business',
    lastActivityAt: '2 hours ago',
    allocationType: 'Mixed Family & Friends',
    wallet: { balance: 8900, points: 25000, cashback: 1200, giftCards: 3, coupons: 4, vouchers: 2 }, stats: { cards: 4, rewards: 8, referrals: 3, scans: 340 },
    savedCards: [{ id: '12', name: "Mike's Gold", business: 'GreenLeaf Coffee', type: 'Loyalty' }, { id: '13', name: 'FitLife Pro', business: 'FitLife Studio', type: 'Membership' }, { id: '14', name: 'Coastal Card', business: 'Coastal Realty', type: 'Business' }, { id: '15', name: 'Swift Connect', business: 'Swift Legal LLP', type: 'Business' }],
    rewardHistory: [{ id: '15', reward: 'Free Month', points: 3000, date: '2026-06-10', status: 'redeemed' }, { id: '16', reward: 'Cashback $10', points: 1000, date: '2026-06-01', status: 'redeemed' }, { id: '17', reward: 'Gift Card $25', points: 2500, date: '2026-05-20', status: 'available' }, { id: '18', reward: 'Premium Access', points: 5000, date: '2026-05-05', status: 'available' }, { id: '19', reward: '20% Discount', points: 2000, date: '2026-04-15', status: 'available' }, { id: '20', reward: 'Free Smoothie', points: 400, date: '2026-04-01', status: 'expired' }, { id: '21', reward: 'Birthday Bonus', points: 1000, date: '2026-03-15', status: 'redeemed' }, { id: '22', reward: 'Free Session', points: 1500, date: '2026-03-01', status: 'expired' }],
    referrals: [{ name: 'Raj Patel', email: 'raj.p@email.com', joined: 'Mar 2026', reward: '200 pts' }, { name: 'Priya Singh', email: 'priya.s@email.com', joined: 'Apr 2026', reward: '200 pts' }, { name: 'Kevin Lee', email: 'kevin.l@email.com', joined: 'May 2026', reward: '200 pts' }],
    recentActivity: [{ action: 'Redeemed "Free Month" at FitLife Studio', time: '2 hours ago', type: 'reward' }, { action: 'Earned 80 points from GreenLeaf Coffee', time: '5 hours ago', type: 'earn' }, { action: 'Referred friend - Kevin Lee joined', time: '1 day ago', type: 'referral' }, { action: 'Added card "Swift Connect"', time: '2 days ago', type: 'card' }, { action: 'NFC tap at Coastal Realty open house', time: '4 days ago', type: 'nfc' }],
    cardId: 'CARD-CNS-000004', cardTemplate: 'Consumer Card — Standard', cardCreated: 'Feb 2026', cardUpdated: '27 Jul 2026',
    cardSource: 'Business Reward', cardAcquisitionMethod: 'Points Redemption', cardSourcePlatform: '',
    qrStatus: 'Active', qrId: 'QR-000004', qrLastScanned: '2 hours ago', qrUpdateFrequency: 'Daily', qrLastContentUpdate: '27 Jul 2026',
    eCardStatus: 'Redeemed', eCardFaceValue: '£2.00', eCardSource: 'Business Reward', eCardId: 'EC-000004', eCardIssueDate: '1 Mar 2026', eCardExpiryDate: '1 Sep 2026',
    additionalCards: [
      { id: '7', name: 'Priya Patel', relationship: 'Family', status: 'Active', locked: true, allocatedAt: 'Mar 2026' },
      { id: '8', name: 'Raj Patel Jr', relationship: 'Family', status: 'Active', locked: true, allocatedAt: 'Mar 2026' },
      { id: '9', name: 'Kevin Lee', relationship: 'Friend', status: 'Active', locked: true, allocatedAt: 'May 2026' },
    ],
    shareContent: [
      { id: '5', title: 'GreenLeaf Summer Special', source: 'Issuing Business', status: 'Active', availableUntil: '31 Aug 2026' },
      { id: '6', title: 'FitLife Referral Bonus', source: 'Issuing Business', status: 'Active', availableUntil: '15 Aug 2026' },
    ],
    cardActivity: [
      { action: 'Card issued', time: 'Feb 2026', type: 'card', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Card activated', time: 'Feb 2026', type: 'card', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
      { action: 'QR scanned at GreenLeaf Coffee', time: '5 hours ago', type: 'nfc', actor: 'Mike Patel', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Additional Card 1 allocated', time: 'Mar 2026', type: 'card', actor: 'Mike Patel', source: 'MCOMVCard', status: 'Successful' },
      { action: 'E-card redeemed at FitLife Studio', time: '10 Jun 2026', type: 'reward', actor: 'Mike Patel', source: 'MCOM Rewards', status: 'Successful' },
    ]
  },
  {
    id: '5', name: 'Lisa Thompson', email: 'lisa.t@email.com', phone: '+1 (555) 444-5555', location: 'Denver, CO', status: 'inactive', joined: 'Apr 2026',
    consumerId: 'MC-CNS-000005',
    centralUserId: 'MCOM-U-000005',
    membership: 'Bronze',
    membershipStatus: 'Pending',
    vcardStatus: 'Not Assigned',
    cardStatus: 'Not Assigned',
    additionalEntitlements: 1,
    allocatedAdditionalCards: 0,
    familyAllocations: 0,
    friendAllocations: 0,
    unallocatedEntitlements: 1,
    primaryIssuingBusiness: 'Fresh Market Grocery',
    primaryIssuingBusinessId: 13,
    businessCount: 1,
    registrationSource: 'Reward',
    lastActivityAt: 'Apr 2026',
    allocationType: 'Unallocated',
    wallet: { balance: 0, points: 200, cashback: 0, giftCards: 0, coupons: 0, vouchers: 0 }, stats: { cards: 1, rewards: 0, referrals: 0, scans: 12 },
    savedCards: [{ id: '16', name: "Lisa's Card", business: 'Fresh Market Grocery', type: 'Loyalty' }],
    rewardHistory: [],
    referrals: [],
    recentActivity: [{ action: 'Account created', time: 'Apr 2026', type: 'profile' }],
    cardId: '', cardTemplate: '', cardCreated: '', cardUpdated: '',
    cardSource: '', cardAcquisitionMethod: '', cardSourcePlatform: '',
    qrStatus: 'Inactive', qrId: '', qrLastScanned: '', qrUpdateFrequency: '', qrLastContentUpdate: '',
    eCardStatus: 'Not Available', eCardFaceValue: '', eCardSource: '', eCardId: '', eCardIssueDate: '', eCardExpiryDate: '',
    additionalCards: [],
    shareContent: [],
    cardActivity: []
  },
  {
    id: '6', name: 'David Kim', email: 'david.k@email.com', phone: '+1 (555) 555-6666', location: 'Seattle, WA', status: 'active', joined: 'Oct 2025',
    consumerId: 'MC-CNS-000006',
    centralUserId: 'MCOM-U-000006',
    membership: 'Bronze Pro',
    membershipStatus: 'Active',
    vcardStatus: 'Active',
    cardStatus: 'Active',
    additionalEntitlements: 2,
    allocatedAdditionalCards: 1,
    familyAllocations: 1,
    friendAllocations: 0,
    unallocatedEntitlements: 1,
    primaryIssuingBusiness: 'Coastal Realty',
    primaryIssuingBusinessId: 5,
    businessCount: 2,
    registrationSource: 'MCOM Solutions',
    lastActivityAt: '1 day ago',
    allocationType: 'Family',
    wallet: { balance: 2100, points: 8000, cashback: 450, giftCards: 1, coupons: 2, vouchers: 0 }, stats: { cards: 2, rewards: 3, referrals: 1, scans: 210 },
    savedCards: [{ id: '17', name: "David's Card", business: 'Coastal Realty', type: 'Business' }, { id: '18', name: 'TechVision', business: 'TechVision Inc', type: 'Business' }],
    rewardHistory: [{ id: '23', reward: 'Cashback $5', points: 500, date: '2026-05-20', status: 'redeemed' }, { id: '24', reward: 'Free Consultation', points: 1000, date: '2026-05-01', status: 'available' }, { id: '25', reward: '10% Discount', points: 750, date: '2026-04-10', status: 'expired' }],
    referrals: [{ name: 'Susan Park', email: 'susan.p@email.com', joined: 'Jan 2026', reward: '200 pts' }],
    recentActivity: [{ action: 'Earned 30 points from Coastal Realty visit', time: '1 day ago', type: 'earn' }, { action: 'Redeemed "Cashback $5"', time: '1 week ago', type: 'reward' }, { action: 'NFC tap at TechVision Expo', time: '1 week ago', type: 'nfc' }],
    cardId: 'CARD-CNS-000006', cardTemplate: 'Consumer Card — Standard', cardCreated: 'Oct 2025', cardUpdated: '27 Jul 2026',
    cardSource: 'MCOM Solutions', cardAcquisitionMethod: 'Direct Registration', cardSourcePlatform: 'MCOM Solutions',
    qrStatus: 'Active', qrId: 'QR-000006', qrLastScanned: '1 day ago', qrUpdateFrequency: 'Weekly', qrLastContentUpdate: '20 Jul 2026',
    eCardStatus: 'Available', eCardFaceValue: '£2.00', eCardSource: 'Membership', eCardId: 'EC-000006', eCardIssueDate: '1 Nov 2025', eCardExpiryDate: '1 May 2026',
    additionalCards: [
      { id: '10', name: 'Susan Park', relationship: 'Family', status: 'Active', locked: true, allocatedAt: 'Jan 2026' },
    ],
    shareContent: [
      { id: '7', title: 'Coastal Realty Open House', source: 'Issuing Business', status: 'Active', availableUntil: '15 Aug 2026' },
    ],
    cardActivity: [
      { action: 'Card issued', time: 'Oct 2025', type: 'card', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Card activated', time: 'Oct 2025', type: 'card', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
      { action: 'QR scanned at Coastal Realty', time: '1 day ago', type: 'nfc', actor: 'David Kim', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Additional Card 1 allocated', time: 'Jan 2026', type: 'card', actor: 'David Kim', source: 'MCOMVCard', status: 'Successful' },
    ]
  },
  {
    id: '7', name: 'Anna Martinez', email: 'anna.m@email.com', phone: '+1 (555) 666-7777', location: 'Miami, FL', status: 'active', joined: 'Dec 2024',
    consumerId: 'MC-CNS-000007',
    centralUserId: 'MCOM-U-000007',
    membership: 'Platinum Pro',
    membershipStatus: 'Active',
    vcardStatus: 'Active',
    cardStatus: 'Active',
    additionalEntitlements: 8,
    allocatedAdditionalCards: 6,
    familyAllocations: 4,
    friendAllocations: 2,
    unallocatedEntitlements: 2,
    primaryIssuingBusiness: 'Bloom Beauty Salon',
    primaryIssuingBusinessId: 7,
    businessCount: 8,
    registrationSource: 'MCOM Solutions',
    lastActivityAt: '3 hours ago',
    allocationType: 'Mixed Family & Friends',
    wallet: { balance: 15000, points: 45000, cashback: 3200, giftCards: 8, coupons: 5, vouchers: 3 }, stats: { cards: 10, rewards: 25, referrals: 8, scans: 1200 },
    savedCards: Array.from({ length: 10 }, (_, i) => ({ id: String(100 + i), name: `Card ${i + 1}`, business: ['GreenLeaf Coffee', 'FitLife Studio', 'Bloom Beauty', 'TechVision Inc', 'Coastal Realty', 'Hotel Splendido', 'Elite Barber Co', 'Dr. Smith Dentistry', 'Pizza Roma', 'Swift Legal LLP'][i], type: ['Loyalty', 'Membership', 'Rewards', 'Business', 'Business', 'Membership', 'Loyalty', 'Appointment', 'Loyalty', 'Business'][i] })),
    rewardHistory: Array.from({ length: 25 }, (_, i) => ({ id: String(200 + i), reward: ['Free Coffee', 'Cashback $10', 'Premium Upgrade', 'Free Session', 'Gift Card $25', 'VIP Access', 'Birthday Bonus', '20% Discount', 'Free Night Stay', 'Spa Package'][i % 10], points: [200, 1000, 3000, 1500, 2500, 5000, 1000, 2000, 10000, 4000][i % 10], date: ['2026-06-15', '2026-06-10', '2026-06-05', '2026-05-28', '2026-05-20', '2026-05-15', '2026-05-10', '2026-05-01', '2026-04-20', '2026-04-10'][i % 10], status: (['redeemed', 'available', 'expired'] as const)[i % 3] })),
    referrals: Array.from({ length: 8 }, (_, i) => ({ name: ['Maria Lopez', 'Carlos Ruiz', 'Yuki Tanaka', 'Ahmed Hassan', 'Olga Petrov', 'Hannah Muller', 'Liam O\'Brien', 'Zara Ahmed'][i], email: [`${['maria.l', 'carlos.r', 'yuki.t', 'ahmed.h', 'olga.p', 'hannah.m', 'liam.o', 'zara.a'][i]}@email.com`][0], joined: ['Jan 2025', 'Mar 2025', 'Jun 2025', 'Sep 2025', 'Nov 2025', 'Feb 2026', 'Apr 2026', 'Jun 2026'][i], reward: '200 pts' })),
    recentActivity: Array.from({ length: 8 }, (_, i) => ({ action: ['Redeemed "Spa Package" (-4000 pts)', 'Earned 150 points from Hotel Splendido', 'Referred Zara Ahmed - joined', 'Added "Hotel Splendido" card', 'NFC tap at Bloom Beauty Salon', 'Earned 200 points from referral bonus', 'Redeemed "Free Night Stay"', 'Completed 1000th scan milestone'][i], time: [`${i * 3} hours ago`, '1 day ago', '2 days ago', '3 days ago', '5 days ago', '1 week ago', '1 week ago', '2 weeks ago'][i], type: ['reward', 'earn', 'referral', 'card', 'nfc', 'earn', 'reward', 'milestone'][i] })),
    cardId: 'CARD-CNS-000007', cardTemplate: 'Consumer Card — Premium', cardCreated: 'Dec 2024', cardUpdated: '28 Jul 2026',
    cardSource: 'MCOM Solutions', cardAcquisitionMethod: 'Direct Registration', cardSourcePlatform: 'MCOM Solutions',
    qrStatus: 'Active', qrId: 'QR-000007', qrLastScanned: '3 hours ago', qrUpdateFrequency: 'Daily', qrLastContentUpdate: '28 Jul 2026',
    eCardStatus: 'Available', eCardFaceValue: '£10.00', eCardSource: 'Membership', eCardId: 'EC-000007', eCardIssueDate: '15 Jan 2025', eCardExpiryDate: '15 Jan 2027',
    additionalCards: [
      { id: '11', name: 'Carlos Martinez', relationship: 'Family', status: 'Active', locked: true, allocatedAt: 'Jan 2025' },
      { id: '12', name: 'Elena Martinez', relationship: 'Family', status: 'Active', locked: true, allocatedAt: 'Jan 2025' },
      { id: '13', name: 'Sofia Martinez', relationship: 'Family', status: 'Active', locked: true, allocatedAt: 'Mar 2025' },
      { id: '14', name: 'Diego Martinez', relationship: 'Family', status: 'Active', locked: true, allocatedAt: 'Jun 2025' },
      { id: '15', name: 'Maria Lopez', relationship: 'Friend', status: 'Active', locked: true, allocatedAt: 'Jan 2025' },
      { id: '16', name: 'Yuki Tanaka', relationship: 'Friend', status: 'Active', locked: true, allocatedAt: 'Jun 2025' },
    ],
    shareContent: [
      { id: '8', title: 'Bloom Beauty VIP Event', source: 'Issuing Business', status: 'Active', availableUntil: '30 Sep 2026' },
      { id: '9', title: 'Hotel Splendido Summer Offer', source: 'External Platform', status: 'Coming Soon', availableUntil: '–' },
      { id: '10', title: 'Miami High Street Festival', source: 'External Platform', status: 'Active', availableUntil: '31 Aug 2026' },
    ],
    cardActivity: [
      { action: 'Card issued', time: 'Dec 2024', type: 'card', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Card activated', time: 'Dec 2024', type: 'card', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
      { action: 'QR scanned at Bloom Beauty', time: '3 hours ago', type: 'nfc', actor: 'Anna Martinez', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Card shared on social media', time: '1 day ago', type: 'referral', actor: 'Anna Martinez', source: 'MCOMVCard', status: 'Successful' },
      { action: '1000th scan milestone reached', time: '2 weeks ago', type: 'milestone', actor: 'Anna Martinez', source: 'MCOMVCard', status: 'Successful' },
      { action: 'E-card issued', time: '15 Jan 2025', type: 'reward', actor: 'System', source: 'MCOM Rewards', status: 'Successful' },
      { action: 'Card template updated to Premium', time: '20 Jun 2025', type: 'card', actor: 'Admin', source: 'MCOMVCard', status: 'Successful' },
    ]
  },
  {
    id: '8', name: 'Tom Baker', email: 'tom.b@email.com', phone: '+1 (555) 777-8888', location: 'Portland, OR', status: 'suspended', joined: 'Mar 2026',
    consumerId: 'MC-CNS-000008',
    centralUserId: 'MCOM-U-000008',
    membership: 'Bronze Pro',
    membershipStatus: 'Suspended',
    vcardStatus: 'Suspended',
    cardStatus: 'Suspended',
    additionalEntitlements: 1,
    allocatedAdditionalCards: 0,
    familyAllocations: 0,
    friendAllocations: 0,
    unallocatedEntitlements: 1,
    primaryIssuingBusiness: 'Peak Performance Coaching',
    primaryIssuingBusinessId: 10,
    businessCount: 1,
    registrationSource: 'Business',
    lastActivityAt: '1 week ago',
    allocationType: 'Unallocated',
    wallet: { balance: 450, points: 1200, cashback: 80, giftCards: 0, coupons: 0, vouchers: 0 }, stats: { cards: 2, rewards: 1, referrals: 0, scans: 34 },
    savedCards: [{ id: '26', name: "Tom's Card", business: 'Peak Performance Coaching', type: 'Business' }, { id: '27', name: 'Elite Barber', business: 'Elite Barber Co', type: 'Loyalty' }],
    rewardHistory: [{ id: '225', reward: 'Free Coaching Session', points: 1000, date: '2026-05-10', status: 'expired' }],
    referrals: [],
    recentActivity: [{ action: 'Account suspended due to policy violation', time: '1 week ago', type: 'alert' }, { action: 'Last login attempt failed', time: '1 week ago', type: 'alert' }],
    cardId: 'CARD-CNS-000008', cardTemplate: 'Consumer Card — Standard', cardCreated: 'Mar 2026', cardUpdated: '1 week ago',
    cardSource: 'Business Reward', cardAcquisitionMethod: 'Points Redemption', cardSourcePlatform: '',
    qrStatus: 'Inactive', qrId: 'QR-000008', qrLastScanned: '1 week ago', qrUpdateFrequency: '', qrLastContentUpdate: '1 week ago',
    eCardStatus: 'Cancelled', eCardFaceValue: '£2.00', eCardSource: 'Business Reward', eCardId: 'EC-000008', eCardIssueDate: '15 Mar 2026', eCardExpiryDate: '15 Sep 2026',
    additionalCards: [],
    shareContent: [],
    cardActivity: [
      { action: 'Card issued', time: 'Mar 2026', type: 'card', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Card activated', time: 'Mar 2026', type: 'card', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Card suspended due to account policy violation', time: '1 week ago', type: 'alert', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
    ]
  },
  {
    id: '9', name: 'Sophie Laurent', email: 'sophie.l@email.com', phone: '+1 (555) 888-9999', location: 'Montreal, QC', status: 'active', joined: 'May 2026',
    consumerId: 'MC-CNS-000009',
    centralUserId: 'MCOM-U-000009',
    membership: 'Bronze Pro',
    membershipStatus: 'Active',
    vcardStatus: 'Active',
    cardStatus: 'Active',
    additionalEntitlements: 2,
    allocatedAdditionalCards: 1,
    familyAllocations: 0,
    friendAllocations: 1,
    unallocatedEntitlements: 1,
    primaryIssuingBusiness: 'Bloom Beauty Salon',
    primaryIssuingBusinessId: 7,
    businessCount: 3,
    registrationSource: 'Campaign',
    lastActivityAt: '2 days ago',
    allocationType: 'Friend',
    wallet: { balance: 2800, points: 9200, cashback: 650, giftCards: 2, coupons: 1, vouchers: 0 }, stats: { cards: 4, rewards: 6, referrals: 2, scans: 165 },
    savedCards: [{ id: '30', name: 'Sophie\'s Card', business: 'Bloom Beauty Salon', type: 'Rewards' }, { id: '31', name: 'FitLife', business: 'FitLife Studio', type: 'Membership' }, { id: '32', name: 'Pizza Roma', business: 'Pizza Roma', type: 'Loyalty' }, { id: '33', name: 'Dr. Smith', business: 'Dr. Smith Dentistry', type: 'Appointment' }],
    rewardHistory: [{ id: '226', reward: 'Free Haircut', points: 800, date: '2026-06-12', status: 'redeemed' }, { id: '227', reward: 'Cashback $5', points: 500, date: '2026-06-05', status: 'redeemed' }, { id: '228', reward: 'Free Smoothie', points: 400, date: '2026-05-25', status: 'available' }, { id: '229', reward: '10% Discount', points: 750, date: '2026-05-15', status: 'available' }, { id: '230', reward: 'Free Month', points: 3000, date: '2026-05-01', status: 'available' }, { id: '231', reward: 'Birthday Bonus', points: 1000, date: '2026-04-20', status: 'expired' }],
    referrals: [{ name: 'Marie Dupont', email: 'marie.d@email.com', joined: 'Jun 2026', reward: '200 pts' }, { name: 'Jean-Pierre R', email: 'jp.r@email.com', joined: 'Jun 2026', reward: '200 pts' }],
    recentActivity: [{ action: 'Redeemed "Free Haircut" at Bloom Beauty', time: '2 days ago', type: 'reward' }, { action: 'Earned 60 points from FitLife class', time: '3 days ago', type: 'earn' }, { action: 'Referred Marie Dupont - joined', time: '4 days ago', type: 'referral' }, { action: 'Booked dental appointment via Dr. Smith card', time: '5 days ago', type: 'booking' }],
    cardId: 'CARD-CNS-000009', cardTemplate: 'Consumer Card — Standard', cardCreated: 'May 2026', cardUpdated: '26 Jul 2026',
    cardSource: 'Campaign', cardAcquisitionMethod: 'Campaign Reward', cardSourcePlatform: '',
    qrStatus: 'Active', qrId: 'QR-000009', qrLastScanned: '2 days ago', qrUpdateFrequency: 'Campaign-Based', qrLastContentUpdate: '25 Jul 2026',
    eCardStatus: 'Available', eCardFaceValue: '£2.00', eCardSource: 'Campaign Reward', eCardId: 'EC-000009', eCardIssueDate: '1 Jun 2026', eCardExpiryDate: '1 Dec 2026',
    additionalCards: [
      { id: '17', name: 'Marie Dupont', relationship: 'Friend', status: 'Active', locked: true, allocatedAt: 'Jun 2026' },
    ],
    shareContent: [
      { id: '11', title: 'Bloom Beauty Summer Collection', source: 'Issuing Business', status: 'Active', availableUntil: '15 Sep 2026' },
    ],
    cardActivity: [
      { action: 'Card issued', time: 'May 2026', type: 'card', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Card activated', time: 'May 2026', type: 'card', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
      { action: 'QR scanned at Bloom Beauty', time: '2 days ago', type: 'nfc', actor: 'Sophie Laurent', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Additional Card allocated to Friend', time: 'Jun 2026', type: 'card', actor: 'Sophie Laurent', source: 'MCOMVCard', status: 'Successful' },
      { action: 'E-card issued', time: '1 Jun 2026', type: 'reward', actor: 'System', source: 'MCOM Rewards', status: 'Successful' },
    ]
  },
  {
    id: '10', name: 'Oscar Hernandez', email: 'oscar.h@email.com', phone: '+1 (555) 999-0000', location: 'Los Angeles, CA', status: 'active', joined: 'Sep 2025',
    consumerId: 'MC-CNS-000010',
    centralUserId: 'MCOM-U-000010',
    membership: 'Gold',
    membershipStatus: 'Active',
    vcardStatus: 'Active',
    cardStatus: 'Active',
    additionalEntitlements: 4,
    allocatedAdditionalCards: 2,
    familyAllocations: 1,
    friendAllocations: 1,
    unallocatedEntitlements: 2,
    primaryIssuingBusiness: 'Hotel Splendido',
    primaryIssuingBusinessId: 9,
    businessCount: 4,
    registrationSource: 'MCOM Solutions',
    lastActivityAt: '2 hours ago',
    allocationType: 'Mixed Family & Friends',
    wallet: { balance: 5600, points: 18000, cashback: 1400, giftCards: 4, coupons: 2, vouchers: 1 }, stats: { cards: 6, rewards: 10, referrals: 4, scans: 680 },
    savedCards: [{ id: '40', name: "Oscar's Card", business: 'Hotel Splendido', type: 'Membership' }, { id: '41', name: 'TechVision', business: 'TechVision Inc', type: 'Business' }, { id: '42', name: 'Coastal Realty', business: 'Coastal Realty', type: 'Business' }, { id: '43', name: 'Elite Barber', business: 'Elite Barber Co', type: 'Loyalty' }, { id: '44', name: 'FitLife', business: 'FitLife Studio', type: 'Membership' }, { id: '45', name: 'Swift Legal', business: 'Swift Legal LLP', type: 'Business' }],
    rewardHistory: Array.from({ length: 10 }, (_, i) => ({ id: String(300 + i), reward: ['Free Night Stay', 'Cashback $20', 'VIP Access', 'Free Month', 'Gift Card $50', 'Spa Package', 'Premium Upgrade', '20% Discount', 'Free Consultation', 'Birthday Bonus'][i], points: [10000, 2000, 5000, 3000, 5000, 4000, 8000, 2000, 1000, 1000][i], date: ['2026-06-14', '2026-06-08', '2026-06-01', '2026-05-20', '2026-05-10', '2026-04-28', '2026-04-15', '2026-04-01', '2026-03-20', '2026-03-10'][i], status: (['redeemed', 'available', 'redeemed', 'available', 'available', 'expired', 'redeemed', 'available', 'expired', 'redeemed'] as const)[i] })),
    referrals: [{ name: 'Luis Garcia', email: 'luis.g@email.com', joined: 'Nov 2025', reward: '200 pts' }, { name: 'Elena Torres', email: 'elena.t@email.com', joined: 'Feb 2026', reward: '200 pts' }, { name: 'Diego Rivera', email: 'diego.r@email.com', joined: 'Apr 2026', reward: '200 pts' }, { name: 'Rosa Martinez', email: 'rosa.m@email.com', joined: 'May 2026', reward: '200 pts' }],
    recentActivity: Array.from({ length: 6 }, (_, i) => ({ action: ['Earned 200 points from Hotel Splendido stay', 'Redeemed "Free Night Stay" at Hotel Splendido', 'Referred Rosa Martinez - joined', 'Added "Swift Legal" card', 'NFC tap at TechVision office', 'Earned 100 referral bonus points'][i], time: [`${i * 2} hours ago`, '1 day ago', '2 days ago', '4 days ago', '1 week ago', '1 week ago'][i], type: ['earn', 'reward', 'referral', 'card', 'nfc', 'earn'][i] })),
    cardId: 'CARD-CNS-000010', cardTemplate: 'Consumer Card — Standard', cardCreated: 'Sep 2025', cardUpdated: '28 Jul 2026',
    cardSource: 'MCOM Solutions', cardAcquisitionMethod: 'Direct Registration', cardSourcePlatform: 'MCOM Solutions',
    qrStatus: 'Active', qrId: 'QR-000010', qrLastScanned: '2 hours ago', qrUpdateFrequency: 'Daily', qrLastContentUpdate: '28 Jul 2026',
    eCardStatus: 'Available', eCardFaceValue: '£5.00', eCardSource: 'Membership', eCardId: 'EC-000010', eCardIssueDate: '1 Oct 2025', eCardExpiryDate: '1 Apr 2027',
    additionalCards: [
      { id: '18', name: 'Elena Hernandez', relationship: 'Family', status: 'Active', locked: true, allocatedAt: 'Feb 2026' },
      { id: '19', name: 'Luis Garcia', relationship: 'Friend', status: 'Active', locked: true, allocatedAt: 'Nov 2025' },
    ],
    shareContent: [
      { id: '12', title: 'Hotel Splendido Weekend Getaway', source: 'Issuing Business', status: 'Active', availableUntil: '31 Dec 2026' },
    ],
    cardActivity: [
      { action: 'Card issued', time: 'Sep 2025', type: 'card', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Card activated', time: 'Sep 2025', type: 'card', actor: 'System', source: 'MCOMVCard', status: 'Successful' },
      { action: 'QR scanned at Hotel Splendido', time: '2 hours ago', type: 'nfc', actor: 'Oscar Hernandez', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Added "Swift Legal" card', time: '4 days ago', type: 'card', actor: 'Oscar Hernandez', source: 'MCOMVCard', status: 'Successful' },
      { action: 'Card shared via WhatsApp', time: '3 days ago', type: 'referral', actor: 'Oscar Hernandez', source: 'MCOMVCard', status: 'Successful' },
      { action: 'E-card issued', time: '1 Oct 2025', type: 'reward', actor: 'System', source: 'MCOM Rewards', status: 'Successful' },
    ]
  },
]

export interface MockCardDesign {
  id: string; name: string; type: 'Business' | 'Consumer'; style: string
  primaryColor: string; secondaryColor: string; accentColor: string
  layout: 'split' | 'centered' | 'header' | 'minimal' | 'bold' | 'diagonal'
  status: 'active' | 'inactive' | 'archived'; usage: number; created: string
}

export const mockCardDesigns: MockCardDesign[] = [
  { id: '1', name: 'Premium Executive', type: 'Business', style: 'Classic', primaryColor: '#0F172A', secondaryColor: '#D4AF37', accentColor: '#FFFFFF', layout: 'split', status: 'active', usage: 2340, created: 'Jan 2025' },
  { id: '2', name: 'Modern Tide', type: 'Business', style: 'Contemporary', primaryColor: '#0D9488', secondaryColor: '#F0FDFA', accentColor: '#FFFFFF', layout: 'centered', status: 'active', usage: 1890, created: 'Feb 2025' },
  { id: '3', name: 'Bold Statement', type: 'Business', style: 'Bold', primaryColor: '#DC2626', secondaryColor: '#1F2937', accentColor: '#FFFFFF', layout: 'bold', status: 'active', usage: 1560, created: 'Mar 2025' },
  { id: '4', name: 'Royal Purple', type: 'Business', style: 'Creative', primaryColor: '#7C3AED', secondaryColor: '#EC4899', accentColor: '#FFFFFF', layout: 'diagonal', status: 'active', usage: 1230, created: 'Apr 2025' },
  { id: '5', name: 'Eco Natural', type: 'Consumer', style: 'Natural', primaryColor: '#059669', secondaryColor: '#FEF3C7', accentColor: '#FFFFFF', layout: 'header', status: 'active', usage: 980, created: 'May 2025' },
  { id: '6', name: 'Clean Slate', type: 'Consumer', style: 'Minimal', primaryColor: '#FFFFFF', secondaryColor: '#1E293B', accentColor: '#FF5C00', layout: 'minimal', status: 'active', usage: 2100, created: 'Jan 2025' },
  { id: '7', name: 'Tech Blueprint', type: 'Consumer', style: 'Tech', primaryColor: '#2563EB', secondaryColor: '#06B6D4', accentColor: '#FFFFFF', layout: 'split', status: 'active', usage: 1750, created: 'Jun 2025' },
  { id: '8', name: 'Warm Heritage', type: 'Consumer', style: 'Elegant', primaryColor: '#92400E', secondaryColor: '#FFFBEB', accentColor: '#FFFFFF', layout: 'centered', status: 'active', usage: 670, created: 'Jul 2025' },
]

export interface CardBusinessBrief {
  id: string; name: string; industry: string; owner: string; email: string; phone: string; active: boolean; cardDesignId: number
}

export const mockCardBusinesses: CardBusinessBrief[] = [
  { id: '1', name: 'GreenLeaf Coffee', industry: 'Cafe', owner: 'Sarah Johnson', email: 'sarah@greenleaf.co', phone: '+1 (555) 111-0001', active: true, cardDesignId: 1 },
  { id: '2', name: 'TechVision Inc', industry: 'Technology', owner: 'Marcus Chen', email: 'marcus@techvision.io', phone: '+1 (555) 111-0002', active: true, cardDesignId: 2 },
  { id: '3', name: 'Pizza Roma', industry: 'Restaurant', owner: 'Giuseppe Romano', email: 'giuseppe@pizzaroma.com', phone: '+1 (555) 111-0003', active: true, cardDesignId: 1 },
  { id: '4', name: 'FitLife Studio', industry: 'Fitness', owner: 'Amanda Lee', email: 'amanda@fitlife.com', phone: '+1 (555) 111-0004', active: false, cardDesignId: 3 },
  { id: '5', name: 'Coastal Realty', industry: 'Real Estate', owner: 'James Wilson', email: 'james@coastalrealty.com', phone: '+1 (555) 111-0005', active: true, cardDesignId: 2 },
  { id: '6', name: 'Downtown BID', industry: 'Business District', owner: 'Lisa Park', email: 'lisa@downtownbid.org', phone: '+1 (555) 111-0006', active: true, cardDesignId: 4 },
  { id: '7', name: 'Bloom Beauty Salon', industry: 'Beauty', owner: 'Nina Torres', email: 'nina@bloombeauty.com', phone: '+1 (555) 111-0007', active: true, cardDesignId: 5 },
  { id: '8', name: 'Swift Legal LLP', industry: 'Legal', owner: 'Robert Swift', email: 'robert@swiftlegal.com', phone: '+1 (555) 111-0008', active: true, cardDesignId: 3 },
  { id: '9', name: 'Hotel Splendido', industry: 'Hospitality', owner: 'Marco Bianchi', email: 'marco@splendido.com', phone: '+1 (555) 111-0009', active: true, cardDesignId: 6 },
  { id: '10', name: 'Peak Performance Coaching', industry: 'Coaching', owner: 'Diana Cruz', email: 'diana@peakcoach.com', phone: '+1 (555) 111-0010', active: false, cardDesignId: 4 },
  { id: '11', name: 'Elite Barber Co', industry: 'Barber', owner: 'Kevin Wright', email: 'kevin@elitebarber.com', phone: '+1 (555) 111-0011', active: true, cardDesignId: 7 },
  { id: '12', name: 'Dr. Smith Dentistry', industry: 'Healthcare', owner: 'Amanda Smith', email: 'amanda@smithdental.com', phone: '+1 (555) 111-0012', active: true, cardDesignId: 8 },
  { id: '13', name: 'The Bakery Corner', industry: 'Food', owner: 'Emma Lewis', email: 'emma@bakerycorner.com', phone: '+1 (555) 111-0013', active: true, cardDesignId: 5 },
  { id: '14', name: 'Pixel Perfect Design', industry: 'Design', owner: 'Chris Martin', email: 'chris@pixelperfect.com', phone: '+1 (555) 111-0014', active: true, cardDesignId: 6 },
  { id: '15', name: 'AutoCare Pro', industry: 'Automotive', owner: 'Mike Torres', email: 'mike@autocarepro.com', phone: '+1 (555) 111-0015', active: false, cardDesignId: 7 },
]

export const mockAdminBookings: AdminBooking[] = [
  { id: '1', customer_name: 'Sarah Wilson', customer_email: 'sarah.w@email.com', customer_phone: '+1 (555) 100-0001', business_id: 5, business_name: 'Bloom Beauty Salon', vcard_id: 9, type: 'Appointment', date: '2026-07-16', time: '10:30', duration_minutes: 60, status: 'confirmed', amount: 85, notes: 'Hair coloring + trim', created_at: '2026-07-10T08:00:00Z' },
  { id: '2', customer_name: 'Mike Chen', customer_email: 'mike.c@email.com', customer_phone: '+1 (555) 100-0002', business_id: 2, business_name: 'TechVision Inc', vcard_id: 3, type: 'Consultation', date: '2026-07-16', time: '14:00', duration_minutes: 30, status: 'confirmed', amount: 150, notes: 'Software demo', created_at: '2026-07-11T09:30:00Z' },
  { id: '3', customer_name: 'Emma Rodriguez', customer_email: 'emma.r@email.com', customer_phone: '+1 (555) 100-0003', business_id: 4, business_name: 'FitLife Studio', vcard_id: 6, type: 'Class', date: '2026-07-17', time: '09:00', duration_minutes: 45, status: 'pending', amount: 35, created_at: '2026-07-12T10:00:00Z' },
  { id: '4', customer_name: 'James Taylor', customer_email: 'james.t@email.com', customer_phone: '+1 (555) 100-0004', business_id: 3, business_name: 'Pizza Roma', vcard_id: 5, type: 'Reservation', date: '2026-07-17', time: '19:30', duration_minutes: 120, status: 'confirmed', amount: 0, notes: 'Birthday party - table of 8', created_at: '2026-07-10T14:00:00Z' },
  { id: '5', customer_name: 'Lisa Anderson', customer_email: 'lisa.a@email.com', customer_phone: '+1 (555) 100-0005', business_id: 7, business_name: 'Coastal Realty', vcard_id: 11, type: 'Consultation', date: '2026-07-18', time: '11:00', duration_minutes: 60, status: 'pending', amount: 0, created_at: '2026-07-13T11:00:00Z' },
  { id: '6', customer_name: 'David Kim', customer_email: 'david.k@email.com', customer_phone: '+1 (555) 100-0006', business_id: 1, business_name: 'GreenLeaf Coffee', vcard_id: 2, type: 'Event', date: '2026-07-19', time: '18:00', duration_minutes: 180, status: 'cancelled', amount: 25, notes: 'Cancelled due to weather', created_at: '2026-07-08T16:00:00Z' },
  { id: '7', customer_name: 'Anna Martinez', customer_email: 'anna.m@email.com', customer_phone: '+1 (555) 100-0007', business_id: 8, business_name: 'Swift Legal LLP', vcard_id: 13, type: 'Appointment', date: '2026-07-20', time: '15:00', duration_minutes: 45, status: 'confirmed', amount: 200, notes: 'Contract review', created_at: '2026-07-14T09:00:00Z' },
  { id: '8', customer_name: 'Tom Baker', customer_email: 'tom.b@email.com', business_id: 8, business_name: 'Fresh Market Grocery', vcard_id: 13, type: 'Reservation', date: '2026-07-21', time: '12:00', duration_minutes: 60, status: 'completed', amount: 0, created_at: '2026-07-07T12:00:00Z' },
  { id: '9', customer_name: 'Oscar Hernandez', customer_email: 'oscar.h@email.com', customer_phone: '+1 (555) 100-0009', business_id: 10, business_name: 'Hotel Splendido', vcard_id: 16, type: 'Appointment', date: '2026-07-16', time: '08:00', duration_minutes: 30, status: 'confirmed', amount: 0, notes: 'Spa reservation', created_at: '2026-07-15T07:00:00Z' },
  { id: '10', customer_name: 'Sophie Laurent', customer_email: 'sophie.l@email.com', customer_phone: '+1 (555) 100-0010', business_id: 4, business_name: 'FitLife Studio', vcard_id: 6, type: 'Class', date: '2026-07-16', time: '17:30', duration_minutes: 45, status: 'confirmed', amount: 35, created_at: '2026-07-14T18:00:00Z' },
  { id: '11', customer_name: 'Rosa Martinez', customer_email: 'rosa.m@email.com', business_id: 1, business_name: 'GreenLeaf Coffee', vcard_id: 2, type: 'Reservation', date: '2026-07-22', time: '10:00', duration_minutes: 90, status: 'pending', amount: 0, notes: 'Coffee tasting event', created_at: '2026-07-15T10:00:00Z' },
  { id: '12', customer_name: 'Chris Evans', customer_email: 'chris.e@email.com', customer_phone: '+1 (555) 100-0012', business_id: 11, business_name: 'Elite Barber Co', vcard_id: 17, type: 'Appointment', date: '2026-07-23', time: '13:00', duration_minutes: 30, status: 'confirmed', amount: 45, created_at: '2026-07-14T15:00:00Z' },
  { id: '13', customer_name: 'Nina Torres', customer_email: 'nina.t@email.com', business_id: 9, business_name: 'Dr. Smith Dentistry', vcard_id: 14, type: 'Appointment', date: '2026-07-24', time: '09:30', duration_minutes: 60, status: 'pending', amount: 75, notes: 'Dental cleaning', created_at: '2026-07-12T11:00:00Z' },
  { id: '14', customer_name: 'Luis Garcia', customer_email: 'luis.g@email.com', customer_phone: '+1 (555) 100-0014', business_id: 2, business_name: 'TechVision Inc', vcard_id: 3, type: 'Consultation', date: '2026-07-25', time: '16:00', duration_minutes: 30, status: 'cancelled', amount: 0, notes: 'Rescheduled by client', created_at: '2026-07-11T13:00:00Z' },
  { id: '15', customer_name: 'Elena Torres', customer_email: 'elena.t@email.com', customer_phone: '+1 (555) 100-0015', business_id: 5, business_name: 'Bloom Beauty Salon', vcard_id: 9, type: 'Appointment', date: '2026-07-26', time: '14:30', duration_minutes: 90, status: 'confirmed', amount: 120, notes: 'Bridal makeup trial', created_at: '2026-07-13T09:00:00Z' },
  { id: '16', customer_name: 'Diego Rivera', customer_email: 'diego.r@email.com', business_id: 6, business_name: 'Downtown BID', vcard_id: 10, type: 'Event', date: '2026-07-27', time: '09:00', duration_minutes: 240, status: 'pending', amount: 0, notes: 'Community networking event', created_at: '2026-07-10T08:00:00Z' },
  { id: '17', customer_name: 'Sarah Johnson', customer_email: 'sarah.j@email.com', customer_phone: '+1 (555) 100-0017', business_id: 4, business_name: 'FitLife Studio', vcard_id: 6, type: 'Class', date: '2026-07-17', time: '10:00', duration_minutes: 45, status: 'completed', amount: 35, created_at: '2026-07-09T07:00:00Z' },
  { id: '18', customer_name: 'Marcus Chen', customer_email: 'marcus.c@email.com', customer_phone: '+1 (555) 100-0018', business_id: 10, business_name: 'Hotel Splendido', vcard_id: 16, type: 'Reservation', date: '2026-07-28', time: '15:00', duration_minutes: 60, status: 'confirmed', amount: 0, created_at: '2026-07-15T12:00:00Z' },
  { id: '19', customer_name: 'Kevin Wright', customer_email: 'kevin.w@email.com', business_id: 11, business_name: 'Elite Barber Co', vcard_id: 17, type: 'Appointment', date: '2026-07-29', time: '11:00', duration_minutes: 30, status: 'pending', amount: 45, created_at: '2026-07-14T14:00:00Z' },
  { id: '20', customer_name: 'Amanda Smith', customer_email: 'amanda.s@email.com', customer_phone: '+1 (555) 100-0020', business_id: 9, business_name: 'Dr. Smith Dentistry', vcard_id: 14, type: 'Appointment', date: '2026-07-30', time: '10:00', duration_minutes: 60, status: 'confirmed', amount: 150, notes: 'Root canal follow-up', created_at: '2026-07-08T10:00:00Z' },
  { id: '21', customer_name: 'Emma Lewis', customer_email: 'emma.l@email.com', customer_phone: '+1 (555) 100-0021', business_id: 13, business_name: 'The Bakery Corner', vcard_id: 21, type: 'Reservation', date: '2026-07-31', time: '08:00', duration_minutes: 120, status: 'pending', amount: 0, created_at: '2026-07-15T16:00:00Z' },
  { id: '22', customer_name: 'John Smith', customer_email: 'john.s@email.com', customer_phone: '+1 (555) 100-0022', business_id: 2, business_name: 'TechVision Inc', vcard_id: 3, type: 'Consultation', date: '2026-07-16', time: '15:30', duration_minutes: 30, status: 'completed', amount: 150, notes: 'Completed consultation', created_at: '2026-07-07T09:00:00Z' },
  { id: '23', customer_name: 'Maria Rossi', customer_email: 'maria.r@email.com', business_id: 3, business_name: 'Pizza Roma', vcard_id: 5, type: 'Reservation', date: '2026-07-22', time: '20:00', duration_minutes: 120, status: 'confirmed', amount: 0, notes: 'Anniversary dinner - table of 4', created_at: '2026-07-15T11:00:00Z' },
  { id: '24', customer_name: 'Tom Waters', customer_email: 'tom.w@email.com', customer_phone: '+1 (555) 100-0024', business_id: 7, business_name: 'Coastal Realty', vcard_id: 11, type: 'Consultation', date: '2026-08-01', time: '10:00', duration_minutes: 60, status: 'pending', amount: 0, created_at: '2026-07-15T14:00:00Z' },
  { id: '25', customer_name: 'Lisa Park', customer_email: 'lisa.p@email.com', customer_phone: '+1 (555) 100-0025', business_id: 6, business_name: 'Downtown BID', vcard_id: 10, type: 'Event', date: '2026-08-02', time: '14:00', duration_minutes: 180, status: 'pending', amount: 50, notes: 'Summer fair planning', created_at: '2026-07-14T08:00:00Z' },
  { id: '26', customer_name: 'James Wilson', customer_email: 'james.w@email.com', business_id: 1, business_name: 'GreenLeaf Coffee', vcard_id: 2, type: 'Event', date: '2026-08-03', time: '17:00', duration_minutes: 120, status: 'confirmed', amount: 0, created_at: '2026-07-13T15:00:00Z' },
  { id: '27', customer_name: 'Diana Cruz', customer_email: 'diana.c@email.com', customer_phone: '+1 (555) 100-0027', business_id: 10, business_name: 'Peak Performance Coaching', vcard_id: 16, type: 'Consultation', date: '2026-07-18', time: '09:00', duration_minutes: 45, status: 'confirmed', amount: 100, created_at: '2026-07-12T10:00:00Z' },
  { id: '28', customer_name: 'Anna Garcia', customer_email: 'anna.g@email.com', customer_phone: '+1 (555) 100-0028', business_id: 5, business_name: 'Bloom Beauty Salon', vcard_id: 9, type: 'Appointment', date: '2026-07-19', time: '11:00', duration_minutes: 60, status: 'cancelled', amount: 0, notes: 'Client cancelled, will rebook', created_at: '2026-07-09T12:00:00Z' },
  { id: '29', customer_name: 'Robert Swift', customer_email: 'robert.s@email.com', customer_phone: '+1 (555) 100-0029', business_id: 8, business_name: 'Swift Legal LLP', vcard_id: 13, type: 'Appointment', date: '2026-07-25', time: '14:00', duration_minutes: 60, status: 'confirmed', amount: 250, notes: 'Partnership agreement', created_at: '2026-07-11T08:00:00Z' },
  { id: '30', customer_name: 'Chris Martin', customer_email: 'chris.m@email.com', business_id: 14, business_name: 'Pixel Perfect Design', vcard_id: 22, type: 'Consultation', date: '2026-08-05', time: '10:00', duration_minutes: 60, status: 'pending', amount: 0, created_at: '2026-07-15T09:00:00Z' },
]

// ── Business Claimed Templates ──────────────────────────────────────
export interface ClaimedTemplate {
  id: string
  business_id: string
  template_id: string
  claimed_at: string
  customized: boolean
  views: number
  shares: number
}

export const mockClaimedTemplates: ClaimedTemplate[] = [
  { id: '1', business_id: '1', template_id: '1', claimed_at: '2026-06-01', customized: true, views: 1240, shares: 89 },
  { id: '2', business_id: '1', template_id: '4', claimed_at: '2026-06-15', customized: false, views: 0, shares: 0 },
  { id: '3', business_id: '2', template_id: '8', claimed_at: '2026-05-20', customized: true, views: 890, shares: 67 },
  { id: '4', business_id: '3', template_id: '17', claimed_at: '2026-06-10', customized: true, views: 2100, shares: 145 },
  { id: '5', business_id: '4', template_id: '13', claimed_at: '2026-05-01', customized: true, views: 1560, shares: 112 },
  { id: '6', business_id: '5', template_id: '4', claimed_at: '2026-06-20', customized: true, views: 780, shares: 54 },
  { id: '7', business_id: '6', template_id: '10', claimed_at: '2026-04-15', customized: true, views: 3200, shares: 230 },
  { id: '8', business_id: '7', template_id: '6', claimed_at: '2026-05-10', customized: true, views: 1890, shares: 134 },
  { id: '9', business_id: '8', template_id: '7', claimed_at: '2026-06-05', customized: false, views: 450, shares: 23 },
  { id: '10', business_id: '9', template_id: '12', claimed_at: '2026-04-20', customized: true, views: 1120, shares: 78 },
  { id: '11', business_id: '10', template_id: '14', claimed_at: '2026-03-15', customized: true, views: 2800, shares: 198 },
  { id: '12', business_id: '11', template_id: '3', claimed_at: '2026-05-25', customized: true, views: 950, shares: 67 },
  { id: '13', business_id: '12', template_id: '16', claimed_at: '2026-06-08', customized: true, views: 1670, shares: 121 },
]

// ── Business Claimed Cards ──────────────────────────────────────────
export interface ClaimedCard {
  id: string
  business_id: string
  card_design_id: string
  claimed_at: string
  active: boolean
  scans: number
}

export const mockClaimedCards: ClaimedCard[] = [
  { id: '1', business_id: '1', card_design_id: '1', claimed_at: '2026-06-01', active: true, scans: 342 },
  { id: '2', business_id: '1', card_design_id: '3', claimed_at: '2026-06-15', active: false, scans: 45 },
  { id: '3', business_id: '2', card_design_id: '2', claimed_at: '2026-05-20', active: true, scans: 567 },
  { id: '4', business_id: '3', card_design_id: '5', claimed_at: '2026-06-10', active: true, scans: 890 },
  { id: '5', business_id: '4', card_design_id: '4', claimed_at: '2026-05-01', active: true, scans: 423 },
  { id: '6', business_id: '5', card_design_id: '7', claimed_at: '2026-06-20', active: true, scans: 234 },
  { id: '7', business_id: '6', card_design_id: '1', claimed_at: '2026-04-15', active: true, scans: 1200 },
  { id: '8', business_id: '7', card_design_id: '6', claimed_at: '2026-05-10', active: true, scans: 678 },
  { id: '9', business_id: '8', card_design_id: '8', claimed_at: '2026-06-05', active: false, scans: 120 },
  { id: '10', business_id: '9', card_design_id: '2', claimed_at: '2026-04-20', active: true, scans: 345 },
  { id: '11', business_id: '10', card_design_id: '3', claimed_at: '2026-03-15', active: true, scans: 1560 },
  { id: '12', business_id: '11', card_design_id: '4', claimed_at: '2026-05-25', active: true, scans: 289 },
  { id: '13', business_id: '12', card_design_id: '5', claimed_at: '2026-06-08', active: true, scans: 456 },
]

// ── Business VCard Stats ────────────────────────────────────────────
export interface VCardViewStats {
  vcard_id: string
  business_id: string
  total_views: number
  views_today: number
  views_this_week: number
  unique_visitors: number
  avg_time_spent: string
  top_locations: { country: string; count: number }[]
  daily_views: { date: string; count: number }[]
}

export const mockVCardViewStats: VCardViewStats[] = [
  {
    vcard_id: '1', business_id: '1', total_views: 1240, views_today: 34, views_this_week: 245,
    unique_visitors: 890, avg_time_spent: '2m 15s',
    top_locations: [{ country: 'United States', count: 450 }, { country: 'United Kingdom', count: 230 }, { country: 'Canada', count: 180 }],
    daily_views: [{ date: 'Jul 9', count: 28 }, { date: 'Jul 10', count: 35 }, { date: 'Jul 11', count: 42 }, { date: 'Jul 12', count: 38 }, { date: 'Jul 13', count: 31 }, { date: 'Jul 14', count: 37 }, { date: 'Jul 15', count: 34 }],
  },
  {
    vcard_id: '2', business_id: '2', total_views: 890, views_today: 21, views_this_week: 178,
    unique_visitors: 620, avg_time_spent: '1m 48s',
    top_locations: [{ country: 'Germany', count: 310 }, { country: 'United States', count: 200 }, { country: 'France', count: 120 }],
    daily_views: [{ date: 'Jul 9', count: 22 }, { date: 'Jul 10', count: 28 }, { date: 'Jul 11', count: 31 }, { date: 'Jul 12', count: 25 }, { date: 'Jul 13', count: 19 }, { date: 'Jul 14', count: 24 }, { date: 'Jul 15', count: 21 }],
  },
  {
    vcard_id: '3', business_id: '3', total_views: 2100, views_today: 56, views_this_week: 412,
    unique_visitors: 1560, avg_time_spent: '3m 02s',
    top_locations: [{ country: 'Italy', count: 780 }, { country: 'United States', count: 520 }, { country: 'Spain', count: 340 }],
    daily_views: [{ date: 'Jul 9', count: 48 }, { date: 'Jul 10', count: 62 }, { date: 'Jul 11', count: 71 }, { date: 'Jul 12', count: 58 }, { date: 'Jul 13', count: 52 }, { date: 'Jul 14', count: 65 }, { date: 'Jul 15', count: 56 }],
  },
  {
    vcard_id: '4', business_id: '4', total_views: 1560, views_today: 42, views_this_week: 310,
    unique_visitors: 1120, avg_time_spent: '2m 34s',
    top_locations: [{ country: 'United States', count: 620 }, { country: 'Australia', count: 340 }, { country: 'United Kingdom', count: 280 }],
    daily_views: [{ date: 'Jul 9', count: 38 }, { date: 'Jul 10', count: 45 }, { date: 'Jul 11', count: 52 }, { date: 'Jul 12', count: 40 }, { date: 'Jul 13', count: 35 }, { date: 'Jul 14', count: 48 }, { date: 'Jul 15', count: 42 }],
  },
  {
    vcard_id: '5', business_id: '5', total_views: 780, views_today: 18, views_this_week: 145,
    unique_visitors: 540, avg_time_spent: '1m 52s',
    top_locations: [{ country: 'Brazil', count: 280 }, { country: 'United States', count: 200 }, { country: 'Portugal', count: 120 }],
    daily_views: [{ date: 'Jul 9', count: 15 }, { date: 'Jul 10', count: 22 }, { date: 'Jul 11', count: 28 }, { date: 'Jul 12', count: 19 }, { date: 'Jul 13', count: 14 }, { date: 'Jul 14', count: 20 }, { date: 'Jul 15', count: 18 }],
  },
]

// ── Consumer Nearby Offers ──────────────────────────────────────────
export interface NearbyOffer {
  id: string
  business: string
  category: string
  offer: string
  discount: string
  distance: string
  icon: string
  gradient: string
}

export const mockNearbyOffers: NearbyOffer[] = [
  { id: '1', business: 'GreenLeaf Coffee', category: 'Coffee Shop', offer: '10% Cashback on every coffee', discount: '10% Cashback', distance: '500m away', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', gradient: 'from-amber-500 to-orange-600' },
  { id: '2', business: 'Pizza Roma', category: 'Restaurant', offer: 'Free dessert with any main meal', discount: 'Free Dessert', distance: '700m away', icon: 'M12 6v6m0 0l3 3m-3-3l-3 3m3-3V3M7 21h10M8 21v-4a4 4 0 118 0v4', gradient: 'from-red-500 to-rose-600' },
  { id: '3', business: 'Bloom Beauty Salon', category: 'Beauty', offer: '20% off all treatments this week', discount: '20% Off', distance: '1.2km away', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', gradient: 'from-pink-500 to-fuchsia-600' },
  { id: '4', business: 'FitLife Studio', category: 'Gym', offer: 'Free trial session for card holders', discount: 'Free Trial', distance: '800m away', icon: 'M13 10V3L4 14h7v7l9-11h-7z', gradient: 'from-emerald-500 to-teal-600' },
  { id: '5', business: 'Elite Barber Co', category: 'Barber', offer: '£5 off any haircut this month', discount: '£5 Off', distance: '1.5km away', icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222', gradient: 'from-blue-500 to-indigo-600' },
  { id: '6', business: 'The Bakery Corner', category: 'Bakery', offer: 'Free croissant with any coffee', discount: 'Free Croissant', distance: '300m away', icon: 'M3 5a1 1 0 001 1h8v4H6a1 1 0 00-1 1v2h7v3H6a1 1 0 00-1 1v2a1 1 0 001 1h3m14 0a1 1 0 01-1-1v-6a1 1 0 00-1-1h-4v-4a1 1 0 011-1h4a1 1 0 011 1v11a1 1 0 01-1 1z', gradient: 'from-yellow-500 to-amber-600' },
]

// ── Consumer Exchange & Redeem Items ────────────────────────────────
export interface ExchangeItem {
  id: string
  title: string
  type: 'Card' | 'Coupon' | 'Gift Card' | 'Offer' | 'Reward' | 'Cashback'
  business: string
  value: string
  expires: string
  icon: string
  color: string
}

export const mockExchangeItems: ExchangeItem[] = [
  { id: '1', title: 'GreenLeaf Coffee Reward', type: 'Reward', business: 'GreenLeaf Coffee', value: '200 points', expires: '31 Aug 2026', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
  { id: '2', title: 'FitLife Class Pass', type: 'Coupon', business: 'FitLife Studio', value: '1 free class', expires: '15 Sep 2026', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
  { id: '3', title: '£2 e-Card Voucher', type: 'Gift Card', business: 'MCOMVCard', value: '£2.00', expires: '15 Jan 2027', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
  { id: '4', title: 'Bloom Beauty Discount', type: 'Offer', business: 'Bloom Beauty Salon', value: '20% off', expires: '30 Sep 2026', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20' },
]

export const mockRedeemItems: ExchangeItem[] = [
  { id: '1', title: 'Free Coffee', type: 'Reward', business: 'GreenLeaf Coffee', value: 'Free', expires: '31 Aug 2026', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
  { id: '2', title: '£2 Cashback', type: 'Cashback', business: 'MCOMVCard', value: '£2.00', expires: '15 Jan 2027', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
  { id: '3', title: '£2 e-Card Voucher', type: 'Gift Card', business: 'MCOMVCard', value: '£2.00', expires: '15 Jan 2027', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
  { id: '4', title: '10% Off Voucher', type: 'Coupon', business: 'GreenLeaf Coffee', value: '10% off', expires: '15 Sep 2026', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
]

// ── Consumer Notifications ──────────────────────────────────────────
export interface ConsumerNotification {
  id: string
  title: string
  message: string
  time: string
  type: 'cashback' | 'reward' | 'offer' | 'voucher' | 'family'
  read: boolean
  icon: string
  color: string
  action?: { label: string; to: string }
}

export const mockConsumerNotifications: ConsumerNotification[] = [
  { id: '1', title: 'New Cashback Earned', message: 'You earned £2.00 cashback from GreenLeaf Coffee', time: '2 hours ago', type: 'cashback', read: false, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-green-600 bg-green-50 dark:bg-green-900/20', action: { label: 'View Wallet', to: '/c/wallet' } },
  { id: '2', title: 'New Reward Available', message: 'Your 200 point reward from GreenLeaf Coffee is ready to redeem', time: '5 hours ago', type: 'reward', read: false, icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20', action: { label: 'Redeem', to: '/c/rewards' } },
  { id: '3', title: 'Business Shared Offer', message: 'FitLife Studio shared a new offer: Free trial session!', time: '1 day ago', type: 'offer', read: false, icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20', action: { label: 'View Offer', to: '/c/cards' } },
  { id: '4', title: 'Voucher Expires Tomorrow', message: 'Your "Free Coffee" voucher expires tomorrow. Use it today!', time: '1 day ago', type: 'voucher', read: false, icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20', action: { label: 'Use Voucher', to: '/c/wallet' } },
  { id: '5', title: 'Family Card Active', message: 'Sarah\'s family card is now active and ready to use', time: '2 days ago', type: 'family', read: true, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', action: { label: 'View Family', to: '/c/family' } },
]

// ── Front CMS ───────────────────────────────────────────────────────
export const mockFrontCMS: FrontCMS = {
  hero_title: 'Create Your Digital Business Card in Minutes',
  hero_subtitle: 'Transform the way you share contact information. Create stunning digital vCards with customizable templates, appointment scheduling, and more.',
  hero_image: '/assets/img/new_home_page/hero-image.png',
  about_title: 'About Mobile VCard Link',
  about_description: 'We are a team of passionate developers and designers dedicated to revolutionizing how professionals share their contact information. Our platform combines elegant design with powerful features to help you make a lasting impression.',
  about_image: '',
  contact_email: 'hello@mobilevcardlink.com',
  contact_phone: '+1 (555) 123-4567',
  contact_address: '123 Business Ave, Suite 100, San Francisco, CA 94102',
  faq_title: 'Frequently Asked Questions',
  faq_items: mockFaqs,
}