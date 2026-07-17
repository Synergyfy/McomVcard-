import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { consumerService } from '../../services/consumer'

export default function ConsumerReferralsPage() {
  const [referrals, setReferrals] = useState<Array<{ name: string; email: string; joined: string; reward: string }>>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    consumerService.getReferrals().then(setReferrals).finally(() => setLoading(false))
  }, [])

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSent(true)
    setEmail('')
    setTimeout(() => setSent(false), 3000)
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <Helmet><title>Referrals - Consumer - MCOM VCard</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Refer & Earn</h1>

      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <div>
              <p className="text-lg font-bold">Invite Friends, Get Rewarded</p>
              <p className="text-sm text-orange-100">Earn 200 points for every friend who joins</p>
            </div>
          </div>

          <form onSubmit={handleInvite} className="flex gap-2 mt-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Friend's email address" required
              className="flex-1 px-4 py-2.5 rounded-lg text-sm text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50" />
            <button type="submit" className="px-5 py-2.5 bg-white text-orange-600 text-sm font-semibold rounded-lg hover:bg-orange-50 transition-colors shrink-0">
              Send Invite
            </button>
          </form>
          {sent && <p className="text-sm text-green-200 mt-2">Invitation sent successfully!</p>}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Your Referrals ({referrals.length})</h2>
          <span className="text-xs text-gray-500">{referrals.filter((r) => r.reward).length} rewards earned</span>
        </div>

        {referrals.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            No referrals yet. Invite your friends!
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-sm font-semibold text-orange-600">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Joined {r.joined}</p>
                  <p className="text-xs font-medium text-orange-600">{r.reward}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Share Your Referral Link</h2>
        <div className="flex gap-2">
          <input type="text" readOnly value="https://mcomvcard.link/ref/emma123" className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400" />
          <button onClick={() => navigator.clipboard?.writeText('https://mcomvcard.link/ref/emma123')} className="px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
            Copy
          </button>
        </div>
      </div>
    </div>
  )
}
