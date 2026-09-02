import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { adminService } from '../../../services/admin'
import toast from 'react-hot-toast'

export default function CountryFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({ name: '', code: '', phone_code: '', currency_code: '', status: 1 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    adminService.getCountry(String(id)).then((data) => {
      setForm({ name: data.name, code: data.code, phone_code: data.phone_code, currency_code: data.currency_code || '', status: data.status })
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        await adminService.updateCountry(String(id), form)
        toast.success(t('common.updated'))
      } else {
        await adminService.createCountry(form)
        toast.success(t('common.created'))
      }
      navigate('/admin/countries')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? t('admin.edit_country') : t('admin.add_country')}</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.name')}</label>
            <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.country_code')}</label>
            <input type="text" value={form.code} onChange={(e) => update('code', e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.phone_code')}</label>
            <input type="text" value={form.phone_code} onChange={(e) => update('phone_code', e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.currency_code')}</label>
            <input type="text" value={form.currency_code} onChange={(e) => update('currency_code', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.status')}</label>
            <select value={form.status} onChange={(e) => update('status', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm">
              <option value={1}>{t('common.active')}</option>
              <option value={0}>{t('common.inactive')}</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">{saving ? t('common.saving') : t('common.save')}</button>
          <button type="button" onClick={() => navigate('/admin/countries')} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">{t('common.cancel')}</button>
        </div>
      </form>
    </div>
  )
}