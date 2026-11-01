import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import PlanForm from '../../../components/admin/plans/PlanForm'
import { plansService, type Plan, type PlanPayload } from '../../../services/plans'

export default function PlanEditPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()

  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    plansService
      .get(id)
      .then(setPlan)
      .catch(() => navigate('/admin/plans'))
      .finally(() => setFetching(false))
  }, [id, navigate])

  const handleSubmit = async (payload: PlanPayload) => {
    if (!id) return
    setError('')
    setLoading(true)
    try {
      await plansService.update(id, payload)
      navigate('/admin/plans')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not update the plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!plan) return null

  return (
    <div>
      <Helmet><title>{t('admin.edit_plan')}: {plan.name} - Mobile VCard Link</title></Helmet>

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/admin/plans" className="hover:text-orange-600 transition-colors">{t('admin.nav.plans')}</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <Link to={`/admin/plans/${id}`} className="hover:text-orange-600 transition-colors">{plan.name}</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 dark:text-white font-medium">Edit</span>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('admin.edit_plan')}: {plan.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update the plan description, shared features, limits and the price/entitlements of each variant.
        </p>
      </div>

      <PlanForm
        initial={plan}
        submitLabel="Save changes"
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/plans')}
      />
    </div>
  )
}
