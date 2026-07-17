import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/layout/Layout'
import AdminLayout from './components/admin/AdminLayout'
import UserLayout from './components/user/UserLayout'
import ConsumerLayout from './components/consumer/ConsumerLayout'
import HomePage from './pages/HomePage'
import TemplatesPage from './pages/TemplatesPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import ProfilePage from './pages/profile/ProfilePage'
import UserDashboardPage from './pages/user/DashboardPage'
import UserVCardListPage from './pages/user/vcards/VCardListPage'
import VCardCreatePage from './pages/user/vcards/VCardCreatePage'
import VCardEditPage from './pages/user/vcards/VCardEditPage'
import AppointmentsPage from './pages/user/appointments/AppointmentsPage'
import AnalyticsPage from './pages/user/analytics/AnalyticsPage'
import SubscriptionPage from './pages/user/subscriptions/SubscriptionPage'
import UserSettingsPage from './pages/user/settings/UserSettingsPage'
import AdminDashboardPage from './pages/admin/DashboardPage'
import UserListPage from './pages/admin/users/UserListPage'
import UserCreatePage from './pages/admin/users/UserCreatePage'
import UserEditPage from './pages/admin/users/UserEditPage'
import AdminVCardListPage from './pages/admin/VCardListPage'
import PlanListPage from './pages/admin/plans/PlanListPage'
import PlanCreatePage from './pages/admin/plans/PlanCreatePage'
import PlanEditPage from './pages/admin/plans/PlanEditPage'
import PlanDetailPage from './pages/admin/plans/PlanDetailPage'
import TemplateListPage from './pages/admin/templates/TemplateListPage'
import CurrencyListPage from './pages/admin/currencies/CurrencyListPage'
import CurrencyCreatePage from './pages/admin/currencies/CurrencyCreatePage'
import RoleListPage from './pages/admin/roles/RoleListPage'
import TestimonialListPage from './pages/admin/testimonials/TestimonialListPage'
import FeatureListPage from './pages/admin/features/FeatureListPage'
import AboutUsListPage from './pages/admin/about/AboutUsListPage'
import EnquiryListPage from './pages/admin/enquiries/EnquiryListPage'
import SubscriberListPage from './pages/admin/subscribers/SubscriberListPage'
import SettingsPage from './pages/admin/settings/SettingsPage'

import SubscribedPlansPage from './pages/admin/subscribed-plans/SubscribedPlansPage'
import CashPaymentsPage from './pages/admin/cash-payments/CashPaymentsPage'
import AffiliateUsersPage from './pages/admin/affiliate-users/AffiliateUsersPage'
import AffiliateTransactionsPage from './pages/admin/affiliate-transactions/AffiliateTransactionsPage'
import WithdrawTransactionsPage from './pages/admin/withdraw-transactions/WithdrawTransactionsPage'
import CountryListPage from './pages/admin/countries/CountryListPage'
import CountryFormPage from './pages/admin/countries/CountryFormPage'
import LanguageListPage from './pages/admin/languages/LanguageListPage'
import LanguageFormPage from './pages/admin/languages/LanguageFormPage'
import TranslationsPage from './pages/admin/languages/TranslationsPage'
import CouponListPage from './pages/admin/coupon-codes/CouponListPage'
import CouponFormPage from './pages/admin/coupon-codes/CouponFormPage'
import FrontCMSPage from './pages/admin/front-cms/FrontCMSPage'
import EmailTemplateListPage from './pages/admin/email-templates/EmailTemplateListPage'
import EmailTemplateFormPage from './pages/admin/email-templates/EmailTemplateFormPage'
import ActivityLogsPage from './pages/admin/activity-logs/ActivityLogsPage'
import NewsletterPage from './pages/admin/newsletter/NewsletterPage'
import SystemInfoPage from './pages/admin/system-info/SystemInfoPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import BusinessListPage from './pages/admin/businesses/BusinessListPage'
import BusinessProfilePage from './pages/admin/businesses/BusinessProfilePage'
import ConsumerListPage from './pages/admin/consumers/ConsumerListPage'
import ConsumerProfilePage from './pages/admin/consumers/ConsumerProfilePage'
import CardListPage from './pages/admin/cards/CardListPage'
import CardDetailPage from './pages/admin/cards/CardDetailPage'
import TemplateCreatePage from './pages/admin/templates/TemplateCreatePage'
import RewardListPage from './pages/admin/rewards/RewardListPage'
import CampaignListPage from './pages/admin/campaigns/CampaignListPage'
import BookingListPage from './pages/admin/bookings/BookingListPage'
import WalletPage from './pages/admin/wallet/WalletPage'
import QRCodeListPage from './pages/admin/qr-codes/QRCodeListPage'
import NFCCardListPage from './pages/admin/nfc-cards/NFCCardListPage'
import PrintOrderListPage from './pages/admin/print-orders/PrintOrderListPage'
import AnalyticsOverviewPage from './pages/admin/analytics/AnalyticsPage'
import MarketplacePage from './pages/admin/marketplace/MarketplacePage'
import SupportCenterPage from './pages/admin/support/SupportCenterPage'
import GamificationPage from './pages/admin/gamification/GamificationPage'
import CardsPage from './pages/CardsPage'
import TemplateCustomizePage from './pages/user/templates/TemplateCustomizePage'
import BusinessCardsPage from './pages/user/cards/BusinessCardsPage'
import ConsumerDashboardPage from './pages/consumer/ConsumerDashboardPage'
import ConsumerCardDesignsPage from './pages/consumer/ConsumerCardDesignsPage'
import ConsumerVCardTemplatesPage from './pages/consumer/ConsumerVCardTemplatesPage'
import ConsumerSavedCardsPage from './pages/consumer/ConsumerSavedCardsPage'
import ConsumerWalletPage from './pages/consumer/ConsumerWalletPage'
import ConsumerBookingsPage from './pages/consumer/ConsumerBookingsPage'
import ConsumerRewardsPage from './pages/consumer/ConsumerRewardsPage'
import ConsumerReferralsPage from './pages/consumer/ConsumerReferralsPage'
import ConsumerSettingsPage from './pages/consumer/ConsumerSettingsPage'

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/cards" element={<CardsPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Route>

              {/* Auth routes (no layout) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              {/* User dashboard routes */}
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

              {/* Consumer dashboard routes */}
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

              {/* Admin Login (no layout) */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Admin routes */}
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
                {/* Admin routes */}
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
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}
