import { Helmet } from 'react-helmet-async'

export default function MarketplacePage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Helmet><title>Marketplace Connections - MCOM VCard Social Bio</title></Helmet>
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512a9.025 9.025 0 015.488 5.488z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Marketplace Connections</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-2">This connects to <strong className="text-gray-700 dark:text-gray-300">MCOM Ecosystem Platforms</strong>.</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">Integration coming soon. You will be able to connect MCOMMall, Rewards Hub, Affiliates, Audit, MCOMSpin, Expo Center, and Hotspot WiFi once ready.</p>
      </div>
    </div>
  )
}
