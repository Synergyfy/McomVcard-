import { useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getUserTemplate, upsertTemplate, type StoredSection } from '../../../services/vcardTemplateStore'
import { ensureStoredTemplate } from '../../../services/vcardTemplateActions'
import { businessesForTemplate, type BusinessVCard } from '../vcard-management/businessVCardData'
import { PreviewModal } from '../vcard-management/BusinessVCardsPage'
import { loadSeasons } from '../../../services/catalogStore'
import ScrollingVCard, { type ScrollingVCardHandle } from '../../../components/common/ScrollingVCard'

interface BizVCardTemplate {
  id: number; name: string; templateId: string; version: string; description: string
  status: string; category: string; industry: string; country: string; language: string
  membershipSupport: string[]; businessesUsing: number; consumersReached: number
  qrScans: number; shares: number; exchanges: number; redeems: number
  dynamicQr: boolean; qrType: string; international: boolean; languages: string[]
  countries: string[]; lastUpdated: string; updatedBy: string
  createdBy: string; createdDate: string; tags: string[]
  brandId: string; affiliateId: string; isDefault: boolean
  features: string[]; owner: string; templateOwner: string
  usage: number; weeklyUsage: number
}

/* ------------------------------------------------------------------ */
/*  Published design preview                                           */
/*  Platform templates have no builder data, so synthesize the phone   */
/*  sections from the template metadata so the card renders as a real  */
/*  published VCard for every template.                                */
/* ------------------------------------------------------------------ */

interface PreviewSection {
  uid: string
  schemaId: string
  name: string
  enabled: boolean
  values: Record<string, string>
  items: Record<string, Record<string, string>[]>
  blocks: never[]
}

export function buildPublishedSections(t: BizVCardTemplate): PreviewSection[] {
  const sections: PreviewSection[] = []
  const push = (schemaId: string, name: string, values: Record<string, string> = {}, items: Record<string, Record<string, string>[]> = {}) => {
    sections.push({ uid: `${schemaId}-${sections.length + 1}`, schemaId, name, enabled: true, values, items, blocks: [] })
  }

  push('countdown', 'Season Countdown', {
    label: 'Season ends in',
    color: '#F97316',
    seasonIds: loadSeasons().map(s => s.id).join(','),
  })
  push('banner', 'Banner')
  push('profile', 'Profile', {
    name: t.name,
    designation: t.category,
    description: t.description,
  })
  push('social', 'Social Icons', {}, {
    links: [
      { platform: 'WhatsApp', url: 'https://wa.me/15550101234' },
      { platform: 'Facebook', url: 'https://facebook.com/' },
      { platform: 'Instagram', url: 'https://instagram.com/' },
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/' },
    ],
  })
  push('contacts', 'Contact Cards', {}, {
    cards: [
      { type: 'Phone', label: 'Phone', value: '+1 (555) 010-1234' },
      { type: 'Email', label: 'Email', value: 'hello@example.com' },
      { type: 'Website', label: 'Website', value: 'www.example.com' },
      { type: 'Address', label: 'Address', value: '123 Main Street, City' },
    ],
  })
  if (t.features.some(f => /appoint|book/i.test(f))) {
    push('appointment', 'Make an Appointment', { heading: 'Make an Appointment', button: 'Request Appointment' })
  }
  if (t.features.some(f => /menu|service|catalog|product|showcase/i.test(f)) || t.businessesUsing > 0) {
    push('services', 'Our Services', {}, {
      items: [
        { icon: '🛠️', title: 'Core Service', description: 'Brief description of the core service offered' },
        { icon: '⭐', title: 'Premium Offering', description: 'Premium add-on available to members' },
        { icon: '🎯', title: 'Specialized Care', description: 'Tailored to each business' },
      ],
    })
  }
  push('hours', 'Business Hours', {}, {
    days: [
      { day: 'Mon – Fri', hours: '9:00 AM – 6:00 PM' },
      { day: 'Saturday', hours: '10:00 AM – 4:00 PM' },
      { day: 'Sunday', closed: 'true' },
    ],
  })
  push('gallery', 'Gallery', {}, { images: [{ url: '' }, { url: '' }, { url: '' }, { url: '' }, { url: '' }, { url: '' }] })
  push('map', 'Location', { address: '123 Main Street, City, Country' })
  push('share', 'Share', { downloadLabel: 'Download VCard', shareLabel: 'Share' })
  if (t.dynamicQr) push('qr', 'Dynamic QR', { button: 'Download QR' })
  return sections
}

export default function BusinessVCardWorkspace({ template, onBack }: { template: BizVCardTemplate; onBack: () => void }) {
  const navigate = useNavigate()
  const [showEditWarning, setShowEditWarning] = useState(false)
  const [showTemplateInfo, setShowTemplateInfo] = useState(false)
  const [previewVCard, setPreviewVCard] = useState<BusinessVCard | null>(null)
  const scrollRef = useRef<ScrollingVCardHandle>(null)
  const [scrollActive, setScrollActive] = useState(false)

  const t = template
  const stored = getUserTemplate(t.id)
  const claimedBusinesses = businessesForTemplate(t.id)
  const claimedCount = claimedBusinesses.length

  const sections: PreviewSection[] = stored
    ? (stored.builder.sections as unknown as PreviewSection[])
    : buildPublishedSections(t)

  const publicLink = `${window.location.origin}/t/${t.id}`

  /* "Edit Template" always opens the full VCard template builder — as if
     creating a new template. Platform templates are converted to a stored
     copy first so the builder has data to hydrate from. */
  const enterEdit = () => {
    setShowEditWarning(false)
    const s = stored ?? ensureStoredTemplate(t, 'business', buildPublishedSections(t) as unknown as StoredSection[])
    navigate(`/admin/vcard-management/template-builder?id=${s.id}`)
  }

  const handleEdit = () => {
    if (claimedCount > 0) setShowEditWarning(true)
    else enterEdit()
  }

  const copyLink = () => {
    try { navigator.clipboard?.writeText(publicLink) } catch { /* ignore */ }
    toast.success('Public claim link copied')
  }

  return (
    <div className="space-y-6">
      <Helmet><title>{t.name} - Business VCard Workspace - MCOM VCard</title></Helmet>

      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <button onClick={onBack} className="hover:text-orange-600">Business VCard Templates</button>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 dark:text-white font-medium">{t.name}</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <span className="text-orange-600 font-medium">Published View</span>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t.name}</h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                t.status === 'Published' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' :
                t.status === 'Draft' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' :
                t.status === 'Review' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' :
                'bg-gray-100 dark:bg-gray-700 text-gray-500'
              }`}>{t.status}</span>
              <span className="text-[10px] font-mono text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-1.5 py-0.5 rounded">{t.templateId}</span>
              <span className="text-[10px] text-gray-400">v{t.version}</span>
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-600 font-semibold">
                {claimedCount} business{claimedCount !== 1 ? 'es' : ''} using
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.description}</p>
            <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1">
              <span>Created by {t.createdBy} on {t.createdDate}</span>
              <span>·</span>
              <span>Updated by {t.updatedBy} {t.lastUpdated}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button onClick={() => setShowTemplateInfo(true)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Template Information</button>
            <button onClick={handleEdit} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Edit Template</button>
            <button onClick={copyLink} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Copy Claim Link</button>
            {t.status === 'Draft' && <button onClick={() => {
              const s = stored ?? ensureStoredTemplate(t, 'business', buildPublishedSections(t) as unknown as StoredSection[])
              upsertTemplate({ ...s, status: 'Published', lastUpdated: 'just now' })
              toast.success(`${t.name} published`)
            }} className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600">Publish</button>}
          </div>
        </div>
      </div>

      {/* Main published layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Phone preview */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Published Preview</h4>
              <p className="text-[10px] text-gray-400">Exactly how the card renders on a business's live VCard — hover to scroll (desktop), tap to scroll or pause (mobile).</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => scrollRef.current?.toggle()} className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-medium hover:bg-gray-200 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={!scrollActive ? 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM19 11V7a2 2 0 00-2-2H5a2 2 0 00-2 2v4m0 0a2 2 0 002 2h12a2 2 0 002-2m-2 4v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4' : 'M4 4v5a2 2 0 002 2h4a2 2 0 002-2V4a2 2 0 00-2-2H6a2 2 0 00-2 2zm10 0v5a2 2 0 002 2h4a2 2 0 002-2V4a2 2 0 00-2-2h-4a2 2 0 00-2 2zM4 15v5a2 2 0 002 2h4a2 2 0 002-2v-5a2 2 0 00-2-2H6a2 2 0 00-2 2zm10 0v5a2 2 0 002 2h4a2 2 0 002-2v-5a2 2 0 00-2-2h-4a2 2 0 00-2 2z'} /></svg>
                {scrollActive ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>
          <div className="flex items-start justify-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl py-8">
            <ScrollingVCard ref={scrollRef} sections={sections} heightClass="h-[62vh]" widthClass="w-[280px] sm:w-[320px]" onStateChange={setScrollActive} />
          </div>
          <div className="flex items-center gap-2 mt-4 text-[10px] text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {stored ? 'Rendering live from the template builder data' : `Synthesized render of the "${t.name}" template (v${t.version})`}
          </div>
        </div>

        {/* Side info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Businesses using */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Businesses Using This Template</h4>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-600 text-[10px] font-semibold">{claimedCount} claimed</span>
            </div>
            {claimedBusinesses.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-300 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">No businesses have claimed this template yet. Share the public link to get it in use.</p>
                <button onClick={() => navigate('/admin/vcard-management/assignment')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Manage Assignments</button>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-3">
                  {claimedBusinesses.slice(0, 4).map(v => (
                    <div key={v.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0">{v.preview}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-gray-900 dark:text-white truncate">{v.businessName}</p>
                        <p className="text-[9px] text-gray-400">{v.membership} · {v.views.toLocaleString()} views</p>
                      </div>
                      <button onClick={() => setPreviewVCard(v)} className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-[9px] font-medium hover:bg-gray-50">Preview</button>
                    </div>
                  ))}
                  {claimedBusinesses.length > 4 && <p className="text-[10px] text-gray-400 text-center">+{claimedBusinesses.length - 4} more</p>}
                </div>
                <button onClick={() => navigate('/admin/vcard-management/assignment')} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Manage Assignments</button>
              </>
            )}
          </div>

          {/* Edit impact */}
          <div className={`rounded-xl border p-4 ${claimedCount > 0 ? 'bg-amber-50/60 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30' : 'bg-teal-50/60 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/30'}`}>
            <div className="flex items-start gap-2.5">
              {claimedCount > 0 ? (
                <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              ) : (
                <svg className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
              <div>
                <p className="text-[11px] font-semibold text-gray-900 dark:text-white">
                  {claimedCount > 0 ? 'Editing will affect live businesses' : 'Safe to edit'}
                </p>
                <p className="text-[10px] text-gray-600 dark:text-gray-300 mt-0.5">
                  {claimedCount > 0
                    ? `This template is live on ${claimedCount} business VCards. Any change you save will publish to those businesses immediately — the update will show on their side. Review carefully.`
                    : 'No businesses are using this template yet — you can edit it freely. Share the public link to get it claimed.'}
                </p>
                <button onClick={handleEdit} className={`mt-2.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold ${claimedCount > 0 ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-orange-500 text-white hover:bg-orange-600'}`}>
                  {claimedCount > 0 ? 'Edit with Caution' : 'Edit Template'}
                </button>
              </div>
            </div>
          </div>

          {/* Public claim link */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Public Claim Link</h4>
            <p className="text-[10px] text-gray-400 mb-2.5">Share this link so a business can preview and claim this template for its own VCard.</p>
            <div className="flex items-center gap-2">
              <input readOnly value={publicLink} onFocus={e => e.currentTarget.select()}
                className="flex-1 min-w-0 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50" />
              <button onClick={copyLink} className="px-2.5 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600 shrink-0">Copy</button>
            </div>
            <div className="flex items-center gap-2 mt-2.5 text-[9px] text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              Anyone with this link can claim the template for their business.
            </div>
          </div>
        </div>
      </div>

      {/* Edit impact warning modal */}
      {showEditWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-start gap-3 p-5">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Edit "{t.name}"?</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{claimedCount} business{claimedCount !== 1 ? 'es' : ''} are already using this template.</span>{' '}
                  Any change you save will be applied to their live VCards immediately — the update will show on their side as soon as you publish.
                </p>
                {claimedBusinesses.length > 0 && (
                  <div className="mt-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                    <p className="text-[10px] text-gray-400 mb-1.5">Affected businesses</p>
                    <div className="flex flex-wrap gap-1.5">
                      {claimedBusinesses.slice(0, 5).map(v => (
                        <span key={v.id} className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-[9px] text-gray-600 dark:text-gray-300">{v.businessName}</span>
                      ))}
                      {claimedBusinesses.length > 5 && <span className="px-1.5 py-0.5 text-[9px] text-gray-400">+{claimedBusinesses.length - 5} more</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 pb-5">
              <button onClick={() => setShowEditWarning(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={enterEdit} className="px-4 py-2 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600">Edit Anyway</button>
            </div>
          </div>
        </div>
      )}

      {/* Template information modal */}
      {showTemplateInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Template Information</h4>
                <p className="text-[10px] text-gray-400">Details for {t.name} (v{t.version})</p>
              </div>
              <button onClick={() => setShowTemplateInfo(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5">
              <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                <div className="flex items-center justify-between py-1.5"><span className="text-[11px] text-gray-400">Template ID</span><span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-right">{t.templateId}</span></div>
                <div className="flex items-center justify-between py-1.5"><span className="text-[11px] text-gray-400">Version</span><span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-right">{t.version}</span></div>
                <div className="flex items-center justify-between py-1.5"><span className="text-[11px] text-gray-400">Category</span><span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-right">{t.category}</span></div>
                <div className="flex items-center justify-between py-1.5"><span className="text-[11px] text-gray-400">Industry</span><span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-right">{t.industry}</span></div>
                <div className="flex items-center justify-between py-1.5"><span className="text-[11px] text-gray-400">Country</span><span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-right">{t.country}</span></div>
                <div className="flex items-center justify-between py-1.5"><span className="text-[11px] text-gray-400">Language</span><span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-right">{t.language}</span></div>
                <div className="flex items-center justify-between py-1.5"><span className="text-[11px] text-gray-400">Memberships</span><span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-right">{t.membershipSupport.slice(0, 3).join(', ') + (t.membershipSupport.length > 3 ? ` +${t.membershipSupport.length - 3}` : '')}</span></div>
                <div className="flex items-center justify-between py-1.5"><span className="text-[11px] text-gray-400">Dynamic QR</span><span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-right">{t.dynamicQr ? `${t.qrType} QR` : 'Disabled'}</span></div>
                <div className="flex items-center justify-between py-1.5"><span className="text-[11px] text-gray-400">International</span><span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-right">{t.international ? `${t.languages.length} languages` : 'No'}</span></div>
                <div className="flex items-center justify-between py-1.5"><span className="text-[11px] text-gray-400">Features</span><span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-right">{t.features.join(', ')}</span></div>
                <div className="flex items-center justify-between py-1.5"><span className="text-[11px] text-gray-400">Created</span><span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-right">{`${t.createdBy} on ${t.createdDate}`}</span></div>
                <div className="flex items-center justify-between py-1.5"><span className="text-[11px] text-gray-400">Last Updated</span><span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-right">{`${t.updatedBy} ${t.lastUpdated}`}</span></div>
              </div>
              <div className="flex justify-end mt-5">
                <button onClick={() => setShowTemplateInfo(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PreviewModal vcard={previewVCard} onClose={() => setPreviewVCard(null)} />
    </div>
  )
}
