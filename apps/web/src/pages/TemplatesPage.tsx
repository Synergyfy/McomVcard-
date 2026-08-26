import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'

const TEMPLATES = [
  { id: 1, name: 'vCard 1', image: '/assets/images/templates/vcard1.jpg' },
  { id: 2, name: 'vCard 2', image: '/assets/images/templates/vcard2.jpg' },
  { id: 3, name: 'vCard 3', image: '/assets/images/templates/vcard3.jpg' },
  { id: 4, name: 'vCard 4', image: '/assets/images/templates/vcard4.jpg' },
  { id: 5, name: 'vCard 5', image: '/assets/images/templates/vcard5.jpg' },
  { id: 6, name: 'vCard 6', image: '/assets/images/templates/vcard6.jpg' },
  { id: 7, name: 'vCard 7', image: '/assets/images/templates/vcard7.jpg' },
  { id: 8, name: 'vCard 8', image: '/assets/images/templates/vcard8.jpg' },
  { id: 9, name: 'vCard 9', image: '/assets/images/templates/vcard9.jpg' },
  { id: 10, name: 'vCard 10', image: '/assets/images/templates/vcard10.jpg' },
  { id: 11, name: 'vCard 11', image: '/assets/images/templates/vcard11.jpg' },
  { id: 12, name: 'vCard 12', image: '/assets/images/templates/vcard12.jpg' },
  { id: 13, name: 'vCard 13', image: '/assets/images/templates/vcard13.jpg' },
  { id: 14, name: 'vCard 14', image: '/assets/images/templates/vcard14.jpg' },
  { id: 15, name: 'vCard 15', image: '/assets/images/templates/vcard15.jpg' },
  { id: 16, name: 'vCard 16', image: '/assets/images/templates/vcard16.jpg' },
  { id: 17, name: 'vCard 17', image: '/assets/images/templates/vcard17.jpg' },
]

export default function TemplatesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>vCard Templates - Mobile VCard Link</title>
        <meta name="description" content="Choose from 17 professionally designed vCard templates for your digital business card." />
      </Helmet>
      <section className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('templates.title')}</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">{t('templates.subtitle')}</p>
        </div>
      </section>
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {TEMPLATES.map((template) => (
              <div key={template.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
                <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold text-sm">
                      {t('templates.preview')}
                    </span>
                  </div>
                  <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-center">{template.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
