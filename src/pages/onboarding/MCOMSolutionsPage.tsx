import { useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Logo from '../../components/common/Logo'
import { mockBusinessProfile } from '../../services/businessStore'
import { inviteQuery } from '../../utils/inviteContext'

/* ------------------------------------------------------------------ */
/*  MCOM Solutions coming-soon page. Shown after "Continue to MCOM     */
/*  Solutions" on /register. Reuses the existing business identity     */
/*  (mockBusinessProfile) so onboarding returns with that info intact. */
/* ------------------------------------------------------------------ */

export default function MCOMSolutionsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const ctx = inviteQuery(searchParams.get('card'), searchParams.get('business'))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <Helmet>
        <title>MCOM Solutions - Coming Soon</title>
      </Helmet>
      <div className="w-full max-w-lg text-center">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/60 border border-gray-100 p-10">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center mb-6">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Coming soon
          </span>

          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">MCOM Solutions</h1>
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">
            Authentication and business identity are being migrated to MCOM Solutions. Once live,
            your business — <span className="font-semibold text-gray-700">{mockBusinessProfile.name}</span>{' '}
            — will sign in there with the same verified profile you already have on MCOMVCard.
          </p>

          <div className="mt-6 rounded-xl bg-gray-50 border border-gray-100 p-4 text-left">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Your existing business info</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">{mockBusinessProfile.name}</p>
                <p className="text-xs text-gray-500">
                  {mockBusinessProfile.category} · {mockBusinessProfile.sector}
                </p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold">
                {mockBusinessProfile.verificationStatus}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate(`/onboarding/choose-membership${ctx}`)}
            className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-orange-200"
          >
            Return to Mcomvcard
          </button>
          <p className="mt-3 text-[11px] text-gray-400">
            We'll carry your existing business information straight into membership selection.
          </p>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Need help? <span className="text-blue-600 font-medium">Contact us</span>
        </p>
      </div>
    </div>
  )
}
