import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { MediaService } from './media.service'
import { CreateMediaFromUrlDto } from './dto/media.dto'
import { UploadedFileRecord } from './uploaded-file.type'
import { MediaResponseDto } from './dto/media-response.dto'

@ApiTags('media')
@ApiExtraModels(ApiResponse, MediaResponseDto)
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file', description: 'Uploads a file. Bytes go to the configured storage provider (local in dev, S3-compatible later); only metadata is stored in PostgreSQL. Max 5 MB.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiCreatedResponse({ description: 'Media uploaded', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(MediaResponseDto) } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async upload(@CurrentUser() user: UserResponseDto, @UploadedFile() file: UploadedFileRecord) {
    return this.mediaService.upload(user, file)
  }

  @Post('from-url')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register an external file URL', description: 'Registers metadata for an externally-hosted file by URL. No bytes are stored by the API.' })
  @ApiBody({ type: CreateMediaFromUrlDto, examples: { external: { summary: 'External image', value: { url: 'https://example.com/uploads/photo.jpg', mime_type: 'image/jpeg' } } } })
  @ApiCreatedResponse({ description: 'Media registered', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(MediaResponseDto) } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async createFromUrl(@CurrentUser() user: UserResponseDto, @Body() body: CreateMediaFromUrlDto) {
    return this.mediaService.createFromUrl(user, body)
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my media', description: 'Returns every media record the authenticated user uploaded, newest first.' })
  @ApiOkResponse({ description: 'Media', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'array', items: { $ref: getSchemaPath(MediaResponseDto) } } } }] } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async listMine(@CurrentUser() user: UserResponseDto) {
    return this.mediaService.listMine(user)
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get media metadata', description: 'Returns one media record by id (any authenticated user — URLs are public).' })
  @ApiOkResponse({ description: 'Media', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { $ref: getSchemaPath(MediaResponseDto) } } }] } })
  @ApiNotFoundResponse({ description: 'Media not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async get(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.mediaService.get(id)
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete media', description: 'Deletes one of the authenticated user\'s media records and removes the stored file (if provider-managed).' })
  @ApiOkResponse({ description: 'Media deleted', schema: { allOf: [{ $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'null', nullable: true } } }] } })
  @ApiNotFoundResponse({ description: 'Media not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async remove(@CurrentUser() user: UserResponseDto, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.mediaService.remove(user, id)
  }
}