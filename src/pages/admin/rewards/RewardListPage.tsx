import { Helmet } from 'react-helmet-async'

export default function RewardListPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Helmet><title>Rewards - MCOM VCard Social Bio</title></Helmet>
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Rewards</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-2">This feature is powered by <strong className="text-gray-700 dark:text-gray-300">MCOM Reward Platform</strong>.</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">Integration coming soon. You will be able to manage coupons, cashback, gift cards, vouchers, points, and tickets once connected.</p>
      </div>
    </div>
  )
}
