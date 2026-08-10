import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import type { MockConsumer } from '../../../services/mockData'

interface QRExpandOverlayProps {
    open: boolean
    onClose: () => void
    profile: MockConsumer
}

export default function QRExpandOverlay({ open, onClose, profile }: QRExpandOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [copied, setCopied] = useState(false)

    const qrValue = `https://mcomvcard.link/c/${profile.cardId || 'card'}`

    useEffect(() => {
        if (!open || !canvasRef.current) return
        QRCode.toCanvas(canvasRef.current, qrValue, { width: 220, margin: 2, errorCorrectionLevel: 'H' })
            .catch(() => { /* ignore render errors */ })
    }, [open, qrValue])

    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [open, onClose])

    if (!open) return null

    const handleCopy = () => {
        navigator.clipboard?.writeText(qrValue)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = () => {
        if (!canvasRef.current) return
        const link = document.createElement('a')
        link.download = `${profile.name.replace(/\s+/g, '-').toLowerCase()}-vcard-qr.png`
        link.href = canvasRef.current.toDataURL('image/png')
        link.click()
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fadeIn" onClick={onClose}>
            <button
                onClick={onClose}
                className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors tap-target"
                aria-label="Close QR"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div className="bg-white dark:bg-gray-900 rounded-[28px] p-6 w-full max-w-xs shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                <div className="text-center mb-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">{profile.membership}</p>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{profile.name}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{profile.cardId}</p>
                </div>

                <div className="flex justify-center mb-5">
                    <canvas ref={canvasRef} className="rounded-2xl bg-white p-2" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleCopy}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download QR
                    </button>
                </div>
            </div>
        </div>
    )
}
