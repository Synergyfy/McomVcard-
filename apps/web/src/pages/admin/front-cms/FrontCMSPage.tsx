import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../../services/admin'
import type { FrontCMS, FaqItem } from '../../../types'
import toast from 'react-hot-toast'

export default function FrontCMSPage() {
  const { t } = useTranslation()
  const [cms, setCms] = useState<FrontCMS>({})
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'faq'>('hero')

  const load = async () => {
    setLoading(true)
    try {
      const [cmsData, faqData] = await Promise.all([adminService.getFrontCMS(), adminService.getFaqs()])
      setCms(cmsData)
      setFaqs(faqData)
    } catch {
      toast.error(t('common.error_loading'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const saveCMS = async () => {
    setSaving(true)
    try {
      await adminService.updateFrontCMS(cms)
      toast.success(t('common.updated'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const addFaq = async () => {
    try {
      const faq = await adminService.createFaq({ question: '', answer: '', order: faqs.length + 1 } as any)
      setFaqs([...faqs, faq])
      toast.success(t('common.created'))
    } catch {
      toast.error(t('common.error'))
    }
  }

  const updateFaq = async (id: string, key: string, value: string) => {
    setFaqs(faqs.map((f) => f.id === id ? { ...f, [key]: value } : f))
  }

  const saveFaq = async (id: string) => {
    const faq = faqs.find((f) => String(f.id) === id)
    if (!faq) return
    try {
      await adminService.updateFaq(id, faq)
      toast.success(t('common.updated'))
    } catch {
      toast.error(t('common.error'))
    }
  }

  const deleteFaq = async (id: string) => {
    if (!confirm(t('common.confirm_delete'))) return
    try {
      await adminService.deleteFaq(String(id))
      setFaqs(faqs.filter((f) => String(f.id) !== id))
      toast.success(t('common.deleted'))
    } catch {
      toast.error(t('common.error'))
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
  }

  const tabs = [
    { key: 'hero' as const, label: t('admin.hero_section') },
    { key: 'about' as const, label: t('admin.about_section') },
    { key: 'faq' as const, label: t('admin.faq_section') },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.nav.front_cms')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('admin.manage_front_cms_desc')}</p>
      </div>
      <div className="mb-4 flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'hero' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.hero_title')}</label>
            <input type="text" value={cms.hero_title || ''} onChange={(e) => setCms({ ...cms, hero_title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.hero_subtitle')}</label>
            <textarea value={cms.hero_subtitle || ''} onChange={(e) => setCms({ ...cms, hero_subtitle: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.hero_image_url')}</label>
            <input type="text" value={cms.hero_image || ''} onChange={(e) => setCms({ ...cms, hero_image: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
          </div>
          <button onClick={saveCMS} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">{saving ? t('common.saving') : t('common.save')}</button>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.about_title')}</label>
            <input type="text" value={cms.about_title || ''} onChange={(e) => setCms({ ...cms, about_title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.about_description')}</label>
            <textarea value={cms.about_description || ''} onChange={(e) => setCms({ ...cms, about_description: e.target.value })} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.about_image_url')}</label>
            <input type="text" value={cms.about_image || ''} onChange={(e) => setCms({ ...cms, about_image: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
          </div>
          <button onClick={saveCMS} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">{saving ? t('common.saving') : t('common.save')}</button>
        </div>
      )}

      {activeTab === 'faq' && (
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">#{i + 1}</span>
                <button onClick={() => deleteFaq(faq.id)} className="text-red-500 hover:text-red-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              <input type="text" value={faq.question} onChange={(e) => updateFaq(faq.id, 'question', e.target.value)} placeholder={t('admin.faq_question_placeholder')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
              <textarea value={faq.answer} onChange={(e) => updateFaq(faq.id, 'answer', e.target.value)} placeholder={t('admin.faq_answer_placeholder')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
              <button onClick={() => saveFaq(faq.id)} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium">{t('common.save')}</button>
            </div>
          ))}
          <button onClick={addFaq} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors text-sm font-medium">
            + {t('admin.add_faq')}
          </button>
        </div>
      )}
    </div>
  )
}