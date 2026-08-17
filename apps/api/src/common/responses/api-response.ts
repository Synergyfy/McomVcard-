export class ApiResponse<T = unknown> {
  readonly success: boolean
  readonly message: string
  readonly data?: T

  private constructor(success: boolean, message: string, data?: T) {
    this.success = success
    this.message = message
    this.data = data
  }

  static success<T>(data: T, message = 'Success'): ApiResponse<T> {
    return new ApiResponse<T>(true, message, data)
  }

  static message(message: string): ApiResponse<null> {
    return new ApiResponse<null>(true, message)
  }
}
