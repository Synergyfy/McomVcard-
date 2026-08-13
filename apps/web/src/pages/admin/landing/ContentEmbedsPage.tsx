import { useState, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import type { LandingPageId } from '../../../services/landingSlides'
import {
  loadAllContentEmbeds,
  saveContentEmbed,
  deleteContentEmbed,
  type ContentEmbed,
  type EmbedType,
  type EmbedRegion,
  type EmbedPlacement,
} from '../../../services/contentEmbeds'

const PAGES: { id: LandingPageId; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'business', label: 'Business' },
  { id: 'consumer', label: 'Consumer' },
]

const REGIONS: { id: EmbedRegion; label: string }[] = [
  { id: 'hero', label: 'Hero / header area' },
  { id: 'body', label: 'Body (middle)' },
  { id: 'footer', label: 'Footer area' },
]

const PLACEMENTS: { id: EmbedPlacement; label: string }[] = [
  { id: 'top', label: 'Top (before section)' },
  { id: 'bottom', label: 'Bottom (after section)' },
]

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500'
const labelCls = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1'

function uid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `x${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function emptyEmbed(pageId: LandingPageId): ContentEmbed {
  return {
    id: uid(),
    pageId,
    label: '',
    type: 'iframe',
    region: 'body',
    placement: 'bottom',
    url: '',
    html: '',
    height: 480,
    enabled: true,
    order: loadAllContentEmbeds().filter((e) => e.pageId === pageId).length,
  }
}

export default function ContentEmbedsPage() {
  const [pageId, setPageId] = useState<LandingPageId>('business')
  const [embeds, setEmbeds] = useState<ContentEmbed[]>(() => loadAllContentEmbeds())

  const refresh = useCallback(() => {
    setEmbeds(loadAllContentEmbeds())
  }, [])

  const addEmbed = () => {
    saveContentEmbed(emptyEmbed(pageId))
    refresh()
    toast.success('Embed added')
  }

  const patchEmbed = (e: ContentEmbed, patch: Partial<ContentEmbed>) => {
    saveContentEmbed({ ...e, ...patch })
    refresh()
  }

  const moveEmbed = (e: ContentEmbed, dir: -1 | 1) => {
    const list = embeds.filter((x) => x.pageId === pageId).sort((a, b) => a.order - b.order)
    const idx = list.findIndex((x) => x.id === e.id)
    const swap = idx + dir
    if (swap < 0 || swap >= list.length) return
    const a = list[idx]
    const b = list[swap]
    const aOrder = a.order
    patchEmbed(a, { order: b.order })
    patchEmbed(b, { order: aOrder })
  }

  const pageEmbeds = embeds.filter((e) => e.pageId === pageId).sort((a, b) => a.order - b.order)

  return (
    <div>
      <Helmet><title>Content Embeds - Landing Pages - Mobile VCard Link</title></Helmet>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Embeds</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Pull external widgets into each MCOM VCard landing page without touching code. Changes apply instantly.
          </p>
        </div>
        <button onClick={addEmbed} className="px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700">
          + Add Embed
        </button>
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
            if (confirm(`Clear all content embeds for "${PAGES.find((p) => p.id === pageId)?.label}"?`)) {
              loadAllContentEmbeds().filter((e) => e.pageId === pageId).forEach((e) => deleteContentEmbed(e.id))
              refresh()
              toast.success('Embeds cleared')
            }
          }}
          className="ml-auto text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
        >
          Clear embeds
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-800/40 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
          Embeds let you pull external widgets — forms, feeds, calendars, tickers — into a landing page without editing code.
          Use <strong>URL</strong> for a live iframe (e.g. YouTube, Google Form) or <strong>HTML / JS</strong> to paste raw HTML +
          script that runs inside a sandboxed iframe on the page. Choose <strong>where on the page</strong> it appears (hero / body /
          footer) and its position within that area.
        </div>

        {pageEmbeds.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            No embeds configured for this landing page yet. Click "+ Add Embed" to pull in content.
          </div>
        )}

        {pageEmbeds.map((e, idx) => (
          <div key={e.id} className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden ${e.enabled ? 'border-gray-100 dark:border-gray-700' : 'border-dashed border-gray-200 dark:border-gray-600 opacity-70'}`}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center">
                  {idx + 1}
                </span>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{e.label || (e.type === 'iframe' ? e.url : 'HTML embed') || 'Untitled embed'}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => moveEmbed(e, -1)} disabled={idx === 0} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30" aria-label="Move up">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>
                <button onClick={() => moveEmbed(e, 1)} disabled={idx === pageEmbeds.length - 1} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30" aria-label="Move down">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <button
                  onClick={() => patchEmbed(e, { enabled: !e.enabled })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    e.enabled
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {e.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this embed?')) {
                      deleteContentEmbed(e.id)
                      refresh()
                      toast.success('Embed deleted')
                    }
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600"
                  aria-label="Delete embed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Section title (optional)</label>
                <input className={inputCls} value={e.label} onChange={(ev) => patchEmbed(e, { label: ev.target.value })} placeholder="Partner offers" />
              </div>
              <div>
                <label className={labelCls}>Where on the page</label>
                <select className={inputCls} value={e.region} onChange={(ev) => patchEmbed(e, { region: ev.target.value as EmbedRegion })}>
                  {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Position within area</label>
                <select className={inputCls} value={e.placement} onChange={(ev) => patchEmbed(e, { placement: ev.target.value as EmbedPlacement })}>
                  {PLACEMENTS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Type</label>
                  <select className={inputCls} value={e.type} onChange={(ev) => patchEmbed(e, { type: ev.target.value as EmbedType })}>
                    <option value="iframe">URL (iframe)</option>
                    <option value="html">HTML / JS</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Height (px)</label>
                  <input className={inputCls} type="number" min={160} value={e.height} onChange={(ev) => patchEmbed(e, { height: Number(ev.target.value) || 480 })} />
                </div>
              </div>
              {e.type === 'iframe' ? (
                <div className="md:col-span-2">
                  <label className={labelCls}>Source URL</label>
                  <input className={inputCls} value={e.url} onChange={(ev) => patchEmbed(e, { url: ev.target.value })} placeholder="https://www.youtube.com/embed/..." />
                </div>
              ) : (
                <div className="md:col-span-2">
                  <label className={labelCls}>Raw HTML / JS (rendered inside a sandboxed iframe)</label>
                  <textarea
                    className={`${inputCls} resize-none font-mono text-xs`}
                    rows={7}
                    value={e.html}
                    onChange={(ev) => patchEmbed(e, { html: ev.target.value })}
                    placeholder={'<div style="text-align:center;padding:24px">\n  <h2>Your widget</h2>\n  <script>…</script>\n</div>'}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        <button onClick={addEmbed} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
          + Add another embed
        </button>
      </div>
    </div>
  )
}
