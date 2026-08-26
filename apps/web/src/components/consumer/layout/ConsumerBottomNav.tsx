import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import ConsumerMoreSheet from './ConsumerMoreSheet'

interface NavSlot {
    to: string
    label: string
    icon: string
    end?: boolean
}

const mainSlots: NavSlot[] = [
    { to: '/c/dashboard', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', end: true },
    { to: '/c/cards', label: 'Cards', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
]

const vcardSlot: NavSlot = {
    to: '/c/vcard',
    label: 'VCard',
    icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 002-2v-1a2 2 0 012-2h1.945M8 16.5V18a1.5 1.5 0 01-3 0v-1.5M16 9.5h2.5a1.5 1.5 0 010 3H16v3a1.5 1.5 0 01-3 0v-7a1.5 1.5 0 013 0z',
}

export default function ConsumerBottomNav() {
    const [moreOpen, setMoreOpen] = useState(false)

    const walletSlot = (
        <NavLink
            to="/c/wallet"
            className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 -mt-5 w-16 h-16 rounded-full shadow-lg transition-all ${isActive
                    ? 'bg-gradient-to-br from-accent-500 to-accent-600 text-white scale-105 shadow-accent-500/30'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                }`
            }
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-semibold leading-none">Wallet</span>
        </NavLink>
    )

    const moreSlot = (
        <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center justify-center gap-1 min-h-[44px] text-gray-500 dark:text-gray-400"
            aria-label="More"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h.01M15 12h.01M12 12h.01M12 5.5h.01M12 18.5h.01" />
            </svg>
            <span className="text-[10px] font-semibold leading-none">More</span>
        </button>
    )

    const genericSlot = (slot: NavSlot) => (
        <NavLink
            key={slot.to}
            to={slot.to}
            end={slot.end}
            className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors ${isActive ? 'text-accent-500' : 'text-gray-500 dark:text-gray-400'
                }`
            }
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={slot.icon} />
            </svg>
            <span className="text-[10px] font-semibold leading-none">{slot.label}</span>
        </NavLink>
    )

    return (
        <>
            <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 pb-safe">
                <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
                    {mainSlots.map(genericSlot)}
                    <div className="flex items-center justify-center">{walletSlot}</div>
                    {genericSlot(vcardSlot)}
                    {moreSlot}
                </div>
            </nav>
            <ConsumerMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
        </>
    )
}
