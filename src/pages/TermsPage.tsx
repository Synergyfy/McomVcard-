import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'

export default function TermsPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>Terms & Conditions - Mobile VCard Link</title>
      </Helmet>
      <section className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('footer.terms')}</h1>
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 prose prose-gray">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using Mobile VCard Link, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our service.</p>

          <h2>2. Description of Service</h2>
          <p>Mobile VCard Link provides a platform for creating and managing digital business cards (vCards). Users can create, customize, and share their digital cards with others.</p>

          <h2>3. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating your account.</p>

          <h2>4. Subscriptions and Payments</h2>
          <p>Certain features require a paid subscription. Payments are processed securely through third-party payment processors. Subscription fees are non-refundable except as expressly stated in our refund policy.</p>

          <h2>5. User Content</h2>
          <p>You retain ownership of the content you create using our platform. By submitting content, you grant us a license to display and distribute it as part of our service.</p>

          <h2>6. Prohibited Uses</h2>
          <p>You agree not to use the service for any unlawful purpose or in violation of any applicable laws or regulations. We reserve the right to terminate accounts that violate these terms.</p>

          <h2>7. Limitation of Liability</h2>
          <p>Mobile VCard Link shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.</p>

          <h2>8. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Users will be notified of significant changes. Continued use of the service after changes constitutes acceptance.</p>

          <h2>9. Contact</h2>
          <p>For questions about these terms, please contact us through our contact page.</p>
        </div>
      </section>
    </>
  )
}
