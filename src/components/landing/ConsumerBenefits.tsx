/* ------------------------------------------------------------------ */
/*  Consumer-only benefits grid.                                       */
/*  Mirrors the consumer wallet: Gift cards, Vouchers, Coupons,        */
/*  Deals, Cashback, Rewards, Redeemable — plus My Wishlist.           */
/* ------------------------------------------------------------------ */

import { SectionHeading } from './SectionHeading'

const BENEFITS = [
  {
    title: 'Cashback',
    desc: 'Earn cashback that lands straight in your wallet from participating businesses.',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
  },
  {
    title: 'Friends & Family',
    desc: 'Share your allocated cards with family and friends so they can benefit too.',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    title: 'Vouchers & coupons',
    desc: 'Collect vouchers and coupon codes issued by the businesses you connect with.',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  },
  {
    title: 'Deals & offers',
    desc: 'See nearby deals from businesses — right where your card lives.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    title: 'Rewards & gift cards',
    desc: 'Keep rewards, points and gift-card value on one card in your wallet.',
    icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7',
  },
  {
    title: 'Wishlist',
    desc: 'Save cards you want so the businesses you love stay a tap away.',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  },
]

export default function ConsumerBenefits() {
  return (
    <section className="py-16 md:py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          badge="Your MCOMVCard, your wallet"
          title="Everything you earn lives on your card"
          subtitle="No subscription to enter. Your card is issued by a participating business, and the value you collect lands in your wallet."
          tone="purple"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-lg hover:shadow-purple-100 dark:hover:shadow-purple-900/20 hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={b.icon} /></svg>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{b.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}