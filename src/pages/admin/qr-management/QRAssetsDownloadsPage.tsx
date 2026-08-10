import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface AssetData {
  id: number; assetId: string; name: string; qrId: string; assetType: string; category: string; owner: string; ownerType: string; format: string; version: string; status: string; downloads: number; fileSize: string; dimensions: string; resolution: number; printReady: boolean; created: string; lastGenerated: string; compliance: number; template: string; frame: string; ctaText: string; logo: string; foreground: string; background: string;
}

const ASSETS: AssetData[] = [
  { id: 1, assetId: 'AST-BC-0001', name: 'ABC Restaurant Business Card', qrId: 'QR-BV-0001', assetType: 'Business Card', category: 'Business Card', owner: 'ABC Restaurant Ltd', ownerType: 'Business', format: 'PDF', version: 'v3.2', status: 'Ready', downloads: 12480, fileSize: '1.6 MB', dimensions: '85 × 55 mm', resolution: 600, printReady: true, created: '2026-01-16', lastGenerated: '2026-07-29', compliance: 98, template: 'Standard Business QR', frame: 'Rounded', ctaText: 'View Menu & Offers', logo: 'ABC Logo', foreground: '#000000', background: '#FFFFFF' },
  { id: 2, assetId: 'AST-PNG-0001', name: 'ABC Restaurant VCard Kit', qrId: 'QR-BV-0001', assetType: 'Business VCard Kit', category: 'Business Card', owner: 'ABC Restaurant Ltd', ownerType: 'Business', format: 'PNG', version: 'v3.1', status: 'Ready', downloads: 8930, fileSize: '2.4 MB', dimensions: '1024 × 1024', resolution: 300, printReady: false, created: '2026-01-16', lastGenerated: '2026-07-29', compliance: 98, template: 'Standard Business QR', frame: 'Rounded', ctaText: 'View Menu & Offers', logo: 'ABC Logo', foreground: '#000000', background: '#FFFFFF' },
  { id: 3, assetId: 'AST-FLY-0001', name: 'Summer Campaign Flyer', qrId: 'QR-CAMP-001', assetType: 'Flyer', category: 'Flyer', owner: 'Marketing Team', ownerType: 'Campaign', format: 'PDF', version: 'v1.4', status: 'Ready', downloads: 5420, fileSize: '1.8 MB', dimensions: 'A5 · 148 × 210 mm', resolution: 300, printReady: true, created: '2026-06-01', lastGenerated: '2026-07-30', compliance: 97, template: 'Campaign Bright', frame: 'Rounded', ctaText: 'Get 20% Off', logo: 'Summer Logo', foreground: '#DC2626', background: '#FFF5F5' },
  { id: 4, assetId: 'AST-POS-0001', name: 'Music Festival Poster', qrId: 'QR-EVENT-001', assetType: 'Poster', category: 'Poster', owner: 'Events Team', ownerType: 'Campaign', format: 'CMYK PDF', version: 'v2.0', status: 'Ready', downloads: 6980, fileSize: '4.2 MB', dimensions: 'A3 · 297 × 420 mm', resolution: 300, printReady: true, created: '2026-06-10', lastGenerated: '2026-07-25', compliance: 95, template: 'Event Dynamic', frame: 'Rounded', ctaText: 'Get Tickets', logo: 'Festival', foreground: '#7C3AED', background: '#F5F3FF' },
  { id: 5, assetId: 'AST-SM-0001', name: 'Loyalty Social Media Kit', qrId: 'QR-PROMO-005', assetType: 'Social Media Kit', category: 'Social Media', owner: 'Marketing Team', ownerType: 'Campaign', format: 'PNG', version: 'v1.2', status: 'Ready', downloads: 3210, fileSize: '3.8 MB', dimensions: '1080 × 1080 · Story 1080 × 1920', resolution: 72, printReady: false, created: '2026-05-02', lastGenerated: '2026-07-30', compliance: 94, template: 'Premium Consumer QR', frame: 'Rounded', ctaText: 'Earn Points', logo: 'Loyalty', foreground: '#B45309', background: '#FFFBEB' },
  { id: 6, assetId: 'AST-NFC-0001', name: 'Café Mocha NFC Card', qrId: 'QR-BV-0002', assetType: 'NFC Card', category: 'NFC', owner: 'Café Mocha', ownerType: 'Business', format: 'PDF', version: 'v1.0', status: 'Failed', downloads: 0, fileSize: '0 KB', dimensions: 'CR80 · 85.6 × 54 mm', resolution: 600, printReady: true, created: '2026-07-30', lastGenerated: '2026-07-30', compliance: 0, template: 'Standard Business QR', frame: 'Square', ctaText: 'Order Online', logo: 'Café Mocha', foreground: '#6B3A2A', background: '#FFF8F0' },
  { id: 7, assetId: 'AST-PKG-0001', name: 'Premium Coffee Packaging', qrId: 'QR-PROD-001', assetType: 'Product Packaging', category: 'Packaging', owner: 'Café Mocha', ownerType: 'Business', format: 'EPS', version: 'v2.3', status: 'Ready', downloads: 2380, fileSize: '64 KB', dimensions: 'Vector · Flexible', resolution: 0, printReady: true, created: '2026-05-16', lastGenerated: '2026-07-20', compliance: 90, template: 'Standard Business QR', frame: 'Rounded', ctaText: 'Buy Now', logo: 'Café Mocha', foreground: '#92400E', background: '#FFFBEB' },
  { id: 8, assetId: 'AST-SIG-0001', name: 'TechCorp Email Signature', qrId: 'QR-BC-0001', assetType: 'Email Signature', category: 'Social Media', owner: 'TechCorp Inc', ownerType: 'Business', format: 'SVG', version: 'v1.7', status: 'Ready', downloads: 1980, fileSize: '22 KB', dimensions: 'Vector · 300 × 60 px', resolution: 72, printReady: false, created: '2026-03-11', lastGenerated: '2026-07-27', compliance: 91, template: 'Standard Business QR', frame: 'Square', ctaText: 'Contact Sales', logo: 'TechCorp', foreground: '#1E3A5F', background: '#FFFFFF' },
  { id: 9, assetId: 'AST-CC-0001', name: 'Sarah K. Consumer Card', qrId: 'QR-CV-0001', assetType: 'Consumer Card', category: 'Business Card', owner: 'Sarah K.', ownerType: 'Consumer', format: 'PNG', version: 'v1.4', status: 'Ready', downloads: 3120, fileSize: '2.1 MB', dimensions: '85 × 55 mm · 512 px', resolution: 300, printReady: true, created: '2026-04-06', lastGenerated: '2026-07-28', compliance: 88, template: 'Premium Consumer QR', frame: 'Rounded', ctaText: 'Connect with Me', logo: '', foreground: '#7C3AED', background: '#FFFFFF' },
  { id: 10, assetId: 'AST-ROLL-0001', name: 'GreenLeaf Roll-up Banner', qrId: 'QR-SVC-001', assetType: 'Roll-up Banner', category: 'Poster', owner: 'GreenLeaf Spa', ownerType: 'Business', format: 'CMYK PDF', version: 'v1.1', status: 'Generating', downloads: 0, fileSize: '—', dimensions: '85 × 200 cm', resolution: 150, printReady: true, created: '2026-07-29', lastGenerated: '2026-07-30', compliance: 96, template: 'Standard Business QR', frame: 'Rounded', ctaText: 'Book Now', logo: 'GreenLeaf', foreground: '#047857', background: '#F0FDF4' },
  { id: 11, assetId: 'AST-PS-0001', name: 'Boutique Hotel Presentation Kit', qrId: 'QR-BV-0300', assetType: 'Presentation Kit', category: 'Poster', owner: 'Boutique Hotel', ownerType: 'Business', format: 'PDF', version: 'v1.0', status: 'Generating', downloads: 0, fileSize: '—', dimensions: 'A4 · 210 × 297 mm', resolution: 300, printReady: true, created: '2026-07-30', lastGenerated: '2026-07-30', compliance: 0, template: 'Standard Business QR', frame: 'Rounded', ctaText: 'Explore', logo: 'Boutique', foreground: '#7C2D12', background: '#FFF7ED' },
  { id: 12, assetId: 'AST-EXP-0001', name: 'Business Expo Event Badge', qrId: 'QR-EVENT-002', assetType: 'Event Badge', category: 'Business Card', owner: 'Events Team', ownerType: 'Campaign', format: 'PNG', version: 'v0.9', status: 'Generating', downloads: 45, fileSize: '—', dimensions: '512 × 512 · Lanyard size', resolution: 300, printReady: true, created: '2026-07-25', lastGenerated: '2026-07-30', compliance: 89, template: 'Event Dynamic', frame: 'Square', ctaText: 'Register Now', logo: 'Expo', foreground: '#6B21A8', background: '#F3E8FF' },
  { id: 13, assetId: 'AST-STK-0001', name: 'Referral Sticker Pack', qrId: 'QR-PROMO-005', assetType: 'Sticker', category: 'Custom', owner: 'Marketing Team', ownerType: 'Campaign', format: 'SVG', version: 'v2.0', status: 'Archived', downloads: 8760, fileSize: '52 KB', dimensions: '50 × 50 mm · Vector', resolution: 0, printReady: true, created: '2026-01-11', lastGenerated: '2026-06-30', compliance: 92, template: 'Premium Consumer QR', frame: 'Rounded', ctaText: 'Refer a Friend', logo: 'Referral', foreground: '#9333EA', background: '#FAF5FF' },
  { id: 14, assetId: 'AST-CC-0002', name: 'Emma L. VCard Kit', qrId: 'QR-CV-0100', assetType: 'Consumer VCard Kit', category: 'Social Media', owner: 'Emma L.', ownerType: 'Consumer', format: 'WebP', version: 'v1.2', status: 'Ready', downloads: 1480, fileSize: '96 KB', dimensions: '512 × 512', resolution: 72, printReady: false, created: '2026-05-11', lastGenerated: '2026-07-26', compliance: 90, template: 'Premium Consumer QR', frame: 'Rounded', ctaText: 'View My VCard', logo: '', foreground: '#D97706', background: '#FFFFFF' },
]

const QUEUE = [
  { id: 'JOB-1042', asset: 'Boutique Hotel Presentation Kit', type: 'Presentation Kit', format: 'CMYK PDF · A4', priority: 'High', status: 'Queued', progress: 0, submitted: '2026-07-30 09:20', by: 'Emily Park' },
  { id: 'JOB-1041', asset: 'GreenLeaf Roll-up Banner', type: 'Roll-up Banner', format: 'CMYK PDF · 85×200 cm', priority: 'Urgent', status: 'Generating', progress: 62, submitted: '2026-07-30 09:05', by: 'GreenLeaf Spa' },
  { id: 'JOB-1040', asset: 'Business Expo Event Badge', type: 'Event Badge', format: 'PNG · 512 × 512', priority: 'Normal', status: 'Generating', progress: 24, submitted: '2026-07-30 08:58', by: 'Sofia Martins' },
  { id: 'JOB-1039', asset: 'Summer Campaign Flyer', type: 'Flyer', format: 'Print PDF · A5', priority: 'High', status: 'Completed', progress: 100, submitted: '2026-07-30 08:30', by: 'Marketing Team' },
  { id: 'JOB-1038', asset: 'Loyalty Social Media Kit', type: 'Social Media Kit', format: 'PNG · 1080 × 1080', priority: 'Normal', status: 'Completed', progress: 100, submitted: '2026-07-30 08:12', by: 'Marketing Team' },
  { id: 'JOB-1037', asset: 'Café Mocha NFC Card', type: 'NFC Card', format: 'Print PDF · CR80', priority: 'Urgent', status: 'Failed', progress: 0, submitted: '2026-07-30 07:45', by: 'Café Mocha' },
  { id: 'JOB-1036', asset: 'Premium Coffee Packaging', type: 'Product Packaging', format: 'EPS · Vector', priority: 'Normal', status: 'Completed', progress: 100, submitted: '2026-07-29 16:20', by: 'Café Mocha' },
]

const DOWNLOAD_HISTORY = [
  { asset: 'AST-FLY-0001 — Summer Campaign Flyer', by: 'Emily Park', role: 'Marketing Manager', format: 'Print PDF · A5', date: '2026-07-30 09:12' },
  { asset: 'AST-POS-0001 — Music Festival Poster', by: 'Sofia Martins', role: 'Events Coordinator', format: 'CMYK PDF · A3', date: '2026-07-30 08:58' },
  { asset: 'AST-BC-0001 — ABC Restaurant Business Card', by: 'ABC Restaurant Ltd', role: 'Business Owner', format: 'PDF · 85×55 mm', date: '2026-07-30 08:41' },
  { asset: 'AST-SM-0001 — Loyalty Social Media Kit', by: 'James Lee', role: 'Campaign Lead', format: 'PNG · 1080×1080', date: '2026-07-29 19:04' },
  { asset: 'AST-PKG-0001 — Premium Coffee Packaging', by: 'Café Mocha', role: 'Business Owner', format: 'EPS · Vector', date: '2026-07-29 16:47' },
  { asset: 'AST-SIG-0001 — TechCorp Email Signature', by: 'TechCorp Inc', role: 'Business Owner', format: 'SVG · Vector', date: '2026-07-29 14:22' },
  { asset: 'AST-CC-0001 — Sarah K. Consumer Card', by: 'Sarah K.', role: 'Consumer', format: 'PNG · 512 px', date: '2026-07-28 20:15' },
]

const SHARE_LINKS = [
  { asset: 'AST-POS-0001 — Music Festival Poster', link: 'https://qrm.mcom.app/s/ast-pos-0001/print', scope: 'Print team', expires: '2026-08-05', downloads: 42 },
  { asset: 'AST-FLY-0001 — Summer Campaign Flyer', link: 'https://qrm.mcom.app/s/ast-fly-0001/agency', scope: 'Agency access', expires: '2026-07-31', downloads: 18 },
  { asset: 'AST-SM-0001 — Loyalty Social Media Kit', link: 'https://qrm.mcom.app/s/ast-sm-0001/social', scope: 'Social partners', expires: '2026-08-20', downloads: 27 },
  { asset: 'AST-BC-0001 — ABC Restaurant Business Card', link: 'https://qrm.mcom.app/s/ast-bc-0001/print', scope: 'Print shop', expires: '2026-08-10', downloads: 9 },
]

const PRINTPACKS = [
  { name: 'Summer Campaign Print Pack', contents: 'Flyer A5 · Poster A3 · Roll-up · Sticker', status: 'Ready', prepared: '2026-07-30 08:30' },
  { name: 'ABC Restaurant Refresh Pack', contents: 'Business Card · VCard Kit · Menu insert', status: 'Ready', prepared: '2026-07-29 11:40' },
  { name: 'Business Expo Badge Pack', contents: 'Event Badge · Lanyard insert', status: 'Generating', prepared: '2026-07-30 09:05' },
]

const NOTIFICATIONS = [
  { icon: '✓', color: 'text-green-600', msg: 'Asset generation completed — Loyalty Social Media Kit', date: '2 min ago' },
  { icon: '▤', color: 'text-blue-600', msg: 'Print-ready PDF available — Summer Campaign Flyer', date: '18 min ago' },
  { icon: '↗', color: 'text-indigo-600', msg: 'Download link created for Agency access', date: '1 h ago' },
  { icon: '!', color: 'text-red-600', msg: 'Asset regeneration failed — Café Mocha NFC Card', date: '3 h ago' },
  { icon: '↻', color: 'text-amber-600', msg: 'Brand template updated — asset refresh recommended', date: 'Yesterday' },
]

const PERMISSIONS = [
  { role: 'Super Admin', scope: 'Full access — assets, production, distribution, purge', color: 'bg-red-500' },
  { role: 'Brand Manager', scope: 'Manage designs and production', color: 'bg-indigo-500' },
  { role: 'Marketing Manager', scope: 'Generate campaign assets', color: 'bg-blue-500' },
  { role: 'Operations', scope: 'Manage production queue', color: 'bg-teal-500' },
  { role: 'Support', scope: 'View and download assets', color: 'bg-gray-400' },
  { role: 'Business Users', scope: 'Generate/download own business assets per membership entitlements', color: 'bg-green-500' },
]

const COMING_SOON = [
  'Professional Print Partner Integration — send print-ready assets directly to approved print providers',
  'Canva and Design Tool Integration — export editable marketing packs to external design tools',
  'White-Label Asset Packs — generate branded assets for partner organisations',
  'Merchandise Asset Generator — QR layouts for T-shirts, mugs, banners, vehicle wraps, and promotional products',
  'Digital Signage Packages — assets optimised for kiosks, digital displays, and interactive screens',
  'Automated Asset Refresh — regenerate assets automatically when a template or brand changes',
]

const TYPE_FILTERS = ['All', 'Business Card', 'Flyer', 'Poster', 'Social Media', 'NFC', 'Packaging', 'Custom']
const OWNER_FILTERS = ['All', 'Business', 'Consumer', 'Campaign']
const FORMAT_FILTERS = ['All', 'PNG', 'SVG', 'PDF', 'EPS', 'WebP']
const STATUS_FILTERS = ['All', 'Ready', 'Generating', 'Failed', 'Archived']

const tabs = ['overview', 'design', 'formats', 'print', 'distribution', 'versions', 'downloads', 'activity']
const tabLabels = ['Overview', 'Design', 'Output Formats', 'Print Settings', 'Distribution', 'Version History', 'Downloads', 'Activity']

function FormatBadge({ format }: { format: string }) {
  const colors: Record<string, string> = { 'PNG': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600', 'SVG': 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600', 'PDF': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600', 'CMYK PDF': 'bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600', 'EPS': 'bg-teal-50 dark:bg-teal-500/10 text-teal-600', 'WebP': 'bg-rose-50 dark:bg-rose-500/10 text-rose-600' }
  return <span className={"px-2 py-0.5 rounded font-mono text-[9px] font-semibold " + (colors[format] || 'bg-gray-50 dark:bg-gray-500/10 text-gray-500')}>{format}</span>
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { 'Ready': 'bg-green-50 dark:bg-green-500/10 text-green-600', 'Generating': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600', 'Failed': 'bg-red-50 dark:bg-red-500/10 text-red-600', 'Archived': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500' }
  return <span className={"px-2 py-0.5 rounded-full text-[10px] font-medium " + (colors[status] || 'bg-gray-50 dark:bg-gray-500/10 text-gray-500')}>{status}</span>
}

function OwnerBadge({ ownerType }: { ownerType: string }) {
  const colors: Record<string, string> = { 'Business': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600', 'Consumer': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600', 'Campaign': 'bg-rose-50 dark:bg-rose-500/10 text-rose-600' }
  return <span className={"px-2 py-0.5 rounded-full text-[10px] font-medium " + (colors[ownerType] || 'bg-gray-50 dark:bg-gray-500/10 text-gray-500')}>{ownerType}</span>
}

function TypeBadge({ type }: { type: string }) {
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400">{type}</span>
}

function QRPreview({ fg, bg, size = 64 }: { fg: string; bg: string; size?: number }) {
  const pattern = [
    [0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[2,0],[3,0],[4,0],[1,4],[2,4],[3,4],[4,4],[1,2],[2,1],[2,2],[2,3],[3,2],
    [16,0],[16,1],[16,2],[16,3],[16,4],[17,0],[18,0],[19,0],[20,0],[17,4],[18,4],[19,4],[20,4],[17,2],[18,1],[18,2],[18,3],[19,2],
    [0,16],[0,17],[0,18],[0,19],[0,20],[1,16],[2,16],[3,16],[4,16],[1,20],[2,20],[3,20],[4,20],[1,18],[2,17],[2,18],[2,19],[3,18],
    [8,5],[9,5],[10,5],[8,6],[10,6],[8,8],[9,8],[10,8],[12,7],[13,7],[14,7],[5,12],[6,12],[7,12],[6,13],[7,14],
    [5,5],[5,9],[9,9],[12,12],[12,14],[14,12],[14,14],[16,16],[16,18],[18,16],[18,18],[6,18],[11,11],[13,17],[17,13],
  ]
  return (
    <svg width={size} height={size} viewBox="0 0 21 21" style={{ background: bg }}>
      {pattern.map(([r, c], i) => <rect key={i} x={c} y={r} width="1" height="1" fill={fg} />)}
    </svg>
  )
}

export default function QRAssetsDownloadsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterOwner, setFilterOwner] = useState('All')
  const [filterFormat, setFilterFormat] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [selected, setSelected] = useState<number[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [workspaceTab, setWorkspaceTab] = useState('overview')

  const filtered = useMemo(() => {
    return ASSETS.filter(a => {
      if (search) { const s = search.toLowerCase(); if (!a.assetId.toLowerCase().includes(s) && !a.name.toLowerCase().includes(s) && !a.owner.toLowerCase().includes(s) && !a.qrId.toLowerCase().includes(s) && !a.assetType.toLowerCase().includes(s)) return false }
      if (filterType !== 'All' && a.category !== filterType) return false
      if (filterOwner !== 'All' && a.ownerType !== filterOwner) return false
      if (filterFormat !== 'All' && a.format !== filterFormat) return false
      if (filterStatus !== 'All' && a.status !== filterStatus) return false
      return true
    })
  }, [search, filterType, filterOwner, filterFormat, filterStatus])

  const asset = selectedId !== null ? ASSETS.find(x => x.id === selectedId)! : null

  function handleAction(msg: string) { toast.success(msg) }
  function toggleSelect(id: number) { setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]) }

  const totalAssets = ASSETS.length
  const publishedAssets = ASSETS.filter(x => x.status === 'Ready').length
  const pendingProduction = ASSETS.filter(x => x.status === 'Generating').length
  const failedProduction = ASSETS.filter(x => x.status === 'Failed').length
  const archivedAssets = ASSETS.filter(x => x.status === 'Archived').length
  const printReadyAssets = ASSETS.filter(x => x.printReady).length
  const digitalAssets = ASSETS.filter(x => !x.printReady).length
  const printCards = ASSETS.filter(x => x.category === 'Business Card').length
  const printFlyers = ASSETS.filter(x => x.category === 'Flyer').length
  const printPosters = ASSETS.filter(x => x.category === 'Poster').length
  const printNfc = ASSETS.filter(x => x.category === 'NFC').length
  const totalDownloads = ASSETS.reduce((s, a) => s + a.downloads, 0)
  const avgCompliance = ASSETS.filter(x => x.compliance > 0).reduce((s, a) => s + a.compliance, 0) / ASSETS.filter(x => x.compliance > 0).length
  const queuedJobs = QUEUE.filter(q => q.status === 'Queued').length
  const generatingJobs = QUEUE.filter(q => q.status === 'Generating').length
  const completedJobs = QUEUE.filter(q => q.status === 'Completed').length
  const failedJobs = QUEUE.filter(q => q.status === 'Failed').length

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-8 gap-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
        <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /><div className="h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Unable to load QR Assets.</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The QR Asset Generation Engine could not be reached.</p>
        <div className="flex gap-3">
          <button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 800) }} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Retry</button>
          <Link to="/admin/system-status" className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">View System Status</Link>
        </div>
      </div>
    )
  }

  if (!asset && selectedId === null) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">QR Assets &amp; Downloads</h1>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Production and distribution centre — prepare QR Codes for digital, print, marketing, business cards, NFC, signage, packaging, and events.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleAction('Opening Generate Assets...')} className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-semibold hover:bg-indigo-600">Generate Assets</button>
              <button onClick={() => handleAction('Opening Bulk Generate...')} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700">Bulk Generate</button>
              <button onClick={() => handleAction('Uploading Brand Pack...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Upload Brand Pack</button>
              <button onClick={() => handleAction('Exporting asset library...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Export Library</button>
              <button onClick={() => handleAction('Opening Print Queue...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Print Queue</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-8 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Total Assets</p><p className="text-sm font-bold text-gray-900 dark:text-white">{totalAssets.toLocaleString()}</p><p className="text-[9px] text-gray-400">{publishedAssets} Published · {pendingProduction} Generating · {archivedAssets} Archived</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Print Ready Assets</p><p className="text-sm font-bold text-green-600">{printReadyAssets}</p><p className="text-[9px] text-gray-400">Cards {printCards} · Flyers {printFlyers} · Posters {printPosters} · NFC {printNfc}</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Digital Assets</p><p className="text-sm font-bold text-blue-600">{digitalAssets}</p><p className="text-[9px] text-gray-400">PNG · SVG · PDF · Email · Social</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-amber-100 dark:border-amber-500/10 p-3"><p className="text-[10px] text-amber-500">Pending Production</p><p className="text-sm font-bold text-amber-600">{pendingProduction}</p><p className="text-[9px] text-amber-400">Awaiting generation</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-100 dark:border-red-500/10 p-3"><p className="text-[10px] text-red-500">Failed Production</p><p className="text-sm font-bold text-red-600">{failedProduction}</p><p className="text-[9px] text-red-400">Require attention</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Download Count</p><p className="text-sm font-bold text-indigo-600">{totalDownloads.toLocaleString()}</p><p className="text-[9px] text-gray-400">All time</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Storage Usage</p><p className="text-sm font-bold text-gray-900 dark:text-white">38.4 GB</p><p className="text-[9px] text-gray-400">72% of 50 GB quota</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Brand Compliance</p><p className="text-sm font-bold text-purple-600">{avgCompliance.toFixed(0)}%</p><p className="text-[9px] text-gray-400">Approved templates</p></div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search asset ID, name, business, consumer, QR ID, campaign, file type..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {TYPE_FILTERS.map(t => <option key={t} value={t}>{t === 'All' ? 'All Asset Types' : t}</option>)}
          </select>
          <select value={filterOwner} onChange={e => setFilterOwner(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {OWNER_FILTERS.map(o => <option key={o} value={o}>{o === 'All' ? 'All Owners' : o}</option>)}
          </select>
          <select value={filterFormat} onChange={e => setFilterFormat(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {FORMAT_FILTERS.map(f => <option key={f} value={f}>{f === 'All' ? 'All Formats' : f}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {STATUS_FILTERS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Asset Library</h4>
            <div className="flex items-center gap-2">
              {selected.length > 0 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => handleAction('Generating ' + selected.length + ' assets')} className="px-2 py-1 bg-indigo-500 text-white rounded text-[9px] font-medium hover:bg-indigo-600">Generate ({selected.length})</button>
                  <button onClick={() => handleAction('Downloading ZIP package of ' + selected.length + ' assets')} className="px-2 py-1 bg-green-500 text-white rounded text-[9px] font-medium hover:bg-green-600">Download ZIP</button>
                  <button onClick={() => handleAction('Applying updated QR Design Template to ' + selected.length + ' assets')} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-50">Apply Template</button>
                  <button onClick={() => handleAction('Regenerating ' + selected.length + ' assets')} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-50">Regenerate</button>
                  <button onClick={() => handleAction('Exporting metadata for ' + selected.length + ' assets')} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-50">Export Metadata</button>
                  <button onClick={() => handleAction('Archiving ' + selected.length + ' assets')} className="px-2 py-1 border border-red-200 dark:border-red-500/20 rounded text-[9px] text-red-600 hover:bg-red-50">Archive</button>
                  <button onClick={() => setSelected([])} className="px-2 py-1 text-[9px] text-gray-400 hover:underline">Clear</button>
                </div>
              )}
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">No QR Assets Found</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">Generate your first QR asset to prepare it for print or digital distribution.</p>
              <button onClick={() => handleAction('Opening Generate Assets...')} className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-xs font-medium hover:bg-indigo-600">Generate Assets</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left py-2 pl-3 font-medium text-gray-400"><input type="checkbox" checked={selected.length === filtered.length} onChange={() => { if (selected.length === filtered.length) setSelected([]); else setSelected(filtered.map(f => f.id)) }} className="accent-indigo-500" /></th>
                  <th className="text-left py-2 font-medium text-gray-400">Asset ID</th>
                  <th className="text-left py-2 font-medium text-gray-400">Asset Name</th>
                  <th className="text-left py-2 font-medium text-gray-400">QR Code</th>
                  <th className="text-left py-2 font-medium text-gray-400">Asset Type</th>
                  <th className="text-left py-2 font-medium text-gray-400">Owner</th>
                  <th className="text-left py-2 font-medium text-gray-400">Format</th>
                  <th className="text-left py-2 font-medium text-gray-400">Version</th>
                  <th className="text-left py-2 font-medium text-gray-400">Status</th>
                  <th className="text-center py-2 font-medium text-gray-400">Downloads</th>
                  <th className="text-left py-2 font-medium text-gray-400">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id} className={'border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer ' + (selectedId === a.id ? 'bg-indigo-50 dark:bg-indigo-500/5' : '')} onClick={() => setSelectedId(a.id)}>
                      <td className="py-2 pl-3" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggleSelect(a.id)} className="accent-indigo-500" /></td>
                      <td className="py-2 font-mono text-[10px] text-gray-900 dark:text-white">{a.assetId}</td>
                      <td className="py-2"><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: a.foreground }} /><span className="font-medium text-gray-900 dark:text-white">{a.name}</span></div></td>
                      <td className="py-2"><span className="font-mono text-[10px] text-gray-400">{a.qrId}</span></td>
                      <td className="py-2"><TypeBadge type={a.assetType} /></td>
                      <td className="py-2"><div className="flex items-center gap-1.5"><OwnerBadge ownerType={a.ownerType} /><span className="text-[10px] text-gray-500 truncate max-w-[110px]">{a.owner}</span></div></td>
                      <td className="py-2"><FormatBadge format={a.format} /></td>
                      <td className="py-2 font-mono text-[10px] text-gray-500">{a.version}</td>
                      <td className="py-2"><StatusBadge status={a.status} /></td>
                      <td className="py-2 text-center font-medium text-gray-900 dark:text-white">{a.downloads.toLocaleString()}</td>
                      <td className="py-2"><div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleAction('Previewing ' + a.name)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">Preview</button>
                        <button onClick={() => handleAction('Downloading ' + a.name + ' (' + a.format + ')')} className="px-1.5 py-0.5 bg-indigo-500 text-white rounded text-[9px] font-medium hover:bg-indigo-600">Download</button>
                        <button onClick={() => handleAction('Printing ' + a.name)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">Print</button>
                        <button onClick={() => handleAction('Regenerating ' + a.name)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">Regen</button>
                        <button onClick={() => handleAction('Sharing ' + a.name)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">Share</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Production Queue</h4>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-2 h-2 rounded-full bg-gray-400" />Queued {queuedJobs}</span>
              <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-2 h-2 rounded-full bg-amber-400" />Generating {generatingJobs}</span>
              <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-2 h-2 rounded-full bg-green-500" />Completed {completedJobs}</span>
              <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-2 h-2 rounded-full bg-red-500" />Failed {failedJobs}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400">
                <th className="text-left py-1.5 font-medium">Job</th>
                <th className="text-left py-1.5 font-medium">Asset</th>
                <th className="text-left py-1.5 font-medium">Output</th>
                <th className="text-left py-1.5 font-medium">Priority</th>
                <th className="text-left py-1.5 font-medium">Status</th>
                <th className="text-left py-1.5 font-medium">Submitted</th>
                <th className="text-left py-1.5 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {QUEUE.map(q => (
                  <tr key={q.id} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                    <td className="py-2 font-mono text-[10px] text-gray-500">{q.id}</td>
                    <td className="py-2 font-medium text-gray-900 dark:text-white">{q.asset}</td>
                    <td className="py-2 text-gray-500">{q.format}</td>
                    <td className="py-2"><span className={'px-2 py-0.5 rounded-full text-[9px] font-medium ' + (q.priority === 'Urgent' ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : q.priority === 'High' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : 'bg-gray-50 dark:bg-gray-500/10 text-gray-500')}>{q.priority}</span></td>
                    <td className="py-2">
                      {q.status === 'Generating' ? <div className="flex items-center gap-2"><div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1"><div className="bg-indigo-500 h-1 rounded-full" style={{ width: q.progress + '%' }} /></div><span className="text-[9px] text-gray-400">{q.progress}%</span></div> : <StatusBadge status={q.status} />}
                    </td>
                    <td className="py-2 text-gray-400">{q.submitted}<p className="text-[9px] text-gray-400">{q.by}</p></td>
                    <td className="py-2"><div className="flex gap-1">
                      {q.status === 'Failed' && <button onClick={() => handleAction('Retrying ' + q.id)} className="px-2 py-0.5 bg-red-500 text-white rounded text-[9px] font-medium hover:bg-red-600">Retry</button>}
                      {q.status === 'Queued' && <button onClick={() => handleAction('Cancelling ' + q.id)} className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-50">Cancel</button>}
                      {(q.status === 'Queued' || q.status === 'Generating') && <button onClick={() => handleAction('Prioritising ' + q.id)} className="px-2 py-0.5 bg-amber-500 text-white rounded text-[9px] font-medium hover:bg-amber-600">Prioritise</button>}
                      {q.status === 'Completed' && <button onClick={() => handleAction('Downloading output of ' + q.id)} className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-50">Get File</button>}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Recently Downloaded</h4>
            <div className="space-y-2">
              {DOWNLOAD_HISTORY.map((d, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-[9px] font-bold text-indigo-600 shrink-0">{d.by.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-800 dark:text-gray-200 truncate">{d.asset}</p>
                    <p className="text-[9px] text-gray-400">{d.by} · {d.role} · {d.format}</p>
                  </div>
                  <span className="text-[9px] text-gray-400 shrink-0">{d.date.split(' ')[1]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Shared Assets &amp; Expiring Links</h4>
              <div className="space-y-2">
                {SHARE_LINKS.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                    <div className="min-w-0">
                      <p className="text-[11px] text-gray-800 dark:text-gray-200 truncate">{s.asset}</p>
                      <p className="font-mono text-[9px] text-gray-400 truncate">{s.link} · {s.scope}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={'text-[9px] ' + (s.expires <= '2026-07-31' ? 'text-red-600 font-medium' : 'text-gray-400')}>{s.expires}</span>
                      <button onClick={() => handleAction('Copying share link for ' + s.asset)} className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-50">Copy</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Print-Ready Packages Awaiting Collection</h4>
              <div className="space-y-2">
                {PRINTPACKS.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-gray-900 dark:text-white">{p.name}</p>
                      <p className="text-[9px] text-gray-400">{p.contents} · {p.prepared}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={'px-2 py-0.5 rounded-full text-[9px] font-medium ' + (p.status === 'Ready' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600')}>{p.status}</span>
                      {p.status === 'Ready' && <button onClick={() => handleAction('Downloading ' + p.name)} className="px-2 py-1 bg-indigo-500 text-white rounded text-[9px] font-medium hover:bg-indigo-600">Download</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Notifications</h4>
          <div className="grid grid-cols-5 gap-3">
            {NOTIFICATIONS.map((n, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                <span className={'text-sm ' + n.color}>{n.icon}</span>
                <p className="text-[10px] text-gray-700 dark:text-gray-300 mt-1">{n.msg}</p>
                <p className="text-[9px] text-gray-400 mt-1">{n.date}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Permissions</h4>
          <div className="grid grid-cols-6 gap-3">
            {PERMISSIONS.map((p, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                <span className={'w-2 h-2 rounded-full inline-block mb-1 ' + p.color} />
                <p className="text-[11px] font-medium text-gray-900 dark:text-white">{p.role}</p>
                <p className="text-[9px] text-gray-400 mt-0.5">{p.scope}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-500/5 rounded-xl border border-amber-200 dark:border-amber-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300">Coming Soon — Production &amp; Distribution Ecosystem</h4>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {COMING_SOON.map((c, i) => (
              <div key={i} className="bg-white dark:bg-gray-800/50 rounded-lg p-2.5 border border-amber-100 dark:border-amber-500/10">
                <div className="flex items-center gap-1 mb-1"><svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg><span className="text-[9px] font-medium text-amber-600 dark:text-amber-400">Coming Soon</span></div>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">{c}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedId(null)} className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shrink-0"><QRPreview fg={asset!.foreground} bg={asset!.background} size={48} /></div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">{asset!.name}</h1>
              <p className="text-xs text-gray-500">{asset!.assetId} · {asset!.qrId} · <TypeBadge type={asset!.assetType} /> · <FormatBadge format={asset!.format} /> · <StatusBadge status={asset!.status} /></p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleAction('Previewing ' + asset!.name)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Preview</button>
          <button onClick={() => handleAction('Downloading ' + asset!.format + ' — ' + asset!.name)} className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-medium hover:bg-indigo-600">Download</button>
          <button onClick={() => handleAction('Regenerating ' + asset!.name)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Regenerate</button>
          <button onClick={() => handleAction('Printing ' + asset!.name)} className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600">Print</button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-px">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setWorkspaceTab(t)} className={'px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ' + (workspaceTab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}>{tabLabels[i]}</button>
        ))}
      </div>

      {workspaceTab === 'overview' && asset && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Asset Information</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Asset ID</span><span className="font-mono text-gray-900 dark:text-white">{asset.assetId}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Asset Name</span><span className="font-medium text-gray-900 dark:text-white">{asset.name}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">QR Code</span><span className="font-mono text-gray-900 dark:text-white">{asset.qrId}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Owner</span><div className="flex items-center gap-1.5"><OwnerBadge ownerType={asset.ownerType} /><span className="text-gray-900 dark:text-white">{asset.owner}</span></div></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Asset Type</span><TypeBadge type={asset.assetType} /></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Format</span><FormatBadge format={asset.format} /></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Version</span><span className="font-mono text-gray-500">{asset.version}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Created</span><span className="text-gray-500">{asset.created}</span></div>
              <div className="flex justify-between py-1"><span className="text-gray-500">Last Generated</span><span className="text-gray-500">{asset.lastGenerated}</span></div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Asset Snapshot</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Total Downloads</p><p className="text-sm font-bold text-gray-900 dark:text-white">{asset.downloads.toLocaleString()}</p></div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Brand Compliance</p><p className="text-sm font-bold text-purple-600">{asset.compliance > 0 ? asset.compliance + '%' : '—'}</p></div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Print-Ready</p><p className={'text-sm font-bold ' + (asset.printReady ? 'text-green-600' : 'text-gray-400')}>{asset.printReady ? 'Yes' : 'No'}</p></div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Dimensions</p><p className="text-sm font-bold text-gray-900 dark:text-white text-[11px]">{asset.dimensions}</p></div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 mt-3 text-xs"><p className="text-[10px] text-gray-500 mb-1">Output Configuration</p><p className="font-medium text-gray-900 dark:text-white">{asset.dimensions} · {asset.resolution > 0 ? asset.resolution + ' DPI' : 'Vector'} · {asset.fileSize}</p></div>
            <div className="mt-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg p-3 text-xs"><p className="text-[10px] text-indigo-500 mb-1">QR Asset Generation Engine</p><p className="text-indigo-800 dark:text-indigo-300">This deliverable is rendered independently of routing and design engines — the QR pattern is constant, so printed material stays valid even when the destination changes.</p></div>
          </div>
        </div>
      )}

      {workspaceTab === 'design' && asset && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Visual Configuration — inherited from the QR Design System</h4>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"><QRPreview fg={asset.foreground} bg={asset.background} size={64} /></div>
              <div>
                <p className="text-[11px] font-medium text-gray-900 dark:text-white">{asset.template}</p>
                <p className="text-[9px] text-gray-400">QR appearance · {asset.frame} frame</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Design Template</span><span className="font-medium text-gray-900 dark:text-white">{asset.template}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Logo</span><span className="font-medium text-gray-900 dark:text-white">{asset.logo || 'No logo'}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Frame</span><span className="font-medium text-gray-900 dark:text-white">{asset.frame}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">CTA Text</span><span className="font-medium text-gray-900 dark:text-white">{asset.ctaText || '—'}</span></div>
              <div className="flex justify-between py-1"><span className="text-gray-500">Brand Colours</span><span className="flex items-center gap-2"><span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: asset.foreground }} /><span className="font-mono text-[9px] text-gray-500">{asset.foreground}</span></span><span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: asset.background }} /><span className="font-mono text-[9px] text-gray-500">{asset.background}</span></span></span></div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Design Preview</h4>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 mx-auto"><QRPreview fg={asset.foreground} bg={asset.background} size={96} /></div>
                <p className="text-[9px] text-gray-400 mt-2">{asset.ctaText || 'Scan me'}</p>
              </div>
            </div>
            <div className="mt-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-xs">
              <p className="text-[10px] text-gray-500 mb-1">Source of Truth</p>
              <p className="text-gray-700 dark:text-gray-300">Appearance is inherited from the QR Design System. To change the look, edit the source template in <Link to="/admin/qr/templates" className="text-indigo-600 hover:underline">8.3 — QR Design System</Link>. Regenerate this asset afterwards.</p>
            </div>
          </div>
        </div>
      )}

      {workspaceTab === 'formats' && asset && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Digital Formats</h4>
            <div className="grid grid-cols-4 gap-3">
              {[{ f: 'PNG', d: '1024 × 1024', s: '2.4 MB', r: 'Screen + print raster' }, { f: 'SVG', d: 'Vector', s: '48 KB', r: 'Scalable web & signage' }, { f: 'PDF', d: 'Digital PDF', s: '1.8 MB', r: 'Distributable document' }, { f: 'EPS', d: 'Vector', s: '64 KB', r: 'Design software' }, { f: 'WebP', d: '512 × 512', s: '96 KB', r: 'Fast web loading' }].map((fmt, i) => (
                <div key={i} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FormatBadge format={fmt.f} />
                    <div>
                      <p className="text-[10px] text-gray-500">{fmt.d} · {fmt.s}</p>
                      <p className="text-[9px] text-gray-400">{fmt.r}</p>
                    </div>
                  </div>
                  <button onClick={() => handleAction('Downloading ' + fmt.f + ' for ' + asset.name)} className="px-2 py-1 bg-indigo-500 text-white rounded text-[9px] font-medium hover:bg-indigo-600">Get</button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Print Sizes</h4>
            <div className="grid grid-cols-7 gap-3">
              {[{ s: 'A7', d: '74 × 105 mm' }, { s: 'A6', d: '105 × 148 mm' }, { s: 'A5', d: '148 × 210 mm' }, { s: 'A4', d: '210 × 297 mm' }, { s: 'A3', d: '297 × 420 mm' }, { s: 'Business Card', d: '85 × 55 mm' }, { s: 'Custom', d: 'Any size' }].map((sz, i) => (
                <div key={i} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3 text-center hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors cursor-pointer" onClick={() => handleAction('Preparing ' + sz.s + ' output for ' + asset.name)}>
                  <p className="text-[11px] font-medium text-gray-900 dark:text-white">{sz.s}</p>
                  <p className="text-[9px] text-gray-400">{sz.d}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Resolution</h4>
            <div className="grid grid-cols-3 gap-3">
              {[{ r: 'Screen (72 dpi)', use: 'Web, social, email' }, { r: 'Standard Print (300 dpi)', use: 'Most print materials' }, { r: 'High Resolution (600 dpi)', use: 'Business cards, packaging, fine print' }].map((res, i) => (
                <div key={i} className={'border rounded-lg p-3 text-center cursor-pointer transition-colors ' + (i === 2 ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500')} onClick={() => handleAction('Selecting ' + res.r)}>
                  <p className="text-[11px] font-medium text-gray-900 dark:text-white">{res.r}</p>
                  <p className="text-[9px] text-gray-400">{res.use}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => handleAction('Generating asset in all output formats')} className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-[10px] font-medium hover:bg-indigo-600">Generate All Formats</button>
              <button onClick={() => handleAction('Opening Canva export (coming soon)')} className="px-3 py-1.5 border border-amber-200 dark:border-amber-500/20 rounded-lg text-[10px] text-amber-600 hover:bg-amber-50">Canva Export · Coming Soon</button>
              <button onClick={() => handleAction('Opening Illustrator package (coming soon)')} className="px-3 py-1.5 border border-amber-200 dark:border-amber-500/20 rounded-lg text-[10px] text-amber-600 hover:bg-amber-50">Illustrator Package · Coming Soon</button>
            </div>
          </div>
        </div>
      )}

      {workspaceTab === 'print' && asset && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Print Settings — commercial print standards</h4>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div><p className="text-[10px] text-gray-500 mb-1">Paper Size</p><select className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option>Business Card (85 × 55 mm)</option><option>A5</option><option>A4</option><option>A3</option><option>A2</option><option>Custom</option></select></div>
            <div><p className="text-[10px] text-gray-500 mb-1">Bleed</p><select className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option>3 mm (standard)</option><option>0 mm</option><option>5 mm</option></select></div>
            <div><p className="text-[10px] text-gray-500 mb-1">Crop Marks</p><select className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option>On</option><option>Off</option></select></div>
            <div><p className="text-[10px] text-gray-500 mb-1">Safe Margins</p><select className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option>4 px (default)</option><option>8 px</option><option>16 px</option></select></div>
            <div><p className="text-[10px] text-gray-500 mb-1">Colour Profile</p><select className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option>CMYK (print)</option><option>RGB (digital)</option></select></div>
            <div><p className="text-[10px] text-gray-500 mb-1">Print Quantity</p><input type="number" defaultValue={100} className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
            <div><p className="text-[10px] text-gray-500 mb-1">Duplex</p><select className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option>Off</option><option>On</option></select></div>
            <div><p className="text-[10px] text-gray-500 mb-1">Orientation</p><select className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option>Portrait</option><option>Landscape</option></select></div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-xs mb-4">
            <p className="text-[10px] text-gray-500 mb-1">Production Estimate</p>
            <p className="text-gray-700 dark:text-gray-300">{asset.assetType} on Business Card (85 × 55 mm) · CMYK · 3 mm bleed · crop marks · 100 units — generated as a printer-friendly file meeting commercial standards.</p>
          </div>
          <button onClick={() => handleAction('Generating print-ready file for ' + asset.name)} className="px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600">Generate Print-Ready File</button>
        </div>
      )}

      {workspaceTab === 'distribution' && asset && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Distribution Methods</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <div><p className="text-[11px] font-medium text-gray-900 dark:text-white">Download</p><p className="text-[9px] text-gray-400">Direct file download</p></div>
                <button onClick={() => handleAction('Downloading ' + asset.name)} className="px-3 py-1 bg-indigo-500 text-white rounded text-[9px] font-medium hover:bg-indigo-600">Download</button>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <div><p className="text-[11px] font-medium text-gray-900 dark:text-white">Share Link</p><p className="text-[9px] text-gray-400">Expiry: 7 days · 30 days · No expiry</p></div>
                <div className="flex items-center gap-2">
                  <select className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option>7 days</option><option>30 days</option><option>No expiry</option></select>
                  <button onClick={() => handleAction('Generating share link for ' + asset.name)} className="px-3 py-1 bg-green-500 text-white rounded text-[9px] font-medium hover:bg-green-600">Generate</button>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <div><p className="text-[11px] font-medium text-gray-900 dark:text-white">Email</p><p className="text-[9px] text-amber-600">Coming Soon</p></div>
                <button disabled className="px-3 py-1 border border-gray-200 dark:border-gray-600 rounded text-[9px] text-gray-400 cursor-not-allowed">Send</button>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <div><p className="text-[11px] font-medium text-gray-900 dark:text-white">Cloud Storage</p><p className="text-[9px] text-amber-600">Coming Soon</p></div>
                <button disabled className="px-3 py-1 border border-gray-200 dark:border-gray-600 rounded text-[9px] text-gray-400 cursor-not-allowed">Push</button>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <div><p className="text-[11px] font-medium text-gray-900 dark:text-white">Print Provider Integration</p><p className="text-[9px] text-amber-600">Coming Soon</p></div>
                <button disabled className="px-3 py-1 border border-gray-200 dark:border-gray-600 rounded text-[9px] text-gray-400 cursor-not-allowed">Send to Printer</button>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Active Share Links — {asset.assetId}</h4>
            <div className="space-y-2">
              {SHARE_LINKS.filter(s => s.asset.includes(asset.name.split(' ')[0])).map((s, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                  <div className="min-w-0">
                    <p className="font-mono text-[9px] text-gray-500 truncate">{s.link}</p>
                    <p className="text-[9px] text-gray-400">{s.scope} · Expires {s.expires} · {s.downloads} downloads</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleAction('Copying share link')} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-50">Copy</button>
                    <button onClick={() => handleAction('Revoking share link')} className="px-2 py-1 border border-red-200 dark:border-red-500/20 rounded text-[9px] text-red-600 hover:bg-red-50">Revoke</button>
                  </div>
                </div>
              ))}
              {SHARE_LINKS.filter(s => s.asset.includes(asset.name.split(' ')[0])).length === 0 && <p className="text-center text-[11px] text-gray-400 py-6">No share links for this asset yet.</p>}
            </div>
          </div>
        </div>
      )}

      {workspaceTab === 'versions' && asset && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Version History — a new version is created on every regeneration</h4>
          <div className="space-y-2">
            {[
              { v: asset.version, date: asset.lastGenerated, by: 'System — Asset Generation Engine', note: 'Re-rendered from current QR Design template (' + asset.template + ')', current: true },
              { v: 'v2.1', date: '2026-06-18', by: 'Emily Park', note: 'Output settings changed — 300 dpi → 600 dpi for print', current: false },
              { v: 'v2.0', date: '2026-04-02', by: 'System — Brand Preset', note: 'Brand preset applied — colours and logo updated', current: false },
              { v: 'v1.4', date: '2026-02-10', by: 'James Lee', note: 'CTA text changed to "' + (asset.ctaText || 'Scan me') + '"', current: false },
              { v: 'v1.0', date: asset.created, by: 'System — Initial Render', note: 'Initial generation of ' + asset.assetType, current: false },
            ].map((v, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <span className={'font-mono text-[10px] shrink-0 ' + (v.current ? 'text-green-600' : 'text-gray-500')}>{v.v}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-800 dark:text-gray-200 truncate">{v.note}</p>
                  <p className="text-[9px] text-gray-400">{v.by} · {v.date}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {v.current ? <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-green-50 dark:bg-green-500/10 text-green-600">Current</span> : <button onClick={() => handleAction('Comparing ' + v.v + ' with current')} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-50">Compare</button>}
                  {!v.current && <button onClick={() => handleAction('Restoring ' + v.v + ' of ' + asset.name)} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-50">Restore</button>}
                  <button onClick={() => handleAction('Downloading historical version ' + v.v)} className="px-2 py-1 bg-indigo-500 text-white rounded text-[9px] font-medium hover:bg-indigo-600">Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {workspaceTab === 'downloads' && asset && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Download Audit Trail — {asset.assetId}</h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Total Downloads</p><p className="text-sm font-bold text-gray-900 dark:text-white">{asset.downloads.toLocaleString()}</p></div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Last Download</p><p className="text-sm font-bold text-gray-900 dark:text-white text-[11px]">{asset.lastGenerated}</p></div>
            </div>
            <div className="space-y-2">
              {DOWNLOAD_HISTORY.filter(d => d.asset.includes(asset.name.split(' ')[0]) || d.asset.includes(asset.assetId)).map((d, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-[9px] font-bold text-indigo-600 shrink-0">{d.by.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-800 dark:text-gray-200">{d.by} · {d.role}</p>
                    <p className="text-[9px] text-gray-400">{d.format}</p>
                  </div>
                  <span className="text-[9px] text-gray-400 shrink-0">{d.date}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Download History</h4>
            <p className="text-[10px] text-gray-500 mb-3">All formats and versions of this asset.</p>
            <div className="space-y-2">
              {[{ f: 'PNG 1024 × 1024', c: '12,480 downloads', v: asset.version }, { f: 'SVG Vector', c: '4,320 downloads', v: 'v3.0' }, { f: 'Print PDF · A4', c: '2,940 downloads', v: 'v3.2' }, { f: 'CMYK PDF · Business Card', c: '1,850 downloads', v: 'v3.2' }, { f: 'WebP 512 × 512', c: '1,210 downloads', v: 'v3.1' }].map((h, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                  <div><p className="text-[11px] text-gray-800 dark:text-gray-200">{h.f}</p><p className="text-[9px] text-gray-400">Version {h.v}</p></div>
                  <span className="text-[10px] text-gray-500">{h.c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {workspaceTab === 'activity' && asset && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Asset Lifecycle — {asset.assetId}</h4>
          <div className="space-y-0">
            {[
              { icon: '+', color: 'bg-indigo-500', title: 'Asset Created', meta: asset.assetType + ' requested for ' + asset.qrId, by: 'System', date: asset.created },
              { icon: '✓', color: 'bg-blue-500', title: 'QR Design Applied', meta: asset.template + ' template applied', by: 'QR Design System', date: asset.created },
              { icon: '▤', color: 'bg-purple-500', title: 'Print Version Generated', meta: asset.format + ' · ' + asset.dimensions, by: 'Asset Generation Engine', date: asset.lastGenerated },
              { icon: '↓', color: 'bg-teal-500', title: 'Downloaded', meta: 'by ' + (DOWNLOAD_HISTORY[0] ? DOWNLOAD_HISTORY[0].by : 'Administrator'), by: DOWNLOAD_HISTORY[0] ? DOWNLOAD_HISTORY[0].role : '—', date: DOWNLOAD_HISTORY[0] ? DOWNLOAD_HISTORY[0].date : asset.lastGenerated },
              { icon: '↻', color: 'bg-green-500', title: 'Regenerated', meta: 'New version ' + asset.version, by: 'System', date: asset.lastGenerated },
              { icon: '↗', color: 'bg-amber-500', title: 'Share Link Created', meta: 'Agency access link', by: 'Emily Park', date: asset.lastGenerated },
              { icon: '▥', color: 'bg-gray-400', title: asset.status === 'Archived' ? 'Archived' : 'Awaiting Production', meta: asset.status === 'Archived' ? 'Moved to cold storage' : 'In production queue', by: 'System', date: asset.lastGenerated },
            ].map((ev, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={'w-7 h-7 rounded-full ' + ev.color + ' flex items-center justify-center text-white text-[11px] font-bold shrink-0'}>{
                    ev.icon === '+' ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> : ev.icon === '↓' ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> : <span>{ev.icon}</span>
                  }</div>
                  {i < 6 && <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700" />}
                </div>
                <div className={'pb-4 flex-1 ' + (i === 6 ? '' : '')}>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-gray-900 dark:text-white">{ev.title}</p>
                    <p className="text-[9px] text-gray-400">{ev.date}</p>
                  </div>
                  <p className="text-[10px] text-gray-500">{ev.meta}</p>
                  <p className="text-[9px] text-gray-400">Actor: {ev.by}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
