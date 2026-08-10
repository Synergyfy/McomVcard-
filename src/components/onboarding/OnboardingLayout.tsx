import { Link } from 'react-router-dom'
import Logo from '../common/Logo'
import type { ReactNode } from 'react'

interface Step {
  id: number
  label: string
}

const STEPS: Step[] = [
  { id: 1, label: 'Business identity' },
  { id: 2, label: 'Choose Membership' },
  { id: 3, label: 'Confirmation' },
]

interface OnboardingLayoutProps {
  step: number
  title: string
  subtitle?: string
  children: ReactNode
}

export default function OnboardingLayout({ step, title, subtitle, children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-block">
            <Logo />
          </Link>
          <Link
            to="/login"
            className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Already have an account? Sign In
          </Link>
        </div>

        {/* Stepper */}
        <ol className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
          {STEPS.map((s, i) => {
            const done = s.id < step
            const current = s.id === step
            return (
              <li key={s.id} className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      current
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                        : done
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {done ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      s.id
                    )}
                  </span>
                  <span
                    className={`text-xs font-semibold ${current ? 'text-blue-600' : done ? 'text-emerald-600' : 'text-gray-400'}`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && <div className="hidden sm:block w-10 h-px bg-gray-300" />}
              </li>
            )
          })}
        </ol>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-gray-500 max-w-2xl mx-auto">{subtitle}</p>}
        </div>

        {children}
      </div>
    </div>
  )
}
