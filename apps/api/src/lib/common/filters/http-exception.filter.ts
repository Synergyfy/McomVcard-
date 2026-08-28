import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common'
import { STATUS_CODES } from 'http'
import { Request, Response } from 'express'

// Human-readable detail used when the exception carries no custom message
// (e.g. a bare UnauthorizedException() whose body is just "Unauthorized")
const FALLBACK_MESSAGES: Record<number, string> = {
  400: 'Bad request',
  401: 'Authentication required',
  403: 'Forbidden',
  404: 'Resource not found',
  409: 'Conflict',
  422: 'Unprocessable entity',
  429: 'Too many requests',
  500: 'Internal server error',
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception')

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status = exception instanceof HttpException ? exception.getStatus() : 500

    // Error category derived from the HTTP status (e.g. "Bad Request", "Unauthorized")
    let error = STATUS_CODES[status] ?? 'Error'

    let message = FALLBACK_MESSAGES[status] ?? 'Internal server error'

    // Extra fields on the exception body (e.g. wallet topUpUrl) are passed through
    // to the response so clients can act on them.
    let extra: Record<string, unknown> = {}

    if (exception instanceof HttpException) {
      const res = exception.getResponse()

      if (typeof res === 'string') {
        message = res
      } else if (res && typeof res === 'object') {
        const body = res as { message?: string | string[]; error?: string; statusCode?: number }
        message = Array.isArray(body.message) ? body.message.join(', ') : (body.message ?? exception.message)
        // A custom machine-readable error code (e.g. WALLET_INSUFFICIENT_FUNDS)
        // takes precedence over the generic HTTP status category.
        if (typeof body.error === 'string' && body.error) {
          error = body.error
        }
        const { message: _message, error: _error, statusCode: _statusCode, ...rest } = body as Record<string, unknown>
        extra = rest
      } else {
        message = exception.message
      }
    }

    // De-duplicate: if the exception body repeats the status category (e.g. "Unauthorized"),
    // fall back to a meaningful message instead
    if (message === error) {
      message = FALLBACK_MESSAGES[status] ?? message
    }

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : exception?.message,
      )
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      error,
      ...extra,
      path: request.url,
      timestamp: new Date().toISOString(),
    })
  }
}
