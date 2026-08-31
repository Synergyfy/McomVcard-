import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MailService } from '../mail/mail.service'
import { CreateContactDto } from './dto/create-contact.dto'
import { ApiResponse } from '../../lib/utils/api-response'

@Injectable()
export class ContactService {
  private readonly logger = new Logger('Contact')
  private readonly adminEmail: string

  constructor(
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {
    this.adminEmail = this.config.get('CONTACT_ADMIN_EMAIL') || this.config.get('MAIL_FROM') || 'admin@mcom.local'
  }

  async submitContact(dto: CreateContactDto) {
    const { name, email, subject, message } = dto

    const emailSubject = `[Contact Form] ${subject}`
    const emailText = `New contact form submission:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`

    await this.mailService.sendMail({
      to: this.adminEmail,
      subject: emailSubject,
      text: emailText,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    })

    this.logger.log(`Contact form submitted by ${name} <${email}>: ${subject}`)

    return ApiResponse.success(null, 'Message sent successfully', 201)
  }
}