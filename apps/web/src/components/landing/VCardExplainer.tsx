/* ------------------------------------------------------------------ */
/*  General explainer — what the MCOM VCard is and does.               */
/*  Neutral overview used on the main landing (/), bridging both       */
/*  audiences without favouring either story.                          */
/* ------------------------------------------------------------------ */

import { SectionHeading } from './SectionHeading'

const ITEMS = [
  {
    title: 'Digital card & vCard',
    desc: 'A tap, scan or link hands over everything — contacts, links, booking and rewards.',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  },
  {
    title: 'One account, many cards',
    desc: 'Businesses publish; consumers collect. Both live on the same MCOM account.',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  {
    title: 'Rewards that move',
    desc: 'Cashback, coupons, gift cards and rewards sit on the card and travel with it.',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
  },
  {
    title: 'Family & friends',
    desc: 'Members can share additional cards with family and friends — value they can pass on.',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    title: 'Digital first, physical when you want',
    desc: 'Start digital. Move up to physical for a card that feels like it&apos;s built to last.',
    icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  },
  {
    title: 'Connected to businesses you trust',
    desc: 'Every consumer card is issued by a participating business — access never requires buying in.',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  },
]

export default function VCardExplainer() {
  return (
    <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          badge="What is the MCOM VCard?"
          title="One card. More Than a Card."
          subtitle="The VCard is a doorway — for businesses to be found, and for customers to carry everything in one place."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ITEMS.map((it) => (
            <div key={it.title} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={it.icon} /></svg>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{it.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}