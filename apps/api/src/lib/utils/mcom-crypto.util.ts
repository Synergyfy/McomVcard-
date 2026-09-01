import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

// AES-256-GCM envelope for storing the MCOM Central access/refresh tokens at
// rest. The key comes from MCOM_TOKEN_ENCRYPTION_KEY (fallback: JWT_SECRET).
// Token strings never touch logs or client bundles.

const ALGO = 'aes-256-gcm'
const IV_LENGTH = 12

function normalizeKey(secret: string | undefined): Buffer {
  const raw = secret || process.env.JWT_SECRET || 'mcom-default-dev-key'
  // Derive a fixed 32-byte key from whatever secret is provided.
  return createHash('sha256').update(raw).digest()
}

export function encryptMcomToken(value: string, secret?: string): string {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGO, normalizeKey(secret), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`
}

export function decryptMcomToken(payload: string, secret?: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(':')
  if (!ivB64 || !tagB64 || !dataB64) throw new Error('Invalid encrypted token payload')

  const decipher = createDecipheriv(ALGO, normalizeKey(secret), Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))

  return Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]).toString('utf8')
}