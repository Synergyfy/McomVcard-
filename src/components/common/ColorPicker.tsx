import { useRef, useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Full-featured colour picker — hex / RGB / HSL inputs, a draggable  */
/*  saturation-brightness area, a hue slider and a swatch palette.     */
/*  Value is always reported back as a hex string like '#1e293b'.      */
/* ------------------------------------------------------------------ */

export interface Hsv { h: number; s: number; v: number }

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export function hexToHsv(hex: string): Hsv {
  const { r, g, b } = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 }
  return rgbToHsv(r, g, b)
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let h = (hex || '').trim().replace(/^#/, '')
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null
  const n = parseInt(h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

export function rgbToHsv(r: number, g: number, b: number): Hsv {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === rn) h = 60 * (((gn - bn) / d) % 6)
    else if (max === gn) h = 60 * ((bn - rn) / d + 2)
    else h = 60 * ((rn - gn) / d + 4)
  }
  if (h < 0) h += 360
  const s = max === 0 ? 0 : d / max
  return { h, s, v: max }
}

export function hsvToRgb({ h, s, v }: Hsv): { r: number; g: number; b: number } {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else { r = c; b = x }
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 }
}

function hsvToHsl({ h, s, v }: Hsv): { h: number; s: number; l: number } {
  const l = v * (1 - s / 2)
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l)
  return { h, s: sl, l }
}

function hslToHsv(h: number, s: number, l: number): Hsv {
  const v = l + s * Math.min(l, 1 - l)
  const sv = v === 0 ? 0 : 2 * (1 - l / v)
  return { h, s: sv, v }
}

const PRESETS = [
  '#111827', '#334155', '#1e293b', '#0f172a', '#000000',
  '#7c3aed', '#2563eb', '#059669', '#b91c1c', '#ea580c',
  '#0d9488', '#f59e0b', '#ec4899', '#6366f1', '#ffffff', '#f3f4f6',
]

const inputCls = 'w-full border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400'

export default function ColorPicker({ value, onChange, presets = PRESETS }: {
  value: string
  onChange: (v: string) => void
  presets?: string[]
}) {
  const init = hexToHsv(value)
  const [hsv, setHsv] = useState<Hsv>(init)
  const [mode, setMode] = useState<'hex' | 'rgb' | 'hsl'>('hex')
  const [hexText, setHexText] = useState(value || '#000000')
  const svRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<null | 'sv' | 'hue'>(null)

  const apply = (next: Hsv) => {
    setHsv(next)
    const { r, g, b } = hsvToRgb(next)
    const hex = rgbToHex(r, g, b)
    setHexText(hex)
    onChange(hex)
  }

  const updateFromHex = (text: string) => {
    setHexText(text)
    const rgb = hexToRgb(text)
    if (rgb) apply(rgbToHsv(rgb.r, rgb.g, rgb.b))
  }

  const svToHsv = (clientX: number, clientY: number): Hsv => {
    const el = svRef.current
    if (!el) return hsv
    const rect = el.getBoundingClientRect()
    const s = clamp((clientX - rect.left) / rect.width, 0, 1)
    const v = 1 - clamp((clientY - rect.top) / rect.height, 0, 1)
    return { h: hsv.h, s, v }
  }

  const hueToHsv = (clientY: number): Hsv => {
    const el = hueRef.current
    if (!el) return hsv
    const rect = el.getBoundingClientRect()
    const h = clamp(((clientY - rect.top) / rect.height) * 360, 0, 360)
    return { h, s: hsv.s, v: hsv.v }
  }

  const onMove = (e: React.PointerEvent) => {
    if (dragging === 'sv') apply(svToHsv(e.clientX, e.clientY))
    else if (dragging === 'hue') apply(hueToHsv(e.clientY))
  }

  const rgb = hsvToRgb(hsv)
  const hsl = hsvToHsl(hsv)
  const markerX = hsv.s * 100
  const markerY = (1 - hsv.v) * 100

  return (
    <div className="space-y-2.5 select-none">
      {/* Saturation / brightness + hue */}
      <div className="flex gap-2.5">
        <div
          ref={svRef}
          className="relative flex-1 h-24 rounded-lg overflow-hidden cursor-crosshair touch-none"
          style={{ background: `linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))` }}
          onPointerDown={e => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setDragging('sv'); apply(svToHsv(e.clientX, e.clientY)) }}
          onPointerMove={onMove}
          onPointerUp={() => setDragging(null)}
          onPointerCancel={() => setDragging(null)}
        >
          <div
            className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${markerX}%`, top: `${markerY}%` }}
          />
        </div>
        <div
          ref={hueRef}
          className="relative w-5 h-24 rounded-lg overflow-hidden cursor-ns-resize touch-none"
          style={{ background: 'linear-gradient(to bottom, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
          onPointerDown={e => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setDragging('hue'); apply(hueToHsv(e.clientY)) }}
          onPointerMove={onMove}
          onPointerUp={() => setDragging(null)}
          onPointerCancel={() => setDragging(null)}
        >
          <div
            className="absolute left-0 right-0 h-1.5 bg-white border border-gray-300 rounded-sm -translate-y-1/2 pointer-events-none"
            style={{ top: `${(hsv.h / 360) * 100}%` }}
          />
        </div>
      </div>

      {/* Mode tabs + inputs */}
      <div className="flex gap-1">
        {(['hex', 'rgb', 'hsl'] as const).map(m => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`px-2 py-1 rounded-md text-[9px] font-semibold uppercase transition-colors ${mode === m ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
            {m}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-md border border-gray-200 dark:border-gray-600 shadow-inner" style={{ background: hexText }} />
          <span className="text-[9px] font-mono text-gray-500 dark:text-gray-400">{hexText}</span>
        </div>
      </div>

      {mode === 'hex' && (
        <div>
          <label className="block text-[9px] font-medium text-gray-400 mb-1">Hex code</label>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 text-xs">#</span>
            <input
              value={hexText.replace(/^#/, '')}
              onChange={e => updateFromHex(`#${e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)}`)}
              className={`${inputCls} font-mono`}
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {mode === 'rgb' && (
        <div className="grid grid-cols-3 gap-2">
          {(['r', 'g', 'b'] as const).map(k => (
            <div key={k}>
              <label className="block text-[9px] font-medium text-gray-400 mb-1 uppercase">{k}</label>
              <input
                type="number" min={0} max={255}
                value={Math.round(k === 'r' ? rgb.r : k === 'g' ? rgb.g : rgb.b)}
                onChange={e => {
                  const v = clamp(Number(e.target.value) || 0, 0, 255)
                  apply(rgbToHsv(k === 'r' ? v : rgb.r, k === 'g' ? v : rgb.g, k === 'b' ? v : rgb.b))
                }}
                className={inputCls}
              />
            </div>
          ))}
        </div>
      )}

      {mode === 'hsl' && (
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[9px] font-medium text-gray-400 mb-1 uppercase">H°</label>
            <input type="number" min={0} max={360} value={Math.round(hsl.h)}
              onChange={e => apply(hslToHsv(clamp(Number(e.target.value) || 0, 0, 360), hsl.s, hsl.l))} className={inputCls} />
          </div>
          <div>
            <label className="block text-[9px] font-medium text-gray-400 mb-1 uppercase">S%</label>
            <input type="number" min={0} max={100} value={Math.round(hsl.s * 100)}
              onChange={e => apply(hslToHsv(hsl.h, clamp(Number(e.target.value) || 0, 0, 100) / 100, hsl.l))} className={inputCls} />
          </div>
          <div>
            <label className="block text-[9px] font-medium text-gray-400 mb-1 uppercase">L%</label>
            <input type="number" min={0} max={100} value={Math.round(hsl.l * 100)}
              onChange={e => apply(hslToHsv(hsl.h, hsl.s, clamp(Number(e.target.value) || 0, 0, 100) / 100))} className={inputCls} />
          </div>
        </div>
      )}

      {/* Swatches */}
      <div className="flex flex-wrap gap-1.5">
        {presets.map(c => (
          <button key={c} type="button" title={c}
            onClick={() => updateFromHex(c)}
            className="w-5 h-5 rounded-md border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform shadow-sm"
            style={{ background: c }} />
        ))}
      </div>
    </div>
  )
}
