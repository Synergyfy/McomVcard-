import * as crypto from 'crypto'


// SHA-256 hex digest of the given value.
export function sha256Hex(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}


// Cryptographically random opaque token (48 bytes, base64url).
export function generateOpaqueToken(): string {
  return crypto.randomBytes(48).toString('base64url')
}


// Random 6-digit numeric string, zero-padded (for one-time codes).
export function generateSixDigitCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0')
}
