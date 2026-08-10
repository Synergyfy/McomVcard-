import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

type TransitionType = 'Upgrade' | 'Downgrade' | 'Promotion' | 'Demotion' | 'Renewal' | 'Trial Conversion' | 'Complimentary Upgrade' | 'Promotional Upgrade' | 'Manual Override'

type TransitionStatus = 'Draft' | 'Pending Approval' | 'Scheduled' | 'Processing' | 'Completed' | 'Cancelled' | 'Failed' | 'Rolled Back'

type MemberType = 'Business' | 'Consumer'

interface EntitlementComparison {
  label: string
  current: string
  target: string
  delta: string
}

interface AllocationImpact {
  category: string
  currentUsed: number
  currentRemaining: number
  targetAvailable: number
  result: string
}

interface ValidationCheck {
  check: string
  status: 'Pass' | 'Fail' | 'Warning'
  message: string
}

interface NotificationPreview {
  recipient: string
  subject: string
  body: string
}

interface ApprovalStep {
  step: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Not Required'
  approvedBy?: string
  date?: string
  comment?: string
}

interface ActivityEntry {
  action: string
  date: string
  detail: string
}

interface RollbackInfo {
  possible: boolean
  reason?: string
  restores: string[]
}

interface Transition {
  id: number
  transitionId: string
  memberName: string
  memberType: MemberType
  memberId: string
  currentPlan: string
  targetPlan: string
  transitionType: TransitionType
  status: TransitionStatus
  requestedBy: string
  requestedDate: string
  effectiveDate: string
  reason: string
  approvalStatus: string
  overviewMemberInfo: { label: string; value: string }[]
  currentMembership: { label: string; value: string }[]
  targetMembership: { label: string; value: string }[]
  entitlementComparison: EntitlementComparison[]
  allocationImpact: AllocationImpact[]
  validations: ValidationCheck[]
  notifications: NotificationPreview[]
  approvals: ApprovalStep[]
  activity: ActivityEntry[]
  rollback: RollbackInfo
}

const TRANSITIONS: Transition[] = [
  { id: 1, transitionId: 'TR-2026-0001', memberName: 'Oceanview Hotel & Spa', memberType: 'Business', memberId: 'BIZ-001', currentPlan: 'Gold', targetPlan: 'Platinum', transitionType: 'Upgrade', status: 'Completed', requestedBy: 'Sarah Mitchell', requestedDate: '2026-07-15', effectiveDate: '2026-07-20', reason: 'Business growth - need higher allocation limits for peak season', approvalStatus: 'Approved', overviewMemberInfo: [
    { label: 'Business Name', value: 'Oceanview Hotel & Spa' }, { label: 'Membership ID', value: 'MB-2026-0001' }, { label: 'Current Status', value: 'Active' }, { label: 'Requested By', value: 'Sarah Mitchell' }, { label: 'Requested Date', value: '2026-07-15' }
  ], currentMembership: [
    { label: 'Membership Tier', value: 'Gold' }, { label: 'Pricing', value: '$1,999 / year' }, { label: 'Business VCards', value: '25' }, { label: 'Consumer VCards', value: '500' }, { label: 'Consumer Cards', value: '500' }, { label: 'Friends & Family', value: '10' }, { label: 'Additional Cards', value: '5' }, { label: 'Dynamic QR', value: 'Basic' }, { label: 'Analytics', value: 'Standard' }
  ], targetMembership: [
    { label: 'Membership Tier', value: 'Platinum' }, { label: 'Pricing', value: '$4,999 / year' }, { label: 'Business VCards', value: 'Unlimited' }, { label: 'Consumer VCards', value: '2,000' }, { label: 'Consumer Cards', value: '2,000' }, { label: 'Friends & Family', value: '25' }, { label: 'Additional Cards', value: '10' }, { label: 'Dynamic QR', value: 'Premium' }, { label: 'Analytics', value: 'Advanced' }
  ], entitlementComparison: [
    { label: 'Business VCards', current: '25', target: 'Unlimited', delta: 'Unlimited' },
    { label: 'Consumer VCards', current: '500', target: '2,000', delta: '+1,500' },
    { label: 'Consumer Cards', current: '500', target: '2,000', delta: '+1,500' },
    { label: 'Friends & Family', current: '10', target: '25', delta: '+15' },
    { label: 'Additional Cards', current: '5', target: '10', delta: '+5' },
    { label: 'Dynamic QR', current: 'Basic', target: 'Premium', delta: 'Upgraded' },
    { label: 'Analytics Access', current: 'Standard', target: 'Advanced', delta: 'Upgraded' },
    { label: 'Premium Builder', current: 'Not Included', target: 'Included', delta: 'Added' },
  ], allocationImpact: [
    { category: 'Business VCards', currentUsed: 3, currentRemaining: 22, targetAvailable: -1, result: 'Unlimited - no restriction' },
    { category: 'Consumer VCards', currentUsed: 423, currentRemaining: 77, targetAvailable: 2000, result: '+1,500 additional VCards available' },
    { category: 'Consumer Cards', currentUsed: 387, currentRemaining: 113, targetAvailable: 2000, result: '+1,500 additional Cards available' },
    { category: 'Friends & Family', currentUsed: 12, currentRemaining: -2, targetAvailable: 25, result: '+15 additional F&F slots' },
    { category: 'Additional Cards', currentUsed: 4, currentRemaining: 1, targetAvailable: 10, result: '+5 additional cards available' },
  ], validations: [
    { check: 'Membership Active', status: 'Pass', message: 'Current membership is Active' },
    { check: 'Billing Valid', status: 'Pass', message: 'Paid in full - no outstanding balance' },
    { check: 'Target Plan Exists', status: 'Pass', message: 'Platinum plan is published and available' },
    { check: 'Plan is Publishable', status: 'Pass', message: 'Target plan is active' },
    { check: 'Allocations Calculated', status: 'Pass', message: 'Allocation differences computed successfully' },
    { check: 'No Conflicting Transition', status: 'Pass', message: 'No other pending transitions found' },
    { check: 'Required Approvals', status: 'Pass', message: 'All approvals obtained' },
  ], notifications: [
    { recipient: 'Sarah Mitchell (Business Owner)', subject: 'Membership Upgrade Approved - Oceanview Hotel & Spa', body: 'Your upgrade from Gold to Platinum has been approved and is now active.' },
    { recipient: 'Account Manager (Operations)', subject: 'Upgrade Completed - Oceanview Hotel & Spa', body: 'The membership upgrade has been processed. New entitlements are in effect.' },
  ], approvals: [
    { step: 'Requested', status: 'Approved', approvedBy: 'System', date: '2026-07-15', comment: 'Auto-approved - standard upgrade' },
    { step: 'Commercial Review', status: 'Approved', approvedBy: 'Commercial Manager', date: '2026-07-16', comment: 'Good growth - approve upgrade to Platinum' },
    { step: 'Finance Review', status: 'Not Required', comment: 'No pricing override' },
    { step: 'Executed', status: 'Approved', approvedBy: 'System', date: '2026-07-20', comment: 'Transition executed successfully' },
  ], activity: [
    { action: 'Upgrade Requested', date: '2026-07-15', detail: 'Upgrade from Gold to Platinum requested by Sarah Mitchell' },
    { action: 'Validated', date: '2026-07-15', detail: 'All validation checks passed' },
    { action: 'Approved (Commercial)', date: '2026-07-16', detail: 'Approved by Commercial Manager' },
    { action: 'Allocations Calculated', date: '2026-07-16', detail: 'Entitlement differences computed' },
    { action: 'Membership Updated', date: '2026-07-20', detail: 'Upgraded to Platinum - new allocations active' },
    { action: 'Notifications Sent', date: '2026-07-20', detail: 'Business owner and account manager notified' },
    { action: 'Completed', date: '2026-07-20', detail: 'Transition completed successfully' },
  ], rollback: { possible: true, restores: ['Previous membership: Gold', 'Previous entitlements: 25 Biz VCards, 500 Consumer VCards', 'Previous allocation limits: 10 F&F, 5 Additional Cards', 'Previous permissions: Standard Analytics', 'Previous feature access: Basic Dynamic QR'] } },
  { id: 2, transitionId: 'TR-2026-0002', memberName: 'Emily Watson', memberType: 'Consumer', memberId: 'CON-2026-0001', currentPlan: 'Gold', targetPlan: 'Platinum', transitionType: 'Promotion', status: 'Completed', requestedBy: 'Admin', requestedDate: '2026-06-10', effectiveDate: '2026-06-10', reason: 'VIP customer - 15+ redemptions, high engagement', approvalStatus: 'Approved', overviewMemberInfo: [
    { label: 'Consumer Name', value: 'Emily Watson' }, { label: 'Consumer ID', value: 'CON-2026-0001' }, { label: 'Current Status', value: 'Active' }, { label: 'Requested By', value: 'Admin' }, { label: 'Requested Date', value: '2026-06-10' }
  ], currentMembership: [
    { label: 'Current Level', value: 'Gold' }, { label: 'Linked Business', value: 'Oceanview Hotel & Spa' }, { label: 'Entry Method', value: 'Automatic' }, { label: 'Friends & Family', value: 'Family: 2, Friends: 3' }, { label: 'Additional Cards', value: '2' }
  ], targetMembership: [
    { label: 'Target Level', value: 'Platinum' }, { label: 'Linked Business', value: 'Oceanview Hotel & Spa' }, { label: 'Entry Method', value: 'Manual (Admin)' }, { label: 'Friends & Family', value: 'Family: 3, Friends: 5' }, { label: 'Additional Cards', value: '3' }
  ], entitlementComparison: [
    { label: 'Consumer VCard Theme', current: 'Gold Standard', target: 'Platinum Premium', delta: 'Enhanced' },
    { label: 'Family Slots', current: '2', target: '3', delta: '+1' },
    { label: 'Friends Slots', current: '3', target: '5', delta: '+2' },
    { label: 'Additional Cards', current: '2', target: '3', delta: '+1' },
    { label: 'VCard Share', current: 'Enabled', target: 'Enabled', delta: 'Unchanged' },
    { label: 'VCard Exchange', current: 'Enabled', target: 'Enabled', delta: 'Unchanged' },
    { label: 'VCard Redeem', current: 'Enabled', target: 'Enabled', delta: 'Unchanged' },
  ], allocationImpact: [
    { category: 'Family Slots', currentUsed: 2, currentRemaining: 0, targetAvailable: 3, result: '+1 Family slot - 1 remaining' },
    { category: 'Friends Slots', currentUsed: 3, currentRemaining: 0, targetAvailable: 5, result: '+2 Friends slots - 2 remaining' },
    { category: 'Additional Cards', currentUsed: 1, currentRemaining: 1, targetAvailable: 3, result: '+1 Additional card - 2 remaining' },
  ], validations: [
    { check: 'Membership Active', status: 'Pass', message: 'Current membership is Active' },
    { check: 'Linked Business Active', status: 'Pass', message: 'Oceanview Hotel & Spa membership is active' },
    { check: 'Target Level Exists', status: 'Pass', message: 'Platinum level is available' },
    { check: 'No Conflicting Transition', status: 'Pass', message: 'No other pending promotions' },
    { check: 'Admin Authorized', status: 'Pass', message: 'Manual promotion authorized by Admin' },
  ], notifications: [
    { recipient: 'Emily Watson (Consumer)', subject: "Congratulations! You've been promoted to Platinum", body: 'Your membership has been upgraded to Platinum. Enjoy enhanced benefits.' },
    { recipient: 'Sarah Mitchell (Business Owner)', subject: 'Consumer Promotion - Emily Watson', body: 'Your consumer Emily Watson has been promoted to Platinum level.' },
  ], approvals: [
    { step: 'Requested', status: 'Approved', approvedBy: 'Admin', date: '2026-06-10', comment: 'Manual promotion for VIP customer' },
    { step: 'Commercial Review', status: 'Approved', approvedBy: 'Admin', date: '2026-06-10', comment: 'VIP - no concerns' },
    { step: 'Finance Review', status: 'Not Required', comment: 'Consumer promotion - no pricing impact' },
    { step: 'Executed', status: 'Approved', approvedBy: 'System', date: '2026-06-10', comment: 'Promotion applied immediately' },
  ], activity: [
    { action: 'Promotion Requested', date: '2026-06-10', detail: 'Gold to Platinum promotion requested by Admin' },
    { action: 'Validated', date: '2026-06-10', detail: 'All validation checks passed' },
    { action: 'Approved', date: '2026-06-10', detail: 'Approved by Admin' },
    { action: 'Membership Updated', date: '2026-06-10', detail: 'Promoted to Platinum - new F&F allocations active' },
    { action: 'Notifications Sent', date: '2026-06-10', detail: 'Consumer and business owner notified' },
    { action: 'Completed', date: '2026-06-10', detail: 'Promotion completed' },
  ], rollback: { possible: true, restores: ['Previous level: Gold', 'Previous allocations: 2 Family, 3 Friends', 'Previous theme: Gold Standard'] } },
  { id: 3, transitionId: 'TR-2026-0003', memberName: 'Maple Leaf Dental Clinic', memberType: 'Business', memberId: 'BIZ-002', currentPlan: 'Gold Pro', targetPlan: 'Silver Pro+', transitionType: 'Downgrade', status: 'Scheduled', requestedBy: 'Dr. James Wong', requestedDate: '2026-07-25', effectiveDate: '2026-09-01', reason: 'Reducing operational costs - renewal downgrade', approvalStatus: 'Pending Approval', overviewMemberInfo: [
    { label: 'Business Name', value: 'Maple Leaf Dental Clinic' }, { label: 'Membership ID', value: 'MB-2026-0002' }, { label: 'Current Status', value: 'Active' }, { label: 'Requested By', value: 'Dr. James Wong' }, { label: 'Requested Date', value: '2026-07-25' }
  ], currentMembership: [
    { label: 'Membership Tier', value: 'Gold Pro' }, { label: 'Pricing', value: '$2,499 / semi-annual' }, { label: 'Business VCards', value: '25' }, { label: 'Consumer VCards', value: '1,000' }, { label: 'Consumer Cards', value: '1,000' }, { label: 'Friends & Family', value: '12' }, { label: 'Additional Cards', value: '5' }, { label: 'Dynamic QR', value: 'Premium' }, { label: 'Premium Builder', value: 'Included' }
  ], targetMembership: [
    { label: 'Membership Tier', value: 'Silver Pro+' }, { label: 'Pricing', value: '$1,499 / year' }, { label: 'Business VCards', value: '10' }, { label: 'Consumer VCards', value: '400' }, { label: 'Consumer Cards', value: '400' }, { label: 'Friends & Family', value: '8' }, { label: 'Additional Cards', value: '4' }, { label: 'Dynamic QR', value: 'Standard' }, { label: 'Premium Builder', value: 'Not Included' }
  ], entitlementComparison: [
    { label: 'Business VCards', current: '25', target: '10', delta: '-15' },
    { label: 'Consumer VCards', current: '1,000', target: '400', delta: '-600' },
    { label: 'Consumer Cards', current: '1,000', target: '400', delta: '-600' },
    { label: 'Friends & Family', current: '12', target: '8', delta: '-4' },
    { label: 'Additional Cards', current: '5', target: '4', delta: '-1' },
    { label: 'Dynamic QR', current: 'Premium', target: 'Standard', delta: 'Downgraded' },
    { label: 'Premium Builder', current: 'Included', target: 'Not Included', delta: 'Removed' },
  ], allocationImpact: [
    { category: 'Business VCards', currentUsed: 2, currentRemaining: 23, targetAvailable: 10, result: '2 used, 8 remaining - no impact' },
    { category: 'Consumer VCards', currentUsed: 156, currentRemaining: 844, targetAvailable: 400, result: 'Restricted Allocation Mode - 156 used, 244 remaining. No new issuances until usage drops below 400.' },
    { category: 'Consumer Cards', currentUsed: 134, currentRemaining: 866, targetAvailable: 400, result: 'Restricted Allocation Mode - 134 used, 266 remaining' },
    { category: 'Friends & Family', currentUsed: 6, currentRemaining: 6, targetAvailable: 8, result: '6 used, 2 remaining - within limits' },
    { category: 'Additional Cards', currentUsed: 2, currentRemaining: 3, targetAvailable: 4, result: '2 used, 2 remaining - within limits' },
  ], validations: [
    { check: 'Membership Active', status: 'Pass', message: 'Current membership is Active' },
    { check: 'Billing Valid', status: 'Pass', message: 'Paid in full' },
    { check: 'Target Plan Exists', status: 'Pass', message: 'Silver Pro+ plan is published' },
    { check: 'Downgrade Allocation Check', status: 'Warning', message: 'Consumer VCards (156 used, 400 target) and Consumer Cards (134 used, 400 target) will enter Restricted Allocation Mode' },
    { check: 'No Conflicting Transition', status: 'Pass', message: 'No other pending transitions' },
    { check: 'Required Approvals', status: 'Warning', message: 'Awaiting Commercial Manager approval' },
  ], notifications: [
    { recipient: 'Dr. James Wong (Business Owner)', subject: 'Downgrade Scheduled - Maple Leaf Dental Clinic', body: 'Your downgrade from Gold Pro to Silver Pro+ has been scheduled for September 1, 2026.' },
    { recipient: 'Account Manager (Operations)', subject: 'Downgrade Pending - Maple Leaf Dental Clinic', body: 'A downgrade requires review due to Restricted Allocation Mode triggers.' },
  ], approvals: [
    { step: 'Requested', status: 'Approved', approvedBy: 'System', date: '2026-07-25', comment: 'Downgrade requested by business owner' },
    { step: 'Commercial Review', status: 'Pending', comment: 'Needs review - allocation restrictions apply' },
    { step: 'Finance Review', status: 'Not Required', comment: 'Downgrade - no pricing override' },
  ], activity: [
    { action: 'Downgrade Requested', date: '2026-07-25', detail: 'Downgrade from Gold Pro to Silver Pro+ requested' },
    { action: 'Validated', date: '2026-07-25', detail: 'Passed - warnings flagged for allocation restrictions' },
    { action: 'Scheduled', date: '2026-07-25', detail: 'Scheduled for September 1, 2026 (renewal date)' },
    { action: 'Awaiting Approval', date: '2026-07-25', detail: 'Pending Commercial Manager review' },
  ], rollback: { possible: true, reason: 'Not yet executed - can be cancelled before effective date', restores: ['N/A - transition not yet applied'] } },
  { id: 4, transitionId: 'TR-2026-0004', memberName: 'James Rodriguez', memberType: 'Consumer', memberId: 'CON-2026-0002', currentPlan: 'Silver', targetPlan: 'Gold', transitionType: 'Promotion', status: 'Completed', requestedBy: 'System', requestedDate: '2026-04-15', effectiveDate: '2026-04-15', reason: 'Automatic progression - family plan enrollment', approvalStatus: 'Approved', overviewMemberInfo: [
    { label: 'Consumer Name', value: 'James Rodriguez' }, { label: 'Consumer ID', value: 'CON-2026-0002' }, { label: 'Current Status', value: 'Active' }, { label: 'Requested By', value: 'System (Automatic)' }, { label: 'Requested Date', value: '2026-04-15' }
  ], currentMembership: [
    { label: 'Current Level', value: 'Silver' }, { label: 'Linked Business', value: 'Maple Leaf Dental Clinic' }, { label: 'Family Slots', value: '2' }, { label: 'Friends Slots', value: '3' }, { label: 'Additional Cards', value: '2' }
  ], targetMembership: [
    { label: 'Target Level', value: 'Gold' }, { label: 'Linked Business', value: 'Maple Leaf Dental Clinic' }, { label: 'Family Slots', value: '2' }, { label: 'Friends Slots', value: '3' }, { label: 'Additional Cards', value: '2' }
  ], entitlementComparison: [
    { label: 'Family Slots', current: '2', target: '2', delta: 'Unchanged' },
    { label: 'Friends Slots', current: '3', target: '3', delta: 'Unchanged' },
    { label: 'Additional Cards', current: '2', target: '2', delta: 'Unchanged' },
    { label: 'VCard Theme', current: 'Silver Standard', target: 'Gold Standard', delta: 'Upgraded' },
    { label: 'VCard Exchange', current: 'Disabled', target: 'Enabled', delta: 'Enabled' },
    { label: 'VCard Redeem', current: 'Enabled', target: 'Enabled', delta: 'Unchanged' },
  ], allocationImpact: [
    { category: 'Family Slots', currentUsed: 2, currentRemaining: 0, targetAvailable: 2, result: 'Unchanged - 2 used, 0 remaining' },
    { category: 'Friends Slots', currentUsed: 1, currentRemaining: 2, targetAvailable: 3, result: 'Unchanged - 1 used, 2 remaining' },
    { category: 'Additional Cards', currentUsed: 0, currentRemaining: 2, targetAvailable: 2, result: 'Unchanged - 0 used, 2 remaining' },
  ], validations: [
    { check: 'Membership Active', status: 'Pass', message: 'Current membership is Active' },
    { check: 'Engagement Threshold Met', status: 'Pass', message: 'Family plan enrollment + 6 months active' },
    { check: 'No Conflicting Transition', status: 'Pass', message: 'No other pending promotions' },
  ], notifications: [
    { recipient: 'James Rodriguez (Consumer)', subject: "You've been promoted to Gold!", body: 'Congratulations! Your membership has been upgraded to Gold.' },
  ], approvals: [
    { step: 'Requested', status: 'Approved', approvedBy: 'System', date: '2026-04-15', comment: 'Auto-approved - automatic progression' },
    { step: 'Commercial Review', status: 'Not Required', comment: 'Automatic promotion' },
    { step: 'Finance Review', status: 'Not Required', comment: 'Consumer promotion - no pricing impact' },
    { step: 'Executed', status: 'Approved', approvedBy: 'System', date: '2026-04-15', comment: 'Promotion applied automatically' },
  ], activity: [
    { action: 'Promotion Triggered', date: '2026-04-15', detail: 'Automatic progression check - Silver to Gold' },
    { action: 'Validated', date: '2026-04-15', detail: 'Engagement thresholds met' },
    { action: 'Membership Updated', date: '2026-04-15', detail: 'Promoted to Gold - VCard theme upgraded' },
    { action: 'Completed', date: '2026-04-15', detail: 'Automatic promotion completed' },
  ], rollback: { possible: true, restores: ['Previous level: Silver', 'Previous theme: Silver Standard', 'Previous VCard exchange: Disabled'] } },
  { id: 5, transitionId: 'TR-2026-0005', memberName: 'Summit Financial Advisors', memberType: 'Business', memberId: 'BIZ-008', currentPlan: 'Platinum Pro', targetPlan: 'Platinum Pro+', transitionType: 'Upgrade', status: 'Pending Approval', requestedBy: "Kevin O'Brien", requestedDate: '2026-07-28', effectiveDate: '2026-08-01', reason: 'Growing client base - need higher Consumer Card allocation', approvalStatus: 'Pending Approval', overviewMemberInfo: [
    { label: 'Business Name', value: 'Summit Financial Advisors' }, { label: 'Membership ID', value: 'MB-2026-0008' }, { label: 'Current Status', value: 'Active' }, { label: 'Requested By', value: "Kevin O'Brien" }, { label: 'Requested Date', value: '2026-07-28' }
  ], currentMembership: [
    { label: 'Tier', value: 'Platinum Pro' }, { label: 'Pricing', value: '$7,999 / year' }, { label: 'Biz VCards', value: '100' }, { label: 'Con VCards', value: '5,000' }, { label: 'Con Cards', value: '5,000' }, { label: 'F&F', value: '30' }, { label: 'Additional Cards', value: '10' }
  ], targetMembership: [
    { label: 'Tier', value: 'Platinum Pro+' }, { label: 'Pricing', value: '$9,999 / year' }, { label: 'Biz VCards', value: 'Unlimited' }, { label: 'Con VCards', value: '10,000' }, { label: 'Con Cards', value: '10,000' }, { label: 'F&F', value: '50' }, { label: 'Additional Cards', value: '20' }
  ], entitlementComparison: [
    { label: 'Business VCards', current: '100', target: 'Unlimited', delta: 'Unlimited' },
    { label: 'Consumer VCards', current: '5,000', target: '10,000', delta: '+5,000' },
    { label: 'Consumer Cards', current: '5,000', target: '10,000', delta: '+5,000' },
    { label: 'Friends & Family', current: '30', target: '50', delta: '+20' },
    { label: 'Additional Cards', current: '10', target: '20', delta: '+10' },
  ], allocationImpact: [
    { category: 'Consumer VCards', currentUsed: 789, currentRemaining: 4211, targetAvailable: 10000, result: '+5,000 additional VCards' },
    { category: 'Consumer Cards', currentUsed: 654, currentRemaining: 4346, targetAvailable: 10000, result: '+5,000 additional Cards' },
    { category: 'Friends & Family', currentUsed: 18, currentRemaining: 12, targetAvailable: 50, result: '+20 additional F&F slots' },
    { category: 'Additional Cards', currentUsed: 5, currentRemaining: 5, targetAvailable: 20, result: '+10 additional cards' },
  ], validations: [
    { check: 'Membership Active', status: 'Pass', message: 'Active' },
    { check: 'Billing Valid', status: 'Pass', message: 'Paid in full' },
    { check: 'Target Plan Exists', status: 'Pass', message: 'Platinum Pro+ is available' },
    { check: 'No Conflicting Transition', status: 'Pass', message: 'Clear' },
    { check: 'Required Approvals', status: 'Warning', message: 'Awaiting Commercial Manager approval' },
  ], notifications: [
    { recipient: "Kevin O'Brien (Business Owner)", subject: 'Upgrade Request Received - Summit Financial Advisors', body: 'Your upgrade request from Platinum Pro to Platinum Pro+ is being reviewed.' },
    { recipient: 'Commercial Manager', subject: 'Upgrade Approval Required - Summit Financial Advisors', body: 'A high-value upgrade requires your approval.' },
  ], approvals: [
    { step: 'Requested', status: 'Approved', approvedBy: 'System', date: '2026-07-28', comment: 'Upgrade initiated' },
    { step: 'Commercial Review', status: 'Pending', comment: 'High-value upgrade - requires Commercial Manager sign-off' },
    { step: 'Finance Review', status: 'Pending', comment: 'Pricing increase from $7,999 to $9,999' },
  ], activity: [
    { action: 'Upgrade Requested', date: '2026-07-28', detail: 'Platinum Pro to Platinum Pro+ upgrade requested' },
    { action: 'Validated', date: '2026-07-28', detail: 'All checks passed' },
    { action: 'Pending Approval', date: '2026-07-28', detail: 'Awaiting Commercial Manager and Finance approval' },
  ], rollback: { possible: true, reason: 'Can be cancelled before approval', restores: ['N/A - not yet executed'] } },
  { id: 6, transitionId: 'TR-2026-0006', memberName: 'Riverside Restaurant & Bar', memberType: 'Business', memberId: 'BIZ-007', currentPlan: 'Bronze', targetPlan: 'Bronze Pro', transitionType: 'Upgrade', status: 'Draft', requestedBy: 'Marco Bellini', requestedDate: '2026-07-29', effectiveDate: '', reason: 'Need Business VCard and higher Consumer Card allocation', approvalStatus: 'Draft', overviewMemberInfo: [
    { label: 'Business Name', value: 'Riverside Restaurant & Bar' }, { label: 'Membership ID', value: 'MB-2026-0007' }, { label: 'Current Status', value: 'Active' }, { label: 'Requested By', value: 'Marco Bellini' }, { label: 'Requested Date', value: '2026-07-29' }
  ], currentMembership: [
    { label: 'Tier', value: 'Bronze' }, { label: 'Pricing', value: '$299 / month' }, { label: 'Biz VCards', value: '1' }, { label: 'Con VCards', value: '50' }, { label: 'Con Cards', value: '50' }, { label: 'F&F', value: '2' }, { label: 'Additional Cards', value: '1' }
  ], targetMembership: [
    { label: 'Tier', value: 'Bronze Pro' }, { label: 'Pricing', value: '$399 / month' }, { label: 'Biz VCards', value: '3' }, { label: 'Con VCards', value: '100' }, { label: 'Con Cards', value: '100' }, { label: 'F&F', value: '3' }, { label: 'Additional Cards', value: '1' }
  ], entitlementComparison: [
    { label: 'Business VCards', current: '1', target: '3', delta: '+2' },
    { label: 'Consumer VCards', current: '50', target: '100', delta: '+50' },
    { label: 'Consumer Cards', current: '50', target: '100', delta: '+50' },
    { label: 'Friends & Family', current: '2', target: '3', delta: '+1' },
  ], allocationImpact: [
    { category: 'Business VCards', currentUsed: 1, currentRemaining: 0, targetAvailable: 3, result: '+2 Business VCards' },
    { category: 'Consumer VCards', currentUsed: 23, currentRemaining: 27, targetAvailable: 100, result: '+50 additional VCards' },
    { category: 'Consumer Cards', currentUsed: 18, currentRemaining: 32, targetAvailable: 100, result: '+50 additional Cards' },
    { category: 'Friends & Family', currentUsed: 1, currentRemaining: 1, targetAvailable: 3, result: '+1 F&F slot' },
  ], validations: [
    { check: 'Membership Active', status: 'Pass', message: 'Active' },
    { check: 'Billing Valid', status: 'Pass', message: 'Paid' },
    { check: 'Target Plan Exists', status: 'Pass', message: 'Bronze Pro available' },
    { check: 'Allocations Calculated', status: 'Pass', message: 'Calculated' },
    { check: 'No Conflicting Transition', status: 'Pass', message: 'Clear' },
  ], notifications: [], approvals: [
    { step: 'Requested', status: 'Pending', comment: 'Draft - not yet submitted' },
  ], activity: [
    { action: 'Draft Created', date: '2026-07-29', detail: 'Upgrade draft created - not yet submitted' },
  ], rollback: { possible: true, reason: 'Draft - can be deleted', restores: ['N/A - draft not yet applied'] } },
  { id: 7, transitionId: 'TR-2026-0007', memberName: 'GreenLeaf Wellness Center', memberType: 'Business', memberId: 'BIZ-005', currentPlan: 'Silver', targetPlan: 'Gold Pro', transitionType: 'Trial Conversion', status: 'Processing', requestedBy: 'Dr. Lisa Park', requestedDate: '2026-07-28', effectiveDate: '2026-08-01', reason: 'Trial conversion - upgrading to paid Gold Pro', approvalStatus: 'Pending Approval', overviewMemberInfo: [
    { label: 'Business Name', value: 'GreenLeaf Wellness Center' }, { label: 'Membership ID', value: 'MB-2026-0005' }, { label: 'Current Status', value: 'Trial' }, { label: 'Requested By', value: 'Dr. Lisa Park' }, { label: 'Requested Date', value: '2026-07-28' }
  ], currentMembership: [
    { label: 'Tier', value: 'Silver (Trial)' }, { label: 'Pricing', value: 'Free (trial ends 2026-08-01)' }, { label: 'Biz VCards', value: '5' }, { label: 'Con VCards', value: '200' }, { label: 'Con Cards', value: '200' }, { label: 'F&F', value: '5' }, { label: 'Additional Cards', value: '3' }
  ], targetMembership: [
    { label: 'Tier', value: 'Gold Pro' }, { label: 'Pricing', value: '$2,499 / semi-annual' }, { label: 'Biz VCards', value: '25' }, { label: 'Con VCards', value: '1,000' }, { label: 'Con Cards', value: '1,000' }, { label: 'F&F', value: '12' }, { label: 'Additional Cards', value: '5' }, { label: 'Features', value: 'Premium Builder, Dynamic QR Pro' }
  ], entitlementComparison: [
    { label: 'Business VCards', current: '5', target: '25', delta: '+20' },
    { label: 'Consumer VCards', current: '200', target: '1,000', delta: '+800' },
    { label: 'Consumer Cards', current: '200', target: '1,000', delta: '+800' },
    { label: 'Friends & Family', current: '5', target: '12', delta: '+7' },
    { label: 'Additional Cards', current: '3', target: '5', delta: '+2' },
    { label: 'Dynamic QR', current: 'Standard', target: 'Premium', delta: 'Upgraded' },
    { label: 'Premium Builder', current: 'Not Included', target: 'Included', delta: 'Added' },
  ], allocationImpact: [
    { category: 'Business VCards', currentUsed: 1, currentRemaining: 4, targetAvailable: 25, result: '+20 Business VCards' },
    { category: 'Consumer VCards', currentUsed: 12, currentRemaining: 188, targetAvailable: 1000, result: '+800 Consumer VCards' },
    { category: 'Consumer Cards', currentUsed: 8, currentRemaining: 192, targetAvailable: 1000, result: '+800 Consumer Cards' },
    { category: 'F&F', currentUsed: 1, currentRemaining: 4, targetAvailable: 12, result: '+7 F&F slots' },
  ], validations: [
    { check: 'Trial Active', status: 'Pass', message: 'Trial period active until August 1, 2026' },
    { check: 'Billing Valid', status: 'Pass', message: 'Payment method verified' },
    { check: 'Target Plan Exists', status: 'Pass', message: 'Gold Pro is available' },
    { check: 'No Conflicting Transition', status: 'Pass', message: 'Clear' },
    { check: 'Required Approvals', status: 'Pass', message: 'Trial conversion auto-approved' },
  ], notifications: [
    { recipient: 'Dr. Lisa Park (Business Owner)', subject: 'Your Trial is Converting to Gold Pro', body: 'Your Silver trial is converting to Gold Pro on August 1, 2026.' },
  ], approvals: [
    { step: 'Requested', status: 'Approved', approvedBy: 'System', date: '2026-07-28', comment: 'Trial conversion initiated' },
    { step: 'Commercial Review', status: 'Not Required', comment: 'Standard trial conversion' },
    { step: 'Finance Review', status: 'Not Required', comment: 'Standard pricing' },
    { step: 'Executed', status: 'Pending', comment: 'Scheduled for August 1, 2026' },
  ], activity: [
    { action: 'Trial Conversion Initiated', date: '2026-07-28', detail: 'Silver trial to Gold Pro conversion started' },
    { action: 'Validated', date: '2026-07-28', detail: 'All checks passed' },
    { action: 'Scheduled', date: '2026-07-28', detail: 'Conversion set for August 1, 2026 (trial expiry)' },
  ], rollback: { possible: true, reason: 'Can be cancelled before trial expiry', restores: ['Will revert to trial state'] } },
  { id: 8, transitionId: 'TR-2026-0008', memberName: 'Harbor Logistics Inc.', memberType: 'Business', memberId: 'BIZ-009', currentPlan: 'Gold Pro', targetPlan: 'Silver Pro+', transitionType: 'Downgrade', status: 'Failed', requestedBy: 'Jennifer Walsh', requestedDate: '2026-06-01', effectiveDate: '2026-06-15', reason: 'Cost reduction - logistics industry downturn', approvalStatus: 'Cancelled', overviewMemberInfo: [
    { label: 'Business Name', value: 'Harbor Logistics Inc.' }, { label: 'Membership ID', value: 'MB-2026-0009' }, { label: 'Current Status', value: 'Suspended' }, { label: 'Requested By', value: 'Jennifer Walsh' }, { label: 'Requested Date', value: '2026-06-01' }
  ], currentMembership: [
    { label: 'Tier', value: 'Gold Pro' }, { label: 'Pricing', value: '$2,499 / semi-annual' }, { label: 'Status', value: 'Suspended (overdue)' }, { label: 'Outstanding', value: '$2,499' }
  ], targetMembership: [
    { label: 'Tier', value: 'Silver Pro+' }, { label: 'Pricing', value: '$1,499 / year' }, { label: 'Requirement', value: 'Outstanding balance must be cleared' }
  ], entitlementComparison: [
    { label: 'Business VCards', current: '25', target: '10', delta: '-15' },
    { label: 'Consumer VCards', current: '1,000', target: '400', delta: '-600' },
    { label: 'Consumer Cards', current: '1,000', target: '400', delta: '-600' },
    { label: 'F&F', current: '12', target: '8', delta: '-4' },
    { label: 'Additional Cards', current: '5', target: '4', delta: '-1' },
  ], allocationImpact: [], validations: [
    { check: 'Membership Active', status: 'Fail', message: 'Membership is currently Suspended' },
    { check: 'Billing Valid', status: 'Fail', message: 'Outstanding balance of $2,499' },
    { check: 'Target Plan Exists', status: 'Pass', message: 'Silver Pro+ is available' },
    { check: 'No Conflicting Transition', status: 'Pass', message: 'Clear' },
  ], notifications: [], approvals: [
    { step: 'Requested', status: 'Approved', approvedBy: 'System', date: '2026-06-01' },
    { step: 'Validation', status: 'Rejected', date: '2026-06-01', comment: 'Failed: membership suspended + outstanding balance' },
  ], activity: [
    { action: 'Downgrade Requested', date: '2026-06-01', detail: 'Gold Pro to Silver Pro+ requested' },
    { action: 'Validation Failed', date: '2026-06-01', detail: 'Membership suspended and billing overdue' },
    { action: 'Failed', date: '2026-06-01', detail: 'Cannot process downgrade while membership is suspended' },
  ], rollback: { possible: false, reason: 'Transition failed before execution - no changes applied', restores: [] } },
  { id: 9, transitionId: 'TR-2026-0009', memberName: 'Prestige Auto Dealership', memberType: 'Business', memberId: 'BIZ-017', currentPlan: 'Gold', targetPlan: 'Platinum', transitionType: 'Upgrade', status: 'Scheduled', requestedBy: 'Andrew Clarke', requestedDate: '2026-07-20', effectiveDate: '2026-08-15', reason: 'Seasonal upgrade for annual sales event', approvalStatus: 'Approved', overviewMemberInfo: [
    { label: 'Business Name', value: 'Prestige Auto Dealership' }, { label: 'Membership ID', value: 'MB-2026-0017' }, { label: 'Current Status', value: 'Active' }, { label: 'Requested By', value: 'Andrew Clarke' }, { label: 'Requested Date', value: '2026-07-20' }
  ], currentMembership: [
    { label: 'Tier', value: 'Gold' }, { label: 'Pricing', value: '$1,999 / year' }, { label: 'Biz VCards', value: '25' }, { label: 'Con Cards', value: '500' }, { label: 'F&F', value: '10' }, { label: 'Additional Cards', value: '5' }, { label: 'Dynamic QR', value: 'Basic' }
  ], targetMembership: [
    { label: 'Tier', value: 'Platinum' }, { label: 'Pricing', value: '$4,999 / year' }, { label: 'Biz VCards', value: 'Unlimited' }, { label: 'Con Cards', value: '2,000' }, { label: 'F&F', value: '25' }, { label: 'Additional Cards', value: '10' }, { label: 'Dynamic QR', value: 'Premium' }
  ], entitlementComparison: [
    { label: 'Business VCards', current: '25', target: 'Unlimited', delta: 'Unlimited' },
    { label: 'Consumer Cards', current: '500', target: '2,000', delta: '+1,500' },
    { label: 'Friends & Family', current: '10', target: '25', delta: '+15' },
    { label: 'Additional Cards', current: '5', target: '10', delta: '+5' },
    { label: 'Dynamic QR', current: 'Basic', target: 'Premium', delta: 'Upgraded' },
  ], allocationImpact: [
    { category: 'Consumer Cards', currentUsed: 143, currentRemaining: 357, targetAvailable: 2000, result: '+1,500 additional Cards' },
    { category: 'Friends & Family', currentUsed: 7, currentRemaining: 3, targetAvailable: 25, result: '+15 F&F slots' },
  ], validations: [
    { check: 'Membership Active', status: 'Pass', message: 'Active' },
    { check: 'Billing Valid', status: 'Pass', message: 'Paid' },
    { check: 'Target Plan Exists', status: 'Pass', message: 'Platinum available' },
    { check: 'No Conflict', status: 'Pass', message: 'Clear' },
    { check: 'Approvals', status: 'Pass', message: 'Approved' },
  ], notifications: [], approvals: [
    { step: 'Requested', status: 'Approved', approvedBy: 'System', date: '2026-07-20' },
    { step: 'Commercial Review', status: 'Approved', approvedBy: 'Commercial Manager', date: '2026-07-21', comment: 'Seasonal upgrade - approve' },
    { step: 'Scheduled', status: 'Approved', approvedBy: 'System', date: '2026-07-21', comment: 'Scheduled for August 15' },
  ], activity: [
    { action: 'Upgrade Requested', date: '2026-07-20', detail: 'Gold to Platinum for sales event' },
    { action: 'Approved', date: '2026-07-21', detail: 'Approved by Commercial Manager' },
    { action: 'Scheduled', date: '2026-07-21', detail: 'Scheduled for August 15, 2026' },
  ], rollback: { possible: true, reason: 'Can be cancelled before effective date', restores: ['N/A - not yet applied'] } },
  { id: 10, transitionId: 'TR-2026-0010', memberName: 'Mia Robinson', memberType: 'Consumer', memberId: 'CON-2026-0017', currentPlan: 'Gold', targetPlan: 'Platinum', transitionType: 'Promotion', status: 'Completed', requestedBy: 'Admin', requestedDate: '2026-03-01', effectiveDate: '2026-03-01', reason: 'Longest-standing consumer - 18 months active', approvalStatus: 'Approved', overviewMemberInfo: [
    { label: 'Consumer Name', value: 'Mia Robinson' }, { label: 'Consumer ID', value: 'CON-2026-0017' }, { label: 'Status', value: 'Active' }, { label: 'Linked Business', value: 'Summit Financial Advisors' }, { label: 'Requested By', value: 'Admin' }
  ], currentMembership: [
    { label: 'Level', value: 'Gold' }, { label: 'Family', value: '2' }, { label: 'Friends', value: '3' }, { label: 'Additional Cards', value: '2' }
  ], targetMembership: [
    { label: 'Level', value: 'Platinum' }, { label: 'Family', value: '5' }, { label: 'Friends', value: '5' }, { label: 'Additional Cards', value: '5' }
  ], entitlementComparison: [
    { label: 'Family Slots', current: '2', target: '5', delta: '+3' },
    { label: 'Friends Slots', current: '3', target: '5', delta: '+2' },
    { label: 'Additional Cards', current: '2', target: '5', delta: '+3' },
    { label: 'VCard Theme', current: 'Gold Standard', target: 'Platinum Premium', delta: 'Upgraded' },
  ], allocationImpact: [
    { category: 'Family', currentUsed: 4, currentRemaining: -2, targetAvailable: 5, result: '+3 Family slots - 1 remaining' },
    { category: 'Friends', currentUsed: 3, currentRemaining: 0, targetAvailable: 5, result: '+2 Friends slots - 2 remaining' },
    { category: 'Additional Cards', currentUsed: 2, currentRemaining: 0, targetAvailable: 5, result: '+3 Additional cards - 3 remaining' },
  ], validations: [
    { check: 'Membership Active', status: 'Pass', message: 'Active - 18+ months' },
    { check: 'Admin Authorized', status: 'Pass', message: 'Manual promotion authorized' },
    { check: 'No Conflict', status: 'Pass', message: 'Clear' },
  ], notifications: [], approvals: [
    { step: 'Requested', status: 'Approved', approvedBy: 'Admin', date: '2026-03-01' },
    { step: 'Commercial Review', status: 'Approved', approvedBy: 'Admin', date: '2026-03-01', comment: 'Longest-standing member' },
    { step: 'Executed', status: 'Approved', approvedBy: 'System', date: '2026-03-01' },
  ], activity: [
    { action: 'Promotion Requested', date: '2026-03-01', detail: 'Gold to Platinum for 18-month anniversary' },
    { action: 'Approved', date: '2026-03-01', detail: 'Approved by Admin' },
    { action: 'Completed', date: '2026-03-01', detail: 'Promotion applied' },
  ], rollback: { possible: true, restores: ['Previous level: Gold', 'Previous allocations: 2 Family, 3 Friends, 2 Additional Cards'] } },
  { id: 11, transitionId: 'TR-2026-0011', memberName: 'Charlotte Davis', memberType: 'Consumer', memberId: 'CON-2026-0011', currentPlan: 'Gold', targetPlan: 'Platinum', transitionType: 'Complimentary Upgrade', status: 'Completed', requestedBy: 'Super Admin', requestedDate: '2026-07-15', effectiveDate: '2026-07-15', reason: 'Government partnership - complimentary upgrade', approvalStatus: 'Approved', overviewMemberInfo: [
    { label: 'Consumer Name', value: 'Charlotte Davis' }, { label: 'Consumer ID', value: 'CON-2026-0011' }, { label: 'Status', value: 'Active' }, { label: 'Linked Business', value: 'Metro Transit Authority' }, { label: 'Requested By', value: 'Super Admin' }
  ], currentMembership: [
    { label: 'Level', value: 'Gold' }, { label: 'Family', value: '3' }, { label: 'Friends', value: '5' }, { label: 'Additional Cards', value: '3' }
  ], targetMembership: [
    { label: 'Level', value: 'Platinum' }, { label: 'Family', value: '5' }, { label: 'Friends', value: '5' }, { label: 'Additional Cards', value: '5' }
  ], entitlementComparison: [
    { label: 'Family Slots', current: '3', target: '5', delta: '+2' },
    { label: 'Additional Cards', current: '3', target: '5', delta: '+2' },
    { label: 'VCard Theme', current: 'Gold Standard', target: 'Platinum Premium', delta: 'Upgraded' },
  ], allocationImpact: [
    { category: 'Family', currentUsed: 3, currentRemaining: 0, targetAvailable: 5, result: '+2 Family slots' },
    { category: 'Additional Cards', currentUsed: 2, currentRemaining: 1, targetAvailable: 5, result: '+2 Additional cards' },
  ], validations: [
    { check: 'Membership Active', status: 'Pass', message: 'Active' },
    { check: 'Government Program', status: 'Pass', message: 'Complimentary program authorized' },
    { check: 'No Conflict', status: 'Pass', message: 'Clear' },
  ], notifications: [], approvals: [
    { step: 'Requested', status: 'Approved', approvedBy: 'Super Admin', date: '2026-07-15' },
    { step: 'Executed', status: 'Approved', approvedBy: 'System', date: '2026-07-15' },
  ], activity: [
    { action: 'Complimentary Upgrade Requested', date: '2026-07-15', detail: 'Gold to Platinum - government program' },
    { action: 'Approved', date: '2026-07-15', detail: 'Approved by Super Admin' },
    { action: 'Completed', date: '2026-07-15', detail: 'Upgrade applied' },
  ], rollback: { possible: true, restores: ['Previous level: Gold', 'Previous F&F allocations'] } },
  { id: 12, transitionId: 'TR-2026-0012', memberName: 'Pinnacle Marketing Solutions', memberType: 'Business', memberId: 'BIZ-006', currentPlan: 'Bronze Pro+', targetPlan: 'Silver', transitionType: 'Upgrade', status: 'Completed', requestedBy: 'Alex Thompson', requestedDate: '2026-07-10', effectiveDate: '2026-07-15', reason: 'Growing client portfolio - need higher allocations', approvalStatus: 'Approved', overviewMemberInfo: [
    { label: 'Business', value: 'Pinnacle Marketing Solutions' }, { label: 'ID', value: 'MB-2026-0006' }, { label: 'Status', value: 'Active' }, { label: 'Requested By', value: 'Alex Thompson' }, { label: 'Date', value: '2026-07-10' }
  ], currentMembership: [
    { label: 'Tier', value: 'Bronze Pro+' }, { label: 'Pricing', value: '$599 / month' }, { label: 'Biz VCards', value: '5' }, { label: 'Con VCards', value: '150' }, { label: 'Con Cards', value: '150' }, { label: 'F&F', value: '4' }
  ], targetMembership: [
    { label: 'Tier', value: 'Silver' }, { label: 'Pricing', value: '$999 / month' }, { label: 'Biz VCards', value: '10' }, { label: 'Con VCards', value: '400' }, { label: 'Con Cards', value: '400' }, { label: 'F&F', value: '8' }
  ], entitlementComparison: [
    { label: 'Business VCards', current: '5', target: '10', delta: '+5' },
    { label: 'Consumer VCards', current: '150', target: '400', delta: '+250' },
    { label: 'Consumer Cards', current: '150', target: '400', delta: '+250' },
    { label: 'F&F', current: '4', target: '8', delta: '+4' },
  ], allocationImpact: [
    { category: 'Consumer VCards', currentUsed: 45, currentRemaining: 105, targetAvailable: 400, result: '+250 additional VCards' },
    { category: 'Consumer Cards', currentUsed: 38, currentRemaining: 112, targetAvailable: 400, result: '+250 additional Cards' },
    { category: 'F&F', currentUsed: 2, currentRemaining: 2, targetAvailable: 8, result: '+4 F&F slots' },
  ], validations: [
    { check: 'Active', status: 'Pass', message: 'Active' },
    { check: 'Billing', status: 'Pass', message: 'Paid' },
    { check: 'Target Plan', status: 'Pass', message: 'Silver available' },
    { check: 'No Conflict', status: 'Pass', message: 'Clear' },
  ], notifications: [], approvals: [
    { step: 'Requested', status: 'Approved', approvedBy: 'System', date: '2026-07-10' },
    { step: 'Commercial Review', status: 'Approved', approvedBy: 'Commercial Manager', date: '2026-07-11' },
    { step: 'Executed', status: 'Approved', approvedBy: 'System', date: '2026-07-15' },
  ], activity: [
    { action: 'Upgrade Requested', date: '2026-07-10', detail: 'Bronze Pro+ to Silver' },
    { action: 'Approved', date: '2026-07-11', detail: 'Approved' },
    { action: 'Completed', date: '2026-07-15', detail: 'Upgrade applied' },
  ], rollback: { possible: true, restores: ['Previous tier: Bronze Pro+', 'Previous allocations'] } },
  { id: 13, transitionId: 'TR-2026-0013', memberName: 'Evergreen Property Management', memberType: 'Business', memberId: 'BIZ-023', currentPlan: 'Silver', targetPlan: 'Bronze Pro', transitionType: 'Downgrade', status: 'Cancelled', requestedBy: 'William Chen', requestedDate: '2026-06-10', effectiveDate: '2026-07-01', reason: 'Business downsizing', approvalStatus: 'Cancelled', overviewMemberInfo: [
    { label: 'Business', value: 'Evergreen Property Management' }, { label: 'ID', value: 'MB-2026-0023' }, { label: 'Status', value: 'Suspended' }, { label: 'Requested By', value: 'William Chen' }
  ], currentMembership: [
    { label: 'Tier', value: 'Silver' }, { label: 'Pricing', value: '$999 / month' }, { label: 'Biz VCards', value: '5' }, { label: 'Con VCards', value: '200' }, { label: 'F&F', value: '5' }
  ], targetMembership: [
    { label: 'Tier', value: 'Bronze Pro' }, { label: 'Pricing', value: '$399 / month' }, { label: 'Biz VCards', value: '3' }, { label: 'Con VCards', value: '100' }, { label: 'F&F', value: '3' }
  ], entitlementComparison: [
    { label: 'Business VCards', current: '5', target: '3', delta: '-2' },
    { label: 'Consumer VCards', current: '200', target: '100', delta: '-100' },
    { label: 'Friends & Family', current: '5', target: '3', delta: '-2' },
  ], allocationImpact: [
    { category: 'Consumer VCards', currentUsed: 56, currentRemaining: 144, targetAvailable: 100, result: 'Restricted Allocation Mode - 56 used, 44 remaining' },
  ], validations: [
    { check: 'Membership Active', status: 'Fail', message: 'Membership is Suspended' },
    { check: 'Billing Valid', status: 'Fail', message: '$2,997 outstanding' },
  ], notifications: [], approvals: [
    { step: 'Requested', status: 'Rejected', date: '2026-06-15', comment: 'Cancelled by business owner' },
  ], activity: [
    { action: 'Downgrade Requested', date: '2026-06-10', detail: 'Downgrade requested by Evergreen Property Management' },
    { action: 'Cancelled', date: '2026-06-15', detail: 'Cancelled by William Chen' },
  ], rollback: { possible: false, reason: 'Cancelled before execution', restores: [] } },
  { id: 14, transitionId: 'TR-2026-0014', memberName: 'Benjamin Scott', memberType: 'Consumer', memberId: 'CON-2026-0020', currentPlan: 'Bronze', targetPlan: 'Silver', transitionType: 'Promotion', status: 'Failed', requestedBy: 'System', requestedDate: '2026-06-15', effectiveDate: '', reason: 'Automatic progression check - threshold met but business suspended', approvalStatus: 'Failed', overviewMemberInfo: [
    { label: 'Consumer Name', value: 'Benjamin Scott' }, { label: 'Consumer ID', value: 'CON-2026-0020' }, { label: 'Status', value: 'Suspended' }, { label: 'Linked Business', value: 'Evergreen Property Management' }
  ], currentMembership: [
    { label: 'Level', value: 'Bronze' }, { label: 'Status', value: 'Suspended' }, { label: 'Linked Business Status', value: 'Suspended' }
  ], targetMembership: [
    { label: 'Level', value: 'Silver' }, { label: 'Requirement', value: 'Linked business must be active' }
  ], entitlementComparison: [
    { label: 'Family Slots', current: '2', target: '2', delta: 'Unchanged' },
    { label: 'Friends Slots', current: '3', target: '3', delta: 'Unchanged' },
    { label: 'VCard Theme', current: 'Bronze Basic', target: 'Silver Standard', delta: 'Upgraded' },
    { label: 'VCard Exchange', current: 'Disabled', target: 'Enabled', delta: 'Enabled' },
  ], allocationImpact: [], validations: [
    { check: 'Membership Active', status: 'Fail', message: 'Consumer membership is Suspended' },
    { check: 'Linked Business Active', status: 'Fail', message: 'Evergreen Property Management is Suspended' },
    { check: 'Engagement Threshold Met', status: 'Pass', message: 'Threshold met' },
  ], notifications: [], approvals: [
    { step: 'Automatic Check', status: 'Rejected', date: '2026-06-15', comment: 'Failed: consumer and linked business are suspended' },
  ], activity: [
    { action: 'Automatic Promotion Check', date: '2026-06-15', detail: 'Bronze to Silver eligibility check' },
    { action: 'Validation Failed', date: '2026-06-15', detail: 'Membership suspended - cannot promote' },
  ], rollback: { possible: false, reason: 'No changes applied', restores: [] } },
  { id: 15, transitionId: 'TR-2026-0015', memberName: 'TechVantage Consulting', memberType: 'Business', memberId: 'BIZ-013', currentPlan: 'Silver Pro+', targetPlan: 'Gold Pro', transitionType: 'Upgrade', status: 'Pending Approval', requestedBy: 'Raj Patel', requestedDate: '2026-07-28', effectiveDate: '2026-08-15', reason: 'Expanding team - need more Business VCards and allocations', approvalStatus: 'Pending Approval', overviewMemberInfo: [
    { label: 'Business', value: 'TechVantage Consulting' }, { label: 'ID', value: 'MB-2026-0013' }, { label: 'Status', value: 'Active' }, { label: 'Requested By', value: 'Raj Patel' }, { label: 'Date', value: '2026-07-28' }
  ], currentMembership: [
    { label: 'Tier', value: 'Silver Pro+' }, { label: 'Pricing', value: '$1,499 / year' }, { label: 'Biz VCards', value: '10' }, { label: 'Con VCards', value: '400' }, { label: 'Con Cards', value: '400' }, { label: 'F&F', value: '8' }, { label: 'Additional Cards', value: '4' }
  ], targetMembership: [
    { label: 'Tier', value: 'Gold Pro' }, { label: 'Pricing', value: '$2,499 / semi-annual' }, { label: 'Biz VCards', value: '25' }, { label: 'Con VCards', value: '1,000' }, { label: 'Con Cards', value: '1,000' }, { label: 'F&F', value: '12' }, { label: 'Additional Cards', value: '5' }, { label: 'Dynamic QR', value: 'Premium' }
  ], entitlementComparison: [
    { label: 'Business VCards', current: '10', target: '25', delta: '+15' },
    { label: 'Consumer VCards', current: '400', target: '1,000', delta: '+600' },
    { label: 'Consumer Cards', current: '400', target: '1,000', delta: '+600' },
    { label: 'F&F', current: '8', target: '12', delta: '+4' },
    { label: 'Dynamic QR', current: 'Standard', target: 'Premium', delta: 'Upgraded' },
  ], allocationImpact: [
    { category: 'Biz VCards', currentUsed: 3, currentRemaining: 7, targetAvailable: 25, result: '+15' },
    { category: 'Con VCards', currentUsed: 134, currentRemaining: 266, targetAvailable: 1000, result: '+600' },
    { category: 'Con Cards', currentUsed: 112, currentRemaining: 288, targetAvailable: 1000, result: '+600' },
    { category: 'F&F', currentUsed: 4, currentRemaining: 4, targetAvailable: 12, result: '+4' },
  ], validations: [
    { check: 'Active', status: 'Pass', message: 'Active' },
    { check: 'Billing', status: 'Pass', message: 'Paid' },
    { check: 'Target Plan', status: 'Pass', message: 'Available' },
    { check: 'No Conflict', status: 'Pass', message: 'Clear' },
    { check: 'Approvals', status: 'Warning', message: 'Pending approval' },
  ], notifications: [], approvals: [
    { step: 'Requested', status: 'Approved', approvedBy: 'System', date: '2026-07-28' },
    { step: 'Commercial Review', status: 'Pending' },
  ], activity: [
    { action: 'Upgrade Requested', date: '2026-07-28', detail: 'Silver Pro+ to Gold Pro' },
    { action: 'Validated', date: '2026-07-28', detail: 'All checks passed' },
    { action: 'Pending Approval', date: '2026-07-28', detail: 'Awaiting Commercial Manager' },
  ], rollback: { possible: true, reason: 'Can be cancelled before approval', restores: [] } },
  { id: 16, transitionId: 'TR-2026-0016', memberName: 'Sophia Kim', memberType: 'Consumer', memberId: 'CON-2026-0003', currentPlan: 'Bronze', targetPlan: 'Silver', transitionType: 'Promotional Upgrade', status: 'Scheduled', requestedBy: 'Admin', requestedDate: '2026-07-25', effectiveDate: '2026-08-01', reason: 'Student excellence program - 3-month promotional upgrade', approvalStatus: 'Approved', overviewMemberInfo: [
    { label: 'Consumer Name', value: 'Sophia Kim' }, { label: 'Consumer ID', value: 'CON-2026-0003' }, { label: 'Status', value: 'Active' }, { label: 'Linked Business', value: 'BrightFuture Academy' }, { label: 'Requested By', value: 'Admin' }
  ], currentMembership: [
    { label: 'Level', value: 'Bronze' }, { label: 'Family', value: '1' }, { label: 'Friends', value: '1' }, { label: 'Additional Cards', value: '0' }
  ], targetMembership: [
    { label: 'Level', value: 'Silver (Promotional - 3 months)' }, { label: 'Family', value: '2' }, { label: 'Friends', value: '2' }, { label: 'Additional Cards', value: '1' }, { label: 'Expiry', value: '2026-10-31 (auto-downgrade)' }
  ], entitlementComparison: [
    { label: 'Family Slots', current: '1', target: '2', delta: '+1' },
    { label: 'Friends Slots', current: '1', target: '2', delta: '+1' },
    { label: 'Additional Cards', current: '0', target: '1', delta: '+1' },
    { label: 'VCard Theme', current: 'Bronze Basic', target: 'Silver Standard', delta: 'Upgraded' },
    { label: 'VCard Exchange', current: 'Disabled', target: 'Enabled', delta: 'Enabled' },
  ], allocationImpact: [
    { category: 'Family', currentUsed: 1, currentRemaining: 0, targetAvailable: 2, result: '+1' },
    { category: 'Friends', currentUsed: 2, currentRemaining: -1, targetAvailable: 2, result: 'At limit' },
    { category: 'Additional Cards', currentUsed: 0, currentRemaining: 0, targetAvailable: 1, result: '+1' },
  ], validations: [
    { check: 'Active', status: 'Pass', message: 'Active' },
    { check: 'Promotional Period', status: 'Pass', message: '3-month promo - auto-expire Oct 31' },
    { check: 'No Conflict', status: 'Pass', message: 'Clear' },
  ], notifications: [
    { recipient: 'Sophia Kim (Consumer)', subject: "You've received a Promotional Upgrade!", body: 'Your membership has been upgraded to Silver for 3 months.' },
    { recipient: 'BrightFuture Academy', subject: 'Student Promotional Upgrade - Sophia Kim', body: 'Your student Sophia Kim has received a promotional Silver upgrade.' },
  ], approvals: [
    { step: 'Requested', status: 'Approved', approvedBy: 'Admin', date: '2026-07-25' },
    { step: 'Scheduled', status: 'Approved', approvedBy: 'System', date: '2026-07-25', comment: 'Effective August 1, expires October 31' },
  ], activity: [
    { action: 'Promotional Upgrade Initiated', date: '2026-07-25', detail: 'Bronze to Silver (promotional - 3 months)' },
    { action: 'Scheduled', date: '2026-07-25', detail: 'Effective August 1, 2026' },
  ], rollback: { possible: true, reason: 'Can be cancelled before effective date', restores: ['N/A - not yet applied'] } },
  { id: 17, transitionId: 'TR-2026-0017', memberName: 'Great Lakes Brewing Co.', memberType: 'Business', memberId: 'BIZ-024', currentPlan: 'Silver Pro', targetPlan: 'Gold Pro', transitionType: 'Upgrade', status: 'Completed', requestedBy: "Patrick O'Sullivan", requestedDate: '2026-07-01', effectiveDate: '2026-07-05', reason: 'Expanding distribution - need more consumer cards', approvalStatus: 'Approved', overviewMemberInfo: [
    { label: 'Business', value: 'Great Lakes Brewing Co.' }, { label: 'ID', value: 'MB-2026-0024' }, { label: 'Status', value: 'Active' }, { label: 'Requested By', value: "Patrick O'Sullivan" }, { label: 'Date', value: '2026-07-01' }
  ], currentMembership: [
    { label: 'Tier', value: 'Silver Pro' }, { label: 'Pricing', value: '$1,299 / semi-annual' }, { label: 'Con Cards', value: '300' }, { label: 'F&F', value: '7' }
  ], targetMembership: [
    { label: 'Tier', value: 'Gold Pro' }, { label: 'Pricing', value: '$2,499 / semi-annual' }, { label: 'Con Cards', value: '1,000' }, { label: 'F&F', value: '12' }
  ], entitlementComparison: [
    { label: 'Consumer Cards', current: '300', target: '1,000', delta: '+700' },
    { label: 'F&F', current: '7', target: '12', delta: '+5' },
    { label: 'Dynamic QR', current: 'Standard', target: 'Premium', delta: 'Upgraded' },
    { label: 'Analytics', current: 'Standard', target: 'Advanced', delta: 'Upgraded' },
  ], allocationImpact: [
    { category: 'Con Cards', currentUsed: 76, currentRemaining: 224, targetAvailable: 1000, result: '+700' },
    { category: 'F&F', currentUsed: 4, currentRemaining: 3, targetAvailable: 12, result: '+5' },
  ], validations: [
    { check: 'Active', status: 'Pass', message: 'Active' },
    { check: 'Billing', status: 'Pass', message: 'Paid' },
    { check: 'Target Plan', status: 'Pass', message: 'Available' },
  ], notifications: [], approvals: [
    { step: 'Requested', status: 'Approved', approvedBy: 'System', date: '2026-07-01' },
    { step: 'Executed', status: 'Approved', approvedBy: 'System', date: '2026-07-05' },
  ], activity: [
    { action: 'Upgrade Requested', date: '2026-07-01', detail: 'Silver Pro to Gold Pro upgrade requested' },
    { action: 'Completed', date: '2026-07-05', detail: 'Silver Pro to Gold Pro' },
  ], rollback: { possible: true, restores: ['Previous tier: Silver Pro', 'Previous allocations'] } },
  { id: 18, transitionId: 'TR-2026-0018', memberName: 'Olivia Thompson', memberType: 'Consumer', memberId: 'CON-2026-0005', currentPlan: 'Silver', targetPlan: 'Gold', transitionType: 'Promotion', status: 'Completed', requestedBy: 'Operations Manager', requestedDate: '2026-07-01', effectiveDate: '2026-07-01', reason: 'High-value customer - multiple service bookings', approvalStatus: 'Approved', overviewMemberInfo: [
    { label: 'Consumer', value: 'Olivia Thompson' }, { label: 'Consumer ID', value: 'CON-2026-0005' }, { label: 'Status', value: 'Active' }, { label: 'Linked Business', value: 'Prestige Auto Dealership' }
  ], currentMembership: [
    { label: 'Level', value: 'Silver' }, { label: 'Family', value: '2' }, { label: 'Friends', value: '3' }, { label: 'Additional Cards', value: '2' }
  ], targetMembership: [
    { label: 'Level', value: 'Gold' }, { label: 'Family', value: '3' }, { label: 'Friends', value: '5' }, { label: 'Additional Cards', value: '3' }
  ], entitlementComparison: [
    { label: 'Family Slots', current: '2', target: '3', delta: '+1' },
    { label: 'Friends Slots', current: '3', target: '5', delta: '+2' },
    { label: 'Additional Cards', current: '2', target: '3', delta: '+1' },
    { label: 'VCard Theme', current: 'Silver Standard', target: 'Gold Standard', delta: 'Upgraded' },
  ], allocationImpact: [
    { category: 'Family', currentUsed: 2, currentRemaining: 0, targetAvailable: 3, result: '+1' },
    { category: 'Friends', currentUsed: 2, currentRemaining: 1, targetAvailable: 5, result: '+2' },
  ], validations: [
    { check: 'Active', status: 'Pass', message: 'Active' },
    { check: 'Manual Promotion', status: 'Pass', message: 'Authorized by Operations Manager' },
  ], notifications: [], approvals: [
    { step: 'Requested', status: 'Approved', approvedBy: 'Operations Manager', date: '2026-07-01' },
    { step: 'Executed', status: 'Approved', approvedBy: 'System', date: '2026-07-01' },
  ], activity: [
    { action: 'Promotion Requested', date: '2026-07-01', detail: 'Silver to Gold - VIP customer' },
    { action: 'Completed', date: '2026-07-01', detail: 'Promotion from Silver to Gold completed' },
  ], rollback: { possible: true, restores: ['Previous level: Silver', 'Previous F&F allocations'] } },
  { id: 19, transitionId: 'TR-2026-0019', memberName: 'Cornerstone Realty Group', memberType: 'Business', memberId: 'BIZ-004', currentPlan: 'Gold', targetPlan: 'Gold Pro', transitionType: 'Upgrade', status: 'Completed', requestedBy: 'Emily Rodriguez', requestedDate: '2026-07-15', effectiveDate: '2026-07-20', reason: 'Need premium builder and higher consumer card allocation', approvalStatus: 'Approved', overviewMemberInfo: [
    { label: 'Business', value: 'Cornerstone Realty Group' }, { label: 'ID', value: 'MB-2026-0004' }, { label: 'Status', value: 'Active' }, { label: 'Requested By', value: 'Emily Rodriguez' }
  ], currentMembership: [
    { label: 'Tier', value: 'Gold' }, { label: 'Pricing', value: '$1,999 / year' }, { label: 'Con Cards', value: '500' }, { label: 'F&F', value: '10' }
  ], targetMembership: [
    { label: 'Tier', value: 'Gold Pro' }, { label: 'Pricing', value: '$2,499 / semi-annual' }, { label: 'Con Cards', value: '1,000' }, { label: 'F&F', value: '12' }, { label: 'Premium Builder', value: 'Included' }
  ], entitlementComparison: [
    { label: 'Consumer Cards', current: '500', target: '1,000', delta: '+500' },
    { label: 'F&F', current: '10', target: '12', delta: '+2' },
    { label: 'Premium Builder', current: 'Not Included', target: 'Included', delta: 'Added' },
  ], allocationImpact: [
    { category: 'Con Cards', currentUsed: 72, currentRemaining: 428, targetAvailable: 1000, result: '+500' },
    { category: 'F&F', currentUsed: 4, currentRemaining: 6, targetAvailable: 12, result: '+2' },
  ], validations: [
    { check: 'Active', status: 'Pass', message: 'Active' },
    { check: 'Billing', status: 'Pass', message: 'Paid' },
  ], notifications: [], approvals: [
    { step: 'Requested', status: 'Approved', approvedBy: 'System', date: '2026-07-15' },
    { step: 'Executed', status: 'Approved', approvedBy: 'System', date: '2026-07-20' },
  ], activity: [
    { action: 'Upgrade Requested', date: '2026-07-15', detail: 'Gold to Gold Pro upgrade requested' },
    { action: 'Completed', date: '2026-07-20', detail: 'Gold to Gold Pro' },
  ], rollback: { possible: true, restores: ['Previous tier: Gold', 'Previous allocations'] } },
  { id: 20, transitionId: 'TR-2026-0020', memberName: 'Liam Gallagher', memberType: 'Consumer', memberId: 'CON-2026-0010', currentPlan: 'Bronze', targetPlan: 'Silver', transitionType: 'Promotion', status: 'Completed', requestedBy: 'System', requestedDate: '2026-04-01', effectiveDate: '2026-04-01', reason: '6 months active - 4 referrals', approvalStatus: 'Approved', overviewMemberInfo: [
    { label: 'Consumer', value: 'Liam Gallagher' }, { label: 'Consumer ID', value: 'CON-2026-0010' }, { label: 'Status', value: 'Active' }, { label: 'Linked Business', value: 'TechVantage Consulting' }
  ], currentMembership: [
    { label: 'Level', value: 'Bronze' }, { label: 'Family', value: '1' }, { label: 'Friends', value: '1' }, { label: 'Additional Cards', value: '0' }
  ], targetMembership: [
    { label: 'Level', value: 'Silver' }, { label: 'Family', value: '2' }, { label: 'Friends', value: '2' }, { label: 'Additional Cards', value: '1' }
  ], entitlementComparison: [
    { label: 'Family', current: '1', target: '2', delta: '+1' },
    { label: 'Friends', current: '1', target: '2', delta: '+1' },
    { label: 'Additional Cards', current: '0', target: '1', delta: '+1' },
    { label: 'VCard Theme', current: 'Bronze Basic', target: 'Silver Standard', delta: 'Upgraded' },
    { label: 'VCard Exchange', current: 'Disabled', target: 'Enabled', delta: 'Enabled' },
  ], allocationImpact: [
    { category: 'Family', currentUsed: 1, currentRemaining: 0, targetAvailable: 2, result: '+1' },
    { category: 'Friends', currentUsed: 2, currentRemaining: -1, targetAvailable: 2, result: 'At limit' },
  ], validations: [
    { check: 'Active', status: 'Pass', message: 'Active' },
    { check: 'Threshold Met', status: 'Pass', message: '4 referrals + 6 months' },
  ], notifications: [], approvals: [
    { step: 'Automatic', status: 'Approved', approvedBy: 'System', date: '2026-04-01' },
  ], activity: [
    { action: 'Automatic Promotion', date: '2026-04-01', detail: 'Bronze to Silver' },
  ], rollback: { possible: true, restores: ['Previous level: Bronze', 'Previous allocations'] } },
  { id: 21, transitionId: 'TR-2026-0021', memberName: 'Northwest Community Health', memberType: 'Business', memberId: 'BIZ-019', currentPlan: 'Gold Pro', targetPlan: 'Gold Pro+', transitionType: 'Upgrade', status: 'Draft', requestedBy: 'Dr. Sarah Connors', requestedDate: '2026-07-29', effectiveDate: '', reason: 'Community program expansion - need higher allocations', approvalStatus: 'Draft', overviewMemberInfo: [
    { label: 'Business', value: 'Northwest Community Health' }, { label: 'ID', value: 'MB-2026-0019' }, { label: 'Status', value: 'Active' }, { label: 'Requested By', value: 'Dr. Sarah Connors' }, { label: 'Date', value: '2026-07-29' }
  ], currentMembership: [
    { label: 'Tier', value: 'Gold Pro' }, { label: 'Pricing', value: '$2,499 / semi-annual (50% promo)' }, { label: 'Con Cards', value: '1,000' }, { label: 'F&F', value: '12' }, { label: 'Additional Cards', value: '5' }
  ], targetMembership: [
    { label: 'Tier', value: 'Gold Pro+' }, { label: 'Pricing', value: '$2,999 / semi-annual' }, { label: 'Con Cards', value: '2,000' }, { label: 'F&F', value: '15' }, { label: 'Additional Cards', value: '8' }
  ], entitlementComparison: [
    { label: 'Consumer Cards', current: '1,000', target: '2,000', delta: '+1,000' },
    { label: 'F&F', current: '12', target: '15', delta: '+3' },
    { label: 'Additional Cards', current: '5', target: '8', delta: '+3' },
    { label: 'Future Integrations', current: 'MCOM Solutions', target: 'MCOM + Rewards + Mall', delta: 'Expanded' },
  ], allocationImpact: [
    { category: 'Con Cards', currentUsed: 198, currentRemaining: 802, targetAvailable: 2000, result: '+1,000' },
    { category: 'F&F', currentUsed: 8, currentRemaining: 4, targetAvailable: 15, result: '+3' },
    { category: 'Additional Cards', currentUsed: 2, currentRemaining: 3, targetAvailable: 8, result: '+3' },
  ], validations: [
    { check: 'Active', status: 'Pass', message: 'Active' },
    { check: 'Billing', status: 'Pass', message: 'Promotional pricing active' },
    { check: 'Target Plan', status: 'Pass', message: 'Available' },
  ], notifications: [], approvals: [
    { step: 'Draft', status: 'Pending', comment: 'Not yet submitted' },
  ], activity: [
    { action: 'Draft Created', date: '2026-07-29', detail: 'Gold Pro to Gold Pro+ draft' },
  ], rollback: { possible: true, reason: 'Draft - can be deleted', restores: [] } },
  { id: 22, transitionId: 'TR-2026-0022', memberName: 'Noah Wilson', memberType: 'Consumer', memberId: 'CON-2026-0008', currentPlan: 'Gold', targetPlan: 'Platinum', transitionType: 'Manual Override', status: 'Pending Approval', requestedBy: 'Admin', requestedDate: '2026-07-28', effectiveDate: '2026-08-01', reason: 'Admin override - exceptional consumer performance', approvalStatus: 'Pending Approval', overviewMemberInfo: [
    { label: 'Consumer', value: 'Noah Wilson' }, { label: 'Consumer ID', value: 'CON-2026-0008' }, { label: 'Status', value: 'Active' }, { label: 'Linked Business', value: 'Summit Financial Advisors' }, { label: 'Requested By', value: 'Admin' }
  ], currentMembership: [
    { label: 'Level', value: 'Gold' }, { label: 'Family', value: '2' }, { label: 'Friends', value: '3' }, { label: 'Additional Cards', value: '2' }
  ], targetMembership: [
    { label: 'Level', value: 'Platinum' }, { label: 'Family', value: '5' }, { label: 'Friends', value: '5' }, { label: 'Additional Cards', value: '5' }
  ], entitlementComparison: [
    { label: 'Family', current: '2', target: '5', delta: '+3' },
    { label: 'Friends', current: '3', target: '5', delta: '+2' },
    { label: 'Additional Cards', current: '2', target: '5', delta: '+3' },
    { label: 'VCard Theme', current: 'Gold Standard', target: 'Platinum Premium', delta: 'Upgraded' },
  ], allocationImpact: [
    { category: 'Family', currentUsed: 2, currentRemaining: 0, targetAvailable: 5, result: '+3' },
    { category: 'Friends', currentUsed: 1, currentRemaining: 2, targetAvailable: 5, result: '+2' },
    { category: 'Additional Cards', currentUsed: 0, currentRemaining: 2, targetAvailable: 5, result: '+3' },
  ], validations: [
    { check: 'Active', status: 'Pass', message: 'Active' },
    { check: 'Admin Authorized', status: 'Pass', message: 'Admin override authorized' },
    { check: 'Super Admin Approval', status: 'Warning', message: 'Requires Super Admin sign-off for override' },
  ], notifications: [], approvals: [
    { step: 'Requested', status: 'Approved', approvedBy: 'Admin', date: '2026-07-28' },
    { step: 'Super Admin Review', status: 'Pending', comment: 'Override requires Super Admin approval' },
  ], activity: [
    { action: 'Manual Override Requested', date: '2026-07-28', detail: 'Gold to Platinum - admin override' },
    { action: 'Pending Super Admin', date: '2026-07-28', detail: 'Awaiting Super Admin approval' },
  ], rollback: { possible: true, reason: 'Can be rejected before execution', restores: [] } },
  { id: 23, transitionId: 'TR-2026-0023', memberName: 'Blue Ocean Aquatics', memberType: 'Business', memberId: 'BIZ-014', currentPlan: 'Bronze', targetPlan: 'Bronze Pro', transitionType: 'Manual Override', status: 'Rolled Back', requestedBy: 'Admin', requestedDate: '2026-05-01', effectiveDate: '2026-05-15', reason: 'Admin override - trial upgrade', approvalStatus: 'Rolled Back', overviewMemberInfo: [
    { label: 'Business', value: 'Blue Ocean Aquatics' }, { label: 'ID', value: 'MB-2026-0014' }, { label: 'Status', value: 'Cancelled' }, { label: 'Requested By', value: 'Admin' }
  ], currentMembership: [
    { label: 'Tier', value: 'Bronze' }, { label: 'Pricing', value: '$299 / month' }
  ], targetMembership: [
    { label: 'Tier', value: 'Bronze Pro' }, { label: 'Pricing', value: '$399 / month' }
  ], entitlementComparison: [
    { label: 'Business VCards', current: '1', target: '3', delta: '+2' },
    { label: 'Consumer Cards', current: '50', target: '100', delta: '+50' },
    { label: 'F&F', current: '2', target: '3', delta: '+1' },
  ], allocationImpact: [
    { category: 'Con Cards', currentUsed: 12, currentRemaining: 38, targetAvailable: 100, result: '+50' },
  ], validations: [
    { check: 'Active', status: 'Pass', message: 'Was active at time' },
    { check: 'Billing', status: 'Pass', message: 'Paid' },
  ], notifications: [], approvals: [
    { step: 'Requested', status: 'Approved', approvedBy: 'Admin', date: '2026-05-01' },
    { step: 'Executed', status: 'Approved', approvedBy: 'System', date: '2026-05-15' },
    { step: 'Rolled Back', status: 'Approved', approvedBy: 'Super Admin', date: '2026-05-20', comment: 'Override was applied in error - rollback executed' },
  ], activity: [
    { action: 'Manual Override Applied', date: '2026-05-15', detail: 'Bronze to Bronze Pro - admin override' },
    { action: 'Rollback Initiated', date: '2026-05-20', detail: 'Rolled back by Super Admin - applied in error' },
    { action: 'Rollback Completed', date: '2026-05-20', detail: 'Restored to Bronze membership' },
  ], rollback: { possible: true, reason: 'Already rolled back', restores: ['Previous tier: Bronze (restored)', 'Previous allocations: Restored', 'Version Engine record created'] } },
  { id: 24, transitionId: 'TR-2026-0024', memberName: 'Emma Watson', memberType: 'Consumer', memberId: 'CON-2026-0000', currentPlan: 'Silver', targetPlan: 'Gold', transitionType: 'Renewal', status: 'Scheduled', requestedBy: 'System', requestedDate: '2026-07-29', effectiveDate: '2026-08-15', reason: 'Annual renewal - auto-promotion based on engagement', approvalStatus: 'Pending', overviewMemberInfo: [
    { label: 'Consumer', value: 'Emma Watson' }, { label: 'Consumer ID', value: 'CON-2026-0000' }, { label: 'Status', value: 'Active' }, { label: 'Linked Business', value: 'Oceanview Hotel & Spa' }
  ], currentMembership: [
    { label: 'Level', value: 'Silver' }, { label: 'Family', value: '2' }, { label: 'Friends', value: '2' }, { label: 'Additional Cards', value: '1' }
  ], targetMembership: [
    { label: 'Level', value: 'Gold' }, { label: 'Family', value: '3' }, { label: 'Friends', value: '5' }, { label: 'Additional Cards', value: '3' }
  ], entitlementComparison: [
    { label: 'Family', current: '2', target: '3', delta: '+1' },
    { label: 'Friends', current: '2', target: '5', delta: '+3' },
    { label: 'Additional Cards', current: '1', target: '3', delta: '+2' },
    { label: 'VCard Theme', current: 'Silver Standard', target: 'Gold Standard', delta: 'Upgraded' },
    { label: 'VCard Exchange', current: 'Disabled', target: 'Enabled', delta: 'Enabled' },
  ], allocationImpact: [
    { category: 'Family', currentUsed: 1, currentRemaining: 1, targetAvailable: 3, result: '+1' },
    { category: 'Friends', currentUsed: 1, currentRemaining: 1, targetAvailable: 5, result: '+3' },
    { category: 'Additional Cards', currentUsed: 0, currentRemaining: 1, targetAvailable: 3, result: '+2' },
  ], validations: [
    { check: 'Active', status: 'Pass', message: 'Active' },
    { check: 'Engagement Met', status: 'Pass', message: 'Renewal promotion eligible' },
    { check: 'Linked Business Active', status: 'Pass', message: 'Oceanview Hotel & Spa is active' },
  ], notifications: [], approvals: [
    { step: 'System Check', status: 'Approved', approvedBy: 'System', date: '2026-07-29' },
    { step: 'Scheduled', status: 'Approved', approvedBy: 'System', comment: 'Scheduled for renewal date' },
  ], activity: [
    { action: 'Renewal Promotion Initiated', date: '2026-07-29', detail: 'Silver to Gold at renewal (Aug 15)' },
    { action: 'Scheduled', date: '2026-07-29', detail: 'Effective August 15, 2026' },
  ], rollback: { possible: true, reason: 'Can be cancelled before effective date', restores: [] } },
]

const TRANSITION_TYPES = ['All', 'Upgrade', 'Downgrade', 'Promotion', 'Demotion', 'Renewal', 'Trial Conversion', 'Complimentary Upgrade', 'Promotional Upgrade', 'Manual Override']
const STATUSES = ['All', 'Draft', 'Pending Approval', 'Scheduled', 'Processing', 'Completed', 'Cancelled', 'Failed', 'Rolled Back']
const MEMBER_TYPES = ['All', 'Business', 'Consumer']
const EFFECTIVE_PERIODS = ['All', 'Today', 'Tomorrow', 'Next 7 Days', 'Custom']

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    'Upgrade': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Downgrade': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Promotion': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
    'Demotion': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Renewal': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600',
    'Trial Conversion': 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600',
    'Complimentary Upgrade': 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600',
    'Promotional Upgrade': 'bg-pink-50 dark:bg-pink-500/10 text-pink-600',
    'Manual Override': 'bg-orange-50 dark:bg-orange-500/10 text-orange-600',
  }
  return <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${colors[type] || 'bg-gray-100 text-gray-600'}`}>{type}</span>
}

function MemberTypeBadge({ type }: { type: string }) {
  return <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${type === 'Business' ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-600' : 'bg-teal-50 dark:bg-teal-500/10 text-teal-600'}`}>{type}</span>
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Draft': 'bg-gray-100 dark:bg-gray-500/20 text-gray-600',
    'Pending Approval': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    'Scheduled': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
    'Processing': 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600',
    'Completed': 'bg-green-50 dark:bg-green-500/10 text-green-600',
    'Cancelled': 'bg-gray-50 dark:bg-gray-500/10 text-gray-500',
    'Failed': 'bg-red-50 dark:bg-red-500/10 text-red-600',
    'Rolled Back': 'bg-orange-50 dark:bg-orange-500/10 text-orange-600',
  }
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[status] || 'bg-gray-50 text-gray-600'}`}>{status}</span>
}

export default function UpgradesDowngradesPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [memberTypeFilter, setMemberTypeFilter] = useState('All')
  const [periodFilter, setPeriodFilter] = useState('All')
  const [selectedTransition, setSelectedTransition] = useState<Transition | null>(null)
  const [workspaceTab, setWorkspaceTab] = useState('overview')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const filtered = TRANSITIONS.filter(t => {
    const q = search.toLowerCase()
    if (q && !t.transitionId.toLowerCase().includes(q) && !t.memberName.toLowerCase().includes(q) && !t.currentPlan.toLowerCase().includes(q) && !t.targetPlan.toLowerCase().includes(q) && !t.requestedBy.toLowerCase().includes(q)) return false
    if (typeFilter !== 'All' && t.transitionType !== typeFilter) return false
    if (statusFilter !== 'All' && t.status !== statusFilter) return false
    if (memberTypeFilter !== 'All' && t.memberType !== memberTypeFilter) return false
    return true
  })

  const kpis = {
    upgradesToday: TRANSITIONS.filter(t => t.transitionType === 'Upgrade' && t.status === 'Completed').length,
    downgradesToday: TRANSITIONS.filter(t => t.transitionType === 'Downgrade' && t.status === 'Completed').length,
    scheduled: TRANSITIONS.filter(t => t.status === 'Scheduled').length,
    pendingApprovals: TRANSITIONS.filter(t => t.status === 'Pending Approval').length,
    bizUpgrades: TRANSITIONS.filter(t => t.memberType === 'Business' && ['Upgrade','Complimentary Upgrade','Promotional Upgrade'].includes(t.transitionType) && t.status === 'Completed').length,
    bizDowngrades: TRANSITIONS.filter(t => t.memberType === 'Business' && t.transitionType === 'Downgrade' && ['Completed','Scheduled'].includes(t.status)).length,
    trialConversions: TRANSITIONS.filter(t => t.transitionType === 'Trial Conversion').length,
    consumerPromotions: TRANSITIONS.filter(t => t.memberType === 'Consumer' && t.transitionType === 'Promotion' && t.status === 'Completed').length,
    consumerDemotions: TRANSITIONS.filter(t => t.memberType === 'Consumer' && t.transitionType === 'Demotion').length,
    manualAdjustments: TRANSITIONS.filter(t => t.transitionType === 'Manual Override').length,
    cardsGranted: TRANSITIONS.filter(t => t.transitionType === 'Upgrade' && t.status === 'Completed').length * 500,
    cardsRemoved: TRANSITIONS.filter(t => t.transitionType === 'Downgrade' && ['Completed','Scheduled'].includes(t.status)).length * 300,
    vcardsAdded: TRANSITIONS.filter(t => t.transitionType === 'Upgrade' && t.status === 'Completed').length * 200,
    vcardsReduced: TRANSITIONS.filter(t => t.transitionType === 'Downgrade' && ['Completed','Scheduled'].includes(t.status)).length * 100,
    failed: TRANSITIONS.filter(t => t.status === 'Failed').length,
    cancelled: TRANSITIONS.filter(t => t.status === 'Cancelled').length,
    rollbacks: TRANSITIONS.filter(t => t.status === 'Rolled Back').length,
    conflicts: TRANSITIONS.filter(t => ['Failed','Cancelled'].includes(t.status)).length,
  }

  function toggleSelect(id: number) {
    setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  function toggleSelectAll() {
    if (selectedIds.length === filtered.length) { setSelectedIds([]) }
    else { setSelectedIds(filtered.map(t => t.id)) }
  }

  function handleAction(msg: string) {
    toast.success(msg)
  }

  const tabs = ['overview', 'current-membership', 'target-membership', 'comparison', 'allocation-impact', 'validation', 'notifications', 'approvals', 'activity', 'rollback']
  const tabLabels = ['Overview', 'Current Membership', 'Target Membership', 'Entitlement Comparison', 'Allocation Impact', 'Validation', 'Notifications', 'Approvals', 'Activity', 'Rollback']
  const t = selectedTransition!

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
        </div>
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unable to load Membership Transitions</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The transition engine could not retrieve membership change data.</p>
        <div className="flex gap-3">
          <button onClick={() => { setError(false); setLoading(false) }} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Retry</button>
          <Link to="/admin/system-info" className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">View System Status</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet><title>Upgrades &amp; Downgrades � Membership Transition Engine � McomVCard Admin</title></Helmet>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upgrades &amp; Downgrades</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Membership Transition Engine � manage all Business and Consumer membership changes</p>
          </div>
          <button onClick={() => handleAction('Create Transition')} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create Transition
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Membership Changes</p>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-lg font-bold text-gray-900 dark:text-white">{kpis.upgradesToday}</span><span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">Upgrades</span></div>
              <div><span className="text-lg font-bold text-gray-900 dark:text-white">{kpis.downgradesToday}</span><span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">Downgrades</span></div>
              <div><span className="text-lg font-bold text-blue-600">{kpis.scheduled}</span><span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">Scheduled</span></div>
              <div><span className="text-lg font-bold text-amber-600">{kpis.pendingApprovals}</span><span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">Pending</span></div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Business Changes</p>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-lg font-bold text-green-600">{kpis.bizUpgrades}</span><span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">Upgrades</span></div>
              <div><span className="text-lg font-bold text-amber-600">{kpis.bizDowngrades}</span><span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">Downgrades</span></div>
              <div className="col-span-2"><span className="text-lg font-bold text-cyan-600">{kpis.trialConversions}</span><span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">Trial Conversions</span></div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Consumer Changes</p>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-lg font-bold text-green-600">{kpis.consumerPromotions}</span><span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">Promotions</span></div>
              <div><span className="text-lg font-bold text-red-600">{kpis.consumerDemotions}</span><span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">Demotions</span></div>
              <div className="col-span-2"><span className="text-lg font-bold text-orange-600">{kpis.manualAdjustments}</span><span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">Adjustments</span></div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Allocation Impact</p>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-lg font-bold text-green-600">{kpis.cardsGranted}</span><span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">Cards +</span></div>
              <div><span className="text-lg font-bold text-red-600">{kpis.cardsRemoved}</span><span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">Cards -</span></div>
              <div><span className="text-lg font-bold text-green-600">{kpis.vcardsAdded}</span><span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">VCards +</span></div>
              <div><span className="text-lg font-bold text-red-600">{kpis.vcardsReduced}</span><span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">VCards -</span></div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Failed Transitions</p>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-lg font-bold text-red-600">{kpis.failed}</span><span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">Failed</span></div>
              <div><span className="text-lg font-bold text-gray-600">{kpis.cancelled}</span><span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">Cancelled</span></div>
              <div><span className="text-lg font-bold text-orange-600">{kpis.rollbacks}</span><span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">Rollbacks</span></div>
              <div><span className="text-lg font-bold text-amber-600">{kpis.conflicts}</span><span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">Conflicts</span></div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search by name, ID, plan, administrator..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            {TRANSITION_TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
          <select value={memberTypeFilter} onChange={e => setMemberTypeFilter(e.target.value)} className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            {MEMBER_TYPES.map(m => <option key={m} value={m}>{m === 'All' ? 'All Members' : m}</option>)}
          </select>
          <select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            {EFFECTIVE_PERIODS.map(p => <option key={p} value={p}>{p === 'All' ? 'Effective Date' : p}</option>)}
          </select>
          {filtered.length > 0 && <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{filtered.length} transition{filtered.length !== 1 ? 's' : ''}</span>}
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-sm">
            <span className="text-blue-700 dark:text-blue-300 font-medium">{selectedIds.length} selected</span>
            <button onClick={() => handleAction(`Approved ${selectedIds.length} transitions`)} className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700">Approve</button>
            <button onClick={() => handleAction(`Scheduled ${selectedIds.length} transitions`)} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">Schedule</button>
            <button onClick={() => handleAction(`Cancelled ${selectedIds.length} transitions`)} className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700">Cancel</button>
            <button onClick={() => handleAction(`Exported ${selectedIds.length} transitions`)} className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700">Export</button>
            <button onClick={() => handleAction(`Reminders sent for ${selectedIds.length} transitions`)} className="px-3 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700">Send Reminders</button>
          </div>
        )}

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Membership Transitions Found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Membership upgrades, downgrades and promotions will appear here.</p>
            <button onClick={() => handleAction('Create Transition')} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Create Transition</button>
          </div>
        ) : !selectedTransition ? (
          /* Transition Table */
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-3 py-3 text-left w-8"><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="rounded border-gray-300" /></th>
                  <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">ID</th>
                  <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Member</th>
                  <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Type</th>
                  <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Current Plan</th>
                  <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Target Plan</th>
                  <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Transition</th>
                  <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Requested By</th>
                  <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Requested</th>
                  <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Effective</th>
                  <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className={`border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 ${selectedIds.includes(t.id) ? 'bg-blue-50 dark:bg-blue-500/5' : ''} cursor-pointer`} onClick={() => setSelectedTransition(t)}>
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(t.id)} onChange={() => toggleSelect(t.id)} className="rounded border-gray-300" /></td>
                    <td className="px-3 py-3 font-mono text-[11px] text-blue-600 dark:text-blue-400">{t.transitionId}</td>
                    <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">{t.memberName}</td>
                    <td className="px-3 py-3"><MemberTypeBadge type={t.memberType} /></td>
                    <td className="px-3 py-3 text-gray-700 dark:text-gray-300">{t.currentPlan}</td>
                    <td className="px-3 py-3 text-gray-700 dark:text-gray-300">{t.targetPlan}</td>
                    <td className="px-3 py-3"><TypeBadge type={t.transitionType} /></td>
                    <td className="px-3 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-[11px]">{t.requestedBy}</td>
                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-[11px]">{t.requestedDate || '-'}</td>
                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-[11px]">{t.effectiveDate || '-'}</td>
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedTransition(t)} className="p-1 text-gray-400 hover:text-blue-600" title="View Details">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        {t.status === 'Pending Approval' && <button onClick={() => handleAction(`Approved ${t.transitionId}`)} className="p-1 text-gray-400 hover:text-green-600" title="Approve">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </button>}
                        <button onClick={() => handleAction(`Cancelled ${t.transitionId}`)} className="p-1 text-gray-400 hover:text-red-600" title="Cancel">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <button onClick={() => handleAction(`View audit for ${t.transitionId}`)} className="p-1 text-gray-400 hover:text-purple-600" title="View Audit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </button>
                        <button onClick={() => handleAction(`Exported ${t.transitionId}`)} className="p-1 text-gray-400 hover:text-gray-600" title="Export">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Workspace */
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedTransition(null)} className="p-1 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div>
                  <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">{t.transitionId}</span>
                  <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{t.memberName}</span>
                  <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                  <TypeBadge type={t.transitionType} />
                  <span className="ml-2"><StatusBadge status={t.status} /></span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {t.rollback.possible && t.status !== 'Rolled Back' && (
                  <button onClick={() => handleAction(`Rolling back ${t.transitionId}`)} className="px-3 py-1.5 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Rollback
                  </button>
                )}
                {t.status === 'Pending Approval' && <button onClick={() => handleAction(`Approved ${t.transitionId}`)} className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">Approve</button>}
                {t.status === 'Pending Approval' && <button onClick={() => handleAction(`Rejected ${t.transitionId}`)} className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700">Reject</button>}
                <button onClick={() => handleAction(`Exported ${t.transitionId}`)} className="px-3 py-1.5 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700">Export</button>
              </div>
            </div>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {tabs.map((tab, i) => (
                <button key={tab} onClick={() => setWorkspaceTab(tab)} className={`px-4 py-2.5 text-[11px] font-medium whitespace-nowrap border-b-2 transition-colors ${workspaceTab === tab ? 'text-blue-600 border-blue-600' : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`}>
                  {tabLabels[i]}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Tab 1: Overview */}
              {workspaceTab === 'overview' && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Member Information</h3>
                    <div className="space-y-2">
                      {t.overviewMemberInfo.map((info, i) => (
                        <div key={i} className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">{info.label}</span><span className="text-gray-900 dark:text-white font-medium">{info.value}</span></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Transition Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Current Plan</span><span className="text-gray-900 dark:text-white font-medium">{t.currentPlan}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Target Plan</span><span className="text-gray-900 dark:text-white font-medium">{t.targetPlan}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Effective Date</span><span className="text-gray-900 dark:text-white font-medium">{t.effectiveDate || 'Not set'}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Reason</span><span className="text-gray-900 dark:text-white font-medium max-w-[200px] text-right">{t.reason}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Approval</span><StatusBadge status={t.approvalStatus} /></div>
                    </div>
                  </div>
                </div>
              )}
              {/* Tab 2: Current Membership */}
              {workspaceTab === 'current-membership' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Current Membership � Baseline Before Change</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {t.currentMembership.map((m, i) => (
                      <div key={i} className="flex justify-between text-sm px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg"><span className="text-gray-500 dark:text-gray-400">{m.label}</span><span className="text-gray-900 dark:text-white font-medium">{m.value}</span></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Target Membership */}
              {workspaceTab === 'target-membership' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Target Membership � Destination Plan</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {t.targetMembership.map((m, i) => (
                      <div key={i} className="flex justify-between text-sm px-3 py-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg"><span className="text-gray-500 dark:text-gray-400">{m.label}</span><span className="text-gray-900 dark:text-white font-medium">{m.value}</span></div>
                    ))}
                  </div>
                </div>
              )}
              {/* Tab 4: Entitlement Comparison */}
              {workspaceTab === 'comparison' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Entitlement Comparison � Every Change Highlighted</h3>
                  <div className="space-y-1">
                    {t.entitlementComparison.map((ec, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-sm">
                        <span className="text-gray-700 dark:text-gray-300 font-medium w-1/3">{ec.label}</span>
                        <div className="flex items-center gap-4 w-2/3 justify-end">
                          <span className="text-gray-500 dark:text-gray-400 text-[11px]">{ec.current}</span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                          <span className="text-gray-900 dark:text-white font-medium">{ec.target}</span>
                          <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${ec.delta.startsWith('+') || ec.delta === 'Unlimited' || ec.delta === 'Upgraded' || ec.delta === 'Added' || ec.delta === 'Enabled' || ec.delta === 'Enhanced' || ec.delta === 'Expanded' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : ec.delta.startsWith('-') || ec.delta === 'Downgraded' || ec.delta === 'Removed' ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : 'bg-gray-100 dark:bg-gray-600/20 text-gray-500'}`}>
                            {ec.delta}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Tab 5: Allocation Impact */}
              {workspaceTab === 'allocation-impact' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Allocation Impact � Respecting Henry Allocation Model</h3>
                  <div className="space-y-3">
                    {t.allocationImpact.map((ai, i) => (
                      <div key={i} className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{ai.category}</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${ai.result.includes('Restricted') ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : 'bg-green-50 dark:bg-green-500/10 text-green-600'}`}>
                            {ai.currentUsed} Used / {ai.currentRemaining} Remaining ? {ai.targetAvailable === -1 ? 'Unlimited' : ai.targetAvailable} Available
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{ai.result}</p>
                      </div>
                    ))}
                    {t.allocationImpact.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No allocation impact data available.</p>}
                  </div>
                </div>
              )}
              {/* Tab 6: Validation */}
              {workspaceTab === 'validation' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Validation � Pre-approval Checks</h3>
                  <div className="space-y-2">
                    {t.validations.map((v, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-sm">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${v.status === 'Pass' ? 'bg-green-500' : v.status === 'Fail' ? 'bg-red-500' : 'bg-amber-500'}`} />
                          <span className="text-gray-700 dark:text-gray-300">{v.check}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${v.status === 'Pass' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : v.status === 'Fail' ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600'}`}>
                            {v.status}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] text-right">{v.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 7: Notifications */}
              {workspaceTab === 'notifications' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Notification Preview � Review Before Sending</h3>
                  {t.notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      <p className="text-sm text-gray-500 dark:text-gray-400">No notifications configured. Email/SMS integrations Coming Soon.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {t.notifications.map((n, i) => (
                        <div key={i} className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">{n.recipient}</p>
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">{n.subject}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{n.body}</p>
                          {i === 0 && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 italic">Future email/SMS integrations remain Coming Soon</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* Tab 8: Approvals */}
              {workspaceTab === 'approvals' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Approval Workflow</h3>
                  <div className="relative">
                    {t.approvals.map((a, i) => (
                      <div key={i} className="flex items-start gap-4 pb-4 relative">
                        {i < t.approvals.length - 1 && <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600" />}
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${a.status === 'Approved' ? 'bg-green-500 border-green-500' : a.status === 'Rejected' ? 'bg-red-500 border-red-500' : a.status === 'Pending' ? 'bg-amber-500 border-amber-500' : 'bg-gray-300 dark:bg-gray-600 border-gray-300 dark:border-gray-600'}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{a.step}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${a.status === 'Approved' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : a.status === 'Rejected' ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : a.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : 'bg-gray-100 dark:bg-gray-500/20 text-gray-500'}`}>
                              {a.status}
                            </span>
                          </div>
                          {a.approvedBy && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">By: {a.approvedBy}{a.date ? ` on ${a.date}` : ''}</p>}
                          {a.comment && <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-0.5">{a.comment}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Tab 9: Activity */}
              {workspaceTab === 'activity' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Activity Timeline</h3>
                  <div className="relative">
                    {t.activity.map((a, i) => (
                      <div key={i} className="flex items-start gap-4 pb-4 relative">
                        {i < t.activity.length - 1 && <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600" />}
                        <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{a.action}</span>
                            <span className="text-[11px] text-gray-500 dark:text-gray-400">{a.date}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Tab 10: Rollback */}
              {workspaceTab === 'rollback' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Rollback</h3>
                  {t.rollback.possible ? (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm text-green-600 font-medium">Rollback Available</span>
                      </div>
                      {t.rollback.reason && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.rollback.reason}</p>}
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Restores</h4>
                      <ul className="space-y-1">
                        {t.rollback.restores.map((r, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {r}
                          </li>
                        ))}
                      </ul>
                      {t.status !== 'Rolled Back' && (
                        <button onClick={() => handleAction(`Rolling back ${t.transitionId}`)} className="mt-4 px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          Execute Rollback
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t.rollback.reason || 'Rollback is not available for this transition.'}</p>
                    </div>
                  )}
                  <div className="mt-4 px-4 py-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                    <p className="text-xs text-amber-700 dark:text-amber-300">Any rollback creates a new record in the Version Engine for complete audit traceability.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
