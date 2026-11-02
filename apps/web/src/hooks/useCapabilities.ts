import { useEffect, useState } from 'react'
import {
  capabilitiesService,
  type ResolvedCapabilities,
} from '../services/capabilities'

interface UseCapabilitiesResult {
  capabilities: ResolvedCapabilities | null
  loading: boolean
  error: string | null
  /** True when the variant enables the capability (unknown keys are allowed). */
  can: (key: string) => boolean
  /** Finite limit for the capability, or null for unlimited/unconfigured. */
  limit: (key: string) => number | null
  /** Remaining uses for a finite quota (null when unlimited/unconfigured). */
  remaining: (key: string, used: number) => number | null
}

/**
 * Load the current plan variant capabilities from the API.
 *
 * The API's CapabilityGuard is authoritative; this hook is for presenting the
 * correct UI (disabled switches, "x of y used", upgrade prompts, etc.).
 */
export function useCapabilities(): UseCapabilitiesResult {
  const [capabilities, setCapabilities] = useState<ResolvedCapabilities | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    capabilitiesService
      .get()
      .then((resolved) => { if (!cancelled) setCapabilities(resolved) })
      .catch(() => { if (!cancelled) setError('Could not load plan capabilities') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const can = (key: string): boolean => {
    const capability = capabilities?.capabilities[key]
    return capability ? capability.enabled : true
  }

  const limit = (key: string): number | null => capabilities?.capabilities[key]?.limit ?? null

  const remaining = (key: string, used: number): number | null => {
    const max = limit(key)
    return max === null ? null : Math.max(0, max - used)
  }

  return { capabilities, loading, error, can, limit, remaining }
}
