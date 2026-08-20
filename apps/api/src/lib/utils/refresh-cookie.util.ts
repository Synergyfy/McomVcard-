import { Response } from 'express'
import { CookieOptions } from 'express'

const REFRESH_COOKIE_NAME = 'refresh_token'

// HttpOnly + Secure (HTTPS-only) refresh-token cookie.
// SameSite=Lax keeps it off cross-site requests; Path=/api limits it to API routes.
export function buildRefreshCookieOptions(maxAgeMs: number): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api',
    maxAge: maxAgeMs,
  }
}

export function setRefreshTokenCookie(res: Response, refreshToken: string, maxAgeMs: number): void {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, buildRefreshCookieOptions(maxAgeMs))
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api' })
}

export function getRefreshTokenCookie(req: { cookies?: Record<string, unknown> }): string | null {
  const value = req.cookies?.[REFRESH_COOKIE_NAME]

  return typeof value === 'string' && value.length > 0 ? value : null
}

export const REFRESH_COOKIE = REFRESH_COOKIE_NAME