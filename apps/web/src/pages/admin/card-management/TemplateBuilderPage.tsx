import { useState, useRef, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { upsertTemplate, nextTemplateId, nextTemplateNumber, getUserTemplate, type StoredTemplate } from '../../../services/vcardTemplateStore'
import ScrollingVCard from '../../../components/common/ScrollingVCard'
import QrCodeSvg from '../../../components/admin/QrCodeSvg'
import { CountdownSectionBody, SeasonCountdown } from '../../../components/admin/SeasonCountdown'
import { loadSectors, loadSeasons, type Sector, type Season } from '../../../services/catalogStore'
import { DEFAULT_QR_CUSTOMIZATION, setQrCustomization, consumeQrCustomization, saveBuilderDraft, loadBuilderDraft, clearBuilderDraft } from '../../../services/qrCustomizerStore'

const TEMPLATE_TYPES = [
  { id: 'business' as const, label: 'Business VCard' },
  { id: 'consumer' as const, label: 'Consumer VCard' },
]

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type FieldType = 'text' | 'textarea' | 'image' | 'select' | 'toggle' | 'list'

interface ItemFieldDef {
  key: string
  label: string
  type: FieldType
  options?: string[]
  placeholder?: string
  optional?: boolean
}

interface FieldDef {
  key: string
  label: string
  type: FieldType
  options?: string[]
  placeholder?: string
  itemFields?: ItemFieldDef[]
  itemLabel?: string
  optional?: boolean
}

type CentreId = 'header' | 'share' | 'exchange' | 'redeem' | 'other'

interface SectionDef {
  id: string
  name: string
  icon: string
  desc: string
  fields: FieldDef[]
  centre?: CentreId
}

type CustomBlockType =
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

interface CustomBlockField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'toggle' | 'image'
  options?: string[]
  placeholder?: string
}

interface CustomBlockDef {
  type: CustomBlockType
  name: string
  icon: string
  desc: string
  fields: CustomBlockField[]
  hasOptions?: boolean
  hasFormats?: boolean
}

interface CustomBlock {
  id: number
  type: CustomBlockType
  values: Record<string, string>
  options: string[]
  formats: string[]
}

export interface SectionState {
  uid: string
  schemaId: string
  name: string
  enabled: boolean
  values: Record<string, string>
  items: Record<string, Record<string, string>[]>
  blocks: CustomBlock[]
  fontSize?: number
  centre?: string
}

/* ------------------------------------------------------------------ */
/*  Centre metadata — groups sections into Share / Exchange / Redeem   */
/*  centres so the VCard clearly serves the 3 core actions.            */
/* ------------------------------------------------------------------ */

interface CentreDef {
  id: CentreId
  name: string
  icon: string
  desc: string
  accent: string
}

export const CENTRES: CentreDef[] = [
  {
    id: 'header',
    name: 'Header',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    desc: 'Top of card — countdown, banner and profile',
    accent: 'gray',
  },
  {
    id: 'share',
    name: 'Share Centre',
    icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
    desc: 'What customers see and share — phone, email, social, website, brochure, location and more. Sharing should never require unnecessary restrictions.',
    accent: 'blue',
  },
  {
    id: 'exchange',
    name: 'Exchange Centre',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    desc: 'Where businesses exchange value — vouchers, coupons, offers, products, services and bartering, linked to MCOM Rewards, MCOM Mall and more.',
    accent: 'amber',
  },
  {
    id: 'redeem',
    name: 'Redeem Centre',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    desc: 'Where businesses let customers redeem rewards — cashback, loyalty points, gift cards, seasonal and campaign rewards.',
    accent: 'green',
  },
  {
    id: 'other',
    name: 'More Sections',
    icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
    desc: 'Additional sections — services, gallery, products, hours and more',
    accent: 'gray',
  },
]

const CENTRE_ACCENT: Record<string, { bg: string; text: string; border: string; dot: string; headerBg: string }> = {
  gray: { bg: 'bg-gray-50 dark:bg-gray-700/30', text: 'text-gray-600 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-600', dot: 'bg-gray-400', headerBg: 'bg-gray-100 dark:bg-gray-700/50' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/30', dot: 'bg-blue-500', headerBg: 'bg-blue-100 dark:bg-blue-500/20' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/30', dot: 'bg-amber-500', headerBg: 'bg-amber-100 dark:bg-amber-500/20' },
  green: { bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-500/30', dot: 'bg-green-500', headerBg: 'bg-green-100 dark:bg-green-500/20' },
}

/* Render order for the centres on the Content step and in the live preview. */
export const CENTRE_ORDER: CentreId[] = ['header', 'share', 'exchange', 'redeem', 'other']

/* Compact labels for the "Move to" centre dropdown on each section. */
const CENTRE_SHORT: Record<CentreId, string> = {
  header: 'Header',
  share: 'Share',
  exchange: 'Exchange',
  redeem: 'Redeem',
  other: 'More',
}

/* ------------------------------------------------------------------ */
/*  Centre configuration — per-centre name, visibility, title size,    */
/*  password. Lives in builder state alongside sections so each centre */
/*  can be toggled, renamed, titled on the card and password-locked.   */
/* ------------------------------------------------------------------ */

type CentreContentMode = 'items' | 'webhook' | 'link' | 'integration'

export interface CentreContentItem {
  image?: string
  title?: string
  description?: string
  price?: string
  value?: string
  linkLabel?: string
  linkUrl?: string
  [key: string]: string | undefined
}

export interface CentreConfig {
  id: string
  name: string
  enabled: boolean
  showTitle: boolean
  fontSize: number
  password: string
  hint: string
  lockedMessage: string
  /* Per-centre content source — keeps each centre rich and never empty. */
  contentMode: CentreContentMode
  contentTitle: string
  items: CentreContentItem[]
  webhookUrl: string
  description: string
  linkLabel: string
  linkUrl: string
  integrationPlatform: string
  integrationEnabled: boolean
}

/* Theme-appropriate defaults per centre so each centre is never empty:
   Redeem → redeemable rewards with Redeem links; Exchange → tradeable
   products/services with Exchange links; Share → optional featured content. */
const CENTRE_DEFAULT_CONTENT: Record<string, { contentTitle: string; items: CentreContentItem[] }> = {
  exchange: {
    contentTitle: 'What we exchange',
    items: [
      { image: '', title: 'Premium Package', description: 'Our most popular bundle — trade your points for it.', price: '$49', linkLabel: 'Exchange', linkUrl: 'https://mcom.example/exchange/premium' },
      { image: '', title: 'Basic Package', description: 'Everything you need to start.', price: '$19', linkLabel: 'Exchange', linkUrl: 'https://mcom.example/exchange/basic' },
      { image: '', title: 'Gift Card $25', description: 'Redeemable at any MCOM partner store.', price: '$25', linkLabel: 'Exchange now', linkUrl: 'https://mcom.example/exchange/giftcard' },
      { image: '', title: 'Voucher Bundle', description: 'A bundle of partner vouchers.', value: '500 pts', linkLabel: 'Trade', linkUrl: 'https://mcom.example/exchange/vouchers' },
    ],
  },
  redeem: {
    contentTitle: 'Redeem your rewards',
    items: [
      { image: '', title: 'Cashback 5%', description: 'Get 5% cashback on your next purchase.', value: '500 pts', linkLabel: 'Redeem now', linkUrl: 'https://mcom.example/redeem/cashback' },
      { image: '', title: 'Loyalty Points', description: 'Convert your loyalty points to credit.', value: '1,000 pts', linkLabel: 'Redeem points', linkUrl: 'https://mcom.example/redeem/loyalty' },
      { image: '', title: 'Seasonal Gift Card', description: 'Limited-time gift card for the festive season.', price: '$20', linkLabel: 'Redeem now', linkUrl: 'https://mcom.example/redeem/giftcard' },
      { image: '', title: 'Birthday Coupon', description: 'A special coupon for your birthday month.', value: '15% off', linkLabel: 'Claim', linkUrl: 'https://mcom.example/redeem/birthday' },
    ],
  },
  share: {
    contentTitle: 'Featured content',
    items: [
      { image: '', title: 'Welcome Offer', description: 'Enjoy a welcome discount when you visit us.', value: '10% off', linkLabel: 'Learn more', linkUrl: 'https://example.com/welcome' },
    ],
  },
}

export function buildDefaultCentreConfigs(): Record<string, CentreConfig> {
  const make = (id: string, name: string, showTitle: boolean, contentTitle = '', items: CentreContentItem[] = []): CentreConfig => ({
    id,
    name,
    enabled: true,
    showTitle,
    fontSize: 170,
    password: '',
    hint: '',
    lockedMessage: '',
    contentMode: 'items',
    contentTitle,
    items,
    webhookUrl: '',
    description: '',
    linkLabel: 'Learn more',
    linkUrl: '',
    integrationPlatform: '',
    integrationEnabled: false,
  })
  return {
    header: make('header', 'Header', false),
    share: make('share', 'Share Centre', true, CENTRE_DEFAULT_CONTENT.share.contentTitle, CENTRE_DEFAULT_CONTENT.share.items),
    exchange: make('exchange', 'Exchange Centre', true, CENTRE_DEFAULT_CONTENT.exchange.contentTitle, CENTRE_DEFAULT_CONTENT.exchange.items),
    redeem: make('redeem', 'Redeem Centre', true, CENTRE_DEFAULT_CONTENT.redeem.contentTitle, CENTRE_DEFAULT_CONTENT.redeem.items),
    other: make('other', 'More Sections', false),
  }
}

function mergeCentreConfigs(stored?: { id: string; name: string; enabled: boolean; showTitle: boolean; fontSize: number; password: string; hint: string; lockedMessage: string; contentMode?: string; contentTitle?: string; items?: CentreContentItem[]; webhookUrl?: string; description?: string; linkLabel?: string; linkUrl?: string; integrationPlatform?: string; integrationEnabled?: boolean }[]) {
  const base = buildDefaultCentreConfigs()
  if (!stored || !Array.isArray(stored)) return base
  for (const c of stored) {
    if (!c || !c.id) continue
    const def = base[c.id]
    base[c.id] = {
      id: c.id,
      name: c.name ?? def?.name ?? c.id,
      enabled: c.enabled ?? true,
      showTitle: c.showTitle ?? def?.showTitle ?? false,
      fontSize: c.fontSize ?? def?.fontSize ?? 170,
      password: c.password ?? '',
      hint: c.hint ?? '',
      lockedMessage: c.lockedMessage ?? '',
      contentMode: (c.contentMode as CentreContentMode) ?? def?.contentMode ?? 'items',
      contentTitle: c.contentTitle ?? def?.contentTitle ?? '',
      items: Array.isArray(c.items) && c.items.length > 0 ? c.items : (def?.items ?? []),
      webhookUrl: c.webhookUrl ?? '',
      description: c.description ?? '',
      linkLabel: c.linkLabel ?? 'Learn more',
      linkUrl: c.linkUrl ?? '',
      integrationPlatform: c.integrationPlatform ?? '',
      integrationEnabled: c.integrationEnabled ?? false,
    }
  }
  return base
}

/* ------------------------------------------------------------------ */
/*  Section schema — mirrors the classic vcard1 template anatomy       */
/* ------------------------------------------------------------------ */

export const SECTIONS: SectionDef[] = [
  {
    id: 'countdown',
    name: 'Season Countdown',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    desc: 'Live countdown to the end of an active season — shown above the banner',
    fields: [
      { key: 'seasonIds', label: 'Seasons', type: 'text', optional: true },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Season ends in', optional: true },
      { key: 'color', label: 'Accent color', type: 'text', placeholder: '#F97316', optional: true },
    ],
  },
  {
    id: 'banner',
    name: 'Banner',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    desc: 'Cover image shown at the top of the card',
    fields: [
      { key: 'image', label: 'Banner image', type: 'image', placeholder: 'https://example.com/banner.jpg' },
    ],
  },
  {
    id: 'profile',
    name: 'Profile',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    desc: 'Avatar, name, designation and short description',
    fields: [
      { key: 'avatar', label: 'Profile picture', type: 'image', placeholder: 'https://example.com/avatar.jpg' },
      { key: 'name', label: 'Full name', type: 'text', placeholder: 'John Smith' },
      { key: 'designation', label: 'Designation / title', type: 'text', placeholder: 'Owner' },
      { key: 'description', label: 'Short description', type: 'textarea', placeholder: 'Welcome to my business…' },
    ],
  },
  {
    id: 'social',
    name: 'Social Icons',
    icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    desc: 'Social media links shown under the profile',
    fields: [
      {
        key: 'links',
        label: 'Social links',
        type: 'list',
        itemLabel: 'Social link',
        itemFields: [
          { key: 'platform', label: 'Platform', type: 'select', options: ['Facebook', 'Instagram', 'LinkedIn', 'WhatsApp', 'Twitter / X', 'YouTube', 'TikTok', 'Telegram', 'Other'] },
          { key: 'url', label: 'Profile URL', type: 'text', placeholder: 'https://facebook.com/username' },
        ],
      },
    ],
  },
  {
    id: 'contacts',
    name: 'Contact Cards',
    icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    desc: 'Quick info cards — email, birthday, phone, location…',
    fields: [
      {
        key: 'cards',
        label: 'Contact cards',
        type: 'list',
        itemLabel: 'Contact card',
        itemFields: [
          { key: 'type', label: 'Type', type: 'select', options: ['Email', 'Birthday', 'Phone', 'Location', 'Website', 'Address', 'Other'] },
          { key: 'label', label: 'Label', type: 'text', placeholder: 'Email' },
          { key: 'value', label: 'Value', type: 'text', placeholder: 'hello@example.com' },
        ],
      },
    ],
  },
  {
    id: 'appointment',
    name: 'Make an Appointment',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    desc: 'Date & time booking widget',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', placeholder: 'Make an Appointment' },
      { key: 'button', label: 'Button text', type: 'text', placeholder: 'Request Appointment' },
    ],
  },
  {
    id: 'services',
    name: 'Our Services',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    desc: 'List of services with descriptions',
    fields: [
      {
        key: 'items',
        label: 'Services',
        type: 'list',
        itemLabel: 'Service',
        itemFields: [
          { key: 'icon', label: 'Icon (emoji)', type: 'text', placeholder: '✂️' },
          { key: 'title', label: 'Title', type: 'text', placeholder: 'Hair Styling' },
          { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Short description…' },
        ],
      },
    ],
  },
  {
    id: 'gallery',
    name: 'Gallery',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    desc: 'Image slider with lightbox',
    fields: [
      {
        key: 'images',
        label: 'Gallery images',
        type: 'list',
        itemLabel: 'Image',
        itemFields: [
          { key: 'url', label: 'Image', type: 'image', placeholder: 'https://example.com/photo.jpg' },
        ],
      },
    ],
  },
  {
    id: 'products',
    name: 'Products',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    desc: 'Product cards with image, price and description',
    fields: [
      {
        key: 'items',
        label: 'Products',
        type: 'list',
        itemLabel: 'Product',
        itemFields: [
          { key: 'image', label: 'Product image', type: 'image', placeholder: 'https://example.com/product.jpg' },
          { key: 'title', label: 'Title', type: 'text', placeholder: 'Premium Package' },
          { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Short description…' },
          { key: 'price', label: 'Price', type: 'text', placeholder: '$49' },
        ],
      },
    ],
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    desc: 'Client reviews carousel',
    fields: [
      {
        key: 'items',
        label: 'Testimonials',
        type: 'list',
        itemLabel: 'Testimonial',
        itemFields: [
          { key: 'avatar', label: 'Avatar', type: 'image', placeholder: 'https://example.com/avatar.jpg' },
          { key: 'name', label: 'Name', type: 'text', placeholder: 'Jane Doe' },
          { key: 'role', label: 'Role', type: 'text', placeholder: 'Happy customer' },
          { key: 'quote', label: 'Quote', type: 'textarea', placeholder: 'Amazing service!' },
        ],
      },
    ],
  },
  {
    id: 'blog',
    name: 'Blog',
    icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9',
    desc: 'Latest articles carousel',
    fields: [
      {
        key: 'items',
        label: 'Posts',
        type: 'list',
        itemLabel: 'Post',
        itemFields: [
          { key: 'image', label: 'Post image', type: 'image', placeholder: 'https://example.com/post.jpg' },
          { key: 'title', label: 'Title', type: 'text', placeholder: '5 tips for your business' },
          { key: 'date', label: 'Date', type: 'text', placeholder: 'Jan 15, 2026' },
          { key: 'excerpt', label: 'Excerpt', type: 'textarea', placeholder: 'Short preview…' },
        ],
      },
    ],
  },
  {
    id: 'qr',
    name: 'QR Code',
    icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z',
    desc: 'Dynamic QR code — generate, upload or let the user upload',
    fields: [
      { key: 'qrMode', label: 'QR generation', type: 'select', options: ['Generate by System', 'Upload from File', 'Allow User Upload'] },
      { key: 'heading', label: 'Heading', type: 'text', placeholder: 'Scan my QR Code' },
      { key: 'qrType', label: 'What the QR does', type: 'select', options: ['Open this VCard', 'Business Profile', 'Campaign', 'Membership Page', 'Custom Link', 'Download vCard'], optional: true },
      { key: 'qrDestination', label: 'Destination', type: 'text', placeholder: 'https://…', optional: true },
      { key: 'qrPosition', label: 'Position on card', type: 'select', options: ['Left', 'Right', 'Center'] },
      { key: 'qrSize', label: 'Size', type: 'select', options: ['Small', 'Medium', 'Large', 'Extra Large'] },
      { key: 'qrDynamic', label: 'Dynamic content', type: 'toggle', optional: true },
      { key: 'qrImage', label: 'QR image', type: 'image', placeholder: 'Upload a QR image…', optional: true },
      { key: 'qrColor', label: 'QR color', type: 'text', placeholder: '#111827', optional: true },
      { key: 'qrBgColor', label: 'QR background', type: 'text', placeholder: '#ffffff', optional: true },
      { key: 'qrLogo', label: 'QR logo', type: 'image', placeholder: 'Logo in the middle…', optional: true },
      { key: 'qrStyle', label: 'QR shape', type: 'select', options: ['square', 'rounded', 'dots', 'diamond', 'leaf'], optional: true },
    ],
  },
  {
    id: 'hours',
    name: 'Business Hours',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    desc: 'Weekly opening times',
    fields: [
      {
        key: 'days',
        label: 'Days',
        type: 'list',
        itemLabel: 'Day',
        itemFields: [
          { key: 'day', label: 'Day', type: 'select', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
          { key: 'hours', label: 'Hours', type: 'text', placeholder: '9:00 AM – 5:00 PM' },
          { key: 'closed', label: 'Closed', type: 'toggle' },
        ],
      },
    ],
  },
  {
    id: 'contactForm',
    name: 'Contact Form',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    desc: 'Contact us form with message',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', placeholder: 'Contact Us' },
      { key: 'button', label: 'Button text', type: 'text', placeholder: 'Send Message' },
    ],
  },
  {
    id: 'share',
    name: 'Download & Share',
    icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
    desc: 'Save contact, download vCard and share buttons',
    fields: [
      { key: 'downloadLabel', label: 'Download label', type: 'text', placeholder: 'Download Vcard' },
      { key: 'shareLabel', label: 'Share label', type: 'text', placeholder: 'Share' },
    ],
  },
  {
    id: 'map',
    name: 'Map',
    icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
    desc: 'Embedded Google Map',
    fields: [
      { key: 'address', label: 'Address', type: 'text', placeholder: '123 Main Street, City' },
      { key: 'embedUrl', label: 'Map embed URL', type: 'text', placeholder: 'https://maps.google.com/maps?q=…' },
    ],
  },
  {
    id: 'buildGroup',
    name: 'Build Group',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    desc: 'Invite members and grow a group or community',
    fields: [
      { key: 'label', label: 'Heading', type: 'text', placeholder: 'Build Group' },
      { key: 'description', label: 'Description', type: 'text', placeholder: 'Invite friends and grow together', optional: true },
      { key: 'button', label: 'Button label', type: 'text', placeholder: 'Join Group', optional: true },
    ],
  },
  {
    id: 'password',
    name: 'Password Protection',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    desc: 'Require a password before the card unlocks',
    fields: [
      { key: 'password', label: 'Password', type: 'text', placeholder: 'e.g. 1234', optional: true },
      { key: 'hint', label: 'Hint (optional)', type: 'text', placeholder: 'Ask staff for the PIN', optional: true },
      { key: 'lockedMessage', label: 'Locked message (optional)', type: 'text', placeholder: 'This card is password protected', optional: true },
    ],
  },
  {
    id: 'about',
    name: 'About Us',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    desc: 'Long-form story about your business',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', placeholder: 'About Us', optional: true },
      { key: 'text', label: 'Story', type: 'textarea', placeholder: 'Tell your story…', optional: true },
    ],
  },
  {
    id: 'website',
    name: 'Website',
    icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    desc: 'Your business website link',
    fields: [
      { key: 'label', label: 'Link label', type: 'text', placeholder: 'Visit our website', optional: true },
      { key: 'url', label: 'Website URL', type: 'text', placeholder: 'https://example.com', optional: true },
    ],
  },
  {
    id: 'video',
    name: 'Video',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    desc: 'A promo or introduction video',
    fields: [
      { key: 'url', label: 'Video URL', type: 'text', placeholder: 'https://youtube.com/…', optional: true },
      { key: 'poster', label: 'Poster image', type: 'image', placeholder: 'https://example.com/poster.jpg', optional: true },
    ],
  },
  {
    id: 'evergreen',
    name: 'Evergreen Video / Webinar',
    icon: 'M15.584 15.584a4 4 0 00-5.168 0M18 18a8 8 0 00-12 0m11.314-2.686a4 4 0 00-5.196-.617M12 12h.01',
    desc: 'Reusable video, webinar or live stream where enabled',
    fields: [
      { key: 'title', label: 'Title', type: 'text', placeholder: 'Coffee & Conversation', optional: true },
      { key: 'url', label: 'Stream / video URL', type: 'text', placeholder: 'https://…', optional: true },
      { key: 'mode', label: 'Mode', type: 'select', options: ['Evergreen video', 'On-demand webinar', 'Live streaming'], optional: true },
    ],
  },
  {
    id: 'payment',
    name: 'Payment Methods',
    icon: 'M3 10h18M7 15h3m-5-7a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V8z',
    desc: 'How customers can pay',
    fields: [
      {
        key: 'methods',
        label: 'Accepted payment methods',
        type: 'list',
        itemLabel: 'Method',
        itemFields: [
          { key: 'method', label: 'Method', type: 'select', options: ['Card', 'Cash', 'Bank transfer', 'Mobile money', 'PayPal', 'Gift card', 'Crypto', 'Other'] },
          { key: 'details', label: 'Details (optional)', type: 'text', placeholder: 'Visa, Mastercard, Amex', optional: true },
          { key: 'active', label: 'Active', type: 'toggle' },
        ],
      },
    ],
  },
  {
    id: 'offers',
    name: 'Offers',
    icon: 'M7 7h.01M7 3h5a1 1 0 01.7.3l9 9a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-9-9A1 1 0 013 11V5a2 2 0 012-2z',
    desc: 'Current offers customers can redeem',
    fields: [
      {
        key: 'items',
        label: 'Offers',
        type: 'list',
        itemLabel: 'Offer',
        itemFields: [
          { key: 'title', label: 'Title', type: 'text', placeholder: 'Free pastry with coffee' },
          { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Short description…', optional: true },
          { key: 'value', label: 'Value', type: 'text', placeholder: '10% off', optional: true },
          { key: 'membership', label: 'Membership level', type: 'select', options: ['Any', 'Bronze', 'Silver', 'Gold', 'Platinum'], optional: true },
        ],
      },
    ],
  },
  {
    id: 'rewards',
    name: 'Rewards',
    icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    desc: 'Loyalty rewards and points',
    fields: [
      {
        key: 'items',
        label: 'Rewards',
        type: 'list',
        itemLabel: 'Reward',
        itemFields: [
          { key: 'title', label: 'Title', type: 'text', placeholder: 'Loyalty Points' },
          { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Earn 1 point per £1…', optional: true },
          { key: 'value', label: 'Value', type: 'text', placeholder: '1 pt / £1', optional: true },
          { key: 'membership', label: 'Membership level', type: 'select', options: ['Any', 'Bronze', 'Silver', 'Gold', 'Platinum'], optional: true },
        ],
      },
    ],
  },
  {
    id: 'coupons',
    name: 'Coupons',
    icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 010 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 010-4V7a2 2 0 00-2-2H5z',
    desc: 'Coupon codes customers can claim',
    fields: [
      {
        key: 'items',
        label: 'Coupons',
        type: 'list',
        itemLabel: 'Coupon',
        itemFields: [
          { key: 'code', label: 'Code', type: 'text', placeholder: 'BDAY15', optional: true },
          { key: 'title', label: 'Title', type: 'text', placeholder: 'Birthday Coupon' },
          { key: 'value', label: 'Value', type: 'text', placeholder: '15% off', optional: true },
          { key: 'expiry', label: 'Expiry', type: 'text', placeholder: '30 days', optional: true },
          { key: 'membership', label: 'Membership level', type: 'select', options: ['Any', 'Bronze', 'Silver', 'Gold', 'Platinum'], optional: true },
        ],
      },
    ],
  },
  {
    id: 'campaigns',
    name: 'Campaigns',
    icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15L18 13a3 3 0 000-6l-5.5-.4A2 2 0 0111 5.882z',
    desc: 'Seasonal and campaign rewards',
    fields: [
      {
        key: 'items',
        label: 'Campaigns',
        type: 'list',
        itemLabel: 'Campaign',
        itemFields: [
          { key: 'title', label: 'Title', type: 'text', placeholder: 'Summer Campaign' },
          { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Seasonal reward…', optional: true },
          { key: 'value', label: 'Value', type: 'text', placeholder: 'Double points', optional: true },
          { key: 'membership', label: 'Membership level', type: 'select', options: ['Any', 'Bronze', 'Silver', 'Gold', 'Platinum'], optional: true },
        ],
      },
    ],
  },
  {
    id: 'documents',
    name: 'Documents',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    desc: 'Brochures, menus, forms and files',
    fields: [
      {
        key: 'items',
        label: 'Documents',
        type: 'list',
        itemLabel: 'Document',
        itemFields: [
          { key: 'title', label: 'Title', type: 'text', placeholder: 'Menu (PDF)' },
          { key: 'type', label: 'Type', type: 'select', options: ['PDF', 'Doc', 'Image', 'Video', 'Spreadsheet', 'Archive', 'Other'], optional: true },
          { key: 'url', label: 'File URL', type: 'text', placeholder: 'https://example.com/file.pdf', optional: true },
        ],
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Custom block schema — flexible building blocks that stack inside   */
/*  any section (image up + text below, text up + button below, etc.)  */
/* ------------------------------------------------------------------ */

const CUSTOM_BLOCK_DEFS: CustomBlockDef[] = [
  {
    type: 'title',
    name: 'Title',
    icon: 'M4 5h16M4 12h16M4 19h10',
    desc: 'Big heading text',
    fields: [
      { key: 'text', label: 'Title text', type: 'text', placeholder: 'Our Story' },
      { key: 'size', label: 'Size', type: 'select', options: ['Small', 'Medium', 'Large', 'Extra Large'] },
      { key: 'align', label: 'Alignment', type: 'select', options: ['Left', 'Center', 'Right'] },
      { key: 'bold', label: 'Bold', type: 'toggle' },
    ],
  },
  {
    type: 'text',
    name: 'Text',
    icon: 'M3 5h12M9 3v2m0 4v2m0 4v2m0 4v2m5-10l4 4-4 4',
    desc: 'Paragraph with bold / italic / size options',
    fields: [
      { key: 'text', label: 'Text', type: 'textarea', placeholder: 'Write your text here…' },
      { key: 'bold', label: 'Bold', type: 'toggle' },
      { key: 'italic', label: 'Italic', type: 'toggle' },
      { key: 'large', label: 'Large text', type: 'toggle' },
      { key: 'align', label: 'Alignment', type: 'select', options: ['Left', 'Center', 'Right'] },
    ],
  },
  {
    type: 'paragraph',
    name: 'Paragraph',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    desc: 'Long-form paragraph block',
    fields: [
      { key: 'text', label: 'Paragraph', type: 'textarea', placeholder: 'Write a longer paragraph…' },
      { key: 'align', label: 'Alignment', type: 'select', options: ['Left', 'Center', 'Right'] },
    ],
  },
  {
    type: 'image',
    name: 'Image Upload',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    desc: 'Upload an image or photo',
    fields: [
      { key: 'url', label: 'Image', type: 'image', placeholder: 'https://example.com/photo.jpg' },
      { key: 'caption', label: 'Caption (optional)', type: 'text', placeholder: 'A nice caption' },
      { key: 'align', label: 'Alignment', type: 'select', options: ['Left', 'Center', 'Right'] },
      { key: 'rounded', label: 'Rounded corners', type: 'toggle' },
    ],
  },
  {
    type: 'link',
    name: 'Link',
    icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    desc: 'Hyperlink to a page or file',
    fields: [
      { key: 'label', label: 'Link text', type: 'text', placeholder: 'Visit our website' },
      { key: 'url', label: 'URL', type: 'text', placeholder: 'https://example.com' },
      { key: 'newTab', label: 'Open in new tab', type: 'toggle' },
    ],
  },
  {
    type: 'button',
    name: 'Button',
    icon: 'M5 3l14 9-14 9V3z',
    desc: 'Call-to-action button',
    fields: [
      { key: 'label', label: 'Button text', type: 'text', placeholder: 'Book Now' },
      { key: 'url', label: 'URL / action', type: 'text', placeholder: 'https://example.com/book' },
      { key: 'style', label: 'Style', type: 'select', options: ['Solid', 'Outline', 'Ghost'] },
      { key: 'align', label: 'Alignment', type: 'select', options: ['Left', 'Center', 'Right'] },
      { key: 'full', label: 'Full width', type: 'toggle' },
    ],
  },
  {
    type: 'form',
    name: 'Form Question',
    icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
    desc: 'Question with answer options',
    fields: [
      { key: 'question', label: 'Question', type: 'text', placeholder: 'What service do you need?' },
      { key: 'answerType', label: 'Answer type', type: 'select', options: ['Single choice', 'Multiple choice', 'Dropdown', 'Short text', 'Email', 'Phone', 'Date', 'Rating'] },
      { key: 'required', label: 'Required', type: 'toggle' },
    ],
    hasOptions: true,
  },
  {
    type: 'upload',
    name: 'File Upload',
    icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    desc: 'Let visitors upload files',
    fields: [
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Upload your document' },
      { key: 'multiple', label: 'Allow multiple files', type: 'toggle' },
    ],
    hasFormats: true,
  },
  {
    type: 'divider',
    name: 'Divider',
    icon: 'M5 12h14',
    desc: 'Horizontal separator line',
    fields: [
      { key: 'style', label: 'Style', type: 'select', options: ['Solid', 'Dashed', 'Dotted'] },
    ],
  },
  {
    type: 'spacer',
    name: 'Spacer',
    icon: 'M12 4v16m8-8H4',
    desc: 'Add vertical space',
    fields: [
      { key: 'height', label: 'Height', type: 'select', options: ['Small', 'Medium', 'Large'] },
    ],
  },
]

/* Default centre assignment for each section id. Admin can move sections   */
/* between centres at runtime — this just sets the starting grouping.       */
export const SECTION_CENTRES: Record<string, CentreId> = {
  countdown: 'header',
  banner: 'header',
  profile: 'header',
  social: 'share',
  contacts: 'share',
  appointment: 'share',
  qr: 'share',
  share: 'share',
  services: 'other',
  gallery: 'other',
  products: 'other',
  testimonials: 'other',
  blog: 'other',
  hours: 'other',
  contactForm: 'other',
  map: 'other',
  buildGroup: 'other',
  password: 'other',
  about: 'share',
  website: 'share',
  video: 'share',
  evergreen: 'share',
  documents: 'share',
  payment: 'other',
  offers: 'redeem',
  rewards: 'redeem',
  coupons: 'redeem',
  campaigns: 'redeem',
}

const UPLOAD_FORMATS = ['PDF', 'Image', 'Video', 'Audio', 'Document', 'Spreadsheet', 'Archive', 'Other']

/* How the template will be used — drives category. */
const TEMPLATE_USES = [
  'General purpose',
  'Restaurant & Café',
  'Retail & Shop',
  'Technology & IT',
  'Health & Beauty',
  'Fitness & Gym',
  'Hotel & Hospitality',
  'Real Estate',
  'Professional Services',
  'Education & Coaching',
  'Charity & NGO',
  'Events & Entertainment',
]

/* ------------------------------------------------------------------ */
/*  Builder wizard — everything for a template lives in one place.     */
/*  Steps: Content → Assignment → Preview & Testing. Publishing        */
/*  happens from the last step. QR configuration lives inside the QR   */
/*  section on the Content step, with deep customization in the        */
/*  dedicated QR Customizer page. Activity and version history live    */
/*  on the template list (row actions), not in the builder.            */
/* ------------------------------------------------------------------ */interface WizardStepDef {
  id: string
  label: string
  short: string
  desc: string
  helpTitle: string
  help: string[]
  icon: string
}

const WIZARD_STEPS: WizardStepDef[] = [
  {
    id: 'content',
    label: '1. Content',
    short: 'Content',
    desc: 'Build the card — sections, content and layout.',
    helpTitle: 'Step 1 — Content',
    help: [
      'Sections are grouped into three core centres — Share, Exchange and Redeem — so customers clearly know what the card does.',
      'Use the “Move to” dropdown on any section to reassign it to a different centre, and reorder sections within a centre with the arrows.',
      'Turn sections on or off with the toggle and edit any field directly — text, images, lists and more.',
      'Inside a section, use Custom Content to stack blocks like text under an image or a button below a paragraph.',
      'The live preview updates as you type.',
    ],
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  },
  {
    id: 'assignment',
    label: '2. Assignment',
    short: 'Assignment',
    desc: 'Attach the template to memberships.',
    helpTitle: 'Step 2 — Assignment',
    help: [
      'Pick which memberships receive this template by default.',
      'Click a tier to select the whole group, or pick individual levels.',
      'Save the assignment so it applies when the template is published.',
    ],
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
  },
  {
    id: 'preview',
    label: '3. Preview & Testing',
    short: 'Preview & Testing',
    desc: 'See it on any device and run test scenarios.',
    helpTitle: 'Step 3 — Preview & Testing',
    help: [
      'Switch between phone, tablet and desktop to see how the card adapts.',
      'Run the quick tests below — QR scan, redeem, share and booking.',
      'A failed test means something needs fixing before publishing.',
    ],
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zm-12.542 0C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  },
]

function buildCustomBlock(type: CustomBlockType): CustomBlock {
  const def = CUSTOM_BLOCK_DEFS.find(d => d.type === type)!
  const values: Record<string, string> = {}
  def.fields.forEach(f => {
    if (f.type === 'select' && f.options) values[f.key] = f.options[0]
    else values[f.key] = ''
  })
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    type,
    values,
    options: type === 'form' ? ['Option 1', 'Option 2'] : [],
    formats: type === 'upload' ? ['PDF', 'Image'] : [],
  }
}

/* ------------------------------------------------------------------ */
/*  Default section state                                              */
/* ------------------------------------------------------------------ */

const DEFAULT_ITEMS: Record<string, Record<string, string>[]> = {
  social: [
    { platform: 'Facebook', url: 'https://facebook.com/username' },
    { platform: 'Instagram', url: 'https://instagram.com/username' },
    { platform: 'WhatsApp', url: 'https://wa.me/1234567890' },
  ],
  contacts: [
    { type: 'Email', label: 'Email', value: 'hello@example.com' },
    { type: 'Birthday', label: 'Birthday', value: 'Jan 1' },
    { type: 'Phone', label: 'Phone', value: '+1 234 567 890' },
    { type: 'Location', label: 'Location', value: 'New York, USA' },
  ],
  services: [
    { icon: '✂️', title: 'Hair Styling', description: 'Professional styling for every occasion.' },
    { icon: '💆', title: 'Spa Treatment', description: 'Relaxing treatments to refresh you.' },
  ],
  products: [
    { image: '', title: 'Premium Package', description: 'Our most popular bundle.', price: '$49' },
    { image: '', title: 'Basic Package', description: 'Everything you need to start.', price: '$19' },
  ],
  testimonials: [
    { avatar: '', name: 'Jane Doe', role: 'Happy customer', quote: 'Amazing service, highly recommended!' },
    { avatar: '', name: 'John Smith', role: 'Regular client', quote: 'Professional and friendly team.' },
  ],
  blog: [
    { image: '', title: '5 tips for your business', date: 'Jan 15, 2026', excerpt: 'Grow your business with these simple tips…' },
  ],
  gallery: [{ url: '' }, { url: '' }, { url: '' }],
  hours: [
    { day: 'Monday', hours: '9:00 AM – 5:00 PM', closed: '' },
    { day: 'Tuesday', hours: '9:00 AM – 5:00 PM', closed: '' },
    { day: 'Wednesday', hours: '9:00 AM – 5:00 PM', closed: '' },
    { day: 'Thursday', hours: '9:00 AM – 5:00 PM', closed: '' },
    { day: 'Friday', hours: '9:00 AM – 5:00 PM', closed: '' },
    { day: 'Saturday', hours: '10:00 AM – 3:00 PM', closed: '' },
    { day: 'Sunday', hours: '', closed: 'true' },
  ],
}

const DEFAULT_VALUES: Record<string, Record<string, string>> = {
  banner: { image: '' },
  profile: { avatar: '', name: 'John Smith', designation: 'Owner', description: 'Welcome to my business!' },
  countdown: { label: 'Season ends in', color: '#F97316' },
  appointment: { heading: 'Make an Appointment', button: 'Request Appointment' },
  qr: { qrMode: 'Generate by System', heading: 'Scan my QR Code', qrType: 'Open this VCard', qrDestination: 'https://vcard.mcom/b/this-card', qrPosition: 'Right', qrSize: 'Medium', qrDynamic: 'true', qrImage: '', qrColor: '#111827', qrBgColor: '#ffffff', qrLogo: '', qrStyle: 'square' },
  contactForm: { heading: 'Contact Us', button: 'Send Message' },
  share: { downloadLabel: 'Download Vcard', shareLabel: 'Share' },
  map: { address: '123 Main Street, City', embedUrl: '' },
}

function buildInitialState(): SectionState[] {
  return SECTIONS.map(section => {
    const values: Record<string, string> = {}
    const items: Record<string, Record<string, string>[]> = {}
    section.fields.forEach(field => {
      if (field.type === 'list' && field.itemFields) {
        items[field.key] = (DEFAULT_ITEMS[section.id] ?? []).map(item => {
          const base: Record<string, string> = {}
          field.itemFields!.forEach(ifd => {
            base[ifd.key] = item[ifd.key] ?? ''
          })
          return base
        })
      } else {
        values[field.key] = DEFAULT_VALUES[section.id]?.[field.key] ?? ''
      }
    })
    /* Season countdown sits above the banner by default and counts down to
       whichever season is currently active. */
    if (section.id === 'countdown' && !values.seasonIds) {
      values.seasonIds = loadSeasons().map(s => s.id).join(',')
    }
    return { uid: section.id, schemaId: section.id, name: section.name, enabled: true, values, items, blocks: [], centre: SECTION_CENTRES[section.id] ?? 'other' }
  })
}

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${on ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  )
}

function ImageUploadField({ label, value, onChange, placeholder, className }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      onChange(String(reader.result))
      toast.success('Image uploaded')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const cls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400'

  return (
    <div className={className}>
      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`${cls} flex-1 min-w-0`} />
        <button type="button" onClick={() => fileRef.current?.click()} title="Upload from file manager"
          className="shrink-0 px-2.5 py-2 rounded-lg bg-orange-500 text-white text-[10px] font-semibold flex items-center gap-1 hover:bg-orange-600 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Upload
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button type="button" onClick={() => fileRef.current?.click()} title="Click to upload from file manager"
          className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 flex items-center justify-center bg-gray-50 dark:bg-gray-700 transition-colors">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.opacity = '0.2' }} />
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          )}
        </button>
      </div>
      <p className="text-[8px] text-gray-400 mt-1">Click Upload or the thumbnail to pick from file manager — or paste an image link</p>
    </div>
  )
}

function FieldInput({ label, value, onChange, type, placeholder }: {
  label: string
  value: string
  onChange: (v: string) => void
  type: FieldType
  placeholder?: string
}) {
  const cls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400'

  if (type === 'image') {
    return <ImageUploadField label={label} value={value} onChange={onChange} placeholder={placeholder} />
  }

  return (
    <div>
      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea rows={2} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`${cls} resize-none`} />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Shared centre items editor — used both in the Centre content       */
/*  editor and inline inside the Redeem / Exchange section cards so    */
/*  the admin can rename, rewrite, change % / pts / price, button      */
/*  label and link for every reward / product item.                    */
/* ------------------------------------------------------------------ */

function CentreItemsEditor({ centre, set }: {
  centre: CentreConfig
  set: (patch: Partial<CentreConfig>) => void
}) {
  const inputCls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40'
  const isRedeem = centre.id === 'redeem'
  const isExchange = centre.id === 'exchange'
  const itemLabel = isRedeem ? 'Reward' : isExchange ? 'Product' : 'Item'

  return (
    <div className="space-y-2">
      {centre.items.map((item, i) => (
        <div key={i} className="border border-gray-100 dark:border-gray-700 rounded-lg p-2 space-y-1.5 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-semibold text-gray-400 uppercase tracking-wide">{itemLabel} {i + 1}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => set({ items: centre.items.map((it, j) => j === i ? it : it).filter((_, j) => j !== i) })}
                className="text-red-400 hover:text-red-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="col-span-2">
              <ImageUploadField label="Image (optional)" value={item.image ?? ''} onChange={v => set({ items: centre.items.map((it, j) => j === i ? { ...it, image: v } : it) })} placeholder="https://example.com/product.jpg" />
            </div>
            <div className="col-span-2">
              <label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-1">Title</label>
              <input type="text" value={item.title ?? ''} onChange={e => set({ items: centre.items.map((it, j) => j === i ? { ...it, title: e.target.value } : it) })} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
              <input type="text" value={item.description ?? ''} onChange={e => set({ items: centre.items.map((it, j) => j === i ? { ...it, description: e.target.value } : it) })} className={inputCls} />
            </div>
            <div>
              <label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-1">{isRedeem ? 'Value' : 'Price'}</label>
              <input type="text" value={(item.value ?? item.price) ?? ''} onChange={e => set({ items: centre.items.map((it, j) => j === i ? isRedeem ? { ...it, value: e.target.value } : { ...it, price: e.target.value } : it) })} placeholder={isRedeem ? '500 pts' : '$49'} className={inputCls} />
            </div>
            <div>
              <label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-1">Button label</label>
              <input type="text" value={item.linkLabel ?? ''} onChange={e => set({ items: centre.items.map((it, j) => j === i ? { ...it, linkLabel: e.target.value } : it) })} placeholder={isRedeem ? 'Redeem now' : 'Exchange'} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-1">Link URL (where they {isRedeem ? 'redeem' : 'exchange'})</label>
              <input type="text" value={item.linkUrl ?? ''} onChange={e => set({ items: centre.items.map((it, j) => j === i ? { ...it, linkUrl: e.target.value } : it) })} placeholder="https://mcom.example/redeem/…" className={inputCls} />
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => set({ items: [...centre.items, { image: '', title: '', description: '', linkLabel: isRedeem ? 'Redeem now' : 'Exchange', linkUrl: '' }] })}
        className="w-full border border-dashed border-gray-200 dark:border-gray-600 rounded-lg py-1.5 text-[10px] text-gray-400 hover:text-orange-500 hover:border-orange-300">
        + Add {itemLabel.toLowerCase()}
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  QR Code shape + section editor                                     */
/*  Three modes — Generate by System / Upload from File / User Upload. */
/*  Whichever mode is enabled is what the live card uses.              */
/* ------------------------------------------------------------------ */

function QrShape({ section, sizeClass = 'w-20 h-20', className = '' }: {
  section: SectionState
  sizeClass?: string
  className?: string
}) {
  const mode = section.values.qrMode || 'Generate by System'
  const uploaded = section.values.qrImage

  if (mode === 'Upload from File' && uploaded) {
    return (
      <div className={`${sizeClass} rounded-lg overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 ${className}`}>
        <img src={uploaded} alt="Uploaded QR" className="w-full h-full object-contain" onError={e => { e.currentTarget.style.opacity = '0.3' }} />
      </div>
    )
  }

  if (mode === 'Allow User Upload') {
    return (
      <div className={`${sizeClass} rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-col gap-1 ${className}`}>
        <svg className="w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
        <span className="text-[7px] text-gray-400 text-center leading-none">User adds<br />QR here</span>
      </div>
    )
  }

  /* Generate by System (default) */
  return (
    <div className={`${sizeClass} rounded-lg overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 ${className}`}>
      <QrCodeSvg
        value={section.values.qrDestination}
        fg={section.values.qrColor || '#111827'}
        bg={section.values.qrBgColor || '#ffffff'}
        style={section.values.qrStyle || 'square'}
        logo={section.values.qrLogo}
        sizeClass="w-full h-full"
      />
    </div>
  )
}

function QrSectionBody({ section, updateValue, onCustomize }: {
  section: SectionState
  updateValue: (uid: string, key: string, value: string) => void
  onCustomize: () => void
}) {
  const val = (k: string) => section.values[k] ?? ''
  const mode = val('qrMode') || 'Generate by System'
  const set = (k: string, v: string) => updateValue(section.uid, k, v)

  const MODES = [
    { id: 'Generate by System', label: 'Generate by System', desc: 'System auto-generates the QR for this card', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'Upload from File', label: 'Upload from File', desc: 'You upload a QR image to fit this shape', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'Allow User Upload', label: 'Allow User Upload', desc: 'Just show a QR shape — the end user uploads later', icon: 'M12 4v16m8-8H4' },
  ]

  return (
    <div className="space-y-3">
      {/* Mode selector */}
      <div>
        <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">QR generation</label>
        <div className="grid grid-cols-1 gap-1.5">
          {MODES.map(m => {
            const active = mode === m.id
            return (
              <button key={m.id} onClick={() => set('qrMode', m.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-colors ${active ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10' : 'border-gray-200 dark:border-gray-600 hover:border-orange-300'}`}>
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={m.icon} /></svg>
                </span>
                <span className="flex-1 min-w-0">
                  <span className={`block text-[11px] font-semibold ${active ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-200'}`}>{m.label}</span>
                  <span className="block text-[9px] text-gray-400 leading-tight">{m.desc}</span>
                </span>
                <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? 'border-orange-500' : 'border-gray-300 dark:border-gray-600'}`}>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Shape preview */}
      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
        <QrShape section={section} sizeClass="w-16 h-16" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">
            {mode === 'Generate by System' ? 'System-generated QR' : mode === 'Upload from File' ? (val('qrImage') ? 'Your uploaded QR' : 'No QR image yet') : 'QR shape — user uploads later'}
          </p>
          <p className="text-[9px] text-gray-400 leading-tight mt-0.5">
            {mode === 'Generate by System' ? 'Designed in the QR Customizer — link, logo, colors and shape.' : mode === 'Upload from File' ? 'Upload an image that fits this square shape.' : 'The shape reserves space; the card owner adds their QR.'}
          </p>
          {mode === 'Generate by System' && (
            <button onClick={onCustomize} className="mt-1.5 text-[9px] font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Customize QR Code
            </button>
          )}
        </div>
      </div>

      {/* Heading */}
      <FieldInput label="Heading" type="text" value={val('heading')} placeholder="Scan my QR Code" onChange={v => set('heading', v)} />

      {/* Position & size apply in every mode — they're layout, not the link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Position on card</label>
          <select value={val('qrPosition')} onChange={e => set('qrPosition', e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {['Left', 'Right', 'Center'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Size</label>
          <select value={val('qrSize')} onChange={e => set('qrSize', e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {['Small', 'Medium', 'Large', 'Extra Large'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {mode === 'Generate by System' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">What the QR does</label>
              <select value={val('qrType')} onChange={e => set('qrType', e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                {['Open this VCard', 'Business Profile', 'Campaign', 'Membership Page', 'Custom Link', 'Download vCard'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Destination</label>
              <input type="text" value={val('qrDestination')} onChange={e => set('qrDestination', e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
            </div>
          </div>
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2.5">
            <div>
              <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">Dynamic content</p>
              <p className="text-[9px] text-gray-400">Change the destination later without reprinting.</p>
            </div>
            <Toggle on={val('qrDynamic') === 'true'} onClick={() => set('qrDynamic', val('qrDynamic') === 'true' ? '' : 'true')} />
          </div>
          <button onClick={onCustomize}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Customize QR Code — link, logo, colors & shape
          </button>
        </>
      )}

      {mode === 'Upload from File' && (
        <ImageUploadField label="QR image" value={val('qrImage')} onChange={v => set('qrImage', v)} placeholder="https://example.com/qr.png" />
      )}

      {mode === 'Allow User Upload' && (
        <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-600 px-3 py-2.5 text-[9px] text-gray-400">
          The card will show this QR shape. The end user uploads their own QR code for this card later.
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

function bumpVersion(v: string): string {
  const m = v.match(/^v?(\d+)\.(\d+)$/)
  if (!m) return 'v1.1'
  const major = Number(m[1])
  const minor = Number(m[2]) + 1
  return `v${major}.${minor}`
}

/* ------------------------------------------------------------------ */
/*  Wizard stepper + step help popup                                   */
/* ------------------------------------------------------------------ */

function MultiSelect({ options, value, onChange, width = 'w-52' }: {
  options: string[]
  value: string[]
  onChange: (v: string[]) => void
  width?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const toggle = (o: string) => onChange(value.includes(o) ? value.filter(x => x !== o) : [...value, o])

  const display = value.length === 0
    ? 'None selected'
    : value.length === options.length
      ? `All (${value.length})`
      : `${value.length} selected`

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`flex items-center justify-between gap-2 ${width} border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-orange-300`}>
        <span className="truncate">{display}</span>
        <svg className={`w-3 h-3 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-xl p-1.5" style={{ width }}>
          {options.map(o => {
            const on = value.includes(o)
            return (
              <button type="button" key={o} onClick={() => toggle(o)}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-[11px] hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                <span className="truncate">{o}</span>
                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${on ? 'bg-orange-500 border-orange-500' : 'border-gray-300 dark:border-gray-600'}`}>
                  {on && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* Colour-chip multi-select for admin-managed catalogues (Sectors /       */
/* Seasons). Displays item names, stores item ids.                        */
function CatalogMultiSelect({ items, value, onChange, width = 'w-52' }: {
  items: { id: string; name: string; color: string }[]
  value: string[]
  onChange: (v: string[]) => void
  width?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const toggle = (id: string) => onChange(value.includes(id) ? value.filter(x => x !== id) : [...value, id])

  const display = value.length === 0
    ? 'None selected'
    : items.length > 0 && value.length === items.length
      ? `All (${value.length})`
      : `${value.length} selected`

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`flex items-center justify-between gap-2 ${width} border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-orange-300`}>
        <span className="truncate">{display}</span>
        <svg className={`w-3 h-3 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-xl p-1.5" style={{ width }}>
          {items.length === 0 ? (
            <p className="px-2.5 py-2 text-[11px] text-gray-400">Nothing here yet — manage under Settings.</p>
          ) : items.map(it => {
            const on = value.includes(it.id)
            return (
              <button type="button" key={it.id} onClick={() => toggle(it.id)}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-[11px] hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                <span className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: it.color }} />
                  <span className="truncate">{it.name}</span>
                </span>
                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${on ? 'bg-orange-500 border-orange-500' : 'border-gray-300 dark:border-gray-600'}`}>
                  {on && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StepHelpModal({ stepId, onClose }: { stepId: string | null; onClose: () => void }) {
  const step = WIZARD_STEPS.find(s => s.id === stepId)
  if (!step) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={step.icon} /></svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{step.helpTitle}</h4>
            <p className="text-[11px] text-gray-400">{step.label} of 3 — {step.desc}</p>
          </div>
        </div>
        <div className="px-5 py-4">
          <ol className="space-y-2.5">
            {step.help.map((h, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{h}</p>
              </li>
            ))}
          </ol>
          <button onClick={onClose} className="mt-4 w-full px-4 py-2.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Got it</button>
        </div>
      </div>
    </div>
  )
}

function WizardStepper({ active, onSelect, onHelp }: {
  active: string
  onSelect: (id: string) => void
  onHelp: (id: string) => void
}) {
  const idx = WIZARD_STEPS.findIndex(s => s.id === active)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
        {WIZARD_STEPS.map((step, i) => {
          const done = i < idx
          const isActive = step.id === active
          return (
            <div key={step.id} className="flex items-center gap-1 flex-shrink-0">
              {i > 0 && <div className={`w-6 h-0.5 mx-0.5 rounded ${i <= idx ? 'bg-orange-400' : 'bg-gray-200 dark:bg-gray-700'}`} />}
              <button
                onClick={() => onSelect(step.id)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors ${isActive ? 'bg-orange-500 text-white shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isActive ? 'bg-white/25 text-white' : done ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {done ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span className={`text-[11px] font-semibold whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{step.short}</span>
                <button
                  onClick={e => { e.stopPropagation(); onHelp(step.id) }}
                  title="How this step works"
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-white/25 text-white hover:bg-white/40' : 'text-gray-300 dark:text-gray-600 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10'}`}
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
              </button>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
          <div>
            <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">{WIZARD_STEPS[idx]?.label} — {WIZARD_STEPS[idx]?.desc}</p>
            <p className="text-[9px] text-gray-400">Everything for this template in one place — publish from the last step.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => idx > 0 && onSelect(WIZARD_STEPS[idx - 1].id)}
            disabled={idx === 0}
            className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none"
          >← Back</button>
          {idx < WIZARD_STEPS.length - 1 && (
            <button
              onClick={() => onSelect(WIZARD_STEPS[idx + 1].id)}
              className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-orange-500 text-white hover:bg-orange-600"
            >Next →</button>
          )}
          {idx === WIZARD_STEPS.length - 1 && (
            <button onClick={() => onHelp(active)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border border-orange-200 dark:border-orange-500/30 text-orange-600 hover:bg-orange-50 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              How publishing works
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* Membership tiers for the Assignment step — each tier groups its base
   level together with the Pro and Pro+ variants so the admin picks a tier. */
const MEMBERSHIP_TIERS = [
  { name: 'Bronze', dot: 'bg-amber-500', chip: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300', variants: ['Bronze', 'Bronze Pro', 'Bronze Pro+'] },
  { name: 'Silver', dot: 'bg-gray-400', chip: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300', variants: ['Silver', 'Silver Pro', 'Silver Pro+'] },
  { name: 'Gold', dot: 'bg-yellow-400', chip: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300', variants: ['Gold', 'Gold Pro', 'Gold Pro+'] },
  { name: 'Platinum', dot: 'bg-slate-400', chip: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', variants: ['Platinum', 'Platinum Pro', 'Platinum Pro+'] },
]

export default function TemplateBuilderPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [templateName, setTemplateName] = useState('Business VCard Template')
  const [templateType, setTemplateType] = useState<'business' | 'consumer'>(
    searchParams.get('type') === 'consumer' ? 'consumer' : 'business'
  )
  const [templateUses, setTemplateUses] = useState<string[]>(['General purpose'])
  const [seasons, setSeasons] = useState<string[]>([])
  const [sectors, setSectors] = useState<string[]>([])

  const [catalogSectors, setCatalogSectors] = useState<Sector[]>([])
  const [catalogSeasons, setCatalogSeasons] = useState<Season[]>([])
  useEffect(() => {
    setCatalogSectors(loadSectors())
    setCatalogSeasons(loadSeasons())
  }, [])
  const [layoutPreset, setLayoutPreset] = useState('Classic')
  const [sections, setSections] = useState<SectionState[]>(buildInitialState)
  const [expanded, setExpanded] = useState<string | null>('profile')
  const [showPreview, setShowPreview] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [renaming, setRenaming] = useState<{ uid: string; value: string } | null>(null)
  const multiUploadRef = useRef<HTMLInputElement>(null)
  const multiUploadTarget = useRef<{ uid: string; listKey: string } | null>(null)
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null)

  /* Centre-level configuration — name, visibility, title size, password. */
  const [centreConfigs, setCentreConfigs] = useState<Record<string, CentreConfig>>(buildDefaultCentreConfigs)
  const [collapsedCentres, setCollapsedCentres] = useState<Record<string, boolean>>({})
  const [renamingCentre, setRenamingCentre] = useState<{ id: string; value: string } | null>(null)
  const [centrePasswordEditor, setCentrePasswordEditor] = useState<string | null>(null)
  const [centreContentEditor, setCentreContentEditor] = useState<string | null>(null)

  /* Wizard */
  const validSteps = ['content', 'preview', 'assignment']
  const tabParam = searchParams.get('tab')
  const [activeStep, setActiveStep] = useState<string>(validSteps.includes(tabParam ?? '') ? tabParam! : 'content')
  const [stepHelp, setStepHelp] = useState<string | null>(null)

  /* QR section — values live on the QR section in the Content step */
  const qrSection = sections.find(s => s.schemaId === 'qr')

  /* Preview step */
  const [previewDevice, setPreviewDevice] = useState<'phone' | 'tablet' | 'desktop'>('phone')

  /* Assignment step */
  const [assignMemberships, setAssignMemberships] = useState<string[]>(['Gold', 'Platinum'])

  const toggleMembership = (m: string) => {
    setAssignMemberships(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }
  const toggleTier = (variants: string[]) => {
    const allOn = variants.every(v => assignMemberships.includes(v))
    setAssignMemberships(prev => allOn ? prev.filter(x => !variants.includes(x)) : [...new Set([...prev, ...variants])])
  }

  useEffect(() => {
    const idParam = searchParams.get('id')
    const dupParam = searchParams.get('duplicate')

    /* Returning from the QR Customizer page — restore the builder draft and apply the saved design. */
    const draft = loadBuilderDraft()
    if (draft && !idParam && !dupParam) {
      clearBuilderDraft()
      setTemplateName(draft.templateName)
      setTemplateType(draft.templateType)
      if (draft.templateUses && draft.templateUses.length > 0) setTemplateUses(draft.templateUses)
      if (draft.seasons && draft.seasons.length > 0) setSeasons(draft.seasons)
      if (draft.sectors && draft.sectors.length > 0) setSectors(draft.sectors)
      setLayoutPreset(draft.layoutPreset)
      setActiveStep(validSteps.includes(draft.activeStep) ? draft.activeStep : 'content')
      if (draft.editingId != null) setEditingId(draft.editingId)
      if (draft.centres) setCentreConfigs(mergeCentreConfigs(draft.centres))
      setSections(draft.sections.map(s => ({
        ...s,
        blocks: s.blocks.map(b => ({
          ...b,
          type: b.type as CustomBlockType,
        })),
      })))
      const qc = consumeQrCustomization()
      if (qc) {
        setSections(prev => prev.map(s => s.schemaId === 'qr' ? {
          ...s,
          values: {
            ...s.values,
            qrType: qc.qrType || s.values.qrType,
            qrDestination: qc.qrDestination || s.values.qrDestination,
            qrDynamic: qc.qrDynamic === '' ? '' : 'true',
            qrColor: qc.qrColor || s.values.qrColor,
            qrBgColor: qc.qrBgColor || s.values.qrBgColor,
            qrLogo: qc.qrLogo || s.values.qrLogo,
            qrStyle: qc.qrStyle || s.values.qrStyle,
          },
        } : s))
      }
      return
    }

    if (idParam || dupParam) {
      const id = Number(idParam || dupParam)
      const stored = getUserTemplate(id)
      if (stored) {
        const st = stored.builder
        setTemplateName(st.templateName)
        setTemplateType(stored.targetType ?? 'business')
        if (st.templateUses && st.templateUses.length > 0) setTemplateUses(st.templateUses)
        if (st.seasons && st.seasons.length > 0) setSeasons(st.seasons)
        if (st.sectors && st.sectors.length > 0) setSectors(st.sectors)
        setLayoutPreset(st.layoutPreset)
        if (st.centres) setCentreConfigs(mergeCentreConfigs(st.centres))
        setSections(st.sections.map(s => ({
          ...s,
          uid: dupParam ? `${s.schemaId}-${Date.now()}-${s.uid}` : s.uid,
          name: dupParam ? `${s.name} (copy)` : s.name,
          items: Object.fromEntries(Object.entries(s.items).map(([k, v]) => [k, v.map(it => ({ ...it }))])),
          blocks: s.blocks.map(b => ({
            ...b,
            type: b.type as CustomBlockType,
            id: dupParam ? Date.now() + Math.floor(Math.random() * 1000) : b.id,
            values: { ...b.values },
            options: [...b.options],
            formats: [...b.formats],
          })),
        })))
        setExpanded(null)
        if (!dupParam) setEditingId(id)
      } else if (!dupParam) {
        toast.error('Template not found')
      }
    }
  }, [])

  const updateSection = (uid: string, patch: Partial<SectionState>) => {
    setSections(prev => prev.map(s => (s.uid === uid ? { ...s, ...patch } : s)))
  }

  const setSectionFontSize = (uid: string, fontSize: number) => {
    setSections(prev => prev.map(s => (s.uid === uid ? { ...s, fontSize } : s)))
  }

  const updateValue = (uid: string, key: string, value: string) => {
    setSections(prev => prev.map(s => (s.uid === uid ? { ...s, values: { ...s.values, [key]: value } } : s)))
  }

  /* Move a section to a different centre */
  const setSectionCentre = (uid: string, centre: string) => {
    setSections(prev => prev.map(s => (s.uid === uid ? { ...s, centre } : s)))
  }

  /* Update a centre's configuration (name, enabled, showTitle, fontSize, password). */
  const updateCentreConfig = (id: string, patch: Partial<CentreConfig>) => {
    setCentreConfigs(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  const setCentreFontSize = (id: string, fontSize: number) => {
    setCentreConfigs(prev => ({ ...prev, [id]: { ...prev[id], fontSize } }))
  }

  const commitCentreRename = () => {
    if (!renamingCentre) return
    const name = renamingCentre.value.trim()
    if (name) updateCentreConfig(renamingCentre.id, { name })
    setRenamingCentre(null)
  }


  /* Open the QR Customizer page — this is a separate route, so snapshot the
     builder draft first and seed the customizer with the current QR design. */
  const openQrCustomizer = () => {
    if (!qrSection) return
    saveBuilderDraft({
      editingId,
      templateName,
      templateType,
      templateCategory: templateUses[0] ?? 'General',
      templateUses,
      seasons,
      layoutPreset,
      activeStep,
      sections: sections.map(s => ({
        uid: s.uid,
        schemaId: s.schemaId,
        name: s.name,
        enabled: s.enabled,
        values: s.values,
        items: s.items,
        blocks: s.blocks.map(b => ({ id: b.id, type: b.type, values: b.values, options: b.options, formats: b.formats })),
        fontSize: s.fontSize,
      })),
      centres: Object.values(centreConfigs),
    })
    setQrCustomization({
      qrType: qrSection.values.qrType || DEFAULT_QR_CUSTOMIZATION.qrType,
      qrDestination: qrSection.values.qrDestination || DEFAULT_QR_CUSTOMIZATION.qrDestination,
      qrDynamic: qrSection.values.qrDynamic === '' ? '' : 'true',
      qrColor: qrSection.values.qrColor || DEFAULT_QR_CUSTOMIZATION.qrColor,
      qrBgColor: qrSection.values.qrBgColor || DEFAULT_QR_CUSTOMIZATION.qrBgColor,
      qrLogo: qrSection.values.qrLogo || '',
      qrStyle: qrSection.values.qrStyle || DEFAULT_QR_CUSTOMIZATION.qrStyle,
    })
    navigate('/admin/vcard-management/qr-customizer')
  }

  const updateItem = (uid: string, listKey: string, itemIndex: number, fieldKey: string, value: string) => {
    setSections(prev => prev.map(s => {
      if (s.uid !== uid) return s
      const items = (s.items[listKey] ?? []).map((it, j) => (j === itemIndex ? { ...it, [fieldKey]: value } : it))
      return { ...s, items: { ...s.items, [listKey]: items } }
    }))
  }

  const addItem = (uid: string, listKey: string) => {
    const sec = sections.find(s => s.uid === uid)
    const def = sec ? SECTIONS.find(d => d.id === sec.schemaId) : undefined
    const field = def?.fields.find(f => f.key === listKey)
    if (!field?.itemFields) return
    const empty: Record<string, string> = {}
    field.itemFields.forEach(ifd => { empty[ifd.key] = '' })
    setSections(prev => prev.map(s => {
      if (s.uid !== uid) return s
      const items = [...(s.items[listKey] ?? []), empty]
      return { ...s, items: { ...s.items, [listKey]: items } }
    }))
    toast.success(`${field.itemLabel ?? 'Item'} added`)
  }

  const removeItem = (uid: string, listKey: string, itemIndex: number) => {
    setSections(prev => prev.map(s => {
      if (s.uid !== uid) return s
      const items = (s.items[listKey] ?? []).filter((_, j) => j !== itemIndex)
      return { ...s, items: { ...s.items, [listKey]: items } }
    }))
  }

  const moveItem = (uid: string, listKey: string, itemIndex: number, dir: -1 | 1) => {
    setSections(prev => prev.map(s => {
      if (s.uid !== uid) return s
      const items = [...(s.items[listKey] ?? [])]
      const target = itemIndex + dir
      if (target < 0 || target >= items.length) return s
      const [it] = items.splice(itemIndex, 1)
      items.splice(target, 0, it)
      return { ...s, items: { ...s.items, [listKey]: items } }
    }))
  }

  const moveSection = (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= sections.length) return
    setSections(prev => {
      /* Reorder only within the same centre — moving a section to another
         centre is handled by the "Move to" dropdown on each section. */
      if ((prev[index].centre ?? 'other') !== (prev[target].centre ?? 'other')) return prev
      const next = [...prev]
      const [s] = next.splice(index, 1)
      next.splice(target, 0, s)
      return next
    })
  }

  const duplicateSection = (index: number) => {
    const src = sections[index]
    const copy: SectionState = {
      uid: `${src.schemaId}-${Date.now()}`,
      schemaId: src.schemaId,
      name: `${src.name} (copy)`,
      enabled: src.enabled,
      centre: src.centre,
      values: { ...src.values },
      items: Object.fromEntries(Object.entries(src.items).map(([k, v]) => [k, v.map(it => ({ ...it }))])),
      blocks: src.blocks.map(b => ({
        ...b,
        id: Date.now() + Math.floor(Math.random() * 1000),
        values: { ...b.values },
        options: [...b.options],
        formats: [...b.formats],
      })),
    }
    setSections(prev => {
      const next = [...prev]
      next.splice(index + 1, 0, copy)
      return next
    })
    setExpanded(copy.uid)
    toast.success(`${copy.name} duplicated`)
  }

  const commitRename = () => {
    if (!renaming) return
    const name = renaming.value.trim()
    if (name) updateSection(renaming.uid, { name })
    setRenaming(null)
  }

  const handleMultiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = multiUploadTarget.current
    const files = e.target.files
    e.target.value = ''
    multiUploadTarget.current = null
    if (!target || !files || files.length === 0) return
    const pending = Array.from(files).map(file => new Promise<string>(resolve => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.readAsDataURL(file)
    }))
    Promise.all(pending).then(urls => {
      setSections(prev => prev.map(s => {
        if (s.uid !== target.uid) return s
        const items = [...(s.items[target.listKey] ?? []), ...urls.map(url => ({ url }))]
        return { ...s, items: { ...s.items, [target.listKey]: items } }
      }))
      toast.success(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`)
    })
  }

  const startMultiUpload = (uid: string, listKey: string) => {
    multiUploadTarget.current = { uid, listKey }
    multiUploadRef.current?.click()
  }

  /* ---------------- Custom block handlers ---------------- */

  const addCustomBlock = (uid: string, type: CustomBlockType) => {
    const block = buildCustomBlock(type)
    setSections(prev => prev.map(s => (s.uid === uid ? { ...s, blocks: [...s.blocks, block] } : s)))
    toast.success(`${CUSTOM_BLOCK_DEFS.find(d => d.type === type)?.name} added`)
  }

  const updateCustomBlock = (uid: string, blockId: number, patch: Partial<CustomBlock>) => {
    setSections(prev => prev.map(s => {
      if (s.uid !== uid) return s
      const blocks = s.blocks.map(b => (b.id === blockId ? { ...b, ...patch } : b))
      return { ...s, blocks }
    }))
  }

  const moveCustomBlock = (uid: string, blockId: number, dir: -1 | 1) => {
    setSections(prev => prev.map(s => {
      if (s.uid !== uid) return s
      const blocks = [...s.blocks]
      const index = blocks.findIndex(b => b.id === blockId)
      const target = index + dir
      if (index < 0 || target < 0 || target >= blocks.length) return s
      const [b] = blocks.splice(index, 1)
      blocks.splice(target, 0, b)
      return { ...s, blocks }
    }))
  }

  const removeCustomBlock = (uid: string, blockId: number) => {
    setSections(prev => prev.map(s => (s.uid === uid ? { ...s, blocks: s.blocks.filter(b => b.id !== blockId) } : s)))
  }

  const handleValidate = () => {
    const enabled = sections.filter(s => s.enabled)
    if (!templateName.trim()) { toast.error('Template name is required'); return }
    if (enabled.length === 0) { toast.error('Enable at least one section'); return }
    const missing = enabled.some(section => {
      const def = SECTIONS.find(d => d.id === section.schemaId)
      return def?.fields.some(f => f.type !== 'list' && !f.optional && !section.values[f.key])
    })
    if (missing) { toast.error('Some required fields are empty'); return }
    toast.success('Template looks good — validation passed')
  }

  const buildStoredTemplate = (status: 'Published' | 'Draft'): StoredTemplate => {
    const existing = editingId != null ? getUserTemplate(editingId) : undefined
    const id = existing?.id ?? nextTemplateId()
    const prefix = templateType === 'consumer' ? 'CVT-' : 'BVT-'
    const typeChanged = existing != null && (existing.targetType ?? 'business') !== templateType
    const builder = {
      templateName,
      templateCategory: templateUses[0] ?? 'General',
      templateUses,
      seasons,
      sectors,
      layoutPreset,
      sections,
      centres: Object.values(centreConfigs),
    }
    return {
      id,
      templateId: existing && !typeChanged ? existing.templateId : `${prefix}${nextTemplateNumber(prefix)}`,
      name: templateName,
      version: existing ? bumpVersion(existing.version) : 'v1.0',
      description: existing?.description ?? '',
      status,
      targetType: templateType,
      category: templateUses[0] ?? 'General',
      industry: existing?.industry ?? 'General',
      layout: layoutPreset,
      lastUpdated: 'just now',
      createdDate: existing?.createdDate ?? 'just now',
      updatedBy: existing?.updatedBy ?? 'You',
      createdBy: existing?.createdBy ?? 'You',
      builder,
    }
  }

  const saveDraft = () => {
    if (!templateName.trim()) { toast.error('Enter a template name first'); return }
    const saved = upsertTemplate(buildStoredTemplate('Draft'))
    setEditingId(saved.id)
    toast.success('Draft saved')
  }

  const handlePublish = () => {
    if (!templateName.trim()) { toast.error('Enter a template name first'); return }
    const enabled = sections.filter(s => s.enabled)
    if (enabled.length === 0) { toast.error('Enable at least one section'); return }
    upsertTemplate(buildStoredTemplate('Published'))
    toast.success(`${templateType === 'consumer' ? 'Consumer' : 'Business'} VCard template published`)
    navigate(templateType === 'consumer'
      ? '/admin/vcard-management/consumer-vcard-templates'
      : '/admin/vcard-management/business-vcard-templates')
  }

  return (
    <div className="space-y-4">
      <Helmet><title>VCard Template Builder - VCard Management - MCOM VCard</title></Helmet>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Link to="/admin/vcard-management" className="hover:text-orange-600">VCard Management</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <Link to={templateType === 'consumer' ? '/admin/vcard-management/consumer-vcard-templates' : '/admin/vcard-management/business-vcard-templates'} className="hover:text-orange-600">
          {templateType === 'consumer' ? 'Consumer VCard Templates' : 'Business VCard Templates'}
        </Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 dark:text-white font-medium">Template Builder</span>
      </div>

      {/* Top bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Build for</label>
            <select value={templateType} onChange={e => setTemplateType(e.target.value as 'business' | 'consumer')}
              className="w-40 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              {TEMPLATE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{templateType === 'consumer' ? 'Consumer VCard Template' : 'Business VCard Template'}</label>
            <input type="text" value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Enter template name..."
              className="w-64 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Used for</label>
            <MultiSelect options={TEMPLATE_USES} value={templateUses} onChange={setTemplateUses} width="w-52" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Season</label>
            <CatalogMultiSelect items={catalogSeasons} value={seasons} onChange={setSeasons} width="w-52" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Sector</label>
            <CatalogMultiSelect items={catalogSectors} value={sectors} onChange={setSectors} width="w-52" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button onClick={saveDraft} className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 flex items-center gap-1 hover:bg-gray-50">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            Save Draft
          </button>
          <button onClick={handleValidate} className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border border-blue-200 dark:border-blue-500/30 text-blue-600 flex items-center gap-1 hover:bg-blue-50">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Validate
          </button>
          <button onClick={() => setPreviewOpen(true)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 flex items-center gap-1 hover:bg-gray-50">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-12.542 0C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Preview
          </button>
          <button onClick={handlePublish} className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-orange-500 text-white flex items-center gap-1 hover:bg-orange-600">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Publish
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />
          <button onClick={() => navigate(templateType === 'consumer' ? '/admin/vcard-management/consumer-vcard-templates' : '/admin/vcard-management/business-vcard-templates')} className="px-2 py-1.5 rounded-lg text-[10px] font-medium text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
      </div>

      {/* Helper strip */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <p className="text-[11px] text-orange-700 dark:text-orange-300">
          <span className="font-semibold">Share · Exchange · Redeem.</span> Sections are grouped into three core centres so your card clearly serves sharing, exchanging and redeeming. Use the <span className="font-semibold">Move to</span> dropdown on any section to place it in another centre, arrange sections within a centre with the arrows, and edit any content directly. Inside any section use <span className="font-semibold">Custom Content</span> to stack blocks — upload an image with text below it, text with a button under it, form questions with options, file uploads and more.
        </p>
      </div>

      {/* Wizard steps */}
      <WizardStepper active={activeStep} onSelect={setActiveStep} onHelp={setStepHelp} />

      {activeStep === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* ==================== LEFT — Sections form ==================== */}
          <div className="space-y-6">
            <input ref={multiUploadRef} type="file" accept="image/*" multiple className="hidden" onChange={handleMultiUpload} />

            {/* Sections grouped into Share / Exchange / Redeem centres (+ Header & More).
                Nothing is removed — every section keeps all its existing controls.
                The "Move to" dropdown reassigns a section to another centre. */}
            {CENTRES.map(centre => {
              const group = sections
                .map((s, idx) => ({ s, idx }))
                .filter(({ s }) => (s.centre ?? 'other') === centre.id)
              const cc = centreConfigs[centre.id]
              const hasCentreContent = !!cc && (cc.contentMode === 'webhook' ? !!cc.webhookUrl : cc.contentMode === 'link' ? !!(cc.description || cc.linkUrl) : cc.contentMode === 'integration' ? !!cc.integrationEnabled || !!cc.integrationPlatform : (cc.items?.length ?? 0) > 0)
              if (group.length === 0 && !hasCentreContent) return null
              const accent = CENTRE_ACCENT[centre.accent] ?? CENTRE_ACCENT.gray
              return (
                <div key={centre.id} className={`rounded-xl border overflow-hidden ${accent.border} ${accent.bg}`}>
                  {/* Centre header */}
                  <div className={`px-3 py-2.5 flex items-center gap-2 ${accent.headerBg}`}>
                    <button
                      onClick={() => setCollapsedCentres(prev => ({ ...prev, [centre.id]: !prev[centre.id] }))}
                      title={collapsedCentres[centre.id] ? 'Expand centre' : 'Collapse centre'}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-white/40 dark:hover:bg-gray-700/40 shrink-0"
                    >
                      <svg className={`w-3.5 h-3.5 transition-transform ${collapsedCentres[centre.id] ? '-rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${accent.bg} ${accent.text}`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={centre.icon} /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        {renamingCentre?.id === centre.id ? (
                          <input
                            autoFocus
                            value={renamingCentre.value}
                            onChange={e => setRenamingCentre({ id: centre.id, value: e.target.value })}
                            onBlur={commitCentreRename}
                            onKeyDown={e => { if (e.key === 'Enter') commitCentreRename(); if (e.key === 'Escape') setRenamingCentre(null) }}
                            className="w-36 text-[11px] font-bold border border-orange-300 rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                          />
                        ) : (
                          <>
                            <button onClick={() => setCollapsedCentres(prev => ({ ...prev, [centre.id]: !prev[centre.id] }))} className={`text-[11px] font-bold ${accent.text} hover:underline truncate`}>
                              {centreConfigs[centre.id]?.name ?? centre.name}
                            </button>
                            <button onClick={() => setRenamingCentre({ id: centre.id, value: centreConfigs[centre.id]?.name ?? centre.name })} title="Rename centre"
                              className="w-4 h-4 rounded flex items-center justify-center text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-700 shrink-0">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                          </>
                        )}
                        {!centreConfigs[centre.id]?.enabled && <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 shrink-0">HIDDEN</span>}
                      </div>
                      <p className="text-[9px] text-gray-400 dark:text-gray-500 leading-snug truncate">{centre.desc}</p>
                    </div>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${accent.bg} ${accent.text}`}>{group.length}</span>
                    <div className="flex items-center gap-0.5 shrink-0" title="Centre title size on card">
                      <button onClick={() => setCentreFontSize(centre.id, Math.max(50, (centreConfigs[centre.id]?.fontSize ?? 170) - 10))} title="Decrease title size"
                        className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:bg-white/40 dark:hover:bg-gray-700/40 hover:text-orange-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                      </button>
                      <span className="w-9 text-center text-[8px] font-semibold text-gray-500 dark:text-gray-400">{centreConfigs[centre.id]?.fontSize ?? 170}%</span>
                      <button onClick={() => setCentreFontSize(centre.id, Math.min(300, (centreConfigs[centre.id]?.fontSize ?? 170) + 10))} title="Increase title size"
                        className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:bg-white/40 dark:hover:bg-gray-700/40 hover:text-orange-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-1 shrink-0" title={centreConfigs[centre.id]?.showTitle ? 'Hide title on card' : 'Show title on card'}>
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5h16M4 12h16M4 19h10" /></svg>
                      <Toggle on={centreConfigs[centre.id]?.showTitle ?? false} onClick={() => updateCentreConfig(centre.id, { showTitle: !(centreConfigs[centre.id]?.showTitle ?? false) })} />
                    </div>
                    <button onClick={() => setCentrePasswordEditor(centrePasswordEditor === centre.id ? null : centre.id)} title="Password protect this centre"
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${centreConfigs[centre.id]?.password ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600' : 'text-gray-400 hover:bg-white/40 dark:hover:bg-gray-700/40 hover:text-orange-500'}`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </button>
                    <button onClick={() => setCentreContentEditor(centreContentEditor === centre.id ? null : centre.id)} title="Edit this centre's content"
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${centreContentEditor === centre.id ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600' : 'text-gray-400 hover:bg-white/40 dark:hover:bg-gray-700/40 hover:text-orange-500'}`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h7" /></svg>
                    </button>
                    <Toggle on={centreConfigs[centre.id]?.enabled ?? true} onClick={() => updateCentreConfig(centre.id, { enabled: !(centreConfigs[centre.id]?.enabled ?? true) })} />
                  </div>
                  {/* Centre password editor */}
                  {centrePasswordEditor === centre.id && (
                    <div className="px-3 pb-2.5 space-y-1.5">
                      <input
                        type="text"
                        placeholder="Password (leave empty to remove)"
                        value={centreConfigs[centre.id]?.password ?? ''}
                        onChange={e => updateCentreConfig(centre.id, { password: e.target.value })}
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                      />
                      <input
                        type="text"
                        placeholder="Hint (optional)"
                        value={centreConfigs[centre.id]?.hint ?? ''}
                        onChange={e => updateCentreConfig(centre.id, { hint: e.target.value })}
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                      />
                      <input
                        type="text"
                        placeholder="Locked message (optional)"
                        value={centreConfigs[centre.id]?.lockedMessage ?? ''}
                        onChange={e => updateCentreConfig(centre.id, { lockedMessage: e.target.value })}
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                      />
                      <button onClick={() => setCentrePasswordEditor(null)} className="w-full px-2 py-1 rounded-lg bg-orange-500 text-white text-[9px] font-semibold hover:bg-orange-600">
                        Done
                      </button>
                    </div>
                  )}

                  {/* Centre content editor — how content appears in this centre on the card */}
                  {centreContentEditor === centre.id && (() => {
                    const cc = centreConfigs[centre.id]
                    if (!cc) return null
                    const set = (patch: Partial<CentreConfig>) => updateCentreConfig(centre.id, patch)
                    const inputCls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40'
                    const MODES: { id: CentreContentMode; label: string; desc: string }[] = [
                      { id: 'items', label: centre.id === 'redeem' ? 'Rewards & Redeem links' : centre.id === 'exchange' ? 'Products & Exchange links' : 'Items', desc: centre.id === 'redeem' ? 'Rewards with a Redeem button that links where customers redeem.' : centre.id === 'exchange' ? 'Products with an Exchange button that links where customers trade.' : 'Cards with a link' },
                      { id: 'webhook', label: 'Webhook', desc: 'Pull live content from another platform via webhook.' },
                      { id: 'link', label: 'Description + Link', desc: 'A short description with a link to the place.' },
                      { id: 'integration', label: 'Integration', desc: 'Connect from other platforms — coming soon.' },
                    ]
                    return (
                      <div className="px-3 pb-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">Centre content</p>
                          <button onClick={() => setCentreContentEditor(null)} className="text-[9px] font-semibold text-orange-500 hover:text-orange-600">Done</button>
                        </div>
                        {/* Mode selector */}
                        <div className="grid grid-cols-1 gap-1.5">
                          {MODES.map(m => {
                            const active = cc.contentMode === m.id
                            return (
                              <button key={m.id} onClick={() => set({ contentMode: m.id })}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-colors ${active ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10' : 'border-gray-200 dark:border-gray-600 hover:border-orange-300'}`}>
                                <span className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                <span className="flex-1 min-w-0">
                                  <span className={`block text-[10px] font-semibold ${active ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-200'}`}>{m.label}</span>
                                  <span className="block text-[8px] text-gray-400 leading-tight">{m.desc}</span>
                                </span>
                              </button>
                            )
                          })}
                        </div>

                        {/* Content title */}
                        <div>
                          <label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-1">Content title</label>
                          <input type="text" value={cc.contentTitle} onChange={e => set({ contentTitle: e.target.value })} placeholder={centre.id === 'redeem' ? 'Redeem your rewards' : centre.id === 'exchange' ? 'What we exchange' : 'Featured content'} className={inputCls} />
                        </div>

                        {/* Items mode — add/edit rewards or products with link */}
                        {cc.contentMode === 'items' && (
                          <CentreItemsEditor centre={cc} set={set} />
                        )}

                        {/* Webhook mode */}
                        {cc.contentMode === 'webhook' && (
                          <div className="space-y-1.5">
                            <label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400">Webhook URL</label>
                            <input type="text" value={cc.webhookUrl} onChange={e => set({ webhookUrl: e.target.value })} placeholder="https://api.example.com/rewards/webhook" className={inputCls} />
                            <p className="text-[8px] text-gray-400 leading-snug">The card pulls live content from this endpoint. {centre.id === 'redeem' ? 'Rewards' : 'Products'} shown will update automatically.</p>
                          </div>
                        )}

                        {/* Link mode */}
                        {cc.contentMode === 'link' && (
                          <div className="space-y-1.5">
                            <div>
                              <label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                              <textarea rows={2} value={cc.description} onChange={e => set({ description: e.target.value })} placeholder={centre.id === 'redeem' ? 'Redeem cashback, loyalty points, gift cards and more…' : 'Exchange vouchers, coupons, offers and products…'} className={`${inputCls} resize-none`} />
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              <div>
                                <label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-1">Link label</label>
                                <input type="text" value={cc.linkLabel} onChange={e => set({ linkLabel: e.target.value })} placeholder={centre.id === 'redeem' ? 'Redeem now' : 'Start exchanging'} className={inputCls} />
                              </div>
                              <div>
                                <label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-1">Link URL</label>
                                <input type="text" value={cc.linkUrl} onChange={e => set({ linkUrl: e.target.value })} placeholder="https://mcom.example/redeem" className={inputCls} />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Integration mode — coming soon, toggle off by default */}
                        {cc.contentMode === 'integration' && (
                          <div className="space-y-1.5">
                            <label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400">Platform</label>
                            <select value={cc.integrationPlatform} onChange={e => set({ integrationPlatform: e.target.value })} className={inputCls}>
                              {['', 'MCOM Rewards', 'MCOM Mall', 'MCOM Pay', 'Partner System'].map(o => <option key={o} value={o}>{o || 'Choose platform…'}</option>)}
                            </select>
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2">
                              <div>
                                <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">Enable integration</p>
                                <p className="text-[8px] text-gray-400">Off by default — coming soon</p>
                              </div>
                              <Toggle on={cc.integrationEnabled} onClick={() => set({ integrationEnabled: !cc.integrationEnabled })} />
                            </div>
                            <p className="text-[8px] text-gray-400 leading-snug">While off, this centre will still show a “Coming soon” placeholder so it is never empty.</p>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Centre sections */}
                  <div className="p-2.5 space-y-2">
                    {!collapsedCentres[centre.id] && group.map(({ s, idx }, groupIndex) => {
                      const section = s
                      const index = idx
                      const def = SECTIONS.find(d => d.id === section.schemaId)!
                      const isOpen = expanded === section.uid
                      return (
                        <div key={section.uid} className={`bg-white dark:bg-gray-800 rounded-xl border transition-colors ${section.enabled ? 'border-gray-100 dark:border-gray-700' : 'border-dashed border-gray-200 dark:border-gray-700 opacity-80'}`}>
                          {/* Section header */}
                          <div className="p-3 flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${section.enabled ? 'bg-orange-500/10 text-orange-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={def.icon} /></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                {renaming?.uid === section.uid ? (
                                  <input
                                    autoFocus
                                    value={renaming.value}
                                    onChange={e => setRenaming({ uid: section.uid, value: e.target.value })}
                                    onBlur={commitRename}
                                    onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(null) }}
                                    className="w-40 text-xs font-semibold border border-orange-300 rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                                  />
                                ) : (
                                  <>
                                    <button onClick={() => setExpanded(isOpen ? null : section.uid)} className="text-xs font-semibold text-gray-800 dark:text-gray-200 hover:text-orange-600 text-left truncate">{section.name}</button>
                                    <button onClick={() => setRenaming({ uid: section.uid, value: section.name })} title="Rename section"
                                      className="w-4 h-4 rounded flex items-center justify-center text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-700 shrink-0">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                  </>
                                )}
                                {!section.enabled && <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400 shrink-0">HIDDEN</span>}
                              </div>
                              <p className="text-[9px] text-gray-400 truncate">{def.desc}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => moveSection(index, -1)} disabled={groupIndex === 0} title="Move up"
                                className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-orange-500 disabled:opacity-30 disabled:pointer-events-none">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                              </button>
                              <button onClick={() => moveSection(index, 1)} disabled={groupIndex === group.length - 1} title="Move down"
                                className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-orange-500 disabled:opacity-30 disabled:pointer-events-none">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                              </button>
                              <button onClick={() => duplicateSection(index)} title="Duplicate section"
                                className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-orange-500">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                              </button>
                              <select
                                value={section.centre ?? 'other'}
                                onChange={e => setSectionCentre(section.uid, e.target.value)}
                                title="Move section to another centre"
                                className="max-w-[64px] h-6 rounded-md border border-gray-200 dark:border-gray-600 text-[8px] px-1 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500/40"
                              >
                                {CENTRES.map(c => <option key={c.id} value={c.id}>{CENTRE_SHORT[c.id]}</option>)}
                              </select>
                              <Toggle on={section.enabled} onClick={() => updateSection(section.uid, { enabled: !section.enabled })} />
                              <button onClick={() => setExpanded(isOpen ? null : section.uid)} className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                              </button>
                            </div>
                          </div>

                          {/* Section body */}
                          {isOpen && (
                            <div className="border-t border-gray-100 dark:border-gray-700 px-3 py-3 space-y-3">
                              {section.schemaId === 'qr' ? (
                                <QrSectionBody section={section} updateValue={updateValue} onCustomize={openQrCustomizer} />
                              ) : section.schemaId === 'countdown' ? (
                                <CountdownSectionBody values={section.values} setValue={(k, v) => updateValue(section.uid, k, v)} />
                              ) : (
                                def.fields.map(field => {
                                  if (field.type === 'list' && field.itemFields) {
                                    const itemFields = field.itemFields
                                    const items = section.items[field.key] ?? []
                                    return (
                                      <div key={field.key}>
                                        <div className="flex items-center justify-between mb-1.5">
                                          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{field.label}</label>
                                          <div className="flex items-center gap-1.5">
                                            {field.key === 'images' && (
                                              <button onClick={() => startMultiUpload(section.uid, field.key)} title="Pick multiple images from file manager"
                                                className="text-[9px] font-semibold px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                                Upload images
                                              </button>
                                            )}
                                            <button onClick={() => addItem(section.uid, field.key)}
                                              className="text-[9px] font-semibold px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-500/10 text-orange-600 hover:bg-orange-100 flex items-center gap-1">
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                              Add {field.itemLabel ?? 'item'}
                                            </button>
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          {items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="border border-gray-100 dark:border-gray-700 rounded-lg p-2.5">
                                              <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">{field.itemLabel ?? 'Item'} {itemIndex + 1}</span>
                                                <div className="flex items-center gap-1">
                                                  <button onClick={() => moveItem(section.uid, field.key, itemIndex, -1)} disabled={itemIndex === 0}
                                                    className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                                  </button>
                                                  <button onClick={() => moveItem(section.uid, field.key, itemIndex, 1)} disabled={itemIndex === items.length - 1}
                                                    className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                  </button>
                                                  <button onClick={() => removeItem(section.uid, field.key, itemIndex)}
                                                    className="w-5 h-5 rounded flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                  </button>
                                                </div>
                                              </div>
                                              <div className="grid grid-cols-2 gap-2">
                                                {itemFields.map(ifd => (
                                                  <div key={ifd.key} className={ifd.type === 'textarea' || ifd.type === 'image' ? 'col-span-2' : ''}>
                                                    {ifd.type === 'toggle' ? (
                                                      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                                                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{ifd.label}</span>
                                                        <Toggle on={item[ifd.key] === 'true'} onClick={() => updateItem(section.uid, field.key, itemIndex, ifd.key, item[ifd.key] === 'true' ? '' : 'true')} />
                                                      </div>
                                                    ) : (
                                                      <FieldInput
                                                        label={ifd.label}
                                                        type={ifd.type === 'select' ? 'text' : ifd.type}
                                                        value={item[ifd.key] ?? ''}
                                                        placeholder={ifd.placeholder}
                                                        onChange={v => updateItem(section.uid, field.key, itemIndex, ifd.key, v)}
                                                      />
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          ))}
                                          {items.length === 0 && (
                                            <button onClick={() => addItem(section.uid, field.key)} className="w-full border border-dashed border-gray-200 dark:border-gray-600 rounded-lg py-2 text-[10px] text-gray-400 hover:text-orange-500 hover:border-orange-300">
                                              + Add {field.itemLabel ?? 'item'}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  }
                                  return (
                                    <FieldInput
                                      key={field.key}
                                      label={field.label}
                                      type={field.type}
                                      value={section.values[field.key] ?? ''}
                                      placeholder={field.placeholder}
                                      onChange={v => updateValue(section.uid, field.key, v)}
                                    />
                                  )
                                })
                              )}

                              {/* -------- Custom blocks (stack in order inside this section) -------- */}
                              <div className="border-t border-dashed border-gray-200 dark:border-gray-600 pt-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <label className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">Custom Content</label>
                                    <p className="text-[8px] text-gray-400">Add any block — they stack here in order (image up + text below, etc.)</p>
                                  </div>
                                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600">{section.blocks.length}</span>
                                </div>

                                {/* Block palette */}
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {CUSTOM_BLOCK_DEFS.map(def => (
                                    <button key={def.type} title={def.desc} onClick={() => addCustomBlock(section.uid, def.type)}
                                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[9px] font-medium text-gray-600 dark:text-gray-300 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={def.icon} /></svg>
                                      {def.name}
                                    </button>
                                  ))}
                                </div>

                                {/* Added blocks */}
                                {section.blocks.length > 0 && (
                                  <div className="space-y-2">
                                    {section.blocks.map((block, blockIndex) => {
                                      const bdef = CUSTOM_BLOCK_DEFS.find(d => d.type === block.type)!
                                      return (
                                        <div key={block.id} className="border border-orange-100 dark:border-orange-500/20 bg-orange-50/30 dark:bg-orange-500/5 rounded-lg overflow-hidden">
                                          {/* Block header */}
                                          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white/60 dark:bg-gray-800/60">
                                            <div className="w-6 h-6 rounded bg-orange-100 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={bdef.icon} /></svg>
                                            </div>
                                            <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-200 flex-1">{bdef.name}</span>
                                            <div className="flex items-center gap-1 shrink-0">
                                              <button onClick={() => moveCustomBlock(section.uid, block.id, -1)} disabled={blockIndex === 0} title="Move up"
                                                className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-orange-500 disabled:opacity-30 disabled:pointer-events-none">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                              </button>
                                              <button onClick={() => moveCustomBlock(section.uid, block.id, 1)} disabled={blockIndex === section.blocks.length - 1} title="Move down"
                                                className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-orange-500 disabled:opacity-30 disabled:pointer-events-none">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                              </button>
                                              <button onClick={() => removeCustomBlock(section.uid, block.id)} title="Remove"
                                                className="w-5 h-5 rounded flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                              </button>
                                            </div>
                                          </div>

                                          {/* Block fields */}
                                          <div className="p-2.5 space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                              {bdef.fields.map(f => (
                                                <div key={f.key} className={f.type === 'textarea' || f.type === 'image' ? 'col-span-2' : ''}>
                                                  {f.type === 'toggle' ? (
                                                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-2">
                                                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{f.label}</span>
                                                      <Toggle on={block.values[f.key] === 'true'} onClick={() => updateCustomBlock(section.uid, block.id, { values: { ...block.values, [f.key]: block.values[f.key] === 'true' ? '' : 'true' } })} />
                                                    </div>
                                                  ) : f.type === 'select' ? (
                                                    <div>
                                                      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{f.label}</label>
                                                      <select value={block.values[f.key] ?? f.options?.[0] ?? ''} onChange={e => updateCustomBlock(section.uid, block.id, { values: { ...block.values, [f.key]: e.target.value } })}
                                                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40">
                                                        {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                                      </select>
                                                    </div>
                                                  ) : (
                                                    <FieldInput label={f.label} type={f.type} value={block.values[f.key] ?? ''} placeholder={f.placeholder}
                                                      onChange={v => updateCustomBlock(section.uid, block.id, { values: { ...block.values, [f.key]: v } })} />
                                                  )}
                                                </div>
                                              ))}
                                            </div>

                                            {/* Form question options */}
                                            {bdef.hasOptions && (
                                              <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                                                <div className="flex items-center justify-between mb-1.5">
                                                  <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Answer options</label>
                                                  <button onClick={() => updateCustomBlock(section.uid, block.id, { options: [...block.options, `Option ${block.options.length + 1}`] })}
                                                    className="text-[9px] font-semibold px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-500/10 text-orange-600 hover:bg-orange-100 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                    Add option
                                                  </button>
                                                </div>
                                                <div className="space-y-1.5">
                                                  {block.options.map((opt, oi) => (
                                                    <div key={oi} className="flex items-center gap-1.5">
                                                      <span className="w-3 h-3 rounded-full border border-orange-300 dark:border-orange-500/40 shrink-0" />
                                                      <input type="text" value={opt} onChange={e => {
                                                        const options = block.options.map((o, i) => (i === oi ? e.target.value : o))
                                                        updateCustomBlock(section.uid, block.id, { options })
                                                      }}
                                                        className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40" />
                                                      <button onClick={() => updateCustomBlock(section.uid, block.id, { options: block.options.filter((_, i) => i !== oi) })}
                                                        className="w-5 h-5 rounded flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 shrink-0">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                      </button>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}

                                            {/* File upload formats */}
                                            {bdef.hasFormats && (
                                              <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                                                <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">Accepted file formats</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                  {UPLOAD_FORMATS.map(fmt => {
                                                    const active = block.formats.includes(fmt)
                                                    return (
                                                      <button key={fmt} onClick={() => {
                                                        const formats = active ? block.formats.filter(f => f !== fmt) : [...block.formats, fmt]
                                                        updateCustomBlock(section.uid, block.id, { formats })
                                                      }}
                                                        className={`px-2 py-1 rounded-md text-[9px] font-medium transition-colors ${active ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                                        {fmt}
                                                      </button>
                                                    )
                                                  })}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ==================== RIGHT — Live preview ==================== */}
          <div className="min-w-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden lg:sticky lg:top-4">
              <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Live Preview</h4>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">Auto-updates</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Click any component to adjust its font size.</p>
                <button onClick={() => setShowPreview(!showPreview)} className="text-[9px] text-gray-400 hover:text-gray-600">
                  {showPreview ? 'Hide' : 'Show'}
                </button>
              </div>
              {showPreview && (
                <div className="p-4">
                  <DesignVCardPreview sections={sections} centres={centreConfigs} selected={selectedDesign} onSelect={setSelectedDesign} onFontSizeChange={setSectionFontSize} />
                </div>
              )}
              {!showPreview && (
                <div className="p-8 text-center text-[11px] text-gray-400">Preview hidden</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== STEP 2 — Preview & Testing ==================== */}
      {activeStep === 'preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-gray-800 dark:text-white">Device Preview</h4>
                <p className="text-[10px] text-gray-400">See how the card looks on any screen.</p>
              </div>
              <div className="flex gap-1.5">
                {([['phone', 'Phone'], ['tablet', 'Tablet'], ['desktop', 'Desktop']] as const).map(([id, label]) => (
                  <button key={id} onClick={() => setPreviewDevice(id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${previewDevice === id ? 'bg-orange-500 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100'}`}>{label}</button>
                ))}
              </div>
            </div>
            <div className="p-6 flex justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <ScrollingVCard
                sections={sections}
                centres={centreConfigs}
                widthClass={previewDevice === 'phone' ? 'w-[300px]' : previewDevice === 'tablet' ? 'w-[480px]' : 'w-[700px]'}
                heightClass={previewDevice === 'phone' ? 'h-[540px]' : previewDevice === 'tablet' ? 'h-[580px]' : 'h-[620px]'}
              />
            </div>
            <p className="text-center text-[9px] text-gray-400 pb-4 -mt-2">
              Hover the preview to scroll through the whole card · click to pause · it stays paused until you hover
            </p>
          </div>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <h4 className="text-xs font-semibold text-gray-800 dark:text-white mb-3">Quick Tests</h4>
              <div className="space-y-2">
                {[
                  { name: 'QR Scan', pass: true },
                  { name: 'Redeem Reward', pass: true },
                  { name: 'Share Card', pass: true },
                  { name: 'Make Appointment', pass: false },
                  { name: 'Contact Form', pass: true },
                ].map(t => (
                  <button key={t.name} onClick={() => toast(t.pass ? `${t.name}: passed` : `${t.name}: needs attention`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <span className="text-[11px] font-medium text-gray-700 dark:text-gray-200">{t.name}</span>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center ${t.pass ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' : 'bg-red-50 dark:bg-red-500/10 text-red-500'}`}>
                      {t.pass ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <h4 className="text-xs font-semibold text-gray-800 dark:text-white mb-2">Test Result</h4>
              <p className="text-[10px] text-gray-400 leading-relaxed">4 of 5 tests passed. The appointment widget needs the booking URL set before publishing.</p>
              <button onClick={() => setActiveStep('content')} className="mt-3 w-full px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Fix in Content</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== STEP 3 — Assignment ==================== */}
      {activeStep === 'assignment' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-semibold text-gray-800 dark:text-white">Attach to Membership</h4>
                  <p className="text-[10px] text-gray-400">These memberships get this template by default. Click a tier to select the whole group, or pick individual levels.</p>
                </div>
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600">{assignMemberships.length} selected</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MEMBERSHIP_TIERS.map(tier => {
                  const onCount = tier.variants.filter(v => assignMemberships.includes(v)).length
                  const allOn = onCount === tier.variants.length
                  const someOn = onCount > 0 && !allOn
                  return (
                    <div key={tier.name} className={`rounded-xl border p-3 transition-colors ${allOn ? 'border-orange-400 bg-orange-50/50 dark:bg-orange-500/5' : 'border-gray-200 dark:border-gray-600'}`}>
                      <button onClick={() => toggleTier(tier.variants)} className="w-full flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 min-w-0">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${tier.dot}`} />
                          <span className="text-[12px] font-bold text-gray-800 dark:text-white">{tier.name}</span>
                          <span className="text-[9px] text-gray-400 shrink-0">{onCount}/{tier.variants.length}</span>
                        </span>
                        <span className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-colors ${allOn ? 'bg-orange-500 border-orange-500' : someOn ? 'border-orange-400 bg-orange-100 dark:bg-orange-500/20' : 'border-gray-300 dark:border-gray-600'}`}>
                          {allOn && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          {someOn && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                        </span>
                      </button>
                      <div className="mt-2.5 flex gap-1.5 flex-wrap">
                        {tier.variants.map(v => {
                          const on = assignMemberships.includes(v)
                          return (
                            <button key={v} onClick={() => toggleMembership(v)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${on ? 'bg-orange-500 text-white border-orange-500' : `${tier.chip} border-transparent hover:border-orange-300`}`}>
                              {v}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-600 p-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0" />
                  <span className="text-[12px] font-bold text-gray-800 dark:text-white">Partner</span>
                  <button onClick={() => toggleMembership('Partner')}
                    className={`ml-auto px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${assignMemberships.includes('Partner') ? 'bg-orange-500 text-white border-orange-500' : 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-transparent hover:border-orange-300'}`}>
                    Partner
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 h-fit">
            <h4 className="text-xs font-semibold text-gray-800 dark:text-white mb-3">Assignment Summary</h4>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700"><span className="text-gray-400">Memberships</span><span className="font-medium text-gray-700 dark:text-gray-200">{assignMemberships.length}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700"><span className="text-gray-400">Businesses affected</span><span className="font-medium text-gray-700 dark:text-gray-200">1,204</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700"><span className="text-gray-400">Consumers affected</span><span className="font-medium text-gray-700 dark:text-gray-200">3,418</span></div>
              <div className="flex justify-between py-1"><span className="text-gray-400">Default for new</span><span className="font-medium text-gray-700 dark:text-gray-200">Gold, Platinum</span></div>
            </div>
            <button onClick={() => toast.success('Assignment saved — applies when published')} className="mt-4 w-full px-3 py-2 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Save Assignment</button>
          </div>
        </div>
      )}

      {/* Activity & Version History live on the template list — see row actions. */}

      {/* Step help popup */}
      <StepHelpModal stepId={stepHelp} onClose={() => setStepHelp(null)} />

      {/* Auto-scroll preview modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h4 className="text-xs font-semibold text-gray-800 dark:text-white">Auto-Scroll Preview</h4>
                <p className="text-[10px] text-gray-400">Scans through the whole card — hover to scroll (desktop), tap to scroll or pause (mobile)</p>
              </div>
              <button onClick={() => setPreviewOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex items-start justify-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" onClick={() => setPreviewOpen(false)}>
              <div onClick={e => e.stopPropagation()}>
                <ScrollingVCard sections={sections} centres={centreConfigs} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Preview section renderer                                           */
/* ------------------------------------------------------------------ */

function PreviewCustomBlocks({ blocks, fontSize }: { blocks: CustomBlock[]; fontSize?: number }) {
  if (blocks.length === 0) return null
  const scale = (fontSize ?? 100) / 100
  const ts = (px: number) => `${Math.round(px * scale)}px`
  return (
    <div className="mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-600 space-y-1.5">
      {blocks.map(block => {
        const v = block.values
        switch (block.type) {
          case 'title': {
            const sizes: Record<string, number> = { Small: 9, Medium: 10, Large: 11, 'Extra Large': 12 }
            return (
              <p key={block.id} style={{ fontSize: ts(sizes[v.size] ?? 10) }} className={`${v.bold === 'true' ? 'font-bold' : 'font-semibold'} text-gray-800 dark:text-gray-100 ${v.align === 'Center' ? 'text-center' : v.align === 'Right' ? 'text-right' : ''}`}>
                {v.text || 'Title'}
              </p>
            )
          }
          case 'text': {
            return (
              <p key={block.id} style={{ fontSize: ts(v.large === 'true' ? 9 : 8) }} className={`${v.bold === 'true' ? 'font-bold' : ''} ${v.italic === 'true' ? 'italic' : ''} text-gray-600 dark:text-gray-300 ${v.align === 'Center' ? 'text-center' : v.align === 'Right' ? 'text-right' : ''}`}>
                {v.text || 'Your text here…'}
              </p>
            )
          }
          case 'paragraph':
            return (
              <p key={block.id} style={{ fontSize: ts(8) }} className={`leading-relaxed text-gray-500 dark:text-gray-400 ${v.align === 'Center' ? 'text-center' : v.align === 'Right' ? 'text-right' : ''}`}>
                {v.text || 'Your paragraph text goes here…'}
              </p>
            )
          case 'image':
            return (
              <div key={block.id} className={`${v.align === 'Center' ? 'flex justify-center' : v.align === 'Right' ? 'flex justify-end' : ''}`}>
                <div className={`${v.rounded === 'true' ? 'rounded-xl' : 'rounded-md'} w-24 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden`}>
                  {v.url ? (
                    <img src={v.url} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  )}
                </div>
                {v.caption && <p style={{ fontSize: ts(7) }} className="mt-0.5 text-gray-400 text-center">{v.caption}</p>}
              </div>
            )
          case 'link':
            return (
              <p key={block.id} style={{ fontSize: ts(8) }} className="font-medium text-orange-500 underline underline-offset-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                {v.label || 'Link'}
              </p>
            )
          case 'button': {
            const solid = v.style === 'Solid' || !v.style
            return (
              <div key={block.id} className={`${v.align === 'Center' ? 'flex justify-center' : v.align === 'Right' ? 'flex justify-end' : ''}`}>
                <div style={{ fontSize: ts(8) }} className={`${v.full === 'true' ? 'w-full' : ''} h-6 rounded-md flex items-center justify-center font-semibold ${solid ? 'bg-orange-500 text-white' : v.style === 'Ghost' ? 'text-orange-500' : 'border border-orange-400 text-orange-500'}`}>
                  {v.label || 'Button'}
                </div>
              </div>
            )
          }
          case 'form': {
            const isSelect = v.answerType === 'Dropdown' || v.answerType === 'Single choice' || v.answerType === 'Multiple choice'
            return (
              <div key={block.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-md p-1.5 space-y-1">
                <p style={{ fontSize: ts(8) }} className="font-semibold text-gray-700 dark:text-gray-200">
                  {v.question || 'Your question?'} {v.required === 'true' && <span className="text-red-400">*</span>}
                </p>
                {isSelect ? (
                  <div className="space-y-0.5">
                    {block.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full border border-orange-300 dark:border-orange-500/40" />
                        <span style={{ fontSize: ts(7) }} className="text-gray-500 dark:text-gray-400">{opt}</span>
                      </div>
                    ))}
                  </div>
                ) : v.answerType === 'Rating' ? (
                  <div style={{ fontSize: ts(8) }} className="flex gap-0.5 text-orange-400">★★★★★</div>
                ) : (
                  <div className="h-4 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800" />
                )}
              </div>
            )
          }
          case 'upload':
            return (
              <div key={block.id} className="border border-dashed border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 flex items-center gap-1.5">
                <svg className="w-3 h-3 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span style={{ fontSize: ts(7) }} className="text-gray-500 dark:text-gray-400 flex-1 truncate">{v.label || 'Upload a file'}</span>
                <span style={{ fontSize: ts(7) }} className="text-gray-400 shrink-0">{block.formats.join(', ')}</span>
              </div>
            )
          case 'divider':
            return (
              <div key={block.id} className="flex items-center gap-1.5">
                <div className={`flex-1 ${v.style === 'Dashed' ? 'border-t border-dashed border-gray-300 dark:border-gray-600' : v.style === 'Dotted' ? 'border-t border-dotted border-gray-300 dark:border-gray-600' : 'border-t border-gray-200 dark:border-gray-600'}`} />
              </div>
            )
          case 'spacer':
            return <div key={block.id} className={v.height === 'Large' ? 'h-6' : v.height === 'Medium' ? 'h-4' : 'h-2'} />
          default:
            return null
        }
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Phone preview body (shared by inline preview + auto-scroll modal)  */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Section lock gate — 6-digit PIN required to reveal a protected     */
/*  section on the published VCard. State is per-section (one PIN      */
/*  entry unlocks that section for the current viewer).                */
/* ------------------------------------------------------------------ */

export interface VCardProtectionConfig {
  enabled: boolean
  password: string
  hint: string
  sections: string[]
}

function SectionLockGate({ section, protection }: {
  section: SectionState
  protection: VCardProtectionConfig
}) {
  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState(false)

  if (unlocked) return null

  const submit = () => {
    if (pin === protection.password) {
      setUnlocked(true)
    } else {
      setError(true)
      setPin('')
    }
  }

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-500/5 p-4 text-center">
      <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
      </div>
      <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">{section.name}</p>
      <p className="text-[9px] text-gray-400 mt-0.5 mb-3">{protection.hint || 'Enter the 6-digit PIN to view this section'}</p>

      <div className="flex justify-center gap-1.5 mb-3">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className={`w-7 h-9 rounded-lg border flex items-center justify-center text-xs font-bold ${
            error ? 'border-red-400 bg-red-50 dark:bg-red-500/10 text-red-500'
              : pin.length > i ? 'border-amber-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-500'
          }`}>
            {pin[i] ?? ''}
          </span>
        ))}
      </div>

      <input
        type="password"
        inputMode="numeric"
        autoFocus
        value={pin}
        maxLength={6}
        onChange={e => {
          const digits = e.target.value.replace(/\D/g, '').slice(0, 6)
          setPin(digits)
          setError(false)
        }}
        onKeyDown={e => { if (e.key === 'Enter') submit() }}
        placeholder="••••••"
        className="w-28 mx-auto block text-center border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400"
      />

      {error && <p className="text-[9px] text-red-500 mt-2">Incorrect PIN — try again</p>}

      <button onClick={submit} className="mt-3 px-4 py-1.5 rounded-lg bg-amber-500 text-white text-[10px] font-semibold hover:bg-amber-600 transition-colors">
        Unlock Section
      </button>
    </div>
  )
}

export function VCardPhoneContent({ sections, centres, interactive, selected, onSelect, protection }: {
  sections: SectionState[]
  centres?: Record<string, CentreConfig>
  interactive?: boolean
  selected?: string | null
  onSelect?: (uid: string | null) => void
  protection?: { enabled: boolean; password: string; hint: string; sections: string[] }
}) {
  const banner = sections.find(s => s.schemaId === 'banner' && s.enabled)
  const profile = sections.find(s => s.schemaId === 'profile' && s.enabled)
  const countdown = sections.find(s => s.schemaId === 'countdown' && s.enabled)
  const profileScale = (profile?.fontSize ?? 100) / 100
  const profileTs = (px: number) => `${Math.round(px * profileScale)}px`

  /* Share / Exchange / Redeem — quick-access tabs pinned to the top of the
     VCard. Each tab jumps straight to the first section in that centre, so
     the tabs are navigation, not separate sheets or pages. */
  const CENTRE_TABS = [
    { id: 'share', label: 'Share', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z', cls: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { id: 'exchange', label: 'Exchange', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    { id: 'redeem', label: 'Redeem', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  ]

  const centreHasContent = (id: string) => {
    const cfg = centres?.[id]
    if (cfg && !cfg.enabled) return false
    const hasSections = sections.some(s =>
      s.enabled && s.schemaId !== 'banner' && s.schemaId !== 'profile' && s.schemaId !== 'countdown' && (s.centre ?? 'other') === id
    )
    const hasContent = !!cfg && (
      cfg.contentMode === 'webhook' ? !!cfg.webhookUrl
        : cfg.contentMode === 'link' ? !!(cfg.description || cfg.linkUrl)
          : cfg.contentMode === 'integration' ? !!cfg.integrationEnabled || !!cfg.integrationPlatform
            : (cfg.items?.length ?? 0) > 0
    )
    return hasSections || hasContent
  }

  const jumpToCentre = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const el = document.getElementById(`vcard-centre-${id}`)
    if (el) {
      const scroller = el.closest('.overflow-y-auto') as HTMLElement | null
      if (scroller) {
        const top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop
        scroller.scrollTo({ top: Math.max(0, top - 48), behavior: 'smooth' })
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    /* Pause any ScrollingVCard auto-scroll so the jump isn't fought. */
    window.dispatchEvent(new CustomEvent('vcard-jump'))
  }

  const tabs = CENTRE_TABS.filter(t => centreHasContent(t.id))

  return (
    <div className="relative">
      {tabs.length > 0 && (
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-100 dark:border-gray-700 px-3 py-2">
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={(e) => jumpToCentre(e, t.id)}
                title={`Jump to ${t.label.toLowerCase()} content`}
                className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-colors active:scale-[0.97] ${t.cls}`}
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} /></svg>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div id="vcard-centre-header">
      {countdown && (
        <div className="relative">
          {interactive && onSelect && (
            <div
              className={`absolute inset-0 z-20 cursor-pointer rounded-lg transition-colors ${selected === countdown.uid ? 'ring-2 ring-orange-500' : 'hover:ring-1 hover:ring-orange-400/70'}`}
              onClick={() => onSelect(selected === countdown.uid ? null : countdown.uid)}
              title="Click to adjust this section's font size"
            />
          )}
          <div className="px-3 pt-3">
            <PreviewSection def={SECTIONS.find(d => d.id === 'countdown')!} section={countdown} />
          </div>
        </div>
      )}

      {banner && (
        <div className="relative h-24 overflow-hidden bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600">
          {banner.values.image ? (
            <img src={banner.values.image} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          )}
        </div>
      )}

      {profile && (
        <div className={`relative ${banner ? '-mt-9' : 'pt-3'}`}>
          {interactive && onSelect && (
            <div
              className={`absolute inset-0 z-20 cursor-pointer rounded-lg transition-colors ${selected === profile.uid ? 'ring-2 ring-orange-500' : 'hover:ring-1 hover:ring-orange-400/70'}`}
              onClick={() => onSelect(selected === profile.uid ? null : profile.uid)}
              title="Click to adjust this section's font size"
            />
          )}
          <div className={`px-4 pb-4 text-center relative z-10`}>
            <div className="mx-auto w-16 h-16 rounded-full border-4 border-white dark:border-gray-900 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden shadow-md">
              {profile.values.avatar ? (
                <img src={profile.values.avatar} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
              ) : (
                <span style={{ fontSize: profileTs(18) }} className="text-white font-bold">{profile.values.name.charAt(0) || 'J'}</span>
              )}
            </div>
            <h3 style={{ fontSize: profileTs(14) }} className="mt-2 font-bold text-gray-900 dark:text-white truncate">{profile.values.name || 'Business Name'}</h3>
            <p style={{ fontSize: profileTs(10) }} className="text-orange-500 font-medium">{profile.values.designation || 'Designation'}</p>
            {profile.values.description && <p style={{ fontSize: profileTs(9) }} className="mt-1 text-gray-400 line-clamp-2">{profile.values.description}</p>}
          </div>
        </div>
      )}

      </div>
      <div className="px-3 pb-6 space-y-6">
        {CENTRE_ORDER.map(centreId => {
          const cfg = centres?.[centreId]
          if (cfg && !cfg.enabled) return null
          const groupSections = sections
            .filter(s => s.enabled && s.schemaId !== 'banner' && s.schemaId !== 'profile' && s.schemaId !== 'countdown' && (s.centre ?? 'other') === centreId)
          const hasCentreContent = !!cfg && (cfg.contentMode === 'webhook' ? !!cfg.webhookUrl : cfg.contentMode === 'link' ? !!(cfg.description || cfg.linkUrl) : cfg.contentMode === 'integration' ? !!cfg.integrationEnabled || !!cfg.integrationPlatform : (cfg.items?.length ?? 0) > 0)
          if (groupSections.length === 0 && !hasCentreContent) return null
          const locked = !!cfg?.password
          const titleScale = (cfg?.fontSize ?? 170) / 100
          const titleTs = (px: number) => '' + Math.round(px * titleScale) + 'px'
          return (
            <div key={centreId} id={`vcard-centre-${centreId}`} className="space-y-3 scroll-mt-12">
              {cfg?.showTitle && (
                <div className="flex items-center gap-1.5 px-1">
                  {locked && (
                    <svg className="w-3 h-3 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  )}
                  <p style={{ fontSize: titleTs(12) }} className="font-bold text-gray-700 dark:text-gray-200 truncate">
                    {cfg.name}
                  </p>
                  {locked && (
                    <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 font-semibold shrink-0">Locked</span>
                  )}
                </div>
              )}
              {groupSections.map(section => {
                const def = SECTIONS.find(d => d.id === section.schemaId)
                /* Skip sections the renderer has no schema for (e.g. centre-only
                   ids like exchange/redeem) instead of crashing the preview. */
                if (!def) return null
                const isProtected = !!protection?.enabled && !!protection.password && protection.sections.includes(section.schemaId)
                return (
                  <div key={section.uid} className="relative">
                    {interactive && onSelect && (
                      <div
                        className={`absolute inset-0 z-20 cursor-pointer rounded-lg transition-colors ${selected === section.uid ? 'ring-2 ring-orange-500' : 'hover:ring-1 hover:ring-orange-400/70'}`}
                        onClick={() => onSelect(selected === section.uid ? null : section.uid)}
                        title="Click to adjust this section's font size"
                      />
                    )}
                    {isProtected ? (
                      <SectionLockGate section={section} protection={protection} />
                    ) : (
                      <PreviewSection def={def} section={section} />
                    )}
                  </div>
                )
              })}
              {cfg && <PreviewCentreContent centre={cfg} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Design preview — click any section on the phone preview to select  */
/*  it and adjust its font size with the − / + stepper. Font size is   */
/*  a percentage (default 100%) stored on the section and applied to   */
/*  every text element in that section.                                */
/* ------------------------------------------------------------------ */

const FONT_MIN = 50
const FONT_MAX = 300
const FONT_STEP = 10
const FONT_DEFAULT = 170

function DesignVCardPreview({ sections, centres, selected, onSelect, onFontSizeChange }: {
  sections: SectionState[]
  centres?: Record<string, CentreConfig>
  selected: string | null
  onSelect: (uid: string | null) => void
  onFontSizeChange: (uid: string, fontSize: number) => void
}) {
  const sel = sections.find(s => s.uid === selected) ?? null
  const fontSize = sel?.fontSize ?? FONT_DEFAULT

  const adjust = (delta: number) => {
    if (!sel) return
    const next = Math.min(FONT_MAX, Math.max(FONT_MIN, fontSize + delta))
    onFontSizeChange(sel.uid, next)
  }

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
            <button onClick={() => onFontSizeChange(sel.uid, 100)} disabled={fontSize === 100}
              className="ml-1 px-2 py-1 rounded-lg text-[9px] font-semibold text-orange-600 border border-orange-200 dark:border-orange-500/40 hover:bg-orange-100 dark:hover:bg-orange-500/10 disabled:opacity-40">
              Reset
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-600 px-3 py-2.5 flex items-center gap-2 text-[10px] text-gray-400">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Click any component on the phone preview to select it and adjust its font size.
        </div>
      )}
      <div className="p-4 flex justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="w-[340px] rounded-[28px] border-[6px] border-gray-900 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
          <VCardPhoneContent sections={sections} centres={centres} interactive selected={selected} onSelect={onSelect} />
        </div>
      </div>
      <p className="text-center text-[9px] text-gray-400 dark:text-gray-500 mt-2">
        Click a component to select it · use the stepper to increase or decrease its font size · size saves with the template.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Preview of per-centre content (items with Redeem/Exchange links,   */
/*  webhook placeholder, description+link, or coming-soon integration).*/
/* ------------------------------------------------------------------ */

function PreviewCentreContent({ centre }: { centre: CentreConfig }) {
  const scale = (centre.fontSize ?? 170) / 100
  const ts = (px: number) => `${Math.round(px * scale)}px`
  const baseCard = 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-2.5'

  const renderItems = () => {
    if ((centre.items?.length ?? 0) === 0) return null
    return (
      <div className={baseCard}>
        {centre.contentTitle && (
          <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 mb-1.5">{centre.contentTitle}</p>
        )}
        <div className="space-y-1.5">
          {centre.items.slice(0, 4).map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-md p-1.5">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                {item.image ? (
                  <img src={item.image} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
                ) : (
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={centre.id === 'redeem' ? 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' : 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'} /></svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p style={{ fontSize: ts(8) }} className="font-semibold text-gray-600 dark:text-gray-300 truncate">{item.title || (centre.id === 'redeem' ? 'Reward' : 'Product')}</p>
                  {(item.price || item.value) && (
                    <span style={{ fontSize: ts(8) }} className="font-bold text-orange-500 shrink-0">{(item.value ?? item.price)}</span>
                  )}
                </div>
                {item.description && <p style={{ fontSize: ts(7) }} className="text-gray-400 truncate">{item.description}</p>}
              </div>
              {item.linkUrl && (
                <a href={item.linkUrl} target="_blank" rel="noreferrer" style={{ fontSize: ts(7) }}
                  className={`shrink-0 h-5 px-2 rounded-md flex items-center font-semibold ${centre.id === 'redeem' ? 'bg-orange-500 text-white' : 'border border-orange-300 dark:border-orange-500/40 text-orange-500'}`}>
                  {item.linkLabel || (centre.id === 'redeem' ? 'Redeem' : 'Exchange')}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (centre.contentMode === 'webhook') {
    return (
      <div className={baseCard}>
        <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 mb-1">{centre.contentTitle || 'Live content'}</p>
        <p style={{ fontSize: ts(8) }} className="text-gray-400 truncate">Pulling live {centre.id === 'redeem' ? 'rewards' : 'products'} from webhook…</p>
        {centre.webhookUrl && <p style={{ fontSize: ts(7) }} className="mt-1 text-orange-500 truncate">{centre.webhookUrl}</p>}
      </div>
    )
  }

  if (centre.contentMode === 'link') {
    if (!centre.description && !centre.linkUrl) return null
    return (
      <div className={baseCard}>
        {centre.contentTitle && <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 mb-1">{centre.contentTitle}</p>}
        {centre.description && <p style={{ fontSize: ts(8) }} className="text-gray-500 dark:text-gray-400 leading-relaxed">{centre.description}</p>}
        {centre.linkUrl && (
          <a href={centre.linkUrl} target="_blank" rel="noreferrer" style={{ fontSize: ts(8) }}
            className={`mt-1.5 h-6 px-3 rounded-md flex items-center justify-center font-semibold ${centre.id === 'redeem' ? 'bg-orange-500 text-white' : 'border border-orange-300 dark:border-orange-500/40 text-orange-500'}`}>
            {centre.linkLabel || 'Learn more'}
          </a>
        )}
      </div>
    )
  }

  if (centre.contentMode === 'integration') {
    return (
      <div className={`${baseCard} flex items-center gap-2`}>
        <svg className="w-3.5 h-3.5 text-orange-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: ts(8) }} className="font-semibold text-gray-600 dark:text-gray-300">
            {centre.integrationEnabled ? `Connected to ${centre.integrationPlatform || 'platform'}` : centre.integrationPlatform ? `Coming soon on ${centre.integrationPlatform}` : 'Coming soon'}
          </p>
          <p style={{ fontSize: ts(7) }} className="text-gray-400 truncate">{centre.contentTitle || `We'll bring ${centre.id === 'redeem' ? 'rewards' : 'products'} here soon.`}</p>
        </div>
      </div>
    )
  }

  return renderItems()
}

function PreviewSection({ def, section }: { def: SectionDef; section: SectionState }) {
  const title = section.values.heading || section.name

  const baseCard = 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-2.5'
  return (
    <div>
      {renderSectionBody(def, section, title, baseCard)}
      <PreviewCustomBlocks blocks={section.blocks} fontSize={section.fontSize} />
    </div>
  )
}

function renderSectionBody(def: SectionDef, section: SectionState, title: string, baseCard: string) {
  const scale = (section.fontSize ?? 100) / 100
  const ts = (px: number) => `${Math.round(px * scale)}px`
  switch (def.id) {
    case 'social': {
      const icons: Record<string, string> = {
        Facebook: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
        Instagram: 'M16 3a5 5 0 015 5v8a5 5 0 01-5 5H8a5 5 0 01-5-5V8a5 5 0 015-5h8zm0 2H8a3 3 0 00-3 3v8a3 3 0 003 3h8a3 3 0 003-3V8a3 3 0 00-3-3zM12 8.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm0 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm4.5-3.25a.75.75 0 110 1.5.75.75 0 010-1.5z',
        WhatsApp: 'M12 2a10 10 0 00-8.66 15L2 22l5.16-1.35A10 10 0 1012 2zm5.5 14.14c-.23.65-1.35 1.24-1.86 1.28-.5.05-1.13.23-3.8-.79-3.2-1.26-5.22-4.5-5.38-4.7-.16-.21-1.28-1.7-1.28-3.25 0-1.55.81-2.31 1.1-2.63.29-.32.63-.4.84-.4h.6c.19 0 .45-.03.69.53.25.57.84 2.06.91 2.21.08.16.13.34.03.55-.1.21-.15.34-.3.53-.15.18-.31.41-.44.55-.15.15-.3.31-.13.6.17.29.75 1.24 1.61 2 .1.1.19.15.29.23.04.04.09.08.13.11.1.1.15.15.25.13.1-.02.44-.18 1-.6.44-.34.75-.52.85-.74.11-.21.13-.37.19-.6.06-.23.03-.44-.02-.6-.05-.16-.69-.16-1.42-.86-.55-.53-.98-.9-1.09-1.06-.12-.16-.13-.32.02-.52.11-.17.2-.32.3-.47.16-.25.36-.58.48-.83.12-.25.04-.4-.02-.5-.06-.1-.5-1.2-.68-1.64-.18-.43-.36-.37-.5-.38h-.42c-.12 0-.33.05-.5.24-.17.19-.65.63-.65 1.55 0 .92.67 1.8.76 1.93.09.13 1.32 2.02 3.2 2.83.45.19.8.3 1.07.39.45.14.86.12 1.18.07.36-.05 1.1-.45 1.26-.88.16-.43.16-.8.11-.88-.05-.08-.18-.13-.38-.23z',
        LinkedIn: 'M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.27c-.96 0-1.74-.78-1.74-1.74s.78-1.74 1.74-1.74 1.74.78 1.74 1.74-.78 1.74-1.74 1.74zm13.5 12.27h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-11h2.88v1.5h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.6v6.46z',
        'Twitter / X': 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
        YouTube: 'M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5 3-5 3z',
        Telegram: 'M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
        TikTok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
        Other: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101',
      }
      const links = section.items.links ?? []
      return (
        <div className={baseCard}>
          <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 mb-1.5">{section.name}</p>
          <div className="flex gap-2">
            {links.slice(0, 5).map((link, i) => (
              <span key={i} className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d={icons[link.platform] ?? icons.Other} /></svg>
              </span>
            ))}
          </div>
        </div>
      )
    }
    case 'contacts': {
      const cards = section.items.cards ?? []
      return (
        <div className={baseCard}>
          <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 mb-1.5">{section.name}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {cards.map((card, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-md px-2 py-1.5">
                <p style={{ fontSize: ts(7) }} className="text-gray-400 uppercase">{card.label || card.type}</p>
                <p style={{ fontSize: ts(8) }} className="font-medium text-gray-700 dark:text-gray-200 truncate">{card.value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }
    case 'appointment':
    case 'contactForm':
      return (
        <div className={baseCard}>
          <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 mb-1">{title}</p>
          <div style={{ fontSize: ts(8) }} className="w-full h-6 rounded-md bg-orange-500 text-white flex items-center justify-center font-semibold">
            {section.values.button || 'Get Started'}
          </div>
        </div>
      )
    case 'qr': {
      const mode = section.values.qrMode || 'Generate by System'
      const qrSize = section.values.qrSize || 'Medium'
      const sizeClass = qrSize === 'Extra Large' ? 'w-20 h-20' : qrSize === 'Large' ? 'w-16 h-16' : qrSize === 'Small' ? 'w-10 h-10' : 'w-14 h-14'
      return (
        <div className={baseCard}>
          <div className="flex items-center justify-between mb-1.5">
            <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200">{section.name}</p>
            <span style={{ fontSize: ts(7) }} className="px-1.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 font-semibold">
              {mode === 'Generate by System' ? 'Auto' : mode === 'Upload from File' ? 'Uploaded' : 'User adds'}
            </span>
          </div>
          <div className={`flex items-center ${section.values.qrPosition === 'Center' ? 'justify-center' : section.values.qrPosition === 'Left' ? 'justify-start' : 'justify-end'}`}>
            <QrShape section={section} sizeClass={sizeClass} />
          </div>
          <p style={{ fontSize: ts(7) }} className="mt-1.5 text-gray-400 truncate">{section.values.qrType ? `${section.values.qrType}${section.values.qrDynamic === 'true' ? ' · dynamic' : ''}` : ''}</p>
        </div>
      )
    }
    case 'services': {
      const list = section.items.items ?? []
      return (
        <div className={baseCard}>
          <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 mb-1.5">{section.name}</p>
          <div className="space-y-1.5">
            {list.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span style={{ fontSize: ts(10) }} className="w-4 text-center">{item.icon || '•'}</span>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: ts(8) }} className="font-semibold text-gray-600 dark:text-gray-300 truncate">{item.title || 'Service'}</p>
                  {item.description && <p style={{ fontSize: ts(7) }} className="text-gray-400 truncate">{item.description}</p>}
                </div>
              </div>
            ))}
            {list.length === 0 && <p style={{ fontSize: ts(8) }} className="text-gray-400">No services added</p>}
          </div>
        </div>
      )
    }
    case 'gallery': {
      const list = section.items.images ?? []
      return (
        <div className={baseCard}>
          <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 mb-1.5">{section.name}</p>
          <div className="grid grid-cols-3 gap-1">
            {list.slice(0, 6).map((img, i) => (
              <div key={i} className="aspect-square rounded-md bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
                {img.url ? (
                  <img src={img.url} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
                ) : (
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    }
    case 'products': {
      const list = section.items.items ?? []
      return (
        <div className={baseCard}>
          <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 mb-1.5">{section.name}</p>
          <div className="space-y-1.5">
            {list.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-md p-1.5">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
                  ) : (
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p style={{ fontSize: ts(8) }} className="font-semibold text-gray-600 dark:text-gray-300 truncate">{item.title || 'Product'}</p>
                    {item.price && <span style={{ fontSize: ts(8) }} className="font-bold text-orange-500 shrink-0">{item.price}</span>}
                  </div>
                  {item.description && <p style={{ fontSize: ts(7) }} className="text-gray-400 truncate">{item.description}</p>}
                </div>
              </div>
            ))}
            {list.length === 0 && <p style={{ fontSize: ts(8) }} className="text-gray-400">No products added</p>}
          </div>
        </div>
      )
    }
    case 'testimonials': {
      const list = section.items.items ?? []
      return (
        <div className={baseCard}>
          <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 mb-1.5">{section.name}</p>
          {list.slice(0, 2).map((item, i) => (
            <div key={i} className="mb-1.5 last:mb-0">
              <p style={{ fontSize: ts(8) }} className="italic text-gray-500 dark:text-gray-400 line-clamp-2">"{item.quote || 'Great experience!'}"</p>
              <div className="mt-1 flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden">
                  {item.avatar ? (
                    <img src={item.avatar} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
                  ) : (
                    <span style={{ fontSize: ts(6) }} className="text-white font-bold">{(item.name || '?').charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: ts(8) }} className="font-semibold text-gray-600 dark:text-gray-300">{item.name || 'Customer'}</p>
                  {item.role && <p style={{ fontSize: ts(7) }} className="text-gray-400">{item.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }
    case 'blog': {
      const list = section.items.items ?? []
      return (
        <div className={baseCard}>
          <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 mb-1.5">{section.name}</p>
          {list.slice(0, 1).map((item, i) => (
            <div key={i} className="flex gap-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-md p-1.5">
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                {item.image ? (
                  <img src={item.image} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
                ) : (
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" /></svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: ts(8) }} className="font-semibold text-gray-600 dark:text-gray-300 truncate">{item.title || 'Blog post'}</p>
                {item.date && <p style={{ fontSize: ts(7) }} className="text-gray-400">{item.date}</p>}
              </div>
            </div>
          ))}
        </div>
      )
    }
    case 'hours': {
      const days = section.items.days ?? []
      return (
        <div className={baseCard}>
          <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 mb-1.5">{section.name}</p>
          <div className="space-y-0.5">
            {days.map((day, i) => (
              <div key={i} style={{ fontSize: ts(8) }} className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">{day.day || 'Day'}</span>
                <span className={day.closed === 'true' ? 'text-red-400 font-medium' : 'text-gray-600 dark:text-gray-300'}>{day.closed === 'true' ? 'Closed' : (day.hours || '—')}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    case 'share':
      return (
        <div className="flex gap-2">
          <div style={{ fontSize: ts(8) }} className="flex-1 h-7 rounded-md bg-orange-500 text-white flex items-center justify-center font-semibold">
            {section.values.downloadLabel || 'Download Vcard'}
          </div>
          <div style={{ fontSize: ts(8) }} className="flex-1 h-7 rounded-md border border-orange-300 dark:border-orange-500/40 text-orange-500 flex items-center justify-center font-semibold">
            {section.values.shareLabel || 'Share'}
          </div>
        </div>
      )
    case 'exchange': {
      const list = section.items.items ?? []
      return (
        <div className={baseCard}>
          <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 mb-1">{section.values.label || 'Exchange Contact'}</p>
          {section.values.description && <p style={{ fontSize: ts(8) }} className="text-gray-400 mb-1.5">{section.values.description}</p>}
          <div className="space-y-1.5">
            {list.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-md p-1.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p style={{ fontSize: ts(8) }} className="font-semibold text-gray-600 dark:text-gray-300 truncate">{item.title || 'Product'}</p>
                    {item.price && <span style={{ fontSize: ts(8) }} className="font-bold text-orange-500 shrink-0">{item.price}</span>}
                  </div>
                  {item.description && <p style={{ fontSize: ts(7) }} className="text-gray-400 truncate">{item.description}</p>}
                </div>
                {item.linkUrl && (
                  <a href={item.linkUrl} target="_blank" rel="noreferrer" style={{ fontSize: ts(7) }}
                    className="shrink-0 h-5 px-2 rounded-md flex items-center font-semibold border border-orange-300 dark:border-orange-500/40 text-orange-500">
                    {item.linkLabel || 'Exchange'}
                  </a>
                )}
              </div>
            ))}
            {list.length === 0 && <p style={{ fontSize: ts(8) }} className="text-gray-400">No products added</p>}
          </div>
        </div>
      )
    }
    case 'redeem': {
      const list = section.items.items ?? []
      return (
        <div className={baseCard}>
          <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 mb-1">{section.values.label || 'Redeem Rewards'}</p>
          <div className="space-y-1.5">
            {list.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-md p-1.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p style={{ fontSize: ts(8) }} className="font-semibold text-gray-600 dark:text-gray-300 truncate">{item.title || 'Reward'}</p>
                    {item.value && <span style={{ fontSize: ts(8) }} className="font-bold text-orange-500 shrink-0">{item.value}</span>}
                  </div>
                  {item.description && <p style={{ fontSize: ts(7) }} className="text-gray-400 truncate">{item.description}</p>}
                </div>
                {item.linkUrl && (
                  <a href={item.linkUrl} target="_blank" rel="noreferrer" style={{ fontSize: ts(7) }}
                    className="shrink-0 h-5 px-2 rounded-md flex items-center font-semibold bg-orange-500 text-white">
                    {item.linkLabel || 'Redeem'}
                  </a>
                )}
              </div>
            ))}
            {list.length === 0 && <p style={{ fontSize: ts(8) }} className="text-gray-400">No rewards added</p>}
          </div>
        </div>
      )
    }
    case 'buildGroup':
      return (
        <div className={baseCard}>
          <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 mb-1">{section.values.label || 'Build Group'}</p>
          {section.values.description && <p style={{ fontSize: ts(8) }} className="text-gray-400 mb-1.5">{section.values.description}</p>}
          <div style={{ fontSize: ts(8) }} className="h-7 rounded-md border border-orange-300 dark:border-orange-500/40 text-orange-500 flex items-center justify-center font-semibold">
            {section.values.button || 'Join Group'}
          </div>
        </div>
      )
    case 'password':
      if (!section.values.password) return null
      return (
        <div className={baseCard}>
          <div className="flex items-center gap-2 mb-1.5">
            <svg className="w-3.5 h-3.5 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200">{section.values.lockedMessage || 'Password protected'}</p>
          </div>
          <div style={{ fontSize: ts(8) }} className="flex items-center gap-1.5">
            <span className="flex-1 h-7 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 flex items-center px-2 text-gray-400">
              {section.values.password ? '•'.repeat(Math.max(4, section.values.password.length)) : '••••'}
            </span>
            <span className="h-7 px-2 rounded-md bg-orange-500 text-white flex items-center font-semibold">Unlock</span>
          </div>
          {section.values.hint && <p style={{ fontSize: ts(7) }} className="mt-1 text-gray-400">{section.values.hint}</p>}
        </div>
      )
    case 'map':
      return (
        <div className="h-16 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex flex-col items-center justify-center">
          <svg className="w-4 h-4 text-orange-500 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <p style={{ fontSize: ts(7) }} className="text-gray-500 dark:text-gray-400 truncate px-2 max-w-full">{section.values.address || 'Business address'}</p>
        </div>
      )
    case 'countdown':
      return (
        <div className={baseCard}>
          <SeasonCountdown
            seasonIds={section.values.seasonIds ?? ''}
            label={section.values.label || 'Season ends in'}
            color={section.values.color || '#F97316'}
            size="sm"
            showIdle
          />
        </div>
      )
    case 'about':
      return (
        <div className={baseCard}>
          <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 mb-1">{section.values.heading || 'About Us'}</p>
          {section.values.text && <p style={{ fontSize: ts(8) }} className="text-gray-400 line-clamp-3 leading-relaxed">{section.values.text}</p>}
        </div>
      )
    case 'website':
      return (
        <div className={baseCard}>
          <div style={{ fontSize: ts(8) }} className="flex items-center gap-1.5 text-orange-500 font-semibold">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {section.values.label || 'Visit our website'}
          </div>
          {section.values.url && <p style={{ fontSize: ts(7) }} className="mt-0.5 text-gray-400 truncate">{section.values.url}</p>}
        </div>
      )
    case 'video':
    case 'evergreen': {
      const isLive = section.values.mode === 'Live streaming'
      return (
        <div className={baseCard}>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: ts(8) }} className={`w-6 h-6 rounded-md flex items-center justify-center text-white font-bold ${isLive ? 'bg-red-500' : 'bg-orange-500'}`}>▶</span>
            <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 truncate">{section.values.title || (isLive ? 'Live Stream' : 'Video')}</p>
            {isLive && <span style={{ fontSize: ts(7) }} className="ml-auto px-1.5 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 font-semibold shrink-0">LIVE</span>}
          </div>
          {section.values.url && <p style={{ fontSize: ts(7) }} className="text-gray-400 truncate">{section.values.url}</p>}
        </div>
      )
    }
    case 'payment': {
      const list = section.items.methods ?? []
      return (
        <div className={baseCard}>
          <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 mb-1.5">{section.name}</p>
          <div className="flex flex-wrap gap-1">
            {list.filter(m => m.active !== 'false' && m.method).slice(0, 6).map((m, i) => (
              <span key={i} style={{ fontSize: ts(7) }} className="px-1.5 py-0.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-medium">{m.method}</span>
            ))}
            {list.length === 0 && <p style={{ fontSize: ts(8) }} className="text-gray-400">No payment methods added</p>}
          </div>
        </div>
      )
    }
    case 'offers':
    case 'rewards':
    case 'coupons':
    case 'campaigns': {
      const list = section.items.items ?? []
      return (
        <div className={baseCard}>
          <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 mb-1.5">{section.name}</p>
          <div className="space-y-1.5">
            {list.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-md p-1.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p style={{ fontSize: ts(8) }} className="font-semibold text-gray-600 dark:text-gray-300 truncate">{item.title || 'Item'}</p>
                    {item.value && <span style={{ fontSize: ts(8) }} className="font-bold text-orange-500 shrink-0">{item.value}</span>}
                  </div>
                  {item.description && <p style={{ fontSize: ts(7) }} className="text-gray-400 truncate">{item.description}</p>}
                </div>
                {item.code && <span style={{ fontSize: ts(7) }} className="shrink-0 px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-500/10 text-orange-500 font-mono font-semibold">{item.code}</span>}
              </div>
            ))}
            {list.length === 0 && <p style={{ fontSize: ts(8) }} className="text-gray-400">No items added</p>}
          </div>
        </div>
      )
    }
    case 'documents': {
      const list = section.items.items ?? []
      return (
        <div className={baseCard}>
          <p style={{ fontSize: ts(10) }} className="font-bold text-gray-700 dark:text-gray-200 mb-1.5">{section.name}</p>
          <div className="space-y-1">
            {list.slice(0, 4).map((doc, i) => (
              <div key={i} style={{ fontSize: ts(8) }} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="truncate">{doc.title || 'Document'}</span>
                {doc.type && <span style={{ fontSize: ts(7) }} className="ml-auto shrink-0 px-1 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600">{doc.type}</span>}
              </div>
            ))}
            {list.length === 0 && <p style={{ fontSize: ts(8) }} className="text-gray-400">No documents added</p>}
          </div>
        </div>
      )
    }
    default:
      return null
  }
}
