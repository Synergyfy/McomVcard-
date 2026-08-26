import { useTranslation } from 'react-i18next'
import type { AboutUs as AboutUsType } from '../../types'

interface AboutUsProps {
  data?: AboutUsType
}

export default function AboutUs({ data }: AboutUsProps) {
  const { t } = useTranslation()

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="w-full h-80 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
              <svg className="w-40 h-40 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('about.title')}</h2>
            <p className="text-gray-500 mb-2">{t('about.subtitle')}</p>
            <p className="text-gray-600 leading-relaxed">
              {data?.description || t('about.description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
