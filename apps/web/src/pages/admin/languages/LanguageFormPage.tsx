import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { adminService } from '../../../services/admin'
import InfoTooltip from '../../../components/common/InfoTooltip'
import toast from 'react-hot-toast'

export default function LanguageFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({ name: '', code: '', status: 1 })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    adminService.getLanguage(String(id)).then((data: any) => {
      setForm({
        name: data.name ?? '',
        code: data.code ?? '',
        status: data.is_active === false || data.isActive === false ? 0 : 1,
      })
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'Language name is required'
    if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(form.code.trim())) {
      next.code = 'Use an ISO language code such as en, fr or en-GB'
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        isActive: form.status === 1,
      }

      if (isEdit) {
        await adminService.updateLanguage(String(id), payload as any)
        toast.success(t('common.updated'))
      } else {
        await adminService.createLanguage(payload as any)
        toast.success(t('common.created'))
      }
      navigate('/admin/languages')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }))
  const inputClass = (key: string) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none text-sm ${
      errors[key] ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }`

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? t('admin.edit_language') : t('admin.add_language')}</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              {t('common.name')}
              <InfoTooltip text="Display name shown in the public language switcher, for example English." />
            </label>
            <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass('name')} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              {t('admin.language_code')}
              <InfoTooltip text="ISO language code stored on the user profile and used by i18n, for example en, fr or en-GB." />
            </label>
            <input type="text" value={form.code} onChange={(e) => update('code', e.target.value)} className={inputClass('code')} placeholder="en" />
            {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
          </div>
        </div>
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            {t('common.status')}
            <InfoTooltip text="Inactive languages remain stored but are hidden from public selection lists." />
          </label>
          <select value={form.status} onChange={(e) => update('status', Number(e.target.value))} className={inputClass('status')}>
            <option value={1}>{t('common.active')}</option>
            <option value={0}>{t('common.inactive')}</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
            {saving ? t('common.saving') : t('common.save')}
          </button>
          <button type="button" onClick={() => navigate('/admin/languages')} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
