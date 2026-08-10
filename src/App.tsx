import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/layout/Layout'
import AdminLayout from './components/admin/AdminLayout'
import UserLayout from './components/user/UserLayout'
import ConsumerLayout from './components/consumer/ConsumerLayout'
import BusinessLayout from './components/business/layout/BusinessLayout'

const HomePage = lazy(() => import('./pages/HomePage'))
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
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
const UserVCardListPage = lazy(() => import('./pages/user/vcards/VCardListPage'))
const AppointmentsPage = lazy(() => import('./pages/user/appointments/AppointmentsPage'))
const AnalyticsPage = lazy(() => import('./pages/user/analytics/AnalyticsPage'))
const SubscriptionPage = lazy(() => import('./pages/user/subscriptions/SubscriptionPage'))
const UserSettingsPage = lazy(() => import('./pages/user/settings/UserSettingsPage'))
const MCOMSolutionsPage = lazy(() => import('./pages/onboarding/MCOMSolutionsPage'))
const ChooseMembershipPage = lazy(() => import('./pages/onboarding/ChooseMembershipPage'))
const PaymentPage = lazy(() => import('./pages/onboarding/PaymentPage'))
const MembershipConfirmationPage = lazy(() => import('./pages/onboarding/MembershipConfirmationPage'))
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
const AdminSectorsPage = lazy(() => import('./pages/admin/settings/SectorsPage'))
const AdminSeasonsPage = lazy(() => import('./pages/admin/settings/SeasonsPage'))
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
const VM_BizVCardTemplates = lazy(() => import('./pages/admin/card-management/BusinessVCardTemplatesPage'))
const VM_ConVCardTemplates = lazy(() => import('./pages/admin/card-management/ConsumerVCardTemplatesPage'))
const VM_TemplateBuilder = lazy(() => import('./pages/admin/card-management/TemplateBuilderPage'))
const VM_QrCustomizer = lazy(() => import('./pages/admin/vcard-management/QrCustomizerPage'))
const PublicTemplatePage = lazy(() => import('./pages/public/PublicTemplatePage'))
const SharedCardPage = lazy(() => import('./pages/public/SharedCardPage'))
const SharedFamilyCardPage = lazy(() => import('./pages/public/SharedFamilyCardPage'))
const MembershipPricing = lazy(() => import('./pages/admin/membership/MembershipPricingPage'))
const MembershipMembershipsHub = lazy(() => import('./pages/admin/membership/MembershipsHubPage'))
const PublicPricingPage = lazy(() => import('./pages/public/PublicPricingPage'))
const FindBusinessPage = lazy(() => import('./pages/public/FindBusinessPage'))
const BusinessPublicProfilePage = lazy(() => import('./pages/public/BusinessPublicProfilePage'))
const MembershipBusinessMemberships = lazy(() => import('./pages/admin/membership/BusinessMembershipsPage'))
const MembershipConsumerMemberships = lazy(() => import('./pages/admin/membership/ConsumerMembershipsPage'))
const QR_Dashboard = lazy(() => import('./pages/admin/qr-management/QRDashboardPage'))
const QR_Codes = lazy(() => import('./pages/admin/qr-management/DynamicQRCodesPage'))
const QR_DesignSystem = lazy(() => import('./pages/admin/qr-management/QRDesignSystemPage'))
const QR_RoutingRules = lazy(() => import('./pages/admin/qr-management/QRRoutingRulesPage'))
const QR_Analytics = lazy(() => import('./pages/admin/qr-management/QRAnalyticsPage'))
const QR_Campaigns = lazy(() => import('./pages/admin/qr-management/QRCampaignsPage'))
const QR_AssetsDownloads = lazy(() => import('./pages/admin/qr-management/QRAssetsDownloadsPage'))
const QR_Activity = lazy(() => import('./pages/admin/qr-management/QRActivityPage'))
const CM_BizCardTemplates = lazy(() => import('./pages/admin/card-management/BusinessCardTemplatesPage'))
const CM_BizCardDetail = lazy(() => import('./pages/admin/card-management/BusinessCardTemplateDetailPage'))
const CM_ConCardTemplates = lazy(() => import('./pages/admin/card-management/ConsumerCardTemplatesPage'))
const CM_CardTemplateBuilder = lazy(() => import('./pages/admin/card-management/CardTemplateBuilderPage'))
const CM_ConCardBuilder = lazy(() => import('./pages/admin/card-management/ConsumerCardTemplateBuilderPage'))
const CM_FriendsFamilyConfig = lazy(() => import('./pages/admin/card-management/CardFriendsFamilyConfigPage'))
const CM_QrCustomizer = lazy(() => import('./pages/admin/card-management/CardQrCustomizerPage'))
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
const BusinessCardsPage = lazy(() => import('./pages/user/cards/BusinessCardsPage'))
const ConsumerHomePage = lazy(() => import('./pages/consumer/ConsumerHomePage'))
const ConsumerCardsPage = lazy(() => import('./pages/consumer/ConsumerCardsPage'))
const ConsumerFamilyPage = lazy(() => import('./pages/consumer/ConsumerFamilyPage'))
const ConsumerFamilyMemberPage = lazy(() => import('./pages/consumer/ConsumerFamilyMemberPage'))
const ConsumerActivityPage = lazy(() => import('./pages/consumer/ConsumerActivityPage'))
const ConsumerNotificationsPage = lazy(() => import('./pages/consumer/ConsumerNotificationsPage'))
const ConsumerMembershipPage = lazy(() => import('./pages/consumer/ConsumerMembershipPage'))
const ConsumerCardDesignsPage = lazy(() => import('./pages/consumer/ConsumerCardDesignsPage'))
const ConsumerCardEditPage = lazy(() => import('./pages/consumer/ConsumerCardEditPage'))
const ConsumerVCardTemplatesPage = lazy(() => import('./pages/consumer/ConsumerVCardTemplatesPage'))
const ConsumerVCardEditPage = lazy(() => import('./pages/consumer/ConsumerVCardEditPage'))
const ConsumerMyVCardPage = lazy(() => import('./pages/consumer/ConsumerMyVCardPage'))

const ConsumerWalletPage = lazy(() => import('./pages/consumer/ConsumerWalletPage'))
const ConsumerBookingsPage = lazy(() => import('./pages/consumer/ConsumerBookingsPage'))
const ConsumerRewardsPage = lazy(() => import('./pages/consumer/ConsumerRewardsPage'))
const ConsumerReferralsPage = lazy(() => import('./pages/consumer/ConsumerReferralsPage'))
const ConsumerSettingsPage = lazy(() => import('./pages/consumer/ConsumerSettingsPage'))
const ConsumerSetupPage = lazy(() => import('./pages/consumer/ConsumerSetupPage'))

/* ── MCOMVCard Business Operations Dashboard ─────────────────────── */
const MyBusinessPage = lazy(() => import('./pages/business/MyBusinessPage'))
const BusinessVCardsPage = lazy(() => import('./pages/business/VCardsPage'))
const BusinessVCardDetailPage = lazy(() => import('./pages/business/VCardDetailPage'))
const BusinessVCardContentEditorPage = lazy(() => import('./pages/business/vcard/VCardContentEditorPage'))
const BusinessMyCardsPage = lazy(() => import('./pages/business/CardsPage'))
const BusinessCardDetailPage = lazy(() => import('./pages/business/CardDetailPage'))
const BusinessCardContentEditorPage = lazy(() => import('./pages/business/card/CardContentEditorPage'))
const BusinessMembershipPage = lazy(() => import('./pages/business/MembershipPage'))
const BusinessMembershipPlansPage = lazy(() => import('./pages/business/MembershipPlansPage'))
const BusinessMembershipConfirmationPage = lazy(() => import('./pages/business/MembershipConfirmationPage'))
const BusinessReportsPage = lazy(() => import('./pages/business/ReportsPage'))
const BusinessIntegrationsPage = lazy(() => import('./pages/business/IntegrationsPage'))
const BusinessHelpSupportPage = lazy(() => import('./pages/business/HelpSupportPage'))
const BusinessSettingsPage = lazy(() => import('./pages/business/SettingsPage'))
const BusinessCustomersPage = lazy(() => import('./pages/business/CustomersPage'))
const BusinessCustomerDetailPage = lazy(() => import('./pages/business/CustomerDetailPage'))
const BusinessRewardsPage = lazy(() => import('./pages/business/RewardsPage'))
const BusinessIssueRewardPage = lazy(() => import('./pages/business/rewards/IssueRewardPage'))
const BusinessCampaignsPage = lazy(() => import('./pages/business/rewards/CampaignsPage'))
const BusinessCouponsPage = lazy(() => import('./pages/business/rewards/CouponsPage'))
const BusinessCashbackPage = lazy(() => import('./pages/business/rewards/CashbackPage'))
const BusinessGiftCardsPage = lazy(() => import('./pages/business/rewards/GiftCardsPage'))
const BusinessRedeemHistoryPage = lazy(() => import('./pages/business/rewards/RedeemHistoryPage'))
const BusinessRewardsIssuedPage = lazy(() => import('./pages/business/rewards/RewardsIssuedPage'))
const BusinessPendingRewardsPage = lazy(() => import('./pages/business/rewards/PendingRewardsPage'))
const BusinessFamilyPage = lazy(() => import('./pages/business/FamilyPage'))
const BusinessAppointmentsPage = lazy(() => import('./pages/business/AppointmentsPage'))
const BusinessAnalyticsPage = lazy(() => import('./pages/business/AnalyticsPage'))
const BusinessNotificationsPage = lazy(() => import('./pages/business/NotificationsPage'))
const BusinessWalletPage = lazy(() => import('./pages/business/WalletPage'))
const BusinessQRCodePage = lazy(() => import('./pages/business/QRCodePage'))

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
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/templates" element={<TemplatesPage />} />
                  <Route path="/cards" element={<CardsPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/t/:templateId" element={<PublicTemplatePage />} />
                  <Route path="/c/:cardId" element={<SharedCardPage />} />
                  <Route path="/f/:id" element={<SharedFamilyCardPage />} />
                  <Route path="/membership" element={<PublicPricingPage />} />
                  <Route path="/find-a-business" element={<FindBusinessPage />} />
                  <Route path="/find-a-business/:id" element={<BusinessPublicProfilePage />} />
                </Route>

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/onboarding/mcom-solutions" element={<MCOMSolutionsPage />} />
                <Route path="/onboarding/choose-membership" element={<ChooseMembershipPage />} />
                <Route path="/onboarding/payment" element={<PaymentPage />} />
                <Route path="/onboarding/confirmation" element={<MembershipConfirmationPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/consumer/setup" element={<ConsumerSetupPage />} />

                <Route element={<UserLayout />}>
                  <Route path="/dashboard" element={<Navigate to="/business" replace />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/user/vcards" element={<UserVCardListPage />} />
                  {/* Design-oriented routes redirect to the operations dashboard */}
                  <Route path="/user/vcards/create" element={<Navigate to="/business/vcards" replace />} />
                  <Route path="/user/vcards/:id/edit" element={<Navigate to="/business/vcards" replace />} />
                  <Route path="/user/templates/:id/customize" element={<Navigate to="/business/vcards" replace />} />
                  <Route path="/user/cards" element={<BusinessCardsPage />} />
                  <Route path="/user/cards/:id/edit" element={<Navigate to="/business/cards" replace />} />
                  <Route path="/user/appointments" element={<AppointmentsPage />} />
                  <Route path="/user/analytics" element={<AnalyticsPage />} />
                  <Route path="/user/subscription" element={<SubscriptionPage />} />
                  <Route path="/user/settings" element={<UserSettingsPage />} />
                </Route>

                {/* ── MCOMVCard Business Operations Dashboard ── */}
                <Route element={<BusinessLayout />}>
                  <Route path="/business" element={<MyBusinessPage />} />
                  <Route path="/business/vcards" element={<BusinessVCardsPage />} />
                  <Route path="/business/vcards/:id" element={<BusinessVCardDetailPage />} />
                  <Route path="/business/vcards/:id/edit" element={<BusinessVCardContentEditorPage />} />
                  <Route path="/business/cards" element={<BusinessMyCardsPage />} />
                  <Route path="/business/cards/:id" element={<BusinessCardDetailPage />} />
                  <Route path="/business/cards/:id/edit" element={<BusinessCardContentEditorPage />} />
                  <Route path="/business/membership" element={<BusinessMembershipPage />} />
                  <Route path="/business/membership/plans" element={<BusinessMembershipPlansPage />} />
                  <Route path="/business/membership/confirmation" element={<BusinessMembershipConfirmationPage />} />
                  <Route path="/business/reports" element={<BusinessReportsPage />} />
                  <Route path="/business/integrations" element={<BusinessIntegrationsPage />} />
                  <Route path="/business/help" element={<BusinessHelpSupportPage />} />
                  <Route path="/business/settings" element={<BusinessSettingsPage />} />
                  <Route path="/business/customers" element={<BusinessCustomersPage />} />
                  <Route path="/business/customers/:id" element={<BusinessCustomerDetailPage />} />
                  <Route path="/business/rewards" element={<BusinessRewardsPage />} />
                  <Route path="/business/rewards/issue" element={<BusinessIssueRewardPage />} />
                  <Route path="/business/rewards/campaigns" element={<BusinessCampaignsPage />} />
                  <Route path="/business/rewards/coupons" element={<BusinessCouponsPage />} />
                  <Route path="/business/rewards/cashback" element={<BusinessCashbackPage />} />
                  <Route path="/business/rewards/gift-cards" element={<BusinessGiftCardsPage />} />
                  <Route path="/business/rewards/history" element={<BusinessRedeemHistoryPage />} />
                  <Route path="/business/rewards/issued" element={<BusinessRewardsIssuedPage />} />
                  <Route path="/business/rewards/pending" element={<BusinessPendingRewardsPage />} />
                  <Route path="/business/family" element={<BusinessFamilyPage />} />
                  <Route path="/business/appointments" element={<BusinessAppointmentsPage />} />
                  <Route path="/business/analytics" element={<BusinessAnalyticsPage />} />
                  <Route path="/business/notifications" element={<BusinessNotificationsPage />} />
                  <Route path="/business/wallet" element={<BusinessWalletPage />} />
                  <Route path="/business/qr" element={<BusinessQRCodePage />} />
                </Route>

                <Route element={<ConsumerLayout />}>
                  <Route path="/consumer" element={<ConsumerHomePage />} />
                  <Route path="/consumer/cards" element={<ConsumerCardsPage />} />
                  <Route path="/consumer/family" element={<ConsumerFamilyPage />} />
                  <Route path="/consumer/family/:id" element={<ConsumerFamilyMemberPage />} />
                  <Route path="/consumer/activity" element={<ConsumerActivityPage />} />
                  <Route path="/consumer/notifications" element={<ConsumerNotificationsPage />} />
                  <Route path="/consumer/membership" element={<ConsumerMembershipPage />} />
                  <Route path="/consumer/card-designs" element={<ConsumerCardDesignsPage />} />
                  <Route path="/consumer/cards/:designId/edit" element={<ConsumerCardEditPage />} />
                  <Route path="/consumer/vcard-templates/:id/edit" element={<ConsumerVCardEditPage />} />
                  <Route path="/consumer/vcard-templates" element={<ConsumerVCardTemplatesPage />} />

                  <Route path="/consumer/vcard" element={<ConsumerMyVCardPage />} />
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
                  <Route path="/admin/vcard-management" element={<Navigate to="/admin/vcard-management/business-vcard-templates" replace />} />
                  <Route path="/admin/vcard-management/business-vcards" element={<Navigate to="/admin/vcard-management/business-vcard-templates" replace />} />
                  <Route path="/admin/vcard-management/consumer-vcards" element={<Navigate to="/admin/vcard-management/consumer-vcard-templates" replace />} />
                  <Route path="/admin/vcard-management/components-library" element={<Navigate to="/admin/vcard-management/template-builder?tab=content" replace />} />
                  <Route path="/admin/vcard-management/business-vcard-templates" element={<VM_BizVCardTemplates />} />
                  <Route path="/admin/vcard-management/consumer-vcard-templates" element={<VM_ConVCardTemplates />} />
                  <Route path="/admin/vcard-management/template-builder" element={<VM_TemplateBuilder />} />
                  <Route path="/admin/vcard-management/qr-customizer" element={<VM_QrCustomizer />} />
                  <Route path="/admin/vcard-management/assignment" element={<Navigate to="/admin/vcard-management/template-builder?tab=assignment" replace />} />
                  <Route path="/admin/vcard-management/dynamic-qr" element={<Navigate to="/admin/vcard-management/template-builder?tab=qr" replace />} />
                  <Route path="/admin/vcard-management/activity" element={<Navigate to="/admin/vcard-management/template-builder?tab=activity" replace />} />
                  <Route path="/admin/vcard-management/version-history" element={<Navigate to="/admin/vcard-management/template-builder?tab=history" replace />} />
                  <Route path="/admin/membership" element={<Navigate to="/admin/membership/pricing" replace />} />
                  <Route path="/admin/membership/plans" element={<Navigate to="/admin/membership/pricing" replace />} />
                  <Route path="/admin/membership/activity" element={<Navigate to="/admin/membership/pricing" replace />} />
                  <Route path="/admin/membership/pricing" element={<MembershipPricing />} />
                  <Route path="/admin/membership/memberships" element={<MembershipMembershipsHub />} />
                  <Route path="/admin/membership/plan-builder" element={<Navigate to="/admin/membership/pricing" replace />} />
                  <Route path="/admin/membership/entitlements" element={<Navigate to="/admin/membership/pricing?section=entitlements" replace />} />
                  <Route path="/admin/membership/business-memberships" element={<MembershipBusinessMemberships />} />
                  <Route path="/admin/membership/consumer-memberships" element={<MembershipConsumerMemberships />} />
                  <Route path="/admin/membership/upgrades" element={<Navigate to="/admin/membership/pricing?section=upgrades" replace />} />
                  <Route path="/admin/membership/promotions" element={<Navigate to="/admin/membership/pricing?section=promotions" replace />} />
                  <Route path="/admin/membership/settings" element={<Navigate to="/admin/membership/pricing?section=settings" replace />} />
                  <Route path="/admin/qr/dashboard" element={<QR_Dashboard />} />
                  <Route path="/admin/qr/codes" element={<QR_Codes />} />
                  <Route path="/admin/qr/templates" element={<QR_DesignSystem />} />
                  <Route path="/admin/qr/routing" element={<QR_RoutingRules />} />
                  <Route path="/admin/qr/analytics" element={<QR_Analytics />} />
                  <Route path="/admin/qr/campaigns" element={<QR_Campaigns />} />
                  <Route path="/admin/qr/assets" element={<QR_AssetsDownloads />} />
                  <Route path="/admin/qr/activity" element={<QR_Activity />} />
                  <Route path="/admin/vcard-management/preview-testing" element={<Navigate to="/admin/vcard-management/template-builder?tab=preview" replace />} />
                  <Route path="/admin/card-management" element={<Navigate to="/admin/card-management/business-card-templates" replace />} />
                  <Route path="/admin/card-management/business-card-templates" element={<CM_BizCardTemplates />} />
                  <Route path="/admin/card-management/business-card-templates/:id" element={<CM_BizCardDetail />} />
                  <Route path="/admin/card-management/consumer-card-templates" element={<CM_ConCardTemplates />} />
                  <Route path="/admin/card-management/consumer-card-template-builder" element={<CM_ConCardBuilder />} />
                  <Route path="/admin/card-management/card-template-builder" element={<CM_CardTemplateBuilder />} />
                  <Route path="/admin/card-management/card-template-builder/friends-family" element={<CM_FriendsFamilyConfig />} />
                  <Route path="/admin/card-management/qr-customizer" element={<CM_QrCustomizer />} />
                  <Route path="/admin/card-management/template-builder" element={<CM_CardTemplateBuilder />} />
                  <Route path="/admin/card-management/distribution" element={<Navigate to="/admin/card-management/card-template-builder?tab=assignment" replace />} />
                  <Route path="/admin/card-management/card-activity" element={<Navigate to="/admin/card-management/business-card-templates" replace />} />
                  <Route path="/admin/cards/business" element={<CardListPage />} />
                  <Route path="/admin/cards/consumer" element={<CardListPage />} />
                  <Route path="/admin/cards/:id" element={<CardDetailPage />} />
                  <Route path="/admin/cards" element={<CardListPage />} />
                  <Route path="/admin/card-templates" element={<TemplateListPage />} />
                  <Route path="/admin/card-activity" element={<ActivityLogsPage />} />
                  <Route path="/admin/dynamic-qr" element={<QRCodeListPage />} />
                  <Route path="/admin/content-sharing" element={<FrontCMSPage />} />
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
                  <Route path="/admin/integrations" element={<MarketplacePage />} />
                  <Route path="/admin/support" element={<SupportCenterPage />} />
                  <Route path="/admin/settings" element={<SettingsPage />} />
                  <Route path="/admin/settings/sectors" element={<AdminSectorsPage />} />
                  <Route path="/admin/settings/seasons" element={<AdminSeasonsPage />} />
                  <Route path="/admin/vcards/business" element={<AdminVCardListPage />} />
                  <Route path="/admin/vcards/consumer" element={<AdminVCardListPage />} />
                  <Route path="/admin/vcards" element={<AdminVCardListPage />} />
                  <Route path="/admin/vcard-levels" element={<PlanListPage />} />
                  <Route path="/admin/vcard-activity" element={<ActivityLogsPage />} />
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
