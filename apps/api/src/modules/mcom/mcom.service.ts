import { Injectable, BadRequestException, UnauthorizedException, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHmac } from 'crypto'

/** Normalized MCOM Central user profile (from /auth/sso/userinfo). */
export interface McomUserInfo {
  sub: string
  email: string
  role?: string
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  businessId?: string | null
  membershipLevel?: string
  membershipTier?: string
  membershipStatus?: string
  phone?: string | null
  packages?: { platform?: string; packageName?: string; status?: string; limits?: unknown }[]
  permissions?: Record<string, boolean>
}

/** A purchased platform package as reported by Central's data-sharing API. */
export interface McomUserPackage {
  packageId: string
  platformName: string
  packageName: string | null
  status: string
  externalPlanId: string | null
}

interface McomTokenResponse {
  accessToken: string
  refreshToken?: string
  expiresIn: number
  tokenType: string
}

interface RequestOptions {
  method: 'GET' | 'POST'
  body?: Record<string, unknown>
  headers?: Record<string, string>
}

@Injectable()
export class McomService {
  private readonly baseUrl: string
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly hmacSecret: string
  private readonly platformSlug: string
  private readonly redirectUri: string
  private readonly scopes: string

  constructor(private config: ConfigService) {
    this.baseUrl = (this.config.get<string>('MCOM_SOLUTIONS_URL') || 'http://localhost:3010').replace(/\/+$/, '')
    this.clientId = this.config.get<string>('MCOM_CLIENT_ID') || ''
    this.clientSecret = this.config.get<string>('MCOM_CLIENT_SECRET') || ''
    this.hmacSecret = this.config.get<string>('MCOM_HMAC_SECRET') || ''
    this.platformSlug = this.config.get<string>('MCOM_PLATFORM_SLUG') || 'vcard'
    this.redirectUri = this.config.get<string>('MCOM_REDIRECT_URI') || 'http://localhost:8000/auth/callback'
    this.scopes = this.config.get<string>('MCOM_SCOPES') || 'profile email business membership packages'
  }

  /** Build the OAuth 2.0 authorization URL the browser is redirected to. */
  getAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes,
      state,
    })

    return `${this.baseUrl}/api/v1/auth/sso/authorize?${params.toString()}`
  }

  /**
   * Exchange the temporary OAuth code for Central tokens, then fetch the full
   * profile (incl. dynamic permissions) with the freshly issued access token.
   */
  async exchangeCode(code: string): Promise<{ accessToken: string; refreshToken: string; user: McomUserInfo }> {
    const basic = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')

    const tokens = (await this.request('/api/v1/auth/sso/token', {
      method: 'POST',
      // Client credentials go in the Basic auth header — the Central DTO only
      // whitelists { code, client_id, redirect_uri } and forbids extra fields.
      body: { code, client_id: this.clientId, redirect_uri: this.redirectUri },
      headers: { Authorization: `Basic ${basic}` },
    })) as McomTokenResponse

    if (!tokens?.accessToken) {
      throw new UnauthorizedException('MCOM Central did not issue an access token')
    }

    const user = await this.getUserInfo(tokens.accessToken)

    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken || '', user }
  }

  /** Fetch the full Central profile + dynamic permissions with a Bearer token. */
  getUserInfo(accessToken: string): Promise<McomUserInfo> {
    return this.request('/api/v1/auth/sso/userinfo', {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    }) as Promise<McomUserInfo>
  }

  /** Refresh an expired Central access token. Central does not rotate refresh tokens. */
  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    const res = (await this.request('/api/v1/auth/sso/token/refresh', {
      method: 'POST',
      body: { refresh_token: refreshToken },
    })) as McomTokenResponse

    if (!res?.accessToken) {
      throw new UnauthorizedException('MCOM Central refresh failed')
    }

    return { accessToken: res.accessToken, expiresIn: res.expiresIn }
  }

  /** The dynamic permission key Central uses for this platform (e.g. canAccess_vcard). */
  get platformPermissionKey(): string {
    return `canAccess_${this.platformSlug.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
  }

  /**
   * Fetch freshly calculated permissions via the HMAC-signed data-sharing API
   * (server-to-server, Task 6 scheme). GET requests sign the empty body.
   */
  async fetchPermissions(mcomUserId: string): Promise<Record<string, boolean>> {
    const res = (await this.request(`/api/v1/data/user/${encodeURIComponent(mcomUserId)}/permissions`, {
      method: 'GET',
    })) as { data?: Record<string, boolean> }

    return (res?.data ?? res) as Record<string, boolean>
  }

  // ── entitlement (what plans the user owns) ─────────────────────────────────

  /**
   * The platform packages a user purchased on MCOM Central. `externalPlanId`
   * is the plan UUID that Central mirrors from Vcard's `/api/v1/system/plans`,
   * so it resolves back to a local Plan for quota/feature enforcement.
   */
  async getUserPackages(mcomUserId: string): Promise<McomUserPackage[]> {
    const res = (await this.request(`/api/v1/data/user/${encodeURIComponent(mcomUserId)}/packages`, {
      method: 'GET',
    })) as { data?: McomUserPackage[] }

    return Array.isArray(res?.data) ? res.data : []
  }

  /** The user's active Vcard package, if any. */
  async getActiveVcardPackage(mcomUserId: string): Promise<McomUserPackage | null> {
    const packages = await this.getUserPackages(mcomUserId)
    const slug = this.platformSlug.toLowerCase()
    const match = packages.find(
      (pkg) =>
        String(pkg.status || '').toLowerCase() === 'active' &&
        (String(pkg.platformName || '').toLowerCase() === slug ||
          String(pkg.platformName || '').toLowerCase().includes('vcard')),
    )
    return match ?? null
  }

  // ── signed transport ────────────────────────────────────────────────────────

  private async request(path: string, opts: RequestOptions): Promise<unknown> {
    const url = `${this.baseUrl}${path}`
    const rawBody = opts.body !== undefined ? JSON.stringify(opts.body) : ''
    const signature = createHmac('sha256', this.hmacSecret).update(rawBody).digest('hex')

    let res: Response
    try {
      res = await fetch(url, {
        method: opts.method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Mcom-Client-ID': this.clientId,
          'X-Mcom-Signature': `sha256=${signature}`,
          ...(opts.headers || {}),
        },
        body: opts.method === 'POST' ? rawBody : undefined,
      })
    } catch (err) {
      throw new ServiceUnavailableException(
        `MCOM Central unreachable at ${this.baseUrl}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '')

      if (res.status === 401 || res.status === 403) {
        throw new UnauthorizedException(`MCOM Central rejected the request (${res.status})`)
      }
      if (res.status === 400) {
        throw new BadRequestException(`MCOM Central bad request: ${text.slice(0, 300)}`)
      }

      throw new ServiceUnavailableException(`MCOM Central error (${res.status}): ${text.slice(0, 300)}`)
    }

    const text = await res.text()
    if (!text) return {}

    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }
}