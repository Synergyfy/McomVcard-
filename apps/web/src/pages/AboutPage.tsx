import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import AboutUs from '../components/home/AboutUs'

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>About Us - Mobile VCard Link</title>
        <meta name="description" content="Learn about Mobile VCard Link — the smart, interactive, and eco-friendly digital business card platform." />
      </Helmet>
      <section className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('about.title')}</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">{t('about.subtitle')}</p>
        </div>
      </section>
      <AboutUs />
    </>
  )
}
