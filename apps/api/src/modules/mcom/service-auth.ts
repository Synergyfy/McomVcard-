import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { createPublicKey, type JsonWebKey } from 'crypto'
import jwt, { JwtPayload } from 'jsonwebtoken'

/**
 * Ecosystem Service Mesh — inbound authentication.
 *
 * Peer apps call this app DIRECTLY with a short-lived RS256 service token
 * minted by MCOM Central. The signature is verified OFFLINE against Central's
 * cached JWKS; a call to Central is never made on the request path.
 *
 * Ingress is deny-by-default: the caller's clientId must appear in this app's
 * `allowedCallers` (Central registry) or in MCOM_ALLOWED_CALLERS.
 */

interface Jwk {
  kty: string
  kid?: string
  n?: string
  e?: string
  alg?: string
  use?: string
}

interface JwkSet {
  keys?: Jwk[]
}

export interface ServiceCaller {
  callerAppId: string
  isDelegated: boolean
  userId?: string
  scopes: string[]
  payload: JwtPayload
}

export interface AuthenticatedServiceRequest extends Request {
  serviceCaller?: ServiceCaller
}

export class ServiceAuthError extends Error {
  constructor(
    message: string,
    readonly status: number = 401,
  ) {
    super(message)
    this.name = 'ServiceAuthError'
  }
}

const logger = new Logger('ServiceMeshAuth')
const JWKS_TTL_MS = 5 * 60 * 1000

let jwksCache: { keys: Jwk[]; expiresAt: number } | null = null
let allowedCallersCache: { callers: string[]; expiresAt: number } | null = null

function mcomUrl(): string {
  return (process.env.MCOM_SOLUTIONS_URL || 'http://localhost:3010').replace(/\/+$/, '')
}

async function fetchJwks(force = false): Promise<Jwk[]> {
  if (!force && jwksCache && jwksCache.expiresAt > Date.now()) {
    return jwksCache.keys
  }

  const res = await fetch(`${mcomUrl()}/.well-known/jwks.json`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(3_000),
  })

  if (!res.ok) {
    throw new ServiceAuthError('Unable to load Central signing keys', 401)
  }

  const body = (await res.json()) as JwkSet
  const keys = Array.isArray(body?.keys) ? body.keys : []
  jwksCache = { keys, expiresAt: Date.now() + JWKS_TTL_MS }

  return keys
}

/** Load the app's ingress allowlist from env or Central's service registry. */
export async function getAllowedCallers(): Promise<string[]> {
  const configured = process.env.MCOM_ALLOWED_CALLERS?.trim()
  if (configured) {
    return configured.split(',').map((value) => value.trim()).filter(Boolean)
  }

  if (allowedCallersCache && allowedCallersCache.expiresAt > Date.now()) {
    return allowedCallersCache.callers
  }

  try {
    const res = await fetch(`${mcomUrl()}/api/v1/ecosystem/services`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3_000),
    })
    const services = res.ok ? ((await res.json()) as Array<{ clientId?: string; allowedCallers?: string[] }>) : []
    const me = services.find((service) => service.clientId === process.env.MCOM_CLIENT_ID)
    const callers = Array.isArray(me?.allowedCallers) ? me!.allowedCallers! : []

    allowedCallersCache = { callers, expiresAt: Date.now() + 60_000 }
    return callers
  } catch (err) {
    logger.warn(`Could not refresh allowed callers from Central: ${err instanceof Error ? err.message : String(err)}`)
    return allowedCallersCache?.callers ?? []
  }
}

/** Verify an inbound service token and enforce the ingress policy. */
export async function authenticateServiceRequest(
  authorizationHeader?: string | string[],
): Promise<ServiceCaller> {
  const header = Array.isArray(authorizationHeader) ? authorizationHeader[0] : authorizationHeader
  const token = header?.replace(/^Bearer\s+/i, '')?.trim()

  if (!token) {
    throw new ServiceAuthError('Unauthorized: missing Bearer service token', 401)
  }

  const decoded = jwt.decode(token, { complete: true }) as { header?: { kid?: string } } | null
  if (!decoded?.header) {
    throw new ServiceAuthError('Unauthorized: malformed service token', 401)
  }

  const kid = decoded.header?.kid
  const selectKey = (keys: Jwk[]): Jwk | undefined =>
    kid ? keys.find((key) => key.kid === kid) : keys[0]

  let keys = await fetchJwks()
  let jwk = selectKey(keys)

  // Key rotation: refresh once when the signing key id is unknown.
  if (!jwk) {
    keys = await fetchJwks(true)
    jwk = selectKey(keys)
  }

  if (!jwk) {
    throw new ServiceAuthError('Unauthorized: signing key not found', 401)
  }

  let payload: JwtPayload
  try {
    const publicKey = createPublicKey({ key: jwk as unknown as JsonWebKey, format: 'jwk' })
    payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: 'mcom-solutions',
      audience: process.env.MCOM_CLIENT_ID,
    }) as JwtPayload
  } catch (err) {
    logger.warn(`Service token verification failed: ${err instanceof Error ? err.message : String(err)}`)
    throw new ServiceAuthError('Unauthorized: invalid or expired service token', 401)
  }

  const act = payload.act as { sub?: string } | undefined
  const isDelegated = payload.typ === 'delegated' || Boolean(act?.sub)
  const callerAppId = act?.sub || (payload.sub as string | undefined)

  if (!callerAppId) {
    throw new ServiceAuthError('Unauthorized: service token has no caller identity', 401)
  }

  const allowed = await getAllowedCallers()
  if (!allowed.includes('*') && !allowed.includes(callerAppId)) {
    logger.warn(`Ingress blocked: caller "${callerAppId}" is not in allowedCallers for ${process.env.MCOM_CLIENT_ID}`)
    throw new ServiceAuthError(`Forbidden: caller "${callerAppId}" is not permitted to call this service`, 403)
  }

  const scopes: string[] =
    typeof payload.scope === 'string'
      ? payload.scope.split(' ').filter(Boolean)
      : Array.isArray((payload as { scp?: unknown }).scp)
        ? ((payload as { scp: string[] }).scp ?? [])
        : []

  return {
    callerAppId,
    isDelegated,
    userId: isDelegated ? (payload.sub as string | undefined) : undefined,
    scopes,
    payload,
  }
}

/**
 * Express middleware for plain Express routes that peer apps call.
 * Attaches `req.serviceCaller` on success.
 */
export async function requireServiceAuth(
  req: AuthenticatedServiceRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    req.serviceCaller = await authenticateServiceRequest(req.headers.authorization)
    next()
  } catch (err) {
    const status = err instanceof ServiceAuthError ? err.status : 401
    res.status(status).json({
      error: err instanceof Error ? err.message : 'Unauthorized',
    })
  }
}

/** Nest guard wrapper around the same verification logic. */
@Injectable()
export class ServiceAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedServiceRequest>()

    try {
      req.serviceCaller = await authenticateServiceRequest(req.headers.authorization)
      return true
    } catch (err) {
      const status = err instanceof ServiceAuthError ? err.status : 401
      throw new HttpException(
        {
          message: err instanceof Error ? err.message : 'Unauthorized',
          error: status === 403 ? 'SERVICE_INGRESS_FORBIDDEN' : 'SERVICE_AUTH_FAILED',
        },
        status,
      )
    }
  }
}
