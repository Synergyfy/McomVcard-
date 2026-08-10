import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import AuthLayout from '../../components/auth/AuthLayout'
import ConsumerPathNote from '../../components/auth/ConsumerPathNote'
import { inviteQuery } from '../../utils/inviteContext'

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const ctx = inviteQuery(searchParams.get('card'), searchParams.get('business'))

  return (
    <AuthLayout title={t('auth.register_title')} subtitle={t('auth.register_subtitle')}>
      <Helmet>
        <title>{t('auth.register_title')} - Mobile VCard Link</title>
      </Helmet>

      {/* ── MCOM Solutions handoff ── */}
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </span>
          <div>
            <h2 className="text-base font-bold">Continue with MCOM Solutions</h2>
            <p className="text-xs text-blue-100 mt-1 leading-relaxed">
              Authentication for your business is handled centrally at MCOM Solutions — one secure
              login, verified identity and billing that flows into your MCOMVCard membership.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/onboarding/mcom-solutions${ctx}`)}
          className="mt-4 w-full py-2.5 rounded-xl bg-white text-blue-700 text-sm font-bold hover:bg-blue-50 transition-all shadow-md"
        >
          Continue to MCOM Solutions
        </button>
        <p className="text-[10px] text-blue-200 mt-2 text-center">
          We'll take you to MCOM Solutions to verify your business identity.
        </p>
      </div>

      <ConsumerPathNote />

      <p className="text-center text-sm text-gray-500 mt-6">
        {t('auth.has_account')}{' '}
        <Link to={`/login${ctx}`} className="text-blue-600 hover:text-blue-700 font-medium">
          {t('auth.login')}
        </Link>
      </p>
    </AuthLayout>
  )
}
