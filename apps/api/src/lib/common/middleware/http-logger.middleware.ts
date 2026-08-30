import { Logger } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { STATUS_CODES } from 'http'

const logger = new Logger('HTTP')

type AuthedRequest = Request & {
  id?: string
  user?: { id?: number | string; role?: string; email?: string; [key: string]: any }
}

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',

  // Methods
  getMethodBadge(method: string): string {
    const m = method.toUpperCase()
    switch (m) {
      case 'GET':
        return `\x1b[36;1m${m.padEnd(7)}\x1b[0m` // Cyan Bold
      case 'POST':
        return `\x1b[32;1m${m.padEnd(7)}\x1b[0m` // Green Bold
      case 'PUT':
        return `\x1b[33;1m${m.padEnd(7)}\x1b[0m` // Yellow Bold
      case 'PATCH':
        return `\x1b[35;1m${m.padEnd(7)}\x1b[0m` // Magenta Bold
      case 'DELETE':
        return `\x1b[31;1m${m.padEnd(7)}\x1b[0m` // Red Bold
      case 'OPTIONS':
      case 'HEAD':
        return `\x1b[90m${m.padEnd(7)}\x1b[0m` // Gray
      default:
        return `\x1b[97;1m${m.padEnd(7)}\x1b[0m`
    }
  },

  // Status code with text description & colors
  getStatusBadge(status: number): string {
    const statusText = STATUS_CODES[status] || ''
    const text = `${status} ${statusText}`.trim()
    if (status >= 500) {
      return `\x1b[31;1m${text}\x1b[0m` // Red Bold
    }
    if (status >= 400) {
      return `\x1b[33;1m${text}\x1b[0m` // Yellow Bold
    }
    if (status >= 300) {
      return `\x1b[36;1m${text}\x1b[0m` // Cyan Bold
    }
    if (status >= 200) {
      return `\x1b[32;1m${text}\x1b[0m` // Green Bold
    }
    return `\x1b[37m${text}\x1b[0m`
  },

  // Latency with color indicators
  getDurationBadge(ms: number): string {
    const formatted = ms < 1 ? '<1ms' : ms < 100 ? `${ms.toFixed(1)}ms` : `${Math.round(ms)}ms`
    if (ms >= 1000) {
      return `\x1b[31;1m+${formatted}\x1b[0m` // Red Bold
    }
    if (ms >= 300) {
      return `\x1b[33m+${formatted}\x1b[0m` // Yellow
    }
    return `\x1b[32m+${formatted}\x1b[0m` // Green
  },
}

function formatBytes(bytesStr: string | number | undefined): string {
  const bytes = Number(bytesStr)
  if (isNaN(bytes) || bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export function httpLoggerMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  const startedAt = process.hrtime.bigint()

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6
    const statusCode = res.statusCode
    const url = req.originalUrl || req.url || (req.baseUrl + req.path)
    const method = req.method
    const contentLength = res.get('content-length')
    const sizeStr = formatBytes(contentLength)

    // Structured JSON log format fallback (e.g. for cloud aggregator environments)
    if (process.env.LOG_FORMAT === 'json') {
      const entry = {
        request_id: req.id,
        method,
        path: url,
        status: statusCode,
        duration_ms: Number(durationMs.toFixed(2)),
        ip: req.ip,
        user_agent: req.get('user-agent'),
        user_id: req.user?.id,
      }

      if (statusCode >= 500) {
        logger.error(JSON.stringify(entry))
      } else if (statusCode >= 400) {
        logger.warn(JSON.stringify(entry))
      } else {
        logger.log(JSON.stringify(entry))
      }
      return
    }

    // Terminal formatted log
    const methodBadge = colors.getMethodBadge(method)
    const statusBadge = colors.getStatusBadge(statusCode)
    const durationBadge = colors.getDurationBadge(durationMs)
    const sizeBadge = sizeStr ? ` \x1b[90m(${sizeStr})\x1b[0m` : ''

    // Auth / Context metadata badges
    let meta = ''
    if (req.user?.id) {
      const roleStr = req.user.role ? `·${req.user.role}` : ''
      meta += ` \x1b[90m[user:${req.user.id}${roleStr}]\x1b[0m`
    }
    if (req.id) {
      const shortId = req.id.slice(0, 8)
      meta += ` \x1b[90m[req:${shortId}]\x1b[0m`
    }

    const logLine = `${methodBadge} ${url} ${statusBadge} ${durationBadge}${sizeBadge}${meta}`

    if (statusCode >= 500) {
      logger.error(logLine)
    } else if (statusCode >= 400) {
      logger.warn(logLine)
    } else {
      logger.log(logLine)
    }
  })

  next()
}