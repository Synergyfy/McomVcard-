import { Response } from 'express'
import { CookieOptions } from 'express'

const OAUTH_STATE_COOKIE = 'mcom_oauth_state'
const OAUTH_RETURN_COOKIE = 'mcom_oauth_return'

// Short-lived HttpOnly cookie that carries the CSRF `state` generated for the
// OAuth authorize request. Read back + cleared when MCOM redirects to callback.
const STATE_TTL_MS = 10 * 60 * 1000

function buildStateCookieOptions(maxAgeMs: number): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api',
    maxAge: maxAgeMs,
  }
}

export function setOauthStateCookie(res: Response, state: string): void {
  res.cookie(OAUTH_STATE_COOKIE, state, buildStateCookieOptions(STATE_TTL_MS))
}

export function clearOauthStateCookie(res: Response): void {
  res.clearCookie(OAUTH_STATE_COOKIE, { path: '/api' })
}

export function getOauthStateCookie(req: { cookies?: Record<string, unknown> }): string | null {
  const value = req.cookies?.[OAUTH_STATE_COOKIE]

  return typeof value === 'string' && value.length > 0 ? value : null
}

export const OAUTH_STATE_COOKIE_NAME = OAUTH_STATE_COOKIE

// ── Post-login return context (card/business invite params) ──────────────────
// Carried so the SPA callback can restore the consumer card-association flow
// that the local login path already supports.

export function setOauthReturnCookie(res: Response, value: string): void {
  res.cookie(OAUTH_RETURN_COOKIE, value, buildStateCookieOptions(STATE_TTL_MS))
}

export function clearOauthReturnCookie(res: Response): void {
  res.clearCookie(OAUTH_RETURN_COOKIE, { path: '/api' })
}

export function getOauthReturnCookie(req: { cookies?: Record<string, unknown> }): string | null {
  const value = req.cookies?.[OAUTH_RETURN_COOKIE]

  return typeof value === 'string' && value.length > 0 ? value : null
}

export const OAUTH_RETURN_COOKIE_NAME = OAUTH_RETURN_COOKIE