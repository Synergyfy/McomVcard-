import pino from 'pino'

const isProd = process.env.NODE_ENV === 'production'

const transport = !isProd
  ? pino.transport({
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'yyyy-mm-dd HH:MM:ss.l o' },
    })
  : undefined

export const logger = transport ? pino({}, transport) : pino()

export default logger
