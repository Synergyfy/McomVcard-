import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  combineBizTemplates, combineConTemplates,
  type BizVCardTemplate, type ConTemplate,
} from '../../services/vcardTemplateCatalogue'
import { loadUserTemplatesByType } from '../../services/vcardTemplateStore'
import { buildPublishedSections as buildBizSections } from '../../pages/admin/card-management/BusinessVCardWorkspace'
import { buildPublishedSections as buildConSections } from '../../pages/admin/card-management/ConsumerVCardWorkspace'
import ScrollingVCard from '../common/ScrollingVCard'

type Tab = 'business' | 'consumer'

export default function TemplateShowcase() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('business')
  const [preview, setPreview] = useState<{ name: string; templateId: string; sections: unknown } | null>(null)

  const businessTemplates = combineBizTemplates(loadUserTemplatesByType('business'))
    .filter(t => t.status === 'Published')
    .slice(0, 6)
  const consumerTemplates = combineConTemplates(loadUserTemplatesByType('consumer'))
    .filter(t => t.status === 'Published')
    .slice(0, 6)

  const templates = activeTab === 'business' ? businessTemplates : consumerTemplates

  const sectionsFor = (template: BizVCardTemplate | ConTemplate, type: Tab) =>
    type === 'business'
      ? buildBizSections(template as BizVCardTemplate)
      : buildConSections(template as ConTemplate)

  const openPreview = (template: BizVCardTemplate | ConTemplate, type: Tab) => {
    setPreview({ name: template.name, templateId: template.templateId, sections: sectionsFor(template, type) })
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {templates.map((template) => (
            <div key={template.id} className="flex flex-col items-center group cursor-pointer"
              onClick={() => openPreview(template, activeTab)}>
              <div className="transition-transform duration-300 group-hover:scale-[1.03]">
                <ScrollingVCard
                  sections={sectionsFor(template, activeTab)}
                  heightClass="h-[30rem]"
                  widthClass="w-[300px] sm:w-[340px]"
                />
              </div>
              <div className="py-4 text-center">
                <p className="text-gray-700 dark:text-gray-200 font-semibold text-sm">{template.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{template.category}</p>
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

      {/* Auto-scroll phone preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h4 className="text-xs font-semibold text-gray-800 dark:text-white">{preview.name} — {preview.templateId} Preview</h4>
                <p className="text-[10px] text-gray-400">Hover or tap the card to auto-scroll through it</p>
              </div>
              <button onClick={() => setPreview(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex items-start justify-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <ScrollingVCard sections={preview.sections} />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
