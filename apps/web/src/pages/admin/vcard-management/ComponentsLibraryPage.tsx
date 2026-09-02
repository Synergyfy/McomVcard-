import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'

interface ComponentItem {
  id: string; name: string; category: string; availableFor: string; status: string
  version: number; createdBy: string; published: string; usageCount: number; lastUpdated: string
  description: string; tags: string; membershipVisibility: string
}

const CATEGORIES = ['Layout', 'Branding', 'Content', 'Contact', 'Media', 'Business', 'Consumer', 'Marketing', 'Location', 'Social', 'Future Integration']

const COMPONENTS: ComponentItem[] = [
  { id: '1', name: 'Full-Width Banner', category: 'Layout', availableFor: 'Both', status: 'Published', version: 8, createdBy: 'Admin', published: 'Yes', usageCount: 247, lastUpdated: '1 day ago', description: 'Full-width hero banner with overlay text and CTA', tags: 'banner, hero, cover', membershipVisibility: 'All' },
  { id: '2', name: 'Two-Column Grid', category: 'Layout', availableFor: 'Both', status: 'Published', version: 3, createdBy: 'Admin', published: 'Yes', usageCount: 189, lastUpdated: '3 days ago', description: 'Responsive two-column grid for content pairing', tags: 'grid, columns, layout', membershipVisibility: 'All' },
  { id: '3', name: 'Business Logo', category: 'Branding', availableFor: 'Business', status: 'Published', version: 2, createdBy: 'Designer', published: 'Yes', usageCount: 312, lastUpdated: '1 week ago', description: 'Business logo display with optional tagline', tags: 'logo, brand, identity', membershipVisibility: 'All' },
  { id: '4', name: 'Membership Badge', category: 'Branding', availableFor: 'Both', status: 'Published', version: 5, createdBy: 'Admin', published: 'Yes', usageCount: 198, lastUpdated: '2 days ago', description: 'Membership tier badge with color coding', tags: 'badge, membership, tier', membershipVisibility: 'All' },
  { id: '5', name: 'Heading Block', category: 'Content', availableFor: 'Both', status: 'Published', version: 1, createdBy: 'Admin', published: 'Yes', usageCount: 423, lastUpdated: '2 weeks ago', description: 'Configurable heading with optional subtitle', tags: 'heading, title, text', membershipVisibility: 'All' },
  { id: '6', name: 'Rich Text Block', category: 'Content', availableFor: 'Both', status: 'Published', version: 4, createdBy: 'Admin', published: 'Yes', usageCount: 356, lastUpdated: '5 days ago', description: 'Rich text editor with formatting options', tags: 'text, content, editor', membershipVisibility: 'All' },
  { id: '7', name: 'Contact Details', category: 'Contact', availableFor: 'Business', status: 'Published', version: 3, createdBy: 'Admin', published: 'Yes', usageCount: 278, lastUpdated: '1 week ago', description: 'Phone, email, website, and address block', tags: 'contact, phone, email', membershipVisibility: 'All' },
  { id: '8', name: 'Opening Hours', category: 'Contact', availableFor: 'Business', status: 'Published', version: 2, createdBy: 'Admin', published: 'Yes', usageCount: 156, lastUpdated: '2 weeks ago', description: 'Business hours table with custom days', tags: 'hours, schedule, business', membershipVisibility: 'All' },
  { id: '9', name: 'Image Gallery', category: 'Media', availableFor: 'Both', status: 'Published', version: 6, createdBy: 'Designer', published: 'Yes', usageCount: 134, lastUpdated: '3 days ago', description: 'Image grid with lightbox and captions', tags: 'gallery, images, photos', membershipVisibility: 'All' },
  { id: '10', name: 'Video Embed', category: 'Media', availableFor: 'Both', status: 'Draft', version: 2, createdBy: 'Designer', published: 'No', usageCount: 0, lastUpdated: '1 week ago', description: 'YouTube/Vimeo video embed with thumbnail', tags: 'video, embed, youtube', membershipVisibility: 'All' },
  { id: '11', name: 'Products Grid', category: 'Business', availableFor: 'Business', status: 'Published', version: 4, createdBy: 'Admin', published: 'Yes', usageCount: 89, lastUpdated: '4 days ago', description: 'Product listing with images, prices, and CTAs', tags: 'products, shop, catalog', membershipVisibility: 'Gold, Platinum' },
  { id: '12', name: 'Services List', category: 'Business', availableFor: 'Business', status: 'Published', version: 3, createdBy: 'Admin', published: 'Yes', usageCount: 67, lastUpdated: '1 week ago', description: 'Service offerings with descriptions and pricing', tags: 'services, offerings, pricing', membershipVisibility: 'Silver, Gold, Platinum' },
  { id: '13', name: 'Membership Progress', category: 'Consumer', availableFor: 'Consumer', status: 'Published', version: 2, createdBy: 'Admin', published: 'Yes', usageCount: 45, lastUpdated: '3 days ago', description: 'Progress bar showing points to next tier', tags: 'progress, membership, tier', membershipVisibility: 'All' },
  { id: '14', name: 'Wallet Summary', category: 'Consumer', availableFor: 'Consumer', status: 'Draft', version: 1, createdBy: 'Designer', published: 'No', usageCount: 0, lastUpdated: '2 weeks ago', description: 'Reward points, cashback, and gift card balance', tags: 'wallet, rewards, balance', membershipVisibility: 'Silver, Gold, Platinum' },
  { id: '15', name: 'Share Section', category: 'Marketing', availableFor: 'Both', status: 'Published', version: 7, createdBy: 'Admin', published: 'Yes', usageCount: 201, lastUpdated: '2 days ago', description: 'Social sharing with custom message and platforms', tags: 'share, social, viral', membershipVisibility: 'All' },
  { id: '16', name: 'Exchange Section', category: 'Marketing', availableFor: 'Both', status: 'Published', version: 4, createdBy: 'Admin', published: 'Yes', usageCount: 178, lastUpdated: '5 days ago', description: 'Digital card exchange with value transfer', tags: 'exchange, transfer, share', membershipVisibility: 'All' },
  { id: '17', name: 'CTA Button', category: 'Marketing', availableFor: 'Both', status: 'Published', version: 3, createdBy: 'Admin', published: 'Yes', usageCount: 412, lastUpdated: '1 week ago', description: 'Call-to-action button with custom link and style', tags: 'cta, button, action', membershipVisibility: 'All' },
  { id: '18', name: 'Google Map', category: 'Location', availableFor: 'Business', status: 'Published', version: 2, createdBy: 'Admin', published: 'Yes', usageCount: 134, lastUpdated: '2 weeks ago', description: 'Interactive Google Map with pin and directions', tags: 'map, location, directions', membershipVisibility: 'All' },
  { id: '19', name: 'Social Links', category: 'Social', availableFor: 'Both', status: 'Published', version: 3, createdBy: 'Admin', published: 'Yes', usageCount: 267, lastUpdated: '4 days ago', description: 'Social media profile links with icons', tags: 'social, facebook, instagram', membershipVisibility: 'All' },
  { id: '20', name: 'Instagram Feed', category: 'Social', availableFor: 'Both', status: 'Draft', version: 1, createdBy: 'Designer', published: 'No', usageCount: 0, lastUpdated: '1 month ago', description: 'Live Instagram feed embed', tags: 'instagram, feed, social', membershipVisibility: 'Gold, Platinum' },
  { id: '21', name: 'Rewards Widget', category: 'Future Integration', availableFor: 'Both', status: 'Draft', version: 1, createdBy: 'Admin', published: 'No', usageCount: 0, lastUpdated: '—', description: 'Rewards display — Coming Soon via MCOM Rewards', tags: 'rewards, points, future', membershipVisibility: 'All' },
  { id: '22', name: 'Cashback Card', category: 'Future Integration', availableFor: 'Both', status: 'Draft', version: 1, createdBy: 'Admin', published: 'No', usageCount: 0, lastUpdated: '—', description: 'Cashback balance and history — Coming Soon via MCOMMall', tags: 'cashback, money, future', membershipVisibility: 'All' },
  { id: '23', name: 'Donation Widget', category: 'Future Integration', availableFor: 'Both', status: 'Draft', version: 1, createdBy: 'Admin', published: 'No', usageCount: 0, lastUpdated: '—', description: 'Donation campaigns — Coming Soon via FundOrDonate', tags: 'donation, charity, future', membershipVisibility: 'All' },
  { id: '24', name: 'Spin Wheel', category: 'Future Integration', availableFor: 'Both', status: 'Draft', version: 1, createdBy: 'Admin', published: 'No', usageCount: 0, lastUpdated: '—', description: 'Gamified spin-to-win — Coming Soon via MCOM Spin', tags: 'spin, game, future', membershipVisibility: 'All' },
]

const CATEGORY_COMPONENTS: Record<string, string[]> = {
  Layout: ['Container', 'Grid', 'Columns', 'Rows', 'Cards', 'Divider', 'Spacing', 'Section Wrapper', 'Tabs', 'Accordion'],
  Branding: ['Banner', 'Logo', 'Brand Badge', 'Membership Badge', 'Business Badge', 'Verified Badge', 'Labels'],
  Content: ['Text Block', 'Heading', 'Paragraph', 'Quote', 'Rich Text', 'List', 'Highlights'],
  Contact: ['Phone', 'Email', 'Website', 'WhatsApp', 'Address', 'Opening Hours', 'Contact Form'],
  Media: ['Image', 'Gallery', 'Video', 'Slider', 'Document Viewer', 'PDF', 'Audio'],
  Business: ['Products', 'Services', 'Bookings', 'Reservations', 'Events', 'Testimonials', 'Reviews', 'Price List', 'Catalog'],
  Consumer: ['Membership Progress', 'Wallet Summary', 'Friends & Family', 'Additional Cards', 'Notifications', 'Local Businesses', 'Membership Benefits'],
  Marketing: ['Share', 'Exchange', 'Redeem', 'Call To Action', 'Campaign', 'Promotion', 'Announcement', 'Featured Offer'],
  Location: ['Google Map', 'Location', 'Directions', 'Coverage Area'],
  Social: ['Facebook', 'Instagram', 'TikTok', 'LinkedIn', 'YouTube', 'Share Buttons', 'Social Feed'],
  'Future Integration': ['Rewards', 'Cashback', 'FundOrDonate', 'Spin Wheel', 'Gift Cards', 'Voucher', 'Coupon', 'Referral', 'Affiliate', 'Loyalty Points'],
}

const VERSIONS = [
  { version: 8, date: '28 Jul 2026', by: 'Admin', status: 'Published', changes: 'Updated CTA styling, reduced padding' },
  { version: 7, date: '20 Jul 2026', by: 'Admin', status: 'Published', changes: 'Added overlay opacity control' },
  { version: 6, date: '10 Jul 2026', by: 'Designer', status: 'Published', changes: 'Improved mobile responsiveness' },
  { version: 5, date: '25 Jun 2026', by: 'Admin', status: 'Archived', changes: 'Background color options added' },
  { version: 4, date: '1 Jun 2026', by: 'Admin', status: 'Archived', changes: 'Height customization added' },
  { version: 3, date: '15 May 2026', by: 'Designer', status: 'Archived', changes: 'Text alignment options' },
  { version: 2, date: '20 Apr 2026', by: 'Admin', status: 'Archived', changes: 'Initial responsive version' },
  { version: 1, date: '1 Apr 2026', by: 'Admin', status: 'Archived', changes: 'First draft created' },
]

const MEMBERSHIP_TIERS = ['Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+']

const STATUSES = ['All', 'Published', 'Draft', 'Pending Review', 'Archived']
const AVAILABLE_FOR = ['All', 'Business', 'Consumer', 'Both']
const SORT_OPTIONS = ['Newest', 'Oldest', 'Most Used', 'Least Used', 'Unused', 'Name']

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Published': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Draft': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
    'Pending Review': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
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

function ComponentEditor({ component, onClose }: { component: ComponentItem | null; onClose: () => void }) {
  const [name, setName] = useState(component?.name || '')
  const [description, setDescription] = useState(component?.description || '')
  const [category, setCategory] = useState(component?.category || 'Layout')
  const [availableFor, setAvailableFor] = useState(component?.availableFor || 'Both')
  const [activeTab, setActiveTab] = useState<'general' | 'display' | 'content' | 'rules' | 'versions'>('general')
  const [selectedTiers, setSelectedTiers] = useState<string[]>(component?.membershipVisibility === 'All' ? [] : component?.membershipVisibility.split(', ').map(s => s.trim()) || [])

  if (!component) return null

  const toggleTier = (tier: string) => {
    setSelectedTiers(prev => prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier])
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
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Component Editor — {component.name}</h2>
              <p className="text-[10px] text-gray-500">v{component.version} · {component.category} · {component.availableFor}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => toast.success('Draft saved')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Save Draft</button>
            <button onClick={() => toast.success('Submitted for review')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Submit for Review</button>
          </div>
        </div>

        <div className="flex h-[calc(100vh-57px)]">
          <div className="w-56 border-r border-gray-200 dark:border-gray-700 p-4 space-y-1">
            {[
              { id: 'general', label: 'General', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
              { id: 'display', label: 'Display Settings', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
              { id: 'content', label: 'Content', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { id: 'rules', label: 'Business Rules', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
              { id: 'versions', label: 'Version History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} /></svg>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'general' && (
              <div className="max-w-xl space-y-4">
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">Component Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Available For</label>
                    <select value={availableFor} onChange={e => setAvailableFor(e.target.value)} className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      <option>Business</option><option>Consumer</option><option>Both</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">Tags</label>
                  <input type="text" defaultValue={component.tags} className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500" placeholder="banner, hero, cover" />
                </div>
              </div>
            )}

            {activeTab === 'display' && (
              <div className="max-w-xl space-y-4">
                <p className="text-[10px] text-gray-500 mb-3">Configure how this component appears inside VCards.</p>
                <div className="grid grid-cols-3 gap-3">
                  {['Width', 'Padding', 'Margins', 'Corner Radius', 'Borders', 'Background', 'Alignment', 'Spacing', 'Animations', 'Visibility', 'Shadow', 'Opacity'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <input type="checkbox" defaultChecked className="w-3 h-3 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                      <span className="text-[10px] text-gray-700 dark:text-gray-300">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="max-w-xl space-y-4">
                <p className="text-[10px] text-gray-500 mb-3">Content fields for <strong className="text-gray-900 dark:text-white">{component.name}</strong></p>
                {component.name === 'Full-Width Banner' && (
                  <div className="space-y-3">
                    <div><label className="block text-[10px] font-medium text-gray-500 mb-1">Title</label><input type="text" className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" /></div>
                    <div><label className="block text-[10px] font-medium text-gray-500 mb-1">Subtitle</label><input type="text" className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-[10px] font-medium text-gray-500 mb-1">Height</label><select className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"><option>Small</option><option>Medium</option><option>Large</option></select></div>
                      <div><label className="block text-[10px] font-medium text-gray-500 mb-1">Mobile Height</label><select className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"><option>Small</option><option>Medium</option><option>Large</option></select></div>
                    </div>
                  </div>
                )}
                {component.name === 'Image Gallery' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-[10px] font-medium text-gray-500 mb-1">Columns</label><select className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"><option>1</option><option>2</option><option>3</option><option>4</option></select></div>
                      <div><label className="block text-[10px] font-medium text-gray-500 mb-1">Slider Speed</label><input type="text" className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="3s" /></div>
                    </div>
                    <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="w-3 h-3 rounded border-gray-300 text-orange-500 focus:ring-orange-500" /><span className="text-[10px] text-gray-700 dark:text-gray-300">Lightbox enabled</span></label>
                    <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="w-3 h-3 rounded border-gray-300 text-orange-500 focus:ring-orange-500" /><span className="text-[10px] text-gray-700 dark:text-gray-300">Auto play</span></label>
                  </div>
                )}
                {component.name === 'Share Section' && (
                  <div className="space-y-3">
                    <div><label className="block text-[10px] font-medium text-gray-500 mb-1">Default Share Message</label><input type="text" className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="Check out this great offer!" /></div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">Allowed Platforms</label>
                      <div className="grid grid-cols-3 gap-1">{[['WhatsApp', true], ['Facebook', true], ['Twitter', true], ['Email', true], ['Copy Link', true], ['SMS', false]].map(([p, def]) => (
                        <label key={p as string} className="flex items-center gap-1"><input type="checkbox" defaultChecked={def as boolean} className="w-3 h-3 rounded border-gray-300 text-orange-500 focus:ring-orange-500" /><span className="text-[10px] text-gray-700 dark:text-gray-300">{p as string}</span></label>
                      ))}</div>
                    </div>
                    <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="w-3 h-3 rounded border-gray-300 text-orange-500 focus:ring-orange-500" /><span className="text-[10px] text-gray-700 dark:text-gray-300">Tracking enabled</span></label>
                  </div>
                )}
                {component.category === 'Future Integration' && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-center">
                    <p className="text-xs font-medium text-amber-600">Coming Soon — Connected via MCOM ecosystem integration</p>
                    <p className="text-[10px] text-amber-500 mt-1">Content settings will be available once the integration is active.</p>
                  </div>
                )}
                {!['Full-Width Banner', 'Image Gallery', 'Share Section'].includes(component.name) && component.category !== 'Future Integration' && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-center">
                    <p className="text-[10px] text-gray-500">Content configuration depends on component type. Save as draft and configure in the builder.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="max-w-xl space-y-5">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2">Availability</h4>
                  <div className="space-y-1">
                    {['Business Only', 'Consumer Only', 'Both'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                        <input type="radio" name="availability" defaultChecked={opt === 'Both'} className="w-3 h-3 text-orange-500 focus:ring-orange-500" />
                        <span className="text-[10px] text-gray-700 dark:text-gray-300">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2">Required / Optional</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {['Required', 'Optional', 'Hidden by Default', 'Enabled by Default'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                        <input type="radio" name="requirement" defaultChecked={opt === 'Optional'} className="w-3 h-3 text-orange-500 focus:ring-orange-500" />
                        <span className="text-[10px] text-gray-700 dark:text-gray-300">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2">Membership Visibility</h4>
                  <p className="text-[10px] text-gray-500 mb-2">Limit this component to specific membership tiers. Leave unchecked for all tiers.</p>
                  <div className="grid grid-cols-3 gap-1">
                    {MEMBERSHIP_TIERS.map((tier) => (
                      <label key={tier} className="flex items-center gap-1.5 p-1.5 rounded border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <input type="checkbox" checked={selectedTiers.length === 0 || selectedTiers.includes(tier)} onChange={() => toggleTier(tier)} className="w-3 h-3 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                        <span className="text-[9px] text-gray-700 dark:text-gray-300">{tier}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'versions' && (
              <div className="max-w-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">Version History — {component.name}</h4>
                  <span className="text-[10px] text-gray-500">Current: v{component.version}</span>
                </div>
                <div className="space-y-2">
                  {VERSIONS.map((v) => (
                    <div key={v.version} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${v.status === 'Published' ? 'bg-green-500' : v.status === 'Archived' ? 'bg-gray-400' : 'bg-amber-500'}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-medium text-gray-900 dark:text-white">Version {v.version}</p>
                          <StatusBadge status={v.status} />
                        </div>
                        <p className="text-[10px] text-gray-500">{v.date} · by {v.by}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{v.changes}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => toast.success(`Comparing v${v.version}`)} className="px-1.5 py-1 rounded text-[9px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200">Compare</button>
                        <button onClick={() => toast.success(`Restored to v${v.version}`)} className="px-1.5 py-1 rounded text-[9px] font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-600 hover:bg-orange-100">Restore</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-64 border-l border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <div>
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Usage Analytics</h3>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between"><span className="text-gray-500">Total Used In</span><span className="font-semibold text-gray-900 dark:text-white">{component.usageCount}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Business VCards</span><span className="font-semibold text-gray-900 dark:text-white">{Math.round(component.usageCount * 0.7)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Consumer VCards</span><span className="font-semibold text-gray-900 dark:text-white">{Math.round(component.usageCount * 0.3)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Published</span><span className="font-semibold text-green-600">{Math.round(component.usageCount * 0.8)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Draft</span><span className="font-semibold text-amber-600">{Math.round(component.usageCount * 0.15)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Archived</span><span className="font-semibold text-gray-500">{Math.round(component.usageCount * 0.05)}</span></div>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Global Replace</h4>
              <p className="text-[9px] text-gray-400 mb-2">Replace this component with another across all VCards.</p>
              <select className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2">
                <option>Select replacement...</option>
                <option>Compact Banner</option><option>Minimal Banner</option><option>Hero Banner v2</option>
              </select>
              <button onClick={() => toast.success('Global replace completed! All VCards updated.')} className="w-full px-2 py-1.5 rounded bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Replace Globally</button>
            </div>
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Publishing</h4>
              <div className="space-y-0">
                {[{ label: 'Draft', active: component.status === 'Draft' }, { label: 'Review', active: component.status === 'Pending Review' }, { label: 'Approved', active: false }, { label: 'Published', active: component.status === 'Published' }, { label: 'Archived', active: component.status === 'Archived' }].map((step, i) => (
                  <div key={i} className="flex items-start gap-2 py-1">
                    <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${step.active ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    <span className={`text-[10px] ${step.active ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500'}`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function ComponentsLibraryPage() {
  const [loading] = useState(false)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [availFilter, setAvailFilter] = useState('')
  const [sortBy, setSortBy] = useState('Newest')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editorComponent, setEditorComponent] = useState<ComponentItem | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('All')

  const filtered = COMPONENTS.filter(c => {
    if (categoryFilter && c.category !== categoryFilter) return false
    if (statusFilter && c.status !== statusFilter) return false
    if (availFilter && c.availableFor !== availFilter) return false
    if (activeCategory !== 'All' && c.category !== activeCategory) return false
    if (search) {
      const q = search.toLowerCase()
      if (!c.name.toLowerCase().includes(q) && !c.category.toLowerCase().includes(q) && !c.tags.toLowerCase().includes(q) && !c.createdBy.toLowerCase().includes(q)) return false
    }
    return true
  })

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length
  const toggleAll = () => { if (allSelected) setSelectedIds([]); else setSelectedIds(filtered.map(c => c.id)) }
  const toggleOne = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Helmet><title>VCard Components Library - MCOM VCard</title></Helmet>
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
        <Helmet><title>VCard Components Library - MCOM VCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Unable to load Component Library</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">There was a problem fetching the component list.</p>
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
      <Helmet><title>VCard Components Library - MCOM VCard</title></Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">VCard Components Library</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Central reusable design system for every VCard builder. Create once, use everywhere.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => toast.success('New component creation dialog opened')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Create Component</button>
            <button onClick={() => toast.success('Components exported')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Export</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <KPICard label="Total Components" value={String(COMPONENTS.length)} sub={`${COMPONENTS.filter(c => c.status === 'Published').length} Published · ${COMPONENTS.filter(c => c.status === 'Draft').length} Draft · ${COMPONENTS.filter(c => c.status === 'Archived').length} Archived`} color="text-blue-600" />
        <KPICard label="Used in Business VCards" value={String(COMPONENTS.filter(c => c.availableFor === 'Business' || c.availableFor === 'Both').length)} sub={`${COMPONENTS.filter(c => c.usageCount > 0 && (c.availableFor === 'Business' || c.availableFor === 'Both')).length} actively used`} color="text-teal-600" />
        <KPICard label="Used in Consumer VCards" value={String(COMPONENTS.filter(c => c.availableFor === 'Consumer' || c.availableFor === 'Both').length)} sub={`${COMPONENTS.filter(c => c.usageCount > 0 && (c.availableFor === 'Consumer' || c.availableFor === 'Both')).length} actively used`} color="text-purple-600" />
        <KPICard label="Shared Components" value={String(COMPONENTS.filter(c => c.availableFor === 'Both').length)} sub="Available in both builders" color="text-green-600" />
        <KPICard label="Unused Components" value={String(COMPONENTS.filter(c => c.usageCount === 0).length)} sub="Not in any VCard" color="text-gray-500" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-700">
          {['All', ...CATEGORIES].map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-4 py-2.5 text-[10px] font-medium transition-all ${activeCategory === cat ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-500 bg-orange-50/50 dark:bg-orange-500/5' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              {cat} {cat !== 'All' && `(${COMPONENTS.filter(c => c.category === cat).length})`}
            </button>
          ))}
        </div>
        {activeCategory !== 'All' && (
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
            <p className="text-[10px] text-gray-500">Available component types in <strong className="text-gray-700 dark:text-gray-300">{activeCategory}</strong>:</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {(CATEGORY_COMPONENTS[activeCategory] || []).map((type) => (
                <span key={type} className="text-[9px] px-2 py-0.5 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400">{type}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Component Name, Category, Tags, Builder Type, Status..." className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <FilterSelect label="Category" value={categoryFilter} options={['All', ...CATEGORIES]} onChange={setCategoryFilter} />
            <FilterSelect label="Status" value={statusFilter} options={STATUSES} onChange={setStatusFilter} />
            <FilterSelect label="Available For" value={availFilter} options={AVAILABLE_FOR} onChange={setAvailFilter} />
            <FilterSelect label="Sort" value={sortBy} options={SORT_OPTIONS} onChange={setSortBy} />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No Components Found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">Create reusable VCard components to build Business and Consumer VCards.</p>
          <button onClick={() => toast.success('New component creation dialog opened')} className="px-4 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Create Component</button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="w-8 px-3 py-2.5 text-left"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500" /></th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Preview</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Component</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Category</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Available For</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Version</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Created By</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Published</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Usage</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Updated</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-3 py-2.5"><input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleOne(c.id)} className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500" /></td>
                    <td className="px-3 py-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-[9px]">{c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => setEditorComponent(c)} className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">{c.name}</button>
                    </td>
                    <td className="px-3 py-2.5"><span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400">{c.category}</span></td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-medium ${c.availableFor === 'Both' ? 'text-green-600' : c.availableFor === 'Business' ? 'text-teal-600' : 'text-purple-600'}`}>{c.availableFor}</span>
                    </td>
                    <td className="px-3 py-2.5"><StatusBadge status={c.status} /></td>
                    <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">v{c.version}</td>
                    <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{c.createdBy}</td>
                    <td className="px-3 py-2.5"><span className={`text-[10px] font-medium ${c.published === 'Yes' ? 'text-green-600' : 'text-gray-400'}`}>{c.published}</span></td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-medium ${c.usageCount > 100 ? 'text-green-600' : c.usageCount > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{c.usageCount}</span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">{c.lastUpdated}</td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="relative group inline-block">
                        <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" /></svg>
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                          <div className="py-1">
                            <button onClick={() => setEditorComponent(c)} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Edit</button>
                            <button onClick={() => toast.success(`Previewing ${c.name}`)} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Preview</button>
                            <button onClick={() => toast.success(`${c.name} duplicated`)} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Duplicate</button>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                            {c.status === 'Published' ? (
                              <button onClick={() => toast.success(`${c.name} unpublished`)} className="w-full text-left px-3 py-1.5 text-[11px] text-amber-600 hover:bg-gray-50 dark:hover:bg-gray-700">Unpublish</button>
                            ) : (
                              <button onClick={() => toast.success(`${c.name} published`)} className="w-full text-left px-3 py-1.5 text-[11px] text-green-600 hover:bg-gray-50 dark:hover:bg-gray-700">Publish</button>
                            )}
                            <button onClick={() => toast.success('Version history opened')} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Version History</button>
                            <button onClick={() => toast.success('Usage report opened')} className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View Usage</button>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                            <button onClick={() => toast.success(`${c.name} archived`)} className="w-full text-left px-3 py-1.5 text-[11px] text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700">Archive</button>
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
            <span className="text-[10px] text-gray-500">{filtered.length} of {COMPONENTS.length} components</span>
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-500 mr-1">{selectedIds.length} selected</span>
                <button onClick={() => toast.success('Selected components published')} className="px-2 py-1 rounded text-[10px] font-medium bg-green-50 dark:bg-green-500/10 text-green-600 hover:bg-green-100">Publish</button>
                <button onClick={() => toast.success('Selected components archived')} className="px-2 py-1 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-100">Archive</button>
                <button onClick={() => toast.success('Export started')} className="px-2 py-1 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200">Export</button>
              </div>
            )}
          </div>
        </div>
      )}

      <ComponentEditor component={editorComponent} onClose={() => setEditorComponent(null)} />
    </div>
  )
}
