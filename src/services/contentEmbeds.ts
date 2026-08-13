/* ------------------------------------------------------------------ */
/*  Landing page content embeds.                                       */
/*                                                                     */
/*  Each landing page can pull in third-party content without touching */
/*  the codebase: a live URL (rendered in an <iframe>) or raw HTML /   */
/*  JS (rendered inside a sandboxed <iframe srcDoc> so scripts run in  */
/*  isolation). Admins add/edit/reorder embeds from the admin Landing  */
/*  Page editor — everything is persisted to localStorage.             */
/*                                                                     */
/*  Because embed content is stored as data, a whole library of        */
/*  widgets (forms, feeds, calendars, tickers) can be brought in and   */
/*  updated from the admin without a deploy.                           */
/* ------------------------------------------------------------------ */

import type { LandingPageId } from './landingSlides'

export type EmbedType = 'iframe' | 'html'

/* Where on the landing page the embed is rendered. */
export type EmbedRegion = 'hero' | 'body' | 'footer'
/* Vertical placement within that region. */
export type EmbedPlacement = 'top' | 'bottom'

export interface ContentEmbed {
  id: string
  pageId: LandingPageId
  /* Admin-facing label, shown as the section heading on the landing  */
  /* page when a title is desired.                                     */
  label: string
  type: EmbedType
  /* Which part of the landing page this embed appears in.             */
  region: EmbedRegion
  /* Position within the region.                                       */
  placement: EmbedPlacement
  /* Live URL for 'iframe' embeds.                                     */
  url: string
  /* Raw HTML / JS for 'html' embeds, rendered via <iframe srcDoc>.   */
  html: string
  /* Rendered height in px (defaults to 480).                          */
  height: number
  enabled: boolean
  order: number
}

function uid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `e${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/* ── Persistence ──────────────────────────────────────────────────── */

const KEY = 'mcom_landing_embeds'

function normalizeEmbed(raw: any): ContentEmbed | null {
  if (!raw || typeof raw !== 'object') return null
  const page = raw.pageId
  if (page !== 'general' && page !== 'business' && page !== 'consumer') return null
  const type: EmbedType = raw.type === 'html' ? 'html' : 'iframe'
  const region: EmbedRegion = raw.region === 'body' || raw.region === 'footer' ? raw.region : 'hero'
  const placement: EmbedPlacement = raw.placement === 'bottom' ? 'bottom' : 'top'
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : uid(),
    pageId: page,
    label: typeof raw.label === 'string' ? raw.label : '',
    type,
    region,
    placement,
    url: type === 'iframe' && typeof raw.url === 'string' ? raw.url : '',
    html: type === 'html' && typeof raw.html === 'string' ? raw.html : '',
    height: Math.max(160, Number(raw.height) || 480),
    enabled: raw.enabled !== false,
    order: Number(raw.order) || 0,
  }
}

export function loadContentEmbeds(pageId: LandingPageId): ContentEmbed[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed : []
    return list
      .map(normalizeEmbed)
      .filter((e): e is ContentEmbed => e !== null && e.pageId === pageId && e.enabled)
      .sort((a, b) => a.order - b.order)
  } catch {
    return []
  }
}

export function loadAllContentEmbeds(): ContentEmbed[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed : []
    return list
      .map(normalizeEmbed)
      .filter((e): e is ContentEmbed => e !== null)
      .sort((a, b) => a.order - b.order)
  } catch {
    return []
  }
}

export function saveContentEmbed(embed: ContentEmbed) {
  const all = loadAllContentEmbeds()
  const idx = all.findIndex((e) => e.id === embed.id)
  const next = idx >= 0 ? all.map((e) => (e.id === embed.id ? embed : e)) : [...all, embed]
  persist(next)
}

export function deleteContentEmbed(embedId: string) {
  persist(loadAllContentEmbeds().filter((e) => e.id !== embedId))
}

export function resetContentEmbeds() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

function persist(all: ContentEmbed[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    /* ignore quota errors */
  }
}
