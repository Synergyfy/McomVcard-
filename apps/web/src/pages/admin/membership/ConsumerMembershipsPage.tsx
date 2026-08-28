import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface ProgressionMilestone {
  level: string
  date: string
  linkedBusiness: string
  reason: string
  method: 'Automatic' | 'Manual'
  admin?: string
}

interface OverrideRecord {
  id: number
  type: string
  value: string
  reason: string
  startDate: string
  endDate: string
  approvedBy: string
  autoExpiry: boolean
}

interface ActivityEntry {
  action: string
  date: string
  detail: string
}

interface FnFAllocation {
  type: string
  allowed: number
  used: number
  purchased: number
}

interface IntegrationStatus {
  platform: string
  status: string
}

interface ConsumerMembership {
  id: number
  consumerId: string
  name: string
  email: string
  mobile: string
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  status: 'Pending' | 'Active' | 'Inactive' | 'Suspended' | 'Expired' | 'Archived'
  linkedBusiness: string
  linkedBusinessId: string
  joinedDate: string
  lastActivity: string
  registrationDate: string
  lastProgressionDate: string
  progression: ProgressionMilestone[]
  overrides: OverrideRecord[]
  activity: ActivityEntry[]
  fnf: FnFAllocation[]
  integrations: IntegrationStatus[]
  vcardStatus: string
  vcardTheme: string
  vcardPublished: boolean
  vcardShareEnabled: boolean
  vcardExchangeEnabled: boolean
  vcardRedeemEnabled: boolean
  cardTemplate: string
  cardStatus: string
  cardIssueDate: string
  cardDigital: boolean
  cardECard: boolean
  totalShares: number
  totalExchanges: number
  totalRedeems: number
  totalQRScans: number
  activeConnections: number
}

const CONSUMERS: ConsumerMembership[] = [
  { id: 1, consumerId: 'CON-2026-0001', name: 'Emily Watson', email: 'emily.watson@email.com', mobile: '+1-555-1001', level: 'Platinum', status: 'Active', linkedBusiness: 'Oceanview Hotel & Spa', linkedBusinessId: 'BIZ-001', joinedDate: '2025-03-15', lastActivity: '2026-07-29', registrationDate: '2025-03-15', lastProgressionDate: '2026-06-10', progression: [{ level: 'Bronze', date: '2025-03-15', linkedBusiness: 'Oceanview Hotel & Spa', reason: 'Initial membership — Consumer VCard issued', method: 'Automatic' }, { level: 'Silver', date: '2025-08-20', linkedBusiness: 'Oceanview Hotel & Spa', reason: '5 VCard shares and 3 redemptions', method: 'Automatic' }, { level: 'Gold', date: '2026-02-14', linkedBusiness: 'Oceanview Hotel & Spa', reason: '10 redemptions and active wallet usage', method: 'Automatic' }, { level: 'Platinum', date: '2026-06-10', linkedBusiness: 'Oceanview Hotel & Spa', reason: 'VIP customer — 15+ redemptions, high engagement', method: 'Manual', admin: 'Admin' }], overrides: [], activity: [{ action: 'Membership Created', date: '2025-03-15', detail: 'Bronze membership via Oceanview Hotel & Spa' }, { action: 'Consumer VCard Published', date: '2025-03-20', detail: 'Default Bronze theme applied' }, { action: 'Promoted to Silver', date: '2025-08-20', detail: 'Automatic progression — engagement threshold met' }, { action: 'Promoted to Gold', date: '2026-02-14', detail: 'Automatic progression — 10 redemptions' }, { action: 'Promoted to Platinum', date: '2026-06-10', detail: 'Manual promotion — VIP customer' }], fnf: [{ type: 'Family', allowed: 3, used: 2, purchased: 0 }, { type: 'Friends', allowed: 5, used: 3, purchased: 0 }, { type: 'Additional Cards', allowed: 3, used: 1, purchased: 1 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }, { platform: 'MCOM Rewards', status: 'Coming Soon' }], vcardStatus: 'Published', vcardTheme: 'Platinum Premium', vcardPublished: true, vcardShareEnabled: true, vcardExchangeEnabled: true, vcardRedeemEnabled: true, cardTemplate: 'Platinum Card', cardStatus: 'Active', cardIssueDate: '2025-03-20', cardDigital: true, cardECard: true, totalShares: 28, totalExchanges: 12, totalRedeems: 18, totalQRScans: 45, activeConnections: 8 },
  { id: 2, consumerId: 'CON-2026-0002', name: 'James Rodriguez', email: 'james.r@email.com', mobile: '+1-555-1002', level: 'Gold', status: 'Active', linkedBusiness: 'Maple Leaf Dental Clinic', linkedBusinessId: 'BIZ-002', joinedDate: '2025-06-01', lastActivity: '2026-07-28', registrationDate: '2025-06-01', lastProgressionDate: '2026-04-15', progression: [{ level: 'Bronze', date: '2025-06-01', linkedBusiness: 'Maple Leaf Dental Clinic', reason: 'Consumer Card issued during visit', method: 'Automatic' }, { level: 'Silver', date: '2025-11-20', linkedBusiness: 'Maple Leaf Dental Clinic', reason: '3 referrals and regular engagement', method: 'Automatic' }, { level: 'Gold', date: '2026-04-15', linkedBusiness: 'Maple Leaf Dental Clinic', reason: 'Family plan enrollment + continued engagement', method: 'Automatic' }], overrides: [{ id: 1, type: 'Temporary Premium Theme', value: 'Gold Seasonal', reason: 'Loyalty appreciation', startDate: '2026-06-01', endDate: '2026-08-01', approvedBy: 'Support', autoExpiry: true }], activity: [{ action: 'Membership Created', date: '2025-06-01', detail: 'Bronze membership via Maple Leaf Dental Clinic' }, { action: 'Consumer Card Issued', date: '2025-06-05', detail: 'Digital card activated' }, { action: 'Promoted to Silver', date: '2025-11-20', detail: 'Automatic — 3 referrals' }, { action: 'Override Applied', date: '2026-06-01', detail: 'Temporary premium theme granted' }, { action: 'Promoted to Gold', date: '2026-04-15', detail: 'Automatic — family plan enrollment' }], fnf: [{ type: 'Family', allowed: 2, used: 2, purchased: 0 }, { type: 'Friends', allowed: 3, used: 1, purchased: 0 }, { type: 'Additional Cards', allowed: 2, used: 0, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTheme: 'Gold Standard', vcardPublished: true, vcardShareEnabled: true, vcardExchangeEnabled: true, vcardRedeemEnabled: true, cardTemplate: 'Gold Card', cardStatus: 'Active', cardIssueDate: '2025-06-05', cardDigital: true, cardECard: false, totalShares: 15, totalExchanges: 6, totalRedeems: 9, totalQRScans: 22, activeConnections: 5 },
  { id: 3, consumerId: 'CON-2026-0003', name: 'Sophia Kim', email: 'sophia.k@email.com', mobile: '+1-555-1003', level: 'Silver', status: 'Active', linkedBusiness: 'BrightFuture Academy', linkedBusinessId: 'BIZ-003', joinedDate: '2025-09-01', lastActivity: '2026-07-25', registrationDate: '2025-09-01', lastProgressionDate: '2026-03-10', progression: [{ level: 'Bronze', date: '2025-09-01', linkedBusiness: 'BrightFuture Academy', reason: 'Student membership — Consumer VCard issued', method: 'Automatic' }, { level: 'Silver', date: '2026-03-10', linkedBusiness: 'BrightFuture Academy', reason: '6 months active participation', method: 'Automatic' }], overrides: [], activity: [{ action: 'Membership Created', date: '2025-09-01', detail: 'Bronze membership via BrightFuture Academy' }, { action: 'Promoted to Silver', date: '2026-03-10', detail: 'Automatic — 6 months active' }], fnf: [{ type: 'Family', allowed: 2, used: 1, purchased: 0 }, { type: 'Friends', allowed: 2, used: 2, purchased: 0 }, { type: 'Additional Cards', allowed: 1, used: 0, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTheme: 'Silver Standard', vcardPublished: true, vcardShareEnabled: true, vcardExchangeEnabled: false, vcardRedeemEnabled: true, cardTemplate: 'Silver Card', cardStatus: 'Active', cardIssueDate: '2025-09-05', cardDigital: true, cardECard: false, totalShares: 8, totalExchanges: 2, totalRedeems: 4, totalQRScans: 12, activeConnections: 3 },
  { id: 4, consumerId: 'CON-2026-0004', name: 'Michael Chang', email: 'michael.chang@email.com', mobile: '+1-555-1004', level: 'Bronze', status: 'Active', linkedBusiness: 'Cornerstone Realty Group', linkedBusinessId: 'BIZ-004', joinedDate: '2026-02-01', lastActivity: '2026-07-20', registrationDate: '2026-02-01', lastProgressionDate: '2026-02-01', progression: [{ level: 'Bronze', date: '2026-02-01', linkedBusiness: 'Cornerstone Realty Group', reason: 'Property inquiry — Consumer VCard issued', method: 'Automatic' }], overrides: [], activity: [{ action: 'Membership Created', date: '2026-02-01', detail: 'Bronze membership via Cornerstone Realty Group' }, { action: 'VCard Shared', date: '2026-03-15', detail: 'First VCard share' }], fnf: [{ type: 'Family', allowed: 1, used: 0, purchased: 0 }, { type: 'Friends', allowed: 1, used: 0, purchased: 0 }, { type: 'Additional Cards', allowed: 0, used: 0, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTheme: 'Bronze Basic', vcardPublished: true, vcardShareEnabled: true, vcardExchangeEnabled: false, vcardRedeemEnabled: false, cardTemplate: 'Bronze Card', cardStatus: 'Active', cardIssueDate: '2026-02-05', cardDigital: true, cardECard: false, totalShares: 3, totalExchanges: 0, totalRedeems: 0, totalQRScans: 5, activeConnections: 1 },
  { id: 5, consumerId: 'CON-2026-0005', name: 'Olivia Thompson', email: 'olivia.t@email.com', mobile: '+1-555-1005', level: 'Gold', status: 'Active', linkedBusiness: 'Prestige Auto Dealership', linkedBusinessId: 'BIZ-017', joinedDate: '2025-11-15', lastActivity: '2026-07-29', registrationDate: '2025-11-15', lastProgressionDate: '2026-07-01', progression: [{ level: 'Bronze', date: '2025-11-15', linkedBusiness: 'Prestige Auto Dealership', reason: 'Vehicle purchase — Consumer Card issued', method: 'Automatic' }, { level: 'Silver', date: '2026-03-20', linkedBusiness: 'Prestige Auto Dealership', reason: 'Service visit engagement + referral', method: 'Automatic' }, { level: 'Gold', date: '2026-07-01', linkedBusiness: 'Prestige Auto Dealership', reason: 'High-value customer — multiple service bookings', method: 'Manual', admin: 'Operations Manager' }], overrides: [{ id: 2, type: 'Extra Friend Allocation', value: '+2 Friends', reason: 'VIP customer appreciation', startDate: '2026-07-01', endDate: '2026-10-01', approvedBy: 'Commercial Manager', autoExpiry: true }], activity: [{ action: 'Membership Created', date: '2025-11-15', detail: 'Bronze membership via Prestige Auto Dealership' }, { action: 'Consumer Card Issued', date: '2025-11-20', detail: 'Digital + physical card' }, { action: 'Promoted to Silver', date: '2026-03-20', detail: 'Automatic — service visit + referral' }, { action: 'Promoted to Gold', date: '2026-07-01', detail: 'Manual — VIP customer' }, { action: 'Override Applied', date: '2026-07-01', detail: 'Extra 2 friend allocations' }], fnf: [{ type: 'Family', allowed: 3, used: 2, purchased: 0 }, { type: 'Friends', allowed: 5, used: 2, purchased: 0 }, { type: 'Additional Cards', allowed: 3, used: 1, purchased: 1 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }, { platform: 'MCOM Rewards', status: 'Coming Soon' }], vcardStatus: 'Published', vcardTheme: 'Gold Standard', vcardPublished: true, vcardShareEnabled: true, vcardExchangeEnabled: true, vcardRedeemEnabled: true, cardTemplate: 'Gold Card', cardStatus: 'Active', cardIssueDate: '2025-11-20', cardDigital: true, cardECard: true, totalShares: 22, totalExchanges: 8, totalRedeems: 11, totalQRScans: 35, activeConnections: 6 },
  { id: 6, consumerId: 'CON-2026-0006', name: 'Ethan Brooks', email: 'ethan.b@email.com', mobile: '+1-555-1006', level: 'Bronze', status: 'Suspended', linkedBusiness: 'Harbor Logistics Inc.', linkedBusinessId: 'BIZ-009', joinedDate: '2026-04-01', lastActivity: '2026-05-15', registrationDate: '2026-04-01', lastProgressionDate: '2026-04-01', progression: [{ level: 'Bronze', date: '2026-04-01', linkedBusiness: 'Harbor Logistics Inc.', reason: 'Employment — Consumer VCard issued', method: 'Automatic' }], overrides: [], activity: [{ action: 'Membership Created', date: '2026-04-01', detail: 'Bronze membership via Harbor Logistics Inc.' }, { action: 'Membership Suspended', date: '2026-05-15', detail: 'Linked business suspended — membership frozen' }], fnf: [{ type: 'Family', allowed: 1, used: 0, purchased: 0 }, { type: 'Friends', allowed: 1, used: 0, purchased: 0 }, { type: 'Additional Cards', allowed: 0, used: 0, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Unpublished', vcardTheme: 'Bronze Basic', vcardPublished: false, vcardShareEnabled: false, vcardExchangeEnabled: false, vcardRedeemEnabled: false, cardTemplate: 'Bronze Card', cardStatus: 'Frozen', cardIssueDate: '2026-04-05', cardDigital: true, cardECard: false, totalShares: 1, totalExchanges: 0, totalRedeems: 0, totalQRScans: 2, activeConnections: 0 },
  { id: 7, consumerId: 'CON-2026-0007', name: 'Ava Martinez', email: 'ava.m@email.com', mobile: '+1-555-1007', level: 'Silver', status: 'Active', linkedBusiness: 'GreenLeaf Wellness Center', linkedBusinessId: 'BIZ-005', joinedDate: '2026-07-05', lastActivity: '2026-07-29', registrationDate: '2026-07-05', lastProgressionDate: '2026-07-05', progression: [{ level: 'Bronze', date: '2026-07-05', linkedBusiness: 'GreenLeaf Wellness Center', reason: 'New membership — trial period', method: 'Automatic' }], overrides: [], activity: [{ action: 'Membership Created', date: '2026-07-05', detail: 'Bronze membership via GreenLeaf Wellness Center (trial)' }], fnf: [{ type: 'Family', allowed: 1, used: 0, purchased: 0 }, { type: 'Friends', allowed: 1, used: 0, purchased: 0 }, { type: 'Additional Cards', allowed: 0, used: 0, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Draft', vcardTheme: 'Silver Standard', vcardPublished: false, vcardShareEnabled: false, vcardExchangeEnabled: false, vcardRedeemEnabled: false, cardTemplate: 'Silver Card', cardStatus: 'Pending', cardIssueDate: '', cardDigital: false, cardECard: false, totalShares: 0, totalExchanges: 0, totalRedeems: 0, totalQRScans: 0, activeConnections: 0 },
  { id: 8, consumerId: 'CON-2026-0008', name: 'Noah Wilson', email: 'noah.w@email.com', mobile: '+1-555-1008', level: 'Gold', status: 'Active', linkedBusiness: 'Summit Financial Advisors', linkedBusinessId: 'BIZ-008', joinedDate: '2025-01-10', lastActivity: '2026-07-28', registrationDate: '2025-01-10', lastProgressionDate: '2026-05-20', progression: [{ level: 'Bronze', date: '2025-01-10', linkedBusiness: 'Summit Financial Advisors', reason: 'Financial consultation — Consumer Card issued', method: 'Automatic' }, { level: 'Silver', date: '2025-07-15', linkedBusiness: 'Summit Financial Advisors', reason: '6 months active — 5 referrals', method: 'Automatic' }, { level: 'Gold', date: '2026-05-20', linkedBusiness: 'Summit Financial Advisors', reason: 'Premium client — high engagement', method: 'Manual', admin: 'Admin' }], overrides: [], activity: [{ action: 'Membership Created', date: '2025-01-10', detail: 'Bronze membership via Summit Financial Advisors' }, { action: 'Consumer Card Issued', date: '2025-01-15', detail: 'Digital card activated' }, { action: 'Promoted to Silver', date: '2025-07-15', detail: 'Automatic — 5 referrals' }, { action: 'Promoted to Gold', date: '2026-05-20', detail: 'Manual — premium client' }], fnf: [{ type: 'Family', allowed: 2, used: 2, purchased: 0 }, { type: 'Friends', allowed: 3, used: 1, purchased: 0 }, { type: 'Additional Cards', allowed: 2, used: 0, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }, { platform: 'MCOM Rewards', status: 'Coming Soon' }, { platform: 'MCOMMall Cashback', status: 'Coming Soon' }], vcardStatus: 'Published', vcardTheme: 'Gold Standard', vcardPublished: true, vcardShareEnabled: true, vcardExchangeEnabled: true, vcardRedeemEnabled: true, cardTemplate: 'Gold Card', cardStatus: 'Active', cardIssueDate: '2025-01-15', cardDigital: true, cardECard: true, totalShares: 35, totalExchanges: 14, totalRedeems: 22, totalQRScans: 58, activeConnections: 7 },
  { id: 9, consumerId: 'CON-2026-0009', name: 'Isabella Costa', email: 'isabella.c@email.com', mobile: '+1-555-1009', level: 'Bronze', status: 'Expired', linkedBusiness: 'Apex Fitness Studio', linkedBusinessId: 'BIZ-011', joinedDate: '2025-08-01', lastActivity: '2026-05-01', registrationDate: '2025-08-01', lastProgressionDate: '2025-08-01', progression: [{ level: 'Bronze', date: '2025-08-01', linkedBusiness: 'Apex Fitness Studio', reason: 'Gym membership — Consumer Card issued', method: 'Automatic' }], overrides: [], activity: [{ action: 'Membership Created', date: '2025-08-01', detail: 'Bronze membership via Apex Fitness Studio' }, { action: 'Membership Expired', date: '2026-06-01', detail: 'Linked business membership expired' }], fnf: [{ type: 'Family', allowed: 1, used: 1, purchased: 0 }, { type: 'Friends', allowed: 1, used: 0, purchased: 0 }, { type: 'Additional Cards', allowed: 0, used: 0, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Unpublished', vcardTheme: 'Bronze Basic', vcardPublished: false, vcardShareEnabled: false, vcardExchangeEnabled: false, vcardRedeemEnabled: false, cardTemplate: 'Bronze Card', cardStatus: 'Expired', cardIssueDate: '2025-08-05', cardDigital: true, cardECard: false, totalShares: 4, totalExchanges: 1, totalRedeems: 0, totalQRScans: 8, activeConnections: 0 },
  { id: 10, consumerId: 'CON-2026-0010', name: 'Liam Gallagher', email: 'liam.g@email.com', mobile: '+1-555-1010', level: 'Silver', status: 'Active', linkedBusiness: 'TechVantage Consulting', linkedBusinessId: 'BIZ-013', joinedDate: '2025-10-01', lastActivity: '2026-07-27', registrationDate: '2025-10-01', lastProgressionDate: '2026-04-01', progression: [{ level: 'Bronze', date: '2025-10-01', linkedBusiness: 'TechVantage Consulting', reason: 'Consulting engagement — Consumer VCard issued', method: 'Automatic' }, { level: 'Silver', date: '2026-04-01', linkedBusiness: 'TechVantage Consulting', reason: '6 months active — 4 referrals', method: 'Automatic' }], overrides: [], activity: [{ action: 'Membership Created', date: '2025-10-01', detail: 'Bronze membership via TechVantage Consulting' }, { action: 'Promoted to Silver', date: '2026-04-01', detail: 'Automatic — 4 referrals' }], fnf: [{ type: 'Family', allowed: 2, used: 1, purchased: 0 }, { type: 'Friends', allowed: 2, used: 2, purchased: 0 }, { type: 'Additional Cards', allowed: 1, used: 0, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTheme: 'Silver Pro Template', vcardPublished: true, vcardShareEnabled: true, vcardExchangeEnabled: true, vcardRedeemEnabled: true, cardTemplate: 'Silver Card', cardStatus: 'Active', cardIssueDate: '2025-10-05', cardDigital: true, cardECard: false, totalShares: 12, totalExchanges: 5, totalRedeems: 7, totalQRScans: 18, activeConnections: 4 },
  { id: 11, consumerId: 'CON-2026-0011', name: 'Charlotte Davis', email: 'charlotte.d@email.com', mobile: '+1-555-1011', level: 'Platinum', status: 'Active', linkedBusiness: 'Metro Transit Authority', linkedBusinessId: 'BIZ-015', joinedDate: '2026-01-15', lastActivity: '2026-07-29', registrationDate: '2026-01-15', lastProgressionDate: '2026-07-15', progression: [{ level: 'Bronze', date: '2026-01-15', linkedBusiness: 'Metro Transit Authority', reason: 'Public transport program enrollment', method: 'Automatic' }, { level: 'Silver', date: '2026-03-20', linkedBusiness: 'Metro Transit Authority', reason: 'Regular ridership — 3 months', method: 'Automatic' }, { level: 'Gold', date: '2026-06-01', linkedBusiness: 'Metro Transit Authority', reason: 'High usage — 50+ rides', method: 'Automatic' }, { level: 'Platinum', date: '2026-07-15', linkedBusiness: 'Metro Transit Authority', reason: 'Government partnership — complimentary upgrade', method: 'Manual', admin: 'Super Admin' }], overrides: [{ id: 3, type: 'Additional Consumer Card', value: '1 extra card', reason: 'Government program — household coverage', startDate: '2026-01-15', endDate: '2027-12-31', approvedBy: 'Super Admin', autoExpiry: true }], activity: [{ action: 'Membership Created', date: '2026-01-15', detail: 'Bronze membership via Metro Transit Authority' }, { action: 'Promoted to Silver', date: '2026-03-20', detail: 'Automatic — regular ridership' }, { action: 'Promoted to Gold', date: '2026-06-01', detail: 'Automatic — 50+ rides' }, { action: 'Promoted to Platinum', date: '2026-07-15', detail: 'Manual — government program' }], fnf: [{ type: 'Family', allowed: 5, used: 3, purchased: 0 }, { type: 'Friends', allowed: 5, used: 2, purchased: 0 }, { type: 'Additional Cards', allowed: 5, used: 2, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }, { platform: 'MCOM Rewards', status: 'Coming Soon' }, { platform: 'MCOMMall Cashback', status: 'Coming Soon' }, { platform: 'FundOrDonate', status: 'Coming Soon' }], vcardStatus: 'Published', vcardTheme: 'Platinum Premium', vcardPublished: true, vcardShareEnabled: true, vcardExchangeEnabled: true, vcardRedeemEnabled: true, cardTemplate: 'Platinum Card', cardStatus: 'Active', cardIssueDate: '2026-01-20', cardDigital: true, cardECard: true, totalShares: 42, totalExchanges: 18, totalRedeems: 25, totalQRScans: 72, activeConnections: 10 },
  { id: 12, consumerId: 'CON-2026-0012', name: 'William Taylor', email: 'william.t@email.com', mobile: '+1-555-1012', level: 'Bronze', status: 'Inactive', linkedBusiness: 'Blue Ocean Aquatics', linkedBusinessId: 'BIZ-014', joinedDate: '2026-03-01', lastActivity: '2026-04-15', registrationDate: '2026-03-01', lastProgressionDate: '2026-03-01', progression: [{ level: 'Bronze', date: '2026-03-01', linkedBusiness: 'Blue Ocean Aquatics', reason: 'Recreation membership — Consumer VCard issued', method: 'Automatic' }], overrides: [], activity: [{ action: 'Membership Created', date: '2026-03-01', detail: 'Bronze membership via Blue Ocean Aquatics' }, { action: 'Membership Inactive', date: '2026-04-15', detail: 'No activity for 30+ days' }], fnf: [{ type: 'Family', allowed: 1, used: 0, purchased: 0 }, { type: 'Friends', allowed: 1, used: 0, purchased: 0 }, { type: 'Additional Cards', allowed: 0, used: 0, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Unpublished', vcardTheme: 'Bronze Basic', vcardPublished: false, vcardShareEnabled: false, vcardExchangeEnabled: false, vcardRedeemEnabled: false, cardTemplate: 'Bronze Card', cardStatus: 'Inactive', cardIssueDate: '2026-03-05', cardDigital: true, cardECard: false, totalShares: 1, totalExchanges: 0, totalRedeems: 0, totalQRScans: 3, activeConnections: 0 },
  { id: 13, consumerId: 'CON-2026-0013', name: 'Amelia Clark', email: 'amelia.c@email.com', mobile: '+1-555-1013', level: 'Gold', status: 'Active', linkedBusiness: 'Phoenix Rising Construction', linkedBusinessId: 'BIZ-021', joinedDate: '2025-04-01', lastActivity: '2026-07-26', registrationDate: '2025-04-01', lastProgressionDate: '2026-06-15', progression: [{ level: 'Bronze', date: '2025-04-01', linkedBusiness: 'Phoenix Rising Construction', reason: 'Employee benefits — Consumer Card issued', method: 'Automatic' }, { level: 'Silver', date: '2025-10-01', linkedBusiness: 'Phoenix Rising Construction', reason: '6 months active participation', method: 'Automatic' }, { level: 'Gold', date: '2026-06-15', linkedBusiness: 'Phoenix Rising Construction', reason: 'Long-term engagement — 15+ redemptions', method: 'Automatic' }], overrides: [], activity: [{ action: 'Membership Created', date: '2025-04-01', detail: 'Bronze membership via Phoenix Rising Construction' }, { action: 'Promoted to Silver', date: '2025-10-01', detail: 'Automatic — 6 months active' }, { action: 'Promoted to Gold', date: '2026-06-15', detail: 'Automatic — 15+ redemptions' }], fnf: [{ type: 'Family', allowed: 2, used: 2, purchased: 0 }, { type: 'Friends', allowed: 3, used: 1, purchased: 0 }, { type: 'Additional Cards', allowed: 2, used: 0, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTheme: 'Gold Standard', vcardPublished: true, vcardShareEnabled: true, vcardExchangeEnabled: true, vcardRedeemEnabled: true, cardTemplate: 'Gold Card', cardStatus: 'Active', cardIssueDate: '2025-04-05', cardDigital: true, cardECard: false, totalShares: 18, totalExchanges: 7, totalRedeems: 16, totalQRScans: 30, activeConnections: 5 },
  { id: 14, consumerId: 'CON-2026-0014', name: 'Henry Nguyen', email: 'henry.n@email.com', mobile: '+1-555-1014', level: 'Silver', status: 'Active', linkedBusiness: 'Crystal Clear Optics', linkedBusinessId: 'BIZ-010', joinedDate: '2026-03-15', lastActivity: '2026-07-24', registrationDate: '2026-03-15', lastProgressionDate: '2026-03-15', progression: [{ level: 'Bronze', date: '2026-03-15', linkedBusiness: 'Crystal Clear Optics', reason: 'Eye care purchase — Consumer VCard issued', method: 'Automatic' }], overrides: [], activity: [{ action: 'Membership Created', date: '2026-03-15', detail: 'Bronze membership via Crystal Clear Optics' }, { action: 'VCard Shared', date: '2026-05-20', detail: 'First VCard share' }], fnf: [{ type: 'Family', allowed: 2, used: 1, purchased: 0 }, { type: 'Friends', allowed: 2, used: 1, purchased: 0 }, { type: 'Additional Cards', allowed: 1, used: 0, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTheme: 'Silver Pro Template', vcardPublished: true, vcardShareEnabled: true, vcardExchangeEnabled: false, vcardRedeemEnabled: false, cardTemplate: 'Silver Card', cardStatus: 'Active', cardIssueDate: '2026-03-18', cardDigital: true, cardECard: false, totalShares: 5, totalExchanges: 1, totalRedeems: 2, totalQRScans: 9, activeConnections: 2 },
  { id: 15, consumerId: 'CON-2026-0015', name: 'Ella Baker', email: 'ella.b@email.com', mobile: '+1-555-1015', level: 'Bronze', status: 'Pending', linkedBusiness: 'Starlight Events Planning', linkedBusinessId: 'BIZ-018', joinedDate: '', lastActivity: '', registrationDate: '', lastProgressionDate: '', progression: [], overrides: [], activity: [{ action: 'Membership Draft Created', date: '2026-07-28', detail: 'Pending assignment — awaiting business activation' }], fnf: [{ type: 'Family', allowed: 1, used: 0, purchased: 0 }, { type: 'Friends', allowed: 1, used: 0, purchased: 0 }, { type: 'Additional Cards', allowed: 0, used: 0, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Pending' }], vcardStatus: 'Not Started', vcardTheme: 'Bronze Basic', vcardPublished: false, vcardShareEnabled: false, vcardExchangeEnabled: false, vcardRedeemEnabled: false, cardTemplate: 'Bronze Card', cardStatus: 'Not Started', cardIssueDate: '', cardDigital: false, cardECard: false, totalShares: 0, totalExchanges: 0, totalRedeems: 0, totalQRScans: 0, activeConnections: 0 },
  { id: 16, consumerId: 'CON-2026-0016', name: 'Daniel Foster', email: 'daniel.f@email.com', mobile: '+1-555-1016', level: 'Silver', status: 'Active', linkedBusiness: 'Great Lakes Brewing Co.', linkedBusinessId: 'BIZ-024', joinedDate: '2025-12-01', lastActivity: '2026-07-28', registrationDate: '2025-12-01', lastProgressionDate: '2026-06-01', progression: [{ level: 'Bronze', date: '2025-12-01', linkedBusiness: 'Great Lakes Brewing Co.', reason: 'Loyalty program — Consumer Card issued', method: 'Automatic' }, { level: 'Silver', date: '2026-06-01', linkedBusiness: 'Great Lakes Brewing Co.', reason: '6 months active — 5 referrals', method: 'Automatic' }], overrides: [], activity: [{ action: 'Membership Created', date: '2025-12-01', detail: 'Bronze membership via Great Lakes Brewing Co.' }, { action: 'Consumer Card Issued', date: '2025-12-05', detail: 'Digital card activated' }, { action: 'Promoted to Silver', date: '2026-06-01', detail: 'Automatic — 5 referrals' }], fnf: [{ type: 'Family', allowed: 2, used: 1, purchased: 0 }, { type: 'Friends', allowed: 2, used: 1, purchased: 0 }, { type: 'Additional Cards', allowed: 1, used: 0, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTheme: 'Silver Pro Template', vcardPublished: true, vcardShareEnabled: true, vcardExchangeEnabled: true, vcardRedeemEnabled: true, cardTemplate: 'Silver Card', cardStatus: 'Active', cardIssueDate: '2025-12-05', cardDigital: true, cardECard: false, totalShares: 10, totalExchanges: 4, totalRedeems: 6, totalQRScans: 15, activeConnections: 3 },
  { id: 17, consumerId: 'CON-2026-0017', name: 'Mia Robinson', email: 'mia.r@email.com', mobile: '+1-555-1017', level: 'Platinum', status: 'Active', linkedBusiness: 'Summit Financial Advisors', linkedBusinessId: 'BIZ-008', joinedDate: '2024-09-01', lastActivity: '2026-07-29', registrationDate: '2024-09-01', lastProgressionDate: '2026-03-01', progression: [{ level: 'Bronze', date: '2024-09-01', linkedBusiness: 'Summit Financial Advisors', reason: 'Initial membership', method: 'Automatic' }, { level: 'Silver', date: '2025-03-01', linkedBusiness: 'Summit Financial Advisors', reason: '6 months active', method: 'Automatic' }, { level: 'Gold', date: '2025-10-01', linkedBusiness: 'Summit Financial Advisors', reason: '10+ referrals and high engagement', method: 'Automatic' }, { level: 'Platinum', date: '2026-03-01', linkedBusiness: 'Summit Financial Advisors', reason: 'Longest-standing consumer — 18 months active', method: 'Manual', admin: 'Admin' }], overrides: [], activity: [{ action: 'Membership Created', date: '2024-09-01', detail: 'Bronze membership via Summit Financial Advisors' }, { action: 'Promoted to Silver', date: '2025-03-01', detail: 'Automatic — 6 months' }, { action: 'Promoted to Gold', date: '2025-10-01', detail: 'Automatic — 10 referrals' }, { action: 'Promoted to Platinum', date: '2026-03-01', detail: 'Manual — longest-standing' }], fnf: [{ type: 'Family', allowed: 5, used: 4, purchased: 0 }, { type: 'Friends', allowed: 5, used: 3, purchased: 0 }, { type: 'Additional Cards', allowed: 5, used: 2, purchased: 1 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }, { platform: 'MCOM Rewards', status: 'Coming Soon' }, { platform: 'MCOMMall Cashback', status: 'Coming Soon' }], vcardStatus: 'Published', vcardTheme: 'Platinum Premium', vcardPublished: true, vcardShareEnabled: true, vcardExchangeEnabled: true, vcardRedeemEnabled: true, cardTemplate: 'Platinum Card', cardStatus: 'Active', cardIssueDate: '2024-09-05', cardDigital: true, cardECard: true, totalShares: 56, totalExchanges: 24, totalRedeems: 32, totalQRScans: 89, activeConnections: 12 },
  { id: 18, consumerId: 'CON-2026-0018', name: 'Lucas Wright', email: 'lucas.w@email.com', mobile: '+1-555-1018', level: 'Bronze', status: 'Active', linkedBusiness: 'Luna Beauty & Wellness', linkedBusinessId: 'BIZ-022', joinedDate: '2026-05-10', lastActivity: '2026-07-22', registrationDate: '2026-05-10', lastProgressionDate: '2026-05-10', progression: [{ level: 'Bronze', date: '2026-05-10', linkedBusiness: 'Luna Beauty & Wellness', reason: 'Beauty service — Consumer VCard issued', method: 'Automatic' }], overrides: [], activity: [{ action: 'Membership Created', date: '2026-05-10', detail: 'Bronze membership via Luna Beauty & Wellness' }], fnf: [{ type: 'Family', allowed: 1, used: 0, purchased: 0 }, { type: 'Friends', allowed: 1, used: 0, purchased: 0 }, { type: 'Additional Cards', allowed: 0, used: 0, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTheme: 'Bronze Basic', vcardPublished: true, vcardShareEnabled: true, vcardExchangeEnabled: false, vcardRedeemEnabled: false, cardTemplate: 'Bronze Card', cardStatus: 'Active', cardIssueDate: '2026-05-12', cardDigital: true, cardECard: false, totalShares: 2, totalExchanges: 0, totalRedeems: 0, totalQRScans: 4, activeConnections: 1 },
  { id: 19, consumerId: 'CON-2026-0019', name: 'Grace Anderson', email: 'grace.a@email.com', mobile: '+1-555-1019', level: 'Silver', status: 'Active', linkedBusiness: 'Northwest Community Health', linkedBusinessId: 'BIZ-019', joinedDate: '2026-05-15', lastActivity: '2026-07-28', registrationDate: '2026-05-15', lastProgressionDate: '2026-05-15', progression: [{ level: 'Bronze', date: '2026-05-15', linkedBusiness: 'Northwest Community Health', reason: 'Community health program enrollment', method: 'Automatic' }], overrides: [], activity: [{ action: 'Membership Created', date: '2026-05-15', detail: 'Bronze membership via Northwest Community Health' }, { action: 'Consumer Card Issued', date: '2026-05-20', detail: 'Digital card activated' }], fnf: [{ type: 'Family', allowed: 2, used: 1, purchased: 0 }, { type: 'Friends', allowed: 2, used: 0, purchased: 0 }, { type: 'Additional Cards', allowed: 1, used: 0, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTheme: 'Silver Standard', vcardPublished: true, vcardShareEnabled: true, vcardExchangeEnabled: false, vcardRedeemEnabled: true, cardTemplate: 'Silver Card', cardStatus: 'Active', cardIssueDate: '2026-05-20', cardDigital: true, cardECard: false, totalShares: 6, totalExchanges: 2, totalRedeems: 3, totalQRScans: 11, activeConnections: 2 },
  { id: 20, consumerId: 'CON-2026-0020', name: 'Benjamin Scott', email: 'benjamin.s@email.com', mobile: '+1-555-1020', level: 'Gold', status: 'Suspended', linkedBusiness: 'Evergreen Property Management', linkedBusinessId: 'BIZ-023', joinedDate: '2026-03-01', lastActivity: '2026-06-01', registrationDate: '2026-03-01', lastProgressionDate: '2026-03-01', progression: [{ level: 'Bronze', date: '2026-03-01', linkedBusiness: 'Evergreen Property Management', reason: 'Property rental — Consumer VCard issued', method: 'Automatic' }], overrides: [], activity: [{ action: 'Membership Created', date: '2026-03-01', detail: 'Bronze membership via Evergreen Property Management' }, { action: 'Membership Suspended', date: '2026-06-15', detail: 'Linked business suspended — membership frozen' }], fnf: [{ type: 'Family', allowed: 2, used: 1, purchased: 0 }, { type: 'Friends', allowed: 3, used: 0, purchased: 0 }, { type: 'Additional Cards', allowed: 2, used: 0, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Unpublished', vcardTheme: 'Gold Standard', vcardPublished: false, vcardShareEnabled: false, vcardExchangeEnabled: false, vcardRedeemEnabled: false, cardTemplate: 'Gold Card', cardStatus: 'Frozen', cardIssueDate: '2026-03-05', cardDigital: true, cardECard: false, totalShares: 7, totalExchanges: 3, totalRedeems: 5, totalQRScans: 14, activeConnections: 0 },
  { id: 21, consumerId: 'CON-2026-0021', name: 'Zoe Peterson', email: 'zoe.p@email.com', mobile: '+1-555-1021', level: 'Bronze', status: 'Active', linkedBusiness: 'Pinnacle Marketing Solutions', linkedBusinessId: 'BIZ-006', joinedDate: '2026-06-10', lastActivity: '2026-07-20', registrationDate: '2026-06-10', lastProgressionDate: '2026-06-10', progression: [{ level: 'Bronze', date: '2026-06-10', linkedBusiness: 'Pinnacle Marketing Solutions', reason: 'Marketing event — Consumer VCard issued', method: 'Automatic' }], overrides: [], activity: [{ action: 'Membership Created', date: '2026-06-10', detail: 'Bronze membership via Pinnacle Marketing Solutions' }], fnf: [{ type: 'Family', allowed: 1, used: 0, purchased: 0 }, { type: 'Friends', allowed: 1, used: 0, purchased: 0 }, { type: 'Additional Cards', allowed: 0, used: 0, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Draft', vcardTheme: 'Bronze Basic', vcardPublished: false, vcardShareEnabled: false, vcardExchangeEnabled: false, vcardRedeemEnabled: false, cardTemplate: 'Bronze Card', cardStatus: 'Pending', cardIssueDate: '', cardDigital: false, cardECard: false, totalShares: 0, totalExchanges: 0, totalRedeems: 0, totalQRScans: 1, activeConnections: 0 },
  { id: 22, consumerId: 'CON-2026-0022', name: 'Jackson Lee', email: 'jackson.l@email.com', mobile: '+1-555-1022', level: 'Silver', status: 'Active', linkedBusiness: 'Riverside Restaurant & Bar', linkedBusinessId: 'BIZ-007', joinedDate: '2026-05-01', lastActivity: '2026-07-28', registrationDate: '2026-05-01', lastProgressionDate: '2026-05-01', progression: [{ level: 'Bronze', date: '2026-05-01', linkedBusiness: 'Riverside Restaurant & Bar', reason: 'Dining loyalty — Consumer Card issued', method: 'Automatic' }], overrides: [], activity: [{ action: 'Membership Created', date: '2026-05-01', detail: 'Bronze membership via Riverside Restaurant & Bar' }, { action: 'Consumer Card Issued', date: '2026-05-05', detail: 'Digital card activated' }], fnf: [{ type: 'Family', allowed: 2, used: 1, purchased: 0 }, { type: 'Friends', allowed: 2, used: 1, purchased: 0 }, { type: 'Additional Cards', allowed: 1, used: 0, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTheme: 'Silver Standard', vcardPublished: true, vcardShareEnabled: true, vcardExchangeEnabled: true, vcardRedeemEnabled: true, cardTemplate: 'Silver Card', cardStatus: 'Active', cardIssueDate: '2026-05-05', cardDigital: true, cardECard: false, totalShares: 9, totalExchanges: 3, totalRedeems: 5, totalQRScans: 16, activeConnections: 3 },
  { id: 23, consumerId: 'CON-2026-0023', name: 'Aria Mitchell', email: 'aria.m@email.com', mobile: '+1-555-1023', level: 'Gold', status: 'Active', linkedBusiness: 'Prestige Auto Dealership', linkedBusinessId: 'BIZ-017', joinedDate: '2025-06-15', lastActivity: '2026-07-27', registrationDate: '2025-06-15', lastProgressionDate: '2026-05-01', progression: [{ level: 'Bronze', date: '2025-06-15', linkedBusiness: 'Prestige Auto Dealership', reason: 'Vehicle service — Consumer Card issued', method: 'Automatic' }, { level: 'Silver', date: '2025-12-01', linkedBusiness: 'Prestige Auto Dealership', reason: '5 referrals and regular service visits', method: 'Automatic' }, { level: 'Gold', date: '2026-05-01', linkedBusiness: 'Prestige Auto Dealership', reason: '10+ referrals — top referrer program', method: 'Automatic' }], overrides: [], activity: [{ action: 'Membership Created', date: '2025-06-15', detail: 'Bronze membership via Prestige Auto Dealership' }, { action: 'Promoted to Silver', date: '2025-12-01', detail: 'Automatic — 5 referrals' }, { action: 'Promoted to Gold', date: '2026-05-01', detail: 'Automatic — top referrer' }], fnf: [{ type: 'Family', allowed: 2, used: 1, purchased: 0 }, { type: 'Friends', allowed: 3, used: 3, purchased: 0 }, { type: 'Additional Cards', allowed: 2, used: 1, purchased: 1 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }, { platform: 'MCOM Rewards', status: 'Coming Soon' }], vcardStatus: 'Published', vcardTheme: 'Gold Standard', vcardPublished: true, vcardShareEnabled: true, vcardExchangeEnabled: true, vcardRedeemEnabled: true, cardTemplate: 'Gold Card', cardStatus: 'Active', cardIssueDate: '2025-06-20', cardDigital: true, cardECard: true, totalShares: 31, totalExchanges: 11, totalRedeems: 14, totalQRScans: 42, activeConnections: 7 },
  { id: 24, consumerId: 'CON-2026-0024', name: 'Oliver Harris', email: 'oliver.h@email.com', mobile: '+1-555-1024', level: 'Bronze', status: 'Active', linkedBusiness: 'Heritage Bookstore & Cafe', linkedBusinessId: 'BIZ-012', joinedDate: '2026-06-20', lastActivity: '2026-07-25', registrationDate: '2026-06-20', lastProgressionDate: '2026-06-20', progression: [{ level: 'Bronze', date: '2026-06-20', linkedBusiness: 'Heritage Bookstore & Cafe', reason: 'Cafe loyalty — Consumer VCard issued', method: 'Automatic' }], overrides: [], activity: [{ action: 'Membership Created', date: '2026-06-20', detail: 'Bronze membership via Heritage Bookstore & Cafe' }], fnf: [{ type: 'Family', allowed: 1, used: 0, purchased: 0 }, { type: 'Friends', allowed: 1, used: 0, purchased: 0 }, { type: 'Additional Cards', allowed: 0, used: 0, purchased: 0 }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTheme: 'Bronze Basic', vcardPublished: true, vcardShareEnabled: true, vcardExchangeEnabled: false, vcardRedeemEnabled: false, cardTemplate: 'Bronze Card', cardStatus: 'Active', cardIssueDate: '2026-06-22', cardDigital: true, cardECard: false, totalShares: 1, totalExchanges: 0, totalRedeems: 0, totalQRScans: 2, activeConnections: 1 },
]

const LEVELS = ['All', 'Bronze', 'Silver', 'Gold', 'Platinum']
const STATUSES = ['All', 'Active', 'Pending', 'Inactive', 'Suspended', 'Expired', 'Archived']
const JOIN_PERIODS = ['All', 'Today', 'This Week', 'This Month', 'Custom']

function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    'Bronze': 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
    'Silver': 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300',
    'Gold': 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    'Platinum': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
  }
  return <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${colors[level] || 'bg-gray-100 text-gray-600'}`}>{level}</span>
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Active': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Pending': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Inactive': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
    'Suspended': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Expired': 'bg-gray-100 dark:bg-gray-500/20 text-gray-500',
    'Archived': 'bg-gray-100 dark:bg-gray-500/20 text-gray-500',
  }
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[status] || 'bg-gray-50 text-gray-600'}`}>{status}</span>
}

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
      <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[9px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
        {options.map((o) => <option key={o} value={o === 'All' ? '' : o}>{o}</option>)}
      </select>
    </div>
  )
}

const BUSINESS_NAMES = [...new Set(CONSUMERS.map(c => c.linkedBusiness))]

export default function ConsumerMembershipsPage() {
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [businessFilter, setBusinessFilter] = useState('')
  const [joinFilter, setJoinFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [workspace, setWorkspace] = useState<ConsumerMembership | null>(null)
  const [tab, setTab] = useState('overview')
  const [showOverrideForm, setShowOverrideForm] = useState(false)
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  const filtered = CONSUMERS.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.consumerId.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase()) && !c.linkedBusiness.toLowerCase().includes(search.toLowerCase())) return false
    if (levelFilter && c.level !== levelFilter) return false
    if (statusFilter && c.status !== statusFilter) return false
    if (businessFilter && c.linkedBusiness !== businessFilter) return false
    return true
  })

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleSelectAll = () => setSelectedIds(prev => prev.length === filtered.length ? [] : filtered.map(c => c.id))
  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) { toast.error('No consumers selected'); return }
    toast.success(`${action} applied to ${selectedIds.length} consumer(s)`)
    setSelectedIds([])
  }

  const countByLevel = (l: string) => CONSUMERS.filter(c => c.level === l).length
  const countByStatus = (s: string) => CONSUMERS.filter(c => c.status === s).length
  const totalVCards = CONSUMERS.reduce((s, c) => s + (c.vcardPublished ? 1 : 0), 0)
  const totalCards = CONSUMERS.reduce((s, c) => s + (c.cardStatus === 'Active' ? 1 : 0), 0)
  const totalECards = CONSUMERS.reduce((s, c) => s + (c.cardECard ? 1 : 0), 0)
  const uniqueBusinesses = new Set(CONSUMERS.filter(c => c.status === 'Active').map(c => c.linkedBusiness)).size
  const avgPerBusiness = uniqueBusinesses > 0 ? Math.round(CONSUMERS.filter(c => c.status === 'Active').length / uniqueBusinesses) : 0

  const today = new Date()
  const newToday = CONSUMERS.filter(c => c.joinedDate && Math.abs(new Date(c.joinedDate).getTime() - today.getTime()) < 86400000).length
  const thisWeek = CONSUMERS.filter(c => c.joinedDate && Math.abs(new Date(c.joinedDate).getTime() - today.getTime()) < 7 * 86400000).length
  const thisMonth = CONSUMERS.filter(c => c.joinedDate && Math.abs(new Date(c.joinedDate).getTime() - today.getTime()) < 30 * 86400000).length
  const bronzeToSilver = CONSUMERS.filter(c => c.progression.some((p, i) => i > 0 && p.level === 'Silver')).length
  const silverToGold = CONSUMERS.filter(c => c.progression.some((p, i) => i > 0 && p.level === 'Gold')).length
  const goldToPlatinum = CONSUMERS.filter(c => c.progression.some((p, i) => i > 0 && p.level === 'Platinum')).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 animate-pulse"><div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" /><div className="h-3 w-64 bg-gray-200 dark:bg-gray-700 rounded" /></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 animate-pulse"><div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" /><div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1" /><div className="h-2 w-28 bg-gray-200 dark:bg-gray-700 rounded" /></div>)}</div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 animate-pulse"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4" /><div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" /></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2">Unable to load Consumer Memberships</h3>
          <p className="text-[10px] text-gray-500 mb-4">{error}</p>
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => window.location.reload()} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Retry</button>
            <button onClick={() => toast.success('System status check initiated')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View System Status</button>
          </div>
        </div>
      </div>
    )
  }

  if (workspace) {
    const c = workspace
    return (
      <div className="space-y-6">
        <Helmet><title>{c.name} - Consumer Membership - MCOM VCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setWorkspace(null)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex items-center gap-2">
              <Link to="/admin" className="text-[10px] text-orange-600 hover:underline">Dashboard</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <Link to="/admin/membership/consumer-memberships" className="text-[10px] text-orange-600 hover:underline">Consumer Memberships</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">{c.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <LevelBadge level={c.level} />
            <StatusBadge status={c.status} />
            <span className="text-[9px] text-gray-400">ID: {c.consumerId}</span>
            <span className="text-[9px] text-gray-400">via {c.linkedBusiness}</span>
            {c.joinedDate && <span className="text-[9px] text-gray-400">Since {c.joinedDate}</span>}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'membership', label: 'Membership' },
              { key: 'vcard', label: 'Consumer VCard' },
              { key: 'card', label: 'Consumer Card' },
              { key: 'fnf', label: 'Friends & Family' },
              { key: 'progression', label: 'Progression' },
              { key: 'activity', label: 'Activity' },
              { key: 'overrides', label: 'Overrides' },
              { key: 'business', label: 'Linked Business' },
              { key: 'integrations', label: 'Future Integrations' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2.5 text-[10px] font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t.key ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === 'overview' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div>
                    <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Consumer Information</h4>
                    <div className="space-y-1.5">
                      {[
                        { label: 'Name', value: c.name },
                        { label: 'Consumer ID', value: c.consumerId },
                        { label: 'Email', value: c.email },
                        { label: 'Mobile', value: c.mobile },
                        { label: 'Registration Date', value: c.registrationDate || 'N/A' },
                      ].map(d => (
                        <div key={d.label} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                          <span className="text-[10px] text-gray-500">{d.label}</span>
                          <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Membership Summary</h4>
                    <div className="space-y-1.5">
                      {[
                        { label: 'Current Level', value: c.level },
                        { label: 'Status', value: c.status },
                        { label: 'Linked Business', value: c.linkedBusiness },
                        { label: 'Membership Since', value: c.joinedDate || 'N/A' },
                        { label: 'Last Progression', value: c.lastProgressionDate || 'N/A' },
                      ].map(d => (
                        <div key={d.label} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                          <span className="text-[10px] text-gray-500">{d.label}</span>
                          <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Statistics</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: 'VCard Status', value: c.vcardStatus },
                      { label: 'Card Status', value: c.cardStatus },
                      { label: 'Total Shares', value: String(c.totalShares) },
                      { label: 'Total Exchanges', value: String(c.totalExchanges) },
                      { label: 'Total Redeems', value: String(c.totalRedeems) },
                      { label: 'QR Scans', value: String(c.totalQRScans) },
                      { label: 'Active Connections', value: String(c.activeConnections) },
                      { label: 'Progression Steps', value: String(c.progression.length) },
                    ].map(d => (
                      <div key={d.label} className="px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-center">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{d.value}</p>
                        <p className="text-[9px] text-gray-500">{d.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'membership' && (
              <div className="space-y-5 max-w-xl">
                <div className="space-y-1.5">
                  {[
                    { label: 'Current Level', value: c.level },
                    { label: 'Entry Method', value: c.progression.length > 0 ? `Issued via ${c.progression[0].linkedBusiness}` : 'Pending' },
                    { label: 'Assigned Business', value: c.linkedBusiness },
                    { label: 'Current Benefits', value: c.level === 'Platinum' ? 'Full access — all features, premium themes, eCards, unlimited sharing' : c.level === 'Gold' ? 'Premium features, sharing, redeems, F&F allocations' : c.level === 'Silver' ? 'Standard features, limited F&F, basic analytics' : 'Basic VCard, Card, limited sharing' },
                    { label: 'Expiry Rules', value: c.status === 'Expired' ? 'Expired — requires reactivation' : c.status === 'Suspended' ? 'Suspended — linked business issue' : 'No expiry (active membership)' },
                  ].map(d => (
                    <div key={d.label} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="text-[10px] text-gray-500">{d.label}</span>
                      <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 max-w-[300px] text-right">{d.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button onClick={() => toast.success(`${c.name}: Upgrade flow opened`)} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Upgrade</button>
                  <button onClick={() => toast.success(`${c.name}: Downgrade flow opened`)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Downgrade</button>
                  <button onClick={() => toast.success(`${c.name}: Suspended`)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">Suspend</button>
                  {c.status === 'Suspended' && <button onClick={() => toast.success(`${c.name}: Reinstated`)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10">Reinstate</button>}
                  <button onClick={() => toast.success(`${c.name}: Progression reset`)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reset Progression</button>
                  <button onClick={() => toast.success('Transfer business flow opened')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Transfer Business</button>
                </div>
              </div>
            )}

            {tab === 'vcard' && (
              <div className="space-y-5 max-w-lg">
                <div className="space-y-1.5">
                  {[
                    { label: 'Current Theme', value: c.vcardTheme },
                    { label: 'Published Status', value: c.vcardStatus },
                    { label: 'Share Enabled', value: c.vcardShareEnabled ? 'Yes' : 'No' },
                    { label: 'Exchange Enabled', value: c.vcardExchangeEnabled ? 'Yes' : 'No' },
                    { label: 'Redeem Enabled', value: c.vcardRedeemEnabled ? 'Yes' : 'No' },
                  ].map(d => (
                    <div key={d.label} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="text-[10px] text-gray-500">{d.label}</span>
                      <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{d.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button onClick={() => toast.success(`Opening ${c.name}'s VCard...`)} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Open VCard</button>
                  <button onClick={() => toast.success('Opening preview...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Preview</button>
                  <button onClick={() => toast.success('VCard republished')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Republish</button>
                  <button onClick={() => toast.success('Opening QR code...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View QR</button>
                </div>
              </div>
            )}

            {tab === 'card' && (
              <div className="space-y-5 max-w-lg">
                <div className="space-y-1.5">
                  {[
                    { label: 'Assigned Template', value: c.cardTemplate },
                    { label: 'Card Status', value: c.cardStatus },
                    { label: 'Digital Card', value: c.cardDigital ? 'Active' : 'Not issued' },
                    { label: 'eCard', value: c.cardECard ? 'Active' : 'Not available' },
                    { label: 'Issue Date', value: c.cardIssueDate || 'N/A' },
                  ].map(d => (
                    <div key={d.label} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="text-[10px] text-gray-500">{d.label}</span>
                      <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{d.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button onClick={() => toast.success(`Opening ${c.name}'s Card...`)} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Open Card</button>
                  <button onClick={() => toast.success('Card replacement initiated')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Replace Card</button>
                  <button onClick={() => toast.success('Card reissued')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reissue Card</button>
                </div>
              </div>
            )}

            {tab === 'fnf' && (
              <div className="space-y-5 max-w-lg">
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Friends & Family Allocations</h4>
                <div className="space-y-2">
                  {c.fnf.map(f => (
                    <div key={f.type} className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{f.type}</span>
                        <span className="text-[9px] text-gray-500">{f.used} / {f.allowed} used{f.purchased > 0 ? ` · ${f.purchased} purchased` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${f.used >= f.allowed ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(f.used / (f.allowed || 1) * 100, 100)}%` }} />
                        </div>
                        <span className="text-[9px] text-gray-500 font-mono">{f.allowed - f.used} remaining</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button onClick={() => toast.success('Allocation added')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Add Allocation</button>
                  <button onClick={() => toast.success('Allocation removed')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Remove Allocation</button>
                  <button onClick={() => toast.success('Card revoked')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">Revoke Card</button>
                </div>
              </div>
            )}

            {tab === 'progression' && (
              <div className="space-y-5 max-w-xl">
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Membership Journey</h4>
                {c.progression.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/20 rounded-xl">
                    <p className="text-[10px] text-gray-400">No progression recorded. Consumer membership is pending activation.</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600" />
                    <div className="space-y-4">
                      {c.progression.map((p, i) => (
                        <div key={i} className="relative pl-10">
                          <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-white ${p.level === 'Platinum' ? 'bg-blue-500' : p.level === 'Gold' ? 'bg-yellow-500' : p.level === 'Silver' ? 'bg-gray-400' : 'bg-amber-600'}`} />
                          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-0.5">
                              <LevelBadge level={p.level} />
                              <span className="text-[9px] text-gray-400">{p.date}</span>
                              <span className={`text-[9px] px-1 py-0.5 rounded ${p.method === 'Manual' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'bg-green-50 dark:bg-green-500/10 text-green-600'}`}>{p.method}</span>
                              {p.admin && <span className="text-[9px] text-gray-400">by {p.admin}</span>}
                            </div>
                            <p className="text-[10px] text-gray-600 dark:text-gray-400">{p.reason}</p>
                            <p className="text-[9px] text-gray-400 mt-0.5">via {p.linkedBusiness}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-2">Future Progression</h4>
                <div className="space-y-1.5">
                  {[
                    { label: 'Rewards Integration', status: 'Coming Soon' },
                    { label: 'Cashback Activity', status: 'Coming Soon' },
                    { label: 'Shopping Activity', status: 'Coming Soon' },
                    { label: 'Campaign Participation', status: 'Coming Soon' },
                    { label: 'Referrals', status: 'Coming Soon' },
                  ].map(fp => (
                    <div key={fp.label} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg opacity-60">
                      <span className="text-[10px] text-gray-500">{fp.label}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-500">Coming Soon</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button onClick={() => toast.success(`${c.name}: Promote flow opened`)} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Promote</button>
                  <button onClick={() => toast.success(`${c.name}: Demote flow opened`)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Demote</button>
                  <button onClick={() => toast.success(`${c.name}: Progression reset`)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reset</button>
                  <button onClick={() => toast.success('Progression paused')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Pause Progression</button>
                </div>
              </div>
            )}

            {tab === 'activity' && (
              <div className="space-y-3 max-w-xl">
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Activity Timeline</h4>
                {c.activity.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/20 rounded-xl">
                    <p className="text-[10px] text-gray-400">No activity recorded.</p>
                  </div>
                ) : (
                  c.activity.map((entry, i) => (
                    <div key={i} className="flex items-start gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{entry.action}</span>
                          <span className="text-[9px] text-gray-400 ml-auto">{entry.date}</span>
                        </div>
                        <p className="text-[9px] text-gray-500 mt-0.5">{entry.detail}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'overrides' && (
              <div className="space-y-5 max-w-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Consumer Overrides</h4>
                  <button onClick={() => setShowOverrideForm(!showOverrideForm)} className="px-2 py-1 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">+ Add Override</button>
                </div>
                {showOverrideForm && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <select className="text-[10px] border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500">
                        <option>Temporary Premium Theme</option><option>Extra Friend Allocation</option><option>Additional Consumer Card</option><option>Temporary Higher Membership</option><option>Extra Sharing Privileges</option>
                      </select>
                      <input type="text" placeholder="Value" className="text-[10px] border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-500" />
                    </div>
                    <input type="text" placeholder="Reason for override" className="w-full text-[10px] border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-500" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="date" defaultValue="2026-08-01" className="text-[10px] border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500" />
                      <input type="date" defaultValue="2026-09-01" className="text-[10px] border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-[10px] text-gray-500">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 accent-orange-500 w-3 h-3" /> Auto-expire
                      </label>
                      <div className="flex gap-2">
                        <button onClick={() => { setShowOverrideForm(false); toast.success('Override applied') }} className="px-2 py-1 rounded bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Apply</button>
                        <button onClick={() => setShowOverrideForm(false)} className="px-2 py-1 rounded border border-gray-200 dark:border-gray-600 text-[10px] text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
                {c.overrides.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/20 rounded-xl">
                    <p className="text-[10px] text-gray-400">No overrides applied. Use overrides for temporary benefit changes without altering the membership level.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {c.overrides.map(o => (
                      <div key={o.id} className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{o.type}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600">{o.value}</span>
                            {o.autoExpiry && <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-50 dark:bg-green-500/10 text-green-600">Auto-expires</span>}
                          </div>
                          <span className="text-[9px] text-gray-400">by {o.approvedBy}</span>
                        </div>
                        <p className="text-[9px] text-gray-500">{o.reason}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-gray-400">{o.startDate} → {o.endDate}</span>
                          <button onClick={() => toast.success('Override removed')} className="text-[9px] px-1.5 py-0.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'business' && (
              <div className="space-y-5 max-w-lg">
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Linked Business Details</h4>
                <div className="space-y-1.5">
                  {[
                    { label: 'Business Name', value: c.linkedBusiness },
                    { label: 'Business ID', value: c.linkedBusinessId },
                    { label: 'Date Linked', value: c.joinedDate || 'N/A' },
                    { label: 'Current Status', value: c.status === 'Active' ? 'Active — linked business active' : c.status === 'Suspended' ? 'Suspended — linked business suspended' : c.status === 'Expired' ? 'Expired — linked business expired' : c.status },
                    { label: 'Allocation Source', value: `${c.level} membership — Consumer ${c.cardStatus === 'Active' ? 'Card' : 'VCard'} issued` },
                  ].map(d => (
                    <div key={d.label} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="text-[10px] text-gray-500">{d.label}</span>
                      <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{d.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button onClick={() => toast.success(`Opening ${c.linkedBusiness} profile...`)} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Open Business Profile</button>
                  <button onClick={() => toast.success(`Opening ${c.linkedBusiness} membership...`)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View Business Membership</button>
                  <button onClick={() => toast.success('Showing allocation usage...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View Allocation Usage</button>
                </div>
              </div>
            )}

            {tab === 'integrations' && (
              <div className="space-y-5 max-w-lg">
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Integration Status</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                        <th className="text-left px-2 py-1.5 font-medium">Platform</th>
                        <th className="text-left px-2 py-1.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.integrations.map(int => (
                        <tr key={int.platform} className="border-b border-gray-50 dark:border-gray-700/50">
                          <td className="px-2 py-2 text-gray-900 dark:text-white">{int.platform}</td>
                          <td className="px-2 py-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${int.status === 'Connected' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600'}`}>{int.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-3 flex items-start gap-2">
                  <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400">No integrations are active at the consumer level yet. MCOM Rewards, Cashback, FundOrDonate, Spin, and Affiliate will appear here when ready.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (CONSUMERS.length === 0) {
    return (
      <div className="space-y-6">
        <Helmet><title>Consumer Memberships - MCOM VCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin" className="text-[10px] text-orange-600 hover:underline">Dashboard</Link>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Consumer Memberships</h1>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2">No Consumer Memberships Found</h3>
          <p className="text-[10px] text-gray-500 mb-5">Consumer memberships will appear when businesses issue Consumer VCards or Consumer Cards.</p>
          <Link to="/admin/membership/business-memberships" className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 inline-flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            View Businesses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Helmet><title>Consumer Memberships - MCOM VCard</title></Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/admin" className="text-[10px] text-orange-600 hover:underline">Dashboard</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">Consumer Memberships</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Consumers participate in memberships through businesses — earned, assigned, progressed.</p>
          </div>
          <button onClick={() => toast.success('Membership lifecycle scan initiated')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Lifecycle Scan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Total Consumers" value={String(CONSUMERS.length)} sub={`${countByStatus('Active')} Active · ${countByStatus('Pending')} Pending · ${countByStatus('Suspended')} Suspended · ${countByStatus('Expired')} Expired`} color="text-gray-900 dark:text-white" />
        <KpiCard label="Distribution" value={`${countByLevel('Bronze')} · ${countByLevel('Silver')} · ${countByLevel('Gold')} · ${countByLevel('Platinum')}`} sub="Bronze · Silver · Gold · Platinum" color="text-blue-600" />
        <KpiCard label="New Consumers" value={String(thisMonth)} sub={`${newToday} Today · ${thisWeek} This Week · ${thisMonth} This Month`} color="text-green-600" />
        <KpiCard label="Progression Activity" value={String(bronzeToSilver + silverToGold + goldToPlatinum)} sub={`${bronzeToSilver} Bronze→Silver · ${silverToGold} Silver→Gold · ${goldToPlatinum} Gold→Platinum`} color="text-purple-600" />
        <KpiCard label="Linked Businesses" value={String(uniqueBusinesses)} sub={`${avgPerBusiness} avg consumers per business`} color="text-orange-600" />
        <KpiCard label="Active Cards" value={String(totalVCards + totalCards)} sub={`${totalVCards} VCards · ${totalCards} Cards · ${totalECards} eCards`} color="text-emerald-600" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search by name, ID, email, phone, linked business..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg pl-9 pr-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <FilterSelect label="Level" value={levelFilter} options={LEVELS} onChange={setLevelFilter} />
          <FilterSelect label="Status" value={statusFilter} options={STATUSES} onChange={setStatusFilter} />
          <FilterSelect label="Business" value={businessFilter} options={['All', ...BUSINESS_NAMES]} onChange={setBusinessFilter} />
          <FilterSelect label="Joined" value={joinFilter} options={JOIN_PERIODS} onChange={setJoinFilter} />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
            <span className="text-[10px] text-orange-600 font-medium">{selectedIds.length} selected</span>
            <div className="flex-1" />
            {['Upgrade Level', 'Suspend', 'Reactivate', 'Transfer Business', 'Export', 'Promotional Override'].map(action => (
              <button key={action} onClick={() => handleBulkAction(action)} className="text-[10px] px-2 py-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{action}</button>
            ))}
            <button onClick={() => setSelectedIds([])} className="text-[10px] px-2 py-1 rounded text-gray-500 hover:text-gray-700">Clear</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-2 py-1.5 w-8"><input type="checkbox" checked={filtered.length > 0 && selectedIds.length === filtered.length} onChange={toggleSelectAll} className="rounded border-gray-300 accent-orange-500 w-3 h-3" /></th>
                <th className="text-left px-2 py-1.5 font-medium">Consumer</th>
                <th className="text-left px-2 py-1.5 font-medium">Consumer ID</th>
                <th className="text-left px-2 py-1.5 font-medium">Level</th>
                <th className="text-left px-2 py-1.5 font-medium">Linked Business</th>
                <th className="text-left px-2 py-1.5 font-medium">Status</th>
                <th className="text-left px-2 py-1.5 font-medium">Joined</th>
                <th className="text-left px-2 py-1.5 font-medium">Last Activity</th>
                <th className="text-left px-2 py-1.5 font-medium">VCard</th>
                <th className="text-left px-2 py-1.5 font-medium">Card</th>
                <th className="text-left px-2 py-1.5 font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20 cursor-pointer" onClick={() => setWorkspace(c)}>
                  <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-gray-300 accent-orange-500 w-3 h-3" /></td>
                  <td className="px-2 py-2">
                    <div>
                      <p className="text-[10px] font-medium text-gray-900 dark:text-white">{c.name}</p>
                      <p className="text-[9px] text-gray-400">{c.email}</p>
                    </div>
                  </td>
                  <td className="px-2 py-2 font-mono text-gray-500">{c.consumerId}</td>
                  <td className="px-2 py-2"><LevelBadge level={c.level} /></td>
                  <td className="px-2 py-2 text-gray-700 dark:text-gray-300">{c.linkedBusiness}</td>
                  <td className="px-2 py-2"><StatusBadge status={c.status} /></td>
                  <td className="px-2 py-2 text-gray-500">{c.joinedDate || '-'}</td>
                  <td className="px-2 py-2 text-gray-500">{c.lastActivity || '-'}</td>
                  <td className="px-2 py-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${c.vcardPublished ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-gray-50 dark:bg-gray-500/10 text-gray-500'}`}>
                      {c.vcardPublished ? 'Published' : c.vcardStatus}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${c.cardStatus === 'Active' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-gray-50 dark:bg-gray-500/10 text-gray-500'}`}>
                      {c.cardStatus}
                    </span>
                  </td>
                  <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setWorkspace(c)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="View"><svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                      <button onClick={() => toast.success(`Editing ${c.name}`)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Edit"><svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                      <button onClick={() => toast.success(`Change level for ${c.name}`)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Change Level"><svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8"><p className="text-[10px] text-gray-400">No consumers match your filters.</p></div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-[9px] text-gray-400">Showing {filtered.length} of {CONSUMERS.length} consumers</span>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button>
            <span className="text-[10px] text-gray-500 px-2">1 / 3</span>
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
          </div>
        </div>
      </div>
    </div>
  )
}
