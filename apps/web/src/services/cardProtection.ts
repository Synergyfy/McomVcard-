export type ProtectedSectionKey = 'services' | 'appointments' | 'wallet' | 'rewards' | 'exchange' | 'redeem' | 'offers'

export type AccessExpiry = 'never' | 'today' | 'week' | 'month'

export interface CardProtectionState {
    enabled: boolean
    hasPassword: boolean
    protectedSections: Record<ProtectedSectionKey, boolean>
    accessExpiry: AccessExpiry
    expiresAt: string | null
}

export const PROTECTED_SECTION_LABELS: Record<ProtectedSectionKey, string> = {
    services: 'Services',
    appointments: 'Appointments',
    wallet: 'Wallet',
    rewards: 'Rewards',
    exchange: 'Exchange',
    redeem: 'Redeem',
    offers: 'Offers',
}

export const PASSCODE_LENGTH = 6

export function isValidPasscode(value: string): boolean {
    return /^\d{6}$/.test(value)
}

export const ACCESS_EXPIRY_LABELS: Record<AccessExpiry, string> = {
    never: 'Never',
    today: 'Today',
    week: '1 Week',
    month: '1 Month',
}

const DEFAULT_SECTIONS: Record<ProtectedSectionKey, boolean> = {
    services: true,
    appointments: true,
    wallet: true,
    rewards: true,
    exchange: true,
    redeem: true,
    offers: true,
}

interface StoredCardProtection {
    enabled: boolean
    password: string
    hasPassword: boolean
    protectedSections: Record<ProtectedSectionKey, boolean>
    accessExpiry: AccessExpiry
    expiresAt: string | null
}

const stores = new Map<string, StoredCardProtection>()

const delay = () => new Promise((r) => setTimeout(r, 200))

function defaultStore(): StoredCardProtection {
    return {
        enabled: false,
        password: '',
        hasPassword: false,
        protectedSections: { ...DEFAULT_SECTIONS },
        accessExpiry: 'never',
        expiresAt: null,
    }
}

function getStore(cardId: string): StoredCardProtection {
    if (!stores.has(cardId)) stores.set(cardId, defaultStore())
    return stores.get(cardId)!
}

function computeExpiry(accessExpiry: AccessExpiry): string | null {
    if (accessExpiry === 'never') return null
    const now = new Date()
    if (accessExpiry === 'today') now.setHours(23, 59, 59, 999)
    else if (accessExpiry === 'week') now.setDate(now.getDate() + 7)
    else if (accessExpiry === 'month') now.setMonth(now.getMonth() + 1)
    return now.toISOString()
}

function isExpired(s: StoredCardProtection): boolean {
    if (!s.enabled || !s.expiresAt) return false
    return Date.now() > new Date(s.expiresAt).getTime()
}

function snapshot(s: StoredCardProtection): CardProtectionState {
    return {
        enabled: s.enabled,
        hasPassword: s.hasPassword,
        protectedSections: { ...s.protectedSections },
        accessExpiry: s.accessExpiry,
        expiresAt: s.expiresAt,
    }
}

export const cardProtectionService = {
    async getState(cardId: string): Promise<CardProtectionState> {
        return delay().then(() => snapshot(getStore(cardId)))
    },
    async enable(cardId: string, password: string, accessExpiry: AccessExpiry = 'never'): Promise<CardProtectionState> {
        return delay().then(() => {
            const s = getStore(cardId)
            s.enabled = true
            s.password = password
            s.hasPassword = password.trim().length > 0
            s.accessExpiry = accessExpiry
            s.expiresAt = computeExpiry(accessExpiry)
            return snapshot(s)
        })
    },
    async updateAccess(cardId: string, accessExpiry: AccessExpiry): Promise<CardProtectionState> {
        return delay().then(() => {
            const s = getStore(cardId)
            s.accessExpiry = accessExpiry
            s.expiresAt = computeExpiry(accessExpiry)
            return snapshot(s)
        })
    },
    async disable(cardId: string): Promise<CardProtectionState> {
        return delay().then(() => {
            stores.set(cardId, defaultStore())
            return snapshot(getStore(cardId))
        })
    },
    async changePassword(cardId: string, newPassword: string): Promise<CardProtectionState> {
        return delay().then(() => {
            const s = getStore(cardId)
            s.password = newPassword
            s.hasPassword = true
            return snapshot(s)
        })
    },
    async setSections(cardId: string, patch: Partial<Record<ProtectedSectionKey, boolean>>): Promise<CardProtectionState> {
        return delay().then(() => {
            const s = getStore(cardId)
            s.protectedSections = { ...s.protectedSections, ...patch }
            return snapshot(s)
        })
    },
    async verify(cardId: string, password: string): Promise<boolean> {
        return delay().then(() => {
            const s = getStore(cardId)
            if (!s.enabled) return true
            if (isExpired(s)) return false
            if (!s.hasPassword || !s.password) return true
            return s.password === password
        })
    },
    async isExpired(cardId: string): Promise<boolean> {
        return delay().then(() => isExpired(getStore(cardId)))
    },
}
