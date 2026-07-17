import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { mockTemplates } from '../../services/mockData'
import PreviewModal from '../common/PreviewModal'
import type { PreviewCardData } from '../common/PreviewModal'

const businessTemplates = mockTemplates.filter(t => t.is_business && t.status === 'published').slice(0, 6)
const consumerTemplates = mockTemplates.filter(t => t.is_consumer && t.status === 'published').slice(0, 6)

export default function TemplateShowcase() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'business' | 'consumer'>('business')
  const [previewCard, setPreviewCard] = useState<PreviewCardData | null>(null)
  const templates = activeTab === 'business' ? businessTemplates : consumerTemplates

  const openPreview = (template: typeof mockTemplates[0]) => {
    setPreviewCard({
      id: template.id, name: template.name, type: 'Template',
      style: template.category, primaryColor: template.primary_color,
      secondaryColor: template.secondary_color, category: template.category,
      templateUrl: template.template_url, logo: template.category?.charAt(0) || 'T',
      businessName: template.category, title: template.font_family,
    })
  }

  return (
    <section className="py-20 bg-white" id="templates">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-3">
          {t('templates.title')}
        </h2>
        <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
          {t('templates.subtitle')}
        </p>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('business')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'business'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Businesses
            </button>
            <button
              onClick={() => setActiveTab('consumer')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'consumer'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Consumers
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <div key={template.id} className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 bg-white cursor-pointer"
              onClick={() => openPreview(template)}>
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                <img
                  src={template.template_url}
                  alt={template.name}
                  className="w-full transition-transform duration-[8000ms] ease-linear group-hover:translate-y-[-52%]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect fill="#f3f4f6" width="400" height="600"/><text fill="#9ca3af" font-family="Arial" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">${template.name}</text></svg>`)}`
                  }}
                />
                {/* Hover overlay with eye icon */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  onClick={(e) => { e.stopPropagation(); openPreview(template) }}>
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </div>
                </div>
              </div>
              <div className="py-4 text-center">
                <span className="text-gray-700 font-medium text-sm capitalize">{template.category}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/templates"
            className="inline-block px-8 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-900 hover:text-white transition-all duration-300"
          >
            View more
          </Link>
        </div>
      </div>

      <PreviewModal card={previewCard} onClose={() => setPreviewCard(null)} />
    </section>
  )
}
