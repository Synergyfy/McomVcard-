import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { adminService } from '../../../services/admin'
import type { NewsletterCampaign } from '../../../types'
import toast from 'react-hot-toast'
import ActionDropdown from '../../../components/common/ActionDropdown'

const MOCK_CAMPAIGNS: NewsletterCampaign[] = [
  { id: 1, subject: 'Introducing New Pro Templates', content: 'Check out our latest template designs...', sent_count: 1234, status: 'sent', created_at: '2025-07-01' },
  { id: 2, subject: 'Summer Sale – 50% Off Pro Plans', content: 'Limited time offer...', sent_count: 0, status: 'draft', created_at: '2025-07-10' },
  { id: 3, subject: 'Monthly Newsletter – July', content: 'Here are this month updates...', sent_count: 1156, status: 'sent', created_at: '2025-06-28' },
  { id: 4, subject: 'New Feature: Analytics Dashboard', content: 'Track your vCard performance...', sent_count: 982, status: 'sent', created_at: '2025-06-15' },
  { id: 5, subject: 'Webinar Invitation: Digital Networking', content: 'Join us for a free webinar...', sent_count: 0, status: 'draft', created_at: '2025-07-12' },
  { id: 6, subject: 'Holiday Greetings from Mobile VCard Link', content: 'Wishing you a wonderful holiday...', sent_count: 2100, status: 'sent', created_at: '2025-12-20' },
]

export default function NewsletterPage() {
  const { t } = useTranslation()
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ subject: '', content: '' })
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    adminService.getNewsletterCampaigns()
      .then((res) => setCampaigns(res.data && res.data.length ? res.data : MOCK_CAMPAIGNS))
      .catch(() => setCampaigns(MOCK_CAMPAIGNS))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      await adminService.createNewsletterCampaign(form)
      toast.success('Campaign created')
      setForm({ subject: '', content: '' }); setShowForm(false)
      adminService.getNewsletterCampaigns().then((res) => setCampaigns(res.data)).catch(() => {})
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error')
    } finally { setSending(false) }
  }

  const handleSend = async (id: string) => {
    if (!confirm('Send this newsletter now?')) return
    try { await adminService.sendNewsletter(String(id)); toast.success('Newsletter sent!'); adminService.getNewsletterCampaigns().then((res) => setCampaigns(res.data)).catch(() => {}) }
    catch { toast.error('Error sending') }
  }

  const filtered = campaigns.filter((c) => {
    const q = search.toLowerCase()
    return !search || c.subject.toLowerCase().includes(q)
  })

  const sentCount = campaigns.filter((c) => c.status === 'sent').length
  const totalSent = campaigns.reduce((s, c) => s + c.sent_count, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.nav.newsletter')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{campaigns.length} campaigns</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Campaign
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Sent Campaigns</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{sentCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Sent</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalSent.toLocaleString()}</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
            <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={sending} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">{sending ? 'Saving...' : 'Save as Draft'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="relative max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search campaigns..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No campaigns found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sent</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.subject}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{c.sent_count.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'sent' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.status === 'draft' && (
                        <ActionDropdown actions={[
                          { label: 'Send Now', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8', onClick: () => handleSend(c.id) },
                        ]} />
                      )}
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