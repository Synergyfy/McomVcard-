import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import FamilyAvatar from './FamilyAvatar'
import type { FamilyCardMember } from '../../../services/familyCards'

export default function FamilyCardPreview({ member }: { member: FamilyCardMember }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!canvasRef.current) return
        QRCode.toCanvas(canvasRef.current, member.shareLink, { width: 190, margin: 2, errorCorrectionLevel: 'H' })
            .catch(() => { /* ignore render errors */ })
    }, [member.shareLink])

    return (
        <div className="rounded-[28px] bg-white dark:bg-gray-900 p-6 shadow-lg border border-gray-100 dark:border-gray-800">
            <div className="rounded-3xl bg-gradient-to-br from-accent-500 to-accent-600 p-6 text-white shadow-lg shadow-accent-500/25 mb-6">
                <div className="flex items-start justify-between mb-6">
                    <FamilyAvatar emoji={member.avatar.emoji} gradient={member.avatar.gradient} size="md" name={member.name} />
                    <span className="px-2.5 py-1 rounded-full bg-white/20 border border-white/25 text-[10px] font-bold uppercase tracking-wide">
                        {member.status}
                    </span>
                </div>
                <p className="text-xl font-extrabold">{member.name}</p>
                <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wide">{member.relationship}</span>
                    <span className="text-[11px] text-white/80">{member.cardType}</span>
                </div>
                <div className="flex items-center gap-2 mt-6">
                    <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 8a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17h3.839a.75.75 0 00.53-.919c-.083-.322-.173-.657-.263-1.003m0 0a15.976 15.976 0 00-2.595-6.625" />
                    </svg>
                    <span className="text-xs">{member.membership}</span>
                </div>
                <div className="mt-6 rounded-2xl bg-white/15 backdrop-blur border border-white/25 p-3.5">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-white/80 uppercase tracking-wide">Card wallet</p>
                        <span className="text-lg font-extrabold text-white">£{member.cardBalance.toFixed(2)}</span>
                    </div>
                    <p className="text-[11px] text-white/70 mt-1">Usable at MCOM Mall, Expo &amp; partner merchants.</p>
                </div>
            </div>

            <div className="text-center mb-4">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">Scan to view card</p>
            </div>
            <div className="flex justify-center mb-2">
                <canvas ref={canvasRef} className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-2 border border-gray-100 dark:border-gray-800" />
            </div>
            <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 break-all">{member.shareLink}</p>
        </div>
    )
}
