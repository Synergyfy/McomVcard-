import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status = exception instanceof HttpException ? exception.getStatus() : 500
    let message = 'Internal server error'
    let error: unknown

    if (exception instanceof HttpException) {
      const res = exception.getResponse()
      if (typeof res === 'string') {
        message = res
      } else if (res && typeof res === 'object') {
        const body = res as { message?: string | string[] }
        message = Array.isArray(body.message) ? body.message.join(', ') : (body.message ?? exception.message)
        error = body.message
      } else {
        message = exception.message
      }
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
    })
  }
}
