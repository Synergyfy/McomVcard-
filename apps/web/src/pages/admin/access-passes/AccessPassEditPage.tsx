import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import AccessPassForm from '../../../components/admin/access-passes/AccessPassForm'
import {
  accessPassesService,
  type AccessPass,
  type AccessPassPayload,
} from '../../../services/accessPasses'

export default function AccessPassEditPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [pass, setPass] = useState<AccessPass | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    accessPassesService
      .get(id)
      .then(setPass)
      .catch(() => navigate('/admin/access-passes'))
      .finally(() => setFetching(false))
  }, [id, navigate])

  const handleSubmit = async (payload: AccessPassPayload) => {
    if (!id) return
    setError('')
    setLoading(true)
    try {
      await accessPassesService.update(id, payload)
      navigate('/admin/access-passes')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not update the access pass. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    )
  }

  if (!pass) return null

  return (
    <div>
      <Helmet><title>Edit {pass.name} - Mobile VCard Link</title></Helmet>

      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link to="/admin/access-passes" className="transition-colors hover:text-orange-600">
          Access Passes
        </Link>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link to={`/admin/access-passes/${id}`} className="transition-colors hover:text-orange-600">
          {pass.name}
        </Link>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-gray-900 dark:text-white">Edit</span>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Edit {pass.name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Changes apply to new purchases. Existing buyers keep the access they already paid for.
        </p>
      </div>

      <AccessPassForm
        initial={pass}
        submitLabel="Save changes"
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/access-passes')}
      />
    </div>
  )
}
