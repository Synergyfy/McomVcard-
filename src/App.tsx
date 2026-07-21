import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/layout/Layout'
import AdminLayout from './components/admin/AdminLayout'
import UserLayout from './components/user/UserLayout'
import ConsumerLayout from './components/consumer/ConsumerLayout'

const HomePage = lazy(() => import('./pages/HomePage'))
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'))
const UserDashboardPage = lazy(() => import('./pages/user/DashboardPage'))
const UserVCardListPage = lazy(() => import('./pages/user/vcards/VCardListPage'))
const VCardCreatePage = lazy(() => import('./pages/user/vcards/VCardCreatePage'))
const VCardEditPage = lazy(() => import('./pages/user/vcards/VCardEditPage'))
const AppointmentsPage = lazy(() => import('./pages/user/appointments/AppointmentsPage'))
const AnalyticsPage = lazy(() => import('./pages/user/analytics/AnalyticsPage'))
const SubscriptionPage = lazy(() => import('./pages/user/subscriptions/SubscriptionPage'))
const UserSettingsPage = lazy(() => import('./pages/user/settings/UserSettingsPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const UserListPage = lazy(() => import('./pages/admin/users/UserListPage'))
const UserCreatePage = lazy(() => import('./pages/admin/users/UserCreatePage'))
const UserEditPage = lazy(() => import('./pages/admin/users/UserEditPage'))
const AdminVCardListPage = lazy(() => import('./pages/admin/VCardListPage'))
const PlanListPage = lazy(() => import('./pages/admin/plans/PlanListPage'))
const PlanCreatePage = lazy(() => import('./pages/admin/plans/PlanCreatePage'))
const PlanEditPage = lazy(() => import('./pages/admin/plans/PlanEditPage'))
const PlanDetailPage = lazy(() => import('./pages/admin/plans/PlanDetailPage'))
const TemplateListPage = lazy(() => import('./pages/admin/templates/TemplateListPage'))
const CurrencyListPage = lazy(() => import('./pages/admin/currencies/CurrencyListPage'))
const CurrencyCreatePage = lazy(() => import('./pages/admin/currencies/CurrencyCreatePage'))
const RoleListPage = lazy(() => import('./pages/admin/roles/RoleListPage'))
const TestimonialListPage = lazy(() => import('./pages/admin/testimonials/TestimonialListPage'))
const FeatureListPage = lazy(() => import('./pages/admin/features/FeatureListPage'))
const AboutUsListPage = lazy(() => import('./pages/admin/about/AboutUsListPage'))
const EnquiryListPage = lazy(() => import('./pages/admin/enquiries/EnquiryListPage'))
const SubscriberListPage = lazy(() => import('./pages/admin/subscribers/SubscriberListPage'))
const SettingsPage = lazy(() => import('./pages/admin/settings/SettingsPage'))
const SubscribedPlansPage = lazy(() => import('./pages/admin/subscribed-plans/SubscribedPlansPage'))
const CashPaymentsPage = lazy(() => import('./pages/admin/cash-payments/CashPaymentsPage'))
const AffiliateUsersPage = lazy(() => import('./pages/admin/affiliate-users/AffiliateUsersPage'))
const AffiliateTransactionsPage = lazy(() => import('./pages/admin/affiliate-transactions/AffiliateTransactionsPage'))
const WithdrawTransactionsPage = lazy(() => import('./pages/admin/withdraw-transactions/WithdrawTransactionsPage'))
const CountryListPage = lazy(() => import('./pages/admin/countries/CountryListPage'))
const CountryFormPage = lazy(() => import('./pages/admin/countries/CountryFormPage'))
const LanguageListPage = lazy(() => import('./pages/admin/languages/LanguageListPage'))
const LanguageFormPage = lazy(() => import('./pages/admin/languages/LanguageFormPage'))
const TranslationsPage = lazy(() => import('./pages/admin/languages/TranslationsPage'))
const CouponListPage = lazy(() => import('./pages/admin/coupon-codes/CouponListPage'))
const CouponFormPage = lazy(() => import('./pages/admin/coupon-codes/CouponFormPage'))
const FrontCMSPage = lazy(() => import('./pages/admin/front-cms/FrontCMSPage'))
const EmailTemplateListPage = lazy(() => import('./pages/admin/email-templates/EmailTemplateListPage'))
const EmailTemplateFormPage = lazy(() => import('./pages/admin/email-templates/EmailTemplateFormPage'))
const ActivityLogsPage = lazy(() => import('./pages/admin/activity-logs/ActivityLogsPage'))
const NewsletterPage = lazy(() => import('./pages/admin/newsletter/NewsletterPage'))
const SystemInfoPage = lazy(() => import('./pages/admin/system-info/SystemInfoPage'))
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const BusinessListPage = lazy(() => import('./pages/admin/businesses/BusinessListPage'))
const BusinessProfilePage = lazy(() => import('./pages/admin/businesses/BusinessProfilePage'))
const ConsumerListPage = lazy(() => import('./pages/admin/consumers/ConsumerListPage'))
const ConsumerProfilePage = lazy(() => import('./pages/admin/consumers/ConsumerProfilePage'))
const CardListPage = lazy(() => import('./pages/admin/cards/CardListPage'))
const CardDetailPage = lazy(() => import('./pages/admin/cards/CardDetailPage'))
const TemplateCreatePage = lazy(() => import('./pages/admin/templates/TemplateCreatePage'))
const RewardListPage = lazy(() => import('./pages/admin/rewards/RewardListPage'))
const CampaignListPage = lazy(() => import('./pages/admin/campaigns/CampaignListPage'))
const BookingListPage = lazy(() => import('./pages/admin/bookings/BookingListPage'))
const WalletPage = lazy(() => import('./pages/admin/wallet/WalletPage'))
const QRCodeListPage = lazy(() => import('./pages/admin/qr-codes/QRCodeListPage'))
const NFCCardListPage = lazy(() => import('./pages/admin/nfc-cards/NFCCardListPage'))
const PrintOrderListPage = lazy(() => import('./pages/admin/print-orders/PrintOrderListPage'))
const AnalyticsOverviewPage = lazy(() => import('./pages/admin/analytics/AnalyticsPage'))
const MarketplacePage = lazy(() => import('./pages/admin/marketplace/MarketplacePage'))
const SupportCenterPage = lazy(() => import('./pages/admin/support/SupportCenterPage'))
const GamificationPage = lazy(() => import('./pages/admin/gamification/GamificationPage'))
const CardsPage = lazy(() => import('./pages/CardsPage'))
const TemplateCustomizePage = lazy(() => import('./pages/user/templates/TemplateCustomizePage'))
const BusinessCardsPage = lazy(() => import('./pages/user/cards/BusinessCardsPage'))
const ConsumerDashboardPage = lazy(() => import('./pages/consumer/ConsumerDashboardPage'))
const ConsumerCardDesignsPage = lazy(() => import('./pages/consumer/ConsumerCardDesignsPage'))
const ConsumerVCardTemplatesPage = lazy(() => import('./pages/consumer/ConsumerVCardTemplatesPage'))
const ConsumerSavedCardsPage = lazy(() => import('./pages/consumer/ConsumerSavedCardsPage'))
const ConsumerWalletPage = lazy(() => import('./pages/consumer/ConsumerWalletPage'))
const ConsumerBookingsPage = lazy(() => import('./pages/consumer/ConsumerBookingsPage'))
const ConsumerRewardsPage = lazy(() => import('./pages/consumer/ConsumerRewardsPage'))
const ConsumerReferralsPage = lazy(() => import('./pages/consumer/ConsumerReferralsPage'))
const ConsumerSettingsPage = lazy(() => import('./pages/consumer/ConsumerSettingsPage'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/templates" element={<TemplatesPage />} />
                  <Route path="/cards" element={<CardsPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                </Route>

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />

                <Route element={<UserLayout />}>
                  <Route path="/dashboard" element={<UserDashboardPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/user/vcards" element={<UserVCardListPage />} />
                  <Route path="/user/vcards/create" element={<VCardCreatePage />} />
                  <Route path="/user/vcards/:id/edit" element={<VCardEditPage />} />
                  <Route path="/user/templates/:id/customize" element={<TemplateCustomizePage />} />
                  <Route path="/user/cards" element={<BusinessCardsPage />} />
                  <Route path="/user/appointments" element={<AppointmentsPage />} />
                  <Route path="/user/analytics" element={<AnalyticsPage />} />
                  <Route path="/user/subscription" element={<SubscriptionPage />} />
                  <Route path="/user/settings" element={<UserSettingsPage />} />
                </Route>

                <Route element={<ConsumerLayout />}>
                  <Route path="/consumer" element={<ConsumerDashboardPage />} />
                  <Route path="/consumer/card-designs" element={<ConsumerCardDesignsPage />} />
                  <Route path="/consumer/vcard-templates" element={<ConsumerVCardTemplatesPage />} />
                  <Route path="/consumer/cards" element={<ConsumerSavedCardsPage />} />
                  <Route path="/consumer/wallet" element={<ConsumerWalletPage />} />
                  <Route path="/consumer/bookings" element={<ConsumerBookingsPage />} />
                  <Route path="/consumer/rewards" element={<ConsumerRewardsPage />} />
                  <Route path="/consumer/referrals" element={<ConsumerReferralsPage />} />
                  <Route path="/consumer/settings" element={<ConsumerSettingsPage />} />
                </Route>

                <Route path="/admin/login" element={<AdminLoginPage />} />

                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/users" element={<UserListPage />} />
                  <Route path="/admin/users/create" element={<UserCreatePage />} />
                  <Route path="/admin/users/:id/edit" element={<UserEditPage />} />
                  <Route path="/admin/businesses" element={<BusinessListPage />} />
                  <Route path="/admin/businesses/:id" element={<BusinessProfilePage />} />
                  <Route path="/admin/consumers" element={<ConsumerListPage />} />
                  <Route path="/admin/consumers/:id" element={<ConsumerProfilePage />} />
                  <Route path="/admin/templates/create" element={<TemplateCreatePage />} />
                  <Route path="/admin/templates/:id/edit" element={<TemplateCreatePage />} />
                  <Route path="/admin/templates" element={<TemplateListPage />} />
                  <Route path="/admin/cards/:id" element={<CardDetailPage />} />
                  <Route path="/admin/cards" element={<CardListPage />} />
                  <Route path="/admin/rewards" element={<RewardListPage />} />
                  <Route path="/admin/campaigns" element={<CampaignListPage />} />
                  <Route path="/admin/bookings" element={<BookingListPage />} />
                  <Route path="/admin/wallet" element={<WalletPage />} />
                  <Route path="/admin/qr-codes" element={<QRCodeListPage />} />
                  <Route path="/admin/gamification" element={<GamificationPage />} />
                  <Route path="/admin/nfc-cards" element={<NFCCardListPage />} />
                  <Route path="/admin/print-orders" element={<PrintOrderListPage />} />
                  <Route path="/admin/analytics" element={<AnalyticsOverviewPage />} />
                  <Route path="/admin/marketplace" element={<MarketplacePage />} />
                  <Route path="/admin/support" element={<SupportCenterPage />} />
                  <Route path="/admin/settings" element={<SettingsPage />} />
                  <Route path="/admin/vcards" element={<AdminVCardListPage />} />
                  <Route path="/admin/plans" element={<PlanListPage />} />
                  <Route path="/admin/plans/create" element={<PlanCreatePage />} />
                  <Route path="/admin/plans/:id" element={<PlanDetailPage />} />
                  <Route path="/admin/plans/:id/edit" element={<PlanEditPage />} />
                  <Route path="/admin/currencies" element={<CurrencyListPage />} />
                  <Route path="/admin/currencies/create" element={<CurrencyCreatePage />} />
                  <Route path="/admin/roles" element={<RoleListPage />} />
                  <Route path="/admin/testimonials" element={<TestimonialListPage />} />
                  <Route path="/admin/features" element={<FeatureListPage />} />
                  <Route path="/admin/about-us" element={<AboutUsListPage />} />
                  <Route path="/admin/enquiries" element={<EnquiryListPage />} />
                  <Route path="/admin/subscribers" element={<SubscriberListPage />} />
                  <Route path="/admin/subscribed-plans" element={<SubscribedPlansPage />} />
                  <Route path="/admin/cash-payments" element={<CashPaymentsPage />} />
                  <Route path="/admin/affiliate-users" element={<AffiliateUsersPage />} />
                  <Route path="/admin/affiliate-transactions" element={<AffiliateTransactionsPage />} />
                  <Route path="/admin/withdraw-transactions" element={<WithdrawTransactionsPage />} />
                  <Route path="/admin/countries" element={<CountryListPage />} />
                  <Route path="/admin/countries/create" element={<CountryFormPage />} />
                  <Route path="/admin/countries/:id/edit" element={<CountryFormPage />} />
                  <Route path="/admin/languages" element={<LanguageListPage />} />
                  <Route path="/admin/languages/create" element={<LanguageFormPage />} />
                  <Route path="/admin/languages/:id/edit" element={<LanguageFormPage />} />
                  <Route path="/admin/languages/:id/translations" element={<TranslationsPage />} />
                  <Route path="/admin/coupon-codes" element={<CouponListPage />} />
                  <Route path="/admin/coupon-codes/create" element={<CouponFormPage />} />
                  <Route path="/admin/coupon-codes/:id/edit" element={<CouponFormPage />} />
                  <Route path="/admin/front-cms" element={<FrontCMSPage />} />
                  <Route path="/admin/email-templates" element={<EmailTemplateListPage />} />
                  <Route path="/admin/email-templates/:id/edit" element={<EmailTemplateFormPage />} />
                  <Route path="/admin/activity-logs" element={<ActivityLogsPage />} />
                  <Route path="/admin/newsletter" element={<NewsletterPage />} />
                  <Route path="/admin/system-info" element={<SystemInfoPage />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}
