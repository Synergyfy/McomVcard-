import { useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getUserTemplate, upsertTemplate, type StoredSection } from '../../../services/vcardTemplateStore'
import { ensureStoredTemplate } from '../../../services/vcardTemplateActions'
import { consumersForTemplate, type ConsumerVCard } from '../vcard-management/consumerVCardData'
import { BuilderWorkspace, PreviewModal, StatusBadge } from '../vcard-management/ConsumerVCardsPage'
import ScrollingVCard, { type ScrollingVCardHandle } from '../../../components/common/ScrollingVCard'
import type { ConTemplate } from './ConsumerVCardTemplatesPage'

function InfoRow({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${className}`}>
      <span className="text-[11px] text-gray-400">{label}</span>
      <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-right">{value}</span>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-3">
      <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${color ?? 'text-gray-900 dark:text-white'}`}>{value}</p>
    </div>
  )
}

interface PreviewSection {
  uid: string
  schemaId: string
  name: string
  enabled: boolean
  values: Record<string, string>
  items: Record<string, Record<string, string>[]>
  blocks: never[]
}

export function buildPublishedSections(t: ConTemplate): PreviewSection[] {
  const sections: PreviewSection[] = []
  const push = (schemaId: string, name: string, values: Record<string, string> = {}, items: Record<string, Record<string, string>[]> = {}) => {
    sections.push({ uid: `${schemaId}-${sections.length + 1}`, schemaId, name, enabled: true, values, items, blocks: [] })
  }

  push('banner', 'Banner')
  push('profile', 'Profile', {
    name: t.name,
    designation: `${t.category} · ${t.levels}`,
    description: t.description,
  })
  push('social', 'Social Icons', {}, {
    links: [
      { platform: 'WhatsApp', url: 'https://wa.me/15550101234' },
      { platform: 'Facebook', url: 'https://facebook.com/' },
      { platform: 'Instagram', url: 'https://instagram.com/' },
      { platform: 'TikTok', url: 'https://tiktok.com/' },
    ],
  })
  push('contacts', 'Contact Cards', {}, {
    cards: [
      { type: 'Phone', label: 'Phone', value: '+1 (555) 010-1234' },
      { type: 'Email', label: 'Email', value: 'member@example.com' },
      { type: 'Website', label: 'Website', value: 'www.example.com' },
      { type: 'Address', label: 'Address', value: '123 Main Street, City' },
    ],
  })
  push('services', 'Membership & Rewards', {}, {
    items: [
      { icon: '👑', title: `${t.levels} Membership`, description: 'Your current membership tier' },
      { icon: '💰', title: 'Wallet Balance', description: 'Points & rewards stored in your wallet' },
      { icon: '👪', title: 'Friends & Family', description: 'Cards linked to friends & family' },
    ],
  })
  push('products', 'Wallet & Rewards', {}, {
    items: [
      { title: 'Reward Points', description: 'Available balance', price: '1,250 pts' },
      { title: 'Vouchers', description: 'Redeemable offers', price: '3' },
    ],
  })
  if (t.features.some(f => /book|appoint/i.test(f))) {
    push('appointment', 'Bookings', { heading: 'Bookings', button: 'Book Now' })
  }
  if (t.dynamicQr) push('qr', 'Dynamic QR', { button: 'Download QR' })
  push('share', 'Share', { downloadLabel: 'Download VCard', shareLabel: 'Share' })
  return sections
}

export default function ConsumerVCardWorkspace({ template, onBack }: { template: ConTemplate; onBack: () => void }) {
  const navigate = useNavigate()
  const [showEditWarning, setShowEditWarning] = useState(false)
  const [showTemplateInfo, setShowTemplateInfo] = useState(false)
  const [showConsumers, setShowConsumers] = useState(false)
  const [previewConsumer, setPreviewConsumer] = useState<ConsumerVCard | null>(null)
  const [builderConsumer, setBuilderConsumer] = useState<ConsumerVCard | null>(null)
  const scrollRef = useRef<ScrollingVCardHandle>(null)
  const [scrollActive, setScrollActive] = useState(false)

  const t = template
  const stored = getUserTemplate(t.id)
  const claimedConsumers = consumersForTemplate(t.id)
  const claimedCount = claimedConsumers.length

  const sections: PreviewSection[] = stored
    ? (stored.builder.sections as unknown as PreviewSection[])
    : buildPublishedSections(t)

  const publicLink = `${window.location.origin}/t/${t.id}`

  const enterEdit = () => {
    setShowEditWarning(false)
    const s = stored ?? ensureStoredTemplate(t, 'consumer', buildPublishedSections(t) as unknown as StoredSection[])
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

  const publish = () => {
    if (stored) {
      upsertTemplate({ ...stored, status: 'Published', lastUpdated: 'just now' })
      toast.success(`${t.name} published`)
    } else toast.success(`${t.name} published`)
  }

  return (
    <div className="space-y-6">
      <Helmet><title>{t.name} - Consumer VCard Workspace - MCOM VCard</title></Helmet>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <button onClick={onBack} className="hover:text-orange-600">Consumer VCard Templates</button>
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
                'bg-gray-100 dark:bg-gray-700 text-gray-500'
              }`}>{t.status}</span>
              <span className="text-[10px] font-mono text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-1.5 py-0.5 rounded">{t.templateId}</span>
              <span className="text-[10px] text-gray-400">v{t.version}</span>
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 font-semibold">
                {claimedCount} consumer{claimedCount !== 1 ? 's' : ''} using
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.description}</p>
            <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1">
              <span>Created by {t.createdBy} on {t.createdDate}</span>
              <span>·</span>
              <span>Updated by {t.updatedBy} {t.modified}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button onClick={() => setShowTemplateInfo(true)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Template Information</button>
            <button onClick={handleEdit} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Edit Template</button>
            <button onClick={copyLink} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Copy Claim Link</button>
            {t.status === 'Draft' && <button onClick={publish} className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600">Publish</button>}
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
              <p className="text-[10px] text-gray-400">Exactly how the card renders on a consumer's live VCard — hover to scroll (desktop), tap to scroll or pause (mobile).</p>
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
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            {stored ? 'Rendering live from the template builder data' : `Synthesized render of the "${t.name}" template (v${t.version})`}
          </div>
        </div>

        {/* Side info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Consumers using */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Consumers Using This Template</h4>
              <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 text-[10px] font-semibold">{claimedCount} claimed</span>
            </div>
            {claimedConsumers.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-300 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">No consumers have claimed this template yet. Share the public link to get it in use.</p>
                <button onClick={() => toast.success(`Assigning ${t.name} to a consumer`)} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Manage Assignments</button>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-3">
                  {claimedConsumers.slice(0, 4).map(v => (
                    <div key={v.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0">{v.preview}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-gray-900 dark:text-white truncate">{v.consumerName}</p>
                        <p className="text-[9px] text-gray-400">{v.membership} · {v.views.toLocaleString()} views</p>
                      </div>
                      <button onClick={() => setPreviewConsumer(v)} className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-[9px] font-medium hover:bg-gray-50">Preview</button>
                      <button onClick={() => setBuilderConsumer(v)} className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 text-[9px] font-medium hover:bg-orange-100">Open Builder</button>
                    </div>
                  ))}
                  {claimedConsumers.length > 4 && <p className="text-[10px] text-gray-400 text-center">+{claimedConsumers.length - 4} more</p>}
                </div>
                <button onClick={() => setShowConsumers(true)} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View All {claimedCount} Consumers</button>
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
                  {claimedCount > 0 ? 'Editing will affect live consumers' : 'Safe to edit'}
                </p>
                <p className="text-[10px] text-gray-600 dark:text-gray-300 mt-0.5">
                  {claimedCount > 0
                    ? `This template is live on ${claimedCount} consumer VCards. Any change you save will publish to those consumers immediately — the update will show on their side. Review carefully.`
                    : 'No consumers are using this template yet — you can edit it freely. Share the public link to get it claimed.'}
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
            <p className="text-[10px] text-gray-400 mb-2.5">Share this link so a consumer can preview and claim this template for their own VCard.</p>
            <div className="flex items-center gap-2">
              <input readOnly value={publicLink} onFocus={e => e.currentTarget.select()}
                className="flex-1 min-w-0 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50" />
              <button onClick={copyLink} className="px-2.5 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600 shrink-0">Copy</button>
            </div>
            <div className="flex items-center gap-2 mt-2.5 text-[9px] text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              Anyone with this link can claim the template for their consumer VCard.
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
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{claimedCount} consumer{claimedCount !== 1 ? 's' : ''} are already using this template.</span>{' '}
                  Any change you save will be applied to their live VCards immediately — the update will show on their side as soon as you publish.
                </p>
                {claimedConsumers.length > 0 && (
                  <div className="mt-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                    <p className="text-[10px] text-gray-400 mb-1.5">Affected consumers</p>
                    <div className="flex flex-wrap gap-1.5">
                      {claimedConsumers.slice(0, 5).map(v => (
                        <span key={v.id} className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-[9px] text-gray-600 dark:text-gray-300">{v.consumerName}</span>
                      ))}
                      {claimedConsumers.length > 5 && <span className="px-1.5 py-0.5 text-[9px] text-gray-400">+{claimedConsumers.length - 5} more</span>}
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
              <div className="grid grid-cols-2 gap-2 mb-3">
                <StatCard label="Members Reached" value={t.membersReached.toLocaleString()} color="text-blue-600" />
                <StatCard label="QR Scans" value={t.qrScans.toLocaleString()} color="text-green-600" />
                <StatCard label="Shares" value={t.shares.toLocaleString()} color="text-purple-600" />
                <StatCard label="Exchanges" value={t.exchanges.toLocaleString()} color="text-emerald-600" />
                <StatCard label="Redeems" value={t.redeems.toLocaleString()} color="text-amber-600" />
                <StatCard label="Weekly Active" value={t.weeklyUsage.toLocaleString()} color="text-rose-600" />
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                <InfoRow label="Template ID" value={t.templateId} />
                <InfoRow label="Version" value={t.version} />
                <InfoRow label="Category" value={t.category} />
                <InfoRow label="Language" value={t.language} />
                <InfoRow label="Member Levels" value={t.membershipSupport.slice(0, 3).join(', ') + (t.membershipSupport.length > 3 ? ` +${t.membershipSupport.length - 3}` : '')} />
                <InfoRow label="Dynamic QR" value={t.dynamicQr ? `${t.qrType} QR` : 'Disabled'} />
                <InfoRow label="International" value={t.international ? 'Yes' : 'No'} />
                <InfoRow label="Features" value={t.features.join(', ')} />
                <InfoRow label="Created" value={`${t.createdBy} on ${t.createdDate}`} />
                <InfoRow label="Last Updated" value={`${t.updatedBy} ${t.modified}`} />
              </div>
              <div className="flex justify-end mt-5">
                <button onClick={() => setShowTemplateInfo(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consumers drill-in modal */}
      {showConsumers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h4 className="text-xs font-semibold text-gray-800 dark:text-white">{t.name} — Consumers</h4>
                <p className="text-[10px] text-gray-400">Consumers whose live VCard is using this template.</p>
              </div>
              <button onClick={() => setShowConsumers(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {claimedConsumers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-300 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">No consumers are using this template yet</p>
                  <p className="text-xs text-gray-400">Assign this template to a consumer to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <th className="px-3 py-2 text-left font-medium">Consumer</th>
                        <th className="px-3 py-2 text-left font-medium">Member ID</th>
                        <th className="px-3 py-2 text-left font-medium">Membership</th>
                        <th className="px-3 py-2 text-left font-medium">Source Business</th>
                        <th className="px-3 py-2 text-left font-medium">Status</th>
                        <th className="px-3 py-2 text-right font-medium">Views</th>
                        <th className="px-3 py-2 text-right font-medium">Shares</th>
                        <th className="px-3 py-2 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                      {claimedConsumers.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0">{c.preview}</div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{c.consumerName}</p>
                                <p className="text-[9px] text-gray-400">{c.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 font-mono text-[10px] text-gray-500">{c.memberId}</td>
                          <td className="px-3 py-2"><span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">{c.membership}</span></td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{c.businessSource}</td>
                          <td className="px-3 py-2"><StatusBadge status={c.status} /></td>
                          <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">{c.views.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">{c.shares.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex gap-1 justify-end">
                              <button onClick={() => setPreviewConsumer(c)} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] font-medium hover:bg-gray-200">Preview</button>
                              <button onClick={() => setBuilderConsumer(c)} className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 text-[9px] font-medium hover:bg-orange-100">Open Builder</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <PreviewModal vcard={previewConsumer} onClose={() => setPreviewConsumer(null)} />
      <BuilderWorkspace vcard={builderConsumer} onClose={() => setBuilderConsumer(null)} />
    </div>
  )
}
