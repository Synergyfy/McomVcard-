import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@mcom.com')
  const [password, setPassword] = useState('password')
  const [remember, setRemember] = useState(false)
  const [tfaCode, setTfaCode] = useState('')
  const [showTfa, setShowTfa] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    localStorage.setItem('auth_token', 'mock_admin_token_abc123')
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: 1,
        name: 'Admin',
        email: 'admin@mcom.com',
        role: 'admin',
        is_admin: true,
        avatar: null,
      })
    )
    setLoading(false)
    navigate('/admin')
  }

  return (
    <div className="admin-app min-h-screen flex">
      <Helmet>
        <title>Admin Login - MCOM VCard Social Bio</title>
      </Helmet>

      {/* Left - Brand Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full p-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-500/30">
              M
            </div>
            <div>
              <span className="text-white font-bold text-xl tracking-tight">MCOM</span>
              <span className="text-orange-400 font-bold text-xl tracking-tight"> VCard</span>
            </div>
          </div>

          {/* Hero text */}
          <div className="space-y-6 max-w-lg">
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Your Digital Identity
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-300">
                Platform
              </span>
            </h1>
            <p className="text-gray-400 text-base leading-relaxed">
              Manage businesses, consumers, templates, rewards, campaigns, and analytics — all from one powerful dashboard.
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {[
                { title: 'Smart Cards', desc: 'Digital business cards with NFC & QR', icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1' },
                { title: 'Wallet & Rewards', desc: 'Loyalty points, cashback & campaigns', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                { title: 'NFC Integration', desc: 'Tap-to-connect hardware ecosystem', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
                { title: 'Analytics', desc: 'Real-time insights & engagement data', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{f.title}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} MCOM VCard Social Bio. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right - Login Panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-8">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <span className="text-gray-900 dark:text-white font-bold text-lg">MCOM VCard</span>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Login</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to manage your platform</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mcom.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  required
                />
              </div>

              {/* 2FA */}
              {showTfa && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Two-Factor Code</label>
                  <input
                    type="text"
                    value={tfaCode}
                    onChange={(e) => setTfaCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  />
                </div>
              )}

              {/* Remember me & 2FA toggle */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500/50 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowTfa(!showTfa)}
                  className={`text-sm font-medium transition-colors ${showTfa ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  {showTfa ? '− 2FA' : '+ 2FA'}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in to dashboard'
                )}
              </button>

              {/* Forgot password */}
              <div className="text-center">
                <Link to="/forgot-password" className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </form>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
            Secure admin access. Unauthorized use is prohibited.
          </p>
        </div>
      </div>
    </div>
  )
}
