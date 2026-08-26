import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Logo from '../../components/common/Logo'
import { useAuth } from '../../contexts/AuthContext'
import { consumerService } from '../../services/consumer'
import {
  loadConsumerSetup,
  saveConsumerSetup,
  type ConsumerSetupProfile,
  type ConsumerSetupState,
} from '../../services/consumerSetupStore'

type Phase = 'welcome' | 'checking' | 'recognized' | 'profile' | 'business' | 'card' | 'membership' | 'entitlements' | 'done'

const STEP_LABELS = ['Profile', 'Business', 'Card', 'Membership', 'Entitlements']

export default function ConsumerSetupPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated } = useAuth()

  const invitedCard = searchParams.get('card') || ''
  const invitedBusiness = searchParams.get('business') || ''

  const [phase, setPhase] = useState<Phase>('welcome')
  const [existingName, setExistingName] = useState('')
  const [existingMembership, setExistingMembership] = useState('')
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.contact || '', location: 'London, UK' })
  const [business, setBusiness] = useState(invitedBusiness || '')
  const [card] = useState(invitedCard || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const state = loadConsumerSetup()
    saveConsumerSetup({ ...state, status: 'in-progress' })
  }, [])

  const stepIndex = ['profile', 'business', 'card', 'membership', 'entitlements'].indexOf(phase)

  const determineConsumer = async () => {
    setPhase('checking')
    if (!isAuthenticated || !user?.email) {
      navigate(`/login?card=${encodeURIComponent(invitedCard)}&business=${encodeURIComponent(invitedBusiness)}`, { replace: true })
      return
    }
    const existing = await consumerService.getProfileByEmail(user.email)
    if (existing) {
      setExistingName(existing.name)
      setExistingMembership(existing.membership)
      const state = loadConsumerSetup()
      saveConsumerSetup({
        ...state,
        status: 'completed',
        profile: {
          name: existing.name,
          phone: existing.phone,
          location: existing.location,
          business: existing.primaryIssuingBusiness,
          cardId: existing.cardId,
        },
        completedAt: new Date().toISOString(),
      })
      setPhase('recognized')
    } else {
      setPhase('profile')
    }
  }

  const completeSetup = async () => {
    setSaving(true)
    setError('')
    try {
      const profile = await consumerService.createProfile({
        name: form.name,
        email: user?.email || '',
        phone: form.phone,
        location: form.location,
      })
      if (business || invitedCard) {
        await consumerService.associateCard(card || profile.cardId, business)
      }
      const state = loadConsumerSetup()
      const profileData: ConsumerSetupProfile = {
        name: form.name,
        phone: form.phone,
        location: form.location,
        business: business || '',
        cardId: card || profile.cardId,
      }
      const completed: ConsumerSetupState = {
        ...state,
        status: 'completed',
        profile: profileData,
        steps: { profile: true, business: true, card: true, membership: true, entitlements: true },
        completedAt: new Date().toISOString(),
      }
      saveConsumerSetup(completed)
      setPhase('done')
    } catch {
      setError("We couldn't finish your setup right now. Please try again.")
      setSaving(false)
    }
  }

  const goHome = () => navigate('/c/dashboard', { replace: true })

  const stepDots = (current: number) => (
    <div className="flex items-center gap-2 mb-8">
      {STEP_LABELS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i < current ? 'bg-accent-500 text-white' : i === current ? 'bg-accent-500 text-white ring-4 ring-accent-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}
          >
            {i + 1}
          </span>
          <span className={`text-xs font-medium hidden sm:block ${i === current ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{label}</span>
          {i < STEP_LABELS.length - 1 && <div className={`w-6 h-px ${i < current ? 'bg-accent-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-10 transition-colors">
      <Helmet>
        <title>Consumer Setup - MCOM VCard</title>
      </Helmet>

      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <Logo />
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl p-6 sm:p-8">
          {phase === 'welcome' && (
            <div className="text-center">
              <span className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-5">Welcome to MCOMVCard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                You've been invited to a digital card{invitedBusiness ? ` by ${invitedBusiness}` : ''}. Let's set up your account in a couple of minutes.
              </p>
              {invitedBusiness && (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-accent-50 dark:bg-accent-500/10 px-4 py-3 text-sm font-semibold text-accent-700 dark:text-accent-300">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  You've been invited by {invitedBusiness}
                </div>
              )}
              <button
                onClick={determineConsumer}
                className="mt-6 w-full py-3.5 rounded-2xl bg-accent-500 text-white text-sm font-bold shadow-lg shadow-accent-500/25 hover:bg-accent-600 transition-colors active:scale-[0.98]"
              >
                Get Started
              </button>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">No payment or subscription required.</p>
            </div>
          )}

          {phase === 'checking' && (
            <div className="text-center py-10">
              <div className="w-10 h-10 mx-auto border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Checking your account…</p>
            </div>
          )}

          {phase === 'recognized' && (
            <div className="text-center">
              <span className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-5">Welcome back, {existingName.split(' ')[0]}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                We found your existing MCOM account with a {existingMembership} membership. We've loaded your cards, membership, wallet and family — nothing was recreated.
              </p>
              <button
                onClick={goHome}
                className="mt-6 w-full py-3.5 rounded-2xl bg-accent-500 text-white text-sm font-bold shadow-lg shadow-accent-500/25 hover:bg-accent-600 transition-colors active:scale-[0.98]"
              >
                Take me to my Dashboard
              </button>
            </div>
          )}

          {['profile', 'business', 'card', 'membership', 'entitlements'].includes(phase) && (
            <>
              {stepDots(stepIndex)}

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                  {error}
                </div>
              )}

              {phase === 'profile' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tell us about you</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">These details appear on your card.</p>
                  <div className="mt-5 space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Jane Smith"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+44 7700 900123"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                      <input
                        type="text"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="London, UK"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setPhase('business')}
                    disabled={!form.name.trim()}
                    className="mt-6 w-full py-3.5 rounded-2xl bg-accent-500 text-white text-sm font-bold hover:bg-accent-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
                  >
                    Continue
                  </button>
                </div>
              )}

              {phase === 'business' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your business</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">The business that issued your card keeps it connected to your account.</p>
                  <div className="mt-5 space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Issuing Business</label>
                      <input
                        type="text"
                        value={business}
                        onChange={(e) => setBusiness(e.target.value)}
                        placeholder="GreenLeaf Coffee"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      Your business relationship is kept — your card, rewards and offers from this business stay linked to your account.
                    </div>
                  </div>
                  <button
                    onClick={() => setPhase('card')}
                    disabled={!business.trim()}
                    className="mt-6 w-full py-3.5 rounded-2xl bg-accent-500 text-white text-sm font-bold hover:bg-accent-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
                  >
                    Continue
                  </button>
                </div>
              )}

              {phase === 'card' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your card</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">The card you were invited with is being added to your account.</p>
                  <div className="mt-5">
                    <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 p-5 text-center">
                      <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-50 dark:bg-accent-500/10">
                        <svg className="w-7 h-7 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </span>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-3">{card || 'Your MCOM card'}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {invitedBusiness ? `Issued by ${invitedBusiness}` : 'Digital card issued to your account'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPhase('membership')}
                    className="mt-6 w-full py-3.5 rounded-2xl bg-accent-500 text-white text-sm font-bold hover:bg-accent-600 transition-colors active:scale-[0.98]"
                  >
                    Continue
                  </button>
                </div>
              )}

              {phase === 'membership' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your membership</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Loading the membership issued to you.</p>
                  <div className="mt-5 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 text-white p-5">
                    <p className="text-[11px] uppercase tracking-wider text-accent-100 font-bold">Membership</p>
                    <p className="text-xl font-extrabold mt-1">Bronze</p>
                    <p className="text-xs text-accent-100 mt-1">Active · loaded to your account</p>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {['Digital card & QR code', 'Points and rewards', 'Nearby offers'].map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setPhase('entitlements')}
                    className="mt-6 w-full py-3.5 rounded-2xl bg-accent-500 text-white text-sm font-bold hover:bg-accent-600 transition-colors active:scale-[0.98]"
                  >
                    Continue
                  </button>
                </div>
              )}

              {phase === 'entitlements' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your entitlements</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your family and friend allocations are ready to use.</p>
                  <div className="mt-5 space-y-3">
                    {[
                      { label: 'Family allocations', value: '2 available' },
                      { label: 'Friend allocations', value: '2 available' },
                      { label: 'Additional cards', value: 'Ready' },
                      { label: 'E-card', value: 'Ready' },
                    ].map((e) => (
                      <div key={e.label} className="flex items-center justify-between rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{e.label}</p>
                        <span className="text-xs font-semibold text-accent-500">{e.value}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={completeSetup}
                    disabled={saving}
                    className="mt-6 w-full py-3.5 rounded-2xl bg-accent-500 text-white text-sm font-bold hover:bg-accent-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
                  >
                    {saving ? 'Completing setup…' : 'Complete Setup'}
                  </button>
                </div>
              )}
            </>
          )}

          {phase === 'done' && (
            <div className="text-center">
              <span className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-5">You're all set!</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Your profile is complete, your card{invitedBusiness ? ` from ${invitedBusiness}` : ''} is connected and your membership is active.
              </p>
              <button
                onClick={goHome}
                className="mt-6 w-full py-3.5 rounded-2xl bg-accent-500 text-white text-sm font-bold shadow-lg shadow-accent-500/25 hover:bg-accent-600 transition-colors active:scale-[0.98]"
              >
                Go to my Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
