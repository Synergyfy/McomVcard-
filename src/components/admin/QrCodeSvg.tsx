import { useMemo } from 'react'
import QRCode from 'qrcode'

/* ------------------------------------------------------------------ */
/*  Real, scannable QR code renderer.                                  */
/*  Encodes the given value (URL) with the `qrcode` library and draws  */
/*  the actual module matrix, so a phone scanning it opens the link.   */
/*  Style options: square | rounded | dots | diamond | leaf            */
/* ------------------------------------------------------------------ */

export default function QrCodeSvg({ value, fg = '#111827', bg = '#ffffff', style = 'square', logo = '', sizeClass = 'w-20 h-20', className = '' }: {
  value?: string
  fg?: string
  bg?: string
  style?: string
  logo?: string
  sizeClass?: string
  className?: string
}) {
  /* Section values default to '' — treat empty fg/bg as the defaults so
     the QR never renders black-on-black (invisible). */
  const fgColor = fg || '#111827'
  const bgColor = bg || '#ffffff'

  const qr = useMemo(() => {
    try {
      return QRCode.create(value || 'https://vcard.mcom/b/this-card', {
        errorCorrectionLevel: 'M',
      })
    } catch {
      return null
    }
  }, [value])

  const rounded = style === 'rounded' || style === 'leaf'
  const dots = style === 'dots' || style === 'leaf'
  const diamond = style === 'diamond'
  const rx = rounded ? 0.3 : 0

  if (!qr) {
    return (
      <div className={`relative ${sizeClass} ${className}`}>
        <div className="w-full h-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-900">
          <span className="text-[8px] text-gray-400 px-2 text-center">Invalid QR value</span>
        </div>
      </div>
    )
  }

  const size = qr.modules.size
  const quiet = 4 /* quiet-zone modules — required for reliable scanning */
  const viewSize = size + quiet * 2
  const cells: { x: number; y: number; finder: boolean }[] = []
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!qr.modules.get(r, c)) continue
      /* Finder patterns must stay solid squares so phones recognize the QR. */
      const inFinder = (r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8)
      cells.push({ x: c + quiet, y: r + quiet, finder: inFinder })
    }
  }

  const moduleShape = (x: number, y: number, finder: boolean) => {
    if (finder) {
      return <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={fgColor} />
    }
    if (diamond) {
      return (
        <rect key={`${x}-${y}`} x={x + 0.15} y={y + 0.15} width="0.7" height="0.7" fill={fgColor}
          transform={`rotate(45 ${x + 0.5} ${y + 0.5})`} />
      )
    }
    if (dots) {
      return <circle key={`${x}-${y}`} cx={x + 0.5} cy={y + 0.5} r={0.45} fill={fgColor} />
    }
    return <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" rx={rx} fill={fgColor} />
  }

  return (
    <div className={`relative ${sizeClass} ${className}`}>
      <svg viewBox={`0 0 ${viewSize} ${viewSize}`} className="w-full h-full" shapeRendering="crispEdges" style={{ color: fgColor }}>
        <rect width={viewSize} height={viewSize} fill={bgColor} />
        {cells.map(({ x, y, finder }) => moduleShape(x, y, finder))}
      </svg>

      {/* Center logo */}
      {logo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[26%] h-[26%] rounded-[8px] flex items-center justify-center overflow-hidden shadow-sm" style={{ background: bgColor }}>
            <img src={logo} alt="" className="w-full h-full object-contain" onError={e => { e.currentTarget.style.display = 'none' }} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  High-res PNG export — renders the same matrix to a canvas so the   */
/*  admin can download the ready-to-print QR.                          */
/* ------------------------------------------------------------------ */

export async function qrToPng(value: string, opts: { fg?: string; bg?: string; style?: string; logo?: string; scale?: number }): Promise<string> {
  const qr = QRCode.create(value || 'https://vcard.mcom/b/this-card', { errorCorrectionLevel: 'M' })
  const size = qr.modules.size
  const quiet = 4
  const scale = opts.scale ?? 12
  const px = (size + quiet * 2) * scale
  const canvas = document.createElement('canvas')
  canvas.width = px
  canvas.height = px
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  const fg = opts.fg || '#111827'
  const bg = opts.bg || '#ffffff'
  const style = opts.style ?? 'square'
  const rounded = style === 'rounded' || style === 'leaf'
  const dots = style === 'dots' || style === 'leaf'
  const diamond = style === 'diamond'

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, px, px)
  ctx.fillStyle = fg

  const drawModule = (x: number, y: number, finder: boolean) => {
    const pxX = x * scale
    const pxY = y * scale
    if (finder) {
      ctx.fillRect(pxX, pxY, scale, scale)
      return
    }
    if (diamond) {
      ctx.save()
      ctx.translate(pxX + scale / 2, pxY + scale / 2)
      ctx.rotate(Math.PI / 4)
      ctx.fillRect(-scale * 0.35, -scale * 0.35, scale * 0.7, scale * 0.7)
      ctx.restore()
      return
    }
    if (dots) {
      ctx.beginPath()
      ctx.arc(pxX + scale / 2, pxY + scale / 2, scale * 0.45, 0, Math.PI * 2)
      ctx.fill()
      return
    }
    const r = rounded ? scale * 0.3 : 0
    if (r > 0) {
      ctx.beginPath()
      ctx.roundRect(pxX, pxY, scale, scale, r)
      ctx.fill()
    } else {
      ctx.fillRect(pxX, pxY, scale, scale)
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!qr.modules.get(r, c)) continue
      const inFinder = (r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8)
      drawModule(c + quiet, r + quiet, inFinder)
    }
  }

  /* Center logo on top */
  if (opts.logo) {
    const logoSize = px * 0.26
    const lx = (px - logoSize) / 2
    const ly = (px - logoSize) / 2
    await new Promise<void>(resolve => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.fillStyle = bg
        ctx.beginPath()
        ctx.roundRect(lx - scale, ly - scale, logoSize + scale * 2, logoSize + scale * 2, scale * 2)
        ctx.fill()
        ctx.drawImage(img, lx, ly, logoSize, logoSize)
        resolve()
      }
      img.onerror = () => resolve()
      img.src = opts.logo!
    })
  }

  return canvas.toDataURL('image/png')
}
