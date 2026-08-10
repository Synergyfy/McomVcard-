import { useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getCardTemplate, nextCardTemplateId, nextCardTemplateNumber, upsertCardTemplate,
  defaultFriendsFamily, normalizeFriendsFamily, summarizeFfTiers,
  type CardSectionState, type CardFaces, type CustomBlock, type CustomBlockType,
  type FriendsFamilyConfig,
} from '../../../services/cardTemplateStore'
import { CardPreview, DesignCardPreview } from '../../../components/admin/CardPreview'
import QrCodeSvg from '../../../components/admin/QrCodeSvg'
import ColorPicker from '../../../components/common/ColorPicker'
import { CountdownSectionBody } from '../../../components/admin/SeasonCountdown'
import { CoreActivitiesPanel, CORE_ACTIVITIES } from '../../../components/admin/CoreActivities'
import { loadSectors, loadSeasons } from '../../../services/catalogStore'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type FieldType = 'text' | 'textarea' | 'image' | 'select' | 'toggle' | 'list' | 'color'

interface ItemFieldDef {
  key: string
  label: string
  type: 'text' | 'select' | 'toggle'
  options?: string[]
  placeholder?: string
}

interface FieldDef {
  key: string
  label: string
  type: FieldType
  options?: string[]
  placeholder?: string
  itemFields?: ItemFieldDef[]
  itemLabel?: string
}

interface CardSectionDef {
  id: string
  name: string
  icon: string
  desc: string
  fields: FieldDef[]
}

type Face = 'front' | 'back'

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

const UPLOAD_FORMATS = ['PDF', 'Image', 'Video', 'Audio', 'Document', 'Spreadsheet', 'Archive', 'Other']

function buildCardCustomBlock(type: CustomBlockType): CustomBlock {
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

const CARD_TYPES = [
  { id: 'business' as const, label: 'Business Card' },
  { id: 'consumer' as const, label: 'Consumer Card' },
]

const CARD_CATEGORIES = ['Standard', 'Premium', 'VIP', 'Campaign', 'Limited Edition', 'Seasonal']

/* ------------------------------------------------------------------ */
/*  Wizard steps — Content → Preview & Testing → Assignment            */
/*  Publishing happens from the last step. Activity and version        */
/*  history live on the template list pages, not in the builder.       */
/* ------------------------------------------------------------------ */

interface WizardStepDef {
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
    desc: 'Build the card — front & back sections, content and layout.',
    helpTitle: 'Step 1 — Content',
    help: [
      'Design the card front and back with the front/back face toggle.',
      'Turn sections on or off, reorder them with the arrows, and edit any field directly — text, images, lists and more.',
      'The live card preview updates as you type.',
      'This is a short, static card (85 × 55 mm) — it does not scroll like a VCard.',
    ],
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  },
  {
    id: 'preview',
    label: '2. Preview & Testing',
    short: 'Preview & Testing',
    desc: 'Inspect the print-ready card and run quick checks.',
    helpTitle: 'Step 2 — Preview & Testing',
    help: [
      'Check the card front, back and the combined print sheet.',
      'The card is supplied at 85 × 55 mm with a 3 mm bleed on all edges — the dashed line marks the safe/trim area.',
      'Export at 300 dpi (front and back), RGB or CMYK for print.',
      'Run the quick tests below — QR scan, redeem and share.',
    ],
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zm-12.542 0C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  },
  {
    id: 'assignment',
    label: '3. Assignment',
    short: 'Assignment',
    desc: 'Attach the card to memberships, categories & campaigns.',
    helpTitle: 'Step 3 — Assignment',
    help: [
      'Pick which memberships receive this card template by default.',
      'Optionally limit it to business categories, geographies or campaigns.',
      'Save the assignment so it applies when the card template is published.',
    ],
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
  },
]

const MEMBERSHIP_TIERS = [
  { name: 'Bronze', dot: 'bg-amber-500', chip: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300', variants: ['Bronze', 'Bronze Pro', 'Bronze Pro+'] },
  { name: 'Silver', dot: 'bg-gray-400', chip: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300', variants: ['Silver', 'Silver Pro', 'Silver Pro+'] },
  { name: 'Gold', dot: 'bg-yellow-400', chip: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300', variants: ['Gold', 'Gold Pro', 'Gold Pro+'] },
  { name: 'Platinum', dot: 'bg-slate-400', chip: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', variants: ['Platinum', 'Platinum Pro', 'Platinum Pro+'] },
]

/* ------------------------------------------------------------------ */
/*  Section definitions                                                */
/* ------------------------------------------------------------------ */

const I = {
  image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.085 10.1c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  award: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M5 6h14a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1zm7 5v9m0-9a3 3 0 110-6 3 3 0 010 6z',
  card: 'M3 10h18M7 15h3m-6 5h14a2 2 0 002-2V6a2 2 0 00-2-2H3a2 2 0 00-2 2v12a2 2 0 002 2z',
  qr: 'M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6zM6 6h2v2H6V6zm10 0h2v2h-2V6zM6 16h2v2H6v-2zm8-6h2v2h-2v-2zm0 6h2v2h-2v-2zm3-3h3v2h-3v-2zm-6-3h3v3h-3V10z',
  shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  bars: 'M4 6h16M4 10h16M4 14h16M4 18h16',
  pen: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  doc: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  flag: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9',
  share: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
  swap: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  gift: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}

const FRONT_SECTIONS: CardSectionDef[] = [
  { id: 'background', name: 'Background', icon: I.image, desc: 'Card background image, or solid / gradient colour.', fields: [
    { key: 'image', label: 'Background Image', type: 'image' },
    { key: 'bgColor', label: 'Background Colour', type: 'color' },
    { key: 'gradientFrom', label: 'Gradient From', type: 'color' },
    { key: 'gradientTo', label: 'Gradient To', type: 'color' },
  ] },
  { id: 'branding', name: 'Branding & Logo', icon: I.star, desc: 'Business name, logo and tagline on the card face.', fields: [
    { key: 'logo', label: 'Logo', type: 'image' },
    { key: 'brandName', label: 'Brand Name', type: 'text', placeholder: 'ACME Corp' },
    { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'Member since 2025' },
  ] },
  { id: 'memberPhoto', name: 'Member Identity', icon: I.user, desc: 'Cardholder photo, name and membership label.', fields: [
    { key: 'photo', label: 'Member Photo', type: 'image' },
    { key: 'memberName', label: 'Member Name', type: 'text', placeholder: 'John Smith' },
    { key: 'membershipLabel', label: 'Membership Label', type: 'text', placeholder: 'Member' },
  ] },
  { id: 'tierBadge', name: 'Membership Badge', icon: I.award, desc: 'Tier badge shown on the card face.', fields: [
    { key: 'tier', label: 'Tier', type: 'select', options: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Elite', 'VIP', 'Premium'] },
    { key: 'level', label: 'Level Text', type: 'text', placeholder: 'Gold Pro' },
    { key: 'showIcon', label: 'Show Badge Icon', type: 'toggle' },
  ] },
  { id: 'cardDetails', name: 'Card Details', icon: I.card, desc: 'Card number, member ID and expiry.', fields: [
    { key: 'rows', label: 'Details', type: 'list', itemLabel: 'Detail', itemFields: [
      { key: 'label', label: 'Label', type: 'select', options: ['Card Number', 'Member ID', 'Expiry', 'Issue Date', 'CVV', 'Batch', 'Account'] },
      { key: 'value', label: 'Value', type: 'text' },
    ] },
  ] },
  { id: 'ffIndicator', name: 'Friends & Family', icon: I.users, desc: 'Friends & family indicator shown on the card face.', fields: [
    { key: 'indicator', label: 'Indicator Style', type: 'select', options: ['Numeric Badge', 'Progress Indicator', 'Card Stack Icon', 'Hidden Until Allocated', 'None'] },
    { key: 'count', label: 'Allocated Count', type: 'text', placeholder: '10' },
  ] },
  { id: 'qr', name: 'QR Code', icon: I.qr, desc: 'QR position, size and design on the card face.', fields: [
    { key: 'position', label: 'Position', type: 'select', options: ['Bottom Right', 'Top Right', 'Bottom Left', 'Top Left', 'Center'] },
    { key: 'size', label: 'Size', type: 'select', options: ['Small', 'Medium', 'Large', 'Extra Large'] },
    { key: 'url', label: 'QR Payload URL', type: 'text', placeholder: 'https://vcard.mcom/...' },
    { key: 'qrMode', label: 'QR Mode', type: 'select', options: ['Generate by System', 'Upload from File', 'Allow User Upload'] },
    { key: 'heading', label: 'Heading', type: 'text', placeholder: 'Scan my QR Code' },
    { key: 'qrType', label: 'What the QR does', type: 'select', options: ['Open this VCard', 'Business Profile', 'Campaign', 'Membership Page', 'Custom Link', 'Download vCard'] },
    { key: 'qrDynamic', label: 'Dynamic content', type: 'toggle' },
    { key: 'qrColor', label: 'QR Colour', type: 'color' },
    { key: 'qrBgColor', label: 'QR Background', type: 'color' },
    { key: 'qrStyle', label: 'QR Shape', type: 'select', options: ['square', 'rounded', 'dots', 'diamond', 'leaf'] },
    { key: 'qrLogo', label: 'Logo in the middle', type: 'image' },
    { key: 'qrImage', label: 'Uploaded QR image', type: 'image' },
  ] },
  { id: 'security', name: 'Security Features', icon: I.shield, desc: 'Security chip, hologram and password protection.', fields: [
    { key: 'hasSecurity', label: 'Enable Security Chip', type: 'toggle' },
    { key: 'chipLabel', label: 'Chip Label', type: 'text', placeholder: 'Secure Member' },
    { key: 'hasPassword', label: 'Require Password to Unlock', type: 'toggle' },
    { key: 'password', label: 'Password', type: 'text', placeholder: 'e.g. 1234' },
    { key: 'passwordHint', label: 'Password Hint', type: 'text', placeholder: 'Ask staff for the PIN' },
    { key: 'passwordMessage', label: 'Locked Message', type: 'text', placeholder: 'Card locked — enter PIN' },
  ] },
  { id: 'rewardsProgress', name: 'Rewards Progress', icon: I.chart, desc: 'Progress display on the card face.', fields: [
    { key: 'display', label: 'Display Style', type: 'select', options: ['Progress Bar', 'Circular Progress', 'Percentage', 'Milestone Badges', 'None'] },
    { key: 'current', label: 'Current Value', type: 'text', placeholder: '750' },
    { key: 'target', label: 'Target Value', type: 'text', placeholder: '1000' },
  ] },
  { id: 'countdown', name: 'Season Countdown', icon: I.flag, desc: 'Live countdown to the end of an active season.', fields: [
    { key: 'seasonIds', label: 'Seasons', type: 'text' },
    { key: 'label', label: 'Label', type: 'text', placeholder: 'Season ends in' },
    { key: 'color', label: 'Accent Colour', type: 'color' },
  ] },
]

const BACK_SECTIONS: CardSectionDef[] = [
  { id: 'magneticStripe', name: 'Magnetic Stripe', icon: I.bars, desc: 'Magnetic stripe band on the card back.', fields: [
    { key: 'color', label: 'Stripe Colour', type: 'color' },
  ] },
  { id: 'signature', name: 'Signature Line', icon: I.pen, desc: 'Signature strip with optional signature image.', fields: [
    { key: 'signature', label: 'Signature Image', type: 'image' },
    { key: 'label', label: 'Label', type: 'text', placeholder: 'Authorized Signature' },
  ] },
  { id: 'terms', name: 'Terms & Instructions', icon: I.doc, desc: 'Small print on the card back.', fields: [
    { key: 'termsText', label: 'Terms Text', type: 'textarea', placeholder: 'This card is property of MCOM. If found, please return to...' },
  ] },
  { id: 'contactInfo', name: 'Contact Info', icon: I.phone, desc: 'Website, phone and support details.', fields: [
    { key: 'rows', label: 'Contacts', type: 'list', itemLabel: 'Contact', itemFields: [
      { key: 'type', label: 'Type', type: 'select', options: ['Website', 'Phone', 'Email', 'Support', 'Address'] },
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'value', label: 'Value', type: 'text' },
    ] },
  ] },
  { id: 'footerBranding', name: 'Footer Logo', icon: I.flag, desc: 'Branding at the bottom of the card back.', fields: [
    { key: 'logo', label: 'Logo', type: 'image' },
    { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'Powered by MCOM' },
  ] },
  { id: 'share', name: 'Share Card', icon: I.share, desc: 'Share, download and save this card.', fields: [
    { key: 'label', label: 'Button Label', type: 'text', placeholder: 'Share Card' },
    { key: 'destination', label: 'Destination', type: 'select', options: ['Open this VCard', 'Business Profile', 'Membership Page', 'Custom Link', 'Download vCard'] },
  ] },
  { id: 'exchange', name: 'Exchange Contact', icon: I.swap, desc: 'Swap contact details with a tap or QR scan.', fields: [
    { key: 'label', label: 'Heading', type: 'text', placeholder: 'Exchange Contact' },
    { key: 'description', label: 'Description', type: 'text', placeholder: 'Tap to swap details' },
  ] },
  { id: 'redeem', name: 'Redeem Rewards', icon: I.gift, desc: 'Redeem points, offers, coupons and rewards.', fields: [
    { key: 'label', label: 'Heading', type: 'text', placeholder: 'Redeem Rewards' },
    { key: 'value', label: 'Value', type: 'text', placeholder: '250 points · 15% off' },
    { key: 'button', label: 'Button Label', type: 'text', placeholder: 'Redeem' },
  ] },
  { id: 'buildGroup', name: 'Build Group', icon: I.users, desc: 'Invite members and grow a group or community.', fields: [
    { key: 'label', label: 'Heading', type: 'text', placeholder: 'Build Group' },
    { key: 'description', label: 'Description', type: 'text', placeholder: 'Invite friends and grow together' },
    { key: 'button', label: 'Button Label', type: 'text', placeholder: 'Join Group' },
  ] },
]

const FRONT_DEFAULT_LIST_ITEMS: Record<string, Record<string, string>[]> = {
  cardDetails: [
    { label: 'Card Number', value: '4000 0000 0000 0000' },
    { label: 'Member ID', value: 'MCOM-00123' },
    { label: 'Expiry', value: '12/28' },
  ],
}

const BACK_DEFAULT_LIST_ITEMS: Record<string, Record<string, string>[]> = {
  contactInfo: [
    { type: 'Website', label: 'Web', value: 'www.mcom.com' },
    { type: 'Phone', label: 'Support', value: '+1 (555) 010-1234' },
  ],
}

const DEFAULT_LIST_ITEMS: Record<string, Record<string, string>[]> = {
  ...FRONT_DEFAULT_LIST_ITEMS,
  ...BACK_DEFAULT_LIST_ITEMS,
}

/* Both faces share the full component catalogue. Per-face `enabled`
   defaults decide what starts on, but the admin can toggle any section
   independently on either face. */
const ALL_SECTIONS: CardSectionDef[] = [...FRONT_SECTIONS, ...BACK_SECTIONS]

const FRONT_DEFAULT_ENABLED = new Set(['background', 'branding', 'memberPhoto', 'tierBadge', 'cardDetails', 'ffIndicator', 'qr', 'security', 'rewardsProgress'])
const BACK_DEFAULT_ENABLED = new Set(['magneticStripe', 'signature', 'terms', 'contactInfo', 'qr', 'footerBranding'])

function buildFaceState(face: Face): CardSectionState[] {
  const defaultEnabled = face === 'front' ? FRONT_DEFAULT_ENABLED : BACK_DEFAULT_ENABLED
  return ALL_SECTIONS.map(section => {
    const values: Record<string, string> = {}
    const items: Record<string, Record<string, string>[]> = {}
    section.fields.forEach(field => {
      if (field.type === 'list' && field.itemFields) {
        items[field.key] = (DEFAULT_LIST_ITEMS[section.id] ?? []).map(item => {
          const base: Record<string, string> = {}
          field.itemFields!.forEach(ifd => { base[ifd.key] = item[ifd.key] ?? '' })
          return base
        })
      } else {
        values[field.key] = ''
      }
    })
    return { uid: section.id, face, schemaId: section.id, name: section.name, enabled: defaultEnabled.has(section.id), values, items, blocks: [] }
  })
}

function buildInitialState(): CardFaces {
  return {
    front: buildFaceState('front'),
    back: buildFaceState('back'),
  }
}

/* Load a stored face and expand it to the full component catalogue.
   Existing sections keep their values/enabled/layout; any section added
   to the catalogue later appears with its per-face default. */
function mergeStoredFace(face: Face, stored: CardSectionState[], isDup: boolean): CardSectionState[] {
  const fresh = buildFaceState(face)
  const bySchema = new Map<string, CardSectionState[]>()
  for (const s of stored) {
    const arr = bySchema.get(s.schemaId) ?? []
    arr.push(s)
    bySchema.set(s.schemaId, arr)
  }
  let counter = 0
  const uidFor = (s: CardSectionState) => (isDup ? `${s.schemaId}-${counter++}-${Date.now()}` : s.uid)
  const result: CardSectionState[] = []
  for (const fs of fresh) {
    const matches = bySchema.get(fs.schemaId)
    if (matches && matches.length) {
      result.push(...matches.map(m => ({ ...m, uid: uidFor(m), face })))
    } else {
      result.push(fs)
    }
  }
  const known = new Set(fresh.map(f => f.schemaId))
  for (const s of stored) {
    if (s.schemaId === 'backQr') continue
    if (!known.has(s.schemaId)) result.push({ ...s, uid: uidFor(s), face })
  }
  return result
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

/* Colour-chip multi-select used for Sectors & Seasons assignment. */
function ChipMultiSelect({ items, selected, onToggle, emptyText }: {
  items: { id: string; name: string; color: string }[]
  selected: string[]
  onToggle: (id: string) => void
  emptyText: string
}) {
  if (items.length === 0) {
    return <p className="text-[10px] text-gray-400">{emptyText}</p>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(it => {
        const on = selected.includes(it.id)
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onToggle(it.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold transition-colors ${on ? 'text-white border-transparent' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-orange-300'}`}
            style={on ? { backgroundColor: it.color } : undefined}
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: on ? '#fff' : it.color }} />
            {it.name}
          </button>
        )
      })}
    </div>
  )
}

function ImageUploadField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { onChange(String(reader.result)); toast.success('Image uploaded') }
    reader.readAsDataURL(file)
    e.target.value = ''
  }
  const cls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400'
  return (
    <div>
      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`${cls} flex-1 min-w-0`} />
        <button type="button" onClick={() => fileRef.current?.click()} className="shrink-0 px-2.5 py-2 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600 transition-colors">
          Upload
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button type="button" onClick={() => fileRef.current?.click()} className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-400 flex items-center justify-center bg-gray-50 dark:bg-gray-700 transition-colors">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.opacity = '0.2' }} />
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          )}
        </button>
      </div>
    </div>
  )
}

function FieldInput({ label, value, onChange, type, placeholder, options }: {
  label: string; value: string; onChange: (v: string) => void; type: FieldType; placeholder?: string; options?: string[]
}) {
  const cls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400'

  if (type === 'image') return <ImageUploadField label={label} value={value} onChange={onChange} placeholder={placeholder} />
  if (type === 'toggle') {
    return (
      <div className="flex items-center justify-between gap-2">
        <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{label}</label>
        <Toggle on={value === 'true'} onClick={() => onChange(value === 'true' ? 'false' : 'true')} />
      </div>
    )
  }
  if (type === 'select') {
    return (
      <div>
        <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
        <select value={value} onChange={e => onChange(e.target.value)} className={`${cls} ${options?.every(o => o.startsWith('#')) ? 'h-9' : ''}`}>
          <option value="">Select…</option>
          {options?.map(o => (
            <option key={o} value={o} className={o.startsWith('#') ? '' : undefined}>
              {o.startsWith('#') ? <span className="flex items-center gap-2"><span style={{ background: o }} className="inline-block w-3 h-3 rounded" />{o}</span> : o}
            </option>
          ))}
        </select>
      </div>
    )
  }
  if (type === 'color') {
    return (
      <div>
        <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700">
          <ColorPicker value={value || '#111827'} onChange={onChange} />
        </div>
      </div>
    )
  }
  return (
    <div>
      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`${cls} resize-none`} />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  QR Code shape + section editor — mirrors the vCard template        */
/*  builder. Three modes — Generate by System / Upload from File /     */
/*  Allow User Upload. Whichever mode is enabled is what the card      */
/*  face uses. The Customize button opens the card QR Customizer.      */
/* ------------------------------------------------------------------ */

function QrShapePreview({ section, sizeClass = 'w-16 h-16', className = '' }: {
  section: CardSectionState
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

  return (
    <div className={`${sizeClass} rounded-lg overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 ${className}`}>
      <QrCodeSvg
        value={section.values.url}
        fg={section.values.qrColor || '#111827'}
        bg={section.values.qrBgColor || '#ffffff'}
        style={section.values.qrStyle || 'square'}
        logo={section.values.qrLogo}
        sizeClass="w-full h-full"
      />
    </div>
  )
}

function CardQrSectionBody({ section, setValue, openCustomize }: {
  section: CardSectionState
  setValue: (key: string, value: string) => void
  openCustomize: () => void
}) {
  const val = (k: string) => section.values[k] ?? ''
  const mode = val('qrMode') || 'Generate by System'
  const set = (k: string, v: string) => setValue(k, v)

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
        <QrShapePreview section={section} sizeClass="w-16 h-16" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">
            {mode === 'Generate by System' ? 'System-generated QR' : mode === 'Upload from File' ? (val('qrImage') ? 'Your uploaded QR' : 'No QR image yet') : 'QR shape — user uploads later'}
          </p>
          <p className="text-[9px] text-gray-400 leading-tight mt-0.5">
            {mode === 'Generate by System' ? 'Designed in the QR Customizer — link, logo, colors and shape.' : mode === 'Upload from File' ? 'Upload an image that fits this square shape.' : 'The shape reserves space; the card owner adds their QR.'}
          </p>
          {mode === 'Generate by System' && (
            <button onClick={openCustomize} className="mt-1.5 text-[9px] font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Customize QR Code
            </button>
          )}
        </div>
      </div>

      {/* Heading */}
      <FieldInput label="Heading" type="text" value={val('heading')} placeholder="Scan my QR Code" onChange={v => set('heading', v)} />

      {/* Position & size — they're layout, not the link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Position on card</label>
          <select value={val('position') || 'Bottom Right'} onChange={e => set('position', e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {['Bottom Right', 'Top Right', 'Bottom Left', 'Top Left', 'Center'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Size</label>
          <select value={val('size') || 'Medium'} onChange={e => set('size', e.target.value)}
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
              <select value={val('qrType') || 'Open this VCard'} onChange={e => set('qrType', e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                {['Open this VCard', 'Business Profile', 'Campaign', 'Membership Page', 'Custom Link', 'Download vCard'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Destination</label>
              <input type="text" value={val('url')} onChange={e => set('url', e.target.value)} placeholder="https://vcard.mcom/..."
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
          <button onClick={openCustomize}
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
            <p className="text-[9px] text-gray-400">Short, static card (85 × 55 mm, 3 mm bleed) — publish from the last step.</p>
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

function bumpVersion(v: string): string {
  const m = v.match(/^v?(\d+)\.(\d+)$/)
  if (!m) return 'v1.1'
  return `v${Number(m[1])}.${Number(m[2]) + 1}`
}

function deriveMetadata(faces: CardFaces) {
  const all = [...faces.front, ...faces.back]
  const qr = all.find(s => s.schemaId === 'qr')
  const sec = faces.front.find(s => s.schemaId === 'security')
  const prog = faces.front.find(s => s.schemaId === 'rewardsProgress')
  const tier = faces.front.find(s => s.schemaId === 'tierBadge')
  const ff = faces.front.find(s => s.schemaId === 'ffIndicator')
  return {
    qrPosition: qr?.values.position || 'Bottom Right',
    qrSize: qr?.values.size || 'Medium',
    hasSecurity: sec?.values.hasSecurity === 'true',
    ffIndicator: ff?.enabled ? (ff.values.indicator || 'None') : 'None',
    progressDisplay: prog?.values.display || 'None',
    theme: tier?.values.tier || 'Standard',
  }
}

export default function CardTemplateBuilderPage({ forceType }: { forceType?: 'business' | 'consumer' } = {}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const validSteps = ['content', 'preview', 'assignment']
  const tabParam = searchParams.get('tab')
  const [activeStep, setActiveStep] = useState<string>(validSteps.includes(tabParam ?? '') ? tabParam! : 'content')
  const [stepHelp, setStepHelp] = useState<string | null>(null)

  const [faces, setFaces] = useState<CardFaces>(() => buildInitialState())
  const [activeFace, setActiveFace] = useState<Face>('front')
  const [expanded, setExpanded] = useState<string | null>('branding')
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<{ face: Face; uid: string; value: string } | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [cardType, setCardType] = useState<'business' | 'consumer'>(forceType ?? (searchParams.get('type') === 'consumer' ? 'consumer' : 'business'))
  const [category, setCategory] = useState('Standard')
  const [existingId, setExistingId] = useState<number | null>(null)
  const [ff, setFf] = useState<FriendsFamilyConfig>(defaultFriendsFamily)
  const [sectorIds, setSectorIds] = useState<string[]>([])
  const [seasonIds, setSeasonIds] = useState<string[]>([])

  /* Assignment step */
  const [assignMemberships, setAssignMemberships] = useState<string[]>(['Gold', 'Platinum'])
  const toggleMembership = (m: string) => {
    setAssignMemberships(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }
  const toggleTier = (variants: string[]) => {
    const allOn = variants.every(v => assignMemberships.includes(v))
    setAssignMemberships(prev => allOn ? prev.filter(x => !variants.includes(x)) : [...new Set([...prev, ...variants])])
  }

  const loadedRef = useRef(false)

  const defsFor = () => ALL_SECTIONS

  if (!loadedRef.current) {
    const id = Number(searchParams.get('id') ?? 0)
    const dupId = Number(searchParams.get('duplicate') ?? 0)
    const source = (id && getCardTemplate(id)) || (dupId && getCardTemplate(dupId))
    if (source) {
      const isDup = Boolean(dupId) && !id
      loadedRef.current = true
      const rebuilt: CardFaces = {
        front: mergeStoredFace('front', source.builder.faces.front, isDup),
        back: mergeStoredFace('back', source.builder.faces.back, isDup),
      }
      setFaces(rebuilt)
      setFf(normalizeFriendsFamily(source.builder.friendsFamily ?? defaultFriendsFamily()))
      setSectorIds(source.builder.sectors ?? [])
      setSeasonIds(source.builder.seasons ?? [])
      setTemplateName(isDup ? `${source.name} (Copy)` : source.name)
      setCardType(source.cardType)
      setCategory(source.category)
      setExistingId(isDup ? null : source.id)
      if (!isDup) { /* no-op */ }
    } else if (id || dupId) {
      setTimeout(() => toast.error('Card template not found'), 0)
    }
    loadedRef.current = true
  }

  const patchFace = (face: Face, fn: (list: CardSectionState[]) => CardSectionState[]) =>
    setFaces(prev => ({ ...prev, [face]: fn(prev[face]) }))

  /* Four Core Activities (Share / Exchange / Redeem / Build Groups) live
     on the card back. Toggling one enables or disables its section. */
  const toggleCoreActivity = (id: string, enabled: boolean) =>
    patchFace('back', list => list.map(s => (s.schemaId === id ? { ...s, enabled } : s)))

  const setValues = (face: Face, uid: string, key: string, value: string) =>
    patchFace(face, list => list.map(s => (s.uid === uid ? { ...s, values: { ...s.values, [key]: value } } : s)))

  const setSectionFontSize = (face: Face, uid: string, fontSize: number) =>
    patchFace(face, list => list.map(s => (s.uid === uid ? { ...s, fontSize } : s)))

  const addCustomBlock = (face: Face, uid: string, type: CustomBlockType) =>
    patchFace(face, list => list.map(s => (s.uid === uid ? { ...s, blocks: [...(s.blocks ?? []), buildCardCustomBlock(type)] } : s)))

  const updateCustomBlock = (face: Face, uid: string, blockId: number, patch: Partial<CustomBlock>) =>
    patchFace(face, list => list.map(s => {
      if (s.uid !== uid) return s
      const blocks = s.blocks.map(b => (b.id === blockId ? { ...b, ...patch } : b))
      return { ...s, blocks }
    }))

  const moveCustomBlock = (face: Face, uid: string, blockId: number, dir: -1 | 1) =>
    patchFace(face, list => list.map(s => {
      if (s.uid !== uid) return s
      const blocks = [...s.blocks]
      const index = blocks.findIndex(b => b.id === blockId)
      const target = index + dir
      if (index < 0 || target < 0 || target >= blocks.length) return s
      const [b] = blocks.splice(index, 1)
      blocks.splice(target, 0, b)
      return { ...s, blocks }
    }))

  const removeCustomBlock = (face: Face, uid: string, blockId: number) =>
    patchFace(face, list => list.map(s => (s.uid === uid ? { ...s, blocks: s.blocks.filter(b => b.id !== blockId) } : s)))

  const setItem = (face: Face, uid: string, listKey: string, index: number, key: string, value: string) =>
    patchFace(face, list => list.map(s => {
      if (s.uid !== uid) return s
      const rows = [...(s.items[listKey] ?? [])]
      rows[index] = { ...rows[index], [key]: value }
      return { ...s, items: { ...s.items, [listKey]: rows } }
    }))

  const addItem = (face: Face, uid: string, listKey: string) =>
    patchFace(face, list => list.map(s => {
      if (s.uid !== uid) return s
      const field = defsFor().find(d => d.id === s.schemaId)?.fields.find(f => f.key === listKey)
      const base: Record<string, string> = {}
      field?.itemFields?.forEach(ifd => { base[ifd.key] = '' })
      return { ...s, items: { ...s.items, [listKey]: [...(s.items[listKey] ?? []), base] } }
    }))

  const removeItem = (face: Face, uid: string, listKey: string, index: number) =>
    patchFace(face, list => list.map(s => {
      if (s.uid !== uid) return s
      const rows = [...(s.items[listKey] ?? [])]
      rows.splice(index, 1)
      return { ...s, items: { ...s.items, [listKey]: rows } }
    }))

  const moveSection = (face: Face, uid: string, dir: -1 | 1) =>
    patchFace(face, list => {
      const i = list.findIndex(s => s.uid === uid)
      const j = i + dir
      if (i < 0 || j < 0 || j >= list.length) return list
      const next = [...list]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  const duplicateSection = (face: Face, uid: string) =>
    patchFace(face, list => {
      const i = list.findIndex(s => s.uid === uid)
      if (i < 0) return list
      const copy = {
        ...list[i],
        uid: `${list[i].schemaId}-${Date.now()}`,
        name: `${list[i].name} Copy`,
        values: { ...list[i].values },
        items: Object.fromEntries(Object.entries(list[i].items).map(([k, rows]) => [k, rows.map(r => ({ ...r }))])),
        blocks: list[i].blocks.map(b => ({ ...b, id: Date.now() + Math.floor(Math.random() * 1000), values: { ...b.values }, options: [...b.options], formats: [...b.formats] })),
      }
      const next = [...list]
      next.splice(i + 1, 0, copy)
      return next
    })

  const renameSection = (face: Face, uid: string, name: string) =>
    patchFace(face, list => list.map(s => (s.uid === uid ? { ...s, name } : s)))

  const handleValidate = () => {
    if (!templateName.trim()) { toast.error('Give the card template a name'); return false }
    if (faces.front.filter(s => s.enabled).length === 0) { toast.error('Add at least one section to the card front'); return false }
    if (faces.back.filter(s => s.enabled).length === 0) { toast.error('Add at least one section to the card back'); return false }
    return true
  }

  const buildStored = (status: 'Draft' | 'Published') => {
    const existing = existingId ? getCardTemplate(existingId) : undefined
    const id = existing?.id ?? nextCardTemplateId()
    const prefix = cardType === 'business' ? 'BCT-' : 'CCT-'
    const typeChanged = existing && existing.cardType !== cardType
    const templateId = existing && !typeChanged ? existing.templateId : nextCardTemplateNumber(prefix)
    const version = existing ? bumpVersion(existing.version) : 'v1.0'
    const meta = deriveMetadata(faces)
    const nm = templateName.trim() || 'Untitled Card Template'
    return {
      id,
      templateId,
      name: nm,
      version,
      description: `${nm} — ${category} ${cardType} card (85 × 55 mm, 3 mm bleed)`,
      status,
      cardType,
      category,
      ...meta,
      cardSize: { widthMm: 85, heightMm: 55, bleedMm: 3 },
      lastUpdated: 'just now',
      createdDate: existing?.createdDate ?? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      updatedBy: 'Admin',
      createdBy: existing?.createdBy ?? 'Admin',
      builder: { templateName: nm, faces, friendsFamily: ff, sectors: sectorIds, seasons: seasonIds },
    }
  }

  /* Persist the current draft silently (no navigation) and return its id. */
  const persistDraftSilent = (): number | null => {
    const hadName = Boolean(templateName.trim())
    const saved = upsertCardTemplate(buildStored('Draft'))
    setExistingId(saved.id)
    if (!hadName) toast.success('Draft saved — you can rename the template later')
    return saved.id
  }

  const saveDraft = () => {
    if (!handleValidate()) return
    upsertCardTemplate(buildStored('Draft'))
    toast.success('Card template draft saved')
    navigate(`/admin/card-management/${cardType}-card-templates`)
  }

  const openFriendsFamilyConfig = () => {
    const id = persistDraftSilent()
    if (id == null) return
    navigate(`/admin/card-management/card-template-builder/friends-family?id=${id}&type=${cardType}`)
  }

  const openCardQrCustomizer = () => {
    const id = persistDraftSilent()
    if (id == null) return
    navigate(`/admin/card-management/qr-customizer?id=${id}`)
  }

  const handlePublish = () => {
    if (!handleValidate()) return
    upsertCardTemplate(buildStored('Published'))
    toast.success(`${templateName.trim()} published`)
    navigate(`/admin/card-management/${cardType}-card-templates`)
  }

  return (
    <div className="space-y-6">
      <Helmet><title>Card Template Builder - Card Management - MCOM VCard</title></Helmet>

      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Link to={`/admin/card-management/${cardType}-card-templates`} className="hover:text-orange-600">Card Templates</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 dark:text-white font-medium">{templateName || 'Untitled Card Template'}</span>
      </div>

      {/* Helper strip */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <p className="text-[11px] text-orange-700 dark:text-orange-300">
          <span className="font-semibold">Short static card builder.</span> Design the front and back of a print-ready card at <span className="font-semibold">85 × 55 mm</span> with a <span className="font-semibold">3 mm bleed</span>. Turn sections on or off with the toggle, arrange them with the arrows, and edit any content directly. Click any component on the live preview to adjust its <span className="font-semibold">font size</span>.
        </p>
      </div>

      {/* Wizard steps */}
      <WizardStepper active={activeStep} onSelect={setActiveStep} onHelp={setStepHelp} />

      {/* Top bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Template Name</label>
            <input value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="e.g. Gold Premium Member Card"
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400" />
          </div>
          {forceType ? (
            <div>
              <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Card For</label>
              <div className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 capitalize">{cardType} card</div>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Card For</label>
              <select value={cardType} onChange={e => setCardType(e.target.value as 'business' | 'consumer')}
                className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40">
                {CARD_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Card Type</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40">
              {CARD_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={saveDraft} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Save Draft</button>
            <button onClick={handleValidate} className="px-3 py-2 rounded-lg border border-orange-200 dark:border-orange-500/40 text-orange-500 text-xs font-medium hover:bg-orange-50 dark:hover:bg-orange-500/10">Validate</button>
            <button onClick={() => setActiveStep('preview')} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Preview</button>
            <button onClick={handlePublish} className="px-3 py-2 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600">Publish</button>
          </div>
        </div>
      </div>

      {/* ==================== STEP 1 — Content ==================== */}
      {activeStep === 'content' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT — section builder */}
        <div>
          {/* -------- Friends & Family — capability toggle -------- */}
          <div className={`bg-white dark:bg-gray-800 rounded-xl border mb-4 transition-colors ${ff.enabled ? 'border-orange-200 dark:border-orange-500/30' : 'border-gray-100 dark:border-gray-700'}`}>
            <div className="flex items-center gap-2.5 px-3.5 py-3">
              <span className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857M16 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">Friends &amp; Family</p>
                <p className="text-[10px] text-gray-400 leading-snug">
                  {ff.enabled
                    ? 'Members can share this card\u2019s benefits with allocated friends & family. Configure how it behaves on the configuration page.'
                    : 'Allow members to share this card\u2019s benefits \u2014 rewards, wallet, gift cards \u2014 with friends & family. Enable to configure.'}
                </p>
              </div>
              <Toggle on={ff.enabled} onClick={() => setFf(prev => ({ ...prev, enabled: !prev.enabled }))} />
            </div>

            {ff.enabled && (
              <div className="px-3.5 pb-3.5 border-t border-gray-50 dark:border-gray-700/50 pt-3">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[9px] font-semibold">Enabled</span>
                  {ff.tiers.length > 0 && (
                    <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] font-medium">
                      Tiers: {summarizeFfTiers(ff.tiers)}
                    </span>
                  )}
                  {ff.walletEnabled && <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] font-medium">Wallet: On</span>}
                  {ff.giftCardsEnabled && <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] font-medium">Gift cards: On</span>}
                  {ff.cashbackEnabled && <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] font-medium">Cashback: On</span>}
                </div>
                <button onClick={openFriendsFamilyConfig}
                  className="px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Customize Friends &amp; Family
                </button>
              </div>
            )}
          </div>

          <div className="mb-4">
            <CoreActivitiesPanel
              activities={CORE_ACTIVITIES.map(a => ({ id: a.id, enabled: faces.back.find(s => s.schemaId === a.id)?.enabled ?? false }))}
              onToggle={toggleCoreActivity}
            />
            <p className="text-[9px] text-gray-400 mt-1.5 px-1">These render on the card back — scan, tap or share to act.</p>
          </div>

          <div className="flex gap-1.5 mb-3">
            {(['front', 'back'] as const).map(f => (
              <button key={f} onClick={() => setActiveFace(f)} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors capitalize ${activeFace === f ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                {f === 'front' ? 'Front Face' : 'Back Face'}
                <span className="ml-1.5 text-[9px] opacity-70">{faces[f].filter(s => s.enabled).length} on</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mb-3">
            {activeFace === 'front' ? 'Design the card front — what the cardholder sees.' : 'Design the card back — stripe, signature, terms and support details.'}
          </p>

          <div className="space-y-2.5">
            {faces[activeFace].map(section => {
              const def = defsFor().find(d => d.id === section.schemaId)!
              const open = expanded === section.uid
              return (
                <div key={section.uid} className={`bg-white dark:bg-gray-800 rounded-xl border transition-colors ${section.enabled ? 'border-gray-100 dark:border-gray-700' : 'border-dashed border-gray-200 dark:border-gray-600 opacity-70'}`}>
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <button onClick={() => setExpanded(open ? null : section.uid)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                      <span className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={def.icon} /></svg>
                      </span>
                      <div className="min-w-0">
                        {renaming?.face === activeFace && renaming.uid === section.uid ? (
                          <input autoFocus value={renaming.value} onChange={e => setRenaming({ face: activeFace, uid: section.uid, value: e.target.value })}
                            onBlur={() => { if (renaming?.value.trim()) renameSection(activeFace, section.uid, renaming.value.trim()); setRenaming(null) }}
                            onKeyDown={e => { if (e.key === 'Enter') { e.currentTarget.blur() } }}
                            className="text-xs font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-orange-300 dark:border-orange-500/40 rounded px-1.5 py-0.5 w-40" />
                        ) : (
                          <>
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">{section.name}</p>
                            <p className="text-[9px] text-gray-400 truncate">{def.desc}</p>
                          </>
                        )}
                      </div>
                    </button>
                    {!section.enabled && <span className="text-[9px] uppercase font-semibold text-gray-400">Hidden</span>}
                    <button title="Rename" onClick={() => setRenaming({ face: activeFace, uid: section.uid, value: section.name })} className="p-1 rounded text-gray-400 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button title="Move up" onClick={() => moveSection(activeFace, section.uid, -1)} className="p-1 rounded text-gray-400 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button title="Move down" onClick={() => moveSection(activeFace, section.uid, 1)} className="p-1 rounded text-gray-400 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <button title="Duplicate" onClick={() => duplicateSection(activeFace, section.uid)} className="p-1 rounded text-gray-400 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                    <Toggle on={section.enabled} onClick={() => patchFace(activeFace, list => list.map(s => (s.uid === section.uid ? { ...s, enabled: !s.enabled } : s)))} />
                    <button onClick={() => setExpanded(open ? null : section.uid)} className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>

                  {open && (
                    <div className="px-3 pb-3 space-y-3 border-t border-gray-50 dark:border-gray-700/50 pt-3">
                      {def.id === 'qr'
                        ? <CardQrSectionBody section={section} setValue={(k, v) => setValues(activeFace, section.uid, k, v)} openCustomize={openCardQrCustomizer} />
                        : def.id === 'countdown'
                        ? <CountdownSectionBody values={section.values} setValue={(k, v) => setValues(activeFace, section.uid, k, v)} />
                        : def.fields.map(field => {
                        if (field.type === 'list' && field.itemFields) {
                          const itemFields = field.itemFields
                          const rows = section.items[field.key] ?? []
                          return (
                            <div key={field.key}>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{field.label}</label>
                                <button onClick={() => addItem(activeFace, section.uid, field.key)} className="text-[10px] font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-0.5">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                  Add
                                </button>
                              </div>
                              {rows.map((row, i) => (
                                <div key={i} className="mb-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-600">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[9px] font-semibold text-gray-400 uppercase">{field.itemLabel ?? 'Item'} {i + 1}</span>
                                    <button onClick={() => removeItem(activeFace, section.uid, field.key, i)} className="text-gray-400 hover:text-red-500">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                  </div>
                                  <div className="space-y-2">
                                    {itemFields.map(ifd => (
                                      <FieldInput key={ifd.key} label={ifd.label} type={ifd.type} value={row[ifd.key] ?? ''} onChange={v => setItem(activeFace, section.uid, field.key, i, ifd.key, v)} placeholder={ifd.placeholder} options={ifd.options} />
                                    ))}
                                  </div>
                                </div>
                              ))}
                              {rows.length === 0 && <p className="text-[10px] text-gray-400">No {field.label.toLowerCase()} yet — add one.</p>}
                            </div>
                          )
                        }
                        return <FieldInput key={field.key} label={field.label} type={field.type} value={section.values[field.key] ?? ''} onChange={v => setValues(activeFace, section.uid, field.key, v)} placeholder={field.placeholder} options={field.options} />
                      })}

                      {/* -------- Custom Content (blocks stack in order inside this section) -------- */}
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
                            <button key={def.type} title={def.desc} onClick={() => addCustomBlock(activeFace, section.uid, def.type)}
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
                                      <button onClick={() => moveCustomBlock(activeFace, section.uid, block.id, -1)} disabled={blockIndex === 0} title="Move up"
                                        className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-orange-500 disabled:opacity-30 disabled:pointer-events-none">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                      </button>
                                      <button onClick={() => moveCustomBlock(activeFace, section.uid, block.id, 1)} disabled={blockIndex === section.blocks.length - 1} title="Move down"
                                        className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-orange-500 disabled:opacity-30 disabled:pointer-events-none">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                      </button>
                                      <button onClick={() => removeCustomBlock(activeFace, section.uid, block.id)} title="Remove"
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
                                              <Toggle on={block.values[f.key] === 'true'} onClick={() => updateCustomBlock(activeFace, section.uid, block.id, { values: { ...block.values, [f.key]: block.values[f.key] === 'true' ? '' : 'true' } })} />
                                            </div>
                                          ) : f.type === 'select' ? (
                                            <div>
                                              <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{f.label}</label>
                                              <select value={block.values[f.key] ?? f.options?.[0] ?? ''} onChange={e => updateCustomBlock(activeFace, section.uid, block.id, { values: { ...block.values, [f.key]: e.target.value } })}
                                                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40">
                                                {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                              </select>
                                            </div>
                                          ) : (
                                            <FieldInput label={f.label} type={f.type} value={block.values[f.key] ?? ''} placeholder={f.placeholder}
                                              onChange={v => updateCustomBlock(activeFace, section.uid, block.id, { values: { ...block.values, [f.key]: v } })} />
                                          )}
                                        </div>
                                      ))}
                                    </div>

                                    {/* Form question options */}
                                    {bdef.hasOptions && (
                                      <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                                        <div className="flex items-center justify-between mb-1.5">
                                          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Answer options</label>
                                          <button onClick={() => updateCustomBlock(activeFace, section.uid, block.id, { options: [...block.options, `Option ${block.options.length + 1}`] })}
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
                                                updateCustomBlock(activeFace, section.uid, block.id, { options })
                                              }}
                                                className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40" />
                                              <button onClick={() => updateCustomBlock(activeFace, section.uid, block.id, { options: block.options.filter((_, i) => i !== oi) })}
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
                                                updateCustomBlock(activeFace, section.uid, block.id, { formats })
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

        {/* RIGHT — live preview */}
        <div>
          <div className="sticky top-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Live Card Preview</h4>
                <p className="text-[10px] text-gray-400">Auto-updates as you build. Click any component to adjust its font size.</p>
              </div>
            </div>
            <DesignCardPreview faces={faces} selected={selectedDesign} onSelect={setSelectedDesign} onFontSizeChange={setSectionFontSize} ff={ff} />
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
                <h4 className="text-xs font-semibold text-gray-800 dark:text-white">Print Preview</h4>
                <p className="text-[10px] text-gray-400">Front, back and the combined print sheet for this card.</p>
              </div>
            </div>
            <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 overflow-x-auto">
              <CardPreview faces={faces} useLayout ff={ff} />
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <h4 className="text-xs font-semibold text-gray-800 dark:text-white mb-3">Print Design File</h4>
              <div className="space-y-2">
                {[
                  { label: 'Card size', value: '85 × 55 mm (8.5 × 5.5 cm)' },
                  { label: 'Bleed', value: '3 mm on all edges' },
                  { label: 'Safe / trim area', value: 'Dashed line — keep text inside' },
                  { label: 'Resolution', value: '300 dpi (front & back)' },
                  { label: 'Colour', value: 'CMYK (or RGB for digital)' },
                  { label: 'Output', value: 'Front + back separate files' },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                    <span className="text-[10px] text-gray-400">{r.label}</span>
                    <span className="text-[10px] font-medium text-gray-700 dark:text-gray-200 text-right">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <h4 className="text-xs font-semibold text-gray-800 dark:text-white mb-3">Quick Tests</h4>
              <div className="space-y-2">
                {[
                  { name: 'QR Scan', pass: true },
                  { name: 'Redeem Reward', pass: true },
                  { name: 'Share Card', pass: true },
                  { name: 'Print Readiness', pass: true },
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
              <p className="text-[10px] text-gray-400 leading-relaxed">4 of 4 checks passed. The card is ready for print.</p>
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
                  <p className="text-[10px] text-gray-400">These memberships get this card template by default. Click a tier to select the whole group, or pick individual levels.</p>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <h4 className="text-xs font-semibold text-gray-800 dark:text-white mb-1">Sectors &amp; Seasons</h4>
              <p className="text-[10px] text-gray-400 mb-3">Assign this card to sectors and seasons created under Settings. The countdown section on the card face shows a live timer while one of the assigned seasons is active.</p>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Sectors</label>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600">{sectorIds.length} selected</span>
                  </div>
                  <ChipMultiSelect
                    items={loadSectors().map(s => ({ id: s.id, name: s.name, color: s.color }))}
                    selected={sectorIds}
                    onToggle={id => setSectorIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                    emptyText="No sectors yet — create them under Settings → Sectors."
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Seasons</label>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600">{seasonIds.length} selected</span>
                  </div>
                  <ChipMultiSelect
                    items={loadSeasons().map(s => ({ id: s.id, name: s.name, color: s.color }))}
                    selected={seasonIds}
                    onToggle={id => setSeasonIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                    emptyText="No seasons yet — create them under Settings → Seasons."
                  />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <h4 className="text-xs font-semibold text-gray-800 dark:text-white mb-1">Categories & Campaigns</h4>
              <p className="text-[10px] text-gray-400 mb-3">Optionally limit where this card template can be used.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Business categories', value: 'All categories', opts: ['All', 'Restaurant & Café', 'Retail & Shop', 'Fitness & Gym'] },
                  { label: 'Geography', value: 'Worldwide', opts: ['Worldwide', 'North America', 'Europe', 'Asia'] },
                  { label: 'Campaigns', value: 'None', opts: ['None', 'Summer 2026', 'Holiday Limited Edition'] },
                  { label: 'Default template', value: 'Yes', opts: ['Yes', 'No'] },
                ].map(d => (
                  <div key={d.label} className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                    <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 mb-1">{d.label}</p>
                    <select className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      {d.opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <h4 className="text-xs font-semibold text-gray-800 dark:text-white mb-3">Assignment Summary</h4>
              <div className="divide-y divide-gray-50 dark:divide-gray-700/50 text-[10px]">
                <div className="flex justify-between py-1.5"><span className="text-gray-400">Template</span><span className="font-medium text-gray-700 dark:text-gray-200 text-right">{templateName || 'Untitled'}</span></div>
                <div className="flex justify-between py-1.5"><span className="text-gray-400">Card for</span><span className="font-medium text-gray-700 dark:text-gray-200 capitalize">{cardType}</span></div>
                <div className="flex justify-between py-1.5"><span className="text-gray-400">Card type</span><span className="font-medium text-gray-700 dark:text-gray-200">{category}</span></div>
                <div className="flex justify-between py-1.5"><span className="text-gray-400">Memberships</span><span className="font-medium text-gray-700 dark:text-gray-200">{assignMemberships.length}</span></div>
                <div className="flex justify-between py-1.5"><span className="text-gray-400">Sectors</span><span className="font-medium text-gray-700 dark:text-gray-200">{sectorIds.length}</span></div>
                <div className="flex justify-between py-1.5"><span className="text-gray-400">Seasons</span><span className="font-medium text-gray-700 dark:text-gray-200">{seasonIds.length}</span></div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <h4 className="text-xs font-semibold text-gray-800 dark:text-white mb-2">Ready to publish?</h4>
              <p className="text-[10px] text-gray-400 leading-relaxed mb-3">Save the assignment so it applies when the card template is published.</p>
              <button onClick={saveDraft} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 mb-2">Save Draft</button>
              <button onClick={handlePublish} className="w-full px-3 py-2 rounded-lg bg-green-500 text-white text-[10px] font-semibold hover:bg-green-600">Publish Card Template</button>
            </div>
          </div>
        </div>
      )}

      <StepHelpModal stepId={stepHelp} onClose={() => setStepHelp(null)} />
    </div>
  )
}
