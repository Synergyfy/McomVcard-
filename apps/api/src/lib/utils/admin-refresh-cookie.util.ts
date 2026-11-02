import { Response } from 'express'
import { CookieOptions } from 'express'

// Admin sessions use a cookie that is completely separate from the standard
// Central Hub Solution session. This prevents an end-user login from ever
// being mistaken for an admin session (and vice versa).
const ADMIN_REFRESH_COOKIE_NAME = 'admin_refresh_token'

export function buildAdminRefreshCookieOptions(maxAgeMs: number): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/api/admin',
    maxAge: maxAgeMs,
  }
}

export function setAdminRefreshTokenCookie(res: Response, refreshToken: string, maxAgeMs: number): void {
  res.cookie(ADMIN_REFRESH_COOKIE_NAME, refreshToken, buildAdminRefreshCookieOptions(maxAgeMs))
}

export function clearAdminRefreshTokenCookie(res: Response): void {
  res.clearCookie(ADMIN_REFRESH_COOKIE_NAME, { path: '/api/admin' })
}

export function getAdminRefreshTokenCookie(req: { cookies?: Record<string, unknown> }): string | null {
  const value = req.cookies?.[ADMIN_REFRESH_COOKIE_NAME]

  return typeof value === 'string' && value.length > 0 ? value : null
}

export const ADMIN_REFRESH_COOKIE = ADMIN_REFRESH_COOKIE_NAME
