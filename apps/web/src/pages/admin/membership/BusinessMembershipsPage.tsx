import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface AllocationUsage {
  bizVCards: { used: number; total: number }
  bizCards: { used: number; total: number }
  conVCards: { used: number; total: number }
  conCards: { used: number; total: number }
  fnf: { used: number; total: number }
  additionalCards: { used: number; total: number; purchased: number }
}

interface OverrideRecord {
  id: string
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

interface BusinessMembership {
  id: string
  membershipId: string
  businessName: string
  businessId: string
  businessOwner: string
  ownerEmail: string
  ownerPhone: string
  industry: string
  plan: string
  status: 'Draft' | 'Trial' | 'Active' | 'Grace Period' | 'Suspended' | 'Expired' | 'Cancelled' | 'Archived'
  billingStatus: 'Paid' | 'Pending' | 'Overdue' | 'Failed' | 'Complimentary' | 'Promotional'
  startDate: string
  renewalDate: string
  expiryDate: string
  allocationUsage: AllocationUsage
  pricing: { price: number; currency: string; billingFrequency: string; autoRenew: boolean; trialEnds: string | null; discounts: number; promotions: number; outstanding: number }
  overrides: OverrideRecord[]
  activity: ActivityEntry[]
  integrations: { platform: string; status: string }[]
  vcardStatus: string
  vcardTemplate: string
  vcardLastUpdated: string
  cardStatus: string
  cardTemplate: string
  cardIssueDate: string
  daysRemaining: number
}

const MEMBERSHIPS: BusinessMembership[] = [
  { id: '1', membershipId: 'MB-2026-0001', businessName: 'Oceanview Hotel & Spa', businessId: 'BIZ-001', businessOwner: 'Sarah Mitchell', ownerEmail: 'sarah@oceanview.com', ownerPhone: '+1-555-0101', industry: 'Hospitality', plan: 'Platinum', status: 'Active', billingStatus: 'Paid', startDate: '2025-01-15', renewalDate: '2027-01-15', expiryDate: '2027-01-15', allocationUsage: { bizVCards: { used: 3, total: 100 }, bizCards: { used: 5, total: 50 }, conVCards: { used: 423, total: 2000 }, conCards: { used: 387, total: 2000 }, fnf: { used: 12, total: 25 }, additionalCards: { used: 4, total: 10, purchased: 6 } }, pricing: { price: 4999, currency: 'USD', billingFrequency: 'Annual', autoRenew: true, trialEnds: null, discounts: 500, promotions: 0, outstanding: 0 }, overrides: [], activity: [{ action: 'Membership Created', date: '2025-01-15', detail: 'Platinum membership activated' }, { action: 'Renewed', date: '2026-01-15', detail: 'Annual renewal processed' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }, { platform: 'MCOM Rewards', status: 'Coming Soon' }, { platform: 'MCOMMall Cashback', status: 'Coming Soon' }, { platform: 'FundOrDonate', status: 'Coming Soon' }], vcardStatus: 'Published', vcardTemplate: 'Platinum Premium', vcardLastUpdated: '2026-07-28', cardStatus: 'Active', cardTemplate: 'Platinum Executive', cardIssueDate: '2025-01-20', daysRemaining: 169 },
  { id: '2', membershipId: 'MB-2026-0002', businessName: 'Maple Leaf Dental Clinic', businessId: 'BIZ-002', businessOwner: 'Dr. James Wong', ownerEmail: 'james@mapleleafdental.com', ownerPhone: '+1-555-0102', industry: 'Healthcare', plan: 'Gold Pro', status: 'Active', billingStatus: 'Paid', startDate: '2025-03-01', renewalDate: '2026-09-01', expiryDate: '2026-09-01', allocationUsage: { bizVCards: { used: 2, total: 25 }, bizCards: { used: 2, total: 10 }, conVCards: { used: 156, total: 1000 }, conCards: { used: 134, total: 1000 }, fnf: { used: 6, total: 12 }, additionalCards: { used: 2, total: 5, purchased: 3 } }, pricing: { price: 2499, currency: 'USD', billingFrequency: 'Semi-Annual', autoRenew: true, trialEnds: null, discounts: 0, promotions: 200, outstanding: 0 }, overrides: [{ id: '1', type: 'Extra Consumer VCards', value: '+100', reason: 'Seasonal promotion — summer campaign', startDate: '2026-06-01', endDate: '2026-09-01', approvedBy: 'Admin', autoExpiry: true }], activity: [{ action: 'Membership Created', date: '2025-03-01', detail: 'Gold Pro membership activated' }, { action: 'Override Added', date: '2026-06-01', detail: 'Extra 100 Consumer VCards granted for summer campaign' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }, { platform: 'MCOM Rewards', status: 'Coming Soon' }], vcardStatus: 'Published', vcardTemplate: 'Gold Professional', vcardLastUpdated: '2026-07-25', cardStatus: 'Active', cardTemplate: 'Gold Pro Card', cardIssueDate: '2025-03-05', daysRemaining: 33 },
  { id: '3', membershipId: 'MB-2026-0003', businessName: 'BrightFuture Academy', businessId: 'BIZ-003', businessOwner: 'Michael Chen', ownerEmail: 'michael@brightfuture.edu', ownerPhone: '+1-555-0103', industry: 'Education', plan: 'Silver Pro+', status: 'Active', billingStatus: 'Paid', startDate: '2025-06-10', renewalDate: '2026-12-10', expiryDate: '2026-12-10', allocationUsage: { bizVCards: { used: 4, total: 10 }, bizCards: { used: 2, total: 5 }, conVCards: { used: 267, total: 400 }, conCards: { used: 241, total: 400 }, fnf: { used: 5, total: 8 }, additionalCards: { used: 1, total: 4, purchased: 2 } }, pricing: { price: 1499, currency: 'USD', billingFrequency: 'Annual', autoRenew: true, trialEnds: null, discounts: 0, promotions: 0, outstanding: 0 }, overrides: [], activity: [{ action: 'Membership Created', date: '2025-06-10', detail: 'Silver Pro+ membership activated' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTemplate: 'Silver Pro+ Template', vcardLastUpdated: '2026-07-20', cardStatus: 'Active', cardTemplate: 'Silver Pro+ Card', cardIssueDate: '2025-06-15', daysRemaining: 133 },
  { id: '4', membershipId: 'MB-2026-0004', businessName: 'Cornerstone Realty Group', businessId: 'BIZ-004', businessOwner: 'Emily Rodriguez', ownerEmail: 'emily@cornerstone.realty', ownerPhone: '+1-555-0104', industry: 'Real Estate', plan: 'Gold', status: 'Active', billingStatus: 'Paid', startDate: '2025-02-01', renewalDate: '2026-08-01', expiryDate: '2027-02-01', allocationUsage: { bizVCards: { used: 8, total: 25 }, bizCards: { used: 3, total: 5 }, conVCards: { used: 89, total: 500 }, conCards: { used: 72, total: 500 }, fnf: { used: 4, total: 10 }, additionalCards: { used: 1, total: 5, purchased: 2 } }, pricing: { price: 1999, currency: 'USD', billingFrequency: 'Annual', autoRenew: true, trialEnds: null, discounts: 0, promotions: 0, outstanding: 0 }, overrides: [], activity: [{ action: 'Membership Created', date: '2025-02-01', detail: 'Gold membership activated' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTemplate: 'Gold Standard', vcardLastUpdated: '2026-07-22', cardStatus: 'Active', cardTemplate: 'Gold Card', cardIssueDate: '2025-02-05', daysRemaining: 186 },
  { id: '5', membershipId: 'MB-2026-0005', businessName: 'GreenLeaf Wellness Center', businessId: 'BIZ-005', businessOwner: 'Dr. Lisa Park', ownerEmail: 'lisa@greenleafwellness.com', ownerPhone: '+1-555-0105', industry: 'Healthcare', plan: 'Silver', status: 'Trial', billingStatus: 'Pending', startDate: '2026-07-01', renewalDate: '2026-08-01', expiryDate: '2026-09-01', allocationUsage: { bizVCards: { used: 1, total: 5 }, bizCards: { used: 1, total: 3 }, conVCards: { used: 12, total: 200 }, conCards: { used: 8, total: 200 }, fnf: { used: 1, total: 5 }, additionalCards: { used: 0, total: 3, purchased: 0 } }, pricing: { price: 999, currency: 'USD', billingFrequency: 'Monthly', autoRenew: false, trialEnds: '2026-08-01', discounts: 0, promotions: 0, outstanding: 0 }, overrides: [], activity: [{ action: 'Trial Started', date: '2026-07-01', detail: '30-day trial period — Silver plan' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Draft', vcardTemplate: 'Silver Standard', vcardLastUpdated: '2026-07-28', cardStatus: 'Pending', cardTemplate: 'Silver Card', cardIssueDate: '', daysRemaining: 33 },
  { id: '6', membershipId: 'MB-2026-0006', businessName: 'Pinnacle Marketing Solutions', businessId: 'BIZ-006', businessOwner: 'Alex Thompson', ownerEmail: 'alex@pinnacle.marketing', ownerPhone: '+1-555-0106', industry: 'Marketing', plan: 'Bronze Pro+', status: 'Active', billingStatus: 'Paid', startDate: '2026-01-10', renewalDate: '2026-07-10', expiryDate: '2026-08-10', allocationUsage: { bizVCards: { used: 2, total: 5 }, bizCards: { used: 1, total: 2 }, conVCards: { used: 45, total: 150 }, conCards: { used: 38, total: 150 }, fnf: { used: 2, total: 4 }, additionalCards: { used: 0, total: 2, purchased: 0 } }, pricing: { price: 599, currency: 'USD', billingFrequency: 'Monthly', autoRenew: true, trialEnds: null, discounts: 0, promotions: 0, outstanding: 0 }, overrides: [], activity: [{ action: 'Membership Created', date: '2026-01-10', detail: 'Bronze Pro+ membership activated' }, { action: 'Renewed', date: '2026-07-10', detail: 'Monthly renewal processed' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTemplate: 'Bronze Pro+ Template', vcardLastUpdated: '2026-07-15', cardStatus: 'Active', cardTemplate: 'Bronze Pro+ Card', cardIssueDate: '2026-01-15', daysRemaining: 11 },
  { id: '7', membershipId: 'MB-2026-0007', businessName: 'Riverside Restaurant & Bar', businessId: 'BIZ-007', businessOwner: 'Marco Bellini', ownerEmail: 'marco@riverside.bistro', ownerPhone: '+1-555-0107', industry: 'Hospitality', plan: 'Bronze', status: 'Active', billingStatus: 'Paid', startDate: '2026-04-01', renewalDate: '2026-07-01', expiryDate: '2026-08-01', allocationUsage: { bizVCards: { used: 1, total: 1 }, bizCards: { used: 1, total: 1 }, conVCards: { used: 23, total: 50 }, conCards: { used: 18, total: 50 }, fnf: { used: 1, total: 2 }, additionalCards: { used: 0, total: 1, purchased: 0 } }, pricing: { price: 299, currency: 'USD', billingFrequency: 'Monthly', autoRenew: true, trialEnds: null, discounts: 0, promotions: 0, outstanding: 0 }, overrides: [], activity: [{ action: 'Membership Created', date: '2026-04-01', detail: 'Bronze membership activated' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTemplate: 'Bronze Basic', vcardLastUpdated: '2026-06-28', cardStatus: 'Active', cardTemplate: 'Bronze Card', cardIssueDate: '2026-04-05', daysRemaining: 2 },
  { id: '8', membershipId: 'MB-2026-0008', businessName: 'Summit Financial Advisors', businessId: 'BIZ-008', businessOwner: 'Kevin O\'Brien', ownerEmail: 'kevin@summit.finance', ownerPhone: '+1-555-0108', industry: 'Finance', plan: 'Platinum Pro', status: 'Active', billingStatus: 'Paid', startDate: '2024-11-01', renewalDate: '2026-11-01', expiryDate: '2027-11-01', allocationUsage: { bizVCards: { used: 5, total: 100 }, bizCards: { used: 8, total: 50 }, conVCards: { used: 789, total: 5000 }, conCards: { used: 654, total: 5000 }, fnf: { used: 18, total: 30 }, additionalCards: { used: 5, total: 10, purchased: 8 } }, pricing: { price: 7999, currency: 'USD', billingFrequency: 'Annual', autoRenew: true, trialEnds: null, discounts: 1000, promotions: 0, outstanding: 0 }, overrides: [{ id: '2', type: 'Additional F&F Slots', value: '+5', reason: 'Key partner referral program', startDate: '2026-05-01', endDate: '2026-12-31', approvedBy: 'Admin', autoExpiry: true }], activity: [{ action: 'Membership Created', date: '2024-11-01', detail: 'Platinum Pro membership activated' }, { action: 'Renewed', date: '2025-11-01', detail: 'Annual renewal processed' }, { action: 'Override Added', date: '2026-05-01', detail: '5 additional F&F slots granted' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }, { platform: 'MCOM Rewards', status: 'Coming Soon' }, { platform: 'MCOMMall Cashback', status: 'Coming Soon' }], vcardStatus: 'Published', vcardTemplate: 'Platinum Pro Elite', vcardLastUpdated: '2026-07-28', cardStatus: 'Active', cardTemplate: 'Platinum Pro Card', cardIssueDate: '2024-11-05', daysRemaining: 459 },
  { id: '9', membershipId: 'MB-2026-0009', businessName: 'Harbor Logistics Inc.', businessId: 'BIZ-009', businessOwner: 'Jennifer Walsh', ownerEmail: 'jennifer@harborlogistics.com', ownerPhone: '+1-555-0109', industry: 'Logistics', plan: 'Gold Pro', status: 'Suspended', billingStatus: 'Overdue', startDate: '2025-09-01', renewalDate: '2026-03-01', expiryDate: '2026-05-01', allocationUsage: { bizVCards: { used: 3, total: 25 }, bizCards: { used: 2, total: 10 }, conVCards: { used: 89, total: 1000 }, conCards: { used: 76, total: 1000 }, fnf: { used: 5, total: 12 }, additionalCards: { used: 0, total: 5, purchased: 0 } }, pricing: { price: 2499, currency: 'USD', billingFrequency: 'Semi-Annual', autoRenew: false, trialEnds: null, discounts: 0, promotions: 0, outstanding: 2499 }, overrides: [], activity: [{ action: 'Membership Created', date: '2025-09-01', detail: 'Gold Pro membership activated' }, { action: 'Suspended', date: '2026-05-15', detail: 'Membership suspended — payment overdue' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Unpublished', vcardTemplate: 'Gold Professional', vcardLastUpdated: '2026-05-01', cardStatus: 'Frozen', cardTemplate: 'Gold Pro Card', cardIssueDate: '2025-09-05', daysRemaining: 0 },
  { id: '10', membershipId: 'MB-2026-0010', businessName: 'Crystal Clear Optics', businessId: 'BIZ-010', businessOwner: 'David Kim', ownerEmail: 'david@crystalclearoptics.com', ownerPhone: '+1-555-0110', industry: 'Retail', plan: 'Silver Pro', status: 'Active', billingStatus: 'Paid', startDate: '2026-02-15', renewalDate: '2026-08-15', expiryDate: '2026-08-15', allocationUsage: { bizVCards: { used: 2, total: 10 }, bizCards: { used: 1, total: 3 }, conVCards: { used: 67, total: 300 }, conCards: { used: 54, total: 300 }, fnf: { used: 3, total: 7 }, additionalCards: { used: 1, total: 3, purchased: 1 } }, pricing: { price: 1299, currency: 'USD', billingFrequency: 'Semi-Annual', autoRenew: true, trialEnds: null, discounts: 0, promotions: 0, outstanding: 0 }, overrides: [], activity: [{ action: 'Membership Created', date: '2026-02-15', detail: 'Silver Pro membership activated' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTemplate: 'Silver Pro Template', vcardLastUpdated: '2026-07-28', cardStatus: 'Active', cardTemplate: 'Silver Pro Card', cardIssueDate: '2026-02-18', daysRemaining: 16 },
  { id: '11', membershipId: 'MB-2026-0011', businessName: 'Apex Fitness Studio', businessId: 'BIZ-011', businessOwner: 'Natalie Brooks', ownerEmail: 'natalie@apexfitness.com', ownerPhone: '+1-555-0111', industry: 'Fitness', plan: 'Bronze', status: 'Expired', billingStatus: 'Failed', startDate: '2025-05-01', renewalDate: '2026-05-01', expiryDate: '2026-06-01', allocationUsage: { bizVCards: { used: 1, total: 1 }, bizCards: { used: 1, total: 1 }, conVCards: { used: 45, total: 50 }, conCards: { used: 38, total: 50 }, fnf: { used: 2, total: 2 }, additionalCards: { used: 0, total: 1, purchased: 0 } }, pricing: { price: 299, currency: 'USD', billingFrequency: 'Annual', autoRenew: false, trialEnds: null, discounts: 0, promotions: 0, outstanding: 299 }, overrides: [], activity: [{ action: 'Membership Created', date: '2025-05-01', detail: 'Bronze membership activated' }, { action: 'Expired', date: '2026-06-01', detail: 'Membership expired — payment failed' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Unpublished', vcardTemplate: 'Bronze Basic', vcardLastUpdated: '2026-05-20', cardStatus: 'Expired', cardTemplate: 'Bronze Card', cardIssueDate: '2025-05-05', daysRemaining: 0 },
  { id: '12', membershipId: 'MB-2026-0012', businessName: 'Heritage Bookstore & Cafe', businessId: 'BIZ-012', businessOwner: 'Thomas Gray', ownerEmail: 'thomas@heritagebooks.com', ownerPhone: '+1-555-0112', industry: 'Retail', plan: 'Bronze Pro', status: 'Active', billingStatus: 'Paid', startDate: '2026-06-01', renewalDate: '2026-07-01', expiryDate: '2026-08-01', allocationUsage: { bizVCards: { used: 1, total: 3 }, bizCards: { used: 1, total: 1 }, conVCards: { used: 8, total: 100 }, conCards: { used: 5, total: 100 }, fnf: { used: 1, total: 3 }, additionalCards: { used: 0, total: 1, purchased: 0 } }, pricing: { price: 399, currency: 'USD', billingFrequency: 'Monthly', autoRenew: true, trialEnds: null, discounts: 0, promotions: 0, outstanding: 0 }, overrides: [], activity: [{ action: 'Membership Created', date: '2026-06-01', detail: 'Bronze Pro membership activated' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Draft', vcardTemplate: 'Bronze Pro Template', vcardLastUpdated: '2026-07-28', cardStatus: 'Pending', cardTemplate: 'Bronze Pro Card', cardIssueDate: '', daysRemaining: 2 },
  { id: '13', membershipId: 'MB-2026-0013', businessName: 'TechVantage Consulting', businessId: 'BIZ-013', businessOwner: 'Raj Patel', ownerEmail: 'raj@techvantage.io', ownerPhone: '+1-555-0113', industry: 'Technology', plan: 'Silver Pro+', status: 'Active', billingStatus: 'Paid', startDate: '2025-08-15', renewalDate: '2026-08-15', expiryDate: '2027-08-15', allocationUsage: { bizVCards: { used: 3, total: 10 }, bizCards: { used: 2, total: 5 }, conVCards: { used: 134, total: 400 }, conCards: { used: 112, total: 400 }, fnf: { used: 4, total: 8 }, additionalCards: { used: 1, total: 4, purchased: 2 } }, pricing: { price: 1499, currency: 'USD', billingFrequency: 'Annual', autoRenew: true, trialEnds: null, discounts: 0, promotions: 0, outstanding: 0 }, overrides: [], activity: [{ action: 'Membership Created', date: '2025-08-15', detail: 'Silver Pro+ membership activated' }, { action: 'Renewed', date: '2026-08-15', detail: 'Annual renewal processed (auto)' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTemplate: 'Silver Pro+ Template', vcardLastUpdated: '2026-07-20', cardStatus: 'Active', cardTemplate: 'Silver Pro+ Card', cardIssueDate: '2025-08-18', daysRemaining: 381 },
  { id: '14', membershipId: 'MB-2026-0014', businessName: 'Blue Ocean Aquatics', businessId: 'BIZ-014', businessOwner: 'Diana Torres', ownerEmail: 'diana@blueocean.aqua', ownerPhone: '+1-555-0114', industry: 'Recreation', plan: 'Bronze', status: 'Cancelled', billingStatus: 'Paid', startDate: '2026-01-01', renewalDate: '2026-04-01', expiryDate: '2026-05-01', allocationUsage: { bizVCards: { used: 1, total: 1 }, bizCards: { used: 1, total: 1 }, conVCards: { used: 15, total: 50 }, conCards: { used: 12, total: 50 }, fnf: { used: 1, total: 2 }, additionalCards: { used: 0, total: 1, purchased: 0 } }, pricing: { price: 299, currency: 'USD', billingFrequency: 'Monthly', autoRenew: false, trialEnds: null, discounts: 0, promotions: 0, outstanding: 0 }, overrides: [], activity: [{ action: 'Membership Created', date: '2026-01-01', detail: 'Bronze membership activated' }, { action: 'Cancelled', date: '2026-04-15', detail: 'Cancelled by business owner' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Unpublished', vcardTemplate: 'Bronze Basic', vcardLastUpdated: '2026-04-10', cardStatus: 'Cancelled', cardTemplate: 'Bronze Card', cardIssueDate: '2026-01-05', daysRemaining: 0 },
  { id: '15', membershipId: 'MB-2026-0015', businessName: 'Metro Transit Authority', businessId: 'BIZ-015', businessOwner: 'Robert Singh', ownerEmail: 'robert@metrotransit.gov', ownerPhone: '+1-555-0115', industry: 'Government', plan: 'Platinum Pro+', status: 'Active', billingStatus: 'Complimentary', startDate: '2026-01-01', renewalDate: '2027-01-01', expiryDate: '2027-12-31', allocationUsage: { bizVCards: { used: 12, total: -1 }, bizCards: { used: 15, total: -1 }, conVCards: { used: 2341, total: -1 }, conCards: { used: 1987, total: -1 }, fnf: { used: 45, total: -1 }, additionalCards: { used: 20, total: -1, purchased: 0 } }, pricing: { price: 0, currency: 'USD', billingFrequency: 'Annual', autoRenew: true, trialEnds: null, discounts: 0, promotions: 0, outstanding: 0 }, overrides: [{ id: '3', type: 'Unlimited Allocations', value: 'All categories', reason: 'Government partnership — complimentary enterprise access', startDate: '2026-01-01', endDate: '2027-12-31', approvedBy: 'Super Admin', autoExpiry: true }], activity: [{ action: 'Membership Created', date: '2026-01-01', detail: 'Platinum Pro+ complimentary membership activated (government partnership)' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }, { platform: 'MCOM Rewards', status: 'Coming Soon' }, { platform: 'MCOMMall Cashback', status: 'Coming Soon' }, { platform: 'FundOrDonate', status: 'Coming Soon' }, { platform: 'Affiliate Platform', status: 'Coming Soon' }], vcardStatus: 'Published', vcardTemplate: 'Platinum Pro+ Ultimate', vcardLastUpdated: '2026-07-28', cardStatus: 'Active', cardTemplate: 'Platinum Pro+ Card', cardIssueDate: '2026-01-05', daysRemaining: 520 },
  { id: '16', membershipId: 'MB-2026-0016', businessName: 'Verdant Landscaping Co.', businessId: 'BIZ-016', businessOwner: 'Carlos Mendez', ownerEmail: 'carlos@verdant.landscape', ownerPhone: '+1-555-0116', industry: 'Services', plan: 'Bronze Pro', status: 'Grace Period', billingStatus: 'Overdue', startDate: '2026-03-01', renewalDate: '2026-06-01', expiryDate: '2026-07-01', allocationUsage: { bizVCards: { used: 1, total: 3 }, bizCards: { used: 1, total: 1 }, conVCards: { used: 34, total: 100 }, conCards: { used: 28, total: 100 }, fnf: { used: 2, total: 3 }, additionalCards: { used: 0, total: 1, purchased: 0 } }, pricing: { price: 399, currency: 'USD', billingFrequency: 'Monthly', autoRenew: false, trialEnds: null, discounts: 0, promotions: 0, outstanding: 399 }, overrides: [], activity: [{ action: 'Membership Created', date: '2026-03-01', detail: 'Bronze Pro membership activated' }, { action: 'Grace Period', date: '2026-07-01', detail: '30-day grace period started — payment overdue' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTemplate: 'Bronze Pro Template', vcardLastUpdated: '2026-07-01', cardStatus: 'Active', cardTemplate: 'Bronze Pro Card', cardIssueDate: '2026-03-05', daysRemaining: 0 },
  { id: '17', membershipId: 'MB-2026-0017', businessName: 'Prestige Auto Dealership', businessId: 'BIZ-017', businessOwner: 'Andrew Clarke', ownerEmail: 'andrew@prestige.auto', ownerPhone: '+1-555-0117', industry: 'Automotive', plan: 'Gold', status: 'Active', billingStatus: 'Paid', startDate: '2025-07-01', renewalDate: '2026-07-01', expiryDate: '2027-07-01', allocationUsage: { bizVCards: { used: 6, total: 25 }, bizCards: { used: 4, total: 5 }, conVCards: { used: 167, total: 500 }, conCards: { used: 143, total: 500 }, fnf: { used: 7, total: 10 }, additionalCards: { used: 3, total: 5, purchased: 4 } }, pricing: { price: 1999, currency: 'USD', billingFrequency: 'Annual', autoRenew: true, trialEnds: null, discounts: 0, promotions: 0, outstanding: 0 }, overrides: [{ id: '4', type: 'Extra Consumer Cards', value: '+200', reason: 'Annual sales event promotion', startDate: '2026-06-15', endDate: '2026-08-15', approvedBy: 'Commercial Manager', autoExpiry: true }], activity: [{ action: 'Membership Created', date: '2025-07-01', detail: 'Gold membership activated' }, { action: 'Renewed', date: '2026-07-01', detail: 'Annual renewal processed' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTemplate: 'Gold Standard', vcardLastUpdated: '2026-07-28', cardStatus: 'Active', cardTemplate: 'Gold Card', cardIssueDate: '2025-07-05', daysRemaining: 336 },
  { id: '18', membershipId: 'MB-2026-0018', businessName: 'Starlight Events Planning', businessId: 'BIZ-018', businessOwner: 'Isabella Rossi', ownerEmail: 'isabella@starlight.events', ownerPhone: '+1-555-0118', industry: 'Events', plan: 'Silver', status: 'Draft', billingStatus: 'Pending', startDate: '', renewalDate: '', expiryDate: '', allocationUsage: { bizVCards: { used: 0, total: 5 }, bizCards: { used: 0, total: 3 }, conVCards: { used: 0, total: 200 }, conCards: { used: 0, total: 200 }, fnf: { used: 0, total: 5 }, additionalCards: { used: 0, total: 3, purchased: 0 } }, pricing: { price: 999, currency: 'USD', billingFrequency: 'Monthly', autoRenew: false, trialEnds: null, discounts: 0, promotions: 0, outstanding: 0 }, overrides: [], activity: [{ action: 'Draft Created', date: '2026-07-28', detail: 'Silver membership draft — awaiting activation' }], integrations: [{ platform: 'MCOM Solutions', status: 'Pending' }], vcardStatus: 'Not Started', vcardTemplate: 'Silver Standard', vcardLastUpdated: '', cardStatus: 'Not Started', cardTemplate: 'Silver Card', cardIssueDate: '', daysRemaining: 0 },
  { id: '19', membershipId: 'MB-2026-0019', businessName: 'Northwest Community Health', businessId: 'BIZ-019', businessOwner: 'Dr. Sarah Connors', ownerEmail: 'sarah@nwchealth.org', ownerPhone: '+1-555-0119', industry: 'Healthcare', plan: 'Gold Pro', status: 'Active', billingStatus: 'Promotional', startDate: '2026-05-01', renewalDate: '2026-11-01', expiryDate: '2027-05-01', allocationUsage: { bizVCards: { used: 2, total: 25 }, bizCards: { used: 2, total: 10 }, conVCards: { used: 234, total: 1000 }, conCards: { used: 198, total: 1000 }, fnf: { used: 8, total: 12 }, additionalCards: { used: 2, total: 5, purchased: 1 } }, pricing: { price: 1249, currency: 'USD', billingFrequency: 'Semi-Annual', autoRenew: true, trialEnds: null, discounts: 1250, promotions: 0, outstanding: 0 }, overrides: [{ id: '5', type: 'Promotional Pricing', value: '50% off for 6 months', reason: 'Community healthcare initiative partnership', startDate: '2026-05-01', endDate: '2026-11-01', approvedBy: 'Super Admin', autoExpiry: true }], activity: [{ action: 'Membership Created', date: '2026-05-01', detail: 'Gold Pro promotional membership (50% off)' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTemplate: 'Gold Professional', vcardLastUpdated: '2026-07-25', cardStatus: 'Active', cardTemplate: 'Gold Pro Card', cardIssueDate: '2026-05-05', daysRemaining: 276 },
  { id: '20', membershipId: 'MB-2026-0020', businessName: 'Elite Pet Care Services', businessId: 'BIZ-020', businessOwner: 'Amanda Foster', ownerEmail: 'amanda@elitepetcare.com', ownerPhone: '+1-555-0120', industry: 'Services', plan: 'Bronze Pro', status: 'Active', billingStatus: 'Paid', startDate: '2026-05-15', renewalDate: '2026-06-15', expiryDate: '2026-07-15', allocationUsage: { bizVCards: { used: 1, total: 3 }, bizCards: { used: 1, total: 1 }, conVCards: { used: 12, total: 100 }, conCards: { used: 9, total: 100 }, fnf: { used: 1, total: 3 }, additionalCards: { used: 0, total: 1, purchased: 0 } }, pricing: { price: 399, currency: 'USD', billingFrequency: 'Monthly', autoRenew: true, trialEnds: null, discounts: 0, promotions: 0, outstanding: 0 }, overrides: [], activity: [{ action: 'Membership Created', date: '2026-05-15', detail: 'Bronze Pro membership activated' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTemplate: 'Bronze Pro Template', vcardLastUpdated: '2026-07-10', cardStatus: 'Active', cardTemplate: 'Bronze Pro Card', cardIssueDate: '2026-05-18', daysRemaining: 0 },
  { id: '21', membershipId: 'MB-2026-0021', businessName: 'Phoenix Rising Construction', businessId: 'BIZ-021', businessOwner: 'Marcus Johnson', ownerEmail: 'marcus@phoenix.construction', ownerPhone: '+1-555-0121', industry: 'Construction', plan: 'Gold Pro', status: 'Active', billingStatus: 'Paid', startDate: '2025-11-01', renewalDate: '2026-11-01', expiryDate: '2027-05-01', allocationUsage: { bizVCards: { used: 4, total: 25 }, bizCards: { used: 3, total: 10 }, conVCards: { used: 89, total: 1000 }, conCards: { used: 67, total: 1000 }, fnf: { used: 6, total: 12 }, additionalCards: { used: 1, total: 5, purchased: 1 } }, pricing: { price: 2499, currency: 'USD', billingFrequency: 'Semi-Annual', autoRenew: true, trialEnds: null, discounts: 0, promotions: 0, outstanding: 0 }, overrides: [], activity: [{ action: 'Membership Created', date: '2025-11-01', detail: 'Gold Pro membership activated' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTemplate: 'Gold Professional', vcardLastUpdated: '2026-07-28', cardStatus: 'Active', cardTemplate: 'Gold Pro Card', cardIssueDate: '2025-11-05', daysRemaining: 276 },
  { id: '22', membershipId: 'MB-2026-0022', businessName: 'Luna Beauty & Wellness', businessId: 'BIZ-022', businessOwner: 'Sophia Lee', ownerEmail: 'sophia@lunabeauty.com', ownerPhone: '+1-555-0122', industry: 'Beauty', plan: 'Bronze Pro+', status: 'Active', billingStatus: 'Paid', startDate: '2026-04-10', renewalDate: '2026-07-10', expiryDate: '2026-08-10', allocationUsage: { bizVCards: { used: 1, total: 5 }, bizCards: { used: 1, total: 2 }, conVCards: { used: 34, total: 150 }, conCards: { used: 28, total: 150 }, fnf: { used: 2, total: 4 }, additionalCards: { used: 0, total: 2, purchased: 1 } }, pricing: { price: 599, currency: 'USD', billingFrequency: 'Monthly', autoRenew: true, trialEnds: null, discounts: 0, promotions: 0, outstanding: 0 }, overrides: [], activity: [{ action: 'Membership Created', date: '2026-04-10', detail: 'Bronze Pro+ membership activated' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTemplate: 'Bronze Pro+ Template', vcardLastUpdated: '2026-07-15', cardStatus: 'Active', cardTemplate: 'Bronze Pro+ Card', cardIssueDate: '2026-04-12', daysRemaining: 11 },
  { id: '23', membershipId: 'MB-2026-0023', businessName: 'Evergreen Property Management', businessId: 'BIZ-023', businessOwner: 'William Chen', ownerEmail: 'william@evergreen.pm', ownerPhone: '+1-555-0123', industry: 'Real Estate', plan: 'Silver', status: 'Suspended', billingStatus: 'Failed', startDate: '2026-02-01', renewalDate: '2026-05-01', expiryDate: '2026-06-01', allocationUsage: { bizVCards: { used: 2, total: 5 }, bizCards: { used: 1, total: 3 }, conVCards: { used: 56, total: 200 }, conCards: { used: 45, total: 200 }, fnf: { used: 3, total: 5 }, additionalCards: { used: 0, total: 3, purchased: 0 } }, pricing: { price: 999, currency: 'USD', billingFrequency: 'Monthly', autoRenew: false, trialEnds: null, discounts: 0, promotions: 0, outstanding: 2997 }, overrides: [], activity: [{ action: 'Membership Created', date: '2026-02-01', detail: 'Silver membership activated' }, { action: 'Suspended', date: '2026-06-15', detail: 'Membership suspended — 3 failed payments' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Unpublished', vcardTemplate: 'Silver Standard', vcardLastUpdated: '2026-06-01', cardStatus: 'Frozen', cardTemplate: 'Silver Card', cardIssueDate: '2026-02-05', daysRemaining: 0 },
  { id: '24', membershipId: 'MB-2026-0024', businessName: 'Great Lakes Brewing Co.', businessId: 'BIZ-024', businessOwner: 'Patrick O\'Sullivan', ownerEmail: 'patrick@greatlakes.brew', ownerPhone: '+1-555-0124', industry: 'Food & Beverage', plan: 'Silver Pro', status: 'Active', billingStatus: 'Paid', startDate: '2026-03-15', renewalDate: '2026-09-15', expiryDate: '2027-03-15', allocationUsage: { bizVCards: { used: 2, total: 10 }, bizCards: { used: 2, total: 3 }, conVCards: { used: 89, total: 300 }, conCards: { used: 76, total: 300 }, fnf: { used: 4, total: 7 }, additionalCards: { used: 1, total: 3, purchased: 2 } }, pricing: { price: 1299, currency: 'USD', billingFrequency: 'Semi-Annual', autoRenew: true, trialEnds: null, discounts: 0, promotions: 0, outstanding: 0 }, overrides: [], activity: [{ action: 'Membership Created', date: '2026-03-15', detail: 'Silver Pro membership activated' }], integrations: [{ platform: 'MCOM Solutions', status: 'Connected' }], vcardStatus: 'Published', vcardTemplate: 'Silver Pro Template', vcardLastUpdated: '2026-07-22', cardStatus: 'Active', cardTemplate: 'Silver Pro Card', cardIssueDate: '2026-03-18', daysRemaining: 228 },
]

const PLANS = ['All', 'Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+']
const STATUSES = ['All', 'Active', 'Trial', 'Grace Period', 'Suspended', 'Expired', 'Cancelled', 'Archived']
const BILLING_STATUSES = ['All', 'Paid', 'Pending', 'Overdue', 'Failed', 'Complimentary', 'Promotional']
const RENEWAL_PERIODS = ['All', 'Today', '7 Days', '30 Days', 'Custom']
const INDUSTRIES = ['All', 'Hospitality', 'Healthcare', 'Education', 'Real Estate', 'Marketing', 'Finance', 'Logistics', 'Retail', 'Fitness', 'Technology', 'Recreation', 'Government', 'Services', 'Automotive', 'Events', 'Construction', 'Beauty', 'Food & Beverage']

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Draft': 'bg-gray-100 dark:bg-gray-500/20 text-gray-600',
    'Trial': 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600',
    'Active': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Grace Period': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Suspended': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Expired': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
    'Cancelled': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Archived': 'bg-gray-100 dark:bg-gray-500/20 text-gray-500',
  }
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[status] || 'bg-gray-50 text-gray-600'}`}>{status}</span>
}

function BillingBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Paid': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Pending': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Overdue': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Failed': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Complimentary': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600',
    'Promotional': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
  }
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[status] || 'bg-gray-50 text-gray-600'}`}>{status}</span>
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    'Bronze': 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
    'Bronze Pro': 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
    'Bronze Pro+': 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
    'Silver': 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300',
    'Silver Pro': 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300',
    'Silver Pro+': 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300',
    'Gold': 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    'Gold Pro': 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    'Gold Pro+': 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    'Platinum': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'Platinum Pro': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'Platinum Pro+': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
  }
  return <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${colors[tier] || 'bg-gray-100 text-gray-600'}`}>{tier}</span>
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

function UsageBar({ used, total }: { used: number; total: number }) {
  const pct = total === -1 ? 0 : total === 0 ? 0 : Math.round(used / total * 100)
  const color = total === -1 ? 'bg-blue-400' : pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-green-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: total === -1 ? 100 : `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-[9px] text-gray-500 font-mono w-16 text-right">{total === -1 ? '∞' : `${used}/${total}`}</span>
    </div>
  )
}

export default function BusinessMembershipsPage() {
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [billingFilter, setBillingFilter] = useState('')
  const [renewalFilter, setRenewalFilter] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [workspace, setWorkspace] = useState<BusinessMembership | null>(null)
  const [tab, setTab] = useState('overview')
  const [showOverrideForm, setShowOverrideForm] = useState(false)
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  const filtered = MEMBERSHIPS.filter(m => {
    if (search && !m.businessName.toLowerCase().includes(search.toLowerCase()) && !m.membershipId.toLowerCase().includes(search.toLowerCase()) && !m.businessOwner.toLowerCase().includes(search.toLowerCase()) && !m.ownerEmail.toLowerCase().includes(search.toLowerCase())) return false
    if (planFilter && m.plan !== planFilter) return false
    if (statusFilter && m.status !== statusFilter) return false
    if (billingFilter && m.billingStatus !== billingFilter) return false
    if (industryFilter && m.industry !== industryFilter) return false
    if (renewalFilter) {
      const today = new Date()
      const renew = new Date(m.renewalDate)
      const diffDays = Math.ceil((renew.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (renewalFilter === 'Today' && diffDays !== 0) return false
      if (renewalFilter === '7 Days' && (diffDays < 0 || diffDays > 7)) return false
      if (renewalFilter === '30 Days' && (diffDays < 0 || diffDays > 30)) return false
    }
    return true
  })

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleSelectAll = () => setSelectedIds(prev => prev.length === filtered.length ? [] : filtered.map(m => m.id))
  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) { toast.error('No memberships selected'); return }
    toast.success(`${action} applied to ${selectedIds.length} membership(s)`)
    setSelectedIds([])
  }

  const countByStatus = (s: string) => MEMBERSHIPS.filter(m => m.status === s).length
  const totalConVCards = MEMBERSHIPS.reduce((sum, m) => sum + m.allocationUsage.conVCards.used, 0)
  const totalConCards = MEMBERSHIPS.reduce((sum, m) => sum + m.allocationUsage.conCards.used, 0)
  const totalFnf = MEMBERSHIPS.reduce((sum, m) => sum + m.allocationUsage.fnf.used, 0)

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
          <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2">Unable to load Business Memberships</h3>
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
    const m = workspace
    const totalAlloc = (cat: keyof AllocationUsage) => {
      const a = m.allocationUsage[cat]
      if ('purchased' in a) return (a as { used: number; total: number; purchased: number })
      return a as { used: number; total: number }
    }
    const allocItems: { label: string; key: keyof AllocationUsage }[] = [
      { label: 'Business VCards', key: 'bizVCards' },
      { label: 'Business Cards', key: 'bizCards' },
      { label: 'Consumer VCards', key: 'conVCards' },
      { label: 'Consumer Cards', key: 'conCards' },
      { label: 'Friends & Family', key: 'fnf' },
      { label: 'Additional Cards', key: 'additionalCards' },
    ]

    return (
      <div className="space-y-6">
        <Helmet><title>{m.businessName} - Business Membership - MCOM VCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setWorkspace(null)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex items-center gap-2">
              <Link to="/admin" className="text-[10px] text-orange-600 hover:underline">Dashboard</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <Link to="/admin/membership/business-memberships" className="text-[10px] text-orange-600 hover:underline">Business Memberships</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">{m.businessName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <TierBadge tier={m.plan} />
            <StatusBadge status={m.status} />
            <BillingBadge status={m.billingStatus} />
            <span className="text-[9px] text-gray-400">ID: {m.membershipId}</span>
            <span className="text-[9px] text-gray-400">Started {m.startDate || 'N/A'}</span>
            {m.daysRemaining > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600">{m.daysRemaining} days remaining</span>}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'membership', label: 'Membership Details' },
              { key: 'allocations', label: 'Allocations' },
              { key: 'vcard', label: 'Business VCard' },
              { key: 'card', label: 'Business Card' },
              { key: 'benefits', label: 'Consumer Benefits' },
              { key: 'billing', label: 'Billing' },
              { key: 'activity', label: 'Activity' },
              { key: 'overrides', label: 'Overrides' },
              { key: 'integrations', label: 'Integrations' },
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
                    <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Business Information</h4>
                    <div className="space-y-1.5">
                      {[
                        { label: 'Business Name', value: m.businessName },
                        { label: 'Business ID', value: m.businessId },
                        { label: 'Business Owner', value: m.businessOwner },
                        { label: 'Email', value: m.ownerEmail },
                        { label: 'Phone', value: m.ownerPhone },
                        { label: 'Industry', value: m.industry },
                        { label: 'Registration Date', value: m.startDate || 'N/A' },
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
                        { label: 'Current Plan', value: m.plan },
                        { label: 'Status', value: m.status },
                        { label: 'Billing Status', value: m.billingStatus },
                        { label: 'Start Date', value: m.startDate || 'N/A' },
                        { label: 'Renewal Date', value: m.renewalDate || 'N/A' },
                        { label: 'Expiry Date', value: m.expiryDate || 'N/A' },
                        { label: 'Days Remaining', value: m.daysRemaining > 0 ? String(m.daysRemaining) : 'N/A' },
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {allocItems.map(item => {
                      const a = totalAlloc(item.key)
                      return (
                        <div key={item.key} className="px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{a.used}</p>
                          <p className="text-[9px] text-gray-500">{item.label}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {tab === 'membership' && (
              <div className="space-y-5 max-w-xl">
                <div className="space-y-1.5">
                  {[
                    { label: 'Membership Plan', value: m.plan },
                    { label: 'Plan Version', value: 'v2.4.1' },
                    { label: 'Pricing', value: `${m.pricing.currency} ${m.pricing.price.toLocaleString()}` },
                    { label: 'Billing Frequency', value: m.pricing.billingFrequency },
                    { label: 'Auto Renewal', value: m.pricing.autoRenew ? 'Enabled' : 'Disabled' },
                    { label: 'Trial Status', value: m.pricing.trialEnds ? `Trial ends ${m.pricing.trialEnds}` : 'No trial' },
                    { label: 'Renewal History', value: `${m.activity.filter(a => a.action.includes('Renew')).length} renewal(s)` },
                  ].map(d => (
                    <div key={d.label} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="text-[10px] text-gray-500">{d.label}</span>
                      <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{d.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button onClick={() => { setWorkspace(null); toast.success('Plan change flow opened') }} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Change Plan</button>
                  <button onClick={() => toast.success('Expiry extended by 30 days')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Extend Expiry</button>
                  <button onClick={() => toast.success('Trial converted to full membership')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Convert Trial</button>
                  <button onClick={() => toast.success('Membership marked as complimentary')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Mark Complimentary</button>
                  <button onClick={() => toast.success('Note added')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Add Note</button>
                </div>
              </div>
            )}

            {tab === 'allocations' && (
              <div className="space-y-5 max-w-lg">
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Allocation Quotas</h4>
                <div className="space-y-2">
                  {allocItems.filter(i => i.key !== 'additionalCards').map(item => {
                    const a = totalAlloc(item.key)
                    return (
                      <div key={item.key} className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                          <span className="text-[9px] text-gray-500">{a.total === -1 ? 'Unlimited' : `${a.used} / ${a.total}`}</span>
                        </div>
                        <UsageBar used={a.used} total={a.total} />
                      </div>
                    )
                  })}
                  <div className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">Additional Cards</span>
                      <span className="text-[9px] text-gray-500">{m.allocationUsage.additionalCards.purchased} purchased</span>
                    </div>
                    <UsageBar used={m.allocationUsage.additionalCards.used} total={m.allocationUsage.additionalCards.total} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button onClick={() => toast.success('Allocation increase applied')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Increase Allocation</button>
                  <button onClick={() => toast.success('Promotional allocation granted')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Grant Promotional</button>
                  <button onClick={() => toast.success('Allocations reset to plan defaults')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reset Per Plan</button>
                  <button onClick={() => toast.success('Allocation transfer completed')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Transfer Allocation</button>
                </div>
              </div>
            )}

            {tab === 'vcard' && (
              <div className="space-y-5 max-w-lg">
                <div className="space-y-1.5">
                  {[
                    { label: 'Current Template', value: m.vcardTemplate },
                    { label: 'Publishing Status', value: m.vcardStatus },
                    { label: 'Last Updated', value: m.vcardLastUpdated || 'N/A' },
                  ].map(d => (
                    <div key={d.label} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="text-[10px] text-gray-500">{d.label}</span>
                      <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{d.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button onClick={() => toast.success('Opening VCard...')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Open VCard</button>
                  <button onClick={() => toast.success('Opening VCard Builder...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Open Builder</button>
                  <button onClick={() => toast.success('VCard published')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Publish</button>
                  <button onClick={() => toast.success('Opening preview...')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Preview</button>
                </div>
              </div>
            )}

            {tab === 'card' && (
              <div className="space-y-5 max-w-lg">
                <div className="space-y-1.5">
                  {[
                    { label: 'Assigned Template', value: m.cardTemplate },
                    { label: 'Card Status', value: m.cardStatus },
                    { label: 'Issue Date', value: m.cardIssueDate || 'N/A' },
                  ].map(d => (
                    <div key={d.label} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="text-[10px] text-gray-500">{d.label}</span>
                      <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{d.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button onClick={() => toast.success('Opening Card...')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Open Card</button>
                  <button onClick={() => toast.success('Card replacement initiated')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Replace Card</button>
                  <button onClick={() => toast.success('Template reassigned')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Reassign Template</button>
                </div>
              </div>
            )}

            {tab === 'benefits' && (
              <div className="space-y-5 max-w-lg">
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Consumer Benefits Remaining</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Consumer VCards Remaining', used: m.allocationUsage.conVCards.used, total: m.allocationUsage.conVCards.total },
                    { label: 'Consumer Cards Remaining', used: m.allocationUsage.conCards.used, total: m.allocationUsage.conCards.total },
                    { label: 'Friends & Family Remaining', used: m.allocationUsage.fnf.used, total: m.allocationUsage.fnf.total },
                    { label: 'Additional Card Allowance', used: m.allocationUsage.additionalCards.used, total: m.allocationUsage.additionalCards.total },
                    { label: 'eCard Entitlements', used: 0, total: m.plan.includes('Platinum') || m.plan.includes('Gold') ? 5 : m.plan.includes('Silver') ? 2 : 0 },
                  ].map(item => {
                    const remaining = item.total === -1 ? -1 : item.total - item.used
                    return (
                      <div key={item.label} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <span className="text-[10px] text-gray-700 dark:text-gray-300">{item.label}</span>
                        <span className={`text-[10px] font-mono font-medium ${remaining === -1 ? 'text-blue-600' : remaining <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                          {remaining === -1 ? 'Unlimited' : remaining}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => toast.success('Promotional increase granted')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Grant Promotional Increase</button>
                  <button onClick={() => toast.success('Benefits refreshed')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Refresh</button>
                </div>
              </div>
            )}

            {tab === 'billing' && (
              <div className="space-y-5 max-w-lg">
                <div className="space-y-1.5">
                  {[
                    { label: 'Membership Price', value: `${m.pricing.currency} ${m.pricing.price.toLocaleString()}` },
                    { label: 'Discounts', value: m.pricing.discounts > 0 ? `-${m.pricing.currency} ${m.pricing.discounts.toLocaleString()}` : 'None' },
                    { label: 'Promotions', value: m.pricing.promotions > 0 ? `-${m.pricing.currency} ${m.pricing.promotions.toLocaleString()}` : 'None' },
                    { label: 'Renewal Amount', value: `${m.pricing.currency} ${(m.pricing.price - m.pricing.discounts - m.pricing.promotions).toLocaleString()}` },
                    { label: 'Outstanding Balance', value: m.pricing.outstanding > 0 ? `${m.pricing.currency} ${m.pricing.outstanding.toLocaleString()}` : 'None' },
                    { label: 'Billing Frequency', value: m.pricing.billingFrequency },
                    { label: 'Auto Renewal', value: m.pricing.autoRenew ? 'Enabled' : 'Disabled' },
                  ].map(d => (
                    <div key={d.label} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="text-[10px] text-gray-500">{d.label}</span>
                      <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{d.value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-3 flex items-start gap-2">
                  <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400">Payment gateway integration is not yet active. Billing is managed manually. Future: Stripe, PayPal, MCOM Pay.</p>
                </div>
              </div>
            )}

            {tab === 'activity' && (
              <div className="space-y-3 max-w-xl">
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Membership Timeline</h4>
                {m.activity.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/20 rounded-xl">
                    <p className="text-[10px] text-gray-400">No activity recorded for this membership.</p>
                  </div>
                ) : (
                  m.activity.map((entry, i) => (
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
                  <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Business Overrides</h4>
                  <button onClick={() => setShowOverrideForm(!showOverrideForm)} className="px-2 py-1 rounded-lg bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">+ Add Override</button>
                </div>
                {showOverrideForm && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <select className="text-[10px] border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500">
                        <option>Extra Consumer Cards</option><option>Extra Consumer VCards</option><option>Additional F&F Slots</option><option>Temporary Premium Components</option><option>Extra Dynamic QR Features</option><option>Temporary Promotional Access</option>
                      </select>
                      <input type="text" placeholder="Value (e.g. +50)" className="text-[10px] border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-500" />
                    </div>
                    <input type="text" placeholder="Reason for override" className="w-full text-[10px] border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-500" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="date" defaultValue="2026-08-01" className="text-[10px] border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500" />
                      <input type="date" defaultValue="2026-09-01" className="text-[10px] border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-[10px] text-gray-500">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 accent-orange-500 w-3 h-3" />
                        Auto-expire on end date
                      </label>
                      <div className="flex gap-2">
                        <button onClick={() => { setShowOverrideForm(false); toast.success('Override applied') }} className="px-2 py-1 rounded bg-orange-500 text-white text-[10px] font-semibold hover:bg-orange-600">Apply</button>
                        <button onClick={() => setShowOverrideForm(false)} className="px-2 py-1 rounded border border-gray-200 dark:border-gray-600 text-[10px] text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
                {m.overrides.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/20 rounded-xl">
                    <p className="text-[10px] text-gray-400">No overrides applied. Use overrides to grant temporary benefits without changing the plan.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {m.overrides.map(o => (
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

            {tab === 'integrations' && (
              <div className="space-y-5 max-w-lg">
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Ecosystem Integration Status</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                        <th className="text-left px-2 py-1.5 font-medium">Platform</th>
                        <th className="text-left px-2 py-1.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {m.integrations.map(int => (
                        <tr key={int.platform} className="border-b border-gray-50 dark:border-gray-700/50">
                          <td className="px-2 py-2 text-gray-900 dark:text-white">{int.platform}</td>
                          <td className="px-2 py-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${int.status === 'Connected' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600'}`}>
                              {int.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-3 flex items-start gap-2">
                  <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400">Future integration points are visible here. Rules are pre-configured in the Entitlement Engine — activating a new integration requires no platform changes.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (MEMBERSHIPS.length === 0) {
    return (
      <div className="space-y-6">
        <Helmet><title>Business Memberships - MCOM VCard</title></Helmet>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin" className="text-[10px] text-orange-600 hover:underline">Dashboard</Link>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Business Memberships</h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Every business subscription is managed here — no two are the same.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2">No Business Memberships Found</h3>
          <p className="text-[10px] text-gray-500 mb-5">Assign your first membership to begin managing business entitlements.</p>
          <button onClick={() => toast.success('Assign Membership wizard opened')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 inline-flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Assign Membership
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Helmet><title>Business Memberships - MCOM VCard</title></Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/admin" className="text-[10px] text-orange-600 hover:underline">Dashboard</Link>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">Business Memberships</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Every business subscription is managed here — no two are the same.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => toast.success('Renewal engine scan initiated')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Renewal Scan
            </button>
            <button onClick={() => toast.success('Assign Membership wizard opened')} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Assign Membership
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Total Memberships" value={String(MEMBERSHIPS.length)} sub={`${countByStatus('Active')} Active · ${countByStatus('Trial')} Trial · ${countByStatus('Suspended')} Suspended · ${countByStatus('Expired')} Expired · ${countByStatus('Cancelled')} Cancelled`} color="text-gray-900 dark:text-white" />
        <KpiCard label="Renewals" value={String(MEMBERSHIPS.filter(m => { const d = new Date(m.renewalDate); const n = new Date(); const diff = Math.ceil((d.getTime() - n.getTime()) / (1000 * 60 * 60 * 24)); return diff >= 0 && diff <= 30; }).length)} sub="Next 30 days" color="text-blue-600" />
        <KpiCard label="Expiring Soon" value={String(MEMBERSHIPS.filter(m => m.daysRemaining > 0 && m.daysRemaining <= 30).length)} sub="Next 30 days" color="text-amber-600" />
        <KpiCard label="Overdue" value={String(MEMBERSHIPS.filter(m => m.billingStatus === 'Overdue' || m.billingStatus === 'Failed').length)} sub="Requires attention" color="text-red-600" />
        <KpiCard label="Upgraded (30d)" value={String(MEMBERSHIPS.filter(m => m.activity.some(a => a.action.includes('Upgrade') && new Date(a.date) > new Date(Date.now() - 30 * 86400000))).length)} sub="This month" color="text-green-600" />
        <KpiCard label="Allocation Usage" value={`${totalConVCards + totalConCards + totalFnf}`} sub={`${totalConVCards} Con VCards · ${totalConCards} Con Cards · ${totalFnf} F&F`} color="text-purple-600" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search by business name, membership ID, owner name, or email..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg pl-9 pr-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <FilterSelect label="Plan" value={planFilter} options={PLANS} onChange={setPlanFilter} />
          <FilterSelect label="Status" value={statusFilter} options={STATUSES} onChange={setStatusFilter} />
          <FilterSelect label="Billing" value={billingFilter} options={BILLING_STATUSES} onChange={setBillingFilter} />
          <FilterSelect label="Renewal" value={renewalFilter} options={RENEWAL_PERIODS} onChange={setRenewalFilter} />
          <FilterSelect label="Industry" value={industryFilter} options={INDUSTRIES} onChange={setIndustryFilter} />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
            <span className="text-[10px] text-orange-600 font-medium">{selectedIds.length} selected</span>
            <div className="flex-1" />
            {['Activate', 'Suspend', 'Renew', 'Upgrade Plan', 'Export', 'Send Reminders', 'Promotional Allocation'].map(action => (
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
                <th className="text-left px-2 py-1.5 font-medium">Business</th>
                <th className="text-left px-2 py-1.5 font-medium">Membership ID</th>
                <th className="text-left px-2 py-1.5 font-medium">Plan</th>
                <th className="text-left px-2 py-1.5 font-medium">Status</th>
                <th className="text-left px-2 py-1.5 font-medium">Billing</th>
                <th className="text-left px-2 py-1.5 font-medium">Start</th>
                <th className="text-left px-2 py-1.5 font-medium">Renewal</th>
                <th className="text-left px-2 py-1.5 font-medium">Expiry</th>
                <th className="text-left px-2 py-1.5 font-medium">Allocation Usage</th>
                <th className="text-left px-2 py-1.5 font-medium">Owner</th>
                <th className="text-left px-2 py-1.5 font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20 cursor-pointer" onClick={() => setWorkspace(m)}>
                  <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(m.id)} onChange={() => toggleSelect(m.id)} className="rounded border-gray-300 accent-orange-500 w-3 h-3" /></td>
                  <td className="px-2 py-2">
                    <div>
                      <p className="text-[10px] font-medium text-gray-900 dark:text-white">{m.businessName}</p>
                      <p className="text-[9px] text-gray-400">{m.industry}</p>
                    </div>
                  </td>
                  <td className="px-2 py-2 font-mono text-gray-500">{m.membershipId}</td>
                  <td className="px-2 py-2"><TierBadge tier={m.plan} /></td>
                  <td className="px-2 py-2"><StatusBadge status={m.status} /></td>
                  <td className="px-2 py-2"><BillingBadge status={m.billingStatus} /></td>
                  <td className="px-2 py-2 text-gray-500">{m.startDate || '-'}</td>
                  <td className="px-2 py-2 text-gray-500">{m.renewalDate || '-'}</td>
                  <td className="px-2 py-2 text-gray-500">{m.expiryDate || '-'}</td>
                  <td className="px-2 py-2">
                    <div className="flex flex-col gap-0.5 min-w-[100px]">
                      <UsageBar used={m.allocationUsage.conVCards.used} total={m.allocationUsage.conVCards.total} />
                      <UsageBar used={m.allocationUsage.conCards.used} total={m.allocationUsage.conCards.total} />
                    </div>
                  </td>
                  <td className="px-2 py-2 text-gray-700 dark:text-gray-300">{m.businessOwner}</td>
                  <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setWorkspace(m)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="View Details"><svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                      <button onClick={() => toast.success(`Editing ${m.businessName}`)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Edit"><svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                      <button onClick={() => toast.success(`${m.businessName}: Upgrade flow opened`)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Upgrade"><svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></button>
                      <button onClick={() => toast.success(`${m.businessName}: More actions`)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="More"><svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8"><p className="text-[10px] text-gray-400">No memberships match your filters.</p></div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-[9px] text-gray-400">Showing {filtered.length} of {MEMBERSHIPS.length} memberships</span>
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
