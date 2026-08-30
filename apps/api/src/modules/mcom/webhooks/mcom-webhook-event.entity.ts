import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm'

/**
 * Idempotency ledger for MCOM Solutions lifecycle webhooks. MCOM retries
 * failed deliveries (HTTP >= 500 / timeout) with exponential backoff for up to
 * 24 hours, so a handler can see the same event more than once. `eventHash` is
 * the hex SHA-256 of the raw body; a unique PK means duplicate deliveries are
 * detected and skipped.
 */
@Entity({ name: 'mcom_webhook_events' })
export class McomWebhookEvent {
  @PrimaryColumn({ name: 'event_hash', type: 'varchar', length: 64 })
  eventHash!: string

  @Column({ type: 'varchar' })
  event!: string

  @Column({ type: 'varchar' })
  platform!: string

  @Column({ name: 'package_id', type: 'varchar', nullable: true })
  packageId!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date
}