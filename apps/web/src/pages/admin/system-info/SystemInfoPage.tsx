import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../../services/admin'
import toast from 'react-hot-toast'

export default function SystemInfoPage() {
  const { t } = useTranslation()
  const [info, setInfo] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await adminService.getSystemInfo()
      setInfo(data)
    } catch {
      toast.error(t('common.error_loading'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleClearCache = async () => {
    if (!confirm(t('admin.confirm_clear_cache'))) return
    setClearing(true)
    try {
      await adminService.clearCache()
      toast.success(t('admin.cache_cleared'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setClearing(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.nav.system_info')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('admin.manage_system_info_desc')}</p>
        </div>
        <button onClick={handleClearCache} disabled={clearing} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 text-sm font-medium">
          {clearing ? t('admin.clearing') : t('admin.clear_cache')}
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <tbody className="divide-y divide-gray-100">
            {Object.entries(info).map(([key, value]) => (
              <tr key={key}>
                <td className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">{key}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}