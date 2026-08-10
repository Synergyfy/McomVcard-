import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import toast from 'react-hot-toast'
import type { CardFaces, CardSectionLayout, CardSectionState, CustomBlock, FriendsFamilyConfig } from '../../services/cardTemplateStore'
import QrCodeSvg from './QrCodeSvg'
import { SeasonCountdown } from './SeasonCountdown'

type Face = 'front' | 'back'

/* ------------------------------------------------------------------ */
/*  Card preview (85 × 55 mm, 3 mm bleed) — shared across the          */
/*  builder and the card template list pages.                          */
/* ------------------------------------------------------------------ */

function CardFaceContent({ face, sections, useLayout, ff }: { face: Face; sections: CardSectionState[]; useLayout?: boolean; ff?: FriendsFamilyConfig }) {
  const s = (id: string) => sections.find(x => x.schemaId === id)

  if (useLayout) {
    return <LayoutFaceContent face={face} sections={sections} ff={ff} />
  }

  if (face === 'front') {
    const bg = s('background')
    const branding = s('branding')
    const photo = s('memberPhoto')
    const tier = s('tierBadge')
    const details = s('cardDetails')
    const qr = s('qr')
    const security = s('security')
    const progress = s('rewardsProgress')

    const bgColor = bg?.values.bgColor
    const from = bg?.values.gradientFrom || '#1e293b'
    const to = bg?.values.gradientTo || '#0f172a'
    const qrBox = qr?.values.size === 'Small' ? 'w-7 h-7' : qr?.values.size === 'Large' ? 'w-11 h-11' : qr?.values.size === 'Extra Large' ? 'w-12 h-12' : 'w-9 h-9'

    return (
      <div
        className="relative w-full h-full text-white"
        style={
          bgColor
            ? { backgroundColor: bgColor }
            : { backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }
        }
      >
        {bg?.values.image && (
          <>
            <img src={bg.values.image} alt="" className="absolute inset-0 w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
            <div className="absolute inset-0 bg-black/40" />
          </>
        )}
        <div className="relative h-full p-3.5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {branding?.values.logo && <img src={branding.values.logo} alt="" className="w-7 h-7 rounded-full object-cover border border-white/40 shrink-0" onError={e => { e.currentTarget.style.display = 'none' }} />}
              <div className="min-w-0">
                <p className="text-[11px] font-bold truncate leading-tight">{branding?.values.brandName || 'BRAND NAME'}</p>
                {branding?.values.tagline && <p className="text-[7px] text-white/70 truncate">{branding.values.tagline}</p>}
              </div>
            </div>
            {tier && (
              <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 border border-white/30 text-[8px] font-bold">
                {tier.values.showIcon === 'true' && <span>★</span>}
                {tier.values.level || tier.values.tier || 'MEMBER'}
              </div>
            )}
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {photo?.values.photo && <img src={photo.values.photo} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white/50 shrink-0" onError={e => { e.currentTarget.style.display = 'none' }} />}
              <div className="min-w-0">
                <p className="text-[11px] font-bold truncate">{photo?.values.memberName || 'Member Name'}</p>
                <p className="text-[7px] text-white/70">{photo?.values.membershipLabel || 'Member'}</p>
              </div>
            </div>
            {qr && (
              <div className={`shrink-0 ${qrBox}`}>
                <FaceQrBox section={qr} />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            {details && (
              <div className="flex items-center gap-2 flex-wrap">
                {security?.values.hasSecurity === 'true' && (
                  <div className="w-5 h-4 rounded-[3px] bg-gradient-to-br from-amber-200 to-amber-500 shrink-0 shadow-inner" />
                )}
                {security?.values.hasPassword === 'true' && (
                  <span className="inline-flex items-center gap-0.5 text-white/85">
                    <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <span className="text-[7px] font-semibold">{security.values.password ? '•'.repeat(Math.max(3, security.values.password.length)) : 'PIN locked'}</span>
                  </span>
                )}
                {details.items.rows?.map((r, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="text-[6px] text-white/60 uppercase">{r.label}</span>
                    <span className={`text-[8px] font-mono font-bold ${r.label === 'Card Number' ? 'tracking-wider' : ''}`}>{r.value || '—'}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              {s('ffIndicator') && <FfIndicatorContent section={s('ffIndicator')!} />}
              {ff?.enabled && ff.showBadge && (
                <span className="px-1.5 py-0.5 rounded bg-white/15 text-[7px] whitespace-nowrap">
                  {ff.badgeLabel || 'F&F'}
                </span>
              )}
              {progress && progress.values.display !== 'None' && progress.values.display !== '' && (
                <div className="flex-1 max-w-[120px] h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-amber-300 rounded-full" style={{ width: `${Math.min(100, Math.round((Number(progress.values.current) || 0) / Math.max(1, Number(progress.values.target) || 1) * 100))}%` }} />
                </div>
              )}
            </div>
            {s('countdown') && (
              <SeasonCountdown seasonIds={s('countdown')!.values.seasonIds} label={s('countdown')!.values.label} color={s('countdown')!.values.color} size="xs" />
            )}
          </div>
        </div>
      </div>
    )
  }

  const stripe = s('magneticStripe')
  const signature = s('signature')
  const terms = s('terms')
  const contact = s('contactInfo')
  const qrSection = s('qr')
  const footer = s('footerBranding')

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 text-gray-800">
      <div className="h-full flex flex-col">
        {stripe && <div className="h-[18px] mt-2 rounded-[1px]" style={{ backgroundColor: stripe.values.color || '#111827' }} />}
        <div className="flex-1 p-3 flex flex-col gap-2 min-h-0">
          {signature && (
            <div>
              <div className="h-4 border-b border-gray-400 flex items-end px-1 relative">
                {signature.values.signature && <img src={signature.values.signature} alt="" className="absolute left-1 -bottom-0.5 h-4 max-w-[60%] object-contain" onError={e => { e.currentTarget.style.display = 'none' }} />}
              </div>
              <p className="text-[6px] text-gray-500 mt-0.5">{signature.values.label || 'Authorized Signature'}</p>
            </div>
          )}
          <div className="flex items-start justify-between gap-3 flex-1 min-h-0">
            <div className="space-y-1 min-w-0 flex-1">
              {contact && contact.items.rows?.map((r, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-[6px] uppercase text-gray-400">{r.label || r.type}</span>
                  <span className="text-[8px] font-medium text-gray-700 truncate">{r.value || '—'}</span>
                </div>
              ))}
              {terms?.values.termsText && (
                <p className="text-[6px] leading-tight text-gray-500 line-clamp-3">{terms.values.termsText}</p>
              )}
            </div>
            {qrSection && (
              <div className="shrink-0">
                <div className="w-9 h-9">
                  <FaceQrBox section={qrSection} />
                </div>
                {qrSection.values.heading && <p className="text-[6px] text-gray-500 text-center mt-0.5">{qrSection.values.heading}</p>}
              </div>
            )}
          </div>
          {(() => {
            const acts = [s('share'), s('exchange'), s('redeem'), s('buildGroup')].filter((x): x is CardSectionState => Boolean(x))
            if (acts.length === 0) return null
            const actIcon: Record<string, string> = {
              share: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
              exchange: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
              redeem: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
              buildGroup: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
            }
            return (
              <div className="grid grid-cols-2 gap-1 shrink-0">
                {acts.map(sec => (
                  <span
                    key={sec.uid}
                    className={`rounded-[3px] px-1.5 h-4 flex items-center justify-center gap-1 truncate ${sec.schemaId === 'redeem' ? 'bg-orange-500 text-white' : 'border border-orange-300 text-orange-600 bg-white/70'}`}
                  >
                    <svg className="w-2 h-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={actIcon[sec.schemaId] ?? actIcon.share} /></svg>
                    <span className="text-[6.5px] font-semibold truncate">{sec.values.button || sec.values.label || (sec.schemaId === 'redeem' ? 'Redeem' : 'Act')}</span>
                  </span>
                ))}
              </div>
            )
          })()}
          {footer && (
            <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-gray-300">
              {footer.values.logo && <img src={footer.values.logo} alt="" className="w-3.5 h-3.5 object-contain" onError={e => { e.currentTarget.style.display = 'none' }} />}
              <p className="text-[7px] font-semibold text-gray-600">{footer.values.tagline || 'MCOM'}</p>
            </div>
          )}
          {s('countdown') && (
            <div className="pt-1">
              <SeasonCountdown seasonIds={s('countdown')!.values.seasonIds} label={s('countdown')!.values.label} color={s('countdown')!.values.color} size="xs" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Layout mode — each enabled section is an absolutely-positioned     */
/*  box driven by `section.layout` (x, y, w, h in % of the card).      */
/*  Used by the builder's draggable Live Card Preview and the print    */
/*  preview once a layout has been saved.                              */
/* ------------------------------------------------------------------ */

const DEFAULT_LAYOUTS: Record<string, CardSectionLayout> = {
  branding: { x: 4, y: 6, w: 55, h: 16 },
  tierBadge: { x: 58, y: 6, w: 38, h: 9 },
  memberPhoto: { x: 4, y: 44, w: 55, h: 18 },
  cardDetails: { x: 4, y: 64, w: 92, h: 14 },
  ffIndicator: { x: 4, y: 74, w: 34, h: 8 },
  qr: { x: 72, y: 42, w: 24, h: 22 },
  security: { x: 4, y: 81, w: 32, h: 9 },
  rewardsProgress: { x: 68, y: 81, w: 28, h: 9 },
  countdown: { x: 4, y: 88, w: 92, h: 10 },
  magneticStripe: { x: 0, y: 3, w: 100, h: 8 },
  signature: { x: 6, y: 14, w: 60, h: 16 },
  terms: { x: 6, y: 86, w: 88, h: 8 },
  contactInfo: { x: 6, y: 32, w: 60, h: 26 },
  footerBranding: { x: 0, y: 94, w: 100, h: 6 },
  share: { x: 6, y: 60, w: 44, h: 12 },
  exchange: { x: 52, y: 60, w: 42, h: 12 },
  redeem: { x: 6, y: 73, w: 44, h: 12 },
  buildGroup: { x: 52, y: 73, w: 42, h: 12 },
}

function defaultLayout(schemaId: string): CardSectionLayout | undefined {
  return DEFAULT_LAYOUTS[schemaId]
}

const hideImg = (e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none' }

/* QR face box — honours the section's qrMode so an uploaded QR image or
   a "user uploads later" placeholder shows on the card, not just the
   system-generated one. */
function FaceQrBox({ section, sizeClass = 'w-full h-full', className = '' }: { section: CardSectionState; sizeClass?: string; className?: string }) {
  const v = section.values
  const mode = v.qrMode || 'Generate by System'
  if (mode === 'Upload from File' && v.qrImage) {
    return <img src={v.qrImage} alt="" className={`${sizeClass} object-contain ${className}`} onError={hideImg} />
  }
  if (mode === 'Allow User Upload') {
    return (
      <div className={`${sizeClass} ${className} rounded-[3px] border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 flex items-center justify-center`}>
        <span className="text-[6px] text-gray-400 text-center leading-none">QR here</span>
      </div>
    )
  }
  return (
    <div className={`${sizeClass} ${className} flex items-center justify-center`}>
      <div className="aspect-square h-full max-w-full">
        <QrCodeSvg value={v.url} fg={v.qrColor} bg={v.qrBgColor} style={v.qrStyle} logo={v.qrLogo} sizeClass="w-full h-full" />
      </div>
    </div>
  )
}

/* Friends & Family indicator — the visual content of the ffIndicator
   section, driven by its `indicator` style field. */
function FfIndicatorContent({ section }: { section: CardSectionState }) {
  const v = section.values
  const style = v.indicator || 'None'
  const count = v.count || '0'
  if (style === 'None' || style === 'Hidden Until Allocated') return null
  if (style === 'Numeric Badge') {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/15 border border-white/20 text-white font-bold whitespace-nowrap" style={{ fontSize: 7 }}>
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        {count}
      </span>
    )
  }
  if (style === 'Progress Indicator') {
    return (
      <div className="flex items-center gap-1 min-w-0">
        <div className="w-8 h-1.5 rounded-full bg-white/20 overflow-hidden shrink-0">
          <div className="h-full bg-amber-300 rounded-full" style={{ width: '60%' }} />
        </div>
        <span className="text-white/80 font-semibold whitespace-nowrap" style={{ fontSize: 6 }}>{count}</span>
      </div>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/15 border border-white/20 text-white font-bold whitespace-nowrap" style={{ fontSize: 7 }}>
      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8h16M4 12h16M4 16h10M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      {count}
    </span>
  )
}

function LayoutSectionContent({ section }: { section: CardSectionState }) {
  const v = section.values
  const scale = (section.fontSize ?? 100) / 100
  const ts = (px: number) => `${Math.round(px * scale)}px`
  switch (section.schemaId) {
    case 'branding':
      return (
        <div className="absolute inset-0 p-1 flex items-center gap-1.5 min-w-0">
          {v.logo && <img src={v.logo} alt="" className="w-5 h-5 rounded-full object-cover border border-white/40 shrink-0" onError={hideImg} />}
          <div className="min-w-0">
            <p className="font-bold truncate leading-tight" style={{ fontSize: ts(10) }}>{v.brandName || 'BRAND NAME'}</p>
            {v.tagline && <p className="text-white/70 truncate" style={{ fontSize: ts(6) }}>{v.tagline}</p>}
          </div>
        </div>
      )
    case 'tierBadge':
      return (
        <div className="absolute inset-0 p-0.5 flex items-center justify-center">
          <span className="px-1.5 py-0.5 rounded-full bg-white/15 border border-white/30 font-bold whitespace-nowrap" style={{ fontSize: ts(7) }}>
            {v.showIcon === 'true' && <span className="mr-0.5">★</span>}{v.level || v.tier || 'MEMBER'}
          </span>
        </div>
      )
    case 'memberPhoto':
      return (
        <div className="absolute inset-0 p-1 flex items-center gap-1.5 min-w-0">
          {v.photo && <img src={v.photo} alt="" className="w-6 h-6 rounded-full object-cover border-2 border-white/50 shrink-0" onError={hideImg} />}
          <div className="min-w-0">
            <p className="font-bold truncate" style={{ fontSize: ts(10) }}>{v.memberName || 'Member Name'}</p>
            <p className="text-white/70 truncate" style={{ fontSize: ts(6) }}>{v.membershipLabel || 'Member'}</p>
          </div>
        </div>
      )
    case 'cardDetails':
      return (
        <div className="absolute inset-0 p-1 flex items-center gap-1.5 flex-wrap content-center overflow-hidden">
          {section.items.rows?.map((r, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-white/60 uppercase" style={{ fontSize: ts(6) }}>{r.label}</span>
              <span className={`font-mono font-bold ${r.label === 'Card Number' ? 'tracking-wider' : ''}`} style={{ fontSize: ts(7) }}>{r.value || '—'}</span>
            </div>
          ))}
        </div>
      )
    case 'qr':
      return (
        <div className="absolute inset-0 p-0.5 flex items-center justify-center">
          <div className="aspect-square" style={{ height: `${scale * 100}%`, maxWidth: '100%' }}>
            <FaceQrBox section={section} sizeClass="w-full h-full" />
          </div>
        </div>
      )
    case 'security':
      if (v.hasSecurity !== 'true' && v.hasPassword !== 'true') return null
      return (
        <div className="absolute inset-0 p-0.5 flex items-center gap-1 min-w-0">
          {v.hasSecurity === 'true' && <div className="w-4 h-3.5 rounded-[2px] bg-gradient-to-br from-amber-200 to-amber-500 shadow-inner shrink-0" />}
          {v.chipLabel && v.hasSecurity === 'true' && <span className="text-white/70 truncate" style={{ fontSize: ts(6) }}>{v.chipLabel}</span>}
          {v.hasPassword === 'true' && (
            <span className="inline-flex items-center gap-0.5 shrink-0">
              <svg className="w-2.5 h-2.5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <span className="text-white/80 truncate" style={{ fontSize: ts(6) }}>{v.password ? '•'.repeat(Math.max(3, v.password.length)) : 'PIN locked'}</span>
            </span>
          )}
        </div>
      )
    case 'share':
      return (
        <div className="absolute inset-0 p-1 flex items-center">
          <span className="w-full h-full rounded-[3px] border border-orange-400 text-orange-600 bg-white/70 dark:bg-gray-900/60 font-semibold flex items-center justify-center gap-1 truncate">
            <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            <span className="truncate" style={{ fontSize: ts(6) }}>{v.label || 'Share Card'}</span>
          </span>
        </div>
      )
    case 'exchange':
      return (
        <div className="absolute inset-0 p-1 flex items-center">
          <span className="w-full h-full rounded-[3px] border border-orange-400 text-orange-600 bg-white/70 dark:bg-gray-900/60 font-semibold flex items-center justify-center gap-1 truncate">
            <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            <span className="truncate" style={{ fontSize: ts(6) }}>{v.label || 'Exchange Contact'}</span>
          </span>
        </div>
      )
    case 'redeem':
      return (
        <div className="absolute inset-0 p-1 flex items-center">
          <span className="w-full h-full rounded-[3px] bg-orange-500 text-white font-semibold flex items-center justify-center gap-1 truncate">
            <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="truncate" style={{ fontSize: ts(6) }}>{v.button || v.label || 'Redeem'}</span>
          </span>
        </div>
      )
    case 'buildGroup':
      return (
        <div className="absolute inset-0 p-1 flex items-center">
          <span className="w-full h-full rounded-[3px] border border-orange-400 text-orange-600 bg-white/70 dark:bg-gray-900/60 font-semibold flex items-center justify-center gap-1 truncate">
            <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <span className="truncate" style={{ fontSize: ts(6) }}>{v.button || v.label || 'Build Group'}</span>
          </span>
        </div>
      )
    case 'ffIndicator':
      return (
        <div className="absolute inset-0 p-0.5 flex items-center min-w-0">
          <FfIndicatorContent section={section} />
        </div>
      )
    case 'rewardsProgress':
      return (
        <div className="absolute inset-0 p-1 flex items-center">
          <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-amber-300 rounded-full" style={{ width: `${Math.min(100, Math.round((Number(v.current) || 0) / Math.max(1, Number(v.target) || 1) * 100))}%` }} />
          </div>
        </div>
      )
    case 'countdown':
      return (
        <div className="absolute inset-0 p-0.5 flex items-center min-w-0">
          <SeasonCountdown seasonIds={v.seasonIds} label={v.label} color={v.color} size="xs" />
        </div>
      )
    case 'magneticStripe':
      return <div className="w-full h-full rounded-[1px]" style={{ backgroundColor: v.color || '#111827' }} />
    case 'signature':
      return (
        <div className="absolute inset-0 p-1 flex flex-col">
          <div className="h-3 border-b border-gray-400 relative">
            {v.signature && <img src={v.signature} alt="" className="absolute left-0 -bottom-0.5 h-3 max-w-[70%] object-contain" onError={hideImg} />}
          </div>
          {v.label && <p className="text-gray-500 truncate mt-0.5" style={{ fontSize: ts(5) }}>{v.label}</p>}
        </div>
      )
    case 'terms':
      return <p className="absolute inset-0 p-1 leading-tight text-gray-500 line-clamp-3 overflow-hidden" style={{ fontSize: ts(5.5) }}>{v.termsText}</p>
    case 'contactInfo':
      return (
        <div className="absolute inset-0 p-1 space-y-0.5 overflow-hidden">
          {section.items.rows?.map((r, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="uppercase text-gray-400" style={{ fontSize: ts(5.5) }}>{r.label || r.type}</span>
              <span className="font-medium text-gray-700 truncate" style={{ fontSize: ts(6) }}>{r.value || '—'}</span>
            </div>
          ))}
        </div>
      )
    case 'footerBranding':
      return (
        <div className="absolute inset-0 p-0.5 flex items-center justify-center gap-1 min-w-0">
          {v.logo && <img src={v.logo} alt="" className="w-3 h-3 object-contain shrink-0" onError={hideImg} />}
          <p className="font-semibold text-gray-600 truncate" style={{ fontSize: ts(6) }}>{v.tagline || 'MCOM'}</p>
        </div>
      )
    default:
      return null
  }
}

function CardCustomBlocks({ blocks, fontSize }: { blocks: CustomBlock[]; fontSize?: number }) {
  const scale = (fontSize ?? 100) / 100
  const ts = (px: number) => `${Math.round(px * scale)}px`
  return (
    <div className="shrink-0 z-10 mx-0.5 mb-0.5 rounded-[2px] bg-white/90 dark:bg-gray-900/85 px-0.5 py-0.5 space-y-0.5 overflow-hidden">
      {blocks.map(block => {
        const v = block.values
        switch (block.type) {
          case 'title': {
            const sizes: Record<string, number> = { Small: 7, Medium: 8, Large: 9, 'Extra Large': 10 }
            return (
              <p key={block.id} style={{ fontSize: ts(sizes[v.size] ?? 8) }} className={`${v.bold === 'true' ? 'font-bold' : 'font-semibold'} text-gray-800 dark:text-gray-100 truncate ${v.align === 'Center' ? 'text-center' : v.align === 'Right' ? 'text-right' : ''}`}>
                {v.text || 'Title'}
              </p>
            )
          }
          case 'text': {
            return (
              <p key={block.id} style={{ fontSize: ts(v.large === 'true' ? 8 : 7) }} className={`${v.bold === 'true' ? 'font-bold' : ''} ${v.italic === 'true' ? 'italic' : ''} text-gray-600 dark:text-gray-300 truncate ${v.align === 'Center' ? 'text-center' : v.align === 'Right' ? 'text-right' : ''}`}>
                {v.text || 'Your text here…'}
              </p>
            )
          }
          case 'paragraph':
            return (
              <p key={block.id} style={{ fontSize: ts(6.5) }} className={`leading-tight text-gray-500 dark:text-gray-400 line-clamp-2 ${v.align === 'Center' ? 'text-center' : v.align === 'Right' ? 'text-right' : ''}`}>
                {v.text || 'Your paragraph text goes here…'}
              </p>
            )
          case 'image':
            return (
              <div key={block.id} className={`${v.align === 'Center' ? 'flex justify-center' : v.align === 'Right' ? 'flex justify-end' : ''}`}>
                <div className={`${v.rounded === 'true' ? 'rounded-md' : 'rounded-[1px]'} w-14 h-9 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden`}>
                  {v.url ? (
                    <img src={v.url} alt="" className="w-full h-full object-cover" onError={hideImg} />
                  ) : (
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  )}
                </div>
                {v.caption && <p style={{ fontSize: ts(6) }} className="mt-0.5 text-gray-400 text-center truncate">{v.caption}</p>}
              </div>
            )
          case 'link':
            return (
              <p key={block.id} style={{ fontSize: ts(7) }} className="font-medium text-orange-600 underline underline-offset-2 truncate">
                {v.label || 'Link'}
              </p>
            )
          case 'button': {
            const solid = v.style === 'Solid' || !v.style
            return (
              <div key={block.id} className={`${v.align === 'Center' ? 'flex justify-center' : v.align === 'Right' ? 'flex justify-end' : ''}`}>
                <div style={{ fontSize: ts(7) }} className={`${v.full === 'true' ? 'w-full' : ''} h-4 px-1.5 rounded-[2px] flex items-center justify-center font-semibold ${solid ? 'bg-orange-500 text-white' : v.style === 'Ghost' ? 'text-orange-600' : 'border border-orange-400 text-orange-600'}`}>
                  <span className="truncate">{v.label || 'Button'}</span>
                </div>
              </div>
            )
          }
          case 'form': {
            const isSelect = v.answerType === 'Dropdown' || v.answerType === 'Single choice' || v.answerType === 'Multiple choice'
            return (
              <div key={block.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-[2px] p-0.5 space-y-0.5">
                <p style={{ fontSize: ts(7) }} className="font-semibold text-gray-700 dark:text-gray-200 truncate">
                  {v.question || 'Your question?'} {v.required === 'true' && <span className="text-red-400">*</span>}
                </p>
                {isSelect ? (
                  <div className="space-y-0.5">
                    {block.options.slice(0, 2).map((opt, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full border border-orange-300 dark:border-orange-500/40 shrink-0" />
                        <span style={{ fontSize: ts(6) }} className="text-gray-500 dark:text-gray-400 truncate">{opt}</span>
                      </div>
                    ))}
                  </div>
                ) : v.answerType === 'Rating' ? (
                  <div style={{ fontSize: ts(7) }} className="flex gap-0.5 text-orange-400">★★★★★</div>
                ) : (
                  <div className="h-3 rounded-[1px] border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800" />
                )}
              </div>
            )
          }
          case 'upload':
            return (
              <div key={block.id} className="border border-dashed border-gray-300 dark:border-gray-600 rounded-[2px] px-1 py-0.5 flex items-center gap-1">
                <svg className="w-2.5 h-2.5 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span style={{ fontSize: ts(6) }} className="text-gray-500 dark:text-gray-400 flex-1 truncate">{v.label || 'Upload a file'}</span>
                <span style={{ fontSize: ts(6) }} className="text-gray-400 shrink-0">{block.formats.join(', ')}</span>
              </div>
            )
          case 'divider':
            return (
              <div key={block.id} className={`${v.style === 'Dashed' ? 'border-t border-dashed' : v.style === 'Dotted' ? 'border-t border-dotted' : 'border-t'} border-gray-300 dark:border-gray-600`} />
            )
          case 'spacer':
            return <div key={block.id} className={v.height === 'Large' ? 'h-1.5' : v.height === 'Medium' ? 'h-1' : 'h-0.5'} />
          default:
            return null
        }
      })}
    </div>
  )
}

type DragHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const HANDLES: { id: DragHandle; cls: string; cursor: string }[] = [
  { id: 'nw', cls: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2', cursor: 'cursor-nwse-resize' },
  { id: 'n', cls: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2', cursor: 'cursor-ns-resize' },
  { id: 'ne', cls: 'top-0 right-0 translate-x-1/2 -translate-y-1/2', cursor: 'cursor-nesw-resize' },
  { id: 'e', cls: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2', cursor: 'cursor-ew-resize' },
  { id: 'se', cls: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2', cursor: 'cursor-nwse-resize' },
  { id: 's', cls: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2', cursor: 'cursor-ns-resize' },
  { id: 'sw', cls: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2', cursor: 'cursor-nesw-resize' },
  { id: 'w', cls: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2', cursor: 'cursor-ew-resize' },
]

export function LayoutFaceContent({ face, sections, interactive, selectable, selected, onSelect, onBeginDrag, ff }: {
  face: Face
  sections: CardSectionState[]
  interactive?: boolean
  selectable?: boolean
  selected?: string | null
  onSelect?: (uid: string) => void
  onBeginDrag?: (face: Face, uid: string, handle: DragHandle | 'move', e: ReactPointerEvent<HTMLDivElement>) => void
  ff?: FriendsFamilyConfig
}) {
  const bg = sections.find(s => s.schemaId === 'background')
  const bgColor = bg?.values.bgColor
  const from = bg?.values.gradientFrom || '#1e293b'
  const to = bg?.values.gradientTo || '#0f172a'
  const isBack = face === 'back'

  const ffBadge = !isBack && ff?.enabled && ff.showBadge

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${isBack ? 'bg-gradient-to-br from-slate-100 to-slate-200 text-gray-800' : 'text-white'}`}
      style={isBack ? undefined : bgColor ? { backgroundColor: bgColor } : { backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {!isBack && bg?.values.image && (
        <>
          <img src={bg.values.image} alt="" className="absolute inset-0 w-full h-full object-cover" onError={hideImg} />
          <div className="absolute inset-0 bg-black/40" />
        </>
      )}
      {sections.filter(s => s.enabled && s.schemaId !== 'background').map(s => {
        if (s.schemaId === 'rewardsProgress' && (s.values.display === 'None' || s.values.display === '')) return null
        if (s.schemaId === 'security' && s.values.hasSecurity !== 'true' && s.values.hasPassword !== 'true') return null
        const layout = s.layout ?? defaultLayout(s.schemaId)
        if (!layout) return null
        const isSel = interactive && selected === s.uid
        return (
          <div key={s.uid} className="absolute" style={{ left: `${layout.x}%`, top: `${layout.y}%`, width: `${layout.w}%`, height: `${layout.h}%` }}>
            <div className="absolute inset-0 overflow-hidden rounded-[2px] flex flex-col">
              <div className="flex-1 min-h-0 relative">
                <LayoutSectionContent section={s} />
              </div>
              {s.blocks && s.blocks.length > 0 && <CardCustomBlocks blocks={s.blocks} fontSize={s.fontSize} />}
            </div>
            {interactive && onBeginDrag && (
              <>
                <div
                  onPointerDown={e => { onSelect?.(s.uid); onBeginDrag(face, s.uid, 'move', e) }}
                  className={`absolute inset-0 rounded-[2px] cursor-move transition-shadow ${isSel ? 'ring-2 ring-orange-500 shadow-lg' : 'ring-1 ring-orange-400/50 hover:ring-orange-400'}`}
                  style={{ touchAction: 'none' }}
                />
                {isSel && (
                  <span className="absolute top-0 left-0 px-1.5 py-0.5 rounded bg-orange-500 text-white text-[7px] font-semibold whitespace-nowrap shadow z-30 pointer-events-none">
                    {s.name} · {Math.round(layout.w)} × {Math.round(layout.h)}%
                  </span>
                )}
                {isSel && (
                  <div className="absolute inset-0 pointer-events-none z-30">
                    {HANDLES.map(h => (
                      <div
                        key={h.id}
                        className={`absolute w-2.5 h-2.5 bg-orange-500 border border-white rounded-[2px] shadow z-30 ${h.cls} ${h.cursor}`}
                        style={{ touchAction: 'none', pointerEvents: 'auto' }}
                        onPointerDown={e => onBeginDrag(face, s.uid, h.id, e)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
            {selectable && onSelect && (
              <>
                <div
                  onPointerDown={e => { e.stopPropagation(); onSelect(s.uid) }}
                  className={`absolute inset-0 rounded-[2px] cursor-pointer transition-shadow ${isSel ? 'ring-2 ring-orange-500 shadow-lg' : 'ring-1 ring-orange-400/40 hover:ring-orange-400'}`}
                  style={{ touchAction: 'none' }}
                />
                {isSel && (
                  <span className="absolute top-0 left-0 px-1.5 py-0.5 rounded bg-orange-500 text-white text-[7px] font-semibold whitespace-nowrap shadow z-30 pointer-events-none flex items-center gap-1">
                    {s.name}
                  </span>
                )}
              </>
            )}
          </div>
        )
      })}

      {/* Friends & Family badge — decorative indicator on the card front */}
      {ffBadge && (
        <div className="absolute top-1 right-1 z-10 flex items-center gap-1 pointer-events-none">
          <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[6.5px] font-bold tracking-wide shadow-sm">
            {ff?.badgeLabel || 'F&F'}
          </span>
        </div>
      )}
    </div>
  )
}

function CardFrame({ face, sections, useLayout, ff }: { face: Face; sections: CardSectionState[]; useLayout?: boolean; ff?: FriendsFamilyConfig }) {
  const enabled = sections.filter(s => s.enabled)
  return (
    <div className="shrink-0">
      <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-1.5 bg-white dark:bg-gray-800 shadow-sm">
        <div className="relative w-[340px] aspect-[85/55] rounded-[10px] overflow-hidden shadow-lg">
          <CardFaceContent face={face} sections={enabled} useLayout={useLayout} ff={ff} />
          <div className="absolute inset-[12px] border border-dashed border-white/80 rounded-md pointer-events-none z-20" />
        </div>
      </div>
      <p className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-300 mt-1.5">{face === 'front' ? 'Front' : 'Back'}</p>
      <p className="text-center text-[9px] text-gray-400">85 × 55 mm · safe area (dashed)</p>
    </div>
  )
}

export function CardPreview({ faces, useLayout, ff }: { faces: CardFaces; useLayout?: boolean; ff?: FriendsFamilyConfig }) {
  const [view, setView] = useState<'front' | 'back' | 'print'>('front')
  return (
    <div>
      <div className="flex gap-1.5 mb-4">
        {(['front', 'back', 'print'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors capitalize ${view === v ? 'bg-orange-500 text-white' : 'bg-gray-50 dark:bg-gray-700/30 text-gray-600 dark:text-gray-300 hover:bg-gray-100'}`}>
            {v === 'print' ? 'Print Sheet' : v}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-6 items-start overflow-x-auto pb-2">
        {view !== 'back' && <CardFrame face="front" sections={faces.front} useLayout={useLayout} ff={ff} />}
        {view !== 'front' && <CardFrame face="back" sections={faces.back} useLayout={useLayout} ff={ff} />}
      </div>
      <div className="mt-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 p-3 text-[10px] text-gray-500 dark:text-gray-300">
        <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Print design file</p>
        <p>Card size: <span className="font-medium">85 × 55 mm</span> (8.5 × 5.5 cm). Supply the design file with a <span className="font-medium">3 mm bleed</span> on all edges — the dashed line marks the safe/trim area.</p>
        <p className="mt-1 text-[9px] text-gray-400">Export at 300 dpi (front and back), RGB or CMYK. No scrolling — this is a static, short card.</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Draggable / resizable Live Card Preview — used in the card         */
/*  template builder. Every enabled section gets a box you can drag    */
/*  to reposition and resize via 8 handles; layouts persist to the     */
/*  template via onLayoutChange.                                       */
/* ------------------------------------------------------------------ */

interface DragState {
  face: Face
  uid: string
  handle: DragHandle | 'move'
  startX: number
  startY: number
  pxW: number
  pxH: number
  start: CardSectionLayout
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export function EditableCardPreview({ faces, onLayoutChange }: {
  faces: CardFaces
  onLayoutChange: (face: Face, uid: string, layout: CardSectionLayout) => void
}) {
  const [drag, setDrag] = useState<DragState | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const layoutCb = useRef(onLayoutChange)
  layoutCb.current = onLayoutChange

  const beginDrag = (face: Face, uid: string, handle: DragHandle | 'move', e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const section = faces[face].find(s => s.uid === uid)
    if (!section) return
    const card = (e.currentTarget as HTMLElement).closest('[data-card]')
    const rect = card?.getBoundingClientRect()
    if (!rect) return
    const start = section.layout ?? defaultLayout(section.schemaId)
    if (!start) return
    setSelected(uid)
    setDrag({ face, uid, handle, startX: e.clientX, startY: e.clientY, pxW: rect.width, pxH: rect.height, start: { ...start } })
  }

  useEffect(() => {
    if (!drag) return
    const onMove = (e: PointerEvent) => {
      const dx = ((e.clientX - drag.startX) / drag.pxW) * 100
      const dy = ((e.clientY - drag.startY) / drag.pxH) * 100
      const s = drag.start
      const MIN = 6
      let x = s.x
      let y = s.y
      let w = s.w
      let h = s.h
      if (drag.handle === 'move') {
        x = clamp(s.x + dx, 0, 100 - s.w)
        y = clamp(s.y + dy, 0, 100 - s.h)
      } else {
        if (drag.handle.includes('e')) w = clamp(s.w + dx, MIN, 100 - s.x)
        if (drag.handle.includes('s')) h = clamp(s.h + dy, MIN, 100 - s.y)
        if (drag.handle.includes('w')) {
          const nx = clamp(s.x + dx, 0, 100 - MIN)
          w = clamp(s.w + (s.x - nx), MIN, 100 - nx)
          x = nx
        }
        if (drag.handle.includes('n')) {
          const ny = clamp(s.y + dy, 0, 100 - MIN)
          h = clamp(s.h + (s.y - ny), MIN, 100 - ny)
          y = ny
        }
        x = clamp(x, 0, 100 - w)
        y = clamp(y, 0, 100 - h)
      }
      layoutCb.current(drag.face, drag.uid, { x, y, w, h })
    }
    const onUp = () => setDrag(null)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [drag])

  const frame = (f: Face) => (
    <div className="shrink-0">
      <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-1.5 bg-white dark:bg-gray-800 shadow-sm">
        <div data-card className="relative w-[340px] aspect-[85/55] rounded-[10px] overflow-hidden shadow-lg select-none">
          <LayoutFaceContent face={f} sections={faces[f]} interactive selected={selected} onSelect={setSelected} onBeginDrag={beginDrag} />
          <div className="absolute inset-[12px] border border-dashed border-white/80 rounded-md pointer-events-none z-20" />
        </div>
      </div>
      <p className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-300 mt-1.5">{f === 'front' ? 'Front' : 'Back'}</p>
    </div>
  )

  return (
    <div>
      <div className="flex justify-center gap-6 items-start overflow-x-auto pb-2">
        {frame('front')}
        {frame('back')}
      </div>
      <p className="text-center text-[9px] text-gray-400 dark:text-gray-500 mt-2">
        Click a box to select it · drag the box to reposition · drag a corner or edge handle to resize · layout saves with the template.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Font-size design preview — used in the card template builder.      */
/*  Click any enabled section box to select it, then adjust its font   */
/*  size with the − / + stepper. Font size is a percentage (default    */
/*  100%) stored on the section and applied to every text element.     */
/* ------------------------------------------------------------------ */

const FONT_MIN = 50
const FONT_MAX = 200
const FONT_STEP = 10

export function DesignCardPreview({ faces, selected, onSelect, onFontSizeChange, ff }: {
  faces: CardFaces
  selected: string | null
  onSelect: (uid: string) => void
  onFontSizeChange: (face: Face, uid: string, fontSize: number) => void
  ff?: FriendsFamilyConfig
}) {
  const allSections = [...faces.front, ...faces.back]
  const sel = allSections.find(s => s.uid === selected) ?? null
  const fontSize = sel?.fontSize ?? 100

  const adjust = (delta: number) => {
    if (!sel) return
    const next = Math.min(FONT_MAX, Math.max(FONT_MIN, fontSize + delta))
    onFontSizeChange(sel.face, sel.uid, next)
  }

  const frame = (f: Face) => (
    <div className="shrink-0">
      <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-1.5 bg-white dark:bg-gray-800 shadow-sm">
        <div data-card className="relative w-[340px] aspect-[85/55] rounded-[10px] overflow-hidden shadow-lg select-none">
          <LayoutFaceContent face={f} sections={faces[f]} selectable selected={selected} onSelect={onSelect} ff={ff} />
          <div className="absolute inset-[12px] border border-dashed border-white/80 rounded-md pointer-events-none z-20" />
        </div>
      </div>
      <p className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-300 mt-1.5">{f === 'front' ? 'Front' : 'Back'}</p>
    </div>
  )

  return (
    <div>
      {sel ? (
        <div className="mb-3 rounded-xl border border-orange-200 dark:border-orange-500/30 bg-orange-50/60 dark:bg-orange-500/5 px-3 py-2.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-800 dark:text-white truncate">{sel.name}</p>
            <p className="text-[9px] text-gray-400">Font size · applies to all text in this section</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => adjust(-FONT_STEP)} disabled={fontSize <= FONT_MIN}
              className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-orange-400 disabled:opacity-30 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
            </button>
            <span className="w-14 text-center text-xs font-bold text-gray-900 dark:text-white">{fontSize}%</span>
            <button onClick={() => adjust(FONT_STEP)} disabled={fontSize >= FONT_MAX}
              className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-orange-400 disabled:opacity-30 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
            <button onClick={() => onFontSizeChange(sel.face, sel.uid, 100)} disabled={fontSize === 100}
              className="ml-1 px-2 py-1 rounded-lg text-[9px] font-semibold text-orange-600 border border-orange-200 dark:border-orange-500/40 hover:bg-orange-100 dark:hover:bg-orange-500/10 disabled:opacity-40">
              Reset
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-600 px-3 py-2.5 flex items-center gap-2 text-[10px] text-gray-400">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Click any design component on the card to select it and adjust its font size.
        </div>
      )}
      <div className="flex justify-center gap-6 items-start overflow-x-auto pb-2">
        {frame('front')}
        {frame('back')}
      </div>
      <p className="text-center text-[9px] text-gray-400 dark:text-gray-500 mt-2">
        Click a component to select it · use the stepper to increase or decrease its font size · size saves with the template.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Mock faces — representational preview for built-in templates that  */
/*  have not been created by a user in the card builder.               */
/* ------------------------------------------------------------------ */

const GRADIENTS: Record<string, [string, string]> = {
  Standard: ['#334155', '#0f172a'],
  Gold: ['#f59e0b', '#92400e'],
  Silver: ['#cbd5e1', '#64748b'],
  Platinum: ['#818cf8', '#4338ca'],
  Bronze: ['#d97706', '#78350f'],
  Technology: ['#0ea5e9', '#1e3a8a'],
  'Café': ['#a16207', '#451a03'],
  Hotel: ['#475569', '#1e293b'],
  Fitness: ['#10b981', '#064e3b'],
  'Real Estate': ['#f59e0b', '#7c2d12'],
  Barber: ['#ef4444', '#450a0a'],
  Consultant: ['#6366f1', '#312e81'],
  Retail: ['#ec4899', '#831843'],
  Legal: ['#1e40af', '#172554'],
  Summer: ['#fb923c', '#7c2d12'],
  Holiday: ['#f43f5e', '#881337'],
  Legacy: ['#94a3b8', '#475569'],
  Christmas: ['#16a34a', '#14532d'],
}
const DEFAULT_GRADIENT: [string, string] = ['#334155', '#0f172a']

function mockSection(face: Face, schemaId: string, name: string, values: Record<string, string> = {}, items: Record<string, Record<string, string>[]> = {}, enabled = true): CardSectionState {
  return { uid: `${schemaId}-mock`, face, schemaId, name, enabled, values, items, blocks: [] }
}

export interface MockFacesInput {
  name: string
  templateId: string
  cardType: 'business' | 'consumer'
  theme?: string
  membership?: string
  category?: string
  qrPosition?: string
  qrSize?: string
  hasSecurity?: boolean
  ffIndicator?: string
  progressDisplay?: string
}

export function buildMockFaces(input: MockFacesInput): CardFaces {
  const [from, to] = GRADIENTS[input.theme ?? ''] ?? DEFAULT_GRADIENT
  const label = input.membership || input.category || (input.cardType === 'consumer' ? 'Member' : 'Business')
  const progress = input.progressDisplay || 'None'
  const ffStyle = input.ffIndicator || 'None'
  const ffOn = ffStyle !== 'None' && ffStyle !== 'Hidden Until Allocated'

  return {
    front: [
      mockSection('front', 'background', 'Background', { gradientFrom: from, gradientTo: to }),
      mockSection('front', 'branding', 'Branding & Logo', { brandName: input.name, tagline: 'Member since 2025' }),
      mockSection('front', 'memberPhoto', 'Member Identity', { memberName: input.cardType === 'consumer' ? 'Jane Member' : 'Alex Business', membershipLabel: label }),
      mockSection('front', 'tierBadge', 'Membership Badge', { tier: input.theme || 'Standard', level: label, showIcon: 'true' }),
      mockSection('front', 'cardDetails', 'Card Details', {}, {
        rows: [
          { label: 'Card Number', value: '4000 0000 0000 0000' },
          { label: 'Member ID', value: input.templateId },
          { label: 'Expiry', value: '12/28' },
        ],
      }),
      mockSection('front', 'ffIndicator', 'Friends & Family', { indicator: ffStyle, count: '10' }, {}, ffOn),
      mockSection('front', 'qr', 'QR Code', { position: input.qrPosition || 'Bottom Right', size: input.qrSize || 'Medium', url: `https://vcard.mcom/c/${input.templateId}` }),
      mockSection('front', 'security', 'Security Features', { hasSecurity: input.hasSecurity ? 'true' : 'false', chipLabel: 'Secure Member' }),
      mockSection('front', 'rewardsProgress', 'Rewards Progress', { display: progress, current: '750', target: '1000' }, {}, progress !== 'None'),
    ],
    back: [
      mockSection('back', 'magneticStripe', 'Magnetic Stripe', { color: '#111827' }),
      mockSection('back', 'signature', 'Signature Line', { label: 'Authorized Signature' }),
      mockSection('back', 'terms', 'Terms & Instructions', { termsText: 'This card is property of MCOM. If found, please return to the issuing business or call support.' }),
      mockSection('back', 'contactInfo', 'Contact Info', {}, {
        rows: [
          { type: 'Website', label: 'Web', value: 'www.mcom.com' },
          { type: 'Phone', label: 'Support', value: '+1 (555) 010-1234' },
        ],
      }),
      mockSection('back', 'qr', 'QR Code', { url: `https://vcard.mcom/c/${input.templateId}`, size: 'Medium', heading: 'Scan to activate' }),
      mockSection('back', 'footerBranding', 'Footer Logo', { tagline: 'Powered by MCOM' }),
    ],
  }
}

/* ------------------------------------------------------------------ */
/*  Preview modal — used from the card template list pages.            */
/* ------------------------------------------------------------------ */

export function CardPreviewModal({ name, templateId, cardType, faces, badge, onEdit, onClose }: {
  name: string
  templateId: string
  cardType: 'business' | 'consumer'
  faces: CardFaces
  badge?: string
  onEdit?: () => void
  onClose: () => void
}) {
  const publicUrl = `https://preview.mcomvcard.com/c/${templateId}`
  const copyLink = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(publicUrl).then(() => toast.success('Public link copied')).catch(() => toast.success('Public link copied'))
    } else {
      toast.success('Public link copied')
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-gray-800 dark:text-white truncate">{name} — Card Template Preview</h4>
            <p className="text-[10px] text-gray-400">{templateId} · {badge ? `${badge} · ` : ''}{cardType === 'consumer' ? 'Consumer' : 'Business'} card · static, no scrolling</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <CardPreview faces={faces} />
        </div>
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
          <div className="rounded-xl border border-gray-200 dark:border-gray-600 p-3">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">Public template link</span>
              <button onClick={copyLink} className="text-[9px] text-orange-500 hover:underline">Copy</button>
            </div>
            <p className="text-[10px] text-gray-400 mb-2">Share this link so a business or consumer can preview and claim this template for their own card.</p>
            <div className="p-2 bg-gray-50 dark:bg-gray-700/30 rounded text-[9px] text-gray-500 font-mono break-all">{publicUrl}</div>
          </div>
          <div className="flex justify-end gap-2">
            {onEdit && (
              <button onClick={onEdit} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Edit in Builder</button>
            )}
            <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
