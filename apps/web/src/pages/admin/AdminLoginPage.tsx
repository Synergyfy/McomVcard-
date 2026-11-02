import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import InfoTooltip from '../../components/common/InfoTooltip'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, isAdminAuthenticated, isLoading } = useAdminAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const redirect = (() => {
    const target = searchParams.get('redirect')
    if (!target || !target.startsWith('/admin') || target.startsWith('/admin/login')) return '/admin'
    return target
  })()

  useEffect(() => {
    if (!isLoading && isAdminAuthenticated) navigate(redirect, { replace: true })
  }, [isAdminAuthenticated, isLoading, navigate, redirect])

  const validate = () => {
    const next: { email?: string; password?: string } = {}
    if (!email.trim()) next.email = 'Email address is required'
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Enter a valid email address'
    if (!password) next.password = 'Password is required'
    else if (password.length < 8) next.password = 'Password must be at least 8 characters'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return

    setLoading(true)
    try {
      await login({ email: email.trim().toLowerCase(), password })
      navigate(redirect, { replace: true })
    } catch (err: any) {
      const status = err?.response?.status
      const message = err?.response?.data?.message
      if (status === 401) setError('Invalid email or password, or this account is not an administrator.')
      else if (status === 429) setError('Too many sign-in attempts. Please wait a minute and try again.')
      else setError(typeof message === 'string' ? message : 'Unable to sign in right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-app min-h-screen flex">
      <Helmet><title>Admin Login - MCOM VCard Social Bio</title></Helmet>

      <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 flex flex-col justify-between w-full p-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-500/30">M</div>
            <div><span className="text-white font-bold text-xl tracking-tight">MCOM</span><span className="text-orange-400 font-bold text-xl tracking-tight"> VCard</span></div>
          </div>
          <div className="space-y-6 max-w-lg">
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">Your Digital Identity<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-300">Platform</span></h1>
            <p className="text-gray-400 text-base leading-relaxed">Manage businesses, consumers, templates, rewards, campaigns, and analytics — all from one powerful dashboard.</p>
            <div className="grid grid-cols-2 gap-3 pt-4">
              {[
                { title: 'Smart Cards', desc: 'Digital business cards with NFC & QR', icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1' },
                { title: 'Wallet & Rewards', desc: 'Loyalty points, cashback & campaigns', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                { title: 'NFC Integration', desc: 'Tap-to-connect hardware ecosystem', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
                { title: 'Analytics', desc: 'Real-time insights & engagement data', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} /></svg>
                  </div>
                  <div><div className="text-white text-sm font-semibold">{f.title}</div><div className="text-gray-500 text-xs mt-0.5">{f.desc}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-gray-600 text-xs">&copy; {new Date().getFullYear()} MCOM VCard Social Bio. All rights reserved.</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-8">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">M</div>
            <span className="text-gray-900 dark:text-white font-bold text-lg">MCOM VCard</span>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Login</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Restricted access to the platform dashboard</p>
            </div>

            {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="admin-email" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email address<InfoTooltip text="Use the email address of an administrator account. Regular user accounts cannot sign in here." />
                </label>
                <input id="admin-email" name="email" type="email" autoComplete="username" value={email}
                  onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined })) }}
                  placeholder="admin@centralhubsolution.com" aria-invalid={Boolean(fieldErrors.email)}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 transition-all ${fieldErrors.email ? 'border-red-400 focus:ring-red-400/40' : 'border-gray-200 dark:border-gray-700 focus:ring-orange-500/50 focus:border-orange-500'}`} required />
                {fieldErrors.email && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</p>}
              </div>
              <div>
                <label htmlFor="admin-password" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password<InfoTooltip text="Your admin account password. It is sent securely to the API and never stored in the browser." />
                </label>
                <div className="relative">
                  <input id="admin-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password}
                    onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined })) }}
                    placeholder="Enter your password" aria-invalid={Boolean(fieldErrors.password)}
                    className={`w-full px-4 py-2.5 pr-12 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 transition-all ${fieldErrors.password ? 'border-red-400 focus:ring-red-400/40' : 'border-gray-200 dark:border-gray-700 focus:ring-orange-500/50 focus:border-orange-500'}`} required />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-orange-600 dark:text-gray-400">{showPassword ? 'Hide' : 'Show'}</button>
                </div>
                {fieldErrors.password && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{fieldErrors.password}</p>}
              </div>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500/50" />
                <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">Keep me signed in<InfoTooltip text="Uses a secure HttpOnly admin session cookie so you can return without re-entering your password." /></span>
              </label>
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? 'Signing in...' : 'Sign in to dashboard'}
              </button>
              <div className="text-center"><Link to="/forgot-password" className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500">Forgot your password?</Link></div>
            </form>
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">Secure admin access. Unauthorized use is prohibited.</p>
        </div>
      </div>
    </div>
  )
}
