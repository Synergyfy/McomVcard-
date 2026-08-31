import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger'
import { CreateContactDto } from './dto/create-contact.dto'
import { ContactService } from './contact.service'
import { ApiResponse } from '../../lib/utils/api-response'

@ApiTags('contact')
@ApiExtraModels(ApiResponse)
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  @ApiOperation({
    summary: 'Submit contact form',
    description: 'Public endpoint to submit a contact form. Sends an email to the admin with the contact details.',
  })
  @ApiBody({
    type: CreateContactDto,
    examples: {
      basic: {
        summary: 'General inquiry',
        value: {
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'General inquiry',
          message: 'Hello, I would like to know more about your services.',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Message sent successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { type: 'null', nullable: true } } },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Validation failed (missing or invalid fields)' })
  async submitContact(@Body() dto: CreateContactDto) {
    return this.contactService.submitContact(dto)
  }
}