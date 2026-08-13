import { useState, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import {
  loadAllLandingSlides,
  saveLandingSlide,
  deleteLandingSlide,
  resetLandingSlides,
  resetAllLandingSlides,
  type LandingPageId,
  type LandingSlide,
  type SlideMediaType,
  type SlideTheme,
} from '../../../services/landingSlides'

const PAGES: { id: LandingPageId; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'business', label: 'Business' },
  { id: 'consumer', label: 'Consumer' },
]

const THEMES: { id: SlideTheme; label: string }[] = [
  { id: 'orange', label: 'Orange / Purple' },
  { id: 'blue', label: 'Blue / Indigo' },
  { id: 'purple', label: 'Purple / Fuchsia' },
]

const MEDIA_TYPES: { id: SlideMediaType; label: string }[] = [
  { id: 'vector', label: 'Animated vector illustration' },
  { id: 'image', label: 'Image' },
  { id: 'gif', label: 'GIF / animated image' },
  { id: 'video', label: 'Video' },
]

const IMAGE_KEYS: { id: LandingPageId | ''; label: string }[] = [
  { id: '', label: 'None' },
  { id: 'general', label: 'General illustration' },
  { id: 'business', label: 'Business illustration' },
  { id: 'consumer', label: 'Consumer illustration' },
]

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500'
const labelCls = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1'

/* Rough cap for assets stored in localStorage (base64 inflates ~33%). */
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

function uid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `x${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function emptySlide(pageId: LandingPageId): LandingSlide {
  const count = loadAllLandingSlides()[pageId].length
  return {
    id: uid(),
    badge: 'New slide',
    title: '',
    titleAccent: '',
    description: '',
    ctaLabel: '',
    ctaTo: '',
    secondaryLabel: '',
    secondaryTo: '',
    mediaType: 'vector',
    imageKey: pageId,
    imageUrl: '',
    theme: pageId === 'business' ? 'blue' : pageId === 'consumer' ? 'purple' : 'orange',
    enabled: true,
    order: count,
  }
}

export default function HeroSlidersPage() {
  const [pageId, setPageId] = useState<LandingPageId>('business')
  const [slides, setSlides] = useState<Record<LandingPageId, LandingSlide[]>>(() => loadAllLandingSlides())

  const refresh = useCallback(() => {
    setSlides(loadAllLandingSlides())
  }, [])

  const patchSlide = (s: LandingSlide, patch: Partial<LandingSlide>) => {
    const next = { ...s, ...patch }
    saveLandingSlide(pageId, next)
    refresh()
  }

  const moveSlide = (s: LandingSlide, dir: -1 | 1) => {
    const list = slides[pageId].slice().sort((a, b) => a.order - b.order)
    const idx = list.findIndex((x) => x.id === s.id)
    const swap = idx + dir
    if (swap < 0 || swap >= list.length) return
    const a = list[idx]
    const b = list[swap]
    const aOrder = a.order
    patchSlide(a, { order: b.order })
    patchSlide(b, { order: aOrder })
  }

  const addSlide = () => {
    saveLandingSlide(pageId, emptySlide(pageId))
    refresh()
    toast.success('Slide added')
  }

  const pageSlides = slides[pageId].slice().sort((a, b) => a.order - b.order)

  return (
    <div>
      <Helmet><title>Hero Sliders - Landing Pages - Mobile VCard Link</title></Helmet>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hero Sliders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure the hero carousel for each MCOM VCard landing page. Changes apply instantly — no code changes required.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm(`Reset "${PAGES.find((p) => p.id === pageId)?.label}" slides to defaults?`)) {
                resetLandingSlides(pageId)
                refresh()
                toast.success('Slides reset to defaults')
              }
            }}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Reset Sliders
          </button>
          <button onClick={addSlide} className="px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700">
            + Add Slide
          </button>
        </div>
      </div>

      {/* Landing page selector */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Landing page</span>
        {PAGES.map((p) => (
          <button
            key={p.id}
            onClick={() => setPageId(p.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pageId === p.id
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => {
            if (confirm('Reset ALL landing pages to default slides?')) {
              resetAllLandingSlides()
              refresh()
              toast.success('All slides reset to defaults')
            }
          }}
          className="ml-auto text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
        >
          Reset all pages
        </button>
      </div>

      <div className="space-y-6">
        {pageSlides.map((s, idx) => (
          <div
            key={s.id}
            className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden ${s.enabled ? 'border-gray-100 dark:border-gray-700' : 'border-dashed border-gray-200 dark:border-gray-600 opacity-70'}`}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.badge || 'Untitled slide'}</p>
                  <p className="text-xs text-gray-400">Order {s.order} · {s.theme}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => moveSlide(s, -1)} disabled={idx === 0} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30" aria-label="Move up">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>
                <button onClick={() => moveSlide(s, 1)} disabled={idx === pageSlides.length - 1} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30" aria-label="Move down">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <button
                  onClick={() => patchSlide(s, { enabled: !s.enabled })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    s.enabled
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {s.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this slide?')) {
                      deleteLandingSlide(pageId, s.id)
                      refresh()
                      toast.success('Slide deleted')
                    }
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600"
                  aria-label="Delete slide"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Badge (pill)</label>
                <input className={inputCls} value={s.badge} onChange={(e) => patchSlide(s, { badge: e.target.value })} placeholder="For businesses" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Theme</label>
                  <select className={inputCls} value={s.theme} onChange={(e) => patchSlide(s, { theme: e.target.value as SlideTheme })}>
                    {THEMES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Order</label>
                  <input className={inputCls} type="number" min={0} value={s.order} onChange={(e) => patchSlide(s, { order: Number(e.target.value) || 0 })} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Heading (plain text)</label>
                <input className={inputCls} value={s.title} onChange={(e) => patchSlide(s, { title: e.target.value })} placeholder="Your customers' card." />
              </div>
              <div>
                <label className={labelCls}>Heading accent (gradient)</label>
                <input className={inputCls} value={s.titleAccent} onChange={(e) => patchSlide(s, { titleAccent: e.target.value })} placeholder="Your rewards. Your brand." />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Description</label>
                <textarea className={`${inputCls} resize-none`} rows={3} value={s.description} onChange={(e) => patchSlide(s, { description: e.target.value })} placeholder="Short supporting paragraph." />
              </div>
              <div>
                <label className={labelCls}>Primary CTA label</label>
                <input className={inputCls} value={s.ctaLabel || ''} onChange={(e) => patchSlide(s, { ctaLabel: e.target.value })} placeholder="Start Your Business" />
              </div>
              <div>
                <label className={labelCls}>Primary CTA link</label>
                <input className={inputCls} value={s.ctaTo || ''} onChange={(e) => patchSlide(s, { ctaTo: e.target.value })} placeholder="/register" />
              </div>
              <div>
                <label className={labelCls}>Secondary CTA label</label>
                <input className={inputCls} value={s.secondaryLabel || ''} onChange={(e) => patchSlide(s, { secondaryLabel: e.target.value })} placeholder="Learn more" />
              </div>
              <div>
                <label className={labelCls}>Secondary CTA link</label>
                <input className={inputCls} value={s.secondaryTo || ''} onChange={(e) => patchSlide(s, { secondaryTo: e.target.value })} placeholder="/features/business" />
              </div>
              <div>
                <label className={labelCls}>Media type</label>
                <select className={inputCls} value={s.mediaType} onChange={(e) => {
                  const mt = e.target.value as SlideMediaType
                  patchSlide(s, mt === 'vector' ? { mediaType: mt, imageUrl: '' } : { mediaType: mt, imageKey: undefined })
                }}>
                  {MEDIA_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Asset source</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept={s.mediaType === 'video' ? 'video/*' : s.mediaType === 'gif' ? 'image/gif' : 'image/*'}
                    className="hidden"
                    id={`upload-${s.id}`}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      e.target.value = ''
                      if (!file) return
                      if (file.size > MAX_UPLOAD_BYTES) {
                        toast.error('File too large — max 8MB (assets are stored in browser storage). Use a hosted URL for bigger media.')
                        return
                      }
                      try {
                        const dataUrl = await readFileAsDataUrl(file)
                        const mt: SlideMediaType = file.type.startsWith('video/') ? 'video' : file.type === 'image/gif' ? 'gif' : 'image'
                        patchSlide(s, { mediaType: mt, imageKey: undefined, imageUrl: dataUrl })
                        toast.success('Asset uploaded')
                      } catch {
                        toast.error('Could not read the selected file')
                      }
                    }}
                  />
                  <label htmlFor={`upload-${s.id}`} className="shrink-0 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold cursor-pointer hover:bg-blue-700 text-center">
                    Upload file
                  </label>
                  <button
                    onClick={() => patchSlide(s, { mediaType: 'vector', imageUrl: '', imageKey: pageId })}
                    className="shrink-0 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Reset to vector
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Pick an image, GIF or video from your device. Stored in browser storage.</p>
              </div>
              {s.mediaType === 'vector' ? (
                <div>
                  <label className={labelCls}>Illustration</label>
                  <select className={inputCls} value={s.imageKey || ''} onChange={(e) => patchSlide(s, { imageKey: (e.target.value as LandingPageId) || undefined })}>
                    {IMAGE_KEYS.map((k) => <option key={k.id || 'none'} value={k.id}>{k.label}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className={labelCls}>{s.mediaType === 'video' ? 'Video URL' : 'Asset URL'}</label>
                  <input className={inputCls} value={s.imageUrl || ''} onChange={(e) => patchSlide(s, { imageUrl: e.target.value })} placeholder={s.mediaType === 'video' ? 'https://...mp4' : 'https://... or pasted base64'} />
                </div>
              )}
              {s.mediaType !== 'vector' && s.imageUrl && (
                <div className="md:col-span-2">
                  <label className={labelCls}>Preview</label>
                  {s.mediaType === 'video' ? (
                    <video src={s.imageUrl} muted controls loop className="w-full max-h-60 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-900" />
                  ) : (
                    <img src={s.imageUrl} alt="" className="w-full max-h-60 object-contain rounded-xl border border-gray-200 dark:border-gray-700" />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        <button onClick={addSlide} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
          + Add another slide
        </button>
      </div>
    </div>
  )
}
