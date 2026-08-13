import { useEffect, type ReactNode } from 'react'

interface ConfirmationModalProps {
    open: boolean
    title: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    tone?: 'accent' | 'danger'
    icon?: ReactNode
    busy?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmationModal({
    open,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    tone = 'accent',
    icon,
    busy = false,
    onConfirm,
    onCancel,
}: ConfirmationModalProps) {
    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
        document.addEventListener('keydown', handler)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', handler)
            document.body.style.overflow = ''
        }
    }, [open, onCancel])

    if (!open) return null

    const confirmClass = tone === 'danger'
        ? 'bg-red-500 hover:bg-red-600'
        : 'bg-accent-500 hover:bg-accent-600'

    const iconWrap = tone === 'danger'
        ? 'bg-red-50 dark:bg-red-500/10 text-red-500'
        : 'bg-accent-50 dark:bg-accent-500/10 text-accent-500'

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onCancel}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" />
            <div
                className="relative z-10 w-full max-w-sm rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl p-6 text-center animate-fadeInUp"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${iconWrap}`}>
                    {icon || (
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
                {message && <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onCancel}
                        disabled={busy}
                        className="h-12 rounded-2xl border border-gray-200 dark:border-gray-700 font-semibold text-gray-600 dark:text-gray-300 disabled:opacity-60 active:scale-[0.98] transition-transform"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={busy}
                        className={`h-12 rounded-2xl text-white font-bold disabled:opacity-60 active:scale-[0.98] transition-colors ${confirmClass}`}
                    >
                        {busy ? 'Working…' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
