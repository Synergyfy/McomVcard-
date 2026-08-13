/* ------------------------------------------------------------------ */
/*  Consumer journey — how a consumer enters MCOMVCard.                */
/* ------------------------------------------------------------------ */

import { Link } from 'react-router-dom'

const STEPS = [
  { step: '01', title: 'Connect with a business', desc: 'Find a participating business that issues MCOMVCard — like a barbershop rewarding its customers.', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { step: '02', title: 'Receive your card / vCard', desc: 'The business issues you a store card or vCard access link or invitation.', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { step: '03', title: 'Create or sign in to MCOM', desc: 'Create your MCOM account or sign in — MCOM Central Authentication.', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { step: '04', title: 'Explore your MCOMVCard', desc: 'Your card lands in your wallet with cashback, rewards and family & friends ready to use.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
]

export default function ConsumerJourney() {
  return (
    <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="inline-block px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Getting your MCOMVCard</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Consumers never buy membership — your card comes from a participating business, then you sign in with your MCOM account.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <div key={s.step} className="relative">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-extrabold text-purple-200 dark:text-purple-500/30">{s.step}</span>
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} /></svg>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{s.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 text-gray-300 dark:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <Link
            to="/find-a-business"
            className="inline-flex items-center px-8 py-3 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200 transition-all active:scale-[0.98]"
          >
            Find a participating business
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </section>
  )
}