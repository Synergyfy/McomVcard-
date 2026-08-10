import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface ActivityData {
  id: number; eventId: string; timestamp: string; qrId: string; qrName: string; owner: string; qrType: string; category: string; action: string; performedBy: string; actorRole: string; result: string; source: string; description: string; previous: string; next: string; trigger: string; reason: string; processingTime: string; queueId: string; correlationId: string; apiRequestId: string; serviceVersion: string;
}

const ACTIVITY: ActivityData[] = [
  { id: 32, eventId: 'EV-00032', timestamp: '2026-07-31 10:45', qrId: 'QR-BV-0001', qrName: 'ABC Restaurant VCard', owner: 'ABC Restaurant Ltd', qrType: 'Business VCard', category: 'Analytics', action: 'Scan Recorded', performedBy: 'API', actorRole: 'API', result: 'Success', source: 'Analytics Engine', description: 'Scan event logged — destination Business VCard served in 116 ms', previous: '—', next: 'Scan #18,240,112', trigger: 'Inbound scan', reason: 'Normal operation', processingTime: '12 ms', queueId: '—', correlationId: 'C-8892', apiRequestId: 'REQ-88421', serviceVersion: 'analytics v3.1.0' },
  { id: 1, eventId: 'EV-00001', timestamp: '2026-07-31 10:42', qrId: 'QR-BV-0300', qrName: 'Boutique Hotel VCard', owner: 'Boutique Hotel', qrType: 'Business VCard', category: 'Lifecycle', action: 'QR Created', performedBy: 'System', actorRole: 'System', result: 'Success', source: 'Dynamic QR Engine', description: 'New QR created and provisioned for the Boutique Hotel business VCard', previous: '—', next: 'QR-BV-0300', trigger: 'Business VCard created', reason: 'Automatic provisioning', processingTime: '42 ms', queueId: 'Q-8871', correlationId: 'C-0042', apiRequestId: 'REQ-77192', serviceVersion: 'qr-engine v2.4.1' },
  { id: 2, eventId: 'EV-00002', timestamp: '2026-07-31 10:38', qrId: 'QR-CAMP-004', qrName: 'Referral Rewards Campaign', owner: 'Marketing Team', qrType: 'Campaign QR', category: 'Campaign', action: 'Campaign Assigned', performedBy: 'Emily Park', actorRole: 'Administrator', result: 'Success', source: 'Campaign Engine', description: 'Campaign CAMP-004 assigned to QR code with destination Referral Landing Page', previous: 'Unassigned', next: 'CAMP-004 — Referral Rewards', trigger: 'Assignment form submitted', reason: 'Campaign configuration', processingTime: '210 ms', queueId: 'Q-8869', correlationId: 'C-0041', apiRequestId: 'REQ-77188', serviceVersion: 'campaign v1.8.3' },
  { id: 3, eventId: 'EV-00003', timestamp: '2026-07-31 10:31', qrId: 'QR-CAMP-001', qrName: 'Summer Campaign 2026', owner: 'Marketing Team', qrType: 'Campaign QR', category: 'Downloads', action: 'QR Downloaded', performedBy: 'James Lee', actorRole: 'Business User', result: 'Success', source: 'QR Asset Engine', description: 'Asset AST-FLY-0001 downloaded — PNG 2048 × 2048, 300 DPI', previous: '—', next: 'Download #21,402', trigger: 'Download action', reason: 'Poster production', processingTime: '85 ms', queueId: '—', correlationId: 'C-0040', apiRequestId: 'REQ-77185', serviceVersion: 'asset v1.4.0' },
  { id: 4, eventId: 'EV-00004', timestamp: '2026-07-31 10:26', qrId: 'QR-SVC-001', qrName: 'Spa Booking Service', owner: 'GreenLeaf Spa', qrType: 'Business VCard', category: 'Routing', action: 'Destination Changed', performedBy: 'Emily Park', actorRole: 'Administrator', result: 'Success', source: 'Routing Engine', description: 'Destination updated to new Booking Page v2 for the spa service', previous: 'Booking Page — GreenLeaf v1', next: 'Booking Page — GreenLeaf v2', trigger: 'Routing form submitted', reason: 'Business requested refresh', processingTime: '96 ms', queueId: 'Q-8866', correlationId: 'C-0039', apiRequestId: 'REQ-77180', serviceVersion: 'routing v2.2.0' },
  { id: 5, eventId: 'EV-00005', timestamp: '2026-07-31 10:22', qrId: 'QR-BV-0002', qrName: 'Café Mocha VCard', owner: 'Café Mocha', qrType: 'Business VCard', category: 'Validation', action: 'Validation Passed', performedBy: 'System', actorRole: 'System', result: 'Success', source: 'Activity Engine', description: 'All 8 validation checks passed — route, schedule, fallback, security, contrast', previous: '—', next: 'Validated', trigger: 'Route change triggered validation', reason: 'Post-change verification', processingTime: '301 ms', queueId: 'Q-8864', correlationId: 'C-0038', apiRequestId: 'REQ-77175', serviceVersion: 'validation v1.2.2' },
  { id: 6, eventId: 'EV-00006', timestamp: '2026-07-31 10:15', qrId: 'QR-BV-0001', qrName: 'ABC Restaurant VCard', owner: 'ABC Restaurant Ltd', qrType: 'Business VCard', category: 'Downloads', action: 'QR Downloaded', performedBy: 'ABC Restaurant Ltd', actorRole: 'Business User', result: 'Success', source: 'QR Asset Engine', description: 'Asset AST-BC-0001 downloaded — Print PDF, 85 × 55 mm, 600 DPI', previous: '—', next: 'Download #12,481', trigger: 'Download action', reason: 'Business card print run', processingTime: '74 ms', queueId: '—', correlationId: 'C-0037', apiRequestId: 'REQ-77170', serviceVersion: 'asset v1.4.0' },
  { id: 7, eventId: 'EV-00007', timestamp: '2026-07-31 10:08', qrId: 'QR-EVENT-001', qrName: 'Music Festival 2026', owner: 'Events Team', qrType: 'Event QR', category: 'Routing', action: 'Schedule Updated', performedBy: 'Sofia Martins', actorRole: 'Administrator', result: 'Success', source: 'Routing Engine', description: 'Schedule extended — active window now through 2026-08-31', previous: 'Jul 10 → Aug 15', next: 'Jul 10 → Aug 31', trigger: 'Schedule editor submitted', reason: 'Festival extension announced', processingTime: '88 ms', queueId: 'Q-8861', correlationId: 'C-0036', apiRequestId: 'REQ-77164', serviceVersion: 'routing v2.2.0' },
  { id: 8, eventId: 'EV-00008', timestamp: '2026-07-31 10:02', qrId: 'QR-BV-0300', qrName: 'Boutique Hotel VCard', owner: 'Boutique Hotel', qrType: 'Business VCard', category: 'Assets', action: 'Asset Generated', performedBy: 'System', actorRole: 'System', result: 'Success', source: 'QR Asset Engine', description: 'Presentation Kit generated — CMYK PDF A4, 300 DPI, print-ready', previous: '—', next: 'AST-PS-0001 v1.0', trigger: 'Production queue job JOB-1042', reason: 'Asset request fulfilled', processingTime: '3.4 s', queueId: 'Q-8858', correlationId: 'C-0035', apiRequestId: 'REQ-77159', serviceVersion: 'asset v1.4.0' },
  { id: 9, eventId: 'EV-00009', timestamp: '2026-07-31 09:48', qrId: 'QR-BV-0001', qrName: 'ABC Restaurant VCard', owner: 'ABC Restaurant Ltd', qrType: 'Business VCard', category: 'Security', action: 'Unauthorized Access Attempt', performedBy: 'System', actorRole: 'System', result: 'Failed', source: 'Security Engine', description: 'Access attempt blocked — invalid API key presented for route API', previous: '—', next: 'Blocked', trigger: 'Inbound API request', reason: 'Invalid credentials', processingTime: '18 ms', queueId: '—', correlationId: 'C-0034', apiRequestId: 'REQ-77152', serviceVersion: 'security v2.0.1' },
  { id: 10, eventId: 'EV-00010', timestamp: '2026-07-31 09:41', qrId: 'QR-BV-0002', qrName: 'Café Mocha VCard', owner: 'Café Mocha', qrType: 'Business VCard', category: 'Administration', action: 'Brand Configuration Updated', performedBy: 'James Lee', actorRole: 'Administrator', result: 'Success', source: 'QR Design System', description: 'Brand preset updated — luxury gold palette applied to design template', previous: 'Eco Green preset', next: 'Luxury Gold preset', trigger: 'Brand manager action', reason: 'Rebrand requested', processingTime: '160 ms', queueId: 'Q-8855', correlationId: 'C-0033', apiRequestId: 'REQ-77147', serviceVersion: 'design v1.7.0' },
  { id: 11, eventId: 'EV-00011', timestamp: '2026-07-31 09:35', qrId: 'QR-CAMP-001', qrName: 'Summer Campaign 2026', owner: 'Marketing Team', qrType: 'Campaign QR', category: 'Campaign', action: 'Campaign Started', performedBy: 'System', actorRole: 'System', result: 'Success', source: 'Campaign Engine', description: 'Campaign CAMP-001 activated — routing now serves campaign destination', previous: 'Scheduled', next: 'Active', trigger: 'Start date reached', reason: 'Automatic activation', processingTime: '240 ms', queueId: 'Q-8853', correlationId: 'C-0032', apiRequestId: '—', serviceVersion: 'campaign v1.8.3' },
  { id: 12, eventId: 'EV-00012', timestamp: '2026-07-31 09:28', qrId: 'QR-BV-0001', qrName: 'ABC Restaurant VCard', owner: 'ABC Restaurant Ltd', qrType: 'Business VCard', category: 'Analytics', action: 'Scan Spike Detected', performedBy: 'System', actorRole: 'System', result: 'Warning', source: 'Analytics Engine', description: 'Scan volume 340% above 7-day baseline — 1,120 scans in the hour', previous: 'Baseline 330/h', next: '1,120/h', trigger: 'Anomaly threshold breached', reason: 'Viral content or campaign lift', processingTime: '54 ms', queueId: '—', correlationId: 'C-0031', apiRequestId: '—', serviceVersion: 'analytics v3.1.0' },
  { id: 13, eventId: 'EV-00013', timestamp: '2026-07-31 09:21', qrId: 'QR-CV-0001', qrName: 'Sarah K. VCard', owner: 'Sarah K.', qrType: 'Consumer VCard', category: 'Security', action: 'Unusual Download Activity', performedBy: 'System', actorRole: 'System', result: 'Warning', source: 'Security Engine', description: '12 downloads of consumer asset from distinct IPs within 5 minutes', previous: '—', next: 'Flagged for review', trigger: 'Rate-limit heuristic', reason: 'Possible asset scraping', processingTime: '31 ms', queueId: '—', correlationId: 'C-0030', apiRequestId: '—', serviceVersion: 'security v2.0.1' },
  { id: 14, eventId: 'EV-00014', timestamp: '2026-07-31 09:15', qrId: 'QR-BV-0001', qrName: 'ABC Restaurant VCard', owner: 'ABC Restaurant Ltd', qrType: 'Business VCard', category: 'Assets', action: 'Asset Regenerated', performedBy: 'ABC Restaurant Ltd', actorRole: 'Business User', result: 'Success', source: 'QR Asset Engine', description: 'Business Card asset regenerated — new version v3.2 created', previous: 'v3.1', next: 'v3.2', trigger: 'Regenerate action', reason: 'Design template updated', processingTime: '2.1 s', queueId: 'Q-8851', correlationId: 'C-0029', apiRequestId: 'REQ-77136', serviceVersion: 'asset v1.4.0' },
  { id: 15, eventId: 'EV-00015', timestamp: '2026-07-31 09:08', qrId: 'QR-BV-0300', qrName: 'Boutique Hotel VCard', owner: 'Boutique Hotel', qrType: 'Business VCard', category: 'Lifecycle', action: 'QR Published', performedBy: 'Emily Park', actorRole: 'Administrator', result: 'Success', source: 'Admin UI', description: 'QR moved from Draft to Published — live for scanning', previous: 'Draft', next: 'Published', trigger: 'Publish action', reason: 'Validation passed', processingTime: '120 ms', queueId: '—', correlationId: 'C-0028', apiRequestId: 'REQ-77130', serviceVersion: 'admin v4.0.0' },
  { id: 16, eventId: 'EV-00016', timestamp: '2026-07-31 08:59', qrId: 'QR-CAMP-001', qrName: 'Summer Campaign 2026', owner: 'Marketing Team', qrType: 'Campaign QR', category: 'Assets', action: 'Print Package Created', performedBy: 'System', actorRole: 'System', result: 'Success', source: 'QR Asset Engine', description: 'Print pack assembled — Flyer A5, Poster A3, Roll-up, Sticker', previous: '—', next: 'Summer Campaign Print Pack', trigger: 'Print pack request', reason: 'Bulk print run', processingTime: '1.9 s', queueId: 'Q-8849', correlationId: 'C-0027', apiRequestId: 'REQ-77124', serviceVersion: 'asset v1.4.0' },
  { id: 17, eventId: 'EV-00017', timestamp: '2026-07-30 18:42', qrId: 'QR-EVENT-001', qrName: 'Music Festival 2026', owner: 'Events Team', qrType: 'Event QR', category: 'Campaign', action: 'Campaign Ended', performedBy: 'System', actorRole: 'System', result: 'Success', source: 'Campaign Engine', description: 'Event campaign completed — end date reached, routing reverted', previous: 'Active', next: 'Completed', trigger: 'End date reached', reason: 'Automatic completion', processingTime: '198 ms', queueId: 'Q-8845', correlationId: 'C-0026', apiRequestId: '—', serviceVersion: 'campaign v1.8.3' },
  { id: 18, eventId: 'EV-00018', timestamp: '2026-07-30 17:31', qrId: 'QR-BV-0001', qrName: 'ABC Restaurant VCard', owner: 'ABC Restaurant Ltd', qrType: 'Business VCard', category: 'Validation', action: 'Conflict Detected', performedBy: 'System', actorRole: 'System', result: 'Warning', source: 'Campaign Engine', description: 'Two campaigns target the same QR during overlapping windows', previous: '—', next: 'Conflict flagged', trigger: 'Schedule overlap check', reason: 'Summer + Spring windows overlap', processingTime: '67 ms', queueId: '—', correlationId: 'C-0025', apiRequestId: '—', serviceVersion: 'validation v1.2.2' },
  { id: 19, eventId: 'EV-00019', timestamp: '2026-07-30 16:20', qrId: 'QR-EVENT-002', qrName: 'Business Expo 2026', owner: 'Events Team', qrType: 'Event QR', category: 'Validation', action: 'Invalid Destination', performedBy: 'System', actorRole: 'System', result: 'Failed', source: 'Routing Engine', description: 'Destination URL returns 404 — route flagged as broken', previous: 'Event Page v1', next: 'Broken route', trigger: 'Route health probe', reason: 'Landing page removed', processingTime: '1.1 s', queueId: '—', correlationId: 'C-0024', apiRequestId: '—', serviceVersion: 'routing v2.2.0' },
  { id: 20, eventId: 'EV-00020', timestamp: '2026-07-30 13:22', qrId: 'QR-PROD-001', qrName: 'Premium Coffee Product', owner: 'Café Mocha', qrType: 'Product QR', category: 'Routing', action: 'Redirect Failed', performedBy: 'System', actorRole: 'System', result: 'Failed', source: 'Routing Engine', description: 'Redirect failed after 3 retries — fallback invoked', previous: 'Product Page v2', next: 'Fallback — Landing', trigger: 'Upstream 503', reason: 'Commerce outage', processingTime: '2.4 s', queueId: '—', correlationId: 'C-0023', apiRequestId: '—', serviceVersion: 'routing v2.2.0' },
  { id: 21, eventId: 'EV-00021', timestamp: '2026-07-30 12:10', qrId: 'QR-BV-0002', qrName: 'Café Mocha VCard', owner: 'Café Mocha', qrType: 'Business VCard', category: 'Security', action: 'Permission Denied', performedBy: 'System', actorRole: 'System', result: 'Warning', source: 'Security Engine', description: 'Consumer attempted administrative operation on business QR', previous: '—', next: 'Denied', trigger: 'RBAC check', reason: 'Insufficient role', processingTime: '14 ms', queueId: '—', correlationId: 'C-0022', apiRequestId: 'REQ-77102', serviceVersion: 'security v2.0.1' },
  { id: 22, eventId: 'EV-00022', timestamp: '2026-07-30 11:05', qrId: 'QR-BC-0001', qrName: 'TechCorp Business Card', owner: 'TechCorp Inc', qrType: 'Business Card', category: 'Administration', action: 'Permissions Changed', performedBy: 'James Lee', actorRole: 'Administrator', result: 'Success', source: 'Admin UI', description: 'Agency / Contractor granted temporary download access until 2026-08-30', previous: 'Denied', next: 'Temporary access', trigger: 'Permission editor', reason: 'Design agency engagement', processingTime: '140 ms', queueId: '—', correlationId: 'C-0021', apiRequestId: 'REQ-77094', serviceVersion: 'admin v4.0.0' },
  { id: 23, eventId: 'EV-00023', timestamp: '2026-07-30 10:00', qrId: 'QR-CV-0001', qrName: 'Sarah K. VCard', owner: 'Sarah K.', qrType: 'Consumer VCard', category: 'Downloads', action: 'QR Downloaded', performedBy: 'Sarah K.', actorRole: 'Consumer', result: 'Success', source: 'QR Asset Engine', description: 'Consumer card asset downloaded — PNG 512 × 512', previous: '—', next: 'Download #3,121', trigger: 'Download action', reason: 'Personal use', processingTime: '61 ms', queueId: '—', correlationId: 'C-0020', apiRequestId: 'REQ-77088', serviceVersion: 'asset v1.4.0' },
  { id: 24, eventId: 'EV-00024', timestamp: '2026-07-30 09:15', qrId: 'QR-BV-0001', qrName: 'ABC Restaurant VCard', owner: 'ABC Restaurant Ltd', qrType: 'Business VCard', category: 'Administration', action: 'Settings Updated', performedBy: 'Emily Park', actorRole: 'Administrator', result: 'Success', source: 'Admin UI', description: 'Notification preferences updated — critical alerts enabled for this QR', previous: 'Email only', next: 'Email + push + webhook', trigger: 'Settings form', reason: 'Monitoring preference', processingTime: '92 ms', queueId: '—', correlationId: 'C-0019', apiRequestId: 'REQ-77081', serviceVersion: 'admin v4.0.0' },
  { id: 25, eventId: 'EV-00025', timestamp: '2026-07-29 18:30', qrId: 'QR-BV-0001', qrName: 'ABC Restaurant VCard', owner: 'ABC Restaurant Ltd', qrType: 'Business VCard', category: 'Lifecycle', action: 'QR Archived', performedBy: 'ABC Restaurant Ltd', actorRole: 'Business User', result: 'Success', source: 'Admin UI', description: 'Legacy QR archived — retained for audit, scanning disabled', previous: 'Published', next: 'Archived', trigger: 'Archive action', reason: 'Replaced by QR-BV-0001 v2', processingTime: '110 ms', queueId: '—', correlationId: 'C-0018', apiRequestId: 'REQ-77074', serviceVersion: 'admin v4.0.0' },
  { id: 26, eventId: 'EV-00026', timestamp: '2026-07-29 17:12', qrId: 'QR-BC-0050', qrName: 'Boutique Hotel Card', owner: 'Boutique Hotel', qrType: 'Business Card', category: 'Lifecycle', action: 'QR Restored', performedBy: 'James Lee', actorRole: 'Administrator', result: 'Success', source: 'Admin UI', description: 'Archived QR restored to Published — routing config intact', previous: 'Archived', next: 'Published', trigger: 'Restore action', reason: 'Staffing change reversed', processingTime: '133 ms', queueId: '—', correlationId: 'C-0017', apiRequestId: 'REQ-77067', serviceVersion: 'admin v4.0.0' },
  { id: 27, eventId: 'EV-00027', timestamp: '2026-07-29 16:04', qrId: 'QR-PROD-001', qrName: 'Premium Coffee Product', owner: 'Café Mocha', qrType: 'Product QR', category: 'System', action: 'Queue Failed', performedBy: 'System', actorRole: 'System', result: 'Failed', source: 'QR Asset Engine', description: 'Production job JOB-1037 failed — storage quota exceeded', previous: 'Queued', next: 'Failed', trigger: 'Render timeout', reason: 'Storage quota exceeded', processingTime: '8.2 s', queueId: 'Q-8841', correlationId: 'C-0016', apiRequestId: '—', serviceVersion: 'asset v1.4.0' },
  { id: 28, eventId: 'EV-00028', timestamp: '2026-07-29 15:20', qrId: 'QR-EVENT-001', qrName: 'Music Festival 2026', owner: 'Events Team', qrType: 'Event QR', category: 'Routing', action: 'Fallback Triggered', performedBy: 'System', actorRole: 'System', result: 'Warning', source: 'Routing Engine', description: 'Primary destination unreachable — fallback route served', previous: 'Ticket page', next: 'Fallback — Info page', trigger: 'Upstream timeout', reason: 'Ticket vendor latency', processingTime: '1.6 s', queueId: '—', correlationId: 'C-0015', apiRequestId: '—', serviceVersion: 'routing v2.2.0' },
  { id: 29, eventId: 'EV-00029', timestamp: '2026-07-29 11:40', qrId: 'QR-BV-0300', qrName: 'Boutique Hotel VCard', owner: 'Boutique Hotel', qrType: 'Business VCard', category: 'Assets', action: 'Download Link Generated', performedBy: 'Emily Park', actorRole: 'Administrator', result: 'Success', source: 'QR Asset Engine', description: 'Temporary share link created for print shop — expires 2026-08-10', previous: '—', next: 'Link + expiry 08-10', trigger: 'Share link form', reason: 'Print production', processingTime: '58 ms', queueId: '—', correlationId: 'C-0014', apiRequestId: 'REQ-77052', serviceVersion: 'asset v1.4.0' },
  { id: 30, eventId: 'EV-00030', timestamp: '2026-07-28 21:30', qrId: 'QR-CAMP-002', qrName: 'Winter Sale Campaign', owner: 'Marketing Team', qrType: 'Campaign QR', category: 'Campaign', action: 'Campaign Paused', performedBy: 'James Lee', actorRole: 'Administrator', result: 'Warning', source: 'Campaign Engine', description: 'Campaign paused — conflict detected with active loyalty campaign', previous: 'Active', next: 'Paused', trigger: 'Manual pause + conflict', reason: 'Double assignment on QR', processingTime: '205 ms', queueId: 'Q-8837', correlationId: 'C-0013', apiRequestId: 'REQ-77045', serviceVersion: 'campaign v1.8.3' },
  { id: 31, eventId: 'EV-00031', timestamp: '2026-07-02 03:00', qrId: 'SYSTEM-WIDE', qrName: 'All QR Codes', owner: 'Platform', qrType: 'Business VCard', category: 'System', action: 'Scheduled Maintenance', performedBy: 'System', actorRole: 'System', result: 'Success', source: 'System', description: 'Quarterly maintenance — retention job archived records older than 24 months', previous: '—', next: 'Archive completed', trigger: 'Cron schedule', reason: 'Retention policy', processingTime: '12.7 s', queueId: 'Q-8800', correlationId: 'C-0012', apiRequestId: '—', serviceVersion: 'system v1.0.0' },
]

const CATEGORIES = ['All', 'Lifecycle', 'Routing', 'Campaign', 'Analytics', 'Assets', 'Downloads', 'Validation', 'Security', 'Administration', 'System']
const RESULTS = ['All', 'Success', 'Warning', 'Failed']
const ACTORS = ['All', 'Administrator', 'Business User', 'Consumer', 'System', 'API']
const DATES = ['All', 'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Custom']
const QR_TYPES = ['All', 'Business VCard', 'Consumer VCard', 'Business Card', 'Consumer Card', 'Campaign QR', 'Product QR', 'Event QR']

const NOTIFICATIONS = [
  { icon: '!', color: 'text-red-600', msg: 'High-risk security event detected — unauthorized API access', date: '09:48' },
  { icon: '↻', color: 'text-amber-600', msg: 'Multiple routing failures recorded — Premium Coffee product', date: '13:22' },
  { icon: '▤', color: 'text-amber-600', msg: 'Asset generation failures increasing — storage quota', date: '16:04' },
  { icon: '!', color: 'text-amber-600', msg: 'QR repeatedly failing validation — Business Expo 2026', date: '16:20' },
  { icon: '↓', color: 'text-amber-600', msg: 'Unusual download activity — Sarah K. VCard flagged', date: '09:21' },
]

const PERMISSIONS = [
  { role: 'Super Admin', scope: 'Full access to all activity records and audit exports', color: 'bg-red-500' },
  { role: 'Operations Manager', scope: 'View all operational activity', color: 'bg-orange-500' },
  { role: 'Security Administrator', scope: 'Security events and audit exports', color: 'bg-amber-500' },
  { role: 'Marketing Manager', scope: 'Campaign-related activity only', color: 'bg-blue-500' },
  { role: 'Support', scope: 'Read-only operational logs', color: 'bg-gray-400' },
  { role: 'Business Users', scope: 'Activity for own organisation QR resources only', color: 'bg-green-500' },
]

const COMING_SOON = [
  'Cross-Platform Activity Timeline — combine MCOMVCard, MCOM Rewards, MCOMMall, FundOrDonate, and future products into one chronological view',
  'Event Correlation — automatically link related actions such as a routing change, scan increase, and campaign launch',
  'AI Anomaly Detection — identify unusual patterns like unexpected routing changes or abnormal download behaviour',
  'Compliance & Audit Reporting — generate audit packages for regulatory reviews or internal governance',
  'Webhook & External Audit Integrations — stream activity events to approved third-party monitoring platforms',
]

const tabs = ['overview', 'details', 'related', 'history', 'metadata']
const tabLabels = ['Overview', 'Event Details', 'Related Resources', 'Change History', 'System Metadata']

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = { 'Lifecycle': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600', 'Routing': 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600', 'Campaign': 'bg-rose-50 dark:bg-rose-500/10 text-rose-600', 'Analytics': 'bg-sky-50 dark:bg-sky-500/10 text-sky-600', 'Assets': 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600', 'Downloads': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600', 'Validation': 'bg-teal-50 dark:bg-teal-500/10 text-teal-600', 'Security': 'bg-red-50 dark:bg-red-500/10 text-red-600', 'Administration': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600', 'System': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500' }
  return <span className={"px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap " + (colors[category] || 'bg-gray-50 dark:bg-gray-500/10 text-gray-500')}>{category}</span>
}

function ResultBadge({ result }: { result: string }) {
  const colors: Record<string, string> = { 'Success': 'bg-green-50 dark:bg-green-500/10 text-green-600', 'Warning': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600', 'Failed': 'bg-red-50 dark:bg-red-500/10 text-red-600' }
  const dots: Record<string, string> = { 'Success': 'bg-green-500', 'Warning': 'bg-amber-500', 'Failed': 'bg-red-500' }
  return (
    <span className={"inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium " + (colors[result] || 'bg-gray-50 dark:bg-gray-500/10 text-gray-500')}>
      <span className={"w-1.5 h-1.5 rounded-full " + (dots[result] || 'bg-gray-400')} />{result}
    </span>
  )
}

function ActorBadge({ actorRole }: { actorRole: string }) {
  const colors: Record<string, string> = { 'Administrator': 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600', 'Business User': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600', 'Consumer': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600', 'System': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500', 'API': 'bg-teal-50 dark:bg-teal-500/10 text-teal-600' }
  return <span className={"px-2 py-0.5 rounded-full text-[10px] font-medium " + (colors[actorRole] || 'bg-gray-50 dark:bg-gray-500/10 text-gray-500')}>{actorRole}</span>
}

export default function QRActivityPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterResult, setFilterResult] = useState('All')
  const [filterActor, setFilterActor] = useState('All')
  const [filterDate, setFilterDate] = useState('All')
  const [filterQrType, setFilterQrType] = useState('All')
  const [feedPaused, setFeedPaused] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [workspaceTab, setWorkspaceTab] = useState('overview')

  const sortedEvents = useMemo(() => [...ACTIVITY].sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [])

  const filtered = useMemo(() => {
    return sortedEvents.filter(a => {
      if (search) { const s = search.toLowerCase(); if (!a.eventId.toLowerCase().includes(s) && !a.qrId.toLowerCase().includes(s) && !a.qrName.toLowerCase().includes(s) && !a.owner.toLowerCase().includes(s) && !a.performedBy.toLowerCase().includes(s) && !a.action.toLowerCase().includes(s)) return false }
      if (filterCategory !== 'All' && a.category !== filterCategory) return false
      if (filterResult !== 'All' && a.result !== filterResult) return false
      if (filterActor !== 'All' && a.actorRole !== filterActor) return false
      if (filterQrType !== 'All' && a.qrType !== filterQrType) return false
      if (filterDate !== 'All') {
        const today = new Date(); const d = new Date(a.timestamp.slice(0, 10)); const yest = new Date(today); yest.setDate(yest.getDate() - 1)
        const day1 = new Date(d.toDateString()); const today1 = new Date(today.toDateString()); const yest1 = new Date(yest.toDateString())
        if (filterDate === 'Today' && day1.getTime() !== today1.getTime()) return false
        if (filterDate === 'Yesterday' && day1.getTime() !== yest1.getTime()) return false
        if (filterDate === 'Last 7 Days') { const wk = new Date(today); wk.setDate(wk.getDate() - 7); if (d < wk) return false }
        if (filterDate === 'Last 30 Days') { const mo = new Date(today); mo.setDate(mo.getDate() - 30); if (d < mo) return false }
      }
      return true
    })
  }, [search, filterCategory, filterResult, filterActor, filterDate, filterQrType, sortedEvents])

  const event = selectedId !== null ? ACTIVITY.find(x => x.id === selectedId)! : null

  function handleAction(msg: string) { toast.success(msg) }

  const feed = useMemo(() => sortedEvents.slice(0, 6), [sortedEvents])
  const createdCount = ACTIVITY.filter(x => x.action === 'QR Created').length
  const restoredCount = ACTIVITY.filter(x => x.action === 'QR Restored').length
  const routingUpdates = ACTIVITY.filter(x => x.category === 'Routing' && x.result === 'Success').length
  const designChanges = ACTIVITY.filter(x => x.action === 'Brand Configuration Updated').length
  const metadataUpdates = ACTIVITY.filter(x => x.action === 'Settings Updated').length
  const campaignCount = ACTIVITY.filter(x => x.category === 'Campaign').length
  const assignments = ACTIVITY.filter(x => x.action === 'Campaign Assigned').length
  const activations = ACTIVITY.filter(x => x.action === 'Campaign Started').length
  const completions = ACTIVITY.filter(x => x.action === 'Campaign Ended').length
  const assetCount = ACTIVITY.filter(x => x.category === 'Assets').length
  const downloadCount = ACTIVITY.filter(x => x.category === 'Downloads').length
  const assetGenerated = ACTIVITY.filter(x => x.action === 'Asset Generated').length
  const assetRegenerated = ACTIVITY.filter(x => x.action === 'Asset Regenerated').length
  const securityCount = ACTIVITY.filter(x => x.category === 'Security').length
  const failedAccess = ACTIVITY.filter(x => x.action === 'Unauthorized Access Attempt').length
  const violations = ACTIVITY.filter(x => x.action === 'Permission Denied').length
  const suspicious = ACTIVITY.filter(x => x.action === 'Unusual Download Activity').length
  const validationCount = ACTIVITY.filter(x => x.category === 'Validation').length
  const validationPassed = ACTIVITY.filter(x => x.category === 'Validation' && x.result === 'Success').length
  const validationFailed = ACTIVITY.filter(x => x.category === 'Validation' && x.result === 'Failed').length
  const validationWarnings = ACTIVITY.filter(x => x.category === 'Validation' && x.result === 'Warning').length
  const systemCount = ACTIVITY.filter(x => x.category === 'System').length

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-8 gap-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
        <div className="grid grid-cols-3 gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}</div>
        <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /><div className="h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Unable to load QR Activity.</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The QR Activity Engine could not be reached.</p>
        <div className="flex gap-3">
          <button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 800) }} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Retry</button>
          <Link to="/admin/system-status" className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">View System Status</Link>
        </div>
      </div>
    )
  }

  if (!event && selectedId === null) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">QR Activity</h1>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Complete operational audit trail — who did what, when it happened, and what changed.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleAction('Exporting activity to CSV...')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Export Activity</button>
              <button onClick={() => handleAction('Downloading audit log...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Download Audit Log</button>
              <button onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 600) }} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Refresh</button>
              <button onClick={() => handleAction('Opening advanced search...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Advanced Search</button>
              <button onClick={() => handleAction('Opening activity settings...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Activity Settings</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-8 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Total Events</p><p className="text-sm font-bold text-gray-900 dark:text-white">4.2M</p><p className="text-[9px] text-gray-400">Today 1,248 · Week 8,420 · Month 34,120</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">QR Creations</p><p className="text-sm font-bold text-blue-600">{createdCount + restoredCount}</p><p className="text-[9px] text-gray-400">{createdCount} New · {restoredCount} Restored</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">QR Updates</p><p className="text-sm font-bold text-cyan-600">{routingUpdates + designChanges + metadataUpdates}</p><p className="text-[9px] text-gray-400">Routing {routingUpdates} · Design {designChanges} · Metadata {metadataUpdates}</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Campaign Events</p><p className="text-sm font-bold text-rose-600">{campaignCount}</p><p className="text-[9px] text-gray-400">Assignments {assignments} · Activations {activations} · Completions {completions}</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Asset Events</p><p className="text-sm font-bold text-indigo-600">{assetCount + downloadCount}</p><p className="text-[9px] text-gray-400">Generated {assetGenerated} · Downloads {downloadCount} · Regenerated {assetRegenerated}</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-100 dark:border-red-500/10 p-3"><p className="text-[10px] text-red-500">Security Events</p><p className="text-sm font-bold text-red-600">{securityCount}</p><p className="text-[9px] text-red-400">Failed Access {failedAccess} · Violations {violations} · Suspicious {suspicious}</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">Validation Events</p><p className="text-sm font-bold text-teal-600">{validationCount}</p><p className="text-[9px] text-gray-400">{validationPassed} Passed · {validationFailed} Failed · {validationWarnings} Warnings</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3"><p className="text-[10px] text-gray-500">System Events</p><p className="text-sm font-bold text-gray-900 dark:text-white">{systemCount}</p><p className="text-[9px] text-gray-400">Jobs · Queue · Maintenance</p></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Live Activity Feed</h4>
              <button onClick={() => setFeedPaused(!feedPaused)} className={'px-2 py-1 rounded text-[9px] font-medium ' + (feedPaused ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200')}>{feedPaused ? 'Resume' : 'Pause'}</button>
            </div>
            <div className="space-y-0">
              {feed.map((f, i) => (
                <div key={f.id} className={'flex gap-3 ' + (i < feed.length - 1 ? 'border-b border-gray-50 dark:border-gray-700/50 pb-2 mb-2' : '')}>
                  <div className="text-[9px] font-mono text-gray-400 w-9 shrink-0 pt-0.5">{f.timestamp.slice(11, 16)}</div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedId(f.id)}>
                    <p className="text-[11px] font-medium text-gray-900 dark:text-white truncate hover:text-orange-600">{f.action}</p>
                    <p className="text-[9px] text-gray-400 truncate">{f.qrName} · {f.qrId}</p>
                  </div>
                  <span className={'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ' + (f.result === 'Success' ? 'bg-green-500' : f.result === 'Warning' ? 'bg-amber-500' : 'bg-red-500')} />
                </div>
              ))}
            </div>
            <div className="mt-3 bg-orange-50 dark:bg-orange-500/10 rounded-lg p-2.5 text-[9px] text-orange-700 dark:text-orange-300">{feedPaused ? 'Feed paused — showing last received events.' : 'Streaming events in real time from the Activity Engine.'}</div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Analytics vs Activity</h4>
              <span className="text-[9px] text-gray-400">Two different concerns — kept separate by design</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                <p className="text-[11px] font-semibold text-blue-600 mb-2">QR Analytics</p>
                <div className="space-y-1 text-[10px] text-gray-600 dark:text-gray-400">
                  <p>Answers: "How is the QR performing?"</p>
                  <p>Business Intelligence</p>
                  <p>Charts &amp; KPIs</p>
                  <p>Trends &amp; scan performance</p>
                  <p>Marketing insights</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                <p className="text-[11px] font-semibold text-orange-600 mb-2">QR Activity</p>
                <div className="space-y-1 text-[10px] text-gray-600 dark:text-gray-400">
                  <p>Answers: "What happened to the QR?"</p>
                  <p>Audit &amp; Operations</p>
                  <p>Timeline &amp; Logs</p>
                  <p>Individual events &amp; system actions</p>
                  <p>Administrative history</p>
                </div>
              </div>
            </div>
            <p className="text-[9px] text-gray-400 mt-3">A QR may have excellent analytics yet suspicious activity — or little analytics and hundreds of administrative changes. This module records every operational event independently of performance measurement.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search QR ID, QR name, event ID, business, consumer, campaign, user, action..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500" />
          </div>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
          <select value={filterResult} onChange={e => setFilterResult(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {RESULTS.map(r => <option key={r} value={r}>{r === 'All' ? 'All Results' : r}</option>)}
          </select>
          <select value={filterActor} onChange={e => setFilterActor(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {ACTORS.map(a => <option key={a} value={a}>{a === 'All' ? 'Performed By — All' : a}</option>)}
          </select>
          <select value={filterQrType} onChange={e => setFilterQrType(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {QR_TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All QR Types' : t}</option>)}
          </select>
          <select value={filterDate} onChange={e => setFilterDate(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {DATES.map(d => <option key={d} value={d}>{d === 'All' ? 'All Dates' : d}</option>)}
          </select>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Activity Table</h4>
            <span className="text-[9px] text-gray-400">Records are immutable — events cannot be edited or deleted through the UI</span>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">No QR Activity Found</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">Activity will appear as QR operations occur across the platform.</p>
              <Link to="/admin/qr/codes" className="px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600">View Dynamic QR Codes</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left py-2 pl-3 font-medium text-gray-400">Timestamp</th>
                  <th className="text-left py-2 font-medium text-gray-400">Event ID</th>
                  <th className="text-left py-2 font-medium text-gray-400">QR ID</th>
                  <th className="text-left py-2 font-medium text-gray-400">QR Name</th>
                  <th className="text-left py-2 font-medium text-gray-400">Owner</th>
                  <th className="text-left py-2 font-medium text-gray-400">Category</th>
                  <th className="text-left py-2 font-medium text-gray-400">Action</th>
                  <th className="text-left py-2 font-medium text-gray-400">Performed By</th>
                  <th className="text-left py-2 font-medium text-gray-400">Result</th>
                  <th className="text-left py-2 font-medium text-gray-400">Source</th>
                  <th className="text-left py-2 font-medium text-gray-400">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id} className={'border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer ' + (selectedId === a.id ? 'bg-orange-50 dark:bg-orange-500/5' : '')} onClick={() => setSelectedId(a.id)}>
                      <td className="py-2 pl-3 font-mono text-[9px] text-gray-500 whitespace-nowrap">{a.timestamp}</td>
                      <td className="py-2 font-mono text-[10px] text-gray-900 dark:text-white">{a.eventId}</td>
                      <td className="py-2 font-mono text-[9px] text-gray-400 whitespace-nowrap">{a.qrId}</td>
                      <td className="py-2"><span className="font-medium text-gray-900 dark:text-white">{a.qrName}</span><p className="text-[9px] text-gray-400">{a.qrType}</p></td>
                      <td className="py-2 text-gray-500 max-w-[110px] truncate">{a.owner}</td>
                      <td className="py-2"><CategoryBadge category={a.category} /></td>
                      <td className="py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">{a.action}</td>
                      <td className="py-2"><div className="flex items-center gap-1.5"><ActorBadge actorRole={a.actorRole} /><span className="text-[9px] text-gray-400">{a.performedBy}</span></div></td>
                      <td className="py-2"><ResultBadge result={a.result} /></td>
                      <td className="py-2 text-[9px] text-gray-400 whitespace-nowrap">{a.source}</td>
                      <td className="py-2"><div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedId(a.id)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">Details</button>
                        <button onClick={() => handleAction('Opening QR ' + a.qrId)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">QR</button>
                        {a.category === 'Routing' && <button onClick={() => handleAction('Opening related routing rule')} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">Rule</button>}
                        {a.category === 'Campaign' && <button onClick={() => handleAction('Opening related campaign')} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">Campaign</button>}
                        <button onClick={() => handleAction('Exporting record ' + a.eventId)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-600 dark:text-gray-400 hover:bg-gray-200">Export</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Activity Retention</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Retention Period</span><span className="font-medium text-gray-900 dark:text-white">24 months hot storage</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Archive Policy</span><span className="font-medium text-gray-900 dark:text-white">Older records moved to archive — remain searchable</span></div>
              <div className="flex justify-between py-2"><span className="text-gray-500">Export Policy</span><span className="font-medium text-gray-900 dark:text-white">Full audit export available to authorised admins</span></div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => handleAction('Configuring retention...')} className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-[10px] font-medium hover:bg-orange-600">Configure Retention</button>
              <button onClick={() => handleAction('Exporting archived records...')} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-[10px] text-gray-600 dark:text-gray-400 hover:bg-gray-50">Export Archive</button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Activity Notifications</h4>
            <div className="space-y-2">
              {NOTIFICATIONS.map((n, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                  <span className={'text-sm shrink-0 ' + n.color}>{n.icon}</span>
                  <p className="flex-1 text-[11px] text-gray-800 dark:text-gray-200">{n.msg}</p>
                  <span className="text-[9px] text-gray-400 shrink-0">{n.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h4>
            <div className="grid grid-cols-3 gap-3">
              <Link to="/admin/qr/codes" className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 hover:border hover:border-orange-300 dark:hover:border-orange-500 transition-colors"><p className="text-[11px] font-medium text-gray-900 dark:text-white">Dynamic QR Codes</p><p className="text-[9px] text-gray-400 mt-0.5">Inspect QR lifecycle &amp; routing state</p></Link>
              <Link to="/admin/qr/routing" className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 hover:border hover:border-orange-300 dark:hover:border-orange-500 transition-colors"><p className="text-[11px] font-medium text-gray-900 dark:text-white">Routing Rules</p><p className="text-[9px] text-gray-400 mt-0.5">Review routes that produced events</p></Link>
              <Link to="/admin/qr/campaigns" className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 hover:border hover:border-orange-300 dark:hover:border-orange-500 transition-colors"><p className="text-[11px] font-medium text-gray-900 dark:text-white">QR Campaigns</p><p className="text-[9px] text-gray-400 mt-0.5">Open campaign assignment history</p></Link>
              <Link to="/admin/qr/assets" className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 hover:border hover:border-orange-300 dark:hover:border-orange-500 transition-colors"><p className="text-[11px] font-medium text-gray-900 dark:text-white">QR Assets</p><p className="text-[9px] text-gray-400 mt-0.5">Review asset generation &amp; downloads</p></Link>
              <Link to="/admin/qr/analytics" className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 hover:border hover:border-orange-300 dark:hover:border-orange-500 transition-colors"><p className="text-[11px] font-medium text-gray-900 dark:text-white">QR Analytics</p><p className="text-[9px] text-gray-400 mt-0.5">Performance — separate concern</p></Link>
              <button onClick={() => handleAction('Generating audit report...')} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-left hover:border hover:border-orange-300 dark:hover:border-orange-500 transition-colors"><p className="text-[11px] font-medium text-gray-900 dark:text-white">Generate Audit Report</p><p className="text-[9px] text-gray-400 mt-0.5">Full operational audit package</p></button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Permissions</h4>
            <div className="grid grid-cols-3 gap-3">
              {PERMISSIONS.map((p, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                  <span className={'w-2 h-2 rounded-full inline-block mb-1 ' + p.color} />
                  <p className="text-[11px] font-medium text-gray-900 dark:text-white">{p.role}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{p.scope}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-500/5 rounded-xl border border-amber-200 dark:border-amber-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300">Coming Soon — Advanced Activity</h4>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {COMING_SOON.map((c, i) => (
              <div key={i} className="bg-white dark:bg-gray-800/50 rounded-lg p-2.5 border border-amber-100 dark:border-amber-500/10">
                <div className="flex items-center gap-1 mb-1"><svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg><span className="text-[9px] font-medium text-amber-600 dark:text-amber-400">Coming Soon</span></div>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">{c}</p>
              </div>
            ))}
          </div>
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
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{event!.action}</h1>
            <p className="text-xs text-gray-500">{event!.eventId} · {event!.timestamp} · <CategoryBadge category={event!.category} /> · <ResultBadge result={event!.result} /></p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleAction('Opening QR ' + event!.qrId)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View QR</button>
          <button onClick={() => handleAction('Exporting record ' + event!.eventId)} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600">Export Record</button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-px">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setWorkspaceTab(t)} className={'px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ' + (workspaceTab === t ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}>{tabLabels[i]}</button>
        ))}
      </div>

      {workspaceTab === 'overview' && event && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Event Overview</h4>
          <div className="space-y-2 text-xs max-w-lg">
            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Event ID</span><span className="font-mono text-gray-900 dark:text-white">{event.eventId}</span></div>
            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Event Type</span><div className="flex items-center gap-1.5"><CategoryBadge category={event.category} /><span className="text-gray-900 dark:text-white">{event.action}</span></div></div>
            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Timestamp</span><span className="font-mono text-gray-500">{event.timestamp}</span></div>
            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Status</span><ResultBadge result={event.result} /></div>
            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Actor</span><div className="flex items-center gap-1.5"><ActorBadge actorRole={event.actorRole} /><span className="text-gray-900 dark:text-white">{event.performedBy}</span></div></div>
            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">QR Reference</span><span className="font-mono text-gray-900 dark:text-white">{event.qrId} — {event.qrName}</span></div>
            <div className="flex justify-between py-1"><span className="text-gray-500">Event Source</span><span className="text-gray-500">{event.source}</span></div>
          </div>
          <div className="mt-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-xs">
            <p className="text-[10px] text-gray-500 mb-1">Description</p>
            <p className="text-gray-700 dark:text-gray-300">{event.description}</p>
          </div>
        </div>
      )}

      {workspaceTab === 'details' && event && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Event Details — full payload without exposing raw database structures</h4>
          <div className="space-y-2 text-xs max-w-lg">
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Previous Value</span><span className="font-medium text-gray-900 dark:text-white text-right max-w-[320px]">{event.previous}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">New Value</span><span className="font-medium text-gray-900 dark:text-white text-right max-w-[320px]">{event.next}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Trigger</span><span className="font-medium text-gray-900 dark:text-white text-right max-w-[320px]">{event.trigger}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Reason</span><span className="font-medium text-gray-900 dark:text-white text-right max-w-[320px]">{event.reason}</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-500">Processing Time</span><span className="font-medium text-gray-900 dark:text-white">{event.processingTime}</span></div>
          </div>
          <div className="mt-3 bg-orange-50 dark:bg-orange-500/10 rounded-lg p-3 text-xs"><p className="text-[10px] text-orange-500 mb-1">Troubleshooting</p><p className="text-orange-800 dark:text-orange-300">This human-readable payload helps administrators diagnose issues — raw event structures remain internal to the Activity Engine.</p></div>
        </div>
      )}

      {workspaceTab === 'related' && event && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Related Resources</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3"><p className="text-[10px] text-gray-500 mb-1">Dynamic QR Code</p><p className="font-mono text-[11px] text-gray-900 dark:text-white mb-2">{event.qrId}</p><button onClick={() => handleAction('Opening Dynamic QR Code ' + event.qrId)} className="text-[9px] text-orange-600 hover:underline">View QR Code</button></div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3"><p className="text-[10px] text-gray-500 mb-1">Routing Rule</p><p className="text-[11px] text-gray-900 dark:text-white mb-2">{event.category === 'Routing' ? 'Route ' + event.previous + ' → ' + event.next : '—'}</p><button onClick={() => handleAction('Opening related routing rule')} className="text-[9px] text-orange-600 hover:underline">View Routing Rule</button></div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3"><p className="text-[10px] text-gray-500 mb-1">Campaign</p><p className="text-[11px] text-gray-900 dark:text-white mb-2">{event.category === 'Campaign' ? event.qrName : '—'}</p><button onClick={() => handleAction('Opening related campaign')} className="text-[9px] text-orange-600 hover:underline">View Campaign</button></div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3"><p className="text-[10px] text-gray-500 mb-1">QR Design Template</p><p className="text-[11px] text-gray-900 dark:text-white mb-2">{event.category === 'Administration' ? 'Brand preset updated' : 'Current template'}</p><button onClick={() => handleAction('Opening QR Design System')} className="text-[9px] text-orange-600 hover:underline">View Design Template</button></div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3"><p className="text-[10px] text-gray-500 mb-1">Generated Asset</p><p className="text-[11px] text-gray-900 dark:text-white mb-2">{event.category === 'Assets' || event.category === 'Downloads' ? 'Asset tied to event' : '—'}</p><button onClick={() => handleAction('Opening related asset')} className="text-[9px] text-orange-600 hover:underline">View Asset</button></div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3"><p className="text-[10px] text-gray-500 mb-1">Profile</p><p className="text-[11px] text-gray-900 dark:text-white mb-2">{event.owner} ({event.actorRole})</p><button onClick={() => handleAction('Opening profile ' + event.owner)} className="text-[9px] text-orange-600 hover:underline">View Profile</button></div>
          </div>
          <div className="mt-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-xs"><p className="text-[10px] text-gray-500 mb-1">Navigation</p><p className="text-gray-700 dark:text-gray-300">Jump from this audit record directly into the associated QR, routing rule, campaign, template, asset, or profile.</p></div>
        </div>
      )}

      {workspaceTab === 'history' && event && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Change History — before &amp; after</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
              <p className="text-[10px] font-medium text-gray-500 mb-2">Before</p>
              <p className="text-xs text-gray-800 dark:text-gray-200">{event.previous}</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-500/10 rounded-lg p-4">
              <p className="text-[10px] font-medium text-orange-600 mb-2">After</p>
              <p className="text-xs text-orange-800 dark:text-orange-300">{event.next}</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-3">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </div>
          <div className="mt-1 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-xs"><p className="text-[10px] text-gray-500 mb-1">Changed By</p><p className="text-gray-700 dark:text-gray-300">{event.performedBy} ({event.actorRole}) — {event.trigger}. Reason: {event.reason}.</p></div>
        </div>
      )}

      {workspaceTab === 'metadata' && event && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">System Metadata — diagnostic information</h4>
          <div className="space-y-2 text-xs max-w-lg">
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Event Source</span><span className="font-medium text-gray-900 dark:text-white">{event.source}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Processing Duration</span><span className="font-medium text-gray-900 dark:text-white">{event.processingTime}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Queue ID</span><span className="font-mono text-gray-900 dark:text-white">{event.queueId}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">Correlation ID</span><span className="font-mono text-gray-900 dark:text-white">{event.correlationId}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500">API Request ID</span><span className="font-mono text-gray-900 dark:text-white">{event.apiRequestId}</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-500">Service Version</span><span className="font-mono text-gray-900 dark:text-white">{event.serviceVersion}</span></div>
          </div>
          <div className="mt-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-xs"><p className="text-[10px] text-gray-500 mb-1">Restricted Information</p><p className="text-gray-700 dark:text-gray-300">Sensitive infrastructure details are visible only to authorised administrators (Super Admin, Security Administrator, Operations Manager).</p></div>
        </div>
      )}
    </div>
  )
}
