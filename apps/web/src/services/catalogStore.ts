/* ------------------------------------------------------------------ */
/*  Sectors & Seasons — admin-managed catalogues that card and vcard   */
/*  template builders reference. Sectors group cards into business     */
/*  segments; Seasons carry start/end dates so cards can show a live   */
/*  countdown while a season is active. Persisted in localStorage.     */
/* ------------------------------------------------------------------ */

export interface Sector {
  id: string
  name: string
  color: string
  description?: string
  createdAt: string
}

export interface Season {
  id: string
  name: string
  startDate: string
  endDate: string
  color: string
  description?: string
  createdAt: string
}

const SECTOR_KEY = 'mcom_sectors'
const SEASON_KEY = 'mcom_seasons'

function readList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeList<T>(key: string, list: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list))
  } catch {
    /* ignore quota errors */
  }
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1000).toString(36)}`
}

/* ------------------------------------------------------------------ */
/*  Sectors                                                            */
/* ------------------------------------------------------------------ */

export function loadSectors(): Sector[] {
  return readList<Sector>(SECTOR_KEY)
}

export function getSector(id: string): Sector | undefined {
  return loadSectors().find(s => s.id === id)
}

export function sectorName(id: string): string {
  return getSector(id)?.name ?? id
}

export function upsertSector(input: Sector): Sector {
  const list = loadSectors()
  const idx = list.findIndex(s => s.id === input.id)
  if (idx >= 0) list[idx] = input
  else list.unshift(input)
  writeList(SECTOR_KEY, list)
  return input
}

export function newSector(): Sector {
  return { id: uid('sec'), name: '', color: '#F97316', description: '', createdAt: new Date().toISOString() }
}

export function deleteSector(id: string) {
  writeList(SECTOR_KEY, loadSectors().filter(s => s.id !== id))
}

/* ------------------------------------------------------------------ */
/*  Seasons                                                            */
/* ------------------------------------------------------------------ */

export function getSeason(id: string): Season | undefined {
  return loadSeasons().find(s => s.id === id)
}

export function seasonName(id: string): string {
  return getSeason(id)?.name ?? id
}

export function upsertSeason(input: Season): Season {
  const list = loadSeasons()
  const idx = list.findIndex(s => s.id === input.id)
  if (idx >= 0) list[idx] = input
  else list.unshift(input)
  writeList(SEASON_KEY, list)
  return input
}

export function newSeason(): Season {
  return { id: uid('sea'), name: '', startDate: '', endDate: '', color: '#F97316', description: '', createdAt: new Date().toISOString() }
}

export function deleteSeason(id: string) {
  writeList(SEASON_KEY, loadSeasons().filter(s => s.id !== id))
}

/* Default seasons seeded on first load so the vcard countdown shows a live
   active season out of the box. Deleting all seasons keeps them removed. */
const DEFAULT_SEASONS: Season[] = [
  {
    id: 'sea-summer-2026',
    name: 'Summer Season 2026',
    startDate: '2026-06-01',
    endDate: '2026-09-30',
    color: '#F97316',
    description: 'Peak summer campaign window.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sea-holidays-2026',
    name: 'Holiday Season 2026',
    startDate: '2026-11-20',
    endDate: '2027-01-05',
    color: '#0EA5E9',
    description: 'Festive holiday campaign window.',
    createdAt: new Date().toISOString(),
  },
]

export function loadSeasons(): Season[] {
  let raw: string | null = null
  try { raw = localStorage.getItem(SEASON_KEY) } catch { /* ignore */ }
  if (raw === null) {
    try { localStorage.setItem(SEASON_KEY, JSON.stringify(DEFAULT_SEASONS)) } catch { /* ignore */ }
    return DEFAULT_SEASONS
  }
  return readList<Season>(SEASON_KEY)
}

/* ------------------------------------------------------------------ */
/*  Season helpers                                                     */
/* ------------------------------------------------------------------ */

export function seasonStatus(s: Season, now = new Date()): 'upcoming' | 'active' | 'ended' {
  const start = new Date(s.startDate).getTime()
  const end = new Date(s.endDate).getTime()
  const t = now.getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 'upcoming'
  if (t < start) return 'upcoming'
  if (t > end) return 'ended'
  return 'active'
}

/* First currently-active season from the given id list, else undefined. */
export function activeSeason(seasonIds: string[], now = new Date()): Season | undefined {
  const ids = seasonIds.filter(Boolean)
  if (ids.length === 0) return undefined
  const all = loadSeasons()
  return all.find(s => ids.includes(s.id) && seasonStatus(s, now) === 'active')
}

/* Split a comma-separated season id list (stored on countdown sections). */
export function splitSeasonIds(raw?: string): string[] {
  return (raw ?? '').split(',').map(s => s.trim()).filter(Boolean)
}
