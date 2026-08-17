import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ApiResponse<T = unknown> {
  @ApiPropertyOptional({ description: 'Response payload' })
  readonly data?: T

  @ApiProperty({ example: 'Success', description: 'Human-readable message' })
  readonly message: string

  @ApiProperty({ example: 200, description: 'HTTP status code' })
  readonly statusCode: number

  @ApiProperty({ example: true, description: 'Whether the request succeeded' })
  readonly success: boolean

  private constructor(data: T, message: string, statusCode: number) {
    this.data = data
    this.message = message
    this.statusCode = statusCode
    this.success = true
  }

  static success<T>(data: T, message = 'Success', statusCode = 200): ApiResponse<T> {
    return new ApiResponse<T>(data, message, statusCode)
  }

  static message(message: string, statusCode = 200): ApiResponse<null> {
    return new ApiResponse<null>(null, message, statusCode)
  }
}