import type { StoredTemplate } from './vcardTemplateStore'
import { seasonName } from './catalogStore'

/* ------------------------------------------------------------------ */
/*  Business VCard template catalogue                                   */
/*  Single source of truth for platform Business VCard templates.       */
/*  Consumed by the admin pages and the public landing showcase.        */
/* ------------------------------------------------------------------ */

export interface BizVCardTemplate {
  id: number; name: string; templateId: string; version: string; description: string
  status: string; category: string; industry: string; country: string; language: string
  membershipSupport: string[]; businessesUsing: number; consumersReached: number
  qrScans: number; shares: number; exchanges: number; redeems: number
  dynamicQr: boolean; qrType: string; international: boolean; languages: string[]
  countries: string[]; lastUpdated: string; updatedBy: string
  createdBy: string; createdDate: string; tags: string[]
  brandId: string; affiliateId: string; isDefault: boolean
  features: string[]; owner: string; templateOwner: string
  usage: number; weeklyUsage: number; thumbnail: string
  season?: string
  sectors?: string[]
  customization?: string
}

export const BIZ_VCARD_TEMPLATES: BizVCardTemplate[] = []

/* Map a user-created (localStorage) template onto the full list shape so
   the workspace and table render it like any platform template. */
export function toBizTemplate(t: StoredTemplate): BizVCardTemplate {
  return {
    id: t.id,
    name: t.name,
    templateId: t.templateId,
    version: t.version.replace(/^v/i, ''),
    description: t.description,
    status: t.status,
    category: t.category,
    industry: t.industry,
    country: 'Global',
    language: 'English',
    membershipSupport: ['Bronze', 'Bronze Pro', 'Silver', 'Silver Pro', 'Gold', 'Gold Pro', 'Platinum', 'Platinum Pro', 'Platinum Pro+'],
    businessesUsing: t.status === 'Published' ? 1 : 0,
    consumersReached: 0,
    qrScans: 0,
    shares: 0,
    exchanges: 0,
    redeems: 0,
    dynamicQr: t.builder.sections.some(s => s.schemaId === 'qr' && s.enabled),
    qrType: 'Dynamic',
    international: false,
    languages: ['English'],
    countries: ['Global'],
    lastUpdated: t.lastUpdated,
    updatedBy: t.updatedBy,
    createdBy: t.createdBy,
    createdDate: t.createdDate,
    tags: ['user-created'],
    brandId: 'MCOM-BR-USER',
    affiliateId: 'AFF-USER',
    isDefault: false,
    features: ['Custom'],
    owner: 'You',
    templateOwner: 'You',
    usage: 0,
    weeklyUsage: 0,
    thumbnail: t.name.slice(0, 3),
    season: t.builder.seasons?.length ? t.builder.seasons.map(seasonName).join(', ') : undefined,
  }
}

/* Season carried by each platform template. Admin tags a template with the
   membership rules + season it is valid for; the business dashboard shows it
   so members can see which templates apply to their current season. */
const SEASON_OVERRIDES: Record<number, any> = {}

export function templateSeason(t: BizVCardTemplate): string {
  return t.season ?? SEASON_OVERRIDES[t.id] ?? 'All-Season'
}

/* A template can be suitable for MULTIPLE sectors (Henry: never lock a
   template to one profession). Each entry lists the sectors a template
   serves so the business sees every industry it applies to. */
const SECTOR_OVERRIDES: Record<number, any> = {}

export function templateSectors(t: BizVCardTemplate): string[] {
  if (t.sectors?.length) return t.sectors
  const m = SECTOR_OVERRIDES[t.id]
  return m?.length ? m : [t.industry]
}

/* Customization level — how much the business can adapt an Admin template
   before publishing (set by Admin in the template builder). */
const CUSTOMIZATION_OVERRIDES: Record<number, any> = {}

export function templateCustomization(t: BizVCardTemplate): string {
  return t.customization ?? CUSTOMIZATION_OVERRIDES[t.id] ?? 'Standard'
}

/* Platform catalogue + user-created stored templates, like the admin pages. */
export function combineBizTemplates(stored: StoredTemplate[]): BizVCardTemplate[] {
  return [
    ...BIZ_VCARD_TEMPLATES.filter(m => !stored.some(s => s.templateId === m.templateId)),
    ...stored.map(toBizTemplate),
  ]
}

/* ------------------------------------------------------------------ */
/*  Consumer VCard template catalogue                                   */
/*  Single source of truth for platform Consumer VCard templates.       */
/* ------------------------------------------------------------------ */

export interface ConTemplate {
  id: number; name: string; status: string; usage: number; consumers: number
  modified: string; levels: string; templateId: string
  version: string; description: string
  category: string; language: string; membershipSupport: string[]
  membersReached: number; qrScans: number; shares: number; exchanges: number; redeems: number; weeklyUsage: number
  createdBy: string; createdDate: string; updatedBy: string
  features: string[]; dynamicQr: boolean; qrType: string; international: boolean
}

export const CON_VCARD_TEMPLATES: ConTemplate[] = []

export function toConTemplate(t: StoredTemplate): ConTemplate {
  return {
    id: t.id,
    name: t.name,
    status: t.status,
    usage: t.status === 'Published' ? 1 : 0,
    consumers: 0,
    modified: t.lastUpdated,
    levels: 'All',
    templateId: t.templateId,
    version: t.version.replace(/^v/i, ''),
    description: t.description,
    category: t.category,
    language: 'English',
    membershipSupport: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    membersReached: 0,
    qrScans: 0,
    shares: 0,
    exchanges: 0,
    redeems: 0,
    weeklyUsage: 0,
    createdBy: t.createdBy,
    createdDate: t.createdDate,
    updatedBy: t.updatedBy,
    features: ['Membership Info', 'Share'],
    dynamicQr: t.builder.sections.some(s => s.schemaId === 'qr' && s.enabled),
    qrType: 'Dynamic',
    international: false,
  }
}

/* Platform catalogue + user-created stored templates, like the admin pages. */
export function combineConTemplates(stored: StoredTemplate[]): ConTemplate[] {
  return [
    ...CON_VCARD_TEMPLATES.filter(m => !stored.some(s => s.templateId === m.templateId)),
    ...stored.map(toConTemplate),
  ]
}
