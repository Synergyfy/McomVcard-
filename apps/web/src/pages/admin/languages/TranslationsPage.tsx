import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { adminService } from '../../../services/admin'
import type { TranslationEntry } from '../../../types'
import toast from 'react-hot-toast'

export default function TranslationsPage() {
  const { t } = useTranslation()
  const { id: langId } = useParams()
  const navigate = useNavigate()
  const [entries, setEntries] = useState<TranslationEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [langName, setLangName] = useState('')

  const load = async () => {
    if (!langId) return
    setLoading(true)
    try {
      const [lang, translations] = await Promise.all([
        adminService.getLanguage(Number(langId)),
        adminService.getTranslations(Number(langId)),
      ])
      setLangName(lang.name)
      setEntries(translations)
    } catch {
      toast.error(t('common.error_loading'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [langId])

  const updateValue = async (entryId: number, value: string) => {
    setSaving(entryId)
    try {
      await adminService.updateTranslation(Number(langId), entryId, { value } as any)
      toast.success(t('common.updated'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setSaving(null)
    }
  }

  const grouped = entries.reduce((acc, entry) => {
    if (!acc[entry.group]) acc[entry.group] = []
    acc[entry.group].push(entry)
    return acc
  }, {} as Record<string, TranslationEntry[]>)

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{langName} {t('admin.translations')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('admin.manage_translations_desc')}</p>
        </div>
        <button onClick={() => navigate('/admin/languages')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
          {t('common.back')}
        </button>
      </div>
      <div className="space-y-6">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-700 text-sm uppercase">{group}</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((entry) => (
                <div key={entry.id} className="px-6 py-3 flex items-start gap-4">
                  <div className="w-1/3 pt-1">
                    <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{entry.key}</code>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      defaultValue={entry.value}
                      onBlur={(e) => {
                        if (e.target.value !== entry.value) updateValue(entry.id, e.target.value)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    />
                  </div>
                  {saving === entry.id && <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mt-2" />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}