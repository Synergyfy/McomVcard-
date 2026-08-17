import { Logger } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

const logger = new Logger('HTTP')

type AuthedRequest = Request & { id?: string; user?: { id?: number } }

export function httpLoggerMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  const startedAt = process.hrtime.bigint()

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6

    const entry = {
      request_id: req.id,
      method: req.method,
      path: req.baseUrl + req.path,
      status: res.statusCode,
      duration_ms: Number(durationMs.toFixed(2)),
      ip: req.ip,
      user_agent: req.get('user-agent'),
      user_id: req.user?.id,
    }

    if (res.statusCode >= 500) {
      logger.error(JSON.stringify(entry))
      return
    }

    logger.log(JSON.stringify(entry))
  })

  next()
}