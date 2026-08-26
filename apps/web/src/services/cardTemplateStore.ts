/* ------------------------------------------------------------------ */
/*  User-created Card (physical, short) templates                       */
/*  A card template has a FRONT and a BACK face, each with its own set */
/*  of configurable sections. Persisted in localStorage.               */
/* ------------------------------------------------------------------ */

export interface CardSectionLayout {
  x: number
  y: number
  w: number
  h: number
}

export type CustomBlockType =
  | 'title'
  | 'text'
  | 'paragraph'
  | 'image'
  | 'link'
  | 'button'
  | 'form'
  | 'upload'
  | 'divider'
  | 'spacer'

export interface CustomBlock {
  id: number
  type: CustomBlockType
  values: Record<string, string>
  options: string[]
  formats: string[]
}

export interface CardSectionState {
  uid: string
  face: 'front' | 'back'
  schemaId: string
  name: string
  enabled: boolean
  values: Record<string, string>
  items: Record<string, Record<string, string>[]>
  blocks: CustomBlock[]
  layout?: CardSectionLayout
  fontSize?: number
}

export interface CardFaces {
  front: CardSectionState[]
  back: CardSectionState[]
}

/* ------------------------------------------------------------------ */
/*  Friends & Family — a capability layer every card template can      */
/*  support. The builder assigns the capabilities; the engine enforces */
/*  the rules.                                                         */
/* ------------------------------------------------------------------ */

export const FF_TIER_GROUPS: { tier: string; variants: string[] }[] = [
  { tier: 'Bronze', variants: ['Bronze', 'Bronze Pro', 'Bronze Pro+'] },
  { tier: 'Silver', variants: ['Silver', 'Silver Pro', 'Silver Pro+'] },
  { tier: 'Gold', variants: ['Gold', 'Gold Pro', 'Gold Pro+'] },
  { tier: 'Platinum', variants: ['Platinum', 'Platinum Pro', 'Platinum Pro+'] },
]
export const FF_TIERS: string[] = FF_TIER_GROUPS.flatMap(g => g.variants)

export interface FriendsFamilyConfig {
  enabled: boolean
  tiers: string[]
  allocations: Record<string, number | null>
  showBadge: boolean
  badgeLabel: string
  walletEnabled: boolean
  giftCardsEnabled: boolean
  giftCardAmounts: Record<string, number>
  cashbackEnabled: boolean
}

export function defaultFriendsFamily(): FriendsFamilyConfig {
  return {
    enabled: false,
    tiers: [],
    allocations: {
      Bronze: 2, 'Bronze Pro': 4, 'Bronze Pro+': 6,
      Silver: 5, 'Silver Pro': 10, 'Silver Pro+': 15,
      Gold: 10, 'Gold Pro': 20, 'Gold Pro+': 30,
      Platinum: 20, 'Platinum Pro': 40, 'Platinum Pro+': 60,
    },
    showBadge: true,
    badgeLabel: 'F&F',
    walletEnabled: true,
    giftCardsEnabled: true,
    giftCardAmounts: {
      Bronze: 1, 'Bronze Pro': 2, 'Bronze Pro+': 3,
      Silver: 5, 'Silver Pro': 7, 'Silver Pro+': 10,
      Gold: 15, 'Gold Pro': 20, 'Gold Pro+': 25,
      Platinum: 30, 'Platinum Pro': 40, 'Platinum Pro+': 50,
    },
    cashbackEnabled: false,
  }
}

export function summarizeFfTiers(tiers: string[]): string {
  if (!tiers.length) return 'None'
  if (FF_TIERS.every(t => tiers.includes(t))) return 'All tiers'
  const parts: string[] = []
  for (const g of FF_TIER_GROUPS) {
    const sel = g.variants.filter(v => tiers.includes(v))
    if (sel.length === 0) continue
    if (sel.length === g.variants.length) parts.push(g.tier)
    else parts.push(...sel)
  }
  return parts.join(', ')
}

export function normalizeFriendsFamily(config: FriendsFamilyConfig): FriendsFamilyConfig {
  const defaults = defaultFriendsFamily()
  const allocations = FF_TIERS.reduce<Record<string, number | null>>((acc, t) => {
    acc[t] = config.allocations?.[t] ?? defaults.allocations[t]
    return acc
  }, {})
  const giftCardAmounts = FF_TIERS.reduce<Record<string, number>>((acc, t) => {
    acc[t] = config.giftCardAmounts?.[t] ?? defaults.giftCardAmounts[t]
    return acc
  }, {})
  return { ...defaults, ...config, allocations, giftCardAmounts }
}

export interface StoredCardTemplate {
  id: number
  templateId: string
  name: string
  version: string
  description: string
  status: 'Published' | 'Draft' | 'Archived'
  cardType: 'business' | 'consumer'
  category: string
  qrPosition: string
  qrSize: string
  hasSecurity: boolean
  ffIndicator: string
  progressDisplay: string
  theme: string
  cardSize: { widthMm: number; heightMm: number; bleedMm: number }
  lastUpdated: string
  createdDate: string
  updatedBy: string
  createdBy: string
  builder: { templateName: string; faces: CardFaces; friendsFamily?: FriendsFamilyConfig; sectors?: string[]; seasons?: string[] }
}

const KEY = 'mcom_card_templates'

export function loadCardTemplates(): StoredCardTemplate[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function loadCardTemplatesByType(type: 'business' | 'consumer'): StoredCardTemplate[] {
  return loadCardTemplates().filter(t => t.cardType === type)
}

export function getCardTemplate(id: number): StoredCardTemplate | undefined {
  return loadCardTemplates().find(t => t.id === id)
}

function persist(list: StoredCardTemplate[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* ignore quota errors */
  }
}

export function nextCardTemplateId(): number {
  const max = loadCardTemplates().reduce((m, t) => Math.max(m, t.id), 15)
  return max + 1
}

export function nextCardTemplateNumber(prefix: string): string {
  const list = loadCardTemplates()
  const nums = list
    .map(t => (t.templateId.startsWith(prefix) ? parseInt(t.templateId.replace(prefix, ''), 10) : 0))
    .filter(n => !Number.isNaN(n))
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `${prefix}${String(next).padStart(6, '0')}`
}

export function upsertCardTemplate(input: StoredCardTemplate) {
  const list = loadCardTemplates()
  const i = list.findIndex(t => t.id === input.id)
  if (i >= 0) list[i] = input
  else list.unshift(input)
  persist(list)
  return input
}

export function archiveCardTemplate(id: number) {
  persist(loadCardTemplates().map(t => (t.id === id ? { ...t, status: 'Archived' as const } : t)))
}

export function deleteCardTemplate(id: number) {
  persist(loadCardTemplates().filter(t => t.id !== id))
}
