import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

export interface MailPayload {
  to: string
  subject: string
  text?: string
  html?: string
}

@Injectable()
export class MailService {
  private readonly logger = new Logger('Mail')
  private readonly transporter: Transporter | null
  private readonly from: string

  constructor(private config: ConfigService) {
    this.from = this.config.get('MAIL_FROM') || 'MCOM <no-reply@mcom.local>'
    this.transporter = this.buildTransporter()
  }

  // Builds a real SMTP transporter when configured; otherwise null (dev fallback below).
  private buildTransporter(): Transporter | null {
    const host = this.config.get('MAIL_HOST')

    if (!host) return null

    return nodemailer.createTransport({
      host,
      port: Number(this.config.get('MAIL_PORT')) || 587,
      secure: this.config.get('MAIL_SECURE') === 'true',
      auth: {
        user: this.config.get('MAIL_USER') || '',
        pass: this.config.get('MAIL_PASS') || '',
      },
    })
  }

  async sendMail(payload: MailPayload): Promise<void> {
    if (!this.transporter) {
      // Dev fallback: no SMTP configured — surface the email in the logs so flows are testable.
      this.logger.log(
        `[DEV EMAIL] to=${payload.to} subject="${payload.subject}"\n${payload.text ?? ''}`,
      )
      return
    }

    await this.transporter.sendMail({ ...payload, from: this.from })
    this.logger.log(`Sent email to ${payload.to}`)
  }

  async sendVerificationLink(to: string, firstName: string | null, link: string): Promise<void> {
    const name = firstName || 'there'

    await this.sendMail({
      to,
      subject: 'Verify your MCOM email',
      text: `Hi ${name},\n\nPlease verify your email address by clicking the link below:\n${link}\n\nIf you did not create this account, you can ignore this email.\n\nThanks,\nThe MCOM Team`,
      html: `<p>Hi ${name},</p><p>Please verify your email address by clicking the link below:</p><p><a href="${link}">Verify my email</a></p><p>If you did not create this account, you can ignore this email.</p>`,
    })
  }

  async sendVerificationCode(to: string, firstName: string | null, code: string): Promise<void> {
    const name = firstName || 'there'

    await this.sendMail({
      to,
      subject: 'Your MCOM verification code',
      text: `Hi ${name},\n\nYour email verification code is:\n${code}\n\nThis code expires in 15 minutes.\n\nThanks,\nThe MCOM Team`,
      html: `<p>Hi ${name},</p><p>Your email verification code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p><p>This code expires in 15 minutes.</p>`,
    })
  }
}