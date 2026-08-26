import type { ReactNode } from 'react'

interface BottomSheetProps {
    open: boolean
    onClose: () => void
    title?: string
    children: ReactNode
    className?: string
}

export default function BottomSheet({ open, onClose, title, children, className = '' }: BottomSheetProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50">
            <button
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
                aria-label="Close"
            />
            <div className={`absolute bottom-0 inset-x-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl pb-safe animate-slideDown max-h-[85vh] overflow-y-auto ${className}`}>
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                </div>
                {title && (
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
                    </div>
                )}
                <div className="p-4">{children}</div>
            </div>
        </div>
    )
}