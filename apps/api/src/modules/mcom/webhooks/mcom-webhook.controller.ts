import { BadRequestException, Controller, Headers, HttpCode, Post, Req, UnauthorizedException } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { SkipThrottle } from '@nestjs/throttler'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import { ApiResponse } from '../../../lib/utils/api-response'
import { verifyWebhookSignature } from '../../../lib/utils/mcom-webhook-signature.util'
import { MCOM_WEBHOOK_EVENTS, McomWebhookDto } from '../dto/mcom-webhook.dto'
import { McomWebhookService } from './mcom-webhook.service'

interface WebhookRequest extends Request {
  rawBody?: Buffer
}

/**
 * Inbound lifecycle webhooks from MCOM Solutions (spec §6.2).
 *
 * Every delivery is HMAC-signed with the per-app webhook secret in the
 * `X-Mcom-Webhook-Signature: sha256=<hex>` header. Verification uses the RAW
 * body bytes (enabled via `rawBody: true` in main.ts) — never the parsed JSON,
 * whose key order / whitespace can differ from what MCOM Solutions signed.
 *
 * The body is parsed manually from `req.rawBody` (rather than via `@Body()`)
 * to deliberately bypass the global `forbidNonWhitelisted` ValidationPipe:
 * MCOM may add fields as the ecosystem evolves, and a signed delivery must
 * never be rejected for carrying an unknown key (which would trigger a 24h
 * retry storm). `McomWebhookDto` is still used for Swagger documentation.
 *
 * Returns 200 even when the event is a duplicate or targets another platform;
 * non-2xx (401 bad signature, 400 malformed) prompt MCOM to retry.
 */
@ApiTags('MCOM Solutions - Webhook')
@SkipThrottle()
@Controller('v1/mcom/webhook')
export class McomWebhookController {
  constructor(
    private readonly config: ConfigService,
    private readonly webhookService: McomWebhookService,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive a lifecycle webhook from MCOM Solutions', description: 'Verifies the HMAC signature and applies the entitlement event idempotently.' })
  @ApiBody({ type: McomWebhookDto })
  async receive(
    @Req() req: WebhookRequest,
    @Headers('x-mcom-webhook-signature') signatureHeader: string | undefined,
  ) {
    const secret = this.config.get<string>('MCOM_WEBHOOK_SECRET') || ''
    if (!secret) {
      throw new UnauthorizedException('MCOM_WEBHOOK_SECRET is not configured on this server')
    }

    const rawBody = req.rawBody
    if (!rawBody || rawBody.length === 0) {
      throw new BadRequestException('Missing raw request body')
    }

    if (!verifyWebhookSignature(rawBody, signatureHeader, secret)) {
      throw new UnauthorizedException('Invalid or missing MCOM webhook signature')
    }

    const dto = this.parseBody(rawBody)

    const result = await this.webhookService.process(rawBody, dto)

    return ApiResponse.success(result, 'Webhook received', 200)
  }

  /** Minimal manual validation (unknown fields are tolerated). */
  private parseBody(rawBody: Buffer): McomWebhookDto {
    let parsed: unknown
    try {
      parsed = JSON.parse(rawBody.toString('utf8'))
    } catch {
      throw new BadRequestException('Webhook body is not valid JSON')
    }

    const body = (parsed ?? {}) as Record<string, unknown>
    const event = typeof body.event === 'string' ? body.event : ''
    const isEntitlementEvent =
      event.startsWith('entitlement.') || event.startsWith('membership.')

    if (!event || (!MCOM_WEBHOOK_EVENTS.includes(event as never) && !isEntitlementEvent)) {
      throw new BadRequestException(`Unknown webhook event: ${String(body.event)}`)
    }
    if (typeof body.platform !== 'string' || !body.platform) {
      throw new BadRequestException('Webhook body is missing a platform')
    }
    if (typeof body.data !== 'object' || body.data === null) {
      throw new BadRequestException('Webhook body is missing a data object')
    }

    const data = body.data as Record<string, unknown>
    const isPaymentEvent = event === 'payment.succeeded' || event === 'payment.refunded'

    if (isPaymentEvent) {
      if (typeof data.chargeId !== 'string' || !data.chargeId) {
        throw new BadRequestException('Payment webhook data must include chargeId')
      }
    } else if (isEntitlementEvent) {
      if (typeof data.mcomUserId !== 'string' && typeof data.userId !== 'string') {
        throw new BadRequestException('Entitlement webhook data must include mcomUserId')
      }
    } else {
      if (typeof data.packageId !== 'string' || typeof data.mcomUserId !== 'string') {
        throw new BadRequestException('Webhook data must include packageId and mcomUserId')
      }
    }

    const stringField = (key: string): string | undefined =>
      typeof data[key] === 'string' ? (data[key] as string) : undefined

    return {
      event: event as McomWebhookDto['event'],
      platform: body.platform,
      timestamp: typeof body.timestamp === 'string' ? body.timestamp : undefined,
      data: {
        packageId: stringField('packageId'),
        mcomUserId: stringField('mcomUserId'),
        userId: stringField('userId'),
        chargeId: stringField('chargeId'),
        reference: stringField('reference'),
        externalCustomerId: stringField('externalCustomerId'),
        amountMinor: stringField('amountMinor'),
        netMinor: stringField('netMinor'),
        feeMinor: stringField('feeMinor'),
        chargeAmountMinor: stringField('chargeAmountMinor'),
        totalRefundedMinor: stringField('totalRefundedMinor'),
        method: stringField('method'),
        provider: stringField('provider'),
        providerRef: stringField('providerRef'),
        status: stringField('status'),
        paidAt: stringField('paidAt'),
        externalPlanId: stringField('externalPlanId'),
        packageName: stringField('packageName'),
        planType: stringField('planType'),
        billingCycle: stringField('billingCycle'),
        amount: typeof data.amount === 'number' ? data.amount : undefined,
        currency: stringField('currency'),
        expiresAt: stringField('expiresAt'),
        limits: typeof data.limits === 'object' && data.limits !== null ? (data.limits as Record<string, unknown>) : undefined,
      },
    }
  }
}