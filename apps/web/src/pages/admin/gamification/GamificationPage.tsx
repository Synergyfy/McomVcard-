import { Helmet } from 'react-helmet-async'

export default function GamificationPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Helmet><title>Gamification - MCOM VCard Social Bio</title></Helmet>
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Gamification</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-2">This feature is powered by <strong className="text-gray-700 dark:text-gray-300">MCOM Game Platform</strong>.</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">Integration coming soon. You will be able to manage Ball Drop, Spin Wheel, Scratch Cards, and Mystery Box games once connected.</p>
      </div>
    </div>
  )
}
