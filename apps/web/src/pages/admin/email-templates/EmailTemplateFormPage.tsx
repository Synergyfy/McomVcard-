import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { adminService } from '../../../services/admin'
import toast from 'react-hot-toast'

export default function EmailTemplateFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({ subject: '', body: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    adminService.getEmailTemplate(String(id)).then((data) => {
      setForm({ subject: data.subject, body: data.body })
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminService.updateEmailTemplate(String(id), form)
      toast.success(t('common.updated'))
      navigate('/admin/email-templates')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.edit_email_template')}</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.email_subject')}</label>
          <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.email_body')}</label>
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={15} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-mono" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">{saving ? t('common.saving') : t('common.save')}</button>
          <button type="button" onClick={() => navigate('/admin/email-templates')} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">{t('common.cancel')}</button>
        </div>
      </form>
    </div>
  )
}