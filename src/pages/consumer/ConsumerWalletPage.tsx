import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { consumerService } from '../../services/consumer'

export default function ConsumerWalletPage() {
  const [wallet, setWallet] = useState<{ balance: number; points: number; cashback: number; giftCards: number; coupons: number; vouchers: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    consumerService.getWallet().then(setWallet).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  if (!wallet) return null

  const items = [
    { label: 'Balance', value: `£${wallet.balance.toLocaleString()}`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Points', value: wallet.points.toLocaleString(), icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Cashback', value: `£${wallet.cashback.toFixed(2)}`, icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Gift Cards', value: wallet.giftCards.toString(), icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Coupons', value: wallet.coupons.toString(), icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/20' },
    { label: 'Vouchers', value: wallet.vouchers.toString(), icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  ]

  return (
    <div>
      <Helmet><title>Wallet - Consumer - MCOM VCard</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Wallet</h1>

      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <p className="text-orange-100 text-sm font-medium">Available Balance</p>
          <p className="text-4xl font-extrabold mt-1">£{wallet.balance.toLocaleString()}</p>
          <p className="text-orange-100 text-sm mt-2">{wallet.points.toLocaleString()} points · £{wallet.cashback.toFixed(2)} cashback</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${item.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
              </div>
              <span className="text-sm text-gray-500">{item.label}</span>
            </div>
            <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mt-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {['Add Funds', 'Withdraw', 'Transfer Points', 'Redeem Rewards'].map((a) => (
            <button key={a} className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
