import { logger } from '../logger/pino.logger'

export function loggerMiddleware(req: any, res: any, next: any) {
  const start = Date.now()
  const id = req.id || req.headers['x-request-id'] || null
  res.on('finish', () => {
    const info = {
      requestId: id,
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs: Date.now() - start,
      ts: new Date().toISOString(),
    }
    logger.info(info)
  })
  next()
}
