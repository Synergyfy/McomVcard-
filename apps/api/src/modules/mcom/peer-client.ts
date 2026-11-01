/**
 * Ecosystem Service Mesh — outbound peer client.
 *
 * Registered apps call each other DIRECTLY (peer-to-peer). MCOM Central is
 * only the control plane: it mints short-lived RS256 service tokens (5 min)
 * and publishes each peer's public keys at /.well-known/jwks.json. Requests to
 * a peer never transit Central's data path.
 *
 * Access is deny-by-default: this app must have the target's clientId in its
 * Allowed Audiences (Egress) in MCOM Console → Service Mesh Policy.
 */

interface CachedToken {
  token: string
  expiresAt: number // epoch ms
}

export interface PeerService {
  clientId: string
  name?: string
  platformSlug?: string
  baseUrl?: string | null
  appUrl?: string | null
  scopes?: string[]
  allowedCallers?: string[]
}

export interface PeerRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
  /** Service-token scope to request (default "service:read"). */
  scope?: string
  /** Per-request timeout in ms (default 10s). */
  timeoutMs?: number
}

const tokenCache = new Map<string, CachedToken>()

function mcomUrl(): string {
  return (process.env.MCOM_SOLUTIONS_URL || 'http://localhost:3010').replace(/\/+$/, '')
}

function clientId(): string {
  return process.env.MCOM_CLIENT_ID || ''
}

function clientSecret(): string {
  return process.env.MCOM_CLIENT_SECRET || ''
}

function basicAuth(): string {
  return Buffer.from(`${clientId()}:${clientSecret()}`).toString('base64')
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * Mint (or reuse a cached) short-lived RS256 service token for a target peer.
 */
export async function getServiceToken(audience: string, scope = 'service:read'): Promise<string> {
  const cacheKey = `${audience}:${scope}`
  const cached = tokenCache.get(cacheKey)

  // Reuse while the token is valid for at least another 60 seconds.
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token
  }

  const res = await fetch(`${mcomUrl()}/api/v1/auth/service-token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      audience,
      scope,
    }),
    signal: AbortSignal.timeout(5_000),
  })

  const data = (await parseBody(res)) as {
    access_token?: string
    expires_in?: number
    message?: string
  } | null

  if (!res.ok || !data?.access_token) {
    const detail = typeof data?.message === 'string' ? `: ${data.message}` : ''
    throw new Error(`Service token request failed for audience "${audience}" (${res.status})${detail}`)
  }

  const expiresAt = Date.now() + (data.expires_in || 300) * 1000
  tokenCache.set(cacheKey, { token: data.access_token, expiresAt })

  return data.access_token
}

/**
 * Call a peer application DIRECTLY with a service token.
 *
 * @param peerBaseUrl Base URL of the target peer (e.g. "https://api.mcomrewards.com")
 * @param targetAudience Client ID of the peer (e.g. "mcom-rewards")
 * @param path Request path (e.g. "/api/v1/points/balance")
 */
export async function callPeer<T = unknown>(
  peerBaseUrl: string,
  targetAudience: string,
  path: string,
  options: PeerRequestOptions = {},
): Promise<T> {
  const token = await getServiceToken(targetAudience, options.scope ?? 'service:read')

  const query = options.query
    ? `?${new URLSearchParams(
        Object.entries(options.query)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)]),
      ).toString()}`
    : ''

  const url = `${peerBaseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}${query}`
  const hasBody = options.body !== undefined

  const res = await fetch(url, {
    method: options.method ?? (hasBody ? 'POST' : 'GET'),
    headers: {
      Accept: 'application/json',
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
      Authorization: `Bearer ${token}`,
      'X-Origin-App': clientId(),
    },
    body: hasBody ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(options.timeoutMs ?? 10_000),
  })

  const data = await parseBody(res)

  if (!res.ok) {
    const detail =
      data && typeof data === 'object' && 'message' in data
        ? `: ${String((data as { message?: unknown }).message)}`
        : ''
    throw new Error(`Peer request to "${targetAudience}" failed (${res.status})${detail}`)
  }

  return data as T
}

/**
 * RFC 8693 token exchange: mint a peer token that acts on behalf of the
 * logged-in user. `payload.sub` stays the user id and `payload.act.sub`
 * identifies this app as the actor.
 */
export async function getDelegatedUserToken(
  userSsoAccessToken: string,
  targetAudience: string,
  scope = 'service:read',
): Promise<string> {
  const res = await fetch(`${mcomUrl()}/api/v1/auth/service-token/exchange`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      subject_token: userSsoAccessToken,
      audience: targetAudience,
      scope,
    }),
    signal: AbortSignal.timeout(5_000),
  })

  const data = (await parseBody(res)) as { access_token?: string; message?: string } | null

  if (!res.ok || !data?.access_token) {
    const detail = typeof data?.message === 'string' ? `: ${data.message}` : ''
    throw new Error(`Delegated token exchange failed for "${targetAudience}" (${res.status})${detail}`)
  }

  return data.access_token
}

/** The Central service registry (peers, their base URLs and mesh policy). */
export async function getEcosystemServices(): Promise<PeerService[]> {
  const res = await fetch(`${mcomUrl()}/api/v1/ecosystem/services`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(3_000),
  })

  if (!res.ok) {
    throw new Error(`Ecosystem registry request failed (${res.status})`)
  }

  const data = await parseBody(res)
  return Array.isArray(data) ? (data as PeerService[]) : []
}

/** Clear the in-memory token cache (useful after credential rotation). */
export function clearServiceTokenCache(): void {
  tokenCache.clear()
}
