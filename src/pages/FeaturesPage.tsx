import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import Features from '../components/home/Features'

export default function FeaturesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>Features - Mobile VCard Link</title>
        <meta name="description" content="Explore the powerful features of Mobile VCard Link — customizable templates, smart contact sharing, appointment scheduling, analytics, and more." />
      </Helmet>
      <section className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('features.title')}</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">{t('features.subtitle')}</p>
        </div>
      </section>
      <Features />
    </>
  )
}
