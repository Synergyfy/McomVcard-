import type { VCardAction } from './VCardActionModal'

interface VCardActionsProps {
    onAction?: (action: VCardAction) => void
}

const actions: { key: VCardAction; label: string; desc: string; icon: string; color: string }[] = [
    {
        key: 'share',
        label: 'Share',
        desc: 'Send your card',
        icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
        color: 'from-accent-500 to-accent-600 text-white shadow-accent-500/30',
    },
    {
        key: 'exchange',
        label: 'Exchange',
        desc: 'Swap vouchers',
        icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
        color: 'from-blue-500 to-indigo-600 text-white shadow-blue-500/30',
    },
    {
        key: 'redeem',
        label: 'Redeem',
        desc: 'Use rewards',
        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
        color: 'from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
    },
]

/* Share / Exchange / Redeem open the matching action modal — the VCard
   buttons become real action points instead of just scrolling. */
export default function VCardActions({ onAction }: VCardActionsProps) {
    return (
        <div className="grid grid-cols-3 gap-2">
            {actions.map((a) => (
                <button
                    key={a.key}
                    onClick={() => onAction?.(a.key)}
                    className={`flex flex-col items-center gap-1 rounded-2xl py-3.5 bg-gradient-to-br shadow-lg transition-all active:scale-[0.97] hover:brightness-105 ${a.color}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={a.icon} />
                    </svg>
                    <span className="text-sm font-bold">{a.label}</span>
                    <span className="text-[10px] text-white/75">{a.desc}</span>
                </button>
            ))}
        </div>
    )
}
