/* ------------------------------------------------------------------ */
/*  Consumer setup store — tracks first-time consumer setup progress.  */
/*  Determines whether a consumer is new (needs setup) or existing,    */
/*  and records the steps completed (profile, business, card,          */
/*  membership, entitlements). Persisted in localStorage.              */
/* ------------------------------------------------------------------ */

export interface ConsumerSetupProfile {
  name: string
  phone: string
  location: string
  business: string
  cardId: string
}

export interface ConsumerSetupState {
  status: 'idle' | 'in-progress' | 'completed'
  profile: ConsumerSetupProfile | null
  steps: {
    profile: boolean
    business: boolean
    card: boolean
    membership: boolean
    entitlements: boolean
  }
  completedAt: string | null
}

const KEY = 'mcom.consumer.setup'

const initialSteps = { profile: false, business: false, card: false, membership: false, entitlements: false }

export function emptySetupState(): ConsumerSetupState {
  return { status: 'idle', profile: null, steps: { ...initialSteps }, completedAt: null }
}

export function saveConsumerSetup(state: ConsumerSetupState): ConsumerSetupState {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota errors */
  }
  return state
}

export function loadConsumerSetup(): ConsumerSetupState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptySetupState()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return emptySetupState()
    return { ...emptySetupState(), ...parsed, steps: { ...initialSteps, ...(parsed.steps || {}) } } as ConsumerSetupState
  } catch {
    return emptySetupState()
  }
}

export function clearConsumerSetup() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
