import { mockConsumers } from './mockData'

export interface WishItem {
  id: number
  title: string
  price?: string
  emoji: string
  gradient: string
  image?: string
}

export type MemberKind = 'Family' | 'Friend'

export interface FamilyCardMember {
  id: number
  cardId: string
  name: string
  relationship: string
  kind: MemberKind
  status: 'Active' | 'Suspended'
  phone: string
  email: string
  dob?: string
  avatar: { emoji: string; gradient: string }
  createdAt: string
  lastUsed: string
  rewardBalance: number
  cardBalance: number
  eCardValue: number
  cardType: string
  membership: string
  issuedBy: string
  shareLink: string
  wishlist: WishItem[]
  recentActivity: { action: string; time: string }[]
}

export interface NewFamilyMemberInput {
  name: string
  relationship: string
  kind: MemberKind
  phone: string
  email?: string
  dob?: string
  avatar: { emoji: string; gradient: string }
}

/** Family relationships manage funds; friends receive gifts they control. */
export function kindFromRelationship(relationship: string): MemberKind {
  return relationship.trim().toLowerCase() === 'friend' ? 'Friend' : 'Family'
}

const delay = () => new Promise((r) => setTimeout(r, 250))

const gradients = [
  'from-pink-400 to-rose-600',
  'from-blue-400 to-indigo-600',
  'from-emerald-400 to-teal-600',
  'from-amber-400 to-orange-600',
  'from-purple-400 to-violet-600',
  'from-cyan-400 to-sky-600',
]

const wishGradients = [
  'from-rose-50 to-pink-100 dark:from-rose-500/10 dark:to-pink-500/10',
  'from-indigo-50 to-blue-100 dark:from-indigo-500/10 dark:to-blue-500/10',
  'from-amber-50 to-yellow-100 dark:from-amber-500/10 dark:to-yellow-500/10',
  'from-emerald-50 to-teal-100 dark:from-emerald-500/10 dark:to-teal-500/10',
]

function seedMembers(): FamilyCardMember[] {
  return [
    {
      id: 1,
      cardId: 'CARD-FAM-000001',
      name: 'Sarah Anderson',
      relationship: 'Wife',
      kind: 'Family',
      status: 'Active',
      phone: '+44 7700 900456',
      email: 'sarah.a@email.com',
      dob: '14 Mar 1988',
      avatar: { emoji: '👩', gradient: 'from-pink-400 to-rose-600' },
      createdAt: '10 Feb 2026',
      lastUsed: '2 days ago',
      rewardBalance: 45,
      cardBalance: 25,
      eCardValue: 5,
      cardType: 'Family Card',
      membership: 'Bronze Pro Family Card',
      issuedBy: mockConsumers[0].primaryIssuingBusiness || 'GreenLeaf Coffee',
      shareLink: 'https://mcomvcard.link/f/1',
      wishlist: [
        { id: 1, title: 'Nike Trainers', price: '£89', emoji: '👟', gradient: wishGradients[0] },
        { id: 2, title: 'Spa Day', price: '£120', emoji: '💆‍♀️', gradient: wishGradients[1] },
        { id: 3, title: 'Cookbook', price: '£25', emoji: '📚', gradient: wishGradients[2] },
      ],
      recentActivity: [
        { action: 'QR scanned at Bloom Beauty Salon', time: '2 days ago' },
        { action: 'Redeemed "Free Haircut" reward', time: '1 week ago' },
        { action: 'Card shared with Sarah', time: '10 Feb 2026' },
      ],
    },
    {
      id: 2,
      cardId: 'CARD-FAM-000002',
      name: 'David Anderson',
      relationship: 'Son',
      kind: 'Family',
      status: 'Active',
      phone: '+44 7700 900789',
      email: 'david.a@email.com',
      dob: '02 Sep 2012',
      avatar: { emoji: '👦', gradient: 'from-blue-400 to-indigo-600' },
      createdAt: '10 Feb 2026',
      lastUsed: '1 hour ago',
      rewardBalance: 120,
      cardBalance: 10,
      eCardValue: 2,
      cardType: 'Family Card',
      membership: 'Bronze Pro Family Card',
      issuedBy: mockConsumers[0].primaryIssuingBusiness || 'GreenLeaf Coffee',
      shareLink: 'https://mcomvcard.link/f/2',
      wishlist: [
        { id: 4, title: 'Laptop', price: '£549', emoji: '💻', gradient: wishGradients[1] },
        { id: 5, title: 'School Books', price: '£35', emoji: '📖', gradient: wishGradients[2] },
        { id: 6, title: 'Birthday Gift', price: '£50', emoji: '🎁', gradient: wishGradients[3] },
      ],
      recentActivity: [
        { action: 'QR scanned at The Bakery Corner', time: '1 hour ago' },
        { action: 'Earned 20 points from school lunch', time: '3 hours ago' },
        { action: 'Card shared with David', time: '10 Feb 2026' },
      ],
    },
  ]
}

let members: FamilyCardMember[] = seedMembers()
let nextId = 100
let nextWishId = 1000

export const familyService = {
  async getMembers(): Promise<FamilyCardMember[]> {
    return delay().then(() => members.map((m) => ({ ...m, wishlist: [...m.wishlist] })))
  },
  async getMember(id: number): Promise<FamilyCardMember | undefined> {
    return delay().then(() => {
      const m = members.find((x) => x.id === id)
      return m ? { ...m, wishlist: [...m.wishlist] } : undefined
    })
  },
  async addMember(input: NewFamilyMemberInput): Promise<FamilyCardMember> {
    return delay().then(() => {
      const id = nextId++
      const member: FamilyCardMember = {
        id,
        cardId: `CARD-FAM-${String(id).padStart(6, '0')}`,
        name: input.name,
        relationship: input.relationship,
        kind: input.kind,
        status: 'Active',
        phone: input.phone,
        email: input.email || '',
        dob: input.dob,
        avatar: input.avatar,
        createdAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        lastUsed: 'Just created',
        rewardBalance: 0,
        cardBalance: 0,
        eCardValue: 0,
        cardType: input.kind === 'Friend' ? 'Friend Card' : 'Family Card',
        membership: 'Bronze Pro Family Card',
        issuedBy: mockConsumers[0].primaryIssuingBusiness || 'GreenLeaf Coffee',
        shareLink: `https://mcomvcard.link/f/${id}`,
        wishlist: [],
        recentActivity: [
          { action: 'Card created', time: 'Just now' },
        ],
      }
      members = [...members, member]
      return { ...member, wishlist: [...member.wishlist] }
    })
  },
  async updateMember(id: number, patch: Partial<Pick<FamilyCardMember, 'name' | 'relationship' | 'phone' | 'email' | 'dob' | 'avatar'>>): Promise<FamilyCardMember | undefined> {
    return delay().then(() => {
      const idx = members.findIndex((m) => m.id === id)
      if (idx === -1) return undefined
      members = members.map((m, i) => (i === idx ? { ...m, ...patch } : m))
      const updated = members[idx]
      return { ...updated, wishlist: [...updated.wishlist] }
    })
  },
  async removeMember(id: number): Promise<boolean> {
    return delay().then(() => {
      const before = members.length
      members = members.filter((m) => m.id !== id)
      return members.length !== before
    })
  },
  async fundMember(id: number, amount: number): Promise<{ member: FamilyCardMember; ownerBalance: number } | undefined> {
    return delay().then(() => {
      const idx = members.findIndex((m) => m.id === id)
      if (idx === -1) return undefined
      const owner = mockConsumers[0]
      const ownerBalance = owner.cardBalance ?? 0
      if (ownerBalance < amount) throw new Error('Insufficient card balance')
      owner.cardBalance = Math.round((ownerBalance - amount) * 100) / 100
      members = members.map((m, i) =>
        i === idx
          ? {
              ...m,
              cardBalance: Math.round((m.cardBalance + amount) * 100) / 100,
              recentActivity: [
                { action: `Received £${amount.toFixed(2)} from ${owner.name}`, time: 'Just now' },
                ...m.recentActivity,
              ],
            }
          : m
      )
      const updated = members[idx]
      return { member: { ...updated, wishlist: [...updated.wishlist] }, ownerBalance: owner.cardBalance }
    })
  },
  /** Send a gift/e-card to a friend — the friend keeps control of their own wallet. */
  async sendGiftCard(id: number, amount: number, provider?: string): Promise<{ member: FamilyCardMember; ownerBalance: number } | undefined> {
    return delay().then(() => {
      const idx = members.findIndex((m) => m.id === id)
      if (idx === -1) return undefined
      const owner = mockConsumers[0]
      const ownerBalance = owner.cardBalance ?? 0
      if (ownerBalance < amount) throw new Error('Insufficient card balance')
      owner.cardBalance = Math.round((ownerBalance - amount) * 100) / 100
      const via = provider ? ` via ${provider}` : ''
      members = members.map((m, i) =>
        i === idx
          ? {
              ...m,
              eCardValue: Math.round((m.eCardValue + amount) * 100) / 100,
              recentActivity: [
                { action: `Received £${amount.toFixed(2)} gift e-card from ${owner.name}${via}`, time: 'Just now' },
                ...m.recentActivity,
              ],
            }
          : m
      )
      const updated = members[idx]
      return { member: { ...updated, wishlist: [...updated.wishlist] }, ownerBalance: owner.cardBalance }
    })
  },
  async setStatus(id: number, status: 'Active' | 'Suspended'): Promise<FamilyCardMember | undefined> {    return delay().then(() => {
      const idx = members.findIndex((m) => m.id === id)
      if (idx === -1) return undefined
      members = members.map((m, i) => (i === idx ? { ...m, status } : m))
      const updated = members[idx]
      return { ...updated, wishlist: [...updated.wishlist] }
    })
  },
  async addWish(memberId: number, title: string, price?: string, image?: string): Promise<FamilyCardMember | undefined> {
    return delay().then(() => {
      const idx = members.findIndex((m) => m.id === memberId)
      if (idx === -1) return undefined
      const item: WishItem = {
        id: nextWishId++,
        title,
        price: price || undefined,
        emoji: '🎁',
        gradient: wishGradients[members[idx].wishlist.length % wishGradients.length],
        image: image || undefined,
      }
      members = members.map((m, i) => (i === idx ? { ...m, wishlist: [...m.wishlist, item] } : m))
      const updated = members[idx]
      return { ...updated, wishlist: [...updated.wishlist] }
    })
  },
  async updateWish(memberId: number, wishId: number, patch: Partial<Pick<WishItem, 'title' | 'price' | 'image'>>): Promise<FamilyCardMember | undefined> {
    return delay().then(() => {
      const idx = members.findIndex((m) => m.id === memberId)
      if (idx === -1) return undefined
      members = members.map((m, i) =>
        i === idx ? { ...m, wishlist: m.wishlist.map((w) => (w.id === wishId ? { ...w, ...patch } : w)) } : m
      )
      const updated = members[idx]
      return { ...updated, wishlist: [...updated.wishlist] }
    })
  },
  async removeWish(memberId: number, wishId: number): Promise<FamilyCardMember | undefined> {
    return delay().then(() => {
      const idx = members.findIndex((m) => m.id === memberId)
      if (idx === -1) return undefined
      members = members.map((m, i) => (i === idx ? { ...m, wishlist: m.wishlist.filter((w) => w.id !== wishId) } : m))
      const updated = members[idx]
      return { ...updated, wishlist: [...updated.wishlist] }
    })
  },
  getAvatarGradients(): string[] {
    return gradients
  },
}
