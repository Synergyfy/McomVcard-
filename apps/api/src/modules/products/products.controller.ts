import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Public } from '../auth/public.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { UserResponseDto } from '../../lib/utils/dto/user-response.dto'
import { ApiResponse } from '../../lib/utils/api-response'
import { ProductsService } from './products.service'
import { ProductResponseDto, ProductImageResponseDto, ExchangeItemResponseDto } from './dto/product-response.dto'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { CreateProductImageDto } from './dto/create-product-image.dto'

@ApiTags('products')
@ApiExtraModels(ApiResponse, ProductResponseDto, ProductImageResponseDto, ExchangeItemResponseDto)
@UseGuards(JwtAuthGuard)
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('businesses/:id/products')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a product to a business', description: 'Creates a product for a business owned by the authenticated user.' })
  @ApiBody({ type: CreateProductDto, examples: { default: { summary: 'New product', value: { name: 'Signature Skincare Set', description: 'A curated set of skincare essentials', price: 49.99, currency: 'GBP' } } } })
  @ApiCreatedResponse({
    description: 'Product created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(ProductResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own this business' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: CreateProductDto) {
    return this.productsService.create(id, user.id, body)
  }

  @Get('businesses/:id/products')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List a business products', description: 'Returns all products of a business with their gallery. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Business products',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(ProductResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  async list(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.productsService.list(id)
  }

  @Public()
  @Get('products/exchange')
  @ApiOperation({ summary: 'List exchange items', description: 'Returns active products available for exchange. Public endpoint — no authentication required.' })
  @ApiQuery({ name: 'business_id', required: false, description: 'Filter by business UUID' })
  @ApiOkResponse({
    description: 'Exchange items retrieved',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(ExchangeItemResponseDto) } },
          },
        },
      ],
    },
  })
  async listExchangeItems(@Query('business_id') businessId?: string) {
    return this.productsService.listExchangeItems(businessId)
  }

  @Get('products/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a product', description: 'Returns a single product with its gallery. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Product found',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(ProductResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return ApiResponse.success(ProductResponseDto.fromEntity(await this.productsService.findOne(id)), 'Product retrieved', 200)
  }

  @Patch('products/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product', description: 'Updates a product. The product must belong to a business the authenticated user owns.' })
  @ApiBody({ type: UpdateProductDto, examples: { default: { summary: 'Update product', value: { price: 59.99 } } } })
  @ApiOkResponse({
    description: 'Product updated',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(ProductResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async update(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: UpdateProductDto) {
    return this.productsService.update(id, user.id, body)
  }

  @Delete('products/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product', description: 'Deletes a product and its gallery. The product must belong to a business the authenticated user owns.' })
  @ApiOkResponse({
    description: 'Product deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Product deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto) {
    return this.productsService.remove(id, user.id)
  }

  @Post('products/:id/images')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a product gallery image', description: 'Adds an image to a product owned by the authenticated user.' })
  @ApiBody({ type: CreateProductImageDto, examples: { default: { summary: 'New image', value: { image_url: 'https://cdn.example.com/product/gallery-1.png', position: 0 } } } })
  @ApiCreatedResponse({
    description: 'Product image added',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { data: { $ref: getSchemaPath(ProductImageResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async addImage(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: UserResponseDto, @Body() body: CreateProductImageDto) {
    return this.productsService.addImage(id, user.id, body)
  }

  @Get('products/:id/images')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List a product gallery images', description: 'Returns the gallery images of a product. Readable by any authenticated user.' })
  @ApiOkResponse({
    description: 'Product images',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(ProductImageResponseDto) } },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async listImages(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.productsService.listImages(id)
  }

  @Delete('product-images/:imageId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a product gallery image', description: 'Removes an image. The product must belong to a business the authenticated user owns.' })
  @ApiOkResponse({
    description: 'Product image deleted',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        { properties: { message: { type: 'string', example: 'Product image deleted' } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'You do not own the parent business' })
  @ApiNotFoundResponse({ description: 'Product image not found' })
  async removeImage(@Param('imageId', new ParseUUIDPipe()) imageId: string, @CurrentUser() user: UserResponseDto) {
    return this.productsService.removeImage(imageId, user.id)
  }
}