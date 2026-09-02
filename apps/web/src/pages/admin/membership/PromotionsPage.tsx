import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

type PromotionType = 'Membership Discount' | 'Free Trial' | 'Upgrade Campaign' | 'Additional Card Offer' | 'Friends & Family Bonus' | 'Consumer Card Bonus' | 'Consumer VCard Bonus' | 'Coupon Code' | 'Seasonal Promotion' | 'Referral Promotion (Coming Soon)' | 'Cashback Promotion (Coming Soon)' | 'Reward Promotion (Coming Soon)'
type PromotionStatus = 'Draft' | 'Scheduled' | 'Active' | 'Paused' | 'Expired' | 'Archived'

interface PricingBenefit { type: string; value?: number; description: string }
interface AllocationBenefit { businessVCards: number; businessCards: number; consumerVCards: number; consumerCards: number; friendsAndFamily: number; additionalCards: number }
interface FeatureBenefit { premiumComponents: boolean; premiumTemplates: boolean; dynamicQRPremium: boolean; analytics: boolean; advancedBranding: boolean }
interface MembershipBenefit { temporaryTier?: string; description: string }
interface Benefits { pricing: PricingBenefit[]; allocations: AllocationBenefit; features: FeatureBenefit; membership: MembershipBenefit[] }
interface EligibilityRules { membershipPlans: string[]; businessTypes: string[]; registrationDate: string; countries: string[]; manualAssignment: boolean }
interface Schedule { startDate: string; endDate: string; timezone: string; dailyStartTime?: string; dailyEndTime?: string }
interface UsageLimits { maxUses: number; perBusiness: number; perConsumer: number; allocationCap: number }
interface CouponConfig { code: string; generationMethod: string; usageLimit: number; perBusinessLimit: number; expiry: string; stackable: boolean; reusable: boolean; validationRule: string }
interface AnalyticsData { views: number; activations: number; redemptions: number; expired: number; newBusinesses: number; upgrades: number; renewals: number; consumerCardsIssued: number; consumerVCardsIssued: number; friendsAndFamilyUsed: number; discountGiven: number; revenueGenerated: number; upgradeValue: number }
interface PromotionNotification { recipient: string; subject: string; body: string; type: string }
interface VersionEntry { version: number; date: string; changedBy: string; changes: string }
interface ActivityEntry { action: string; date: string; detail: string }

interface Promotion {
  id: string; promotionId: string; name: string; description: string; type: PromotionType; status: PromotionStatus; priority: number; target: string; startDate: string; endDate: string; usage: string; createdBy: string; createdAt: string
  overview: { eligiblePlans: number; eligibleBusinesses: number; activeUsers: number; currentRedemptions: number }
  eligibility: EligibilityRules; benefits: Benefits; couponConfig?: CouponConfig; schedule: Schedule; usageLimits: UsageLimits
  notifications: PromotionNotification[]; analyticsData: AnalyticsData; versionHistory: VersionEntry[]; activity: ActivityEntry[]
}

const PROMOTIONS: Promotion[] = [
  { id: '1', promotionId: 'PROMO-2026-0001', name: 'Summer Startup Boost', description: '50% off first 3 months for new businesses joining Bronze or Silver plans', type: 'Membership Discount', status: 'Active', priority: 1, target: 'Bronze, Silver', startDate: '2026-06-01', endDate: '2026-08-31', usage: '156 / 500', createdBy: 'Sarah Chen', createdAt: '2026-05-25', overview: { eligiblePlans: 2, eligibleBusinesses: 500, activeUsers: 156, currentRedemptions: 89 }, eligibility: { membershipPlans: ['Bronze', 'Silver'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional'], registrationDate: 'New businesses only', countries: ['United States', 'Canada'], manualAssignment: false }, benefits: { pricing: [{ type: 'Percentage Discount', value: 50, description: '50% off first 3 months' }], allocations: { businessVCards: 0, businessCards: 0, consumerVCards: 0, consumerCards: 0, friendsAndFamily: 0, additionalCards: 0 }, features: { premiumComponents: false, premiumTemplates: false, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [] }, couponConfig: { code: 'SUMMER2026', generationMethod: 'Manual', usageLimit: 500, perBusinessLimit: 1, expiry: '2026-08-31', stackable: false, reusable: false, validationRule: 'One use per Business' }, schedule: { startDate: '2026-06-01', endDate: '2026-08-31', timezone: 'America/New_York', dailyStartTime: '00:00', dailyEndTime: '23:59' }, usageLimits: { maxUses: 500, perBusiness: 1, perConsumer: 0, allocationCap: 0 }, notifications: [
    { recipient: 'Business Owner', subject: 'Welcome to Summer Startup Boost', body: 'Your Summer Startup Boost promotion is now active.', type: 'Promotion Started' },
    { recipient: 'Business Owner', subject: 'Promotion Ending Soon', body: 'Your Summer Startup Boost discount ends August 31.', type: 'Promotion Ending Soon' },
  ], analyticsData: { views: 12500, activations: 156, redemptions: 89, expired: 0, newBusinesses: 89, upgrades: 12, renewals: 0, consumerCardsIssued: 345, consumerVCardsIssued: 189, friendsAndFamilyUsed: 67, discountGiven: 15600, revenueGenerated: 89000, upgradeValue: 5400 }, versionHistory: [
    { version: 1, date: '2026-05-25', changedBy: 'Sarah Chen', changes: 'Promotion created' },
    { version: 2, date: '2026-05-28', changedBy: 'Sarah Chen', changes: 'Updated discount from 40% to 50%' },
  ], activity: [
    { action: 'Promotion Created', date: '2026-05-25', detail: 'Created by Sarah Chen' },
    { action: 'Published', date: '2026-05-28', detail: 'Promotion published and activated' },
    { action: 'Business Joined', date: '2026-06-01', detail: 'Bella Italia joined Summer Startup Boost' },
    { action: 'Coupon Redeemed', date: '2026-06-02', detail: 'SUMMER2026 redeemed by Urban Fitness' },
  ] },
  { id: '2', promotionId: 'PROMO-2026-0002', name: 'Gold Rush Upgrade', description: 'Free upgrade from Silver Pro to Gold Pro for 3 months', type: 'Upgrade Campaign', status: 'Active', priority: 2, target: 'Silver Pro', startDate: '2026-07-01', endDate: '2026-09-30', usage: '78 / 200', createdBy: 'Michael Torres', createdAt: '2026-06-15', overview: { eligiblePlans: 1, eligibleBusinesses: 200, activeUsers: 78, currentRedemptions: 45 }, eligibility: { membershipPlans: ['Silver Pro'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional', 'Charity'], registrationDate: 'Existing customers only', countries: ['United States', 'Canada', 'United Kingdom'], manualAssignment: true }, benefits: { pricing: [{ type: 'Free Trial', description: '3 months free Gold Pro upgrade' }], allocations: { businessVCards: 15, businessCards: 0, consumerVCards: 600, consumerCards: 600, friendsAndFamily: 4, additionalCards: 3 }, features: { premiumComponents: true, premiumTemplates: true, dynamicQRPremium: true, analytics: true, advancedBranding: false }, membership: [{ temporaryTier: 'Gold Pro', description: 'Temporary Gold Pro benefits for 3 months' }] }, schedule: { startDate: '2026-07-01', endDate: '2026-09-30', timezone: 'America/New_York' }, usageLimits: { maxUses: 200, perBusiness: 1, perConsumer: 0, allocationCap: 5000 }, notifications: [
    { recipient: 'Business Owner', subject: 'Gold Rush Upgrade Activated', body: 'Your Silver Pro membership has been temporarily upgraded to Gold Pro.', type: 'Promotion Started' },
  ], analyticsData: { views: 8900, activations: 78, redemptions: 45, expired: 0, newBusinesses: 23, upgrades: 45, renewals: 12, consumerCardsIssued: 890, consumerVCardsIssued: 567, friendsAndFamilyUsed: 123, discountGiven: 0, revenueGenerated: 78000, upgradeValue: 23400 }, versionHistory: [
    { version: 1, date: '2026-06-15', changedBy: 'Michael Torres', changes: 'Promotion created' },
  ], activity: [
    { action: 'Promotion Created', date: '2026-06-15', detail: 'Created by Michael Torres' },
    { action: 'Published', date: '2026-06-20', detail: 'Published with manual assignment enabled' },
    { action: 'Business Joined', date: '2026-07-01', detail: 'Oceanview Hotel & Spa assigned to Gold Rush' },
  ] },
  { id: '3', promotionId: 'PROMO-2026-0003', name: '14-Day Free Trial', description: 'Full Platinum Pro access for 14 days - no payment required', type: 'Free Trial', status: 'Active', priority: 3, target: 'All Plans', startDate: '2026-05-01', endDate: '2026-12-31', usage: '423 / 1000', createdBy: 'Sarah Chen', createdAt: '2026-04-20', overview: { eligiblePlans: 12, eligibleBusinesses: 1000, activeUsers: 423, currentRedemptions: 312 }, eligibility: { membershipPlans: ['Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional', 'Charity', 'Others'], registrationDate: 'New businesses only', countries: ['All'], manualAssignment: false }, benefits: { pricing: [{ type: 'Free Trial', description: '14 days full Platinum Pro access' }], allocations: { businessVCards: 50, businessCards: 0, consumerVCards: 2000, consumerCards: 2000, friendsAndFamily: 10, additionalCards: 5 }, features: { premiumComponents: true, premiumTemplates: true, dynamicQRPremium: true, analytics: true, advancedBranding: true }, membership: [{ temporaryTier: 'Platinum Pro', description: 'Full Platinum Pro access for 14 days' }] }, couponConfig: { code: 'TRIAL14', generationMethod: 'Random', usageLimit: 1000, perBusinessLimit: 1, expiry: '2026-12-31', stackable: false, reusable: false, validationRule: 'One use per Business' }, schedule: { startDate: '2026-05-01', endDate: '2026-12-31', timezone: 'America/New_York' }, usageLimits: { maxUses: 1000, perBusiness: 1, perConsumer: 0, allocationCap: 10000 }, notifications: [
    { recipient: 'Business Owner', subject: 'Your 14-Day Free Trial is Active', body: 'Enjoy full Platinum Pro access for 14 days.', type: 'Promotion Started' },
    { recipient: 'Business Owner', subject: 'Trial Ending Soon', body: 'Your free trial ends in 3 days. Upgrade to keep your benefits.', type: 'Promotion Ending Soon' },
  ], analyticsData: { views: 45000, activations: 423, redemptions: 312, expired: 89, newBusinesses: 312, upgrades: 89, renewals: 45, consumerCardsIssued: 4567, consumerVCardsIssued: 2345, friendsAndFamilyUsed: 567, discountGiven: 0, revenueGenerated: 156000, upgradeValue: 67800 }, versionHistory: [
    { version: 1, date: '2026-04-20', changedBy: 'Sarah Chen', changes: 'Promotion created' },
    { version: 2, date: '2026-04-25', changedBy: 'Sarah Chen', changes: 'Extended trial from 7 to 14 days' },
  ], activity: [
    { action: 'Promotion Created', date: '2026-04-20', detail: 'Created by Sarah Chen' },
    { action: 'Published', date: '2026-04-25', detail: 'Published with 14-day trial period' },
    { action: 'Business Joined', date: '2026-05-01', detail: 'TechVantage Consulting joined trial' },
    { action: 'Promotion Ending Soon', date: '2026-05-12', detail: 'Trial ending notification sent to 45 businesses' },
  ] },
  { id: '4', promotionId: 'PROMO-2026-0004', name: 'Double Card Weekend', description: 'Double Consumer Card allocation for all Gold members - limited time', type: 'Consumer Card Bonus', status: 'Active', priority: 4, target: 'Gold, Gold Pro, Gold Pro+', startDate: '2026-08-01', endDate: '2026-08-04', usage: '234 / 500', createdBy: 'Emily Park', createdAt: '2026-07-28', overview: { eligiblePlans: 3, eligibleBusinesses: 500, activeUsers: 234, currentRedemptions: 198 }, eligibility: { membershipPlans: ['Gold', 'Gold Pro', 'Gold Pro+'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional', 'Charity', 'Others'], registrationDate: 'All businesses', countries: ['All'], manualAssignment: false }, benefits: { pricing: [], allocations: { businessVCards: 0, businessCards: 0, consumerVCards: 0, consumerCards: 1000, friendsAndFamily: 0, additionalCards: 0 }, features: { premiumComponents: false, premiumTemplates: false, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [] }, schedule: { startDate: '2026-08-01', endDate: '2026-08-04', timezone: 'America/New_York', dailyStartTime: '00:00', dailyEndTime: '23:59' }, usageLimits: { maxUses: 500, perBusiness: 1, perConsumer: 0, allocationCap: 50000 }, notifications: [
    { recipient: 'Business Owner', subject: 'Double Card Weekend is Live', body: 'Your Consumer Card allocation has been doubled for the weekend.', type: 'Promotion Started' },
  ], analyticsData: { views: 8900, activations: 234, redemptions: 198, expired: 0, newBusinesses: 0, upgrades: 0, renewals: 0, consumerCardsIssued: 4567, consumerVCardsIssued: 0, friendsAndFamilyUsed: 0, discountGiven: 0, revenueGenerated: 0, upgradeValue: 0 }, versionHistory: [
    { version: 1, date: '2026-07-28', changedBy: 'Emily Park', changes: 'Promotion created' },
  ], activity: [
    { action: 'Promotion Created', date: '2026-07-28', detail: 'Created by Emily Park' },
    { action: 'Published', date: '2026-07-30', detail: 'Scheduled for August 1-4 weekend' },
  ] },
  { id: '5', promotionId: 'PROMO-2026-0005', name: 'Friends & Family Extension', description: '+5 Friends & Family slots for all Silver and above members', type: 'Friends & Family Bonus', status: 'Active', priority: 5, target: 'Silver, Gold, Platinum', startDate: '2026-07-15', endDate: '2026-10-15', usage: '567 / 2000', createdBy: 'Michael Torres', createdAt: '2026-07-10', overview: { eligiblePlans: 9, eligibleBusinesses: 2000, activeUsers: 567, currentRedemptions: 423 }, eligibility: { membershipPlans: ['Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional'], registrationDate: 'All businesses', countries: ['United States', 'Canada'], manualAssignment: false }, benefits: { pricing: [], allocations: { businessVCards: 0, businessCards: 0, consumerVCards: 0, consumerCards: 0, friendsAndFamily: 5, additionalCards: 0 }, features: { premiumComponents: false, premiumTemplates: false, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [] }, schedule: { startDate: '2026-07-15', endDate: '2026-10-15', timezone: 'America/New_York' }, usageLimits: { maxUses: 2000, perBusiness: 1, perConsumer: 0, allocationCap: 10000 }, notifications: [
    { recipient: 'Business Owner', subject: 'Extra F&F Slots Added', body: 'You now have 5 additional Friends & Family slots.', type: 'Promotion Started' },
  ], analyticsData: { views: 12300, activations: 567, redemptions: 423, expired: 0, newBusinesses: 0, upgrades: 23, renewals: 0, consumerCardsIssued: 0, consumerVCardsIssued: 0, friendsAndFamilyUsed: 1234, discountGiven: 0, revenueGenerated: 0, upgradeValue: 0 }, versionHistory: [
    { version: 1, date: '2026-07-10', changedBy: 'Michael Torres', changes: 'Promotion created' },
  ], activity: [
    { action: 'Promotion Created', date: '2026-07-10', detail: 'Created by Michael Torres' },
    { action: 'Published', date: '2026-07-12', detail: 'Published and activated' },
  ] },
  { id: '6', promotionId: 'PROMO-2026-0006', name: 'Holiday Special 2026', description: '20% off annual memberships and double Consumer Card allocation', type: 'Seasonal Promotion', status: 'Scheduled', priority: 6, target: 'All Plans', startDate: '2026-11-15', endDate: '2026-12-31', usage: '0 / 5000', createdBy: 'Sarah Chen', createdAt: '2026-07-20', overview: { eligiblePlans: 12, eligibleBusinesses: 5000, activeUsers: 0, currentRedemptions: 0 }, eligibility: { membershipPlans: ['Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional', 'Charity', 'Others'], registrationDate: 'All businesses', countries: ['All'], manualAssignment: false }, benefits: { pricing: [{ type: 'Percentage Discount', value: 20, description: '20% off annual memberships' }], allocations: { businessVCards: 0, businessCards: 0, consumerVCards: 0, consumerCards: 500, friendsAndFamily: 2, additionalCards: 1 }, features: { premiumComponents: false, premiumTemplates: false, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [] }, couponConfig: { code: 'HOLIDAY2026', generationMethod: 'Random', usageLimit: 5000, perBusinessLimit: 1, expiry: '2026-12-31', stackable: false, reusable: false, validationRule: 'One use per Business' }, schedule: { startDate: '2026-11-15', endDate: '2026-12-31', timezone: 'America/New_York' }, usageLimits: { maxUses: 5000, perBusiness: 1, perConsumer: 0, allocationCap: 50000 }, notifications: [
    { recipient: 'Business Owner', subject: 'Holiday Special Starts November 15', body: 'Get 20% off annual plans with double Consumer Cards.', type: 'Promotion Started' },
  ], analyticsData: { views: 0, activations: 0, redemptions: 0, expired: 0, newBusinesses: 0, upgrades: 0, renewals: 0, consumerCardsIssued: 0, consumerVCardsIssued: 0, friendsAndFamilyUsed: 0, discountGiven: 0, revenueGenerated: 0, upgradeValue: 0 }, versionHistory: [
    { version: 1, date: '2026-07-20', changedBy: 'Sarah Chen', changes: 'Promotion created' },
  ], activity: [
    { action: 'Promotion Created', date: '2026-07-20', detail: 'Created by Sarah Chen' },
    { action: 'Scheduled', date: '2026-07-20', detail: 'Scheduled for Nov 15 - Dec 31' },
  ] },
  { id: '7', promotionId: 'PROMO-2026-0007', name: 'Refer a Business', description: 'Get 1 month free for each business you refer that signs up', type: 'Referral Promotion (Coming Soon)', status: 'Draft', priority: 7, target: 'All Businesses', startDate: '', endDate: '', usage: '0 / 0', createdBy: 'Michael Torres', createdAt: '2026-07-25', overview: { eligiblePlans: 0, eligibleBusinesses: 0, activeUsers: 0, currentRedemptions: 0 }, eligibility: { membershipPlans: ['Bronze', 'Silver', 'Gold', 'Platinum'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional'], registrationDate: 'Existing customers only', countries: ['United States'], manualAssignment: true }, benefits: { pricing: [{ type: 'Percentage Discount', value: 100, description: '1 month free per successful referral' }], allocations: { businessVCards: 0, businessCards: 0, consumerVCards: 0, consumerCards: 0, friendsAndFamily: 0, additionalCards: 0 }, features: { premiumComponents: false, premiumTemplates: false, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [] }, schedule: { startDate: '', endDate: '', timezone: 'America/New_York' }, usageLimits: { maxUses: 0, perBusiness: 0, perConsumer: 0, allocationCap: 0 }, notifications: [], analyticsData: { views: 0, activations: 0, redemptions: 0, expired: 0, newBusinesses: 0, upgrades: 0, renewals: 0, consumerCardsIssued: 0, consumerVCardsIssued: 0, friendsAndFamilyUsed: 0, discountGiven: 0, revenueGenerated: 0, upgradeValue: 0 }, versionHistory: [
    { version: 1, date: '2026-07-25', changedBy: 'Michael Torres', changes: 'Draft created' },
  ], activity: [
    { action: 'Draft Created', date: '2026-07-25', detail: 'Draft created by Michael Torres' },
  ] },
  { id: '8', promotionId: 'PROMO-2026-0008', name: 'Business Card Bonus', description: '+50 Business Cards for all new Platinum Pro members', type: 'Additional Card Offer', status: 'Draft', priority: 8, target: 'Platinum Pro', startDate: '', endDate: '', usage: '0 / 0', createdBy: 'Emily Park', createdAt: '2026-07-28', overview: { eligiblePlans: 1, eligibleBusinesses: 0, activeUsers: 0, currentRedemptions: 0 }, eligibility: { membershipPlans: ['Platinum Pro'], businessTypes: ['Restaurant', 'Retail', 'Services'], registrationDate: 'New businesses only', countries: ['United States', 'Canada'], manualAssignment: false }, benefits: { pricing: [], allocations: { businessVCards: 0, businessCards: 50, consumerVCards: 0, consumerCards: 0, friendsAndFamily: 0, additionalCards: 0 }, features: { premiumComponents: false, premiumTemplates: false, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [] }, schedule: { startDate: '', endDate: '', timezone: 'America/New_York' }, usageLimits: { maxUses: 0, perBusiness: 0, perConsumer: 0, allocationCap: 0 }, notifications: [], analyticsData: { views: 0, activations: 0, redemptions: 0, expired: 0, newBusinesses: 0, upgrades: 0, renewals: 0, consumerCardsIssued: 0, consumerVCardsIssued: 0, friendsAndFamilyUsed: 0, discountGiven: 0, revenueGenerated: 0, upgradeValue: 0 }, versionHistory: [
    { version: 1, date: '2026-07-28', changedBy: 'Emily Park', changes: 'Draft created' },
  ], activity: [
    { action: 'Draft Created', date: '2026-07-28', detail: 'Draft created by Emily Park' },
  ] },
  { id: '9', promotionId: 'PROMO-2026-0009', name: 'Consumer VCard Launch', description: 'Unlimited Consumer VCard issuance for 30 days', type: 'Consumer VCard Bonus', status: 'Scheduled', priority: 9, target: 'Gold Pro, Platinum Pro', startDate: '2026-09-01', endDate: '2026-09-30', usage: '0 / 300', createdBy: 'Sarah Chen', createdAt: '2026-07-15', overview: { eligiblePlans: 2, eligibleBusinesses: 300, activeUsers: 0, currentRedemptions: 0 }, eligibility: { membershipPlans: ['Gold Pro', 'Platinum Pro'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional', 'Charity'], registrationDate: 'All businesses', countries: ['All'], manualAssignment: true }, benefits: { pricing: [], allocations: { businessVCards: 0, businessCards: 0, consumerVCards: 5000, consumerCards: 0, friendsAndFamily: 0, additionalCards: 0 }, features: { premiumComponents: true, premiumTemplates: false, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [] }, schedule: { startDate: '2026-09-01', endDate: '2026-09-30', timezone: 'America/New_York' }, usageLimits: { maxUses: 300, perBusiness: 1, perConsumer: 0, allocationCap: 100000 }, notifications: [], analyticsData: { views: 0, activations: 0, redemptions: 0, expired: 0, newBusinesses: 0, upgrades: 0, renewals: 0, consumerCardsIssued: 0, consumerVCardsIssued: 0, friendsAndFamilyUsed: 0, discountGiven: 0, revenueGenerated: 0, upgradeValue: 0 }, versionHistory: [
    { version: 1, date: '2026-07-15', changedBy: 'Sarah Chen', changes: 'Promotion created' },
  ], activity: [
    { action: 'Promotion Created', date: '2026-07-15', detail: 'Created by Sarah Chen' },
    { action: 'Scheduled', date: '2026-07-15', detail: 'Scheduled for September 2026' },
  ] },
  { id: '10', promotionId: 'PROMO-2026-0010', name: 'Cashback Rewards Program', description: '5% cashback on annual membership renewals', type: 'Cashback Promotion (Coming Soon)', status: 'Draft', priority: 10, target: 'All Annual Plans', startDate: '', endDate: '', usage: '0 / 0', createdBy: 'Finance Team', createdAt: '2026-07-22', overview: { eligiblePlans: 12, eligibleBusinesses: 0, activeUsers: 0, currentRedemptions: 0 }, eligibility: { membershipPlans: ['Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional', 'Charity', 'Others'], registrationDate: 'Existing customers only', countries: ['United States'], manualAssignment: false }, benefits: { pricing: [{ type: 'Fixed Amount Discount', value: 5, description: '5% cashback on renewals' }], allocations: { businessVCards: 0, businessCards: 0, consumerVCards: 0, consumerCards: 0, friendsAndFamily: 0, additionalCards: 0 }, features: { premiumComponents: false, premiumTemplates: false, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [] }, schedule: { startDate: '', endDate: '', timezone: 'America/New_York' }, usageLimits: { maxUses: 0, perBusiness: 0, perConsumer: 0, allocationCap: 0 }, notifications: [], analyticsData: { views: 0, activations: 0, redemptions: 0, expired: 0, newBusinesses: 0, upgrades: 0, renewals: 0, consumerCardsIssued: 0, consumerVCardsIssued: 0, friendsAndFamilyUsed: 0, discountGiven: 0, revenueGenerated: 0, upgradeValue: 0 }, versionHistory: [
    { version: 1, date: '2026-07-22', changedBy: 'Finance Team', changes: 'Draft created' },
  ], activity: [
    { action: 'Draft Created', date: '2026-07-22', detail: 'Draft created by Finance Team' },
  ] },
  { id: '11', promotionId: 'PROMO-2026-0011', name: 'Bronze to Silver Fast Track', description: 'Free upgrade from Bronze Pro+ to Silver for 6 months', type: 'Upgrade Campaign', status: 'Scheduled', priority: 11, target: 'Bronze Pro+', startDate: '2026-10-01', endDate: '2026-12-31', usage: '0 / 150', createdBy: 'Michael Torres', createdAt: '2026-07-28', overview: { eligiblePlans: 1, eligibleBusinesses: 150, activeUsers: 0, currentRedemptions: 0 }, eligibility: { membershipPlans: ['Bronze Pro+'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional'], registrationDate: 'Joined within last 60 days', countries: ['United States', 'Canada', 'United Kingdom', 'Australia'], manualAssignment: false }, benefits: { pricing: [{ type: 'Free Trial', description: '6 months free Silver upgrade' }], allocations: { businessVCards: 10, businessCards: 0, consumerVCards: 200, consumerCards: 200, friendsAndFamily: 2, additionalCards: 1 }, features: { premiumComponents: false, premiumTemplates: false, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [{ temporaryTier: 'Silver', description: 'Temporary Silver for 6 months' }] }, schedule: { startDate: '2026-10-01', endDate: '2026-12-31', timezone: 'America/New_York' }, usageLimits: { maxUses: 150, perBusiness: 1, perConsumer: 0, allocationCap: 3000 }, notifications: [], analyticsData: { views: 0, activations: 0, redemptions: 0, expired: 0, newBusinesses: 0, upgrades: 0, renewals: 0, consumerCardsIssued: 0, consumerVCardsIssued: 0, friendsAndFamilyUsed: 0, discountGiven: 0, revenueGenerated: 0, upgradeValue: 0 }, versionHistory: [
    { version: 1, date: '2026-07-28', changedBy: 'Michael Torres', changes: 'Promotion created' },
  ], activity: [
    { action: 'Promotion Created', date: '2026-07-28', detail: 'Created by Michael Torres' },
    { action: 'Scheduled', date: '2026-07-28', detail: 'Scheduled for Q4 2026' },
  ] },
  { id: '12', promotionId: 'PROMO-2026-0012', name: 'Premium Builder Access', description: 'Free Premium VCard Builder components for 30 days', type: 'Coupon Code', status: 'Active', priority: 12, target: 'Gold, Gold Pro, Gold Pro+', startDate: '2026-06-15', endDate: '2026-08-15', usage: '89 / 300', createdBy: 'Emily Park', createdAt: '2026-06-10', overview: { eligiblePlans: 3, eligibleBusinesses: 300, activeUsers: 89, currentRedemptions: 67 }, eligibility: { membershipPlans: ['Gold', 'Gold Pro', 'Gold Pro+'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional'], registrationDate: 'All businesses', countries: ['United States'], manualAssignment: false }, benefits: { pricing: [], allocations: { businessVCards: 0, businessCards: 0, consumerVCards: 0, consumerCards: 0, friendsAndFamily: 0, additionalCards: 0 }, features: { premiumComponents: true, premiumTemplates: true, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [] }, couponConfig: { code: 'PREMIUM30', generationMethod: 'Manual', usageLimit: 300, perBusinessLimit: 1, expiry: '2026-08-15', stackable: false, reusable: false, validationRule: 'One use per Business' }, schedule: { startDate: '2026-06-15', endDate: '2026-08-15', timezone: 'America/New_York' }, usageLimits: { maxUses: 300, perBusiness: 1, perConsumer: 0, allocationCap: 0 }, notifications: [], analyticsData: { views: 5600, activations: 89, redemptions: 67, expired: 0, newBusinesses: 0, upgrades: 12, renewals: 0, consumerCardsIssued: 0, consumerVCardsIssued: 0, friendsAndFamilyUsed: 0, discountGiven: 0, revenueGenerated: 12000, upgradeValue: 5400 }, versionHistory: [
    { version: 1, date: '2026-06-10', changedBy: 'Emily Park', changes: 'Promotion created' },
  ], activity: [
    { action: 'Promotion Created', date: '2026-06-10', detail: 'Created by Emily Park' },
    { action: 'Published', date: '2026-06-12', detail: 'Published with coupon code PREMIUM30' },
  ] },
  { id: '13', promotionId: 'PROMO-2026-0013', name: 'Reward Points Multiplier', description: '3x reward points on all membership purchases', type: 'Reward Promotion (Coming Soon)', status: 'Draft', priority: 13, target: 'All Plans', startDate: '', endDate: '', usage: '0 / 0', createdBy: 'Sarah Chen', createdAt: '2026-07-30', overview: { eligiblePlans: 12, eligibleBusinesses: 0, activeUsers: 0, currentRedemptions: 0 }, eligibility: { membershipPlans: ['Bronze', 'Silver', 'Gold', 'Platinum'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional', 'Charity', 'Others'], registrationDate: 'All businesses', countries: ['All'], manualAssignment: false }, benefits: { pricing: [], allocations: { businessVCards: 0, businessCards: 0, consumerVCards: 0, consumerCards: 0, friendsAndFamily: 0, additionalCards: 0 }, features: { premiumComponents: false, premiumTemplates: false, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [] }, schedule: { startDate: '', endDate: '', timezone: 'America/New_York' }, usageLimits: { maxUses: 0, perBusiness: 0, perConsumer: 0, allocationCap: 0 }, notifications: [], analyticsData: { views: 0, activations: 0, redemptions: 0, expired: 0, newBusinesses: 0, upgrades: 0, renewals: 0, consumerCardsIssued: 0, consumerVCardsIssued: 0, friendsAndFamilyUsed: 0, discountGiven: 0, revenueGenerated: 0, upgradeValue: 0 }, versionHistory: [
    { version: 1, date: '2026-07-30', changedBy: 'Sarah Chen', changes: 'Draft created' },
  ], activity: [
    { action: 'Draft Created', date: '2026-07-30', detail: 'Draft created by Sarah Chen' },
  ] },
  { id: '14', promotionId: 'PROMO-2026-0014', name: 'Additional Card Blowout', description: '+10 Additional Cards for all Platinum members', type: 'Additional Card Offer', status: 'Active', priority: 14, target: 'Platinum, Platinum Pro, Platinum Pro+', startDate: '2026-07-01', endDate: '2026-08-31', usage: '178 / 400', createdBy: 'Emily Park', createdAt: '2026-06-28', overview: { eligiblePlans: 3, eligibleBusinesses: 400, activeUsers: 178, currentRedemptions: 134 }, eligibility: { membershipPlans: ['Platinum', 'Platinum Pro', 'Platinum Pro+'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional', 'Charity'], registrationDate: 'All businesses', countries: ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany'], manualAssignment: false }, benefits: { pricing: [], allocations: { businessVCards: 0, businessCards: 0, consumerVCards: 0, consumerCards: 0, friendsAndFamily: 0, additionalCards: 10 }, features: { premiumComponents: false, premiumTemplates: false, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [] }, schedule: { startDate: '2026-07-01', endDate: '2026-08-31', timezone: 'America/New_York' }, usageLimits: { maxUses: 400, perBusiness: 1, perConsumer: 0, allocationCap: 4000 }, notifications: [
    { recipient: 'Business Owner', subject: '10 Additional Cards Added', body: 'Your Platinum membership now includes 10 extra Additional Cards.', type: 'Promotion Started' },
  ], analyticsData: { views: 7800, activations: 178, redemptions: 134, expired: 0, newBusinesses: 0, upgrades: 34, renewals: 0, consumerCardsIssued: 0, consumerVCardsIssued: 0, friendsAndFamilyUsed: 0, discountGiven: 0, revenueGenerated: 34000, upgradeValue: 15600 }, versionHistory: [
    { version: 1, date: '2026-06-28', changedBy: 'Emily Park', changes: 'Promotion created' },
  ], activity: [
    { action: 'Promotion Created', date: '2026-06-28', detail: 'Created by Emily Park' },
    { action: 'Published', date: '2026-06-30', detail: 'Published and activated' },
  ] },
  { id: '15', promotionId: 'PROMO-2026-0015', name: 'Winter Freeze Promo', description: 'No payment for January and February for all annual memberships', type: 'Seasonal Promotion', status: 'Draft', priority: 15, target: 'All Annual Plans', startDate: '', endDate: '', usage: '0 / 0', createdBy: 'Michael Torres', createdAt: '2026-07-29', overview: { eligiblePlans: 12, eligibleBusinesses: 0, activeUsers: 0, currentRedemptions: 0 }, eligibility: { membershipPlans: ['Bronze', 'Silver', 'Gold', 'Platinum'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional', 'Charity', 'Others'], registrationDate: 'Existing customers only', countries: ['United States', 'Canada'], manualAssignment: false }, benefits: { pricing: [{ type: 'Free Renewal', description: '2 months free - January and February' }], allocations: { businessVCards: 0, businessCards: 0, consumerVCards: 0, consumerCards: 0, friendsAndFamily: 0, additionalCards: 0 }, features: { premiumComponents: false, premiumTemplates: false, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [] }, schedule: { startDate: '', endDate: '', timezone: 'America/New_York' }, usageLimits: { maxUses: 0, perBusiness: 0, perConsumer: 0, allocationCap: 0 }, notifications: [], analyticsData: { views: 0, activations: 0, redemptions: 0, expired: 0, newBusinesses: 0, upgrades: 0, renewals: 0, consumerCardsIssued: 0, consumerVCardsIssued: 0, friendsAndFamilyUsed: 0, discountGiven: 0, revenueGenerated: 0, upgradeValue: 0 }, versionHistory: [
    { version: 1, date: '2026-07-29', changedBy: 'Michael Torres', changes: 'Draft created' },
  ], activity: [
    { action: 'Draft Created', date: '2026-07-29', detail: 'Draft created by Michael Torres' },
  ] },
  { id: '16', promotionId: 'PROMO-2026-0016', name: 'Q3 Accelerator', description: 'Free setup + 15% off first 6 months for new businesses', type: 'Membership Discount', status: 'Scheduled', priority: 16, target: 'All Plans', startDate: '2026-08-01', endDate: '2026-09-30', usage: '0 / 1000', createdBy: 'Sarah Chen', createdAt: '2026-07-26', overview: { eligiblePlans: 12, eligibleBusinesses: 1000, activeUsers: 0, currentRedemptions: 0 }, eligibility: { membershipPlans: ['Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional'], registrationDate: 'New businesses only', countries: ['United States', 'Canada', 'United Kingdom'], manualAssignment: false }, benefits: { pricing: [{ type: 'Percentage Discount', value: 15, description: '15% off first 6 months' }, { type: 'Free Setup', description: 'Free setup fee waived' }], allocations: { businessVCards: 0, businessCards: 0, consumerVCards: 0, consumerCards: 0, friendsAndFamily: 0, additionalCards: 0 }, features: { premiumComponents: false, premiumTemplates: false, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [] }, couponConfig: { code: 'Q3ACCEL', generationMethod: 'Random', usageLimit: 1000, perBusinessLimit: 1, expiry: '2026-09-30', stackable: false, reusable: false, validationRule: 'One use per Business' }, schedule: { startDate: '2026-08-01', endDate: '2026-09-30', timezone: 'America/New_York' }, usageLimits: { maxUses: 1000, perBusiness: 1, perConsumer: 0, allocationCap: 0 }, notifications: [], analyticsData: { views: 0, activations: 0, redemptions: 0, expired: 0, newBusinesses: 0, upgrades: 0, renewals: 0, consumerCardsIssued: 0, consumerVCardsIssued: 0, friendsAndFamilyUsed: 0, discountGiven: 0, revenueGenerated: 0, upgradeValue: 0 }, versionHistory: [
    { version: 1, date: '2026-07-26', changedBy: 'Sarah Chen', changes: 'Promotion created' },
  ], activity: [
    { action: 'Promotion Created', date: '2026-07-26', detail: 'Created by Sarah Chen' },
    { action: 'Scheduled', date: '2026-07-26', detail: 'Scheduled for Q3 2026' },
  ] },
  { id: '17', promotionId: 'PROMO-2026-0017', name: 'Free Analytics Access', description: 'Unlock advanced analytics for 60 days', type: 'Coupon Code', status: 'Active', priority: 17, target: 'Silver, Gold, Platinum', startDate: '2026-06-01', endDate: '2026-09-30', usage: '234 / 500', createdBy: 'Emily Park', createdAt: '2026-05-30', overview: { eligiblePlans: 9, eligibleBusinesses: 500, activeUsers: 234, currentRedemptions: 189 }, eligibility: { membershipPlans: ['Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional', 'Charity'], registrationDate: 'All businesses', countries: ['United States', 'Canada'], manualAssignment: false }, benefits: { pricing: [], allocations: { businessVCards: 0, businessCards: 0, consumerVCards: 0, consumerCards: 0, friendsAndFamily: 0, additionalCards: 0 }, features: { premiumComponents: false, premiumTemplates: false, dynamicQRPremium: false, analytics: true, advancedBranding: false }, membership: [] }, couponConfig: { code: 'ANALYTICS60', generationMethod: 'Manual', usageLimit: 500, perBusinessLimit: 1, expiry: '2026-09-30', stackable: false, reusable: false, validationRule: 'One use per Business' }, schedule: { startDate: '2026-06-01', endDate: '2026-09-30', timezone: 'America/New_York' }, usageLimits: { maxUses: 500, perBusiness: 1, perConsumer: 0, allocationCap: 0 }, notifications: [], analyticsData: { views: 12000, activations: 234, redemptions: 189, expired: 0, newBusinesses: 0, upgrades: 45, renewals: 23, consumerCardsIssued: 0, consumerVCardsIssued: 0, friendsAndFamilyUsed: 0, discountGiven: 0, revenueGenerated: 45000, upgradeValue: 18900 }, versionHistory: [
    { version: 1, date: '2026-05-30', changedBy: 'Emily Park', changes: 'Promotion created' },
  ], activity: [
    { action: 'Promotion Created', date: '2026-05-30', detail: 'Created by Emily Park' },
    { action: 'Published', date: '2026-06-01', detail: 'Published with coupon ANALYTICS60' },
  ] },
  { id: '18', promotionId: 'PROMO-2026-0018', name: 'Charity Discount Program', description: '40% off all memberships for registered charities and non-profits', type: 'Membership Discount', status: 'Active', priority: 18, target: 'Charity', startDate: '2026-01-01', endDate: '2026-12-31', usage: '67 / 200', createdBy: 'Sarah Chen', createdAt: '2025-12-15', overview: { eligiblePlans: 12, eligibleBusinesses: 200, activeUsers: 67, currentRedemptions: 45 }, eligibility: { membershipPlans: ['Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+'], businessTypes: ['Charity'], registrationDate: 'All businesses', countries: ['All'], manualAssignment: false }, benefits: { pricing: [{ type: 'Percentage Discount', value: 40, description: '40% off all memberships' }], allocations: { businessVCards: 0, businessCards: 0, consumerVCards: 0, consumerCards: 0, friendsAndFamily: 0, additionalCards: 0 }, features: { premiumComponents: false, premiumTemplates: false, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [] }, schedule: { startDate: '2026-01-01', endDate: '2026-12-31', timezone: 'America/New_York' }, usageLimits: { maxUses: 200, perBusiness: 1, perConsumer: 0, allocationCap: 0 }, notifications: [
    { recipient: 'Charity Organization', subject: 'Your Charity Discount is Active', body: 'Your 40% charity discount has been applied to your membership.', type: 'Promotion Started' },
  ], analyticsData: { views: 4500, activations: 67, redemptions: 45, expired: 0, newBusinesses: 45, upgrades: 12, renewals: 34, consumerCardsIssued: 890, consumerVCardsIssued: 456, friendsAndFamilyUsed: 89, discountGiven: 89000, revenueGenerated: 134000, upgradeValue: 12000 }, versionHistory: [
    { version: 1, date: '2025-12-15', changedBy: 'Sarah Chen', changes: 'Promotion created' },
  ], activity: [
    { action: 'Promotion Created', date: '2025-12-15', detail: 'Created by Sarah Chen' },
    { action: 'Published', date: '2026-01-01', detail: 'Published for 2026' },
    { action: 'Business Joined', date: '2026-02-10', detail: 'Hope Foundation joined Charity Discount' },
  ] },
  { id: '19', promotionId: 'PROMO-2026-0019', name: 'Platinum Preview', description: 'Experience Platinum Pro+ for 7 days free', type: 'Free Trial', status: 'Paused', priority: 19, target: 'Gold Pro, Platinum', startDate: '2026-05-01', endDate: '2026-12-31', usage: '156 / 500', createdBy: 'Michael Torres', createdAt: '2026-04-15', overview: { eligiblePlans: 2, eligibleBusinesses: 500, activeUsers: 156, currentRedemptions: 98 }, eligibility: { membershipPlans: ['Gold Pro', 'Platinum'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional', 'Charity'], registrationDate: 'Existing customers only', countries: ['United States', 'Canada', 'United Kingdom'], manualAssignment: true }, benefits: { pricing: [{ type: 'Free Trial', description: '7 days full Platinum Pro+ access' }], allocations: { businessVCards: 50, businessCards: 0, consumerVCards: 2000, consumerCards: 2000, friendsAndFamily: 10, additionalCards: 5 }, features: { premiumComponents: true, premiumTemplates: true, dynamicQRPremium: true, analytics: true, advancedBranding: true }, membership: [{ temporaryTier: 'Platinum Pro+', description: 'Full Platinum Pro+ access for 7 days' }] }, schedule: { startDate: '2026-05-01', endDate: '2026-12-31', timezone: 'America/New_York' }, usageLimits: { maxUses: 500, perBusiness: 1, perConsumer: 0, allocationCap: 50000 }, notifications: [], analyticsData: { views: 15000, activations: 156, redemptions: 98, expired: 45, newBusinesses: 0, upgrades: 34, renewals: 12, consumerCardsIssued: 2345, consumerVCardsIssued: 1234, friendsAndFamilyUsed: 234, discountGiven: 0, revenueGenerated: 67000, upgradeValue: 23400 }, versionHistory: [
    { version: 1, date: '2026-04-15', changedBy: 'Michael Torres', changes: 'Promotion created' },
    { version: 2, date: '2026-05-10', changedBy: 'Michael Torres', changes: 'Extended target to include Gold Pro' },
    { version: 3, date: '2026-07-15', changedBy: 'Admin', changes: 'Paused - under review' },
  ], activity: [
    { action: 'Promotion Created', date: '2026-04-15', detail: 'Created by Michael Torres' },
    { action: 'Published', date: '2026-04-20', detail: 'Published and activated' },
    { action: 'Business Joined', date: '2026-05-01', detail: 'Summit Financial Advisors joined preview' },
    { action: 'Promotion Paused', date: '2026-07-15', detail: 'Paused by Admin for review' },
  ] },
  { id: '20', promotionId: 'PROMO-2026-0020', name: 'FundOrDonate Partnership', description: 'Matching donation campaign - MCOM matches 50% of donations', type: 'Cashback Promotion (Coming Soon)', status: 'Draft', priority: 20, target: 'Charity, Non-Profit', startDate: '', endDate: '', usage: '0 / 0', createdBy: 'Sarah Chen', createdAt: '2026-07-28', overview: { eligiblePlans: 12, eligibleBusinesses: 0, activeUsers: 0, currentRedemptions: 0 }, eligibility: { membershipPlans: ['Bronze', 'Silver', 'Gold', 'Platinum'], businessTypes: ['Charity', 'Others'], registrationDate: 'All businesses', countries: ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France'], manualAssignment: true }, benefits: { pricing: [{ type: 'Percentage Discount', value: 50, description: 'MCOM matches 50% of donations' }], allocations: { businessVCards: 0, businessCards: 0, consumerVCards: 0, consumerCards: 0, friendsAndFamily: 0, additionalCards: 0 }, features: { premiumComponents: false, premiumTemplates: false, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [] }, schedule: { startDate: '', endDate: '', timezone: 'America/New_York' }, usageLimits: { maxUses: 0, perBusiness: 0, perConsumer: 0, allocationCap: 0 }, notifications: [], analyticsData: { views: 0, activations: 0, redemptions: 0, expired: 0, newBusinesses: 0, upgrades: 0, renewals: 0, consumerCardsIssued: 0, consumerVCardsIssued: 0, friendsAndFamilyUsed: 0, discountGiven: 0, revenueGenerated: 0, upgradeValue: 0 }, versionHistory: [
    { version: 1, date: '2026-07-28', changedBy: 'Sarah Chen', changes: 'Draft created' },
  ], activity: [
    { action: 'Draft Created', date: '2026-07-28', detail: 'Draft created by Sarah Chen' },
  ] },
  { id: '21', promotionId: 'PROMO-2026-0021', name: 'Spring Forward Campaign', description: 'Renew early and get 2 months free', type: 'Membership Discount', status: 'Expired', priority: 21, target: 'All Plans', startDate: '2026-03-01', endDate: '2026-05-31', usage: '345 / 500', createdBy: 'Sarah Chen', createdAt: '2026-02-20', overview: { eligiblePlans: 12, eligibleBusinesses: 500, activeUsers: 0, currentRedemptions: 345 }, eligibility: { membershipPlans: ['Bronze', 'Silver', 'Gold', 'Platinum'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional', 'Charity'], registrationDate: 'All businesses', countries: ['United States'], manualAssignment: false }, benefits: { pricing: [{ type: 'Free Renewal', description: '2 months free for early renewal' }], allocations: { businessVCards: 0, businessCards: 0, consumerVCards: 0, consumerCards: 100, friendsAndFamily: 0, additionalCards: 0 }, features: { premiumComponents: false, premiumTemplates: false, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [] }, couponConfig: { code: 'SPRING2026', generationMethod: 'Manual', usageLimit: 500, perBusinessLimit: 1, expiry: '2026-05-31', stackable: false, reusable: false, validationRule: 'One use per Business' }, schedule: { startDate: '2026-03-01', endDate: '2026-05-31', timezone: 'America/New_York' }, usageLimits: { maxUses: 500, perBusiness: 1, perConsumer: 0, allocationCap: 0 }, notifications: [], analyticsData: { views: 28000, activations: 345, redemptions: 345, expired: 155, newBusinesses: 89, upgrades: 67, renewals: 234, consumerCardsIssued: 3456, consumerVCardsIssued: 0, friendsAndFamilyUsed: 0, discountGiven: 45000, revenueGenerated: 234000, upgradeValue: 34500 }, versionHistory: [
    { version: 1, date: '2026-02-20', changedBy: 'Sarah Chen', changes: 'Promotion created' },
  ], activity: [
    { action: 'Promotion Created', date: '2026-02-20', detail: 'Created by Sarah Chen' },
    { action: 'Published', date: '2026-02-25', detail: 'Published for Spring 2026' },
    { action: 'Promotion Ended', date: '2026-06-01', detail: 'Campaign ended - 345 redemptions' },
    { action: 'Archived', date: '2026-06-15', detail: 'Archived by System' },
  ] },
  { id: '22', promotionId: 'PROMO-2026-0022', name: 'New Year Kickstart', description: '50% off January and February for new members', type: 'Membership Discount', status: 'Expired', priority: 22, target: 'New Businesses', startDate: '2026-01-01', endDate: '2026-02-28', usage: '456 / 500', createdBy: 'Michael Torres', createdAt: '2025-12-20', overview: { eligiblePlans: 6, eligibleBusinesses: 500, activeUsers: 0, currentRedemptions: 456 }, eligibility: { membershipPlans: ['Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional'], registrationDate: 'New businesses only', countries: ['United States', 'Canada'], manualAssignment: false }, benefits: { pricing: [{ type: 'Percentage Discount', value: 50, description: '50% off Jan-Feb' }], allocations: { businessVCards: 0, businessCards: 0, consumerVCards: 0, consumerCards: 0, friendsAndFamily: 0, additionalCards: 0 }, features: { premiumComponents: false, premiumTemplates: false, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [] }, schedule: { startDate: '2026-01-01', endDate: '2026-02-28', timezone: 'America/New_York' }, usageLimits: { maxUses: 500, perBusiness: 1, perConsumer: 0, allocationCap: 0 }, notifications: [], analyticsData: { views: 35000, activations: 456, redemptions: 456, expired: 44, newBusinesses: 456, upgrades: 89, renewals: 167, consumerCardsIssued: 5678, consumerVCardsIssued: 2345, friendsAndFamilyUsed: 456, discountGiven: 120000, revenueGenerated: 345000, upgradeValue: 67800 }, versionHistory: [
    { version: 1, date: '2025-12-20', changedBy: 'Michael Torres', changes: 'Promotion created' },
  ], activity: [
    { action: 'Promotion Created', date: '2025-12-20', detail: 'Created by Michael Torres' },
    { action: 'Published', date: '2026-01-01', detail: 'Published for New Year 2026' },
    { action: 'Promotion Ended', date: '2026-03-01', detail: 'Campaign ended with 456 new businesses' },
  ] },
  { id: '23', promotionId: 'PROMO-2026-0023', name: 'Loyalty Reward Program', description: '1 free month for every 12 consecutive months of membership', type: 'Reward Promotion (Coming Soon)', status: 'Archived', priority: 23, target: 'All Plans', startDate: '2025-01-01', endDate: '2025-12-31', usage: '1200 / 2000', createdBy: 'Sarah Chen', createdAt: '2024-12-01', overview: { eligiblePlans: 12, eligibleBusinesses: 2000, activeUsers: 0, currentRedemptions: 1200 }, eligibility: { membershipPlans: ['Bronze', 'Silver', 'Gold', 'Platinum'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional', 'Charity', 'Others'], registrationDate: 'Existing customers only', countries: ['All'], manualAssignment: false }, benefits: { pricing: [{ type: 'Percentage Discount', value: 100, description: '1 month free per 12 months' }], allocations: { businessVCards: 0, businessCards: 0, consumerVCards: 0, consumerCards: 100, friendsAndFamily: 0, additionalCards: 0 }, features: { premiumComponents: false, premiumTemplates: false, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [] }, schedule: { startDate: '2025-01-01', endDate: '2025-12-31', timezone: 'America/New_York' }, usageLimits: { maxUses: 2000, perBusiness: 1, perConsumer: 0, allocationCap: 0 }, notifications: [], analyticsData: { views: 89000, activations: 1200, redemptions: 1200, expired: 800, newBusinesses: 0, upgrades: 234, renewals: 890, consumerCardsIssued: 12345, consumerVCardsIssued: 6789, friendsAndFamilyUsed: 2345, discountGiven: 234000, revenueGenerated: 890000, upgradeValue: 123000 }, versionHistory: [
    { version: 1, date: '2024-12-01', changedBy: 'Sarah Chen', changes: 'Promotion created' },
  ], activity: [
    { action: 'Promotion Created', date: '2024-12-01', detail: 'Created by Sarah Chen' },
    { action: 'Published', date: '2025-01-01', detail: 'Published for 2025' },
    { action: 'Promotion Ended', date: '2026-01-01', detail: 'Campaign ended - archived' },
  ] },
  { id: '24', promotionId: 'PROMO-2026-0024', name: 'Holiday Flash Sale', description: '24-hour flash sale - 30% off all annual memberships', type: 'Seasonal Promotion', status: 'Expired', priority: 24, target: 'All Plans', startDate: '2025-12-24', endDate: '2025-12-25', usage: '789 / 1000', createdBy: 'Emily Park', createdAt: '2025-12-20', overview: { eligiblePlans: 12, eligibleBusinesses: 1000, activeUsers: 0, currentRedemptions: 789 }, eligibility: { membershipPlans: ['Bronze', 'Silver', 'Gold', 'Platinum'], businessTypes: ['Restaurant', 'Retail', 'Services', 'Professional', 'Charity', 'Others'], registrationDate: 'All businesses', countries: ['All'], manualAssignment: false }, benefits: { pricing: [{ type: 'Percentage Discount', value: 30, description: '30% off annual memberships' }], allocations: { businessVCards: 0, businessCards: 0, consumerVCards: 0, consumerCards: 200, friendsAndFamily: 0, additionalCards: 0 }, features: { premiumComponents: false, premiumTemplates: false, dynamicQRPremium: false, analytics: false, advancedBranding: false }, membership: [] }, couponConfig: { code: 'FLASH30', generationMethod: 'Random', usageLimit: 1000, perBusinessLimit: 1, expiry: '2025-12-25', stackable: false, reusable: false, validationRule: 'One use per Business' }, schedule: { startDate: '2025-12-24', endDate: '2025-12-25', timezone: 'America/New_York', dailyStartTime: '00:00', dailyEndTime: '23:59' }, usageLimits: { maxUses: 1000, perBusiness: 1, perConsumer: 0, allocationCap: 0 }, notifications: [], analyticsData: { views: 56000, activations: 789, redemptions: 789, expired: 211, newBusinesses: 234, upgrades: 123, renewals: 456, consumerCardsIssued: 8900, consumerVCardsIssued: 4567, friendsAndFamilyUsed: 1234, discountGiven: 234000, revenueGenerated: 567000, upgradeValue: 89000 }, versionHistory: [
    { version: 1, date: '2025-12-20', changedBy: 'Emily Park', changes: 'Promotion created' },
  ], activity: [
    { action: 'Promotion Created', date: '2025-12-20', detail: 'Created by Emily Park' },
    { action: 'Published', date: '2025-12-22', detail: 'Published for Flash Sale' },
    { action: 'Promotion Started', date: '2025-12-24', detail: '24-hour flash sale started' },
    { action: 'Promotion Ended', date: '2025-12-26', detail: 'Flash sale ended - 789 redemptions' },
  ] },
]
const PROMOTION_TYPES = ['All', 'Membership Discount', 'Free Trial', 'Upgrade Campaign', 'Additional Card Offer', 'Friends & Family Bonus', 'Consumer Card Bonus', 'Consumer VCard Bonus', 'Coupon Code', 'Seasonal Promotion']
const STATUSES = ['All', 'Active', 'Draft', 'Scheduled', 'Expired']
const ALL_PLANS = ['All', 'Bronze', 'Bronze Pro', 'Bronze Pro+', 'Silver', 'Silver Pro', 'Silver Pro+', 'Gold', 'Gold Pro', 'Gold Pro+', 'Platinum', 'Platinum Pro', 'Platinum Pro+']
const DATE_FILTERS = ['All', 'Today', 'This Week', 'This Month', 'Custom']

const TYPE_COLORS: Record<string, string> = {
  'Membership Discount': 'bg-green-50 dark:bg-green-500/10 text-green-600',
  'Free Trial': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
  'Upgrade Campaign': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600',
  'Additional Card Offer': 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600',
  'Friends & Family Bonus': 'bg-pink-50 dark:bg-pink-500/10 text-pink-600',
  'Consumer Card Bonus': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
  'Consumer VCard Bonus': 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600',
  'Coupon Code': 'bg-orange-50 dark:bg-orange-500/10 text-orange-600',
  'Seasonal Promotion': 'bg-rose-50 dark:bg-rose-500/10 text-rose-600',
}
const DEFAULT_TYPE_COLOR = 'bg-gray-50 dark:bg-gray-500/10 text-gray-600'

const STATUS_COLORS: Record<string, string> = {
  'Active': 'bg-green-50 dark:bg-green-500/10 text-green-600',
  'Draft': 'bg-gray-50 dark:bg-gray-500/10 text-gray-600',
  'Scheduled': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
  'Paused': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
  'Expired': 'bg-red-50 dark:bg-red-500/10 text-red-600',
  'Archived': 'bg-gray-50 dark:bg-gray-500/10 text-gray-600',
}

function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] || DEFAULT_TYPE_COLOR
  return <span className={"px-2 py-0.5 rounded-full text-[10px] font-medium " + (color || '')}>{type}</span>
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || DEFAULT_TYPE_COLOR
  const dot: Record<string, string> = {
    'Active': 'bg-green-500', 'Draft': 'bg-gray-400', 'Scheduled': 'bg-blue-500',
    'Paused': 'bg-amber-500', 'Expired': 'bg-red-500', 'Archived': 'bg-gray-400',
  }
  return (
    <span className={"inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium " + (color || '')}>
      <span className={"w-1.5 h-1.5 rounded-full " + (dot[status] || 'bg-gray-400')} />
      {status}
    </span>
  )
}

const tabs = ['overview', 'eligibility', 'benefits', 'coupon', 'schedule', 'limits', 'notifications', 'analytics', 'history', 'activity']
const tabLabels = ['Overview', 'Eligibility', 'Benefits', 'Coupon Settings', 'Schedule', 'Usage & Limits', 'Notifications', 'Analytics', 'Version History', 'Activity']

export default function PromotionsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterType, setFilterType] = useState('All')
  const [filterPlan, setFilterPlan] = useState('All')
  const [filterDate, setFilterDate] = useState('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [workspaceTab, setWorkspaceTab] = useState('overview')
  const [showSimulator, setShowSimulator] = useState(false)

  const filtered = useMemo(() => {
    return PROMOTIONS.filter(p => {
      if (search) {
        const q = search.toLowerCase()
        if (!p.name.toLowerCase().includes(q) && !p.promotionId.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false
      }
      if (filterStatus !== 'All' && p.status !== filterStatus) return false
      if (filterType !== 'All' && p.type !== filterType) return false
      if (filterPlan !== 'All' && !p.eligibility.membershipPlans.includes(filterPlan)) return false
      if (filterDate !== 'All') {
        const today = new Date()
        if (filterDate === 'Today' && p.startDate !== today.toISOString().slice(0, 10)) return false
      }
      return true
    })
  }, [search, filterStatus, filterType, filterPlan, filterDate])

  const p = selectedId !== null ? PROMOTIONS.find(x => x.id === selectedId)! : null

  function handleAction(msg: string) { toast.success(msg) }

  function simulatePromotion() {
    toast.success('Simulation complete: Expected +500 Consumer Cards, +250 upgrades, 12.4% conversion rate')
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-6 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Unable to load Promotions</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The promotion engine could not be reached.</p>
        <div className="flex gap-3">
          <button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 800) }} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Retry</button>
          <Link to="/admin/system-status" className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">View System Status</Link>
        </div>
      </div>
    )
  }

  const activePromos = PROMOTIONS.filter(x => x.status === 'Active').length
  const scheduledPromos = PROMOTIONS.filter(x => x.status === 'Scheduled').length
  const draftPromos = PROMOTIONS.filter(x => x.status === 'Draft').length
  const expiredPromos = PROMOTIONS.filter(x => x.status === 'Expired').length
  const couponCodes = PROMOTIONS.filter(x => x.couponConfig).length
  const redeemedCoupons = PROMOTIONS.reduce((s, x) => s + x.analyticsData.redemptions, 0)
  const totalExtraCards = PROMOTIONS.reduce((s, x) => s + x.analyticsData.consumerCardsIssued, 0)
  const totalExtraVCards = PROMOTIONS.reduce((s, x) => s + x.analyticsData.consumerVCardsIssued, 0)
  const totalExtraFF = PROMOTIONS.reduce((s, x) => s + x.analyticsData.friendsAndFamilyUsed, 0)

  const totalUpgrades = PROMOTIONS.reduce((s, x) => s + x.analyticsData.upgrades, 0)
  const trialOffers = PROMOTIONS.filter(x => x.type === 'Free Trial').length
  const upgradeCampaigns = PROMOTIONS.filter(x => x.type === 'Upgrade Campaign').length
  const seasonalOffers = PROMOTIONS.filter(x => x.type === 'Seasonal Promotion').length

  return (
    <>
      <Helmet><title>Promotions & Coupons - Admin | MCOM VCard</title></Helmet>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Promotions & Coupons</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Promotion & Campaign Incentive Engine</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setShowSimulator(!showSimulator); if (showSimulator) simulatePromotion() }} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Promotion Simulator
            </button>
            <button onClick={() => handleAction('Create new promotion')} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Create Promotion
            </button>
          </div>
        </div>

        {showSimulator && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-500/5 dark:to-purple-500/5 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Promotion Simulator</span>
              <span className="text-gray-500 dark:text-gray-400">Bronze Upgrade Campaign</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">100 Businesses</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              <span className="text-purple-600 dark:text-purple-400 font-medium">Expected Extra Consumer Cards: 500</span>
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-[10px] font-semibold rounded">PASS</span>
              <button onClick={simulatePromotion} className="ml-auto px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">Run Simulation</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Active Promotions</div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs font-medium">{activePromos} Running</span></div>
              <div className="flex items-center gap-1.5 text-blue-600"><span className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-xs font-medium">{scheduledPromos} Scheduled</span></div>
              <div className="flex items-center gap-1.5 text-gray-500"><span className="w-2 h-2 rounded-full bg-gray-400" /><span className="text-xs font-medium">{draftPromos} Draft</span></div>
              <div className="flex items-center gap-1.5 text-red-500"><span className="w-2 h-2 rounded-full bg-red-400" /><span className="text-xs font-medium">{expiredPromos} Expired</span></div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Coupon Codes</div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="text-green-600">{couponCodes} Active</span>
              <span className="text-purple-600">{redeemedCoupons.toLocaleString()} Redeemed</span>
              <span className="text-red-500">{PROMOTIONS.filter(x => x.status === 'Expired' && x.couponConfig).length} Expired</span>
              <span className="text-gray-500">{PROMOTIONS.filter(x => x.status === 'Paused' && x.couponConfig).length} Disabled</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Membership Promotions</div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="text-blue-600">{trialOffers} Trial Offers</span>
              <span className="text-purple-600">{upgradeCampaigns} Upgrade Campaigns</span>
              <span className="text-rose-600">{seasonalOffers} Seasonal Offers</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Promotional Allocations</div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="text-cyan-600">{totalExtraCards.toLocaleString()} Extra Cards</span>
              <span className="text-indigo-600">{totalExtraVCards.toLocaleString()} Extra VCards</span>
              <span className="text-pink-600">{totalExtraFF.toLocaleString()} Extra F&F</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Promotion Performance</div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="text-gray-700 dark:text-gray-300">{redeemedCoupons.toLocaleString()} Redemptions</span>
              <span className="text-green-600">12.4% Conv.</span>
              <span className="text-blue-600">{totalUpgrades} Upgrades</span>
              <span className="text-emerald-600"> Revenue</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, code, plan, business, or ID..." className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">{PROMOTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
          <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)} className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">{ALL_PLANS.map(p => <option key={p} value={p}>{p}</option>)}</select>
          <select value={filterDate} onChange={e => setFilterDate(e.target.value)} className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">{DATE_FILTERS.map(d => <option key={d} value={d}>{d}</option>)}</select>
          <button onClick={() => handleAction('Filters cleared')} className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg">Clear</button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">Bulk Actions:</span>
          <button onClick={() => handleAction('Publish selected promotions')} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Publish</button>
          <button onClick={() => handleAction('Pause selected promotions')} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Pause</button>
          <button onClick={() => handleAction('Resume selected promotions')} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Resume</button>
          <button onClick={() => handleAction('Archive selected promotions')} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Archive</button>
          <button onClick={() => handleAction('Export report')} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Export</button>
          <button onClick={() => handleAction('Generate coupon codes')} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Generate Codes</button>
          <button onClick={() => handleAction('Assign to businesses')} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Assign</button>
        </div>
{selectedId === null ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No Promotions Found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md">Create a promotion to encourage memberships, upgrades, or seasonal campaigns.</p>
                <button onClick={() => handleAction('Create first promotion')} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Create Promotion</button>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-3 py-3 text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 w-8"><input type="checkbox" className="rounded border-gray-300" /></th>
                    <th className="px-3 py-3 text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Promotion Name</th>
                    <th className="px-3 py-3 text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Type</th>
                    <th className="px-3 py-3 text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-3 py-3 text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Target</th>
                    <th className="px-3 py-3 text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Start</th>
                    <th className="px-3 py-3 text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">End</th>
                    <th className="px-3 py-3 text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Usage</th>
                    <th className="px-3 py-3 text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Created By</th>
                    <th className="px-3 py-3 text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(x => (
                    <tr key={x.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer" onClick={() => setSelectedId(x.id)}>
                      <td className="px-3 py-3" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300" /></td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-gray-900 dark:text-white text-xs">{x.name}</div>
                        <div className="font-mono text-[10px] text-gray-400">{x.promotionId}</div>
                      </td>
                      <td className="px-3 py-3"><TypeBadge type={x.type} /></td>
                      <td className="px-3 py-3"><StatusBadge status={x.status} /></td>
                      <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-400">{x.target}</td>
                      <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-400">{x.startDate || '-'}</td>
                      <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-400">{x.endDate || '-'}</td>
                      <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-400">{x.usage || '-'}</td>
                      <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-400">{x.createdBy}</td>
                      <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setSelectedId(x.id); setWorkspaceTab('overview') }} className="p-1 text-gray-400 hover:text-blue-600" title="View">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button onClick={() => handleAction('Edit ' + x.name)} className="p-1 text-gray-400 hover:text-green-600" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleAction('Duplicated ' + x.name)} className="p-1 text-gray-400 hover:text-purple-600" title="Duplicate">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          </button>
                          {x.status === 'Active' && <button onClick={() => handleAction('Paused ' + x.name)} className="p-1 text-gray-400 hover:text-amber-600" title="Pause">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </button>}
                          {x.status === 'Paused' && <button onClick={() => handleAction('Resumed ' + x.name)} className="p-1 text-gray-400 hover:text-green-600" title="Resume">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </button>}
                          {x.status === 'Draft' && <button onClick={() => handleAction('Deleted ' + x.name)} className="p-1 text-gray-400 hover:text-red-600" title="Delete">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>}
                          <button onClick={() => handleAction('Analytics for ' + x.name)} className="p-1 text-gray-400 hover:text-indigo-600" title="Analytics">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                          </button>
                          <button onClick={() => handleAction('Exported ' + x.name)} className="p-1 text-gray-400 hover:text-gray-600" title="Export">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        ) : p && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedId(null)} className="p-1 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div>
                  <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">{p.promotionId}</span>
                  <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{p.name}</span>
                  <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                  <TypeBadge type={p.type} />
                  <span className="ml-2"><StatusBadge status={p.status} /></span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleAction('Edit ' + p.name)} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">Edit</button>
                {p.status === 'Draft' && <button onClick={() => handleAction('Published ' + p.name)} className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">Publish</button>}
                {p.status === 'Active' && <button onClick={() => handleAction('Paused ' + p.name)} className="px-3 py-1.5 bg-amber-600 text-white text-xs rounded-lg hover:bg-amber-700">Pause</button>}
                {p.status === 'Paused' && <button onClick={() => handleAction('Resumed ' + p.name)} className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">Resume</button>}
                <button onClick={() => handleAction('Duplicated ' + p.name)} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Duplicate</button>
                <button onClick={() => handleAction('Archived ' + p.name)} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Archive</button>
              </div>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {tabs.map((tab, i) => (
                <button key={tab} onClick={() => setWorkspaceTab(tab)} className={workspaceTab === tab ? 'px-4 py-2.5 text-[11px] font-medium whitespace-nowrap border-b-2 text-blue-600 border-blue-600' : 'px-4 py-2.5 text-[11px] font-medium whitespace-nowrap border-b-2 text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}>
                  {tabLabels[i]}
                </button>
              ))}
            </div>

            <div className="p-4 space-y-6">
              {workspaceTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">General Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-gray-400">Promotion Name</span><span className="text-gray-900 dark:text-white font-medium">{p.name}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-gray-400">Internal ID</span><span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">{p.promotionId}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-gray-400">Description</span><span className="text-gray-900 dark:text-white max-w-[300px] text-right">{p.description}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-gray-400">Promotion Type</span><TypeBadge type={p.type} /></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-gray-400">Status</span><StatusBadge status={p.status} /></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-gray-400">Priority</span><span className="text-gray-900 dark:text-white font-medium">{p.priority}</span></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Quick Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-gray-400">Eligible Plans</span><span className="text-gray-900 dark:text-white font-medium">{p.overview.eligiblePlans}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-gray-400">Eligible Businesses</span><span className="text-gray-900 dark:text-white font-medium">{p.overview.eligibleBusinesses.toLocaleString()}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-gray-400">Active Users</span><span className="text-gray-900 dark:text-white font-medium">{p.overview.activeUsers}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-gray-400">Current Redemptions</span><span className="text-gray-900 dark:text-white font-medium">{p.overview.currentRedemptions.toLocaleString()}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {workspaceTab === 'eligibility' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Membership Plans</h3>
                    <div className="flex flex-wrap gap-1.5">{p.eligibility.membershipPlans.map(plan => <span key={plan} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-[10px] font-medium rounded">{plan}</span>)}</div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-4">Business Types</h3>
                    <div className="flex flex-wrap gap-1.5">{p.eligibility.businessTypes.map(t => <span key={t} className="px-2 py-0.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 text-[10px] font-medium rounded">{t}</span>)}</div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Registration Date</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{p.eligibility.registrationDate}</p>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-4">Countries / Regions</h3>
                    <div className="flex flex-wrap gap-1.5">{p.eligibility.countries.map(c => <span key={c} className="px-2 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-600 text-[10px] font-medium rounded">{c}</span>)}</div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-4">Manual Assignment</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{p.eligibility.manualAssignment ? 'Enabled - Admin can assign' : 'Disabled - Automatic only'}</p>
                  </div>
                </div>
              )}

              {workspaceTab === 'benefits' && (
                <div className="space-y-6">
                  {p.benefits.pricing.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Pricing Benefits</h3>
                      <div className="space-y-2">{p.benefits.pricing.map((b, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-lg">
                          <span className="px-2 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-600 font-medium rounded">{b.type}</span>
                          {b.value !== undefined && <span className="font-mono">{b.value}{b.type.includes('Percentage') ? '%' : ''}</span>}
                          <span className="text-gray-500 dark:text-gray-400">{b.description}</span>
                        </div>
                      ))}</div>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Allocation Benefits</h3>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-lg flex justify-between"><span className="text-gray-500">Bus. VCards</span><span className="font-medium">{p.benefits.allocations.businessVCards || '-'}</span></div>
                      <div className="bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-lg flex justify-between"><span className="text-gray-500">Bus. Cards</span><span className="font-medium">{p.benefits.allocations.businessCards || '-'}</span></div>
                      <div className="bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-lg flex justify-between"><span className="text-gray-500">Con. VCards</span><span className="font-medium">{p.benefits.allocations.consumerVCards || '-'}</span></div>
                      <div className="bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-lg flex justify-between"><span className="text-gray-500">Con. Cards</span><span className="font-medium">{p.benefits.allocations.consumerCards || '-'}</span></div>
                      <div className="bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-lg flex justify-between"><span className="text-gray-500">F&F</span><span className="font-medium">{p.benefits.allocations.friendsAndFamily || '-'}</span></div>
                      <div className="bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-lg flex justify-between"><span className="text-gray-500">Add. Cards</span><span className="font-medium">{p.benefits.allocations.additionalCards || '-'}</span></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Feature Benefits</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(p.benefits.features).filter(([, v]) => v).map(([key]) => (
                        <span key={key} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 text-[10px] font-medium rounded">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                        </span>
                      ))}
                      {!Object.values(p.benefits.features).some(Boolean) && <span className="text-xs text-gray-400">No feature benefits</span>}
                    </div>
                  </div>
                  {p.benefits.membership.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Membership Benefits</h3>
                      <div className="space-y-2">{p.benefits.membership.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-lg">
                          {m.temporaryTier && <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 font-medium rounded">{m.temporaryTier}</span>}
                          <span className="text-gray-500 dark:text-gray-400">{m.description}</span>
                        </div>
                      ))}</div>
                    </div>
                  )}
                </div>
              )}

              {workspaceTab === 'coupon' && (
                p.couponConfig ? (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Coupon Code</h3>
                      <div className="bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-lg text-xs space-y-2">
                        <div className="flex justify-between"><span className="text-gray-500">Code</span><span className="font-mono text-blue-600 font-medium">{p.couponConfig.code}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Generation</span><span>{p.couponConfig.generationMethod}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Usage Limit</span><span>{p.couponConfig.usageLimit.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Per Business</span><span>{p.couponConfig.perBusinessLimit}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Expiry</span><span>{p.couponConfig.expiry}</span></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Validation</h3>
                      <div className="bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-lg text-xs space-y-2">
                        <div className="flex justify-between"><span className="text-gray-500">Stackable</span><span className={p.couponConfig.stackable ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>{p.couponConfig.stackable ? 'Yes' : 'No'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Reusable</span><span className={p.couponConfig.reusable ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>{p.couponConfig.reusable ? 'Yes' : 'No'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Rule</span><span>{p.couponConfig.validationRule}</span></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8"><p className="text-sm text-gray-400">No coupon configured.</p></div>
                )
              )}

              {workspaceTab === 'schedule' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold mb-2">Schedule</h3>
                    <div className="bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-lg text-xs space-y-2">
                      <div className="flex justify-between"><span className="text-gray-500">Start Date</span><span className="font-medium">{p.schedule.startDate || 'Not set'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">End Date</span><span className="font-medium">{p.schedule.endDate || 'Not set'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Time Zone</span><span>{p.schedule.timezone}</span></div>
                      {p.schedule.dailyStartTime && <div className="flex justify-between"><span className="text-gray-500">Daily Start</span><span>{p.schedule.dailyStartTime}</span></div>}
                      {p.schedule.dailyEndTime && <div className="flex justify-between"><span className="text-gray-500">Daily End</span><span>{p.schedule.dailyEndTime}</span></div>}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold mb-2">Automatic Activation</h3>
                    <p className="text-xs text-gray-500">Promotion Engine handles auto start/end, reminders, expiry.</p>
                  </div>
                </div>
              )}

              {workspaceTab === 'limits' && (
                <div>
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold mb-2">Usage & Limits</h3>
                    <div className="bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-lg text-xs space-y-2">
                      <div className="flex justify-between"><span>Maximum Uses</span><span className="font-medium">{p.usageLimits.maxUses ? p.usageLimits.maxUses.toLocaleString() : 'Unlimited'}</span></div>
                      <div className="flex justify-between"><span>Per Business</span><span className="font-medium">{p.usageLimits.perBusiness || 'Unlimited'}</span></div>
                      <div className="flex justify-between"><span>Per Consumer</span><span className="font-medium">{p.usageLimits.perConsumer || 'Unlimited'}</span></div>
                      <div className="flex justify-between"><span>Allocation Cap</span><span className="font-medium">{p.usageLimits.allocationCap ? p.usageLimits.allocationCap.toLocaleString() : 'N/A'}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {workspaceTab === 'notifications' && (
                p.notifications.length > 0 ? (
                  <div className="space-y-3">
                    {p.notifications.map((n, i) => (
                      <div key={i} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 font-medium rounded">{n.type}</span>
                          <span className="text-gray-500">To: {n.recipient}</span>
                        </div>
                        <p className="font-medium">{n.subject}</p>
                        <p className="text-gray-500">{n.body}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8"><p className="text-sm text-gray-400">No notifications configured.</p></div>
                )
              )}

              {workspaceTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><div className="text-[10px] text-gray-500">Views</div><div className="text-lg font-bold">{p.analyticsData.views.toLocaleString()}</div></div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><div className="text-[10px] text-gray-500">Activations</div><div className="text-lg font-bold">{p.analyticsData.activations.toLocaleString()}</div></div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><div className="text-[10px] text-gray-500">Redemptions</div><div className="text-lg font-bold">{p.analyticsData.redemptions.toLocaleString()}</div></div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center"><div className="text-[10px] text-gray-500">Expired</div><div className="text-lg font-bold">{p.analyticsData.expired.toLocaleString()}</div></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3"><div className="text-[10px] text-gray-500 mb-1">Business Impact</div><div className="space-y-1 text-xs"><div className="flex justify-between"><span>New Businesses</span><span className="font-medium">{p.analyticsData.newBusinesses.toLocaleString()}</span></div><div className="flex justify-between"><span>Upgrades</span><span className="font-medium">{p.analyticsData.upgrades.toLocaleString()}</span></div><div className="flex justify-between"><span>Renewals</span><span className="font-medium">{p.analyticsData.renewals.toLocaleString()}</span></div></div></div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3"><div className="text-[10px] text-gray-500 mb-1">Consumer Impact</div><div className="space-y-1 text-xs"><div className="flex justify-between"><span>Cards Issued</span><span className="font-medium">{p.analyticsData.consumerCardsIssued.toLocaleString()}</span></div><div className="flex justify-between"><span>VCards Issued</span><span className="font-medium">{p.analyticsData.consumerVCardsIssued.toLocaleString()}</span></div><div className="flex justify-between"><span>F&F Used</span><span className="font-medium">{p.analyticsData.friendsAndFamilyUsed.toLocaleString()}</span></div></div></div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3"><div className="text-[10px] text-gray-500 mb-1">Revenue Impact</div><div className="space-y-1 text-xs"><div className="flex justify-between"><span>Discount Given</span><span className="font-medium">$</span><span className="font-medium">{p.analyticsData.discountGiven.toLocaleString()}</span></div><div className="flex justify-between"><span>Revenue Generated</span><span className="font-medium">$</span><span className="font-medium">{p.analyticsData.revenueGenerated.toLocaleString()}</span></div><div className="flex justify-between"><span>Upgrade Value</span><span className="font-medium">$</span><span className="font-medium">{p.analyticsData.upgradeValue.toLocaleString()}</span></div></div></div>
                  </div>
                </div>
              )}

              {workspaceTab === 'history' && (
                <div className="space-y-2">
                  {p.versionHistory.map((v, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-lg">
                      <span className="font-mono text-blue-600 shrink-0">v{v.version}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{v.changedBy}</span>
                          <span className="text-gray-400">{v.date}</span>
                        </div>
                        <p className="text-gray-500">{v.changes}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleAction('Compare v' + v.version)} className="px-2 py-1 border border-gray-300 text-gray-600 rounded hover:bg-gray-100">Compare</button>
                        <button onClick={() => handleAction('Restored v' + v.version)} className="px-2 py-1 border border-gray-300 text-gray-600 rounded hover:bg-gray-100">Restore</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {workspaceTab === 'activity' && (
                <div className="relative pl-6">
                  {p.activity.map((a, i) => (
                    <div key={i} className="relative pb-4">
                      {i < p.activity.length - 1 && <div className="absolute left-0 top-2 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />}
                      <div className="flex items-start gap-3">
                        <div className="absolute left-[-6px] w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800 mt-0.5" />
                        <div className="text-xs ml-4">
                          <p className="font-medium">{a.action}</p>
                          <p className="text-gray-500">{a.detail}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{a.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
