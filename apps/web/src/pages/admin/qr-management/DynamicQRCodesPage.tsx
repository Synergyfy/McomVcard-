import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface QRCodeData {
  id: number; qrId: string; name: string; type: string; owner: string; ownerType: string; destination: string; routingStatus: string; scanCount: number; status: string; created: string; lastUpdated: string; totalScans: number; todayScans: number; uniqueVisitors: number; lastScan: string; ownerId: string; linkedModule: string; foregroundColor: string; backgroundColor: string; logo: string; frame: string; ctaText: string; errorCorrection: string; quietZone: string; formatPreview: string; expiryDate: string; scanLimit: string; security: string; routingMode: string; campaignId: string; nfcLinked: boolean;
}

const QRS: QRCodeData[] = [
  { id: 1, qrId: 'QR-BV-0001', name: 'ABC Restaurant VCard', type: 'Business VCard', owner: 'ABC Restaurant Ltd', ownerType: 'Business', destination: 'Business VCard — ABC Restaurant', routingStatus: 'Configured', scanCount: 9831, status: 'Published', created: '2026-01-15', lastUpdated: '2026-07-28', totalScans: 9831, todayScans: 312, uniqueVisitors: 4520, lastScan: '2026-07-30 09:12', ownerId: 'BUS-00215', linkedModule: 'Business VCards', foregroundColor: '#000000', backgroundColor: '#FFFFFF', logo: 'ABC Logo', frame: 'Rounded', ctaText: 'View Menu & Offers', errorCorrection: 'M', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '', scanLimit: '', security: 'Active', routingMode: 'Static Dynamic Route', campaignId: '', nfcLinked: true },
  { id: 2, qrId: 'QR-BV-0002', name: 'Café Mocha VCard', type: 'Business VCard', owner: 'Café Mocha', ownerType: 'Business', destination: 'Business VCard — Café Mocha', routingStatus: 'Configured', scanCount: 8452, status: 'Published', created: '2026-02-20', lastUpdated: '2026-07-29', totalScans: 8452, todayScans: 284, uniqueVisitors: 3890, lastScan: '2026-07-30 09:05', ownerId: 'BUS-00341', linkedModule: 'Business VCards', foregroundColor: '#6B3A2A', backgroundColor: '#FFF8F0', logo: 'Café Mocha', frame: 'Rounded', ctaText: 'Order Online', errorCorrection: 'H', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '', scanLimit: '', security: 'Active', routingMode: 'Campaign Route', campaignId: 'CAMP-001', nfcLinked: false },
  { id: 3, qrId: 'QR-BC-0001', name: 'TechCorp Business Card', type: 'Business Card', owner: 'TechCorp Inc', ownerType: 'Business', destination: 'Business Card — TechCorp', routingStatus: 'Configured', scanCount: 5432, status: 'Published', created: '2026-03-10', lastUpdated: '2026-07-27', totalScans: 5432, todayScans: 167, uniqueVisitors: 2340, lastScan: '2026-07-30 08:45', ownerId: 'BUS-00102', linkedModule: 'Business Cards', foregroundColor: '#1E3A5F', backgroundColor: '#FFFFFF', logo: 'TechCorp', frame: 'Square', ctaText: 'Contact Sales', errorCorrection: 'M', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '', scanLimit: '', security: 'Active', routingMode: 'Static Dynamic Route', campaignId: '', nfcLinked: true },
  { id: 4, qrId: 'QR-CV-0001', name: 'Sarah K. VCard', type: 'Consumer VCard', owner: 'Sarah K.', ownerType: 'Consumer', destination: 'Consumer VCard — Sarah K.', routingStatus: 'Configured', scanCount: 6750, status: 'Published', created: '2026-04-05', lastUpdated: '2026-07-28', totalScans: 6750, todayScans: 198, uniqueVisitors: 3100, lastScan: '2026-07-30 09:01', ownerId: 'CON-01234', linkedModule: 'Consumer VCards', foregroundColor: '#7C3AED', backgroundColor: '#FFFFFF', logo: '', frame: 'Rounded', ctaText: 'Connect with Me', errorCorrection: 'M', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '', scanLimit: '', security: 'Active', routingMode: 'Static Dynamic Route', campaignId: '', nfcLinked: false },
  { id: 5, qrId: 'QR-CC-0001', name: 'James W. Consumer Card', type: 'Consumer Card', owner: 'James W.', ownerType: 'Consumer', destination: 'Consumer Card — James W.', routingStatus: 'Configured', scanCount: 3450, status: 'Published', created: '2026-04-12', lastUpdated: '2026-07-25', totalScans: 3450, todayScans: 98, uniqueVisitors: 1560, lastScan: '2026-07-30 07:30', ownerId: 'CON-01892', linkedModule: 'Consumer Cards', foregroundColor: '#059669', backgroundColor: '#FFFFFF', logo: '', frame: 'Rounded', ctaText: 'My Card', errorCorrection: 'M', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '', scanLimit: '', security: 'Active', routingMode: 'Static Dynamic Route', campaignId: '', nfcLinked: false },
  { id: 6, qrId: 'QR-CAMP-001', name: 'Summer Campaign 2026', type: 'Campaign', owner: 'Marketing Team', ownerType: 'Campaign', destination: 'Campaign Landing — Summer Sale', routingStatus: 'Configured', scanCount: 12400, status: 'Published', created: '2026-06-01', lastUpdated: '2026-07-29', totalScans: 12400, todayScans: 421, uniqueVisitors: 5670, lastScan: '2026-07-30 09:15', ownerId: 'CAMP-001', linkedModule: 'Campaigns', foregroundColor: '#DC2626', backgroundColor: '#FFF5F5', logo: 'Summer Logo', frame: 'Rounded', ctaText: 'Get 20% Off', errorCorrection: 'H', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '2026-09-01', scanLimit: '50000', security: 'Active', routingMode: 'Campaign Route', campaignId: 'CAMP-001', nfcLinked: false },
  { id: 7, qrId: 'QR-PROD-001', name: 'Premium Coffee Product', type: 'Product', owner: 'Café Mocha', ownerType: 'Product', destination: 'Product Page — Premium Coffee', routingStatus: 'Configured', scanCount: 2340, status: 'Published', created: '2026-05-15', lastUpdated: '2026-07-20', totalScans: 2340, todayScans: 56, uniqueVisitors: 1120, lastScan: '2026-07-29 16:20', ownerId: 'PROD-0042', linkedModule: 'Products', foregroundColor: '#92400E', backgroundColor: '#FFFBEB', logo: 'Café Mocha', frame: 'Rounded', ctaText: 'Buy Now', errorCorrection: 'M', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '', scanLimit: '', security: 'Active', routingMode: 'Static Dynamic Route', campaignId: '', nfcLinked: false },
  { id: 8, qrId: 'QR-SVC-001', name: 'Spa Booking Service', type: 'Service', owner: 'GreenLeaf Spa', ownerType: 'Service', destination: 'Booking Page — GreenLeaf Spa', routingStatus: 'Configured', scanCount: 1890, status: 'Published', created: '2026-05-20', lastUpdated: '2026-07-22', totalScans: 1890, todayScans: 42, uniqueVisitors: 890, lastScan: '2026-07-30 06:45', ownerId: 'SVC-0018', linkedModule: 'Services', foregroundColor: '#047857', backgroundColor: '#F0FDF4', logo: 'GreenLeaf', frame: 'Rounded', ctaText: 'Book Now', errorCorrection: 'M', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '', scanLimit: '', security: 'Active', routingMode: 'Static Dynamic Route', campaignId: '', nfcLinked: false },
  { id: 9, qrId: 'QR-EVENT-001', name: 'Music Festival 2026', type: 'Event', owner: 'Events Team', ownerType: 'Event', destination: 'Event Page — Music Festival', routingStatus: 'Configured', scanCount: 2980, status: 'Published', created: '2026-06-10', lastUpdated: '2026-07-26', totalScans: 2980, todayScans: 87, uniqueVisitors: 1450, lastScan: '2026-07-30 08:00', ownerId: 'EVENT-003', linkedModule: 'Events', foregroundColor: '#7C3AED', backgroundColor: '#F5F3FF', logo: 'Festival', frame: 'Rounded', ctaText: 'Get Tickets', errorCorrection: 'H', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '2026-08-15', scanLimit: '10000', security: 'Active', routingMode: 'Scheduled Route', campaignId: '', nfcLinked: false },
  { id: 10, qrId: 'QR-PROMO-001', name: 'Spring Promotion', type: 'Promotion', owner: 'Marketing Team', ownerType: 'Campaign', destination: 'Promotion — 15% Discount', routingStatus: 'Configured', scanCount: 4890, status: 'Published', created: '2026-03-01', lastUpdated: '2026-07-15', totalScans: 4890, todayScans: 145, uniqueVisitors: 2230, lastScan: '2026-07-30 08:30', ownerId: 'CAMP-004', linkedModule: 'Campaigns', foregroundColor: '#B91C1C', backgroundColor: '#FEF2F2', logo: 'Spring', frame: 'Rounded', ctaText: 'Claim Offer', errorCorrection: 'M', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '2026-08-01', scanLimit: '20000', security: 'Active', routingMode: 'Campaign Route', campaignId: 'CAMP-004', nfcLinked: false },
  { id: 11, qrId: 'QR-BV-0100', name: 'GreenLeaf Spa VCard', type: 'Business VCard', owner: 'GreenLeaf Spa', ownerType: 'Business', destination: 'Business VCard — GreenLeaf Spa', routingStatus: 'Configured', scanCount: 4210, status: 'Published', created: '2026-02-14', lastUpdated: '2026-07-28', totalScans: 4210, todayScans: 134, uniqueVisitors: 1980, lastScan: '2026-07-30 07:55', ownerId: 'BUS-00512', linkedModule: 'Business VCards', foregroundColor: '#047857', backgroundColor: '#FFFFFF', logo: 'GreenLeaf', frame: 'Rounded', ctaText: 'View Services', errorCorrection: 'M', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '', scanLimit: '', security: 'Active', routingMode: 'Static Dynamic Route', campaignId: '', nfcLinked: true },
  { id: 12, qrId: 'QR-BV-0120', name: 'Hotel Grand VCard', type: 'Business VCard', owner: 'Hotel Grand', ownerType: 'Business', destination: 'Business VCard — Hotel Grand', routingStatus: 'Pending', scanCount: 0, status: 'Draft', created: '2026-07-28', lastUpdated: '2026-07-28', totalScans: 0, todayScans: 0, uniqueVisitors: 0, lastScan: '', ownerId: 'BUS-00891', linkedModule: 'Business VCards', foregroundColor: '#1E3A5F', backgroundColor: '#FFFFFF', logo: 'Hotel Grand', frame: 'Square', ctaText: 'Book a Room', errorCorrection: 'M', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '', scanLimit: '', security: 'Draft', routingMode: 'Static Dynamic Route', campaignId: '', nfcLinked: false },
  { id: 13, qrId: 'QR-BC-0050', name: 'Boutique Hotel Card', type: 'Business Card', owner: 'Boutique Hotel', ownerType: 'Business', destination: 'Business Card — Boutique Hotel', routingStatus: 'Disabled', scanCount: 120, status: 'Disabled', created: '2026-04-01', lastUpdated: '2026-07-10', totalScans: 120, todayScans: 0, uniqueVisitors: 45, lastScan: '2026-07-08 14:22', ownerId: 'BUS-00623', linkedModule: 'Business Cards', foregroundColor: '#7C2D12', backgroundColor: '#FFF7ED', logo: 'Boutique', frame: 'Rounded', ctaText: 'View Rooms', errorCorrection: 'M', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '', scanLimit: '', security: 'Disabled', routingMode: 'Disabled Route', campaignId: '', nfcLinked: false },
  { id: 14, qrId: 'QR-CV-0100', name: 'Emma L. VCard', type: 'Consumer VCard', owner: 'Emma L.', ownerType: 'Consumer', destination: 'Consumer VCard — Emma L.', routingStatus: 'Configured', scanCount: 2100, status: 'Published', created: '2026-05-10', lastUpdated: '2026-07-26', totalScans: 2100, todayScans: 67, uniqueVisitors: 980, lastScan: '2026-07-30 07:10', ownerId: 'CON-02415', linkedModule: 'Consumer VCards', foregroundColor: '#D97706', backgroundColor: '#FFFFFF', logo: '', frame: 'Rounded', ctaText: 'View My VCard', errorCorrection: 'M', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '', scanLimit: '', security: 'Active', routingMode: 'Static Dynamic Route', campaignId: '', nfcLinked: false },
  { id: 15, qrId: 'QR-CAMP-002', name: 'Winter Sale Campaign', type: 'Campaign', owner: 'Marketing Team', ownerType: 'Campaign', destination: 'Campaign — Winter Sale', routingStatus: 'Broken', scanCount: 340, status: 'Paused', created: '2025-12-01', lastUpdated: '2026-07-01', totalScans: 340, todayScans: 0, uniqueVisitors: 150, lastScan: '2026-06-15 18:30', ownerId: 'CAMP-008', linkedModule: 'Campaigns', foregroundColor: '#1D4ED8', backgroundColor: '#EFF6FF', logo: 'Winter', frame: 'Rounded', ctaText: 'Shop Now', errorCorrection: 'M', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '2026-02-28', scanLimit: '', security: 'Expired', routingMode: 'Campaign Route', campaignId: 'CAMP-008', nfcLinked: false },
  { id: 16, qrId: 'QR-EVENT-002', name: 'Business Expo 2026', type: 'Event', owner: 'Events Team', ownerType: 'Event', destination: 'Event Page — Business Expo', routingStatus: 'Testing', scanCount: 45, status: 'Draft', created: '2026-07-25', lastUpdated: '2026-07-29', totalScans: 45, todayScans: 12, uniqueVisitors: 25, lastScan: '2026-07-30 09:10', ownerId: 'EVENT-007', linkedModule: 'Events', foregroundColor: '#6B21A8', backgroundColor: '#F3E8FF', logo: 'Expo', frame: 'Rounded', ctaText: 'Register Now', errorCorrection: 'H', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '2026-09-15', scanLimit: '5000', security: 'Testing', routingMode: 'Scheduled Route', campaignId: '', nfcLinked: false },
  { id: 17, qrId: 'QR-PROD-002', name: 'Organic Tea Product', type: 'Product', owner: 'GreenLeaf Spa', ownerType: 'Product', destination: 'Product — Organic Tea', routingStatus: 'Configured', scanCount: 890, status: 'Published', created: '2026-06-01', lastUpdated: '2026-07-18', totalScans: 890, todayScans: 23, uniqueVisitors: 410, lastScan: '2026-07-29 14:30', ownerId: 'PROD-0087', linkedModule: 'Products', foregroundColor: '#065F46', backgroundColor: '#ECFDF5', logo: 'GreenLeaf', frame: 'Rounded', ctaText: 'Shop Tea', errorCorrection: 'M', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '', scanLimit: '', security: 'Active', routingMode: 'Static Dynamic Route', campaignId: '', nfcLinked: false },
  { id: 18, qrId: 'QR-BV-0200', name: 'TechCorp VCard', type: 'Business VCard', owner: 'TechCorp Inc', ownerType: 'Business', destination: 'Business VCard — TechCorp', routingStatus: 'Configured', scanCount: 3210, status: 'Published', created: '2026-03-01', lastUpdated: '2026-07-27', totalScans: 3210, todayScans: 112, uniqueVisitors: 1540, lastScan: '2026-07-30 08:15', ownerId: 'BUS-00102', linkedModule: 'Business VCards', foregroundColor: '#1E3A5F', backgroundColor: '#FFFFFF', logo: 'TechCorp', frame: 'Square', ctaText: 'Our Services', errorCorrection: 'M', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '', scanLimit: '', security: 'Active', routingMode: 'Static Dynamic Route', campaignId: '', nfcLinked: true },
  { id: 19, qrId: 'QR-CV-0150', name: 'Michael R. VCard', type: 'Consumer VCard', owner: 'Michael R.', ownerType: 'Consumer', destination: '', routingStatus: 'Pending', scanCount: 0, status: 'Draft', created: '2026-07-29', lastUpdated: '2026-07-29', totalScans: 0, todayScans: 0, uniqueVisitors: 0, lastScan: '', ownerId: 'CON-03120', linkedModule: 'Consumer VCards', foregroundColor: '#000000', backgroundColor: '#FFFFFF', logo: '', frame: 'Rounded', ctaText: '', errorCorrection: 'M', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '', scanLimit: '', security: 'Draft', routingMode: 'Static Dynamic Route', campaignId: '', nfcLinked: false },
  { id: 20, qrId: 'QR-CAMP-003', name: 'Loyalty Rewards', type: 'Promotion', owner: 'Marketing Team', ownerType: 'Campaign', destination: 'Loyalty — Double Points', routingStatus: 'Configured', scanCount: 15670, status: 'Published', created: '2026-05-01', lastUpdated: '2026-07-29', totalScans: 15670, todayScans: 378, uniqueVisitors: 7120, lastScan: '2026-07-30 09:08', ownerId: 'CAMP-012', linkedModule: 'Campaigns', foregroundColor: '#B45309', backgroundColor: '#FFFBEB', logo: 'Loyalty', frame: 'Rounded', ctaText: 'Earn Points', errorCorrection: 'H', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '2026-12-31', scanLimit: '100000', security: 'Active', routingMode: 'Campaign Route', campaignId: 'CAMP-012', nfcLinked: false },
  { id: 21, qrId: 'QR-BC-0100', name: 'Hotel Grand Card', type: 'Business Card', owner: 'Hotel Grand', ownerType: 'Business', destination: 'Business Card — Hotel Grand', routingStatus: 'Configured', scanCount: 1670, status: 'Published', created: '2026-04-20', lastUpdated: '2026-07-20', totalScans: 1670, todayScans: 45, uniqueVisitors: 780, lastScan: '2026-07-30 06:50', ownerId: 'BUS-00891', linkedModule: 'Business Cards', foregroundColor: '#1E3A5F', backgroundColor: '#FFFFFF', logo: 'Hotel Grand', frame: 'Rounded', ctaText: 'Book Direct', errorCorrection: 'M', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '', scanLimit: '', security: 'Active', routingMode: 'Static Dynamic Route', campaignId: '', nfcLinked: true },
  { id: 22, qrId: 'QR-CUSTOM-001', name: 'Event Feedback Form', type: 'Custom', owner: 'Events Team', ownerType: 'Event', destination: 'External URL — Feedback Form', routingStatus: 'Configured', scanCount: 780, status: 'Published', created: '2026-06-15', lastUpdated: '2026-07-22', totalScans: 780, todayScans: 18, uniqueVisitors: 350, lastScan: '2026-07-29 20:15', ownerId: 'EVENT-005', linkedModule: 'Events', foregroundColor: '#6D28D9', backgroundColor: '#F5F3FF', logo: '', frame: 'Rounded', ctaText: 'Give Feedback', errorCorrection: 'M', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '2026-08-30', scanLimit: '', security: 'Active', routingMode: 'Static Dynamic Route', campaignId: '', nfcLinked: false },
  { id: 23, qrId: 'QR-PROMO-005', name: 'Referral Bonus', type: 'Promotion', owner: 'Marketing Team', ownerType: 'Campaign', destination: 'Referral Landing Page', routingStatus: 'Expired', scanCount: 4500, status: 'Archived', created: '2026-01-10', lastUpdated: '2026-06-30', totalScans: 4500, todayScans: 0, uniqueVisitors: 2100, lastScan: '2026-06-28 23:59', ownerId: 'CAMP-003', linkedModule: 'Campaigns', foregroundColor: '#9333EA', backgroundColor: '#FAF5FF', logo: 'Referral', frame: 'Rounded', ctaText: 'Refer a Friend', errorCorrection: 'M', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '2026-06-28', scanLimit: '25000', security: 'Expired', routingMode: 'Campaign Route', campaignId: 'CAMP-003', nfcLinked: false },
  { id: 24, qrId: 'QR-BV-0300', name: 'Boutique Hotel VCard', type: 'Business VCard', owner: 'Boutique Hotel', ownerType: 'Business', destination: 'Business VCard — Boutique Hotel', routingStatus: 'Configured', scanCount: 1890, status: 'Published', created: '2026-05-01', lastUpdated: '2026-07-28', totalScans: 1890, todayScans: 78, uniqueVisitors: 890, lastScan: '2026-07-30 08:50', ownerId: 'BUS-00623', linkedModule: 'Business VCards', foregroundColor: '#7C2D12', backgroundColor: '#FFF7ED', logo: 'Boutique', frame: 'Rounded', ctaText: 'Explore', errorCorrection: 'M', quietZone: '4', formatPreview: 'PNG, SVG, PDF', expiryDate: '', scanLimit: '', security: 'Active', routingMode: 'Static Dynamic Route', campaignId: '', nfcLinked: true },
]

const QR_TYPES = ['All', 'Business VCard', 'Business Card', 'Consumer VCard', 'Consumer Card', 'Campaign', 'Product', 'Service', 'Event', 'Promotion', 'Custom']
const OWNER_TYPES = ['All', 'Business', 'Consumer', 'Campaign', 'Product', 'Event']
const STATUSES = ['All', 'Draft', 'Published', 'Paused', 'Disabled', 'Archived']
const ROUTING_STATUSES = ['All', 'Configured', 'Pending', 'Disabled', 'Broken', 'Expired', 'Testing']
const DATE_FILTERS = ['All', 'Today', 'This Week', 'This Month', 'Custom']

const tabs = ['overview', 'ownership', 'destination', 'routing', 'appearance', 'analytics', 'security', 'versions', 'activity']
const tabLabels = ['Overview', 'Ownership', 'Destination', 'Routing Rules', 'Appearance', 'Analytics', 'Security', 'Version History', 'Activity']

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    'Business VCard': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
    'Business Card': 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600',
    'Consumer VCard': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600',
    'Consumer Card': 'bg-pink-50 dark:bg-pink-500/10 text-pink-600',
    'Campaign': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Product': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Service': 'bg-teal-50 dark:bg-teal-500/10 text-teal-600',
    'Event': 'bg-rose-50 dark:bg-rose-500/10 text-rose-600',
    'Promotion': 'bg-orange-50 dark:bg-orange-500/10 text-orange-600',
    'Custom': 'bg-gray-50 dark:bg-gray-500/10 text-gray-600',
  }
  return <span className={"px-2 py-0.5 rounded-full text-[10px] font-medium " + (colors[type] || 'bg-gray-50 dark:bg-gray-500/10 text-gray-600')}>{type}</span>
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Published': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Draft': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
    'Paused': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Disabled': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Archived': 'bg-gray-50 dark:bg-gray-500/10 text-gray-600',
    'Active': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Expired': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Testing': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
  }
  const dots: Record<string, string> = {
    'Published': 'bg-green-500', 'Active': 'bg-green-500',
    'Draft': 'bg-gray-400', 'Paused': 'bg-amber-500',
    'Disabled': 'bg-red-500', 'Archived': 'bg-gray-400',
    'Expired': 'bg-red-500', 'Testing': 'bg-blue-500',
  }
  return (
    <span className={"inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium " + (colors[status] || 'bg-gray-50 dark:bg-gray-500/10 text-gray-600')}>
      <span className={"w-1.5 h-1.5 rounded-full " + (dots[status] || 'bg-gray-400')} />
      {status}
    </span>
  )
}

function RoutingBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Configured': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Pending': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
    'Disabled': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Broken': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Expired': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Testing': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
  }
  return <span className={"px-2 py-0.5 rounded text-[10px] font-medium " + (colors[status] || 'bg-gray-50 dark:bg-gray-500/10 text-gray-500')}>{status}</span>
}

export default function DynamicQRCodesPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterOwner, setFilterOwner] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterRouting, setFilterRouting] = useState('All')
  const [filterDate, setFilterDate] = useState('All')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [workspaceTab, setWorkspaceTab] = useState('overview')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const filtered = useMemo(() => {
    return QRS.filter(q => {
      if (search) {
        const s = search.toLowerCase()
        if (!q.qrId.toLowerCase().includes(s) && !q.name.toLowerCase().includes(s) && !q.owner.toLowerCase().includes(s) && !q.destination.toLowerCase().includes(s)) return false
      }
      if (filterType !== 'All' && q.type !== filterType) return false
      if (filterOwner !== 'All' && q.ownerType !== filterOwner) return false
      if (filterStatus !== 'All' && q.status !== filterStatus) return false
      if (filterRouting !== 'All' && q.routingStatus !== filterRouting) return false
      if (filterDate !== 'All') {
        const today = new Date()
        const created = new Date(q.created)
        if (filterDate === 'Today' && created.toDateString() !== today.toDateString()) return false
        if (filterDate === 'This Week') { const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7); if (created < weekAgo) return false }
        if (filterDate === 'This Month') { if (created.getMonth() !== today.getMonth() || created.getFullYear() !== today.getFullYear()) return false }
      }
      return true
    })
  }, [search, filterType, filterOwner, filterStatus, filterRouting, filterDate])

  const q = selectedId !== null ? QRS.find(x => x.id === selectedId)! : null

  function handleAction(msg: string) { toast.success(msg) }
  function toggleSelect(id: number) { setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next }) }
  function toggleSelectAll() { if (selectedIds.size === filtered.length) setSelectedIds(new Set()); else setSelectedIds(new Set(filtered.map(x => x.id))) }

  const totalQR = QRS.length
  const activeQR = QRS.filter(x => x.status === 'Published').length
  const draftQR = QRS.filter(x => x.status === 'Draft').length
  const archivedQR = QRS.filter(x => x.status === 'Archived').length
  const disabledQR = QRS.filter(x => x.status === 'Disabled').length
  const noDestination = QRS.filter(x => !x.destination).length
  const campaignQR = QRS.filter(x => x.type === 'Campaign' || x.type === 'Promotion').length
  const nfcQR = QRS.filter(x => x.nfcLinked).length

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-6 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-8 gap-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
        <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Unable to load Dynamic QR Codes</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The QR service could not be reached.</p>
        <div className="flex gap-3">
          <button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 800) }} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Retry</button>
          <Link to="/admin/system-status" className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">View System Status</Link>
        </div>
      </div>
    )
  }

  if (!q && selectedId === null) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 3a4 4 0 00-4 4v10a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H7zM5 8h14M5 12h14M5 16h14M8 5v14m4-14v14m4-14v14" /></svg>
                </div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Dynamic QR Codes</h1>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Create, configure, publish, and manage every Dynamic QR Code across the MCOM ecosystem.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAction('Creating new Dynamic QR...')} className="px-3 py-1.5 rounded-lg bg-teal-500 text-white text-xs font-semibold hover:bg-teal-600">Create Dynamic QR</button>
              <button onClick={() => handleAction('Import QR Codes')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Import QR</button>
              <button onClick={() => handleAction('Exporting QR list...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Export</button>
              <button onClick={() => handleAction('Bulk QR generation...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Bulk Generate</button>
              <Link to="/admin/qr/dashboard" className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Dashboard</Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-8 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Total QR</p><p className="text-sm font-bold text-gray-900 dark:text-white">{totalQR}</p><p className="text-[9px] text-gray-400">{activeQR} Active · {draftQR} Draft · {archivedQR} Archived</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Published</p><p className="text-sm font-bold text-green-600">{activeQR}</p><p className="text-[9px] text-gray-400">Available for scanning</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Disabled</p><p className="text-sm font-bold text-red-600">{disabledQR}</p><p className="text-[9px] text-gray-400">Temporarily unavailable</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Expired</p><p className="text-sm font-bold text-red-600">0</p><p className="text-[9px] text-gray-400">Auto-expired</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Active Routing</p><p className="text-sm font-bold text-teal-600">{QRS.filter(x => x.routingStatus === 'Configured').length}</p><p className="text-[9px] text-gray-400">Linked to destinations</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-100 dark:border-red-500/10 p-3"><p className="text-[10px] text-red-500">No Destination</p><p className="text-sm font-bold text-red-600">{noDestination}</p><p className="text-[9px] text-red-400">Requires attention</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Campaign QR</p><p className="text-sm font-bold text-amber-600">{campaignQR}</p><p className="text-[9px] text-gray-400">Linked to campaigns</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">NFC Linked</p><p className="text-sm font-bold text-blue-600">{nfcQR}</p><p className="text-[9px] text-gray-400">NFC-enabled</p></div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search QR ID, name, owner, destination..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {QR_TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
          </select>
          <select value={filterOwner} onChange={e => setFilterOwner(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {OWNER_TYPES.map(o => <option key={o} value={o}>{o === 'All' ? 'All Owners' : o}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
          <select value={filterRouting} onChange={e => setFilterRouting(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {ROUTING_STATUSES.map(r => <option key={r} value={r}>{r === 'All' ? 'All Routing' : r}</option>)}
          </select>
          <select value={filterDate} onChange={e => setFilterDate(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {DATE_FILTERS.map(d => <option key={d} value={d}>{d === 'All' ? 'All Dates' : d}</option>)}
          </select>
        </div>

        {selectedIds.size > 0 && (
          <div className="bg-teal-50 dark:bg-teal-500/10 rounded-lg border border-teal-200 dark:border-teal-500/20 p-3 flex items-center justify-between">
            <span className="text-xs text-teal-700 dark:text-teal-300 font-medium">{selectedIds.size} QR codes selected</span>
            <div className="flex gap-2">
              {['Publish', 'Pause', 'Archive', 'Download', 'Print', 'Assign Routing', 'Apply Template', 'Export'].map(a => (
                <button key={a} onClick={() => handleAction(a + ' selected QR codes')} className="px-2 py-1 bg-white dark:bg-gray-700 border border-teal-200 dark:border-teal-500/20 rounded text-[10px] text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/10">{a}</button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left py-2 pl-3 w-8"><input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="rounded border-gray-300" /></th>
                <th className="text-left py-2 font-medium text-gray-400">QR ID</th>
                <th className="text-left py-2 font-medium text-gray-400">QR Name</th>
                <th className="text-left py-2 font-medium text-gray-400">Type</th>
                <th className="text-left py-2 font-medium text-gray-400">Owner</th>
                <th className="text-left py-2 font-medium text-gray-400">Destination</th>
                <th className="text-left py-2 font-medium text-gray-400">Routing</th>
                <th className="text-right py-2 font-medium text-gray-400">Scans</th>
                <th className="text-left py-2 font-medium text-gray-400">Status</th>
                <th className="text-left py-2 font-medium text-gray-400">Created</th>
                <th className="text-left py-2 font-medium text-gray-400">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className={'border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer ' + (selectedId === r.id ? 'bg-teal-50 dark:bg-teal-500/5' : '')} onClick={() => setSelectedId(r.id)}>
                    <td className="py-2 pl-3"><input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggleSelect(r.id)} onClick={e => e.stopPropagation()} className="rounded border-gray-300" /></td>
                    <td className="py-2 font-mono text-[10px] text-gray-900 dark:text-white">{r.qrId}</td>
                    <td className="py-2 font-medium text-gray-900 dark:text-white">{r.name}</td>
                    <td className="py-2"><TypeBadge type={r.type} /></td>
                    <td className="py-2 text-gray-500">{r.owner}</td>
                    <td className="py-2 text-gray-500 max-w-[150px] truncate" title={r.destination}>{r.destination || <span className="text-red-400 italic">Not set</span>}</td>
                    <td className="py-2"><RoutingBadge status={r.routingStatus} /></td>
                    <td className="py-2 text-right font-medium">{r.scanCount.toLocaleString()}</td>
                    <td className="py-2"><StatusBadge status={r.status} /></td>
                    <td className="py-2 text-gray-400">{r.created}</td>
                    <td className="py-2">
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleAction('Viewing ' + r.name)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">View</button>
                        <button onClick={() => handleAction('Editing ' + r.name)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">Edit</button>
                        <button onClick={() => handleAction('Downloading QR for ' + r.name)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">DL</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="text-center py-8"><p className="text-sm text-gray-400">No QR codes match your filters.</p></div>}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedId(null)} className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{q!.name}</h1>
            <p className="text-xs text-gray-500">{q!.qrId} · <StatusBadge status={q!.status} /></p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleAction('Previewing ' + q!.name)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Preview</button>
          <button onClick={() => handleAction('Testing scan for ' + q!.name)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Test Scan</button>
          <button onClick={() => handleAction('Downloading QR asset for ' + q!.name)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Download</button>
          <button onClick={() => handleAction('Printing QR for ' + q!.name)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Print</button>
          <button onClick={() => handleAction('Opened owner: ' + q!.owner)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Open Owner</button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-px">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setWorkspaceTab(t)} className={'px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ' + (workspaceTab === t ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}>{tabLabels[i]}</button>
        ))}
      </div>

      {workspaceTab === 'overview' && q && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">QR Information</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">QR ID</span><span className="font-mono text-gray-900 dark:text-white">{q.qrId}</span></div>
                <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Name</span><span className="text-gray-900 dark:text-white">{q.name}</span></div>
                <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Type</span><TypeBadge type={q.type} /></div>
                <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Status</span><StatusBadge status={q.status} /></div>
                <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Created</span><span className="text-gray-500">{q.created}</span></div>
                <div className="flex justify-between py-1"><span className="text-gray-500">Last Updated</span><span className="text-gray-500">{q.lastUpdated}</span></div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Scan Summary</h4>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-[10px] text-gray-500">Total Scans</p><p className="text-sm font-bold text-gray-900 dark:text-white">{q.totalScans.toLocaleString()}</p></div>
                <div><p className="text-[10px] text-gray-500">Today's Scans</p><p className="text-sm font-bold text-green-600">{q.todayScans.toLocaleString()}</p></div>
                <div><p className="text-[10px] text-gray-500">Unique Visitors</p><p className="text-sm font-bold text-gray-900 dark:text-white">{q.uniqueVisitors.toLocaleString()}</p></div>
                <div><p className="text-[10px] text-gray-500">Last Scan</p><p className="text-sm font-bold text-gray-500">{q.lastScan || 'N/A'}</p></div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">QR Preview</h4>
            <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="w-32 h-32 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm" style={{ padding: '8px' }}>
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm6-2h7v7h-7V3zm2 2v3h3V5h-3zM3 13h7v7H3v-7zm2 2v3h3v-3H5zm10-4h2v2h-2v-2zm-2 0h-2v2h2v-2zm2 4h2v2h-2v-2zm-2 0h-2v2h2v-2zm2 4h2v2h-2v-2zm-4 0h-2v2h2v-2zm4-8h2v-2h-2v2z"/></svg>
                </div>
              </div>
              <div className="text-center mt-3"><p className="text-xs font-medium text-gray-900 dark:text-white">{q.name}</p><p className="text-[10px] text-gray-400">{q.qrId}</p></div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleAction('Previewing ' + q.name)} className="px-3 py-1 bg-teal-500 text-white rounded text-[10px] font-medium hover:bg-teal-600">Preview</button>
                <button onClick={() => handleAction('Testing scan for ' + q.name)} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-[10px] text-gray-600 dark:text-gray-400 hover:bg-gray-50">Test Scan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {workspaceTab === 'ownership' && q && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Ownership Details</h4>
          <div className="space-y-3 text-xs max-w-md">
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Owner Type</span><span className="font-medium text-gray-900 dark:text-white">{q.ownerType}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Owner Name</span><span className="font-medium text-gray-900 dark:text-white">{q.owner}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Owner ID</span><span className="font-mono text-gray-900 dark:text-white">{q.ownerId}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Linked Module</span><span className="font-medium text-gray-900 dark:text-white">{q.linkedModule}</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-500">NFC Linked</span><span className={'font-medium ' + (q.nfcLinked ? 'text-green-600' : 'text-gray-400')}>{q.nfcLinked ? 'Yes' : 'No'}</span></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => handleAction('Opening ' + q.owner + ' details')} className="px-3 py-1.5 bg-teal-500 text-white rounded text-xs font-medium hover:bg-teal-600">Open {q.ownerType}</button>
            <button onClick={() => handleAction('Opening linked module: ' + q.linkedModule)} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50">Open {q.linkedModule}</button>
          </div>
        </div>
      )}

      {workspaceTab === 'destination' && q && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Destination</h4>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-sm font-medium text-gray-900 dark:text-white">{q.destination || <span className="text-red-400 italic">No destination configured</span>}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleAction('Changing destination for ' + q.name)} className="px-3 py-1.5 bg-teal-500 text-white rounded text-xs font-medium hover:bg-teal-600">Change Destination</button>
            <button onClick={() => handleAction('Schedule destination change for ' + q.name)} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50">Schedule</button>
            <button onClick={() => handleAction('Preview redirect for ' + q.name)} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50">Preview Redirect</button>
            <button onClick={() => handleAction('Validating destination for ' + q.name)} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50">Validate</button>
          </div>
        </div>
      )}

      {workspaceTab === 'routing' && q && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Routing Configuration</h4>
            <div className="space-y-2 text-xs max-w-md">
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Routing Mode</span><span className="font-medium text-gray-900 dark:text-white">{q.routingMode}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Routing Status</span><RoutingBadge status={q.routingStatus} /></div>
              {q.campaignId && <div className="flex justify-between py-2"><span className="text-gray-500">Campaign</span><span className="font-medium text-gray-900 dark:text-white">{q.campaignId}</span></div>}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
            <p className="text-[10px] text-gray-500 mb-2">Simulate Routing</p>
            <div className="flex gap-2">
              <button onClick={() => handleAction('Simulating routing for ' + q.name)} className="px-3 py-1.5 bg-teal-500 text-white rounded text-xs font-medium hover:bg-teal-600">Run Simulation</button>
              <button onClick={() => handleAction('Testing all routing rules for ' + q.name)} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50">Test All Routes</button>
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/5 rounded-lg p-3 border border-amber-200 dark:border-amber-500/20">
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mb-1">Coming Soon — Advanced Routing</p>
            <p className="text-[9px] text-amber-600 dark:text-amber-500/70">Device-based routing, geo-based routing, language-based routing, A/B testing, and conditional routing are planned for future releases.</p>
          </div>
        </div>
      )}

      {workspaceTab === 'appearance' && q && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Appearance Settings</h4>
            <div className="space-y-3 text-xs max-w-md">
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Foreground</span><div className="flex items-center gap-2"><span className="w-4 h-4 rounded border" style={{ backgroundColor: q.foregroundColor }} /><span className="text-gray-900 dark:text-white">{q.foregroundColor}</span></div></div>
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Background</span><div className="flex items-center gap-2"><span className="w-4 h-4 rounded border" style={{ backgroundColor: q.backgroundColor }} /><span className="text-gray-900 dark:text-white">{q.backgroundColor}</span></div></div>
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Logo</span><span className="text-gray-900 dark:text-white">{q.logo || 'None'}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Frame</span><span className="text-gray-900 dark:text-white">{q.frame}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">CTA Text</span><span className="text-gray-900 dark:text-white">{q.ctaText || 'None'}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Error Correction</span><span className="text-gray-900 dark:text-white">{q.errorCorrection}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Quiet Zone</span><span className="text-gray-900 dark:text-white">{q.quietZone} modules</span></div>
              <div className="flex justify-between py-2"><span className="text-gray-500">Export Formats</span><span className="text-gray-900 dark:text-white">{q.formatPreview}</span></div>
            </div>
            <button onClick={() => handleAction('Editing appearance for ' + q.name)} className="mt-4 px-3 py-1.5 bg-teal-500 text-white rounded text-xs font-medium hover:bg-teal-600">Edit Appearance</button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Preview</h4>
            <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="w-40 h-40 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm" style={{ padding: '12px', backgroundColor: q.backgroundColor }}>
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: q.backgroundColor }}>
                  <svg className="w-20 h-20" viewBox="0 0 24 24" fill={q.foregroundColor}><path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm6-2h7v7h-7V3zm2 2v3h3V5h-3zM3 13h7v7H3v-7zm2 2v3h3v-3H5zm10-4h2v2h-2v-2zm-2 0h-2v2h2v-2zm2 4h2v2h-2v-2zm-2 0h-2v2h2v-2zm2 4h2v2h-2v-2zm-4 0h-2v2h2v-2zm4-8h2v-2h-2v2z"/></svg>
                </div>
              </div>
              {q.logo && <p className="text-[10px] text-gray-400 mt-1">Logo: {q.logo}</p>}
              <p className="text-[11px] text-gray-500 mt-1">{q.ctaText}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleAction('Downloading PNG for ' + q.name)} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-[10px] text-gray-600 dark:text-gray-400 hover:bg-gray-50">PNG</button>
                <button onClick={() => handleAction('Downloading SVG for ' + q.name)} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-[10px] text-gray-600 dark:text-gray-400 hover:bg-gray-50">SVG</button>
                <button onClick={() => handleAction('Downloading PDF for ' + q.name)} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-[10px] text-gray-600 dark:text-gray-400 hover:bg-gray-50">PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {workspaceTab === 'analytics' && q && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Total Scans</p><p className="text-lg font-bold text-gray-900 dark:text-white">{q.totalScans.toLocaleString()}</p></div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Unique Scans</p><p className="text-lg font-bold text-gray-900 dark:text-white">{q.uniqueVisitors.toLocaleString()}</p></div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Repeat Scans</p><p className="text-lg font-bold text-gray-900 dark:text-white">{(q.totalScans - q.uniqueVisitors).toLocaleString()}</p></div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-[10px] text-gray-500">Avg Redirect Time</p><p className="text-lg font-bold text-teal-600">122 ms</p></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleAction('Opening full analytics for ' + q.name)} className="px-3 py-1.5 bg-teal-500 text-white rounded text-xs font-medium hover:bg-teal-600">Open Full QR Analytics</button>
            <button onClick={() => handleAction('Exporting analytics for ' + q.name)} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50">Export Analytics</button>
          </div>
        </div>
      )}

      {workspaceTab === 'security' && q && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Security Settings</h4>
          <div className="space-y-3 text-xs max-w-md">
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Status</span><StatusBadge status={q.security} /></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Scan Limit</span><span className="text-gray-900 dark:text-white">{q.scanLimit || 'No limit'}</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-500">Expiry Date</span><span className="text-gray-900 dark:text-white">{q.expiryDate || 'No expiry'}</span></div>
          </div>
          <div className="flex gap-2">
            {q.status === 'Published' && <button onClick={() => handleAction('Pausing ' + q.name)} className="px-3 py-1.5 bg-amber-500 text-white rounded text-xs font-medium hover:bg-amber-600">Pause QR</button>}
            {q.status !== 'Disabled' && <button onClick={() => handleAction('Disabling ' + q.name)} className="px-3 py-1.5 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600">Disable QR</button>}
            {q.status !== 'Archived' && <button onClick={() => handleAction('Archiving ' + q.name)} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50">Archive</button>}
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/5 rounded-lg p-3 border border-amber-200 dark:border-amber-500/20">
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mb-1">Coming Soon — Advanced Security</p>
            <p className="text-[9px] text-amber-600 dark:text-amber-500/70">Require authentication, one-time QR, and scan limits by time window are planned for future releases.</p>
          </div>
        </div>
      )}

      {workspaceTab === 'versions' && q && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
          <div className="flex items-center justify-between"><h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Version History</h4><button onClick={() => handleAction('Exporting version history')} className="text-[10px] text-teal-600 hover:underline">Export</button></div>
          {[
            { v: 3, date: '2026-07-28', by: 'Admin', changes: 'Destination updated — Business VCard' },
            { v: 2, date: '2026-06-15', by: 'Marketing', changes: 'Campaign route enabled — Summer Promotion' },
            { v: 1, date: q.created, by: 'System', changes: 'QR code created' },
          ].map((v, i) => (
            <div key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-xs">
              <span className="font-mono text-teal-600 shrink-0">v{v.v}</span>
              <div className="flex-1"><div className="flex items-center gap-2"><span className="font-medium text-gray-900 dark:text-white">{v.by}</span><span className="text-gray-400">{v.date}</span></div><p className="text-gray-500">{v.changes}</p></div>
              <div className="flex gap-1"><button onClick={() => handleAction('Comparing v' + v.v)} className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-100">Compare</button><button onClick={() => handleAction('Restoring v' + v.v)} className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-100">Restore</button></div>
            </div>
          ))}
        </div>
      )}

      {workspaceTab === 'activity' && q && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Activity Timeline</h4>
          <div className="relative pl-6">
            {[
              { action: 'QR Viewed', detail: 'Admin viewed QR details', date: '2026-07-30 09:15' },
              { action: 'Analytics Viewed', detail: 'Marketing viewed scan analytics', date: '2026-07-29 14:30' },
              { action: 'Destination Updated', detail: 'Changed to Business VCard', date: '2026-07-28 11:00' },
              { action: 'Campaign Route Enabled', detail: 'Linked to Summer Promotion', date: '2026-06-15 09:00' },
              { action: 'QR Published', detail: 'Made available for scanning', date: q.created + ' 10:00' },
              { action: 'QR Created', detail: 'Generated by System', date: q.created + ' 09:00' },
            ].map((a, i) => (
              <div key={i} className="relative pb-4 last:pb-0">
                {i < 5 && <div className="absolute left-0 top-2 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />}
                <div className="flex items-start gap-3">
                  <div className="absolute left-[-6px] w-3 h-3 rounded-full bg-teal-500 border-2 border-white dark:border-gray-800 mt-0.5" />
                  <div className="text-xs ml-4"><p className="font-medium text-gray-900 dark:text-white">{a.action}</p><p className="text-gray-500">{a.detail}</p><p className="text-[10px] text-gray-400 mt-0.5">{a.date}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
