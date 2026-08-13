/* ------------------------------------------------------------------ */
/*  Store Card → Friends & Family → Wallet flow.                       */
/*  Explains the relationship Henry cares about: a business issues a   */
/*  store card (or vCard), the consumer receives it, then extends     */
/*  additional cards to family & friends through their wallet.         */
/* ------------------------------------------------------------------ */

import { SectionHeading } from './SectionHeading'

const FLOW = [
  {
    title: 'Business issues a Store Card',
    desc: 'A participating business issues its store card / vCard to you — your gateway into MCOMVCard.',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    title: 'You share with Family & Friends',
    desc: 'Allocated on your membership, additional cards can be shared with family and friends — they each get their own access.',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    title: 'It all lands in your wallet',
    desc: 'Cashback, vouchers, coupons, deals, rewards and redeems — everything in one consumer wallet.',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  },
]

export default function StoreCardFlow() {
  return (
    <section className="py-16 md:py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          badge="How the value flows"
          title="Store Card → Family & Friends → Wallet"
          subtitle="One store card carries your relationship with a business, your family & friends, and everything you earn."
          tone="purple"
        />
        <div className="grid md:grid-cols-3 gap-5">
          {FLOW.map((f, i) => (
            <div key={f.title} className="relative flex flex-col items-center text-center">
              <div className="w-full h-full rounded-2xl border border-purple-100 dark:border-purple-500/20 bg-purple-50/50 dark:bg-purple-500/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-extrabold">{i + 1}</span>
                  <div className="w-11 h-11 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} /></svg>
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{f.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
              {i < FLOW.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-500/30 text-purple-500 shadow items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}