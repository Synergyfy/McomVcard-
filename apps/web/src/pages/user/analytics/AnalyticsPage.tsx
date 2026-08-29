import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { userService } from '../../../services/user'
import StatsCard from '../../../components/admin/StatsCard'
import type { AnalyticsData } from '../../../types'

export default function AnalyticsPage() {
  const { t } = useTranslation()
  const [vcards, setVcards] = useState<{ id: string; name: string }[]>([])
  const [selectedVcard, setSelectedVcard] = useState<string>('')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    userService.getVcards().then((v) => setVcards(v.map((x: any) => ({ id: String(x.id), name: x.name })))).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedVcard) return
    setLoading(true)
    userService.getAnalytics(selectedVcard).then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [selectedVcard])

  return (
    <div>
      <Helmet><title>{t('user.analytics')} - Mobile VCard Link</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('user.analytics')}</h1>

      <div className="mb-6 max-w-xs">
        <select value={selectedVcard} onChange={(e) => setSelectedVcard(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
          <option value="">{t('user.select_vcard')}</option>
          {vcards.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatsCard title={t('user.stats.views_today')} value={data.views_today} color="blue"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
            />
            <StatsCard title={t('user.stats.views_week')} value={data.views_this_week} color="green"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            />
            <StatsCard title={t('user.stats.views_month')} value={data.views_this_month} color="purple"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            />
            <StatsCard title={t('user.stats.contacts_saved')} value={data.total_contacts} color="orange"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('user.stats.device_breakdown')}</h2>
              {data.device_breakdown?.length ? (
                <div className="space-y-3">
                  {data.device_breakdown.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{d.device}</span>
                      <span className="text-gray-900 font-medium">{d.count}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-500">{t('user.no_data')}</p>}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('user.stats.location_breakdown')}</h2>
              {data.location_breakdown?.length ? (
                <div className="space-y-3">
                  {data.location_breakdown.map((l, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{l.country}</span>
                      <span className="text-gray-900 font-medium">{l.count}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-500">{t('user.no_data')}</p>}
            </div>
          </div>
        </>
      ) : selectedVcard ? (
        <p className="text-sm text-gray-500">{t('user.select_vcard_to_view')}</p>
      ) : null}
    </div>
  )
}
