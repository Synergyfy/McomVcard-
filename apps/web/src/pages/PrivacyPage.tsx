import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'

export default function PrivacyPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>Privacy Policy - Mobile VCard Link</title>
      </Helmet>
      <section className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('footer.privacy')}</h1>
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 prose prose-gray">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide when creating an account, including your name, email address, and contact details. We also collect usage data such as page views and interactions with your vCard.</p>

          <h2>2. How We Use Your Information</h2>
          <p>We use your information to provide and improve our services, process transactions, send communications about your account, and analyze usage patterns to enhance user experience.</p>

          <h2>3. Data Protection</h2>
          <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>

          <h2>4. Cookies</h2>
          <p>We use cookies and similar tracking technologies to enhance your browsing experience, analyze traffic, and understand where our visitors come from.</p>

          <h2>5. Third-Party Services</h2>
          <p>We may share your information with third-party service providers who assist us in operating our platform, processing payments, and analyzing data.</p>

          <h2>6. Your Rights</h2>
          <p>You have the right to access, update, or delete your personal information. You can manage your account settings or contact us to exercise these rights.</p>

          <h2>7. Data Retention</h2>
          <p>We retain your personal information for as long as your account is active or as needed to provide services. You can request deletion of your data at any time.</p>

          <h2>8. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify users of any material changes via email or through our platform.</p>

          <h2>9. Contact Us</h2>
          <p>If you have questions about this privacy policy, please contact us through our contact page.</p>
        </div>
      </section>
    </>
  )
}
