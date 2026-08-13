import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../../../services/admin'
import ActionDropdown from '../../../components/common/ActionDropdown'

const MOCK_TEMPLATES: any[] = [
  { id: 1, name: 'Welcome Email', subject: 'Welcome to Mobile VCard Link!', variables: '{user_name},{email}' },
  { id: 2, name: 'Password Reset', subject: 'Reset Your Password', variables: '{user_name},{reset_link}' },
  { id: 3, name: 'Subscription Confirmation', subject: 'Subscription Confirmed - {plan_name}', variables: '{user_name},{plan_name},{start_date},{end_date}' },
  { id: 4, name: 'Payment Receipt', subject: 'Payment Receipt - {transaction_id}', variables: '{user_name},{amount},{transaction_id},{plan_name}' },
  { id: 5, name: 'Account Verification', subject: 'Verify Your Email Address', variables: '{user_name},{verification_link}' },
  { id: 6, name: 'Subscription Expiring', subject: 'Your Subscription is Expiring Soon', variables: '{user_name},{plan_name},{end_date}' },
  { id: 7, name: 'Withdrawal Processed', subject: 'Withdrawal Request Processed', variables: '{user_name},{amount},{status}' },
  { id: 8, name: 'Affiliate Commission', subject: 'You Earned a Commission!', variables: '{user_name},{amount},{referred_user}' },
]

export default function EmailTemplateListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    adminService.getEmailTemplates()
      .then((res) => setTemplates(res.data && res.data.length ? res.data : MOCK_TEMPLATES))
      .catch(() => setTemplates(MOCK_TEMPLATES))
      .finally(() => setLoading(false))
  }, [])

  const filtered = templates.filter((tpl) => {
    const q = search.toLowerCase()
    return !search || tpl.name.toLowerCase().includes(q) || tpl.subject.toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.nav.email_templates')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{templates.length} templates</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="relative max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No email templates found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Variables</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{tpl.name}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{tpl.subject}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-purple-600 dark:text-purple-400 font-mono">{tpl.variables}</code>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActionDropdown actions={[
                        { label: 'Edit', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', onClick: () => navigate(`/admin/email-templates/${tpl.id}/edit`) },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}