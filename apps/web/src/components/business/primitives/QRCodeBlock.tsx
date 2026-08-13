import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface QRCodeBlockProps {
    value: string
    size?: number
    title?: string
    subtitle?: string
    className?: string
}

export default function QRCodeBlock({ value, size = 160, title, subtitle, className = '' }: QRCodeBlockProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        if (!canvasRef.current || !value) return
        QRCode.toCanvas(canvasRef.current, value, { width: size, margin: 2 })
            .catch(() => setError(true))
    }, [value, size])

    const handleDownload = () => {
        if (!canvasRef.current) return
        const link = document.createElement('a')
        link.download = 'mcomvcard-qr.png'
        link.href = canvasRef.current.toDataURL('image/png')
        link.click()
    }

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex flex-col items-center text-center ${className}`}>
            {title && <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{subtitle}</p>}
            {error ? (
                <div className="w-40 h-40 flex items-center justify-center text-xs text-gray-400">QR unavailable</div>
            ) : (
                <canvas ref={canvasRef} className="rounded-lg" />
            )}
            <div className="flex gap-2 mt-4">
                <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                </button>
                <button
                    onClick={() => navigator.clipboard?.writeText(value)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                </button>
            </div>
        </div>
    )
}