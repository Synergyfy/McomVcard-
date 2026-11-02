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
  private readonly resendApiKey: string | null

  constructor(private config: ConfigService) {
    this.from =
      this.config.get('RESEND_FROM') ||
      this.config.get('MAIL_FROM') ||
      'MCOM VCard <onboarding@resend.dev>'
    this.resendApiKey = this.config.get('RESEND_API_KEY') || null
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
    if (this.resendApiKey) {
      try {
        await this.sendWithResend(payload)
        this.logger.log(`Sent email via Resend to ${payload.to}`)
        return
      } catch (error) {
        this.logger.error(
          `Resend delivery failed for ${payload.to}: ${error instanceof Error ? error.message : error}`,
        )
      }
    }

    if (!this.transporter) {
      this.logger.log(
        `[DEV EMAIL] to=${payload.to} subject="${payload.subject}"\n${payload.text ?? ''}`,
      )
      return
    }

    await this.transporter.sendMail({ ...payload, from: this.from })
    this.logger.log(`Sent email to ${payload.to}`)
  }

  private async sendWithResend(payload: MailPayload): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.from,
        to: [payload.to],
        subject: payload.subject,
        text: payload.text,
        html: payload.html ?? (payload.text ? this.textToHtml(payload.text) : undefined),
      }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`Resend responded ${response.status}: ${body.slice(0, 300)}`)
    }
  }

  private textToHtml(text: string): string {
    return text.split('\n').map((line) => `<p>${line || '&nbsp;'}</p>`).join('')
  }

  async sendReferralInvite(to: string, inviterName: string): Promise<void> {
    const appUrl = this.config.get('WEB_PUBLIC_URL') || 'http://localhost:9023'
    await this.sendMail({
      to,
      subject: `${inviterName} invited you to join MCOM VCard`,
      text: `Hi,\n\n${inviterName} invited you to join MCOM VCard.\n\nCreate your free account here:\n${appUrl}/login\n\nIf you were not expecting this invitation, you can safely ignore this email.\n\nThanks,\nThe MCOM Team`,
      html: `<p>Hi,</p><p><strong>${inviterName}</strong> invited you to join MCOM VCard.</p><p><a href="${appUrl}/login">Create your free account</a></p><p>If you were not expecting this invitation, you can safely ignore this email.</p>`,
    })
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

  async sendPasswordResetLink(to: string, firstName: string | null, link: string): Promise<void> {
    const name = firstName || 'there'

    await this.sendMail({
      to,
      subject: 'Reset your MCOM password',
      text: `Hi ${name},\n\nWe received a request to reset your password. Click the link below to choose a new one:\n${link}\n\nThis link expires in 30 minutes. If you did not request this, you can ignore this email.\n\nThanks,\nThe MCOM Team`,
      html: `<p>Hi ${name},</p><p>We received a request to reset your password. Click the link below to choose a new one:</p><p><a href="${link}">Reset my password</a></p><p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>`,
    })
  }
}