import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Verify an MCOM Solutions lifecycle webhook signature.
 *
 * MCOM Solutions sends the header `X-Mcom-Webhook-Signature: sha256=<hex>`.
 * The value is the hex HMAC-SHA256 of the RAW request body, keyed with the
 * per-app inbound webhook secret (`MCOM_WEBHOOK_SECRET`). The signature must
 * be verified against the exact bytes MCOM Solutions dispatched — i.e. before
 * any JSON parsing/whitespace normalization — so callers must pass the raw
 * body buffer (see NestFactory rawBody: true).
 */
export function verifyWebhookSignature(
  rawBody: Buffer | string,
  signatureHeader: string | undefined,
  webhookSecret: string,
): boolean {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false
  const expectedHash = signatureHeader.slice('sha256='.length).trim().toLowerCase()
  if (!/^[a-f0-9]{64}$/.test(expectedHash)) return false

  const actualHash = createHmac('sha256', webhookSecret).update(rawBody).digest('hex')

  const a = Buffer.from(expectedHash, 'utf8')
  const b = Buffer.from(actualHash, 'utf8')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}