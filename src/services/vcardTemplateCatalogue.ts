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

export const BIZ_VCARD_TEMPLATES: BizVCardTemplate[] = [
  { id: 1, name: 'Corporate Professional', templateId: 'BVT-000001', version: '4.2', description: 'Premium business VCard for professional services and corporate environments with full feature set.', status: 'Published', category: 'Professional', industry: 'Professional Services', country: 'Global', language: 'English', membershipSupport: ['Gold', 'Gold Pro', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], businessesUsing: 842, consumersReached: 28450, qrScans: 45200, shares: 18300, exchanges: 12400, redeems: 5600, dynamicQr: true, qrType: 'Dynamic', international: true, languages: ['English', 'Spanish', 'French', 'German', 'Mandarin'], countries: ['US', 'UK', 'DE', 'FR', 'ES', 'JP'], lastUpdated: '2 hours ago', updatedBy: 'Admin', createdBy: 'Admin', createdDate: '15 Jan 2025', tags: ['premium', 'corporate', 'professional', 'international'], brandId: 'MCOM-BR-001', affiliateId: 'AFF-001', isDefault: true, features: ['Appointments', 'Analytics', 'Multi-language'], owner: 'Platform', templateOwner: 'Platform', usage: 128400, weeklyUsage: 3400, thumbnail: 'Corporate' },
  { id: 2, name: 'Modern CafÃ© Connect', templateId: 'BVT-000002', version: '3.1', description: 'Designed for cafÃ©s, restaurants and food businesses â€” menu display, online ordering, and loyalty.', status: 'Published', category: 'Restaurant', industry: 'Food & Beverage', country: 'Global', language: 'English', membershipSupport: ['Silver', 'Silver Pro', 'Gold', 'Gold Pro', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], businessesUsing: 567, consumersReached: 18900, qrScans: 32100, shares: 12400, exchanges: 8900, redeems: 4300, dynamicQr: true, qrType: 'Dynamic', international: false, languages: ['English'], countries: ['US', 'UK', 'AU'], lastUpdated: '5 hours ago', updatedBy: 'Admin', createdBy: 'Admin', createdDate: '3 Feb 2025', tags: ['cafe', 'restaurant', 'menu', 'loyalty'], brandId: 'MCOM-BR-003', affiliateId: 'AFF-003', isDefault: false, features: ['Online Ordering', 'Menu Display', 'Loyalty Points'], owner: 'Platform', templateOwner: 'Platform', usage: 98200, weeklyUsage: 2100, thumbnail: 'Cafe' },
  { id: 3, name: 'Retail Growth Engine', templateId: 'BVT-000003', version: '3.8', description: 'Full-featured retail template with product catalog, promotions, and QR-based checkout flow.', status: 'Published', category: 'Retail', industry: 'Retail', country: 'Global', language: 'English', membershipSupport: ['Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Gold', 'Gold Pro', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], businessesUsing: 423, consumersReached: 15200, qrScans: 28700, shares: 9800, exchanges: 6700, redeems: 3200, dynamicQr: true, qrType: 'Campaign', international: true, languages: ['English', 'Spanish', 'French'], countries: ['US', 'MX', 'FR', 'ES'], lastUpdated: '1 day ago', updatedBy: 'Template Designer', createdBy: 'Admin', createdDate: '20 Feb 2025', tags: ['retail', 'ecommerce', 'promotions', 'campaign'], brandId: 'MCOM-BR-004', affiliateId: 'AFF-005', isDefault: false, features: ['Product Catalog', 'Promotions', 'Campaign QR'], owner: 'Platform', templateOwner: 'Platform', usage: 87500, weeklyUsage: 1800, thumbnail: 'Retail' },
  { id: 4, name: 'Healthcare Provider', templateId: 'BVT-000004', version: '2.4', description: 'HIPAA-compliant template for medical professionals with appointment booking and telehealth links.', status: 'Published', category: 'Medical', industry: 'Healthcare', country: 'US', language: 'English', membershipSupport: ['Gold', 'Gold Pro', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], businessesUsing: 312, consumersReached: 9800, qrScans: 15400, shares: 5600, exchanges: 3400, redeems: 1200, dynamicQr: true, qrType: 'Static', international: false, languages: ['English'], countries: ['US'], lastUpdated: '2 days ago', updatedBy: 'Admin', createdBy: 'Admin', createdDate: '10 Mar 2025', tags: ['healthcare', 'medical', 'hipaa', 'appointments'], brandId: 'MCOM-BR-006', affiliateId: 'AFF-007', isDefault: false, features: ['Appointments', 'Telehealth', 'Secure'], owner: 'Platform', templateOwner: 'Platform', usage: 65400, weeklyUsage: 1400, thumbnail: 'Healthcare' },
  { id: 5, name: 'Elite Salon Suite', templateId: 'BVT-000005', version: '2.1', description: 'Beauty and wellness template with service menu, booking, and loyalty rewards integration.', status: 'Published', category: 'Salon', industry: 'Beauty & Wellness', country: 'Global', language: 'English', membershipSupport: ['Bronze', 'Bronze Pro', 'Silver', 'Silver Pro', 'Gold', 'Gold Pro', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], businessesUsing: 456, consumersReached: 13400, qrScans: 22100, shares: 8900, exchanges: 5400, redeems: 2800, dynamicQr: true, qrType: 'Dynamic', international: false, languages: ['English'], countries: ['US', 'UK', 'CA', 'AU'], lastUpdated: '3 days ago', updatedBy: 'Content Manager', createdBy: 'Admin', createdDate: '5 Apr 2025', tags: ['salon', 'beauty', 'wellness', 'booking'], brandId: 'MCOM-BR-007', affiliateId: 'AFF-008', isDefault: false, features: ['Service Menu', 'Booking', 'Loyalty'], owner: 'Platform', templateOwner: 'Platform', usage: 78900, weeklyUsage: 1900, thumbnail: 'Salon' },
  { id: 6, name: 'Real Estate Pro', templateId: 'BVT-000006', version: '5.0', description: 'Comprehensive real estate template with property listings, virtual tours, and agent contact features.', status: 'Published', category: 'Estate Agent', industry: 'Real Estate', country: 'Global', language: 'English', membershipSupport: ['Silver Pro', 'Gold', 'Gold Pro', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], businessesUsing: 678, consumersReached: 22100, qrScans: 38900, shares: 15600, exchanges: 10200, redeems: 4800, dynamicQr: true, qrType: 'Dynamic', international: true, languages: ['English', 'Spanish', 'French', 'Portuguese'], countries: ['US', 'UK', 'ES', 'PT', 'BR', 'MX'], lastUpdated: '4 days ago', updatedBy: 'Admin', createdBy: 'Admin', createdDate: '1 Jan 2025', tags: ['realestate', 'property', 'virtualtour', 'premium'], brandId: 'MCOM-BR-002', affiliateId: 'AFF-002', isDefault: false, features: ['Property Listings', 'Virtual Tours', 'Mortgage Calc'], owner: 'Platform', templateOwner: 'Platform', usage: 112000, weeklyUsage: 2800, thumbnail: 'RealEstate' },
  { id: 7, name: 'Fitness & Wellness Pro', templateId: 'BVT-000007', version: '3.5', description: 'Gym and fitness studio template with class schedules, trainer profiles, and membership management.', status: 'Published', category: 'Coach', industry: 'Fitness', country: 'Global', language: 'English', membershipSupport: ['Bronze', 'Bronze Pro', 'Silver', 'Silver Pro', 'Gold', 'Gold Pro', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], businessesUsing: 534, consumersReached: 17800, qrScans: 29500, shares: 11200, exchanges: 7800, redeems: 3500, dynamicQr: true, qrType: 'Dynamic', international: true, languages: ['English', 'Spanish', 'German'], countries: ['US', 'UK', 'DE', 'ES'], lastUpdated: '5 days ago', updatedBy: 'Template Designer', createdBy: 'Admin', createdDate: '12 Feb 2025', tags: ['fitness', 'gym', 'wellness', 'classes'], brandId: 'MCOM-BR-008', affiliateId: 'AFF-009', isDefault: false, features: ['Class Schedule', 'Trainer Profiles', 'Membership'], owner: 'Platform', templateOwner: 'Platform', usage: 92300, weeklyUsage: 2200, thumbnail: 'Fitness' },
  { id: 8, name: 'Luxury Hotel Collection', templateId: 'BVT-000008', version: '2.8', description: 'Hotel and hospitality template with room gallery, booking engine, concierge, and local guide.', status: 'Draft', category: 'Hotel', industry: 'Hospitality', country: 'Global', language: 'English', membershipSupport: ['Gold', 'Gold Pro', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], businessesUsing: 0, consumersReached: 0, qrScans: 0, shares: 0, exchanges: 0, redeems: 0, dynamicQr: false, qrType: 'Static', international: true, languages: ['English', 'French', 'German', 'Italian', 'Japanese'], countries: ['Global'], lastUpdated: '1 week ago', updatedBy: 'Admin', createdBy: 'Admin', createdDate: '20 Jun 2025', tags: ['hotel', 'luxury', 'hospitality', 'booking'], brandId: 'MCOM-BR-010', affiliateId: 'AFF-012', isDefault: false, features: ['Room Gallery', 'Booking', 'Concierge'], owner: 'Platform', templateOwner: 'Platform', usage: 0, weeklyUsage: 0, thumbnail: 'Hotel' },
  { id: 9, name: 'Restaurant Digital Menu', templateId: 'BVT-000009', version: '1.6', description: 'Digital menu and ordering template for restaurants with QR table service and review collection.', status: 'Draft', category: 'Restaurant', industry: 'Food & Beverage', country: 'Global', language: 'English', membershipSupport: ['Bronze', 'Bronze Pro', 'Silver', 'Silver Pro', 'Gold', 'Gold Pro'], businessesUsing: 0, consumersReached: 0, qrScans: 0, shares: 0, exchanges: 0, redeems: 0, dynamicQr: true, qrType: 'Campaign', international: false, languages: ['English'], countries: ['US'], lastUpdated: '1 week ago', updatedBy: 'Content Manager', createdBy: 'Content Manager', createdDate: '15 Jul 2025', tags: ['restaurant', 'menu', 'digital', 'ordering'], brandId: 'MCOM-BR-012', affiliateId: 'AFF-015', isDefault: false, features: ['Digital Menu', 'Online Ordering', 'Reviews'], owner: 'Content Manager', templateOwner: 'Content Manager', usage: 0, weeklyUsage: 0, thumbnail: 'Restaurant' },
  { id: 10, name: 'Coach & Consultant Pro', templateId: 'BVT-000010', version: '2.0', description: 'Coaching and consulting template with session booking, client portal, and resource library.', status: 'Draft', category: 'Coach', industry: 'Coaching', country: 'Global', language: 'English', membershipSupport: ['Silver', 'Silver Pro', 'Gold', 'Gold Pro', 'Platinum', 'Platinum Pro'], businessesUsing: 0, consumersReached: 0, qrScans: 0, shares: 0, exchanges: 0, redeems: 0, dynamicQr: false, qrType: 'Static', international: false, languages: ['English'], countries: ['US', 'UK', 'CA'], lastUpdated: '1 week ago', updatedBy: 'Template Designer', createdBy: 'Template Designer', createdDate: '1 Aug 2025', tags: ['coach', 'consultant', 'booking', 'portal'], brandId: 'MCOM-BR-014', affiliateId: 'AFF-018', isDefault: false, features: ['Session Booking', 'Client Portal', 'Resources'], owner: 'Template Designer', templateOwner: 'Template Designer', usage: 0, weeklyUsage: 0, thumbnail: 'Coach' },
  { id: 11, name: 'Charity & Nonprofit', templateId: 'BVT-000011', version: '1.2', description: 'Nonprofit template with donation integration, impact stories, volunteer signup, and event calendar.', status: 'Draft', category: 'Charity', industry: 'Nonprofit', country: 'Global', language: 'English', membershipSupport: ['Bronze', 'Bronze Pro', 'Silver', 'Silver Pro', 'Gold', 'Gold Pro'], businessesUsing: 0, consumersReached: 0, qrScans: 0, shares: 0, exchanges: 0, redeems: 0, dynamicQr: false, qrType: 'Static', international: false, languages: ['English'], countries: ['US', 'UK'], lastUpdated: '2 weeks ago', updatedBy: 'Admin', createdBy: 'Admin', createdDate: '10 Aug 2025', tags: ['charity', 'nonprofit', 'donation', 'volunteer'], brandId: 'MCOM-BR-015', affiliateId: 'AFF-020', isDefault: false, features: ['Donations', 'Events', 'Volunteer'], owner: 'Platform', templateOwner: 'Platform', usage: 0, weeklyUsage: 0, thumbnail: 'Charity' },
  { id: 12, name: 'Professional Services Hub', templateId: 'BVT-000012', version: '3.0', description: 'Legal, accounting, and consulting template with secure document sharing and appointment scheduling.', status: 'Published', category: 'Professional', industry: 'Professional Services', country: 'Global', language: 'English', membershipSupport: ['Gold', 'Gold Pro', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], businessesUsing: 267, consumersReached: 8900, qrScans: 14300, shares: 5200, exchanges: 3100, redeems: 900, dynamicQr: true, qrType: 'Dynamic', international: true, languages: ['English', 'Spanish', 'French'], countries: ['US', 'UK', 'ES', 'FR'], lastUpdated: '2 weeks ago', updatedBy: 'Admin', createdBy: 'Admin', createdDate: '1 Apr 2025', tags: ['legal', 'accounting', 'professional', 'secure'], brandId: 'MCOM-BR-009', affiliateId: 'AFF-011', isDefault: false, features: ['Document Sharing', 'Appointments', 'Secure'], owner: 'Platform', templateOwner: 'Platform', usage: 54300, weeklyUsage: 1100, thumbnail: 'Professional' },
  { id: 13, name: 'Retail Pop-up Seasonal', templateId: 'BVT-000013', version: '1.0', description: 'Seasonal retail template for pop-up stores and limited-time campaigns with countdown timers.', status: 'Review', category: 'Retail', industry: 'Retail', country: 'Global', language: 'English', membershipSupport: ['Bronze', 'Bronze Pro', 'Silver', 'Silver Pro', 'Gold', 'Gold Pro'], businessesUsing: 0, consumersReached: 0, qrScans: 0, shares: 0, exchanges: 0, redeems: 0, dynamicQr: true, qrType: 'Seasonal', international: false, languages: ['English'], countries: ['US'], lastUpdated: '3 days ago', updatedBy: 'Template Designer', createdBy: 'Template Designer', createdDate: '20 Aug 2025', tags: ['retail', 'seasonal', 'popup', 'campaign'], brandId: 'MCOM-BR-016', affiliateId: 'AFF-022', isDefault: false, features: ['Countdown Timer', 'Campaign QR', 'Analytics'], owner: 'Template Designer', templateOwner: 'Template Designer', usage: 0, weeklyUsage: 0, thumbnail: 'Seasonal' },
  { id: 14, name: 'Medical Specialist Connect', templateId: 'BVT-000014', version: '2.0', description: 'Specialist medical template with referral system, patient portal, and insurance verification.', status: 'Review', category: 'Medical', industry: 'Healthcare', country: 'US', language: 'English', membershipSupport: ['Gold', 'Gold Pro', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], businessesUsing: 0, consumersReached: 0, qrScans: 0, shares: 0, exchanges: 0, redeems: 0, dynamicQr: false, qrType: 'Static', international: false, languages: ['English'], countries: ['US'], lastUpdated: '4 days ago', updatedBy: 'Admin', createdBy: 'Admin', createdDate: '25 Aug 2025', tags: ['medical', 'specialist', 'referral', 'portal'], brandId: 'MCOM-BR-017', affiliateId: 'AFF-023', isDefault: false, features: ['Referral System', 'Patient Portal', 'Insurance'], owner: 'Platform', templateOwner: 'Platform', usage: 0, weeklyUsage: 0, thumbnail: 'Medical' },
  { id: 15, name: 'Real Estate Luxury', templateId: 'BVT-000015', version: '1.8', description: 'High-end real estate template for luxury properties with private viewing requests and market reports.', status: 'Published', category: 'Estate Agent', industry: 'Real Estate', country: 'Global', language: 'English', membershipSupport: ['Gold Pro', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], businessesUsing: 198, consumersReached: 6200, qrScans: 10200, shares: 4100, exchanges: 2300, redeems: 600, dynamicQr: true, qrType: 'Dynamic', international: true, languages: ['English', 'French', 'Arabic', 'Mandarin'], countries: ['Global'], lastUpdated: '2 weeks ago', updatedBy: 'Admin', createdBy: 'Admin', createdDate: '15 May 2025', tags: ['realestate', 'luxury', 'premium', 'exclusive'], brandId: 'MCOM-BR-011', affiliateId: 'AFF-013', isDefault: false, features: ['Private Showings', 'Market Reports', 'Multi-language'], owner: 'Platform', templateOwner: 'Platform', usage: 38900, weeklyUsage: 900, thumbnail: 'LuxuryRealEstate' },
  { id: 16, name: 'Salon Express', templateId: 'BVT-000016', version: '1.5', description: 'Lightweight salon template for quick service bookings and walk-in management.', status: 'Archived', category: 'Salon', industry: 'Beauty & Wellness', country: 'Global', language: 'English', membershipSupport: ['Bronze', 'Bronze Pro', 'Silver', 'Silver Pro'], businessesUsing: 45, consumersReached: 1200, qrScans: 2100, shares: 800, exchanges: 400, redeems: 150, dynamicQr: false, qrType: 'Static', international: false, languages: ['English'], countries: ['US'], lastUpdated: '1 month ago', updatedBy: 'Admin', createdBy: 'Admin', createdDate: '1 Jun 2025', tags: ['salon', 'lightweight', 'booking'], brandId: 'MCOM-BR-018', affiliateId: 'AFF-025', isDefault: false, features: ['Quick Booking', 'Walk-in'], owner: 'Platform', templateOwner: 'Platform', usage: 8700, weeklyUsage: 200, thumbnail: 'SalonExpress' },
  { id: 17, name: 'Fitness Basic', templateId: 'BVT-000017', version: '1.0', description: 'Entry-level fitness template for small gyms and personal trainers.', status: 'Archived', category: 'Coach', industry: 'Fitness', country: 'Global', language: 'English', membershipSupport: ['Bronze', 'Bronze Pro'], businessesUsing: 23, consumersReached: 600, qrScans: 900, shares: 300, exchanges: 150, redeems: 50, dynamicQr: false, qrType: 'Static', international: false, languages: ['English'], countries: ['US'], lastUpdated: '2 months ago', updatedBy: 'Admin', createdBy: 'Admin', createdDate: '1 Mar 2025', tags: ['fitness', 'basic', 'entry'], brandId: 'MCOM-BR-019', affiliateId: 'AFF-026', isDefault: false, features: ['Basic Profile'], owner: 'Platform', templateOwner: 'Platform', usage: 3400, weeklyUsage: 80, thumbnail: 'FitnessBasic' },
  { id: 18, name: 'Hotel Express', templateId: 'BVT-000018', version: '1.2', description: 'Streamlined hotel template for quick booking and information.', status: 'Archived', category: 'Hotel', industry: 'Hospitality', country: 'Global', language: 'English', membershipSupport: ['Bronze', 'Bronze Pro', 'Silver', 'Silver Pro'], businessesUsing: 34, consumersReached: 800, qrScans: 1400, shares: 500, exchanges: 200, redeems: 80, dynamicQr: false, qrType: 'Static', international: false, languages: ['English'], countries: ['US', 'UK'], lastUpdated: '1 month ago', updatedBy: 'Admin', createdBy: 'Admin', createdDate: '15 Apr 2025', tags: ['hotel', 'express', 'lightweight'], brandId: 'MCOM-BR-020', affiliateId: 'AFF-027', isDefault: false, features: ['Quick Booking'], owner: 'Platform', templateOwner: 'Platform', usage: 5600, weeklyUsage: 120, thumbnail: 'HotelExpress' },
  { id: 19, name: 'Charity Fundraising', templateId: 'BVT-000019', version: '0.9', description: 'Fundraising-focused template with donation goals, progress bars, and campaign stories.', status: 'Draft', category: 'Charity', industry: 'Nonprofit', country: 'Global', language: 'English', membershipSupport: ['Bronze', 'Bronze Pro', 'Silver', 'Silver Pro', 'Gold', 'Gold Pro'], businessesUsing: 0, consumersReached: 0, qrScans: 0, shares: 0, exchanges: 0, redeems: 0, dynamicQr: false, qrType: 'Static', international: false, languages: ['English'], countries: ['US'], lastUpdated: '3 weeks ago', updatedBy: 'Content Manager', createdBy: 'Content Manager', createdDate: '1 Sep 2025', tags: ['charity', 'fundraising', 'campaign'], brandId: 'MCOM-BR-021', affiliateId: 'AFF-028', isDefault: false, features: ['Donation Goals', 'Progress Bars'], owner: 'Content Manager', templateOwner: 'Content Manager', usage: 0, weeklyUsage: 0, thumbnail: 'Fundraising' },
  { id: 20, name: 'E-Commerce Storefront', templateId: 'BVT-000020', version: '2.3', description: 'Full e-commerce template with product showcases, cart, checkout, and order tracking.', status: 'Published', category: 'Retail', industry: 'Retail', country: 'Global', language: 'English', membershipSupport: ['Gold', 'Gold Pro', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], businessesUsing: 345, consumersReached: 11200, qrScans: 19800, shares: 7600, exchanges: 4500, redeems: 2100, dynamicQr: true, qrType: 'Dynamic', international: true, languages: ['English', 'Spanish', 'German', 'French'], countries: ['US', 'UK', 'DE', 'FR', 'ES'], lastUpdated: '1 week ago', updatedBy: 'Admin', createdBy: 'Admin', createdDate: '15 Mar 2025', tags: ['ecommerce', 'storefront', 'cart', 'checkout'], brandId: 'MCOM-BR-013', affiliateId: 'AFF-016', isDefault: false, features: ['Product Showcase', 'Cart', 'Checkout', 'Orders'], owner: 'Platform', templateOwner: 'Platform', usage: 71200, weeklyUsage: 1600, thumbnail: 'Ecommerce' },
]

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
const MOCK_SEASONS: Record<number, string> = {
  1: 'All-Season', 2: 'All-Season', 3: 'Summer Season 2026', 4: 'All-Season',
  5: 'Holiday Season 2026', 6: 'All-Season', 7: 'Summer Season 2026',
  8: 'All-Season', 9: 'All-Season', 10: 'All-Season', 11: 'Holiday Season 2026',
  12: 'All-Season', 13: 'Summer Season 2026', 14: 'All-Season', 15: 'Winter Collection',
  16: 'All-Season', 17: 'All-Season', 18: 'All-Season', 19: 'Holiday Season 2026',
  20: 'Summer Season 2026',
}

export function templateSeason(t: BizVCardTemplate): string {
  return t.season ?? MOCK_SEASONS[t.id] ?? 'All-Season'
}

/* A template can be suitable for MULTIPLE sectors (Henry: never lock a
   template to one profession). Each entry lists the sectors a template
   serves so the business sees every industry it applies to. */
const MOCK_SECTORS: Record<number, string[]> = {
  1: ['Professional Services', 'Finance & Legal', 'Corporate'],
  2: ['Restaurant & Café', 'Food & Beverage', 'Hospitality'],
  3: ['Retail', 'E-Commerce', 'Consumer Goods'],
  4: ['Healthcare', 'Medical', 'Dental'],
  5: ['Beauty & Wellness', 'Salon & Spa', 'Personal Care'],
  6: ['Real Estate', 'Property', 'Construction'],
  7: ['Fitness', 'Health & Wellness', 'Coaching'],
  8: ['Hotel & Hospitality', 'Travel', 'Events'],
  9: ['Restaurant & Café', 'Food & Beverage', 'Hospitality'],
  10: ['Coaching', 'Consulting', 'Professional Services'],
  11: ['Nonprofit', 'Charity', 'Community'],
  12: ['Professional Services', 'Finance & Legal', 'Consulting'],
  13: ['Retail', 'E-Commerce', 'Events'],
  14: ['Healthcare', 'Medical', 'Specialist'],
  15: ['Real Estate', 'Property', 'Luxury'],
  16: ['Salon & Spa', 'Beauty & Wellness', 'Personal Care'],
  17: ['Fitness', 'Health & Wellness'],
  18: ['Hotel & Hospitality', 'Travel'],
  19: ['Nonprofit', 'Charity', 'Fundraising'],
  20: ['Retail', 'E-Commerce', 'Consumer Goods'],
}

export function templateSectors(t: BizVCardTemplate): string[] {
  if (t.sectors?.length) return t.sectors
  const m = MOCK_SECTORS[t.id]
  return m?.length ? m : [t.industry]
}

/* Customization level — how much the business can adapt an Admin template
   before publishing (set by Admin in the template builder). */
const MOCK_CUSTOMIZATION: Record<number, string> = {
  1: 'Full', 2: 'Standard', 3: 'Full', 4: 'Limited', 5: 'Standard',
  6: 'Full', 7: 'Standard', 8: 'Limited', 9: 'Limited', 10: 'Full',
  11: 'Standard', 12: 'Limited', 13: 'Standard', 14: 'Limited', 15: 'Full',
  16: 'Standard', 17: 'Limited', 18: 'Limited', 19: 'Standard', 20: 'Full',
}

export function templateCustomization(t: BizVCardTemplate): string {
  return t.customization ?? MOCK_CUSTOMIZATION[t.id] ?? 'Standard'
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

export const CON_VCARD_TEMPLATES: ConTemplate[] = [
  { id: 1, name: 'Standard Consumer VCard', status: 'Published', usage: 892, consumers: 10, modified: '1 day ago', levels: 'All', templateId: 'CVT-000001', version: '1.4', description: 'Entry-level consumer VCard covering membership info, wallet, and sharing.', category: 'Lifestyle', language: 'English', membershipSupport: ['Bronze', 'Silver', 'Gold'], membersReached: 28450, qrScans: 45200, shares: 18300, exchanges: 12400, redeems: 5600, weeklyUsage: 3400, createdBy: 'Admin', createdDate: '10 Jan 2025', updatedBy: 'Admin', features: ['Membership Info', 'Wallet', 'Share'], dynamicQr: true, qrType: 'Dynamic', international: true },
  { id: 2, name: 'Gold Tier Consumer VCard', status: 'Published', usage: 456, consumers: 6, modified: '2 days ago', levels: 'Gold+', templateId: 'CVT-000002', version: '2.1', description: 'Gold-tier consumer card with rewards, friends & family, and premium exchange.', category: 'Rewards', language: 'English', membershipSupport: ['Gold', 'Gold Pro', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], membersReached: 18900, qrScans: 32100, shares: 12400, exchanges: 8900, redeems: 4300, weeklyUsage: 2100, createdBy: 'Admin', createdDate: '3 Feb 2025', updatedBy: 'Admin', features: ['Rewards', 'Friends & Family', 'Exchange'], dynamicQr: true, qrType: 'Dynamic', international: true },
  { id: 3, name: 'Platinum Pro Experience', status: 'Published', usage: 234, consumers: 4, modified: '3 days ago', levels: 'Platinum+', templateId: 'CVT-000003', version: '3.0', description: 'Top-tier consumer experience with exclusive perks, local campaigns, and community updates.', category: 'Premium', language: 'English', membershipSupport: ['Platinum', 'Platinum Pro', 'Platinum Pro+'], membersReached: 15200, qrScans: 28700, shares: 9800, exchanges: 6700, redeems: 3200, weeklyUsage: 1800, createdBy: 'Admin', createdDate: '20 Feb 2025', updatedBy: 'Template Designer', features: ['Local Campaigns', 'Community Updates', 'Dynamic QR'], dynamicQr: true, qrType: 'Campaign', international: true },
  { id: 4, name: 'Silver Rewards VCard', status: 'Draft', usage: 0, consumers: 0, modified: '5 days ago', levels: 'Silver+', templateId: 'CVT-000004', version: '1.0', description: 'Silver-tier consumer card focused on rewards and referrals.', category: 'Rewards', language: 'English', membershipSupport: ['Silver', 'Silver Pro', 'Gold'], membersReached: 0, qrScans: 0, shares: 0, exchanges: 0, redeems: 0, weeklyUsage: 0, createdBy: 'Admin', createdDate: '15 Jul 2025', updatedBy: 'Admin', features: ['Rewards', 'Referrals'], dynamicQr: false, qrType: 'Static', international: false },
  { id: 5, name: 'Bronze Starter VCard', status: 'Published', usage: 678, consumers: 8, modified: '1 week ago', levels: 'Bronze+', templateId: 'CVT-000005', version: '1.2', description: 'Simple starter consumer VCard with membership info and basic sharing.', category: 'Lifestyle', language: 'English', membershipSupport: ['Bronze', 'Bronze Pro'], membersReached: 9800, qrScans: 15400, shares: 5600, exchanges: 3400, redeems: 1200, weeklyUsage: 1400, createdBy: 'Admin', createdDate: '10 Mar 2025', updatedBy: 'Content Manager', features: ['Membership Info', 'Share'], dynamicQr: false, qrType: 'Static', international: false },
  { id: 6, name: 'Premium Lifestyle VCard', status: 'Published', usage: 345, consumers: 5, modified: '1 week ago', levels: 'Gold+', templateId: 'CVT-000006', version: '2.4', description: 'Lifestyle-focused consumer card with wallet, bookings, and wishlist.', category: 'Lifestyle', language: 'English', membershipSupport: ['Gold', 'Gold Pro', 'Platinum', 'Platinum Pro'], membersReached: 22100, qrScans: 38900, shares: 15600, exchanges: 10200, redeems: 4800, weeklyUsage: 2800, createdBy: 'Admin', createdDate: '1 Jan 2025', updatedBy: 'Admin', features: ['Wallet', 'Bookings', 'Wishlist'], dynamicQr: true, qrType: 'Dynamic', international: true },
  { id: 7, name: 'Family Connect VCard', status: 'Draft', usage: 0, consumers: 0, modified: '2 weeks ago', levels: 'All', templateId: 'CVT-000007', version: '1.0', description: 'Consumer VCard built around friends & family and community updates.', category: 'Lifestyle', language: 'English', membershipSupport: ['Bronze', 'Silver', 'Gold'], membersReached: 0, qrScans: 0, shares: 0, exchanges: 0, redeems: 0, weeklyUsage: 0, createdBy: 'Template Designer', createdDate: '1 Aug 2025', updatedBy: 'Template Designer', features: ['Friends & Family', 'Community Updates'], dynamicQr: false, qrType: 'Static', international: false },
  { id: 8, name: 'Student Essentials VCard', status: 'Published', usage: 567, consumers: 7, modified: '2 weeks ago', levels: 'Bronze+', templateId: 'CVT-000008', version: '1.6', description: 'Budget-friendly consumer card for students with rewards and referrals.', category: 'Lifestyle', language: 'English', membershipSupport: ['Bronze', 'Bronze Pro', 'Silver'], membersReached: 13400, qrScans: 22100, shares: 8900, exchanges: 5400, redeems: 2800, weeklyUsage: 1900, createdBy: 'Admin', createdDate: '5 Apr 2025', updatedBy: 'Admin', features: ['Rewards', 'Referrals', 'Wallet'], dynamicQr: true, qrType: 'Dynamic', international: false },
  { id: 9, name: 'Executive Pro VCard', status: 'Published', usage: 189, consumers: 3, modified: '3 weeks ago', levels: 'Platinum+', templateId: 'CVT-000009', version: '2.0', description: 'Executive-grade consumer card with premium rewards and secure sections.', category: 'Premium', language: 'English', membershipSupport: ['Platinum', 'Platinum Pro', 'Platinum Pro+'], membersReached: 6200, qrScans: 10200, shares: 4100, exchanges: 2300, redeems: 600, weeklyUsage: 900, createdBy: 'Admin', createdDate: '15 May 2025', updatedBy: 'Admin', features: ['Rewards', 'Password Sections', 'Exchange'], dynamicQr: true, qrType: 'Dynamic', international: true },
  { id: 10, name: 'Legacy Consumer VCard', status: 'Archived', usage: 98, consumers: 1, modified: '1 month ago', levels: 'All', templateId: 'CVT-000010', version: '0.8', description: 'Legacy consumer VCard kept for historical records.', category: 'Lifestyle', language: 'English', membershipSupport: ['Bronze'], membersReached: 1200, qrScans: 2100, shares: 800, exchanges: 400, redeems: 150, weeklyUsage: 200, createdBy: 'Admin', createdDate: '1 Jun 2024', updatedBy: 'Admin', features: ['Membership Info'], dynamicQr: false, qrType: 'Static', international: false },
]

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
