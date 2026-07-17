import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { mockVcards, mockTemplates } from '../../../services/mockData'
import type { VCard } from '../../../types'
import type { ReactNode } from 'react'

import VCardEditInfoTab from './VCardEditInfoTab'
import VCardEditTemplatesTab from './VCardEditTemplatesTab'
import VCardEditBusinessHoursTab from './VCardEditBusinessHoursTab'
import VCardEditQRCustomizeTab from './VCardEditQRCustomizeTab'
import VCardEditServicesTab from './VCardEditServicesTab'
import VCardEditProductsTab from './VCardEditProductsTab'
import VCardEditTestimonialsTab from './VCardEditTestimonialsTab'
import VCardEditAppointmentsTab from './VCardEditAppointmentsTab'
import VCardEditSocialTab from './VCardEditSocialTab'
import VCardEditCustomizationTab from './VCardEditCustomizationTab'
import VCardEditSEOTab from './VCardEditSEOTab'
import VCardEditBlogTab from './VCardEditBlogTab'
import VCardEditPrivacyPolicyTab from './VCardEditPrivacyPolicyTab'
import VCardEditTermsConditionsTab from './VCardEditTermsConditionsTab'
import VCardEditGalleryTab from './VCardEditGalleryTab'
import VCardPreviewModal from '../../../components/common/VCardPreviewModal'

type TabKey = 'basic' | 'templates' | 'hours' | 'qr' | 'services' | 'products' | 'testimonials' | 'appointments' | 'social' | 'advanced' | 'fonts' | 'galleries' | 'seo' | 'blogs' | 'privacy' | 'terms'

interface TabDef {
  key: TabKey
  label: string
  icon: ReactNode
  group: string
}

const tabs: TabDef[] = [
  { key: 'basic', label: 'Basic Details', group: 'Setup', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { key: 'templates', label: 'vCard Templates', group: 'Setup', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg> },
  { key: 'hours', label: 'Business Hours', group: 'Setup', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { key: 'qr', label: 'Customize QR Code', group: 'Setup', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg> },
  { key: 'services', label: 'Services', group: 'Content', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
  { key: 'products', label: 'Products', group: 'Content', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
  { key: 'testimonials', label: 'Testimonials', group: 'Content', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
  { key: 'appointments', label: 'Appointments', group: 'Content', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { key: 'social', label: 'Social links - Website', group: 'Connect', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg> },
  { key: 'advanced', label: 'Advanced', group: 'Design', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg> },
  { key: 'fonts', label: 'Fonts', group: 'Design', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" /></svg> },
  { key: 'galleries', label: 'Galleries', group: 'Design', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { key: 'seo', label: 'SEO', group: 'Design', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
  { key: 'blogs', label: 'Blogs', group: 'Content', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg> },
  { key: 'privacy', label: 'Privacy Policy', group: 'Legal', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
  { key: 'terms', label: 'Terms & Conditions', group: 'Legal', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
]

const groups = [...new Set(tabs.map((t) => t.group))]

export default function VCardEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vcard, setVcard] = useState<VCard | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('basic')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (!id) return
    // Mock: find vcard from mock data
    const found = mockVcards.find((v) => v.id === Number(id))
    if (found) {
      setVcard(found)
    } else {
      // Fallback: create a mock vcard from the id
      setVcard({
        id: Number(id), user_id: 1, name: 'My vCard', url_slug: `my-vcard-${id}`,
        occupation: 'Professional', description: 'My digital business card',
        email: 'hello@example.com', phone: '+1 234 567 890', location: 'New York, NY',
        website: 'https://example.com', template_id: 1, status: 1,
        created_at: '2026-01-15', updated_at: '2026-07-15',
      })
    }
    setLoading(false)
  }, [id])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!vcard) return null

  const template = mockTemplates.find((t) => t.id === vcard.template_id)

  const renderContent = () => {
    switch (activeTab) {
      case 'basic': return <VCardEditInfoTab vcard={vcard} onUpdate={setVcard} />
      case 'templates': return <VCardEditTemplatesTab vcard={vcard} onUpdate={setVcard} />
      case 'hours': return <VCardEditBusinessHoursTab />
      case 'qr': return <VCardEditQRCustomizeTab />
      case 'services': return <VCardEditServicesTab vcardId={vcard.id} />
      case 'products': return <VCardEditProductsTab />
      case 'testimonials': return <VCardEditTestimonialsTab vcardId={vcard.id} />
      case 'appointments': return <VCardEditAppointmentsTab />
      case 'social': return <VCardEditSocialTab vcardId={vcard.id} />
      case 'advanced': return <VCardEditCustomizationTab vcardId={vcard.id} />
      case 'fonts': return <VCardEditCustomizationTab vcardId={vcard.id} />
      case 'galleries': return <VCardEditGalleryTab vcardId={vcard.id} />
      case 'seo': return <VCardEditSEOTab vcardId={vcard.id} />
      case 'blogs': return <VCardEditBlogTab vcardId={vcard.id} />
      case 'privacy': return <VCardEditPrivacyPolicyTab />
      case 'terms': return <VCardEditTermsConditionsTab />
      default: return null
    }
  }

  return (
    <div>
      <Helmet><title>Edit: {vcard.name} - MCOM VCard Social Bio</title></Helmet>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/user/vcards')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Back">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-sm">
            {vcard.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{vcard.name}</h1>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>/{vcard.url_slug}</span>
              {template && <><span>·</span><span>{template.category}</span></>}
              <span>·</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${vcard.status ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{vcard.status ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPreview(true)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Preview
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-56' : 'w-14'} shrink-0 transition-all duration-200`}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mb-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full flex items-center justify-center lg:hidden">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} /></svg>
          </button>

          <nav className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            {groups.map((group, gi) => (
              <div key={group}>
                {gi > 0 && <div className="border-t border-gray-100 dark:border-gray-700" />}
                {sidebarOpen && (
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{group}</p>
                )}
                {tabs.filter((t) => t.group === group).map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-r-2 border-orange-500' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'}`}
                    title={!sidebarOpen ? tab.label : undefined}>
                    {tab.icon}
                    {sidebarOpen && <span>{tab.label}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          {renderContent()}
        </div>
      </div>

      <VCardPreviewModal vcard={showPreview ? vcard : null} onClose={() => setShowPreview(false)} />
    </div>
  )
}
