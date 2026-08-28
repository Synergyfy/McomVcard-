import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { BUSINESS_VCARDS, type BusinessVCard } from './businessVCardData'

interface VCardSection { id: string; label: string; enabled: boolean; description: string }

const SECTIONS: VCardSection[] = [
  { id: 'cover', label: 'Cover Banner', enabled: true, description: 'Full-width hero image with overlay text' },
  { id: 'logo', label: 'Logo', enabled: true, description: 'Business logo display' },
  { id: 'info', label: 'Business Information', enabled: true, description: 'Name, tagline, short description' },
  { id: 'about', label: 'About', enabled: true, description: 'Detailed business story' },
  { id: 'contact', label: 'Contact Details', enabled: true, description: 'Phone, email, address, website' },
  { id: 'hours', label: 'Opening Hours', enabled: true, description: 'Business hours table' },
  { id: 'location', label: 'Location', enabled: true, description: 'Address with Google Map embed' },
  { id: 'gallery', label: 'Gallery', enabled: true, description: 'Image grid with lightbox' },
  { id: 'videos', label: 'Videos', enabled: false, description: 'Video showcase' },
  { id: 'products', label: 'Products', enabled: true, description: 'Product listings with pricing' },
  { id: 'services', label: 'Services', enabled: true, description: 'Service offerings' },
  { id: 'events', label: 'Events', enabled: false, description: 'Upcoming events calendar' },
  { id: 'offers', label: 'Offers', enabled: true, description: 'Promotions and discount campaigns' },
  { id: 'testimonials', label: 'Testimonials', enabled: true, description: 'Customer reviews and ratings' },
  { id: 'documents', label: 'Documents', enabled: false, description: 'PDFs, brochures, menus' },
  { id: 'social', label: 'Social Links', enabled: true, description: 'Social media profile links' },
  { id: 'booking', label: 'Booking', enabled: false, description: 'Appointment and reservation system' },
  { id: 'share', label: 'Share', enabled: true, description: 'Share VCard via link, QR, social' },
  { id: 'exchange', label: 'Exchange', enabled: true, description: 'Digital business card exchange' },
  { id: 'redeem', label: 'Redeem', enabled: true, description: 'Reward and coupon redemption' },
  { id: 'cta', label: 'CTA Buttons', enabled: true, description: 'Call-to-action buttons (Call, Email, WhatsApp, Direction)' },
  { id: 'footer', label: 'Footer', enabled: true, description: 'Copyright, legal, branding footer' },
]

const STATUSES = ['All', 'Draft', 'Published', 'Pending Review', 'Suspended', 'Archived']
const MEMBERSHIPS = ['All', 'Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+']
const THEMES = ['All', 'Default', 'Corporate', 'Restaurant', 'Retail', 'Coach', 'Estate Agent', 'Healthcare', 'Custom']
const PUBLISHING = ['All', 'Published', 'Not Published']
const VISIBILITY = ['All', 'Public', 'Private', 'Hidden', 'Password Protected']
const SORT_OPTIONS = ['Newest', 'Oldest', 'Most Viewed', 'Most Shared', 'Most Redeemed', 'Most Active']

const totalViews = BUSINESS_VCARDS.reduce((s, v) => s + v.views, 0)
const totalShares = BUSINESS_VCARDS.reduce((s, v) => s + v.shares, 0)
const totalScans = BUSINESS_VCARDS.reduce((s, v) => s + v.qrScans, 0)
const totalExchange = BUSINESS_VCARDS.reduce((s, v) => s + v.exchangeCount, 0)
const totalRedeem = BUSINESS_VCARDS.reduce((s, v) => s + v.redeemCount, 0)

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Published': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Draft': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
    'Pending Review': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Suspended': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Archived': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
  }
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[status] || 'bg-gray-50 text-gray-600'}`}>{status}</span>
}

function KPICard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[9px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
        {options.map((o) => <option key={o} value={o.toLowerCase() === 'all' ? '' : o}>{o}</option>)}
      </select>
    </div>
  )
}

export function PreviewModal({ vcard, onClose }: { vcard: BusinessVCard | null; onClose: () => void }) {
  if (!vcard) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Preview — {vcard.businessName}</span>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 p-4 flex justify-center">
            <div className="w-[280px] h-[500px] bg-white dark:bg-gray-800 rounded-2xl border-4 border-gray-300 dark:border-gray-600 shadow-inner overflow-y-auto">
              <div className="h-32 bg-gradient-to-br from-orange-400 to-orange-600 flex items-end p-3">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-orange-600 font-bold text-sm">{vcard.preview}</div>
              </div>
              <div className="p-3 space-y-3">
                <div>
                  <p className="text-xs font-bold text-gray-900">{vcard.businessName}</p>
                  <p className="text-[9px] text-gray-500">{vcard.membership} · {vcard.theme}</p>
                </div>
                <div className="h-16 bg-gray-50 rounded-lg flex items-center justify-center text-[9px] text-gray-400">About section preview</div>
                <div className="h-12 bg-gray-50 rounded-lg flex items-center justify-center text-[9px] text-gray-400">Contact details</div>
                <div className="h-20 bg-gray-50 rounded-lg flex items-center justify-center text-[9px] text-gray-400">Gallery preview</div>
                <div className="flex gap-2">
                  <div className="flex-1 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-[9px] text-white font-medium">Share</div>
                  <div className="flex-1 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-[9px] text-gray-600 font-medium">Exchange</div>
                </div>
                <div className="h-16 bg-gray-50 rounded-lg flex items-center justify-center text-[9px] text-gray-400">Offers section</div>
                <div className="h-8 bg-gray-100 rounded-lg flex items-center justify-center text-[8px] text-gray-400">Footer</div>
              </div>
            </div>
          </div>
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex justify-center gap-3">
            <span className="text-[9px] text-gray-400">Mobile</span>
            <span className="text-[9px] text-gray-400">Tablet</span>
            <span className="text-[9px] text-gray-400">Desktop</span>
          </div>
        </div>
      </div>
    </>
  )
}

export function BuilderWorkspace({ vcard, onClose }: { vcard: BusinessVCard | null; onClose: () => void }) {
  const [sections, setSections] = useState(SECTIONS)
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [activeSection, setActiveSection] = useState<string | null>(null)

  if (!vcard) return null

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => String(s.id) === id ? { ...s, enabled: !s.enabled } : s))
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const updated = [...sections]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    setSections(updated)
  }

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return
    const updated = [...sections]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    setSections(updated)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Builder — {vcard.businessName}</h2>
              <p className="text-[10px] text-gray-500">v{vcard.version} · {vcard.theme} · {vcard.visibility}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              {(['mobile', 'tablet', 'desktop'] as const).map((m) => (
                <button key={m} onClick={() => setPreviewMode(m)} className={`px-2.5 py-1 rounded text-[10px] font-medium ${previewMode === m ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>
              ))}
            </div>
            <button onClick={() => toast.success('Draft saved')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Save Draft</button>
            <button onClick={() => toast.success('Submitted for review')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Submit for Review</button>
          </div>
        </div>

        <div className="flex h-[calc(100vh-57px)]">
          <div className="w-72 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Sections ({sections.filter(s => s.enabled).length}/{sections.length})</h3>
            <div className="space-y-1">
              {sections.map((s, i) => (
                <div key={s.id} className={`rounded-lg border ${activeSection === s.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/5' : 'border-gray-100 dark:border-gray-700'} ${s.enabled ? '' : 'opacity-50'}`}>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <button onClick={() => toggleSection(s.id)} className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${s.enabled ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                      {s.enabled && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <button onClick={() => setActiveSection(activeSection === s.id ? null : s.id)} className="flex-1 text-left">
                      <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{s.label}</p>
                    </button>
                    <div className="flex gap-0.5">
                      <button onClick={() => moveUp(i)} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></button>
                      <button onClick={() => moveDown(i)} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
                    </div>
                  </div>
                  {activeSection === s.id && (
                    <div className="px-3 pb-3 pt-1 space-y-2 border-t border-gray-50 dark:border-gray-700/50">
                      <p className="text-[9px] text-gray-400">{s.description}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {['Visibility', 'Theme', 'Animation', 'Mobile Spacing', 'Desktop Spacing', 'Background', 'Text Style', 'Permissions', 'Scheduling', 'Localization'].map((opt) => (
                          <div key={opt} className="flex items-center gap-1">
                            <input type="checkbox" defaultChecked className="w-3 h-3 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                            <span className="text-[8px] text-gray-500">{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 flex items-start justify-center p-6">
            <div className={`bg-white dark:bg-gray-800 rounded-2xl border-4 border-gray-300 dark:border-gray-600 shadow-inner overflow-y-auto ${previewMode === 'mobile' ? 'w-[280px] h-[520px]' : previewMode === 'tablet' ? 'w-[400px] h-[520px]' : 'w-full max-w-3xl h-[520px]'}`}>
              <div className="h-32 bg-gradient-to-br from-orange-400 to-orange-600 flex items-end p-4">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-orange-600 font-bold text-sm">{vcard.preview}</div>
              </div>
              <div className="p-4 space-y-4">
                {sections.filter(s => s.enabled).slice(0, 6).map(s => (
                  <div key={s.id}>
                    <p className="text-[11px] font-bold text-gray-900 dark:text-white mb-1">{s.label}</p>
                    <div className="h-16 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center text-[9px] text-gray-400">{s.description}</div>
                  </div>
                ))}
                {sections.filter(s => s.enabled).length > 6 && (
                  <div className="text-center text-[9px] text-gray-400">+ {sections.filter(s => s.enabled).length - 6} more sections</div>
                )}
              </div>
            </div>
          </div>

          <div className="w-72 border-l border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Publishing Workflow</h3>
            <div className="space-y-0">
              {[
                { label: 'Draft', active: true, date: 'Current' },
                { label: 'Ready For Review', active: false, date: '—' },
                { label: 'Approved', active: false, date: '—' },
                { label: 'Published', active: false, date: '—' },
                { label: 'Archived', active: false, date: '—' },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5">
                  <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${step.active ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  <div className="flex-1 flex justify-between">
                    <span className={`text-[10px] ${step.active ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500'}`}>{step.label}</span>
                    <span className="text-[9px] text-gray-400">{step.date}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Dynamic QR</h3>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between"><span className="text-gray-500">Destination</span><span className="text-gray-900 dark:text-white font-medium">Profile Page</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Expiry</span><span className="text-gray-900 dark:text-white font-medium">None</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Redirect</span><span className="text-gray-900 dark:text-white font-medium">Campaign (Seasonal)</span></div>
                <button onClick={() => toast.success('QR configuration opened')} className="mt-2 w-full px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200">Configure QR</button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Analytics</h3>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between"><span className="text-gray-500">Total Views</span><span className="font-semibold text-gray-900 dark:text-white">{vcard.views.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">QR Scans</span><span className="font-semibold text-gray-900 dark:text-white">{vcard.qrScans.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shares</span><span className="font-semibold text-gray-900 dark:text-white">{vcard.shares.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Exchanges</span><span className="font-semibold text-gray-900 dark:text-white">{vcard.exchangeCount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Redeems</span><span className="font-semibold text-gray-900 dark:text-white">{vcard.redeemCount.toLocaleString()}</span></div>
                <button onClick={() => toast.success('Full analytics opened')} className="mt-2 w-full px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200">View Full Analytics</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function BusinessVCardsPage() {
  const [loading] = useState(false)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [membershipFilter, setMembershipFilter] = useState('')
  const [themeFilter, setThemeFilter] = useState('')
  const [publishFilter, setPublishFilter] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('')
  const [sortBy, setSortBy] = useState('Newest')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [previewVCard, setPreviewVCard] = useState<BusinessVCard | null>(null)
  const [builderVCard, setBuilderVCard] = useState<BusinessVCard | null>(null)

  const filtered = BUSINESS_VCARDS.filter(v => {
    if (statusFilter && v.status !== statusFilter) return false
    if (membershipFilter && v.membership !== membershipFilter) return false
    if (themeFilter && v.theme !== themeFilter) return false
    if (publishFilter === 'Published' && v.published !== 'Yes') return false
    if (publishFilter === 'Not Published' && v.published !== 'No') return false
    if (visibilityFilter && v.visibility !== visibilityFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!v.businessName.toLowerCase().includes(q) && !v.businessId.toLowerCase().includes(q) && !v.membership.toLowerCase().includes(q) && !v.assignedBuilder.toLowerCase().includes(q)) return false
    }
    return true
  })

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length
  const toggleAll = () => { if (allSelected) setSelectedIds([]); else setSelectedIds(filtered.map(v => v.id)) }
  const toggleOne = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Helmet><title>Business VCards - VCard Management - MCOM VCard</title></Helmet>
        <div className="h-7 w-52 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">{[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Helmet><title>Business VCards - VCard Management - MCOM VCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Unable to load Business VCards</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">There was a problem fetching the VCard list.</p>
          <div className="flex justify-center gap-2">
            <button onClick={() => setError(false)} className="px-4 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Retry</button>
            <button className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300">View System Status</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Helmet><title>Business VCards - VCard Management - MCOM VCard</title></Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1" /></svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Business VCards</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Platform-wide operations center for every Business VCard — monitor, filter, audit, publish, and analyze across the ecosystem.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => toast.success('Opening builder for new VCard')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Create Business VCard</button>
            <button onClick={() => toast.success('Import dialog opened')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Import</button>
            <button onClick={() => toast.success('Data exported')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Export</button>
            <button onClick={() => toast.success('Bulk publish dialog opened')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Bulk Publish</button>
            <Link to="/admin/vcard-management/template-builder" className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Components Library</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <KPICard label="Total Business VCards" value={String(BUSINESS_VCARDS.length)} sub="Across all businesses" color="text-teal-600" />
        <KPICard label="Published" value={String(BUSINESS_VCARDS.filter(v => v.status === 'Published').length)} sub={`${Math.round(BUSINESS_VCARDS.filter(v => v.status === 'Published').length / BUSINESS_VCARDS.length * 100)}% of total`} color="text-green-600" />
        <KPICard label="Draft" value={String(BUSINESS_VCARDS.filter(v => v.status === 'Draft').length)} sub="Awaiting completion" color="text-gray-500" />
        <KPICard label="Pending Review" value={String(BUSINESS_VCARDS.filter(v => v.status === 'Pending Review').length)} sub="Awaiting approval" color="text-amber-600" />
        <KPICard label="Archived" value={String(BUSINESS_VCARDS.filter(v => v.status === 'Archived').length)} sub="No longer active" color="text-blue-600" />
        <KPICard label="Average Views" value={BUSINESS_VCARDS.length > 0 ? Math.round(totalViews / BUSINESS_VCARDS.length).toLocaleString() : '0'} sub="Per VCard lifetime" color="text-indigo-600" />
        <KPICard label="Average Shares" value={BUSINESS_VCARDS.length > 0 ? Math.round(totalShares / BUSINESS_VCARDS.length).toLocaleString() : '0'} sub="Per VCard lifetime" color="text-teal-600" />
        <KPICard label="Average QR Scans" value={BUSINESS_VCARDS.length > 0 ? Math.round(totalScans / BUSINESS_VCARDS.length).toLocaleString() : '0'} sub="Per VCard lifetime" color="text-amber-600" />
        <KPICard label="Average Exchange" value={BUSINESS_VCARDS.length > 0 ? Math.round(totalExchange / BUSINESS_VCARDS.length).toLocaleString() : '0'} sub="Per VCard lifetime" color="text-purple-600" />
        <KPICard label="Average Redeem" value={BUSINESS_VCARDS.length > 0 ? Math.round(totalRedeem / BUSINESS_VCARDS.length).toLocaleString() : '0'} sub="Per VCard lifetime" color="text-emerald-600" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Business Name, ID, Email, Phone, Membership, Owner..." className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
            <FilterSelect label="Status" value={statusFilter} options={STATUSES} onChange={setStatusFilter} />
            <FilterSelect label="Membership" value={membershipFilter} options={MEMBERSHIPS} onChange={setMembershipFilter} />
            <FilterSelect label="Theme" value={themeFilter} options={THEMES} onChange={setThemeFilter} />
            <FilterSelect label="Publishing" value={publishFilter} options={PUBLISHING} onChange={setPublishFilter} />
            <FilterSelect label="Visibility" value={visibilityFilter} options={VISIBILITY} onChange={setVisibilityFilter} />
            <FilterSelect label="Sort" value={sortBy} options={SORT_OPTIONS} onChange={setSortBy} />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1" /></svg>
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No Business VCards Found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">Create your first Business VCard to begin managing business digital experiences.</p>
          <button onClick={() => toast.success('Opening builder for new VCard')} className="px-4 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Create Business VCard</button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="w-8 px-3 py-2.5 text-left"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500" /></th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Preview</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Business</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">ID</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Membership</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Version</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Theme</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Published</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Updated</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Builder</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Views</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Shares</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Scans</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Exchange</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Redeem</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-3 py-2.5"><input type="checkbox" checked={selectedIds.includes(v.id)} onChange={() => toggleOne(v.id)} className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500" /></td>
                    <td className="px-3 py-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-[10px]">{v.preview}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => setBuilderVCard(v)} className="font-medium text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400">{v.businessName}</button>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[10px] text-gray-500">{v.businessId}</td>
                    <td className="px-3 py-2.5"><span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">{v.membership}</span></td>
                    <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{v.version}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={v.status} /></td>
                    <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{v.theme}</td>
                    <td className="px-3 py-2.5"><span className={`text-[10px] font-medium ${v.published === 'Yes' ? 'text-green-600' : 'text-gray-400'}`}>{v.published}</span></td>
                    <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">{v.lastUpdated}</td>
                    <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{v.assignedBuilder}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{v.views.toLocaleString()}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{v.shares.toLocaleString()}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{v.qrScans.toLocaleString()}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{v.exchangeCount.toLocaleString()}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{v.redeemCount.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="relative group inline-block">
                        <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" /></svg>
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                          <div className="py-1">
                            <button onClick={() => setBuilderVCard(v)} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View</button>
                            <button onClick={() => setBuilderVCard(v)} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Open Builder</button>
                            <button onClick={() => setPreviewVCard(v)} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Preview</button>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                            {v.status === 'Published' ? (
                              <button onClick={() => toast.success(`${v.businessName} unpublished`)} className="w-full text-left px-3 py-1.5 text-[11px] text-amber-600 hover:bg-gray-50 dark:hover:bg-gray-700">Unpublish</button>
                            ) : (
                              <button onClick={() => toast.success(`${v.businessName} published`)} className="w-full text-left px-3 py-1.5 text-[11px] text-green-600 hover:bg-gray-50 dark:hover:bg-gray-700">Publish</button>
                            )}
                            <button onClick={() => toast.success(`${v.businessName} duplicated`)} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Duplicate</button>
                            <button onClick={() => toast.success('Version history opened')} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Version History</button>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                            <button onClick={() => toast.success('Assign builder dialog opened')} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Assign Builder</button>
                            <button onClick={() => toast.success(`${v.businessName} archived`)} className="w-full text-left px-3 py-1.5 text-[11px] text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700">Archive</button>
                            <button onClick={() => toast.success(`${v.businessName} suspended`)} className="w-full text-left px-3 py-1.5 text-[11px] text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700">Suspend</button>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                            <button onClick={() => toast.error('Confirm deletion required')} className="w-full text-left px-3 py-1.5 text-[11px] text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700">Delete</button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-[10px] text-gray-500">{filtered.length} of {BUSINESS_VCARDS.length} records</span>
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-500 mr-1">{selectedIds.length} selected</span>
                <button onClick={() => toast.success('Selected VCards published')} className="px-2 py-1 rounded text-[10px] font-medium bg-green-50 dark:bg-green-500/10 text-green-600 hover:bg-green-100">Publish</button>
                <button onClick={() => toast.success('Selected VCards unpublished')} className="px-2 py-1 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-600 hover:bg-amber-100">Unpublish</button>
                <button onClick={() => toast.success('Selected VCards archived')} className="px-2 py-1 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-100">Archive</button>
                <button onClick={() => toast.success('Selected VCards suspended')} className="px-2 py-1 rounded text-[10px] font-medium bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100">Suspend</button>
                <button onClick={() => toast.success('Export started')} className="px-2 py-1 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200">Export</button>
              </div>
            )}
          </div>
        </div>
      )}

      <PreviewModal vcard={previewVCard} onClose={() => setPreviewVCard(null)} />
      <BuilderWorkspace vcard={builderVCard} onClose={() => setBuilderVCard(null)} />
    </div>
  )
}
