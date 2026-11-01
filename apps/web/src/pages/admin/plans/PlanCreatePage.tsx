import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import PlanForm from '../../../components/admin/plans/PlanForm'
import { plansService, type PlanPayload } from '../../../services/plans'

export default function PlanCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (payload: PlanPayload) => {
    setError('')
    setLoading(true)
    try {
      await plansService.create(payload)
      navigate('/admin/plans')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not create the plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Helmet><title>{t('admin.add_plan')} - Mobile VCard Link</title></Helmet>

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/admin/plans" className="hover:text-orange-600 transition-colors">{t('admin.nav.plans')}</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 dark:text-white font-medium">Create Plan</span>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('admin.add_plan')}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Give the plan any name, describe it, then configure pricing and entitlements for Standard, Pro and Pro+.
        </p>
      </div>

      <PlanForm
        submitLabel="Create plan"
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/plans')}
      />
    </div>
  )
}
