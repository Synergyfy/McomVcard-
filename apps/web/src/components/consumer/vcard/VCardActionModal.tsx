import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import type { MockConsumer, ExchangeItem } from '../../../services/mockData'

export type VCardAction = 'share' | 'exchange' | 'redeem'

interface VCardActionModalProps {
    open: boolean
    action: VCardAction | null
    onClose: () => void
    profile: MockConsumer
    exchange: ExchangeItem[]
    redeem: ExchangeItem[]
}

const actionConfig: Record<VCardAction, {
    title: string
    subtitle: string
    gradient: string
    buttonClass: string
    icon: string
}> = {
    share: {
        title: 'Share',
        subtitle: 'Everything on your VCard you can share — pick one and send it to anyone.',
        gradient: 'from-accent-500 to-accent-600',
        buttonClass: 'bg-accent-500 hover:bg-accent-600 text-white',
        icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
    },
    exchange: {
        title: 'Exchange',
        subtitle: 'Swap your items at any participating business — pick one to see how.',
        gradient: 'from-blue-500 to-indigo-600',
        buttonClass: 'bg-blue-500 hover:bg-blue-600 text-white',
        icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    },
    redeem: {
        title: 'Redeem',
        subtitle: 'Claim your rewards before they expire — pick one to see how.',
        gradient: 'from-emerald-500 to-teal-600',
        buttonClass: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    },
}

const vcardIcon = 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 002-2v-1a2 2 0 012-2h1.945M8 16.5V18a1.5 1.5 0 01-3 0v-1.5M16 9.5h2.5a1.5 1.5 0 010 3H16v3a1.5 1.5 0 01-3 0v-7a1.5 1.5 0 013 0z'

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function generateCode(): string {
    let out = ''
    for (let i = 0; i < 6; i++) out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
    return `MCOM-${out}`
}

export default function VCardActionModal({ open, action, onClose, profile, exchange, redeem }: VCardActionModalProps) {
    const [done, setDone] = useState<Record<string, boolean>>({})
    const [copied, setCopied] = useState<string | null>(null)
    const [selected, setSelected] = useState<{ item: ExchangeItem; code: string } | null>(null)
    const [codeCopied, setCodeCopied] = useState(false)
    const qrRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!open || !action) {
            setSelected(null)
            setCodeCopied(false)
            setCopied(null)
        }
    }, [open, action])

    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [open, onClose])

    useEffect(() => {
        if (!open || !selected || !qrRef.current) return
        const value = `https://mcomvcard.link/r/${selected.item.id}?code=${selected.code}`
        QRCode.toCanvas(qrRef.current, value, { width: 160, margin: 1, errorCorrectionLevel: 'H' }).catch(() => { /* ignore */ })
    }, [open, selected])

    if (!open || !action) return null
    const cfg = actionConfig[action]
    const isExchange = action === 'exchange'

    const markDone = (key: string) => {
        setDone((prev) => ({ ...prev, [key]: true }))
        window.setTimeout(() => {
            setDone((prev) => {
                const next = { ...prev }
                delete next[key]
                return next
            })
        }, 2500)
    }

    const share = async (key: string, url: string, text: string) => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title: text, text, url })
                markDone(key)
            } catch {
                /* dismissed by user */
            }
            return
        }
        try {
            await navigator.clipboard?.writeText(url)
        } catch {
            /* clipboard unavailable */
        }
        setCopied(key)
        window.setTimeout(() => setCopied(null), 2000)
    }

    const copyCode = async () => {
        if (!selected) return
        try {
            await navigator.clipboard?.writeText(selected.code)
        } catch {
            /* clipboard unavailable */
        }
        setCodeCopied(true)
        window.setTimeout(() => setCodeCopied(false), 2000)
    }

    const vcardUrl = `https://mcomvcard.link/c/${profile.cardId || 'card'}`

    const actionButton = (key: string, label: string, doneLabel: string, extra: () => void) => {
        const isDone = done[key]
        const isCopied = action === 'share' && copied === key
        return (
            <button
                onClick={extra}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.97] shrink-0 ${
                    isDone || isCopied ? 'bg-green-500 hover:bg-green-600 text-white' : cfg.buttonClass
                }`}
            >
                {isDone || isCopied ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                ) : null}
                {isCopied ? 'Link Copied!' : isDone ? doneLabel : label}
            </button>
        )
    }

    const renderItemRow = (key: string, item: ExchangeItem) => (
        <div key={key} className="flex items-center gap-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
            <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{item.business}</p>
            </div>
            <div className="text-right shrink-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white">{item.value}</p>
                <p className="text-[10px] text-gray-400">until {item.expires}</p>
            </div>
            {actionButton(
                key,
                isExchange ? 'Exchange' : 'Redeem',
                isExchange ? 'Exchanged!' : 'Redeemed!',
                () => setSelected({ item, code: generateCode() })
            )}
        </div>
    )

    const renderDetail = () => {
        if (!selected) return null
        const { item, code } = selected
        const key = `${action}-${item.id}`
        const steps = isExchange
            ? [
                  'Show this code at the business counter',
                  'Staff scan or enter the code to swap your item',
                  'Your exchange is confirmed instantly',
              ]
            : [
                  'Show this code at the business counter',
                  'Staff scan or enter the code to redeem your reward',
                  'Enjoy your reward!',
              ]

        return (
            <div className="space-y-4">
                <button
                    onClick={() => setSelected(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to {isExchange ? 'Exchange' : 'Redeem'}
                </button>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
                    <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                        </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{item.business}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{item.value}</p>
                        <p className="text-[10px] text-gray-400">until {item.expires}</p>
                    </div>
                </div>

                <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-4 flex items-center justify-center gap-4">
                    <canvas ref={qrRef} className="w-24 h-24 shrink-0 rounded-xl bg-white p-1.5" />
                    <div className="text-center">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {isExchange ? 'Exchange code' : 'Redeem code'}
                        </p>
                        <p className="text-xl font-mono font-extrabold tracking-widest text-gray-900 dark:text-white mt-1">{code}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Valid until {item.expires}</p>
                        <button
                            onClick={copyCode}
                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            {codeCopied ? 'Copied!' : 'Copy code'}
                        </button>
                    </div>
                </div>

                <div className="space-y-2.5">
                    {steps.map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold flex items-center justify-center shrink-0">
                                {i + 1}
                            </span>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{s}</p>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => {
                        markDone(key)
                        setSelected(null)
                    }}
                    className={`w-full py-3.5 rounded-2xl text-sm font-bold shadow-lg transition-all active:scale-[0.98] ${cfg.buttonClass}`}
                >
                    I&apos;ve {isExchange ? 'exchanged' : 'redeemed'} this
                </button>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-fadeIn" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-[28px] shadow-2xl pb-safe flex flex-col max-h-[88vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mx-auto w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 mt-3" />

                {/* Header */}
                <div className="px-5 pt-4 pb-3 flex items-start gap-3 border-b border-gray-100 dark:border-gray-800">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white shrink-0 shadow-lg`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cfg.icon} />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{cfg.title}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{cfg.subtitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0 transition-colors tap-target"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-5 py-4 space-y-3">
                    {action === 'share' && !selected && (
                        <>
                            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 p-3">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={vcardIcon} />
                                    </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{profile.name}'s VCard</p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{vcardUrl}</p>
                                </div>
                                {actionButton('vcard', 'Share', 'Shared!', () => share('vcard', vcardUrl, `Check out my MCOMVCard — ${profile.name}`))}
                            </div>

                            {profile.shareContent.length > 0 && (
                                <>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 pt-1">Content you can share</p>
                                    {profile.shareContent.map((s) => (
                                        <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
                                            <div className="w-11 h-11 rounded-xl bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 flex items-center justify-center shrink-0">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{s.title}</p>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{s.source} · valid till {s.availableUntil}</p>
                                            </div>
                                            {actionButton(`share-${s.id}`, 'Share', 'Shared!', () => share(`share-${s.id}`, `${vcardUrl}?offer=${s.id}`, s.title))}
                                        </div>
                                    ))}
                                </>
                            )}
                        </>
                    )}

                    {action === 'exchange' && !selected && (
                        <>
                            <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 p-3.5 flex gap-2.5">
                                <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300">How to exchange</p>
                                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 leading-snug mt-0.5">
                                        Tap Exchange on an item to get a code, then show it to the business counter to swap in person.
                                        Items stay active until their expiry date.
                                    </p>
                                </div>
                            </div>

                            {exchange.map((e) => renderItemRow(`exchange-${e.id}`, e))}
                        </>
                    )}

                    {action === 'redeem' && !selected && (
                        <>
                            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 p-3.5 flex gap-2.5">
                                <svg className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">How to redeem</p>
                                    <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 leading-snug mt-0.5">
                                        Tap Redeem on a reward to get a code, then show it to the business counter to use it.
                                        Rewards are valid until their expiry date.
                                    </p>
                                </div>
                            </div>

                            {redeem.map((e) => renderItemRow(`redeem-${e.id}`, e))}
                        </>
                    )}

                    {selected && renderDetail()}
                </div>
            </div>
        </div>
    )
}
