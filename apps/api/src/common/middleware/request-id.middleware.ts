import { randomUUID } from 'crypto'

export function requestIdMiddleware(req: any, res: any, next: any) {
  const id = req.headers['x-request-id'] || req.headers['x_correlation_id'] || randomUUID()
  req.id = id
  res.setHeader('x-request-id', id)
  next()
}
