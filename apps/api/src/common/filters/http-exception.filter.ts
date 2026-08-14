import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const res = exception.getResponse()
      return response.status(status).json({
        timestamp: new Date().toISOString(),
        path: request.url,
        error: res,
      })
    }

    // Unknown exception
    response.status(500).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      error: 'Internal server error',
    })
  }
}
