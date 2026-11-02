import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../../services/admin'
import InputField from '../../../components/auth/InputField'

export default function CurrencyCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ currency_name: '', currency_code: '', currency_icon: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')

    const next: Record<string, string> = {}
    if (!form.currency_name.trim()) next.currency_name = 'Currency name is required'
    if (!/^[A-Za-z]{3}$/.test(form.currency_code.trim())) next.currency_code = 'Use a 3-letter ISO code, e.g. USD'
    if (!form.currency_icon.trim()) next.currency_icon = 'A currency symbol is required'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    try {
      await adminService.createCurrency({
        code: form.currency_code.trim().toUpperCase(),
        name: form.currency_name.trim(),
        symbol: form.currency_icon.trim(),
      } as any)
      navigate('/admin/currencies')
    } catch (err: any) {
      setServerError(err?.response?.data?.message || t('admin.error_occurred'))
      if (err?.response?.data?.errors) {
        const fe: Record<string, string> = {}
        for (const [k, msgs] of Object.entries(err.response.data.errors)) fe[k] = (msgs as string[])[0]
        setErrors(fe)
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-lg">
      <Helmet><title>{t('admin.add_currency')} - Mobile VCard Link</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.add_currency')}</h1>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {serverError && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">{serverError}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label={t('admin.name')} tooltip="The human-readable currency name shown in dropdowns and invoices." value={form.currency_name} error={errors.currency_name} onChange={(e) => setForm({ ...form, currency_name: e.target.value })} />
          <InputField label={t('admin.code')} tooltip="The three-letter ISO 4217 code used by prices and payment APIs (for example USD or GBP)." value={form.currency_code} error={errors.currency_code} onChange={(e) => setForm({ ...form, currency_code: e.target.value.toUpperCase() })} placeholder="USD" maxLength={3} />
          <InputField label={t('admin.symbol')} tooltip="The short symbol displayed next to amounts, for example $ or £." value={form.currency_icon} error={errors.currency_icon} onChange={(e) => setForm({ ...form, currency_icon: e.target.value })} placeholder="$" maxLength={5} />
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">{loading ? t('common.loading') : t('admin.save')}</button>
            <button type="button" onClick={() => navigate('/admin/currencies')} className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">{t('admin.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
