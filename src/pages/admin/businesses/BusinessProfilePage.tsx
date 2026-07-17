import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { mockBusinesses } from '../../../services/mockData'

const TABS = ['Overview', 'Cards', 'Wallet', 'Campaigns', 'QR Codes', 'NFC Orders', 'Activity']

export default function BusinessProfilePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const biz = mockBusinesses.find(b => b.id === Number(id)) || mockBusinesses[0]
  const [tab, setTab] = useState('Overview')

  return (
    <div className="space-y-6">
      <Helmet><title>{biz.name} - Business Profile - MCOM VCard Social Bio</title></Helmet>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg">
              {biz.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{biz.name}</h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  biz.status === 'verified' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' :
                  biz.status === 'pending' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300' :
                  'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${biz.status === 'verified' ? 'bg-green-500' : biz.status === 'pending' ? 'bg-orange-500' : 'bg-red-500'}`} />
                  {biz.status}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">{biz.plan}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{biz.industry} · Joined {biz.joined} · {biz.owner}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => toast.success('Edit mode opened')} className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25">
              <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Edit
            </button>
            <Link to="/admin/businesses" className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Back
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { label: 'Total Cards', value: biz.cards, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { label: 'Total Scans', value: biz.scans.toLocaleString(), color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-500/10' },
            { label: 'Campaigns', value: biz.campaigns, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10' },
            { label: 'Wallet Balance', value: `£${biz.wallet.balance.toLocaleString()}`, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-500/10' },
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
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}>{t}</button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview */}
          {tab === 'Overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">About</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{biz.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Email', value: biz.email },
                    { label: 'Phone', value: biz.phone },
                    { label: 'Website', value: biz.website },
                    { label: 'Address', value: biz.address },
                    { label: 'Industry', value: biz.industry },
                    { label: 'Employees', value: biz.employees },
                    { label: 'Owner', value: biz.owner },
                    { label: 'Plan', value: biz.plan },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{f.label}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>
                {/* Connected Platforms */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Connected Platforms</h3>
                  <div className="space-y-2">
                    {biz.platforms.map((p) => (
                      <div key={p.name} className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{p.name}</span>
                        {p.connected ? (
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Connected
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Not connected
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Team */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Team Members</h3>
                  <div className="space-y-2">
                    {biz.team.map((m) => (
                      <div key={m.email} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-semibold">{m.name.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{m.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{m.role} · {m.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: biz.status === 'verified' ? 'Suspend Business' : 'Verify Business', color: biz.status === 'verified' ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10', action: () => toast.success(`Business ${biz.status === 'verified' ? 'suspended' : 'verified'}`) },
                    { label: 'Reset Account', color: 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10', action: () => toast.success('Account reset email sent') },
                    { label: 'Generate Cards', color: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10', action: () => toast.success('Card generation started') },
                    { label: 'Generate QR Code', color: 'text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10', action: () => toast.success('QR code generated') },
                    { label: 'Open Wallet', color: 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10', action: () => setTab('Wallet') },
                    { label: 'Send Email', color: 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10', action: () => toast.success('Email sent to ' + biz.email) },
                  ].map((a) => (
                    <button key={a.label} onClick={a.action} className={`text-left px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700 text-sm font-medium ${a.color} transition-colors`}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Cards */}
          {tab === 'Cards' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Business Cards ({biz.cards})</h3>
                <button onClick={() => toast.success('Card creation started')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600">+ Create Card</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: Math.min(biz.cards, 6) }, (_, i) => (
                  <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/admin/cards/${i + 1}`)}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">{biz.name.charAt(0)}{i + 1}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{biz.name} Card {i + 1}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{biz.industry} · {(Math.random() * 1000).toFixed(0)} scans</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 text-[10px] font-medium">Active</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[10px] font-medium">NFC Ready</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wallet */}
          {tab === 'Wallet' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Balance', value: `£${biz.wallet.balance.toLocaleString()}`, color: 'text-green-600', change: '+12%', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
                    { label: 'Cashback', value: `£${biz.wallet.cashback.toLocaleString()}`, color: 'text-purple-600', change: '+5%', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
                  ].map((w) => (
                    <div key={w.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{w.label}</p>
                        <span className="text-xs font-medium text-green-500">{w.change}</span>
                      </div>
                      <p className={`text-xl font-bold ${w.color}`}>{w.value}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Transactions</h3>
                  <div className="space-y-2">
                    {[
                      { type: 'Card Scan Revenue', amount: '+£45.00', date: '2 hours ago', status: 'completed' },
                      { type: 'Subscription Charge', amount: '-£19.99', date: '3 days ago', status: 'completed' },
                      { type: 'NFC Order', amount: '-£120.00', date: '1 week ago', status: 'completed' },
                      { type: 'Campaign Payment', amount: '+£250.00', date: '1 week ago', status: 'pending' },
                      { type: 'Cashback Reward', amount: '+£15.00', date: '2 weeks ago', status: 'completed' },
                    ].map((tx, i) => (
                      <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.type}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{tx.date}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{tx.amount}</p>
                          <span className={`text-[10px] font-medium ${tx.status === 'completed' ? 'text-green-500' : 'text-orange-500'}`}>{tx.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Wallet Actions</h3>
                <div className="space-y-2">
                  {['Add Funds', 'Withdraw', 'Transfer', 'View Statements'].map((a) => (
                    <button key={a} onClick={() => toast.success(`${a} - Feature coming soon`)} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-colors">{a}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Campaigns */}
          {tab === 'Campaigns' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Campaigns ({biz.campaigns})</h3>
                <button onClick={() => toast.success('New campaign created')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600">+ New Campaign</button>
              </div>
              {biz.campaigns > 0 ? (
                <div className="space-y-3">
                  {['Summer Special', 'New Customer Welcome', 'Loyalty Rewards', 'Holiday Promo'].slice(0, biz.campaigns).map((name, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-shadow">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Reach: {(Math.random() * 10000).toFixed(0)} · Conversions: {(Math.random() * 500).toFixed(0)} · Spend: £{(Math.random() * 1000).toFixed(2)}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300">Active</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                  <p className="text-sm font-medium">No campaigns yet</p>
                </div>
              )}
            </div>
          )}

          {/* QR Codes */}
          {tab === 'QR Codes' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">QR Codes</h3>
                <button onClick={() => toast.success('QR code generated')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600">+ Generate QR</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Main Card', 'Menu Link', 'Promotion'].map((label, i) => (
                  <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center">
                    <div className="w-24 h-24 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{(Math.random() * 500).toFixed(0)} scans</p>
                    <button onClick={() => toast.success('QR downloaded')} className="mt-2 px-3 py-1 rounded-lg text-xs font-medium text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors">Download</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NFC Orders */}
          {tab === 'NFC Orders' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">NFC Orders ({biz.nfcCards > 0 ? Math.ceil(biz.nfcCards / 50) : 0})</h3>
                <button onClick={() => toast.success('NFC order placed')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600">+ Order NFC</button>
              </div>
              {biz.nfcCards > 0 ? (
                <div className="space-y-3">
                  {Array.from({ length: Math.ceil(biz.nfcCards / 50) }, (_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Batch #{i + 1} — 50 cards</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Assigned {i === 0 ? '3 hours ago' : '2 weeks ago'} · 48 activated</p>
                        </div>
                      </div>
                      <button onClick={() => toast.success('Viewing NFC batch')} className="px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">View</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
                  <p className="text-sm font-medium">No NFC orders yet</p>
                </div>
              )}
            </div>
          )}

          {/* Activity */}
          {tab === 'Activity' && (
            <div className="space-y-0 max-w-lg">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Activity Timeline</h3>
              {[
                { action: 'Card scanned by customer at GreenLeaf Coffee', time: '12 min ago', type: 'scan' },
                { action: 'Campaign "Summer Special" reached 1,000 views', time: '1 hour ago', type: 'campaign' },
                { action: 'New NFC batch assigned (50 cards)', time: '3 hours ago', type: 'nfc' },
                { action: 'Booking confirmed — Table for 4', time: '5 hours ago', type: 'booking' },
                { action: 'Subscription renewed — Business plan', time: '2 days ago', type: 'subscription' },
                { action: 'New team member added — Mike Barista', time: '3 days ago', type: 'team' },
                { action: 'Wallet deposit — £500.00', time: '4 days ago', type: 'wallet' },
                { action: 'QR code generated for Menu Link', time: '1 week ago', type: 'qr' },
                { action: 'Business profile updated', time: '1 week ago', type: 'profile' },
              ].map((a, i) => {
                const colors: Record<string, string> = { scan: 'bg-blue-400', campaign: 'bg-purple-400', nfc: 'bg-green-400', booking: 'bg-orange-400', subscription: 'bg-indigo-400', team: 'bg-pink-400', wallet: 'bg-yellow-400', qr: 'bg-teal-400', profile: 'bg-gray-400' }
                return (
                  <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                    <div className={`w-2 h-2 rounded-full ${colors[a.type] || 'bg-orange-400'} mt-1.5 shrink-0`} />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{a.action}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{a.time}</p>
                    </div>
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