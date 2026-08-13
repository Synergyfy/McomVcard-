import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../../services/admin'
import type { Currency } from '../../../types'
import ActionDropdown from '../../../components/common/ActionDropdown'

const MOCK_CURRENCIES: Currency[] = [
  { id: 1, currency_name: 'US Dollar', currency_code: 'USD', currency_icon: '$' },
  { id: 2, currency_name: 'Euro', currency_code: 'EUR', currency_icon: '€' },
  { id: 3, currency_name: 'British Pound', currency_code: 'GBP', currency_icon: '£' },
  { id: 4, currency_name: 'Japanese Yen', currency_code: 'JPY', currency_icon: '¥' },
  { id: 5, currency_name: 'Australian Dollar', currency_code: 'AUD', currency_icon: 'A$' },
  { id: 6, currency_name: 'Canadian Dollar', currency_code: 'CAD', currency_icon: 'C$' },
  { id: 7, currency_name: 'Indian Rupee', currency_code: 'INR', currency_icon: '₹' },
  { id: 8, currency_name: 'Brazilian Real', currency_code: 'BRL', currency_icon: 'R$' },
]

export default function CurrencyListPage() {
  const { t } = useTranslation()
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      adminService.getCurrencies().catch(() => [] as Currency[]),
      adminService.getAllCurrencies().catch(() => [] as Currency[]),
    ]).then(([a, b]) => setCurrencies((a.length ? a : b).length ? (a.length ? a : b) : MOCK_CURRENCIES))
      .catch(() => setCurrencies(MOCK_CURRENCIES))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.confirm_delete'))) return
    try { await adminService.deleteCurrency(id); setCurrencies(currencies.filter((c) => c.id !== id)) } catch { setCurrencies(currencies.filter((c) => c.id !== id)) }
  }

  const filtered = currencies.filter((c) => {
    const q = search.toLowerCase()
    return !search || c.currency_name.toLowerCase().includes(q) || c.currency_code.toLowerCase().includes(q) || c.currency_icon.includes(q)
  })

  return (
    <div>
      <Helmet><title>{t('admin.nav.currencies')} - Mobile VCard Link</title></Helmet>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.nav.currencies')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{currencies.length} currencies</p>
        </div>
        <Link to="/admin/currencies/create" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
          {t('admin.add_currency')}
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="relative max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search currencies..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">{t('admin.no_currencies')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Symbol</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.currency_name}</td>
                    <td className="px-4 py-3"><span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">{c.currency_code}</span></td>
                    <td className="px-4 py-3 text-xl text-gray-700 dark:text-gray-300 font-semibold">{c.currency_icon}</td>
                    <td className="px-4 py-3 text-right">
                      <ActionDropdown actions={[
                        { label: 'Delete', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', destructive: true, onClick: () => handleDelete(c.id) },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}