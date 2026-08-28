import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { adminService } from '../../../services/admin'
import type { Plan } from '../../../types'
import toast from 'react-hot-toast'

export default function CouponFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    code: '', discount_type: 'percentage' as 'percentage' | 'fixed', discount_value: 0,
    max_uses: 0, plan_id: 0, min_amount: 0, expires_at: '', status: 1,
  })
  const [plans, setPlans] = useState<Plan[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminService.getPlans().then((res) => setPlans(res.data))
    if (!id) return
    adminService.getCouponCode(String(id)).then((data) => {
      setForm({
        code: data.code, discount_type: data.discount_type, discount_value: data.discount_value,
        max_uses: data.max_uses, plan_id: data.plan_id || 0, min_amount: data.min_amount || 0,
        expires_at: data.expires_at ? data.expires_at.split('T')[0] : '', status: data.status,
      })
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, plan_id: form.plan_id || undefined, min_amount: form.min_amount || undefined }
      if (isEdit) {
        await adminService.updateCouponCode(String(id), payload)
        toast.success(t('common.updated'))
      } else {
        await adminService.createCouponCode(payload)
        toast.success(t('common.created'))
      }
      navigate('/admin/coupon-codes')
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
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? t('admin.edit_coupon') : t('admin.add_coupon')}</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.coupon_code')}</label>
          <input type="text" value={form.code} onChange={(e) => update('code', e.target.value.toUpperCase())} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.discount_type')}</label>
            <select value={form.discount_type} onChange={(e) => update('discount_type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm">
              <option value="percentage">%</option>
              <option value="fixed">{t('admin.fixed')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.discount_value')}</label>
            <input type="number" value={form.discount_value} onChange={(e) => update('discount_value', Number(e.target.value))} required min={0} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.max_uses')}</label>
            <input type="number" value={form.max_uses} onChange={(e) => update('max_uses', Number(e.target.value))} min={0} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.min_amount')}</label>
            <input type="number" value={form.min_amount} onChange={(e) => update('min_amount', Number(e.target.value))} min={0} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.plan')}</label>
            <select value={form.plan_id} onChange={(e) => update('plan_id', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm">
              <option value={0}>{t('admin.all_plans')}</option>
              {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.expires_at')}</label>
            <input type="date" value={form.expires_at} onChange={(e) => update('expires_at', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.status')}</label>
          <select value={form.status} onChange={(e) => update('status', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm">
            <option value={1}>{t('common.active')}</option>
            <option value={0}>{t('common.inactive')}</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">{saving ? t('common.saving') : t('common.save')}</button>
          <button type="button" onClick={() => navigate('/admin/coupon-codes')} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">{t('common.cancel')}</button>
        </div>
      </form>
    </div>
  )
}