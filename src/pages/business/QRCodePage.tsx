import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'
import { getBusinessPermissions, mockBusinessProfile } from '../../services/businessStore'
import { currentSeason } from '../../services/businessDashboardStore'
import { loadMembershipPricing } from '../../services/membershipPricingStore'
import { getQrScanRules, type QrScanRule, type QrScanRuleOption } from '../../services/membershipEnforcement'

const QR_VALUE = 'https://vcard.greenleaf.coffee/q/dynamic'
const QR_DESTINATION = 'GreenLeaf Coffee — Business VCard'

const SCAN_STATS = [
    { label: 'Total scans', value: '18,940' },
    { label: 'Scans today', value: '143' },
    { label: `This ${currentSeason.name.toLowerCase()}`, value: '3,210' },
    { label: 'Unique scanners', value: '12,400' },
]

const WEEKLY_SCANS = [
    { label: 'Mon', value: 98 }, { label: 'Tue', value: 121 }, { label: 'Wed', value: 110 },
    { label: 'Thu', value: 143 }, { label: 'Fri', value: 137 }, { label: 'Sat', value: 168 },
    { label: 'Sun', value: 122 },
]

const DEVICES = [
    { label: 'Mobile', pct: 82 },
    { label: 'Tablet', pct: 9 },
    { label: 'Desktop', pct: 9 },
]

function limitText(o: QrScanRuleOption): string {
    if (o.id === 'Unlimited') return 'No limit on scanning'
    if (o.id === 'Seasonal') return `Up to ${(o.limit ?? 0).toLocaleString()} scans for ${currentSeason.name}`
    return `Up to ${(o.limit ?? 0).toLocaleString()} scans per day`
}

export default function BusinessQRCodePage() {
    const perms = getBusinessPermissions()
    const scanOptions = getQrScanRules(loadMembershipPricing(), perms.planLevel, perms.tier)

    const defaultRule: QrScanRule | undefined =
        scanOptions.find(o => o.id === 'Unlimited')?.id ??
        scanOptions.find(o => o.id === 'Seasonal')?.id ??
        scanOptions.find(o => o.id === 'Daily')?.id

    const [selected, setSelected] = useState<QrScanRule | undefined>(defaultRule ?? undefined)
    const [dataUrl, setDataUrl] = useState<string>('')
    const selectedOption = scanOptions.find(o => o.id === selected)

    useEffect(() => {
        QRCode.toDataURL(QR_VALUE, { width: 240, margin: 2, errorCorrectionLevel: 'H' })
            .then(setDataUrl)
            .catch(() => { /* ignore */ })
    }, [])

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: `${mockBusinessProfile.name} QR Code`, text: 'Scan to connect', url: QR_VALUE })
                return
            } catch { /* user cancelled — fall through to copy */ }
        }
        navigator.clipboard?.writeText(QR_VALUE)
        toast.success('QR link copied')
    }

    const handlePrint = () => {
        if (!dataUrl) return
        const win = window.open('', '_blank', 'width=420,height=540')
        if (!win) return
        win.document.write(
            `<html><head><title>Print QR Code</title></head>` +
            `<body style="text-align:center;font-family:system-ui,sans-serif;padding:32px;">` +
            `<h2 style="margin-bottom:4px;">${mockBusinessProfile.name}</h2>` +
            `<p style="color:#6b7280;margin-top:0;">Scan to connect</p>` +
            `<img src="${dataUrl}" width="280" height="280" style="margin-top:8px;"/>` +
            `<p style="color:#9ca3af;font-size:12px;">${QR_VALUE}</p>` +
            `<script>window.onload=()=>{window.focus();setTimeout(()=>window.print(),250)}<\/script>` +
            `</body></html>`
        )
        win.document.close()
    }

    const handleDownload = () => {
        if (!dataUrl) return
        const link = document.createElement('a')
        link.download = 'mcomvcard-business-qr.png'
        link.href = dataUrl
        link.click()
        toast.success('QR code downloaded')
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <Helmet><title>QR Code - Business Dashboard - MCOMVCard</title></Helmet>

            <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
            </button>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Code</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Your business QR is dynamic — one code that routes to the right destination, with scan rules set by your membership.
                </p>
            </div>

            {/* Current QR */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                <div className="flex items-center justify-between">
                    <p className="text-base font-bold text-gray-900 dark:text-white">Current QR</p>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                    </span>
                </div>
                <div className="flex flex-col items-center mt-4">
                    {dataUrl ? (
                        <img src={dataUrl} alt="Business QR Code" className="w-56 h-56 rounded-xl border border-gray-100 dark:border-gray-700" />
                    ) : (
                        <div className="w-56 h-56 rounded-xl bg-gray-50 dark:bg-gray-700/40 flex items-center justify-center text-xs text-gray-400">Generating QR…</div>
                    )}
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-4">{mockBusinessProfile.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Scan to connect</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
                    <button onClick={handleDownload} className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xs font-bold shadow-md hover:opacity-95 transition-opacity min-h-[64px]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download
                    </button>
                    <button onClick={handleShare} className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 text-xs font-semibold border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors min-h-[64px]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        Share
                    </button>
                    <button onClick={handlePrint} className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 text-xs font-semibold border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors min-h-[64px]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print
                    </button>
                    <button onClick={() => { navigator.clipboard?.writeText(QR_VALUE); toast.success('QR link copied') }} className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 text-xs font-semibold border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors min-h-[64px]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        Copy Link
                    </button>
                </div>
            </div>

            {/* Dynamic destination */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6v6m-9 3l9-9" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Dynamic destination</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{QR_DESTINATION}</p>
                        <p className="text-[11px] text-gray-400 mt-1 break-all">{QR_VALUE}</p>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">Dynamic QR Engine</span>
                </div>
            </div>

            {/* Scan statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Scan statistics</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    {SCAN_STATS.map(s => (
                        <div key={s.label} className="rounded-xl bg-gray-50 dark:bg-gray-700/40 p-3">
                            <p className="text-[11px] font-semibold text-gray-400">{s.label}</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{s.value}</p>
                        </div>
                    ))}
                </div>

                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-2">Last 7 days</p>
                <div className="flex items-end gap-2 h-20">
                    {WEEKLY_SCANS.map(d => (
                        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full rounded-t-md bg-gradient-to-t from-orange-500 to-orange-400" style={{ height: `${(d.value / Math.max(...WEEKLY_SCANS.map(x => x.value))) * 72}px` }} />
                            <span className="text-[10px] text-gray-400">{d.label}</span>
                        </div>
                    ))}
                </div>

                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-5 mb-2">Devices</p>
                <div className="space-y-2">
                    {DEVICES.map(d => (
                        <div key={d.label} className="flex items-center gap-3">
                            <span className="w-16 text-xs text-gray-500 shrink-0">{d.label}</span>
                            <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${d.pct}%` }} />
                            </div>
                            <span className="w-10 text-right text-xs font-semibold text-gray-900 dark:text-white">{d.pct}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scan rule */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Scan rule</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-3">
                    Choose how often this QR can be scanned. The available options come from your {perms.planLevel} {perms.tier} membership.
                </p>
                <div className="space-y-2">
                    {scanOptions.map(o => (
                        <button
                            key={o.id}
                            onClick={() => { setSelected(o.id); toast.success(`Scan rule set to ${o.id === 'Seasonal' ? 'Seasonal allowance' : o.id}`) }}
                            className={`w-full px-4 py-3.5 min-h-[46px] rounded-xl text-sm font-semibold border text-left transition-colors ${
                                selected === o.id
                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            <span className="block font-bold text-gray-900 dark:text-white">{o.id === 'Seasonal' ? 'Seasonal allowance' : o.id}</span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">{limitText(o)}</span>
                        </button>
                    ))}
                </div>

                {selectedOption && (
                    <div className="mt-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 p-3 flex items-center justify-between gap-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Scan limit on your plan</span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white text-right">
                            {selectedOption.id === 'Unlimited' ? 'Unlimited' : limitText(selectedOption)}
                        </span>
                    </div>
                )}

                <p className="text-[11px] text-gray-400 mt-3">
                    Scan rules are governed by your membership configuration. See what's included on the{' '}
                    <Link to="/b/membership" className="text-orange-600 dark:text-orange-400 font-semibold">Membership</Link> page.
                </p>
            </div>
        </div>
    )
}
