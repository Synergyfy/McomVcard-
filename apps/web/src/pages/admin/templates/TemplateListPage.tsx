import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import StatsCard from '../../../components/admin/StatsCard'
import { adminService } from '../../../services/admin'
import type { AdminTemplate } from '../../../types'

const CATEGORIES = [
  'Restaurant', 'Café', 'Barber', 'Beauty Salon', 'Accountant', 'Estate Agent',
  'Solicitor', 'Consultant', 'Coach', 'Retail Store', 'Service Provider', 'Healthcare',
  'Fitness', 'Hotel', 'Events', 'Photography',
]

const TABS = [
  { key: 'business' as const, label: 'Business Templates', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { key: 'consumer' as const, label: 'Consumer Templates', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]

export default function TemplateListPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<AdminTemplate[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [preview, setPreview] = useState<AdminTemplate | null>(null)
  const [tab, setTab] = useState<'business' | 'consumer'>('business')

  useEffect(() => {
    let cancelled = false
    adminService.getTemplates()
      .then((res) => {
        if (!cancelled) {
          const items = (res.data ?? []).map((t: any) => ({
            ...t,
            status: t.status ?? 'published',
            is_business: t.is_business ?? true,
            is_consumer: t.is_consumer ?? false,
            usage: t.usage ?? 0,
            created: t.created ?? '',
            font_family: t.font_family ?? '',
            primary_color: t.primary_color ?? '#FF5C00',
            secondary_color: t.secondary_color ?? '#000000',
            button_style: t.button_style ?? 'rounded',
            logo_position: t.logo_position ?? 'left',
            bg_style: t.bg_style ?? 'solid',
            sections: t.sections ?? {},
          } as AdminTemplate))
          setData(items)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const tabData = data.filter((t) => tab === 'business' ? t.is_business : t.is_consumer)
  const filtered = tabData.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'All' || t.category === categoryFilter
    return matchSearch && matchCat
  })

  const toggleStatus = (id: string) => {
    setData((prev) => prev.map((t) => String(t.id) === id ? { ...t, status: t.status === 'published' ? 'archived' as const : 'published' as const } : t))
    const t = data.find((x) => String(x.id) === id)
    toast.success(`"${t?.name}" ${t?.status === 'published' ? 'archived' : 'published'}`)
  }

  const cloneTemplate = (t: AdminTemplate) => {
    navigate(`/admin/templates/create?clone=${t.id}`)
  }

  const openPreview = (t: AdminTemplate) => {
    setPreview(t)
  }

  return (
    <div className="space-y-6">
      <Helmet><title>Templates - MCOM VCard Social Bio</title></Helmet>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Templates</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Industry-specific card templates — {data.length} templates</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-1 inline-flex gap-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setSearch(''); setCategoryFilter('All') }} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            tab === t.key ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={t.icon} /></svg>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder={`Search ${tab} templates...`} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500" />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50">
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <Link
          to="/admin/templates/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create {tab === 'business' ? 'Business' : 'Consumer'} Template
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title={`Total ${tab === 'business' ? 'Business' : 'Consumer'}`} value={tabData.length} color="blue" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>} />
        <StatsCard title="Published" value={tabData.filter((t) => t.status === 'published').length} color="green" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatsCard title="Categories" value={new Set(tabData.map((t) => t.category)).size} color="purple" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>} />
        <StatsCard title="Total Usage" value={tabData.reduce((s, t) => s + t.usage, 0)} color="orange" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((t) => (
          <div key={t.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 group cursor-pointer" onClick={() => openPreview(t)}>
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
              <img src={t.template_url} alt={t.name} className="w-full transition-transform duration-[8000ms] ease-linear group-hover:translate-y-[-52%]" onError={(e) => { const target = e.target as HTMLImageElement; target.style.display = 'none' }} />
              <span className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 backdrop-blur-sm">
                {t.usage} used
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.category}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  t.status === 'published' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' :
                  t.status === 'draft' ? 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300' :
                  'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
                }`}>{t.status}</span>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50 dark:border-gray-700">
                <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/templates/${t.id}/edit`) }} className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">Edit</button>
                <button onClick={(e) => { e.stopPropagation(); cloneTemplate(t) }} className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 font-medium">Clone</button>
                <button onClick={(e) => { e.stopPropagation(); openPreview(t) }} className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 font-medium">Preview</button>
                <button onClick={(e) => { e.stopPropagation(); toggleStatus(t.id) }} className={`text-xs font-medium ml-auto ${t.status === 'published' ? 'text-red-500 hover:text-red-600' : 'text-green-500 hover:text-green-600'}`}>{t.status === 'published' ? 'Archive' : 'Publish'}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setPreview(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <img src={preview.template_url} alt={preview.name} className="w-full rounded-t-2xl" onError={(e) => { const target = e.target as HTMLImageElement; target.style.display = 'none' }} />
              <button onClick={() => setPreview(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{preview.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{preview.category}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  preview.status === 'published' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' :
                  preview.status === 'draft' ? 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300' :
                  'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
                }`}>{preview.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-400 dark:text-gray-500">Font:</span> <span className="text-gray-900 dark:text-white font-medium">{preview.font_family}</span></div>
                <div><span className="text-gray-400 dark:text-gray-500">Button Style:</span> <span className="text-gray-900 dark:text-white font-medium">{preview.button_style}</span></div>
                <div><span className="text-gray-400 dark:text-gray-500">Logo Position:</span> <span className="text-gray-900 dark:text-white font-medium">{preview.logo_position}</span></div>
                <div><span className="text-gray-400 dark:text-gray-500">Background:</span> <span className="text-gray-900 dark:text-white font-medium">{preview.bg_style}</span></div>
                <div><span className="text-gray-400 dark:text-gray-500">Usage:</span> <span className="text-gray-900 dark:text-white font-medium">{preview.usage}</span></div>
                <div><span className="text-gray-400 dark:text-gray-500">Color:</span> <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: preview.primary_color }} /> <span className="text-gray-900 dark:text-white font-medium">{preview.primary_color}</span></span></div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(preview.sections).filter(([, v]) => v).map(([k]) => (
                  <span key={k} className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-medium">{k}</span>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setPreview(null); navigate(`/admin/templates/${preview.id}/edit`) }} className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors">Edit Template</button>
                <button onClick={() => { setPreview(null); navigate(`/admin/templates/create?clone=${preview.id}`) }} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Clone</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
