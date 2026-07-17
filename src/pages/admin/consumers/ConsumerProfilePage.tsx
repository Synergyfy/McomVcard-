import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { mockConsumers } from '../../../services/mockData'

const TABS = ['Overview', 'Wallet', 'Rewards', 'Cards', 'Referrals', 'Activity']

export default function ConsumerProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const c = mockConsumers.find(x => x.id === Number(id)) || mockConsumers[0]
  const [tab, setTab] = useState('Overview')

  const statusColor = (s: string) => s === 'active' ? 'text-green-600 dark:text-green-400' : s === 'suspended' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
  const statusBg = (s: string) => s === 'active' ? 'bg-green-500' : s === 'suspended' ? 'bg-red-500' : 'bg-gray-400'

  return (
    <div className="space-y-6">
      <Helmet><title>{c.name} - Consumer Profile - MCOM VCard Social Bio</title></Helmet>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg">{c.name.charAt(0)}</div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{c.name}</h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(c.status)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusBg(c.status)}`} />{c.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{c.email} · Joined {c.joined} · {c.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => toast.success('Edit mode opened')} className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 shadow-lg shadow-orange-500/25">
              <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>Edit
            </button>
            <Link to="/admin/consumers" className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">Back</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { label: 'Wallet Balance', value: `$${c.wallet.balance.toLocaleString()}`, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-500/10' },
            { label: 'Points', value: c.wallet.points.toLocaleString(), color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { label: 'Rewards Earned', value: c.stats.rewards, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10' },
            { label: 'Referrals', value: c.stats.referrals, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-500/10' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{s.label}</p>
              <p className={`text-xl font-bold ${s.color} mt-1`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-700 px-4">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>{t}</button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview */}
          {tab === 'Overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Contact Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Email', value: c.email }, { label: 'Phone', value: c.phone },
                    { label: 'Location', value: c.location }, { label: 'Member Since', value: c.joined },
                    { label: 'Cards Saved', value: c.stats.cards }, { label: 'Total Scans', value: c.stats.scans },
                  ].map((f) => (
                    <div key={f.label}><p className="text-xs text-gray-400 dark:text-gray-500">{f.label}</p><p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{f.value}</p></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: c.status === 'suspended' ? 'Reactivate Account' : 'Suspend Account', color: c.status === 'suspended' ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10' : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10', action: () => toast.success(`Account ${c.status === 'suspended' ? 'reactivated' : 'suspended'}`) },
                    { label: 'Issue Reward', color: 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10', action: () => toast.success('Reward issued') },
                    { label: 'Add Gift Card', color: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10', action: () => toast.success('Gift card added') },
                    { label: 'Add Coupon', color: 'text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10', action: () => toast.success('Coupon added') },
                    { label: 'Add Voucher', color: 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10', action: () => toast.success('Voucher added') },
                    { label: 'Reset Wallet', color: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10', action: () => toast.success('Wallet reset') },
                  ].map((a) => (
                    <button key={a.label} onClick={a.action} className={`text-left px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700 text-sm font-medium ${a.color} transition-colors`}>{a.label}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Wallet */}
          {tab === 'Wallet' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Cash Balance', value: `$${c.wallet.balance.toLocaleString()}`, color: 'text-green-600', change: '+5%' },
                    { label: 'Points', value: c.wallet.points.toLocaleString(), color: 'text-blue-600', change: '+12%' },
                    { label: 'Cashback', value: `$${c.wallet.cashback.toLocaleString()}`, color: 'text-orange-600', change: '+3%' },
                    { label: 'Gift Cards', value: c.wallet.giftCards, color: 'text-purple-600', change: c.wallet.giftCards > 0 ? 'Active' : 'None' },
                    { label: 'Coupons', value: c.wallet.coupons, color: 'text-teal-600', change: c.wallet.coupons > 0 ? 'Active' : 'None' },
                    { label: 'Vouchers', value: c.wallet.vouchers, color: 'text-pink-600', change: c.wallet.vouchers > 0 ? 'Active' : 'None' },
                  ].map((w) => (
                    <div key={w.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{w.label}</p>
                      <p className={`text-lg font-bold ${w.color} mt-1`}>{w.value}</p>
                      <p className="text-xs text-green-500 mt-0.5">{w.change}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Wallet Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Add Funds', 'Transfer', 'Freeze', 'Expire'].map(a => (
                      <button key={a} onClick={() => toast.success(`${a} - processed`)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{a}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Portfolio Mix</h3>
                {[
                  { label: 'Cash', value: c.wallet.balance, pct: 40, color: 'bg-green-500' },
                  { label: 'Points', value: c.wallet.points, pct: 45, color: 'bg-blue-500' },
                  { label: 'Cashback', value: c.wallet.cashback, pct: 10, color: 'bg-orange-500' },
                  { label: 'Coupons/Vouchers', value: c.wallet.coupons + c.wallet.vouchers, pct: 5, color: 'bg-purple-500' },
                ].map((a) => (
                  <div key={a.label} className="mb-3">
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">{a.label}</span><span className="font-medium text-gray-700 dark:text-gray-300">{a.pct}%</span></div>
                    <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-600"><div className={`h-1.5 rounded-full ${a.color}`} style={{ width: `${a.pct}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rewards */}
          {tab === 'Rewards' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Reward History ({c.stats.rewards})</h3>
                <button onClick={() => toast.success('New reward issued')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600">+ Issue Reward</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="text-xs text-gray-500 border-b border-gray-100 dark:border-gray-700"><th className="text-left px-3 py-2 font-medium">Reward</th><th className="text-left px-3 py-2 font-medium">Points</th><th className="text-left px-3 py-2 font-medium hidden sm:table-cell">Date</th><th className="text-left px-3 py-2 font-medium">Status</th></tr></thead>
                  <tbody>
                    {c.rewardHistory.map((r) => (
                      <tr key={r.id} className="border-b border-gray-50 dark:border-gray-700/50 text-sm">
                        <td className="px-3 py-2.5 text-gray-900 dark:text-white font-medium">{r.reward}</td>
                        <td className="px-3 py-2.5 text-gray-500">{r.points.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-gray-500 hidden sm:table-cell">{r.date}</td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${r.status === 'redeemed' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' : r.status === 'available' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300'}`}>{r.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cards */}
          {tab === 'Cards' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Saved Cards ({c.stats.cards})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {c.savedCards.map((card) => (
                  <div key={card.id} className="rounded-xl border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/cards/' + card.id)}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">{card.business.charAt(0)}</div>
                      <div><p className="text-sm font-medium text-gray-900 dark:text-white">{card.name}</p><p className="text-xs text-gray-500">{card.business}</p></div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">{card.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Referrals */}
          {tab === 'Referrals' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Referrals ({c.stats.referrals})</h3>
                <span className="text-xs text-gray-500">Earned {(c.stats.referrals * 200).toLocaleString()} pts from referrals</span>
              </div>
              {c.referrals.length > 0 ? (
                <div className="space-y-2">
                  {c.referrals.map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-semibold">{r.name.charAt(0)}</div>
                        <div><p className="text-sm font-medium text-gray-900 dark:text-white">{r.name}</p><p className="text-xs text-gray-500">{r.email} · Joined {r.joined}</p></div>
                      </div>
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">{r.reward}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400"><svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg><p className="text-sm font-medium">No referrals yet</p></div>
              )}
            </div>
          )}

          {/* Activity */}
          {tab === 'Activity' && (
            <div className="space-y-0 max-w-lg">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Activity Timeline</h3>
              {c.recentActivity.map((a, i) => {
                const colors: Record<string, string> = { reward: 'bg-purple-400', earn: 'bg-green-400', referral: 'bg-orange-400', card: 'bg-blue-400', nfc: 'bg-teal-400', booking: 'bg-indigo-400', milestone: 'bg-yellow-400', alert: 'bg-red-400', profile: 'bg-gray-400' }
                return (
                  <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                    <div className={`w-2 h-2 rounded-full ${colors[a.type] || 'bg-green-400'} mt-1.5 shrink-0`} />
                    <div><p className="text-sm text-gray-700 dark:text-gray-300">{a.action}</p><p className="text-xs text-gray-400 mt-0.5">{a.time}</p></div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}