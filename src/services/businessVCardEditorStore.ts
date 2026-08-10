/* ------------------------------------------------------------------ */
/*  MCOMVCard Business VCard Content Editor — mock data store.         */
/*  Businesses edit the CONTENT of an admin-assigned VCard template.   */
/*  The structure, layout and locked fields come from the Admin.       */
/*  This module mirrors the admin builder's section schema so the      */
/*  live preview renders exactly like the template the Admin created.  */
/* ------------------------------------------------------------------ */

import { getAllAssignedVCards, isClaimedVCard, mockBusinessProfile } from './businessStore'
import { loadSeasons } from './catalogStore'
import { buildDefaultCentreConfigs, type CentreConfig } from '../pages/admin/card-management/TemplateBuilderPage'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type BizFieldType = 'text' | 'textarea' | 'image' | 'select' | 'toggle' | 'list'

export interface BizItemFieldDef {
  key: string
  label: string
  type: BizFieldType
  options?: string[]
  placeholder?: string
  editable?: boolean
}

export interface BizFieldDef {
  key: string
  label: string
  type: BizFieldType
  options?: string[]
  placeholder?: string
  editable?: boolean
  itemLabel?: string
  itemFields?: BizItemFieldDef[]
}

export interface BizSectionDef {
  id: string
  name: string
  icon: string
  desc: string
  /* Whole section locked by Admin — business can only view it. */
  locked: boolean
  /* Business may add custom content blocks inside this section. */
  blocksAllowed?: boolean
  fields: BizFieldDef[]
}

export type BizCustomBlockType = 'title' | 'text' | 'paragraph' | 'image' | 'link' | 'button'

export interface BizCustomBlock {
  id: number
  type: BizCustomBlockType
  values: Record<string, string>
}

export interface BizSectionState {
  uid: string
  schemaId: string
  name: string
  enabled: boolean
  values: Record<string, string>
  items: Record<string, Record<string, string>[]>
  blocks: BizCustomBlock[]
  fontSize?: number
  /* Runtime locked flag copied from the Admin template definition. */
  locked: boolean
  blocksAllowed: boolean
  /* Which Share / Exchange / Redeem centre this section belongs to. */
  centre?: string
}

/* Default centre assignment for each business section id — mirrors the
   Admin builder's SECTION_CENTRES so the shared preview renderer groups
   sections into the same Share / Exchange / Redeem centres. */
export const BIZ_SECTION_CENTRES: Record<string, string> = {
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
  exchange: 'exchange',
  redeem: 'redeem',
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

/* Per-vcard password protection — the business owner decides which
   sections require a 6-digit PIN before they unlock on the published card. */
export interface VCardProtection {
  enabled: boolean
  password: string
  hint: string
  sections: string[]
}

/* ------------------------------------------------------------------ */
/*  Section schema — mirrors the classic vcard1 template anatomy.      */
/*  Same ids/names/icons as the Admin builder so the shared preview    */
/*  renderer (VCardPhoneContent) renders it identically.               */
/*  `editable: false` fields are locked by the Admin.                  */
/* ------------------------------------------------------------------ */

export const BIZ_SECTIONS: BizSectionDef[] = [
  {
    id: 'countdown',
    name: 'Season Countdown',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    desc: 'Live countdown to the end of an active season — shown above the banner',
    locked: true,
    fields: [
      { key: 'seasonIds', label: 'Seasons', type: 'text', editable: false, placeholder: 'Season ids' },
      { key: 'label', label: 'Label', type: 'text', editable: false, placeholder: 'Season ends in' },
      { key: 'color', label: 'Accent color', type: 'text', editable: false, placeholder: '#F97316' },
    ],
  },
  {
    id: 'banner',
    name: 'Banner',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    desc: 'Cover image shown at the top of the card',
    locked: true,
    fields: [
      { key: 'image', label: 'Banner image', type: 'image', editable: false, placeholder: 'https://example.com/banner.jpg' },
    ],
  },
  {
    id: 'profile',
    name: 'Profile',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    desc: 'Avatar, name, designation and short description',
    locked: false,
    blocksAllowed: false,
    fields: [
      { key: 'avatar', label: 'Profile picture', type: 'image', editable: true, placeholder: 'https://example.com/avatar.jpg' },
      { key: 'name', label: 'Full name', type: 'text', editable: false, placeholder: 'Business name' },
      { key: 'designation', label: 'Designation / title', type: 'text', editable: true, placeholder: 'Owner' },
      { key: 'description', label: 'Short description', type: 'textarea', editable: true, placeholder: 'Welcome to my business…' },
    ],
  },
  {
    id: 'social',
    name: 'Social Icons',
    icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    desc: 'Social media links shown under the profile',
    locked: false,
    blocksAllowed: false,
    fields: [
      {
        key: 'links',
        label: 'Social links',
        type: 'list',
        itemLabel: 'Social link',
        editable: true,
        itemFields: [
          { key: 'platform', label: 'Platform', type: 'select', editable: true, options: ['Facebook', 'Instagram', 'LinkedIn', 'WhatsApp', 'Twitter / X', 'YouTube', 'TikTok', 'Telegram', 'Other'] },
          { key: 'url', label: 'Profile URL', type: 'text', editable: true, placeholder: 'https://facebook.com/username' },
        ],
      },
    ],
  },
  {
    id: 'contacts',
    name: 'Contact Cards',
    icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    desc: 'Quick info cards — email, birthday, phone, location…',
    locked: false,
    blocksAllowed: false,
    fields: [
      {
        key: 'cards',
        label: 'Contact cards',
        type: 'list',
        itemLabel: 'Contact card',
        editable: true,
        itemFields: [
          { key: 'type', label: 'Type', type: 'select', editable: false, options: ['Email', 'Birthday', 'Phone', 'Location', 'Website', 'Address', 'Other'] },
          { key: 'label', label: 'Label', type: 'text', editable: false, placeholder: 'Email' },
          { key: 'value', label: 'Value', type: 'text', editable: true, placeholder: 'hello@example.com' },
        ],
      },
    ],
  },
  {
    id: 'appointment',
    name: 'Make an Appointment',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    desc: 'Date & time booking widget',
    locked: false,
    blocksAllowed: true,
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', editable: false, placeholder: 'Make an Appointment' },
      { key: 'button', label: 'Button text', type: 'text', editable: true, placeholder: 'Request Appointment' },
    ],
  },
  {
    id: 'services',
    name: 'Our Services',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    desc: 'List of services with descriptions',
    locked: false,
    blocksAllowed: true,
    fields: [
      {
        key: 'items',
        label: 'Services',
        type: 'list',
        itemLabel: 'Service',
        editable: true,
        itemFields: [
          { key: 'icon', label: 'Icon (emoji)', type: 'text', editable: true, placeholder: '✂️' },
          { key: 'title', label: 'Title', type: 'text', editable: true, placeholder: 'Hair Styling' },
          { key: 'description', label: 'Description', type: 'textarea', editable: true, placeholder: 'Short description…' },
        ],
      },
    ],
  },
  {
    id: 'gallery',
    name: 'Gallery',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    desc: 'Image slider with lightbox',
    locked: true,
    fields: [
      {
        key: 'images',
        label: 'Gallery images',
        type: 'list',
        itemLabel: 'Image',
        editable: false,
        itemFields: [
          { key: 'url', label: 'Image', type: 'image', editable: false, placeholder: 'https://example.com/photo.jpg' },
        ],
      },
    ],
  },
  {
    id: 'products',
    name: 'Products',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    desc: 'Product cards with image, price and description',
    locked: false,
    blocksAllowed: true,
    fields: [
      {
        key: 'items',
        label: 'Products',
        type: 'list',
        itemLabel: 'Product',
        editable: true,
        itemFields: [
          { key: 'image', label: 'Product image', type: 'image', editable: true, placeholder: 'https://example.com/product.jpg' },
          { key: 'title', label: 'Title', type: 'text', editable: true, placeholder: 'Premium Package' },
          { key: 'description', label: 'Description', type: 'textarea', editable: true, placeholder: 'Short description…' },
          { key: 'price', label: 'Price', type: 'text', editable: true, placeholder: '$49' },
        ],
      },
    ],
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    desc: 'Client reviews carousel',
    locked: true,
    fields: [
      {
        key: 'items',
        label: 'Testimonials',
        type: 'list',
        itemLabel: 'Testimonial',
        editable: false,
        itemFields: [
          { key: 'avatar', label: 'Avatar', type: 'image', editable: false, placeholder: 'https://example.com/avatar.jpg' },
          { key: 'name', label: 'Name', type: 'text', editable: false, placeholder: 'Jane Doe' },
          { key: 'role', label: 'Role', type: 'text', editable: false, placeholder: 'Happy customer' },
          { key: 'quote', label: 'Quote', type: 'textarea', editable: false, placeholder: 'Amazing service!' },
        ],
      },
    ],
  },
  {
    id: 'blog',
    name: 'Blog',
    icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9',
    desc: 'Latest articles carousel',
    locked: true,
    fields: [
      {
        key: 'items',
        label: 'Posts',
        type: 'list',
        itemLabel: 'Post',
        editable: false,
        itemFields: [
          { key: 'image', label: 'Post image', type: 'image', editable: false, placeholder: 'https://example.com/post.jpg' },
          { key: 'title', label: 'Title', type: 'text', editable: false, placeholder: '5 tips for your business' },
          { key: 'date', label: 'Date', type: 'text', editable: false, placeholder: 'Jan 15, 2026' },
          { key: 'excerpt', label: 'Excerpt', type: 'textarea', editable: false, placeholder: 'Short preview…' },
        ],
      },
    ],
  },
  {
    id: 'qr',
    name: 'QR Code',
    icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z',
    desc: 'Dynamic QR code — managed by Admin',
    locked: true,
    fields: [
      { key: 'qrMode', label: 'QR generation', type: 'select', editable: false, options: ['Generate by System', 'Upload from File', 'Allow User Upload'] },
      { key: 'heading', label: 'Heading', type: 'text', editable: false, placeholder: 'Scan my QR Code' },
      { key: 'qrDestination', label: 'Destination', type: 'text', editable: false, placeholder: 'https://…' },
    ],
  },
  {
    id: 'hours',
    name: 'Business Hours',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    desc: 'Weekly opening times',
    locked: false,
    blocksAllowed: true,
    fields: [
      {
        key: 'days',
        label: 'Days',
        type: 'list',
        itemLabel: 'Day',
        editable: true,
        itemFields: [
          { key: 'day', label: 'Day', type: 'select', editable: false, options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
          { key: 'hours', label: 'Hours', type: 'text', editable: true, placeholder: '9:00 AM – 5:00 PM' },
          { key: 'closed', label: 'Closed', type: 'toggle', editable: true },
        ],
      },
    ],
  },
  {
    id: 'contactForm',
    name: 'Contact Form',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    desc: 'Contact us form with message',
    locked: false,
    blocksAllowed: true,
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', editable: false, placeholder: 'Contact Us' },
      { key: 'button', label: 'Button text', type: 'text', editable: true, placeholder: 'Send Message' },
    ],
  },
  {
    id: 'share',
    name: 'Download & Share',
    icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
    desc: 'Save contact, download vCard and share buttons',
    locked: true,
    fields: [
      { key: 'downloadLabel', label: 'Download label', type: 'text', editable: false, placeholder: 'Download Vcard' },
      { key: 'shareLabel', label: 'Share label', type: 'text', editable: false, placeholder: 'Share' },
    ],
  },
  {
    id: 'map',
    name: 'Map',
    icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
    desc: 'Embedded Google Map',
    locked: true,
    fields: [
      { key: 'address', label: 'Address', type: 'text', editable: false, placeholder: '123 Main Street, City' },
      { key: 'embedUrl', label: 'Map embed URL', type: 'text', editable: false, placeholder: 'https://maps.google.com/maps?q=…' },
    ],
  },
  {
    id: 'exchange',
    name: 'Exchange Contact',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    desc: 'Swap contact details with a tap or QR scan',
    locked: true,
    fields: [
      { key: 'label', label: 'Heading', type: 'text', editable: false, placeholder: 'Exchange Contact' },
      { key: 'description', label: 'Description', type: 'text', editable: false, placeholder: 'Tap to share your details' },
    ],
  },
  {
    id: 'redeem',
    name: 'Redeem Rewards',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    desc: 'Redeem points, offers, coupons and rewards',
    locked: true,
    fields: [
      { key: 'label', label: 'Heading', type: 'text', editable: false, placeholder: 'Redeem Rewards' },
      { key: 'value', label: 'Value', type: 'text', editable: false, placeholder: 'e.g. 250 points · 15% off' },
      { key: 'button', label: 'Button label', type: 'text', editable: false, placeholder: 'Redeem' },
    ],
  },
  {
    id: 'buildGroup',
    name: 'Build Group',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    desc: 'Invite members and grow a group or community',
    locked: true,
    fields: [
      { key: 'label', label: 'Heading', type: 'text', editable: false, placeholder: 'Build Group' },
      { key: 'button', label: 'Button label', type: 'text', editable: false, placeholder: 'Join Group' },
    ],
  },
  {
    id: 'password',
    name: 'Password Protection',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    desc: 'Require a password before the card unlocks',
    locked: true,
    fields: [
      { key: 'password', label: 'Password', type: 'text', editable: false, placeholder: 'e.g. 1234' },
      { key: 'hint', label: 'Hint (optional)', type: 'text', editable: false, placeholder: 'Ask staff for the PIN' },
    ],
  },
  {
    id: 'about',
    name: 'About Us',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    desc: 'Long-form story about your business',
    locked: false,
    blocksAllowed: true,
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', editable: true, placeholder: 'About Us' },
      { key: 'text', label: 'Story', type: 'textarea', editable: true, placeholder: 'Tell your story…' },
    ],
  },
  {
    id: 'website',
    name: 'Website',
    icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    desc: 'Your business website link',
    locked: false,
    blocksAllowed: false,
    fields: [
      { key: 'label', label: 'Link label', type: 'text', editable: true, placeholder: 'Visit our website' },
      { key: 'url', label: 'Website URL', type: 'text', editable: true, placeholder: 'https://example.com' },
    ],
  },
  {
    id: 'video',
    name: 'Video',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    desc: 'A promo or introduction video',
    locked: false,
    blocksAllowed: false,
    fields: [
      { key: 'url', label: 'Video URL', type: 'text', editable: true, placeholder: 'https://youtube.com/…' },
      { key: 'poster', label: 'Poster image', type: 'image', editable: true, placeholder: 'https://example.com/poster.jpg' },
    ],
  },
  {
    id: 'evergreen',
    name: 'Evergreen Video / Webinar',
    icon: 'M15.584 15.584a4 4 0 00-5.168 0M18 18a8 8 0 00-12 0m11.314-2.686a4 4 0 00-5.196-.617M12 12h.01',
    desc: 'Reusable video, webinar or live stream where enabled by Admin',
    locked: false,
    blocksAllowed: false,
    fields: [
      { key: 'title', label: 'Title', type: 'text', editable: true, placeholder: 'Coffee & Conversation' },
      { key: 'url', label: 'Stream / video URL', type: 'text', editable: true, placeholder: 'https://…' },
      { key: 'mode', label: 'Mode', type: 'select', editable: true, options: ['Evergreen video', 'On-demand webinar', 'Live streaming'] },
    ],
  },
  {
    id: 'payment',
    name: 'Payment Methods',
    icon: 'M3 10h18M7 15h3m-5-7a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V8z',
    desc: 'How customers can pay',
    locked: false,
    blocksAllowed: false,
    fields: [
      {
        key: 'methods',
        label: 'Accepted payment methods',
        type: 'list',
        itemLabel: 'Method',
        editable: true,
        itemFields: [
          { key: 'method', label: 'Method', type: 'select', editable: true, options: ['Card', 'Cash', 'Bank transfer', 'Mobile money', 'PayPal', 'Gift card', 'Crypto', 'Other'] },
          { key: 'details', label: 'Details (optional)', type: 'text', editable: true, placeholder: 'Visa, Mastercard, Amex' },
          { key: 'active', label: 'Active', type: 'toggle', editable: true },
        ],
      },
    ],
  },
  {
    id: 'offers',
    name: 'Offers',
    icon: 'M7 7h.01M7 3h5a1 1 0 01.7.3l9 9a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-9-9A1 1 0 013 11V5a2 2 0 012-2z',
    desc: 'Current offers customers can redeem',
    locked: false,
    blocksAllowed: false,
    fields: [
      {
        key: 'items',
        label: 'Offers',
        type: 'list',
        itemLabel: 'Offer',
        editable: true,
        itemFields: [
          { key: 'title', label: 'Title', type: 'text', editable: true, placeholder: 'Free pastry with coffee' },
          { key: 'description', label: 'Description', type: 'textarea', editable: true, placeholder: 'Short description…' },
          { key: 'value', label: 'Value', type: 'text', editable: true, placeholder: '10% off' },
          { key: 'membership', label: 'Membership level', type: 'select', editable: true, options: ['Any', 'Bronze', 'Silver', 'Gold', 'Platinum'] },
        ],
      },
    ],
  },
  {
    id: 'rewards',
    name: 'Rewards',
    icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    desc: 'Loyalty rewards and points',
    locked: false,
    blocksAllowed: false,
    fields: [
      {
        key: 'items',
        label: 'Rewards',
        type: 'list',
        itemLabel: 'Reward',
        editable: true,
        itemFields: [
          { key: 'title', label: 'Title', type: 'text', editable: true, placeholder: 'Loyalty Points' },
          { key: 'description', label: 'Description', type: 'textarea', editable: true, placeholder: 'Earn 1 point per £1…' },
          { key: 'value', label: 'Value', type: 'text', editable: true, placeholder: '1 pt / £1' },
          { key: 'membership', label: 'Membership level', type: 'select', editable: true, options: ['Any', 'Bronze', 'Silver', 'Gold', 'Platinum'] },
        ],
      },
    ],
  },
  {
    id: 'coupons',
    name: 'Coupons',
    icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 010 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 010-4V7a2 2 0 00-2-2H5z',
    desc: 'Coupon codes customers can claim',
    locked: false,
    blocksAllowed: false,
    fields: [
      {
        key: 'items',
        label: 'Coupons',
        type: 'list',
        itemLabel: 'Coupon',
        editable: true,
        itemFields: [
          { key: 'code', label: 'Code', type: 'text', editable: true, placeholder: 'BDAY15' },
          { key: 'title', label: 'Title', type: 'text', editable: true, placeholder: 'Birthday Coupon' },
          { key: 'value', label: 'Value', type: 'text', editable: true, placeholder: '15% off' },
          { key: 'expiry', label: 'Expiry', type: 'text', editable: true, placeholder: '30 days' },
          { key: 'membership', label: 'Membership level', type: 'select', editable: true, options: ['Any', 'Bronze', 'Silver', 'Gold', 'Platinum'] },
        ],
      },
    ],
  },
  {
    id: 'campaigns',
    name: 'Campaigns',
    icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15L18 13a3 3 0 000-6l-5.5-.4A2 2 0 0111 5.882z',
    desc: 'Seasonal and campaign rewards',
    locked: false,
    blocksAllowed: false,
    fields: [
      {
        key: 'items',
        label: 'Campaigns',
        type: 'list',
        itemLabel: 'Campaign',
        editable: true,
        itemFields: [
          { key: 'title', label: 'Title', type: 'text', editable: true, placeholder: 'Summer Campaign' },
          { key: 'description', label: 'Description', type: 'textarea', editable: true, placeholder: 'Seasonal reward…' },
          { key: 'value', label: 'Value', type: 'text', editable: true, placeholder: 'Double points' },
          { key: 'membership', label: 'Membership level', type: 'select', editable: true, options: ['Any', 'Bronze', 'Silver', 'Gold', 'Platinum'] },
        ],
      },
    ],
  },
  {
    id: 'documents',
    name: 'Documents',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    desc: 'Brochures, menus, forms and files',
    locked: false,
    blocksAllowed: false,
    fields: [
      {
        key: 'items',
        label: 'Documents',
        type: 'list',
        itemLabel: 'Document',
        editable: true,
        itemFields: [
          { key: 'title', label: 'Title', type: 'text', editable: true, placeholder: 'Menu (PDF)' },
          { key: 'type', label: 'Type', type: 'select', editable: true, options: ['PDF', 'Doc', 'Image', 'Video', 'Spreadsheet', 'Archive', 'Other'] },
          { key: 'url', label: 'File URL', type: 'text', editable: true, placeholder: 'https://example.com/file.pdf' },
        ],
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Custom block schema (business can add these in allowed sections)   */
/* ------------------------------------------------------------------ */

export const BIZ_CUSTOM_BLOCK_DEFS: { type: BizCustomBlockType; name: string; icon: string; desc: string }[] = [
  { type: 'title', name: 'Title', icon: 'M4 5h16M4 12h16M4 19h10', desc: 'Big heading text' },
  { type: 'text', name: 'Text', icon: 'M3 5h12M9 3v2m0 4v2m0 4v2m0 4v2m5-10l4 4-4 4', desc: 'Paragraph with bold / italic / size options' },
  { type: 'paragraph', name: 'Paragraph', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', desc: 'Long-form paragraph block' },
  { type: 'image', name: 'Image Upload', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', desc: 'Upload an image or photo' },
  { type: 'link', name: 'Link', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', desc: 'Hyperlink to a page or file' },
  { type: 'button', name: 'Button', icon: 'M5 3l14 9-14 9V3z', desc: 'Call-to-action button' },
]

/* ------------------------------------------------------------------ */
/*  Default content per section (mirrors the Admin's defaults + the    */
/*  seeded GreenLeaf business data).                                   */
/* ------------------------------------------------------------------ */

function buildDefaultItems(): Record<string, Record<string, string>[]> {
  return {
    social: [
      { platform: 'Facebook', url: 'https://facebook.com/greenleafcoffee' },
      { platform: 'Instagram', url: 'https://instagram.com/greenleafcoffee' },
      { platform: 'WhatsApp', url: 'https://wa.me/442079460958' },
    ],
    contacts: [
      { type: 'Email', label: 'Email', value: mockBusinessProfile.email },
      { type: 'Phone', label: 'Phone', value: mockBusinessProfile.phone },
      { type: 'Website', label: 'Website', value: mockBusinessProfile.website },
      { type: 'Address', label: 'Address', value: mockBusinessProfile.address },
    ],
    services: [
      { icon: '☕', title: 'Specialty Coffee', description: 'Single-origin and house blends, roasted weekly.' },
      { icon: '🥐', title: 'Fresh Food', description: 'Bakery, brunch and seasonal specials.' },
      { icon: '🛎️', title: 'Catering', description: 'Coffee bars and catering for events.' },
    ],
    products: [
      { image: '', title: 'House Blend Beans', description: '250g bag of our signature roast.', price: '£12' },
      { image: '', title: 'GreenLeaf Merch', description: 'Mugs, cups and tote bags.', price: '£18' },
    ],
    testimonials: [
      { avatar: '', name: 'Jane Doe', role: 'Regular customer', quote: 'Best coffee on King Street, hands down!' },
      { avatar: '', name: 'John Smith', role: 'Local business owner', quote: 'We cater all our meetings with GreenLeaf.' },
    ],
    blog: [
      { image: '', title: 'Meet our new single-origin', date: 'Jul 20, 2026', excerpt: 'A light, floral Ethiopian roast just landed…' },
    ],
    gallery: [{ url: '' }, { url: '' }, { url: '' }, { url: '' }, { url: '' }, { url: '' }],
    hours: [
      { day: 'Monday', hours: '7:00 AM – 5:00 PM', closed: '' },
      { day: 'Tuesday', hours: '7:00 AM – 5:00 PM', closed: '' },
      { day: 'Wednesday', hours: '7:00 AM – 5:00 PM', closed: '' },
      { day: 'Thursday', hours: '7:00 AM – 5:00 PM', closed: '' },
      { day: 'Friday', hours: '7:00 AM – 5:00 PM', closed: '' },
      { day: 'Saturday', hours: '8:00 AM – 3:00 PM', closed: '' },
      { day: 'Sunday', hours: '', closed: 'true' },
    ],
    payment: [
      { method: 'Card', details: 'Visa, Mastercard, Amex', active: 'true' },
      { method: 'Cash', details: '', active: 'true' },
      { method: 'Bank transfer', details: '', active: 'true' },
      { method: 'Gift card', details: 'GreenLeaf gift cards', active: 'true' },
    ],
    offers: [
      { title: 'Free pastry with any coffee', description: 'Weekdays before 11am.', value: 'Free pastry', membership: 'Any' },
      { title: '10% off first order', description: 'For new customers.', value: '10% off', membership: 'Any' },
    ],
    rewards: [
      { title: 'Loyalty Points', description: 'Earn 1 point for every £1 spent.', value: '1 pt / £1', membership: 'Any' },
      { title: 'Gold Member Perk', description: 'Free size upgrade on any drink.', value: 'Free upgrade', membership: 'Gold' },
    ],
    coupons: [
      { code: 'BDAY15', title: 'Birthday Coupon', description: 'Birthday month treat.', value: '15% off', expiry: '30 days', membership: 'Any' },
      { code: 'WELCOME10', title: 'Welcome Coupon', description: 'First visit.', value: '10% off', expiry: '90 days', membership: 'Any' },
    ],
    campaigns: [
      { title: 'Summer Season Campaign', description: 'Seasonal reward during Summer 2026.', value: 'Double points', membership: 'Silver' },
    ],
    documents: [
      { title: 'Menu (PDF)', type: 'PDF', url: 'https://example.com/greenleaf-menu.pdf' },
      { title: 'Allergy guide', type: 'Doc', url: 'https://example.com/allergies.pdf' },
    ],
  }
}

function buildDefaultValues(vcardName: string, vcardDescription: string): Record<string, Record<string, string>> {
  return {
    banner: { image: '' },
    profile: {
      avatar: '',
      name: mockBusinessProfile.name,
      designation: 'Specialty Coffee Shop',
      description: vcardDescription || 'Welcome to our business!',
    },
    appointment: { heading: 'Make an Appointment', button: 'Book a Table' },
    qr: { qrMode: 'Generate by System', heading: 'Scan my QR Code', qrDestination: `https://vcard.mcom/b/${vcardName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, qrColor: '#111827', qrBgColor: '#ffffff', qrStyle: 'square', qrSize: 'Medium', qrPosition: 'Right', qrType: 'Open this VCard', qrDynamic: 'true' },
    contactForm: { heading: 'Contact Us', button: 'Send Message' },
    share: { downloadLabel: 'Download Vcard', shareLabel: 'Share' },
    map: { address: mockBusinessProfile.address, embedUrl: '' },
    countdown: { label: 'Season ends in', color: '#F97316', seasonIds: loadSeasons().map(s => s.id).join(',') },
    exchange: { label: 'Exchange Contact', description: 'Tap to share your details' },
    redeem: { label: 'Redeem Rewards', value: '250 points · 15% off', button: 'Redeem' },
    buildGroup: { label: 'Build Group', description: 'Invite friends and grow together', button: 'Join Group' },
    password: { password: '', hint: '', lockedMessage: 'This card is password protected' },
    about: { heading: 'About GreenLeaf', text: 'Independent speciality coffee shop on King Street — roasting weekly and serving the neighbourhood since 2016.' },
    website: { label: 'Visit our website', url: mockBusinessProfile.website },
    video: { url: 'https://example.com/greenleaf-promo.mp4', poster: '' },
    evergreen: { title: 'Coffee & Conversation — Live', url: 'https://example.com/live/greenleaf', mode: 'Live streaming' },
    payment: {},
  }
}

/* ------------------------------------------------------------------ */
/*  Build the full editor state for a vcard.                           */
/* ------------------------------------------------------------------ */

export function buildEditorSections(vcardId: number): BizSectionState[] {
  const vcard = getAllAssignedVCards().find(v => v.id === vcardId) ?? getAllAssignedVCards()[0]
  const defaults = buildDefaultItems()
  const values = buildDefaultValues(vcard.name, vcard.description)

  return BIZ_SECTIONS.map(section => {
    const sectionValues: Record<string, string> = {}
    const items: Record<string, Record<string, string>[]> = {}
    section.fields.forEach(field => {
      if (field.type === 'list' && field.itemFields) {
        items[field.key] = (defaults[section.id] ?? []).map(item => {
          const base: Record<string, string> = {}
          field.itemFields!.forEach(ifd => {
            base[ifd.key] = item[ifd.key] ?? ''
          })
          return base
        })
      } else {
        sectionValues[field.key] = values[section.id]?.[field.key] ?? ''
      }
    })
    return {
      uid: section.id,
      schemaId: section.id,
      name: section.name,
      enabled: true,
      values: sectionValues,
      items,
      blocks: [],
      locked: section.locked,
      blocksAllowed: !!section.blocksAllowed,
      centre: BIZ_SECTION_CENTRES[section.id] ?? 'other',
    }
  })
}

/* ------------------------------------------------------------------ */
/*  Membership levels — Share / Exchange / Redeem eligibility.          */
/*  Exchanges and redemptions are controlled by membership level,       */
/*  like-for-like (Bronze ↔ Bronze, Silver ↔ Silver, …), so the UI      */
/*  always shows eligibility instead of offering everything to everyone.*/
/* ------------------------------------------------------------------ */

export type MembershipLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'

export const MEMBERSHIP_LEVELS: MembershipLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum']

export type MembershipEligibility = MembershipLevel | 'Any'

/* ------------------------------------------------------------------ */
/*  Per-centre business controls — what the business configures in     */
/*  each edit centre. Persisted per vcard and merged into the centre    */
/*  content shown on the published card.                                */
/* ------------------------------------------------------------------ */

export interface ShareSelections {
  businessInfo: boolean
  contactInfo: boolean
  socialLinks: boolean
  website: boolean
  services: boolean
  products: boolean
  images: boolean
  videos: boolean
  documents: boolean
  appointmentLink: boolean
  location: boolean
  qr: boolean
  vcardLink: boolean
}

export interface ExchangeableItem {
  id: number
  name: string
  description: string
  value: string
  availability: string
  terms: string
  membership: MembershipEligibility
}

export interface RedemptionOffer {
  id: number
  title: string
  description: string
  value: string
  kind: 'reward' | 'coupon' | 'voucher' | 'cashback' | 'giftcard' | 'campaign' | 'membership'
  membership: MembershipEligibility
}

export interface RedemptionRecord {
  id: number
  customer: string
  item: string
  value: string
  status: 'pending' | 'completed' | 'expired'
  date: string
}

export interface BusinessCentreControls {
  share: {
    selections: ShareSelections
  }
  exchange: {
    items: ExchangeableItem[]
    incomingRequests: number
    acceptedExchanges: number
    completedExchanges: number
  }
  redeem: {
    offers: RedemptionOffer[]
    pending: number
    completed: number
    expired: number
    history: RedemptionRecord[]
  }
}

export const SHARE_SELECTION_OPTIONS: { key: keyof ShareSelections; label: string }[] = [
  { key: 'businessInfo', label: 'Business information' },
  { key: 'contactInfo', label: 'Contact information' },
  { key: 'socialLinks', label: 'Social links' },
  { key: 'website', label: 'Website' },
  { key: 'services', label: 'Services' },
  { key: 'products', label: 'Products' },
  { key: 'images', label: 'Images / gallery' },
  { key: 'videos', label: 'Videos' },
  { key: 'documents', label: 'Documents' },
  { key: 'appointmentLink', label: 'Appointment link' },
  { key: 'location', label: 'Location' },
  { key: 'qr', label: 'QR code' },
  { key: 'vcardLink', label: 'VCard link' },
]

export const REDEMPTION_KIND_LABELS: Record<RedemptionOffer['kind'], string> = {
  reward: 'Reward',
  coupon: 'Coupon',
  voucher: 'Voucher',
  cashback: 'Cashback',
  giftcard: 'Gift / e-card',
  campaign: 'Campaign',
  membership: 'Membership reward',
}

export function buildDefaultCentreControls(): BusinessCentreControls {
  let id = 1
  const nextId = () => id++
  return {
    share: {
      selections: {
        businessInfo: true,
        contactInfo: true,
        socialLinks: true,
        website: true,
        services: true,
        products: true,
        images: true,
        videos: true,
        documents: false,
        appointmentLink: true,
        location: true,
        qr: true,
        vcardLink: true,
      },
    },
    exchange: {
      items: [
        { id: nextId(), name: 'House Blend Beans', description: '250g bag of our signature roast.', value: '£12', availability: 'In stock', terms: 'Freshly roasted weekly.', membership: 'Any' },
        { id: nextId(), name: 'Catering Package', description: 'Coffee bar for your event.', value: '£150', availability: 'Limited', terms: 'Book 7 days ahead.', membership: 'Gold' },
      ],
      incomingRequests: 2,
      acceptedExchanges: 1,
      completedExchanges: 12,
    },
    redeem: {
      offers: [
        { id: nextId(), title: 'Loyalty Points', description: 'Convert your points to store credit.', value: '1,000 pts', kind: 'reward', membership: 'Any' },
        { id: nextId(), title: 'Cashback 5%', description: 'On your next purchase.', value: '5% back', kind: 'cashback', membership: 'Any' },
        { id: nextId(), title: 'Birthday Coupon', description: 'Birthday month treat.', value: '15% off', kind: 'coupon', membership: 'Any' },
        { id: nextId(), title: 'Gold Member Reward', description: 'Exclusive seasonal reward.', value: 'Free upgrade', kind: 'membership', membership: 'Gold' },
      ],
      pending: 3,
      completed: 27,
      expired: 4,
      history: [
        { id: nextId(), customer: 'Jane Doe', item: 'Loyalty Points', value: '1,000 pts', status: 'completed', date: 'Aug 2, 2026' },
        { id: nextId(), customer: 'John Smith', item: 'Cashback 5%', value: '5% back', status: 'pending', date: 'Aug 6, 2026' },
        { id: nextId(), customer: 'Priya Patel', item: 'Birthday Coupon', value: '15% off', status: 'expired', date: 'Jul 29, 2026' },
      ],
    },
  }
}

/* ------------------------------------------------------------------ */
/*  Build the per-centre content for a business VCard's editor state.   */
/*  Returns the admin-authored default Share / Exchange / Redeem        */
/*  centre content enriched with the content the business saved on its  */
/*  own sections (plus the per-centre business controls), so the tabs   */
/*  are always populated and the VCard clearly serves the three core    */
/*  actions. `controls` is optional — when omitted it falls back to the */
/*  persisted per-vcard controls so the published card stays in sync.   */
/* ------------------------------------------------------------------ */

export function buildBusinessCentres(sections: BizSectionState[], controls?: BusinessCentreControls, appointmentSettings?: AppointmentSettings): Record<string, CentreConfig> {
  const centres = buildDefaultCentreConfigs()
  const byId = (id: string) => sections.find(s => s.schemaId === id)

  /* --- Header-intrinsic section values (share / exchange / redeem) --- */
  const share = byId('share')
  if (share?.enabled) {
    const shareLinks = share.values.shareLabel || share.values.downloadLabel
    centres.share = {
      ...centres.share,
      contentMode: 'items',
      contentTitle: shareLinks ? 'Share this VCard' : centres.share.contentTitle,
      items: shareLinks
        ? [{ image: '', title: share.values.shareLabel || 'Share', description: 'Send this VCard to anyone, on any device', value: '', linkLabel: shareLinks, linkUrl: '' }, ...centres.share.items]
        : centres.share.items,
    }
  }

  const exchange = byId('exchange')
  if (exchange?.enabled) {
    centres.exchange = {
      ...centres.exchange,
      contentMode: 'items',
      contentTitle: exchange.values.label || centres.exchange.contentTitle,
      items: exchange.values.description
        ? [{ image: '', title: exchange.values.label || 'Exchange Contact', description: exchange.values.description, value: '', linkLabel: 'Exchange', linkUrl: '' }, ...centres.exchange.items]
        : centres.exchange.items,
    }
  }

  const redeem = byId('redeem')
  if (redeem?.enabled) {
    centres.redeem = {
      ...centres.redeem,
      contentMode: 'items',
      contentTitle: redeem.values.label || centres.redeem.contentTitle,
      items: (redeem.values.value || redeem.values.button)
        ? [{ image: '', title: redeem.values.label || 'Redeem Rewards', description: redeem.values.value || '', value: redeem.values.value || '', linkLabel: redeem.values.button || 'Redeem', linkUrl: '' }, ...centres.redeem.items]
        : centres.redeem.items,
    }
  }

  if (!controls) return centres

  /* --- SHARE centre — the business selects approved content to share.  */
  const sel = controls.share.selections
  const shareItems: CentreConfig['items'] = []
  const push = (item: (typeof shareItems)[number]) => {
    if (item.title || item.image) shareItems.push(item)
  }
  if (sel.businessInfo) {
    const about = byId('about')
    const profile = byId('profile')
    const desc = about?.values.text || profile?.values.description || ''
    if (desc) push({ title: about?.values.heading || 'About us', description: desc, value: '', linkLabel: 'Read more', linkUrl: '' })
  }
  if (sel.website) {
    const ws = byId('website')
    if (ws?.values.url) push({ title: ws.values.label || 'Our website', description: ws.values.url, value: '', linkLabel: 'Visit', linkUrl: ws.values.url })
  }
  if (sel.contactInfo) {
    const contacts = byId('contacts')
    ;(contacts?.items.cards ?? []).forEach(card => {
      if (card.value) push({ title: card.label || card.type, description: card.value, value: '', linkLabel: '', linkUrl: '' })
    })
  }
  if (sel.socialLinks) {
    const social = byId('social')
    ;(social?.items.links ?? []).forEach(link => {
      if (link.url) push({ title: link.platform, description: link.url, value: '', linkLabel: 'Follow', linkUrl: link.url })
    })
  }
  if (sel.services) {
    const services = byId('services')
    ;(services?.items.items ?? []).forEach(it => {
      if (it.title) push({ title: it.title, description: it.description, value: '', linkLabel: 'View', linkUrl: '' })
    })
  }
  if (sel.products) {
    const products = byId('products')
    ;(products?.items.items ?? []).forEach(it => {
      if (it.title) push({ title: it.title, description: it.description, value: it.price, linkLabel: 'View', linkUrl: '' })
    })
  }
  if (sel.images) {
    const gallery = byId('gallery')
    ;(gallery?.items.images ?? []).forEach(img => {
      if (img.url) push({ image: img.url, title: 'Gallery', description: '', value: '', linkLabel: '', linkUrl: '' })
    })
  }
  if (sel.videos) {
    const video = byId('video')
    const evergreen = byId('evergreen')
    if (video?.values.url) push({ title: 'Video', description: video.values.url, value: '', linkLabel: 'Watch', linkUrl: video.values.url })
    if (evergreen?.values.url) push({ title: evergreen.values.title || 'Webinar / Live', description: evergreen.values.url, value: '', linkLabel: 'Watch', linkUrl: evergreen.values.url })
  }
  if (sel.documents) {
    const documents = byId('documents')
    ;(documents?.items.items ?? []).forEach(doc => {
      if (doc.url) push({ title: doc.title, description: `${doc.type || 'Document'} · ${doc.url}`, value: '', linkLabel: 'Open', linkUrl: doc.url })
    })
  }
  if (sel.appointmentLink && appointmentSettings?.enabled !== false) {
    const appointment = byId('appointment')
    push({ title: 'Book an appointment', description: appointment?.values.button || 'Request Appointment', value: '', linkLabel: appointment?.values.button || 'Book', linkUrl: appointmentSettings?.bookingUrl || '' })
  }
  if (sel.location) {
    const map = byId('map')
    if (map?.values.address) push({ title: 'Location', description: map.values.address, value: '', linkLabel: 'Map', linkUrl: map.values.embedUrl || '' })
  }
  if (sel.qr) push({ title: 'QR Code', description: 'Scan to open this VCard on any device', value: '', linkLabel: 'Scan', linkUrl: '' })
  if (sel.vcardLink) push({ title: 'VCard Link', description: 'Send this card anywhere', value: '', linkLabel: 'Share', linkUrl: '' })
  if (shareItems.length > 0) {
    centres.share = { ...centres.share, contentMode: 'items', contentTitle: 'Share this VCard', items: [...shareItems, ...centres.share.items] }
  }

  /* --- EXCHANGE centre — exchangeable goods, services and assets. The   */
  /* membership rule (like-for-like) is visible per item via eligibility. */
  const exchangeItems: CentreConfig['items'] = []
  controls.exchange.items.forEach(it => {
    if (!it.name) return
    const eligibility = it.membership === 'Any' ? 'Open to all levels' : `Eligible: ${it.membership}`
    const availability = it.availability ? ` · ${it.availability}` : ''
    exchangeItems.push({ title: it.name, description: `${it.description || ''}${availability} · ${eligibility}`, value: it.value, linkLabel: 'Exchange', linkUrl: '' })
  })
  const products = byId('products')
  ;(products?.items.items ?? []).forEach(p => {
    if (p.title) exchangeItems.push({ title: p.title, description: p.description, value: p.price, linkLabel: 'Exchange', linkUrl: '' })
  })
  if (exchangeItems.length > 0) {
    centres.exchange = { ...centres.exchange, contentMode: 'items', contentTitle: 'What we exchange', items: [...exchangeItems, ...centres.exchange.items] }
  }

  /* --- REDEEM centre — rewards available at the customer's level.       */
  const redeemItems: CentreConfig['items'] = []
  controls.redeem.offers.forEach(o => {
    if (!o.title) return
    const kind = REDEMPTION_KIND_LABELS[o.kind] ?? 'Reward'
    const membership = o.membership === 'Any' ? 'Open to all levels' : `For ${o.membership} members`
    redeemItems.push({ title: o.title, description: `${o.description || ''} · ${kind} · ${membership}`, value: o.value, linkLabel: 'Redeem', linkUrl: '' })
  })
  if (redeemItems.length > 0) {
    centres.redeem = { ...centres.redeem, contentMode: 'items', contentTitle: 'Redeem your rewards', items: [...redeemItems, ...centres.redeem.items] }
  }

  return centres
}

/* ------------------------------------------------------------------ */
/*  Per-vcard centre controls persisted to localStorage.                */
/* ------------------------------------------------------------------ */

const CONTROLS_KEY = 'mcom.business.vcard.centre-controls'

function loadControlsRaw(): Record<string, BusinessCentreControls> {
  try {
    const raw = localStorage.getItem(CONTROLS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function persistControls(vcardId: number, controls: BusinessCentreControls) {
  const all = loadControlsRaw()
  all[String(vcardId)] = controls
  try {
    localStorage.setItem(CONTROLS_KEY, JSON.stringify(all))
  } catch {
    /* storage unavailable — ignore */
  }
}

export function getBusinessCentreControls(vcardId: number): BusinessCentreControls {
  return loadControlsRaw()[String(vcardId)] ?? buildDefaultCentreControls()
}

export function saveBusinessCentreControls(vcardId: number, controls: BusinessCentreControls) {
  persistControls(vcardId, controls)
}

export function resetBusinessCentreControls(vcardId: number) {
  const all = loadControlsRaw()
  delete all[String(vcardId)]
  try {
    localStorage.setItem(CONTROLS_KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/*  Appointment booking — per-vcard, business-owned. Configures the    */
/*  booking engine behind the Make an Appointment section: the booking  */
/*  link, channel (online / phone), default duration & buffer, advance  */
/*  booking window, weekly time slots, services, payment and the        */
/*  confirmation / cancellation copy.                                   */
/* ------------------------------------------------------------------ */

export interface AppointmentSlotSetting {
  id: number
  day: string
  from: string
  to: string
  closed: boolean
}

export interface AppointmentService {
  id: number
  name: string
  duration: number
  price: string
}

export interface AppointmentSettings {
  enabled: boolean
  heading: string
  button: string
  bookingUrl: string
  onlineBooking: boolean
  phoneBooking: boolean
  phone: string
  duration: number
  buffer: number
  leadTime: number
  advanceWindow: number
  requirePayment: boolean
  paymentNote: string
  confirmationMessage: string
  cancellationPolicy: string
  slots: AppointmentSlotSetting[]
  services: AppointmentService[]
}

export const APPOINTMENT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function buildDefaultAppointmentSettings(): AppointmentSettings {
  let id = 1
  const slots: AppointmentSlotSetting[] = APPOINTMENT_DAYS.map((day, i) => ({
    id: id++,
    day,
    from: '09:00',
    to: '17:00',
    closed: i === 6,
  }))
  return {
    enabled: true,
    heading: 'Make an Appointment',
    button: 'Book a Table',
    bookingUrl: '',
    onlineBooking: true,
    phoneBooking: true,
    phone: mockBusinessProfile.phone,
    duration: 60,
    buffer: 15,
    leadTime: 24,
    advanceWindow: 30,
    requirePayment: false,
    paymentNote: '',
    confirmationMessage: 'Thanks! Your appointment request has been received. We will confirm your slot shortly.',
    cancellationPolicy: 'Please give at least 24 hours notice to cancel or reschedule.',
    slots,
    services: [
      { id: id++, name: 'Standard visit', duration: 60, price: '£0' },
      { id: id++, name: 'Extended visit', duration: 90, price: '' },
    ],
  }
}

const APPOINTMENT_KEY = 'mcom.business.vcard.appointment-settings'

function loadAppointmentRaw(): Record<string, AppointmentSettings> {
  try {
    const raw = localStorage.getItem(APPOINTMENT_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function persistAppointment(vcardId: number, settings: AppointmentSettings) {
  const all = loadAppointmentRaw()
  all[String(vcardId)] = settings
  try {
    localStorage.setItem(APPOINTMENT_KEY, JSON.stringify(all))
  } catch {
    /* storage unavailable — ignore */
  }
}

export function getAppointmentSettings(vcardId: number): AppointmentSettings {
  return loadAppointmentRaw()[String(vcardId)] ?? buildDefaultAppointmentSettings()
}

export function saveAppointmentSettings(vcardId: number, settings: AppointmentSettings) {
  persistAppointment(vcardId, settings)
}

export function resetAppointmentSettings(vcardId: number) {
  const all = loadAppointmentRaw()
  delete all[String(vcardId)]
  try {
    localStorage.setItem(APPOINTMENT_KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/*  Store — per-vcard editor content persisted to localStorage.        */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'mcom.business.vcard.editor'

function loadRaw(): Record<string, BizSectionState[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function persist(id: number, sections: BizSectionState[]) {
  const all = loadRaw()
  all[String(id)] = sections
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    /* storage unavailable — ignore */
  }
}

export function getVCardEditorContent(vcardId: number): BizSectionState[] {
  const all = loadRaw()
  const saved = all[String(vcardId)]
  if (saved) {
    if (isClaimedVCard(vcardId)) {
      /* Claimed templates render exactly the sections the business saved —
         no merging onto the full default schema. Locked flags stay from the
         admin template definition so editable-vs-managed stays truthful. */
      return saved.map(s => {
        const def = BIZ_SECTIONS.find(d => d.id === s.schemaId)
        return {
          ...s,
          locked: def?.locked ?? true,
          blocksAllowed: !!def?.blocksAllowed,
        }
      })
    }
    /* Merge onto the template so schema changes (e.g. new locked flags) win. */
    const fresh = buildEditorSections(vcardId)
    return fresh.map(tpl => {
      const prev = saved.find(s => s.schemaId === tpl.schemaId)
      if (!prev) return tpl
      return {
        ...tpl,
        values: { ...tpl.values, ...prev.values },
        items: { ...tpl.items, ...prev.items },
        blocks: prev.blocks ?? [],
      }
    })
  }
  return buildEditorSections(vcardId)
}

export function saveVCardEditorContent(vcardId: number, sections: BizSectionState[]) {
  persist(vcardId, sections)
}

export function resetVCardEditorContent(vcardId: number) {
  const all = loadRaw()
  delete all[String(vcardId)]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/*  Centre edit permission — Admin grants the business (via membership) */
/*  permission to edit Share / Exchange / Redeem content. When NOT      */
/*  granted the centres are locked, but their content stays visible so  */
/*  the business can still see what they are sharing / exchanging /     */
/*  redeeming. Persisted per vcard, defaulting to the membership tier.  */
/* ------------------------------------------------------------------ */

export type BusinessCentreId = 'share' | 'exchange' | 'redeem'

const CENTRE_EDIT_KEY = 'mcom.business.vcard.centre-edit'

function loadCentreEditRaw(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(CENTRE_EDIT_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function getCentreEditPermission(vcardId: number, centreId: BusinessCentreId): boolean {
  const raw = loadCentreEditRaw()
  const key = `${vcardId}:${centreId}`
  if (typeof raw[key] === 'boolean') return raw[key]
  /* Default from the business membership — Pro / Pro+ tiers grant editing
     of the three core centres (Gold Pro in the seed data). */
  const tier = mockBusinessProfile.tier
  return tier === 'Pro' || tier === 'Pro+'
}

export function setCentreEditPermission(vcardId: number, centreId: BusinessCentreId, allowed: boolean) {
  const raw = loadCentreEditRaw()
  raw[`${vcardId}:${centreId}`] = allowed
  try {
    localStorage.setItem(CENTRE_EDIT_KEY, JSON.stringify(raw))
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/*  Password protection — per vcard, business-owned.                   */
/*  Sections listed in `sections` require the 6-digit PIN to unlock.   */
/* ------------------------------------------------------------------ */

const PROTECTION_KEY = 'mcom.business.vcard.protection'

function loadProtectionRaw(): Record<string, VCardProtection> {
  try {
    const raw = localStorage.getItem(PROTECTION_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function persistProtection(vcardId: number, protection: VCardProtection) {
  const all = loadProtectionRaw()
  if (protection.enabled && protection.password.length >= 6 && protection.sections.length > 0) {
    all[String(vcardId)] = protection
  } else {
    delete all[String(vcardId)]
  }
  try {
    localStorage.setItem(PROTECTION_KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}

export function getVCardProtection(vcardId: number): VCardProtection {
  return loadProtectionRaw()[String(vcardId)] ?? { enabled: false, password: '', hint: '', sections: [] }
}

export function saveVCardProtection(vcardId: number, protection: VCardProtection) {
  persistProtection(vcardId, protection)
}

export function clearVCardProtection(vcardId: number) {
  persistProtection(vcardId, { enabled: false, password: '', hint: '', sections: [] })
}
