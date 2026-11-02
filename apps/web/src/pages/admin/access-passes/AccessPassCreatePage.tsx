import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import AccessPassForm from '../../../components/admin/access-passes/AccessPassForm'
import { accessPassesService, type AccessPassPayload } from '../../../services/accessPasses'

export default function AccessPassCreatePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (payload: AccessPassPayload) => {
    setError('')
    setLoading(true)
    try {
      await accessPassesService.create(payload)
      navigate('/admin/access-passes')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not create the access pass. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Helmet><title>Create Access Pass - Mobile VCard Link</title></Helmet>

      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link to="/admin/access-passes" className="transition-colors hover:text-orange-600">
          Access Passes
        </Link>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-gray-900 dark:text-white">Create Access Pass</span>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create access pass</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set one price and one duration, then choose exactly which features and limits the pass unlocks.
        </p>
      </div>

      <AccessPassForm
        submitLabel="Create access pass"
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/access-passes')}
      />
    </div>
  )
}
