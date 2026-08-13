import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const MEMBERSHIPS = ['Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Gold', 'Gold Pro', 'Platinum', 'Platinum Pro', 'Platinum Pro+']
const CATEGORIES = ['Restaurant', 'Retail', 'Coach', 'Estate Agent', 'Salon', 'Hotel', 'Medical', 'Professional', 'Charity', 'Trades']
const GEOGRAPHIES = ['London', 'Manchester', 'Birmingham', 'Lagos', 'Nairobi', 'Dubai', 'New York', 'Singapore', 'Cape Town', 'Lusaka']
const CAMPAIGNS = ['Christmas 2026', 'Summer Sale 2026', 'Black Friday 2026', 'Local Festival', 'New Year Promotion']

const MEMBERSHIP_TEMPLATES = [
  { plan: 'Bronze', vcard: 'Bronze Starter VCard', card: 'Bronze Business Card', customize: 'Limited', upgrade: 'Professional Template', downgrade: 'Keep Current', version: 'Auto-Update', status: 'Active' },
  { plan: 'Bronze Pro', vcard: 'Bronze Pro VCard', card: 'Bronze Pro Business Card', customize: 'Limited', upgrade: 'Professional Template', downgrade: 'Downgrade to Bronze', version: 'Auto-Update', status: 'Active' },
  { plan: 'Bronze Pro+', vcard: 'Bronze Pro+ VCard', card: 'Bronze Pro+ Business Card', customize: 'Content', upgrade: 'Silver Template', downgrade: 'Downgrade to Bronze Pro', version: 'Auto-Update', status: 'Active' },
  { plan: 'Silver', vcard: 'Silver Rewards VCard', card: 'Silver Business Card', customize: 'Content', upgrade: 'Gold Template', downgrade: 'Keep Current', version: 'Manual Approval', status: 'Active' },
  { plan: 'Silver Pro', vcard: 'Silver Pro VCard', card: 'Silver Pro Business Card', customize: 'Content', upgrade: 'Gold Pro Template', downgrade: 'Downgrade to Silver', version: 'Manual Approval', status: 'Active' },
  { plan: 'Gold', vcard: 'Gold Premium VCard', card: 'Gold Business Card', customize: 'Colors & Content', upgrade: 'Platinum Template', downgrade: 'Keep Current', version: 'Preview First', status: 'Active' },
  { plan: 'Gold Pro', vcard: 'Gold Pro VCard', card: 'Gold Pro Business Card', customize: 'Colors & Content', upgrade: 'Platinum Pro Template', downgrade: 'Downgrade to Gold', version: 'Preview First', status: 'Active' },
  { plan: 'Platinum', vcard: 'Platinum Executive VCard', card: 'Platinum Business Card', customize: 'Full', upgrade: 'Platinum Pro Template', downgrade: 'Keep Current', version: 'Optional', status: 'Active' },
  { plan: 'Platinum Pro', vcard: 'Platinum Pro Elite VCard', card: 'Platinum Pro Business Card', customize: 'Full', upgrade: 'Platinum Pro+ Template', downgrade: 'Downgrade to Platinum', version: 'Optional', status: 'Active' },
  { plan: 'Platinum Pro+', vcard: 'Enterprise VCard', card: 'Enterprise Business Card', customize: 'Full', upgrade: 'N/A (Highest)', downgrade: 'Downgrade to Platinum Pro', version: 'Optional', status: 'Active' },
]

const CATEGORY_TEMPLATES = [
  { category: 'Restaurant', vcard: 'Restaurant Premium', card: 'Restaurant Business Card', branding: 'Food & Dining', sections: 'Menu, Reservation, Offers, Gallery, Location, Reviews', status: 'Active' },
  { category: 'Retail', vcard: 'Retail Growth Engine', card: 'Retail Business Card', branding: 'Commerce', sections: 'Products, Promotions, Catalog, Store Locator, Loyalty', status: 'Active' },
  { category: 'Coach', vcard: 'Coach Professional', card: 'Coach Business Card', branding: 'Coaching', sections: 'Programs, Book Consultation, Testimonials, Videos', status: 'Active' },
  { category: 'Estate Agent', vcard: 'Real Estate Pro', card: 'Real Estate Business Card', branding: 'Property', sections: 'Listings, Virtual Tours, Mortgage Calc, Agent Profile', status: 'Active' },
  { category: 'Salon', vcard: 'Elite Salon Suite', card: 'Salon Business Card', branding: 'Beauty & Wellness', sections: 'Services, Booking, Gallery, Offers, Loyalty', status: 'Active' },
  { category: 'Hotel', vcard: 'Hotel Collection', card: 'Hotel Business Card', branding: 'Hospitality', sections: 'Rooms, Gallery, Booking, Concierge, Local Guide', status: 'Draft' },
  { category: 'Medical', vcard: 'Healthcare Provider', card: 'Medical Business Card', branding: 'Healthcare', sections: 'Services, Appointments, Telehealth, Insurance', status: 'Active' },
  { category: 'Professional', vcard: 'Corporate Professional', card: 'Professional Business Card', branding: 'Corporate', sections: 'Services, Team, Case Studies, Contact, Blog', status: 'Active' },
  { category: 'Charity', vcard: 'Charity & Nonprofit', card: 'Charity Business Card', branding: 'Nonprofit', sections: 'Mission, Donate, Events, Volunteer, Impact', status: 'Draft' },
  { category: 'Trades', vcard: 'Tradesperson Pro', card: 'Trades Business Card', branding: 'Trades & Services', sections: 'Services, Gallery, Quotes, Reviews, Insurance', status: 'Active' },
]

const ASSIGNMENT_HISTORY = [
  { date: '15 Jul 2026', business: 'GreenLeaf Coffee', template: 'Restaurant Premium', by: 'Admin', method: 'Category Rule', status: 'Active' },
  { date: '14 Jul 2026', business: 'TechCorp Solutions', template: 'Corporate Professional', by: 'Admin', method: 'Manual', status: 'Active' },
  { date: '13 Jul 2026', business: 'FitLife Studio', template: 'Fitness Studio VCard', by: 'System', method: 'Automatic', status: 'Active' },
  { date: '12 Jul 2026', business: 'BrightSmile Dental', template: 'Healthcare Provider', by: 'Admin', method: 'Membership Rule', status: 'Active' },
  { date: '11 Jul 2026', business: 'Pizza Roma', template: 'Restaurant Premium', by: 'System', method: 'Campaign', status: 'Pending' },
  { date: '10 Jul 2026', business: 'Harbor Hotel', template: 'Hotel Collection', by: 'Admin', method: 'Manual', status: 'Active' },
  { date: '9 Jul 2026', business: 'Premier Realty', template: 'Real Estate Pro', by: 'System', method: 'Automatic', status: 'Active' },
  { date: '8 Jul 2026', business: 'Sunshine Salon', template: 'Elite Salon Suite', by: 'Admin', method: 'Category Rule', status: 'Active' },
]

const VERSION_DATA = [
  { business: 'GreenLeaf Coffee', current: 'v4.2', latest: 'v4.2', behind: false, canUpdate: false, status: 'Latest' },
  { business: 'TechCorp', current: 'v4.1', latest: 'v4.2', behind: true, canUpdate: true, status: '1 Version Behind' },
  { business: 'FitLife Studio', current: 'v3.5', latest: 'v4.2', behind: true, canUpdate: true, status: 'Multiple Versions Behind' },
  { business: 'BrightSmile Dental', current: 'v2.4', latest: 'v2.4', behind: false, canUpdate: false, status: 'Latest' },
  { business: 'Pizza Roma', current: 'v1.0', latest: 'v4.2', behind: true, canUpdate: true, status: 'Deprecated' },
  { business: 'Harbor Hotel', current: 'v2.8', latest: 'v2.8', behind: false, canUpdate: false, status: 'Latest' },
]

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-7 h-4 rounded-full transition-colors relative shrink-0 ${on ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-3.5 left-0.5' : 'left-0.5'}`} />
    </button>
  )
}

function SectionCard({ title, desc, defaultOpen = false, children }: { title: string; desc?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30">
        <div className="text-left">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
          {desc && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>}
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

export default function TemplateAssignmentPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [manualSearch, setManualSearch] = useState('')
  const [confirmAssign, setConfirmAssign] = useState(false)
  const [showBulkProgress, setShowBulkProgress] = useState(false)
  const [bulkFilterMembership, setBulkFilterMembership] = useState('all')
  const [bulkFilterCategory, setBulkFilterCategory] = useState('all')
  const [bulkFilterCountry, setBulkFilterCountry] = useState('all')

  const handleBulkAssign = () => {
    setShowBulkProgress(true)
    setTimeout(() => { setShowBulkProgress(false); toast.success('Bulk assignment completed — 1,247 businesses updated') }, 2000)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unable to load assignment rules.</p>
        <p className="text-xs text-gray-400 mb-4">We couldn't retrieve the assignment configuration.</p>
        <button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 500) }} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">Retry</button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Helmet><title>Template Assignment - VCard Management - MCOM VCard</title></Helmet>

      {/* Breadcrumb + Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin/vcard-management" className="text-[10px] text-orange-600 hover:underline">VCard Management</Link>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            <Link to="/admin/vcard-management/business-vcard-templates" className="text-[10px] text-orange-600 hover:underline">Business VCard Templates</Link>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Template Assignment</h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Business VCard Deployment & Assignment Engine — automatically deploy templates by membership, category, geography, or campaign.</p>
        </div>
      </div>

      {/* ===== Assignment Dashboard — KPI Cards ===== */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <h2 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Assignment Dashboard</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {[
            { label: 'Business VCard Templates', value: '20' },
            { label: 'Assigned Businesses', value: '3,842' },
            { label: 'Unassigned Businesses', value: '156' },
            { label: 'Auto Rules Active', value: '4' },
            { label: 'Manual Assignments', value: '23' },
            { label: 'Awaiting Update', value: '89' },
            { label: 'Old Version', value: '134' },
            { label: 'Locked Templates', value: '2' },
            { label: 'Custom Templates', value: '7' },
          ].map(k => (
            <button key={k.label} onClick={() => toast.success(`Filtering by: ${k.label}`)} className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 text-left">
              <p className="text-[9px] text-gray-400">{k.label}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{k.value}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ===== SECTION 1 — Default Assignment Rules ===== */}
      <SectionCard title="Default Assignment Rules" desc="What every new business receives automatically upon registration." defaultOpen>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center"><svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg></div>
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center"><svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">On New Business Registration</p>
                <p className="text-[10px] text-gray-500">Automatically assign default Business VCard template → default Business Card template → apply membership defaults → ready.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Default Business VCard Template', value: 'Corporate Professional v4.2' },
                { label: 'Default Business Card Template', value: 'Standard Business Card v2.1' },
                { label: 'Default Theme', value: 'Modern (Light)' },
                { label: 'Default QR Configuration', value: 'Dynamic — Per Business' },
                { label: 'Default Brand Colors', value: 'MCOM Orange (#F97316)' },
                { label: 'Default Sections', value: 'All Basic + Contact + Share' },
              ].map(d => (
                <div key={d.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-700/50">
                  <span className="text-[10px] text-gray-400">{d.label}</span>
                  <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 text-right">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <button onClick={() => toast.success('Default assignment rules editor opened')} className="w-full px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Edit Defaults</button>
            <button onClick={() => toast.success('Default rules saved')} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Save</button>
            <button onClick={() => toast.success('Previewing default template')} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Preview</button>
            <button onClick={() => toast.success('System defaults restored')} className="w-full px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-500/30 text-xs font-medium text-red-500 hover:bg-red-50">Restore System Default</button>
          </div>
        </div>
      </SectionCard>

      {/* ===== SECTION 2 — Membership Assignment Rules ===== */}
      <SectionCard title="Membership Assignment Rules" desc="Assign templates automatically based on the business's membership plan.">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-2 py-1.5 font-medium">Membership</th>
                <th className="text-left px-2 py-1.5 font-medium">Business VCard Template</th>
                <th className="text-left px-2 py-1.5 font-medium">Business Card Template</th>
                <th className="text-left px-2 py-1.5 font-medium">Customization</th>
                <th className="text-left px-2 py-1.5 font-medium">Upgrade Path</th>
                <th className="text-left px-2 py-1.5 font-medium">Downgrade</th>
                <th className="text-left px-2 py-1.5 font-medium">Version Policy</th>
                <th className="text-left px-2 py-1.5 font-medium">Status</th>
                <th className="text-left px-2 py-1.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MEMBERSHIP_TEMPLATES.map(m => (
                <tr key={m.plan} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-2 py-1.5 font-medium text-gray-700 dark:text-gray-300">{m.plan}</td>
                  <td className="px-2 py-1.5 text-gray-500">{m.vcard}</td>
                  <td className="px-2 py-1.5 text-gray-500">{m.card}</td>
                  <td className="px-2 py-1.5"><span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                    m.customize === 'Full' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' :
                    m.customize === 'Colors & Content' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' :
                    m.customize === 'Content' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  }`}>{m.customize}</span></td>
                  <td className="px-2 py-1.5 text-gray-500">{m.upgrade}</td>
                  <td className="px-2 py-1.5 text-gray-500">{m.downgrade}</td>
                  <td className="px-2 py-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                      m.version === 'Auto-Update' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' :
                      m.version === 'Manual Approval' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' :
                      m.version === 'Preview First' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-500'
                    }`}>{m.version}</span></td>
                  <td className="px-2 py-1.5"><span className="text-green-600 font-medium">{m.status}</span></td>
                  <td className="px-2 py-1.5">
                    <button onClick={() => toast.success(`Editing ${m.plan} rule`)} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 text-[9px] hover:bg-gray-200">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
          <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Upgrade Behaviour: When a business upgrades, Admin can choose — <button onClick={() => toast.success('Set to Auto-Switch')} className="underline mx-0.5">Auto-switch template</button> · <button onClick={() => toast.success('Set to Keep Existing')} className="underline mx-0.5">Keep existing</button> · <button onClick={() => toast.success('Set to Ask Business')} className="underline mx-0.5">Ask Business</button></p>
        </div>
      </SectionCard>

      {/* ===== SECTION 3 — Business Category Rules ===== */}
      <SectionCard title="Business Category Rules" desc="Assign industry-optimized templates based on business category.">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-2 py-1.5 font-medium">Category</th>
                <th className="text-left px-2 py-1.5 font-medium">Business VCard Template</th>
                <th className="text-left px-2 py-1.5 font-medium">Business Card Template</th>
                <th className="text-left px-2 py-1.5 font-medium">Industry Branding</th>
                <th className="text-left px-2 py-1.5 font-medium">Default Sections</th>
                <th className="text-left px-2 py-1.5 font-medium">Status</th>
                <th className="text-left px-2 py-1.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORY_TEMPLATES.map(c => (
                <tr key={c.category} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-2 py-1.5 font-medium text-gray-700 dark:text-gray-300">{c.category}</td>
                  <td className="px-2 py-1.5 text-gray-500">{c.vcard}</td>
                  <td className="px-2 py-1.5 text-gray-500">{c.card}</td>
                  <td className="px-2 py-1.5 text-gray-500">{c.branding}</td>
                  <td className="px-2 py-1.5 text-gray-400 max-w-[200px] truncate">{c.sections}</td>
                  <td className="px-2 py-1.5"><span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${c.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{c.status}</span></td>
                  <td className="px-2 py-1.5">
                    <button onClick={() => toast.success(`Editing ${c.category} rule`)} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 text-[9px] hover:bg-gray-200">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ===== SECTION 4 — Geographic Rules ===== */}
      <SectionCard title="Geographic Assignment Rules" desc="Assign templates based on business location — country, region, city, or high street.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            {GEOGRAPHIES.map(g => (
              <div key={g} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{g}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">{g} Theme</span>
                  <button onClick={() => toast.success(`Editing ${g} rule`)} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 text-[9px] hover:bg-gray-200">Edit</button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Add Geographic Rule</h4>
            <div className="space-y-2">
              <select className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>Country</option><option>Region</option><option>County</option><option>City</option><option>High Street</option><option>LocalMall</option>
              </select>
              <input type="text" placeholder="Enter location..." className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
              <select className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>Select template...</option><option>Corporate Professional</option><option>Real Estate Pro</option><option>Restaurant Premium</option>
              </select>
              <button onClick={() => toast.success('Geographic rule added')} className="w-full px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Add Rule</button>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ===== SECTION 5 — Campaign Assignment ===== */}
      <SectionCard title="Campaign Assignment Rules" desc="Templates automatically activate and deactivate according to campaign dates.">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CAMPAIGNS.map(c => (
            <div key={c} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">{c}</h4>
                <span className="px-1.5 py-0.5 rounded bg-green-50 dark:bg-green-500/10 text-green-600 text-[9px] font-medium">Active</span>
              </div>
              <div className="text-[10px] text-gray-500 space-y-0.5">
                <p>Template: {c} VCard</p>
                <p>Start: 1 Dec 2026</p>
                <p>End: 31 Dec 2026</p>
              </div>
              <div className="mt-2 flex gap-1">
                <button onClick={() => toast.success(`Editing ${c}`)} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 text-[9px] hover:bg-gray-200">Edit</button>
                <button onClick={() => toast.success(`${c} deactivated`)} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 text-[9px] hover:bg-gray-200">Deactivate</button>
              </div>
            </div>
          ))}
          <button onClick={() => toast.success('New campaign assignment created')} className="p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add Campaign
          </button>
        </div>
      </SectionCard>

      {/* ===== SECTION 6 — Manual Assignment ===== */}
      <SectionCard title="Manual Assignment" desc="Assign a template to a single business.">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <input type="text" placeholder="Search by Business Name, ID, Email, Owner, Phone, Category, or Membership..."
              value={manualSearch} onChange={e => setManualSearch(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 mb-2" />
            <div className="max-h-48 overflow-y-auto space-y-1">
              {[
                { name: 'GreenLeaf Coffee', id: 'BUS-000001', cat: 'Restaurant', mem: 'Gold' },
                { name: 'TechCorp Solutions', id: 'BUS-000007', cat: 'Technology', mem: 'Platinum' },
                { name: 'FitLife Studio', id: 'BUS-000012', cat: 'Fitness', mem: 'Silver' },
                { name: 'BrightSmile Dental', id: 'BUS-000015', cat: 'Medical', mem: 'Gold' },
              ].filter(b => b.name.toLowerCase().includes(manualSearch.toLowerCase()) || b.id.toLowerCase().includes(manualSearch.toLowerCase())).map(b => (
                <div key={b.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700" onClick={() => { setConfirmAssign(true); toast.success(`Selected: ${b.name}`) }}>
                  <div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{b.name}</span>
                    <span className="text-[9px] text-gray-400 ml-2 font-mono">{b.id}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-400">{b.cat}</span>
                    <span className="px-1 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[8px]">{b.mem}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-[9px] text-gray-500 block mb-0.5">Select Template</label>
              <select className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>Corporate Professional v4.2</option>
                <option>Restaurant Premium v3.1</option>
                <option>Real Estate Pro v5.0</option>
              </select>
            </div>
            <button onClick={() => setConfirmAssign(true)} className="w-full px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Assign Template</button>
            <button onClick={() => toast.success('Assignments for this business')} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">View Current Assignments</button>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {confirmAssign && (
          <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-500/10 rounded-lg border border-orange-200 dark:border-orange-500/30 flex items-center justify-between">
            <p className="text-xs font-medium text-orange-700 dark:text-orange-300">Assign "Corporate Professional v4.2" to <strong>GreenLeaf Coffee</strong>?</p>
            <div className="flex gap-2">
              <button onClick={() => { setConfirmAssign(false); toast.success('Template assigned successfully') }} className="px-3 py-1 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Assign</button>
              <button onClick={() => setConfirmAssign(false)} className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ===== SECTION 7 — Bulk Assignment ===== */}
      <SectionCard title="Bulk Assignment" desc="Assign templates to thousands of businesses at once using filters.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <select value={bulkFilterMembership} onChange={e => setBulkFilterMembership(e.target.value)} className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="all">All Memberships</option>
                {MEMBERSHIPS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={bulkFilterCategory} onChange={e => setBulkFilterCategory(e.target.value)} className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={bulkFilterCountry} onChange={e => setBulkFilterCountry(e.target.value)} className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="all">All Countries</option><option>US</option><option>UK</option><option>Nigeria</option><option>Kenya</option><option>UAE</option>
              </select>
            </div>
            <div className="space-y-1 text-[10px] text-gray-500">
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Matching businesses: 1,247</p>
              {['All Restaurants (342)', 'All Gold+ Memberships (689)', 'All US-Based (512)', 'London Region (98)'].map(m => (
                <label key={m} className="flex items-center gap-2 py-0.5 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 accent-orange-500" />
                  {m}
                </label>
              ))}
            </div>
            <div className="mt-3">
              <label className="text-[9px] text-gray-500 block mb-0.5">Assign Template</label>
              <select className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>Corporate Professional v4.2</option>
                <option>Restaurant Premium v3.1</option>
                <option>Real Estate Pro v5.0</option>
              </select>
            </div>
            <div className="flex gap-2 mt-3">
              {['Assign', 'Replace', 'Merge', 'Remove', 'Schedule', 'Preview'].map(a => (
                <button key={a} onClick={a === 'Assign' ? handleBulkAssign : () => toast.success(`Bulk: ${a}`)}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-medium ${a === 'Assign' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50'}`}>{a}</button>
              ))}
            </div>
          </div>

          {/* Bulk Progress */}
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700 p-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Progress</h4>
            {showBulkProgress ? (
              <div className="space-y-1">
                {['TechCorp Solutions ✓', 'GreenLeaf Coffee ✓', 'FitLife Studio ✓', 'BrightSmile Dental ✓', 'Pizza Roma ✓', '+ 1,242 more...'].map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {b}
                  </div>
                ))}
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-500/10 rounded text-[10px] text-green-600 font-medium">Completed — 1,247 businesses updated</div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-[10px] text-gray-400">
                Run a bulk assignment to see progress here
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ===== SECTION 8 — Template Locking ===== */}
      <SectionCard title="Template Locking" desc="Control what businesses can modify on their assigned templates.">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { level: 'Fully Locked', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', desc: 'Business cannot change anything.', businesses: 1245, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20' },
            { level: 'Semi Locked', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', desc: 'Business edits content only.', businesses: 892, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20' },
            { level: 'Flexible', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', desc: 'Business edits colors & content.', businesses: 567, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20' },
            { level: 'Open', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', desc: 'Business edits everything.', businesses: 234, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20' },
          ].map(l => (
            <div key={l.level} className={`p-3 rounded-lg border ${l.bg}`}>
              <div className="flex items-center justify-between mb-1">
                <h4 className={`text-xs font-bold ${l.color}`}>{l.level}</h4>
                <span className="text-[10px] text-gray-500">{l.businesses.toLocaleString()} biz</span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">{l.desc}</p>
              <button onClick={() => toast.success(`Setting default to ${l.level}`)} className="px-2 py-0.5 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-[9px] text-gray-600 dark:text-gray-300 hover:bg-gray-50">Set as Default</button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ===== SECTION 9 — Template Inheritance ===== */}
      <SectionCard title="Template Inheritance" desc="Businesses inherit structural improvements while preserving their custom content.">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center"><svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg></div>
                <div className="text-[8px] text-orange-600 font-medium">Master</div>
              </div>
              <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center"><svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg></div>
                <div className="text-[8px] text-blue-600 font-medium">Business</div>
              </div>
              <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center"><svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <div className="text-[8px] text-green-600 font-medium">Inherited</div>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-gray-500 space-y-1">
              <p>✓ Admin updates Master Template → Business automatically receives structural improvements.</p>
              <p>✓ Business custom content stays untouched during inheritance.</p>
              <p>✓ Only structural improvements are inherited — not content overrides.</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between"><span className="text-[10px] text-gray-600 dark:text-gray-300">Enable Inheritance</span><Toggle on={true} onClick={() => toast.success('Inheritance toggled')} /></div>
            <div className="flex items-center justify-between"><span className="text-[10px] text-gray-600 dark:text-gray-300">Auto-Apply Updates</span><Toggle on={true} onClick={() => toast.success('Auto-apply toggled')} /></div>
            <div className="flex items-center justify-between"><span className="text-[10px] text-gray-600 dark:text-gray-300">Notify Businesses</span><Toggle on={true} onClick={() => toast.success('Notifications toggled')} /></div>
            <button onClick={() => toast.success('Pending inheritances processed')} className="w-full px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 mt-2">Process Pending Inheritances</button>
          </div>
        </div>
      </SectionCard>

      {/* ===== SECTION 10 — Version Management ===== */}
      <SectionCard title="Version Management" desc="Track which version each business uses and push updates.">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-2 py-1.5 font-medium">Business</th>
                <th className="text-left px-2 py-1.5 font-medium">Current Version</th>
                <th className="text-left px-2 py-1.5 font-medium">Latest Version</th>
                <th className="text-left px-2 py-1.5 font-medium">Behind</th>
                <th className="text-left px-2 py-1.5 font-medium">Status</th>
                <th className="text-left px-2 py-1.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {VERSION_DATA.map(v => (
                <tr key={v.business} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-2 py-1.5 font-medium text-gray-700 dark:text-gray-300">{v.business}</td>
                  <td className="px-2 py-1.5 text-gray-500">{v.current}</td>
                  <td className="px-2 py-1.5 text-gray-500">{v.latest}</td>
                  <td className="px-2 py-1.5">{v.behind ? <span className="text-red-500 font-medium">Yes</span> : <span className="text-gray-300">No</span>}</td>
                  <td className="px-2 py-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                      v.status === 'Latest' ? 'bg-green-50 text-green-600' :
                      v.status === '1 Version Behind' ? 'bg-amber-50 text-amber-600' :
                      v.status === 'Multiple Versions Behind' ? 'bg-orange-50 text-orange-600' :
                      'bg-red-50 text-red-600'
                    }`}>{v.status}</span>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="flex gap-1">
                      {v.canUpdate && <button onClick={() => toast.success(`Push update to ${v.business}`)} className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 text-[9px] hover:bg-orange-100">Push Update</button>}
                      <button onClick={() => toast.success(`Schedule update for ${v.business}`)} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 text-[9px] hover:bg-gray-200">Schedule</button>
                      <button onClick={() => toast.success(`Preview changes for ${v.business}`)} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 text-[9px] hover:bg-gray-200">Preview</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => toast.success('Pushing update to all businesses')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Push Update to All</button>
          <button onClick={() => toast.success('Update scheduled for off-peak')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Schedule Global Update</button>
          <button onClick={() => toast.success('Ignoring outdated versions')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Ignore Selected</button>
          <button onClick={() => toast.success('Rollback initiated')} className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-500/30 text-xs font-medium text-red-500 hover:bg-red-50">Rollback</button>
        </div>
      </SectionCard>

      {/* ===== SECTION 11 — Assignment History ===== */}
      <SectionCard title="Assignment History" desc="Every assignment recorded with full audit trail." defaultOpen>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-2 py-1.5 font-medium">Date</th>
                <th className="text-left px-2 py-1.5 font-medium">Business</th>
                <th className="text-left px-2 py-1.5 font-medium">Template</th>
                <th className="text-left px-2 py-1.5 font-medium">Assigned By</th>
                <th className="text-left px-2 py-1.5 font-medium">Method</th>
                <th className="text-left px-2 py-1.5 font-medium">Status</th>
                <th className="text-left px-2 py-1.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ASSIGNMENT_HISTORY.map(a => (
                <tr key={a.date + a.business} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-2 py-1.5 text-gray-500 whitespace-nowrap">{a.date}</td>
                  <td className="px-2 py-1.5 font-medium text-gray-700 dark:text-gray-300">{a.business}</td>
                  <td className="px-2 py-1.5 text-gray-500">{a.template}</td>
                  <td className="px-2 py-1.5 text-gray-500">{a.by}</td>
                  <td className="px-2 py-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                      a.method === 'Automatic' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' :
                      a.method === 'Manual' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600' :
                      a.method === 'Category Rule' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' :
                      a.method === 'Membership Rule' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' :
                      'bg-rose-50 dark:bg-rose-500/10 text-rose-600'
                    }`}>{a.method}</span>
                  </td>
                  <td className="px-2 py-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${a.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{a.status}</span>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="flex gap-1">
                      <button onClick={() => toast.success(`Viewing assignment for ${a.business}`)} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 text-[9px] hover:bg-gray-200">View</button>
                      <button onClick={() => toast.success(`Assignment undone for ${a.business}`)} className="px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-500/10 text-red-600 text-[9px] hover:bg-red-100">Undo</button>
                      <button onClick={() => toast.success(`Reassigning ${a.business}`)} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 text-[9px] hover:bg-gray-200">Reassign</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-[10px] text-gray-400">Showing 8 of 1,247 records</span>
          <button onClick={() => toast.success('Assignment history exported')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50">Export History</button>
        </div>
      </SectionCard>

      {/* ===== SECTION 12 — Permissions ===== */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Permissions</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Who can perform assignment actions.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {[
            { role: 'Super Admin', level: 'Everything', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10' },
            { role: 'Platform Admin', level: 'Everything except delete system templates', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-500/10' },
            { role: 'Support', level: 'View only', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { role: 'Template Manager', level: 'Assignment only', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
            { role: 'Auditor', level: 'Read only', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10' },
          ].map(p => (
            <div key={p.role} className={`p-3 rounded-lg ${p.bg}`}>
              <p className={`text-xs font-bold ${p.color}`}>{p.role}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{p.level}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Future Integrations ===== */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Reserved Assignment Triggers (Coming Soon)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { name: 'MCOM Solutions', trigger: 'Account creation' },
            { name: 'MCOM Rewards', trigger: 'Reward capability' },
            { name: '247GBS Rewards', trigger: 'Reward unlock' },
            { name: 'MCOMMall Cashback', trigger: 'Cashback active' },
            { name: 'FundOrDonate', trigger: 'Charity campaign' },
            { name: 'MCOM Spin', trigger: 'Gamification' },
          ].map(f => (
            <div key={f.name} className="p-2 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 text-center">
              <p className="text-[10px] font-medium text-gray-500">{f.name}</p>
              <p className="text-[8px] text-gray-400 mt-0.5">{f.trigger}</p>
              <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400 text-[8px]">Coming Soon</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/30 p-3">
        <div className="flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-300">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span>Businesses receive notifications when: new template assigned · template updated · template replaced · template locked · template unlocked</span>
        </div>
      </div>
    </div>
  )
}
