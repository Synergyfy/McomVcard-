import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import 'reflect-metadata'
import { ValidationPipe, Logger } from '@nestjs/common'
import { AllExceptionsFilter } from './lib/common/filters/http-exception.filter'
import { TransformInterceptor } from './lib/common/interceptors/transform.interceptor'
import { setupSwagger } from './swagger'
import { requestIdMiddleware } from './lib/common/middleware/request-id.middleware'
import { httpLoggerMiddleware } from './lib/common/middleware/http-logger.middleware'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { ConfigService } from '@nestjs/config'
import { join } from 'path'
import express from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger('Bootstrap')
  app.setGlobalPrefix('api')

  // Serve uploaded media files (spec §45): bytes live on disk, metadata in DB.
  app.use('/media/uploads', express.static(join(process.cwd(), 'uploads', 'media')))

  const config = app.get(ConfigService)
  const nodeEnv = config.get('NODE_ENV') || process.env.NODE_ENV

  // CORS config driven by env; default to permissive in development.
  // credentials: true is required for the HttpOnly refresh-token cookie flow.
  if (nodeEnv === 'production') {
    const origins = config.get('CORS_ORIGINS') ? config.get('CORS_ORIGINS').split(',') : []
    app.enableCors({ origin: origins, credentials: true })
  } else {
    app.enableCors({ origin: true, credentials: true })
  }

  // request id middleware
  app.use(requestIdMiddleware)
  // request logging (request id must be set first)
  app.use(httpLoggerMiddleware)
  // compression (gzip/deflate for large responses)
  app.use(compression())
  // security headers
  app.use(helmet())
  // HttpOnly refresh-token cookie parsing
  app.use(cookieParser())

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  app.useGlobalFilters(new AllExceptionsFilter())
  app.useGlobalInterceptors(new TransformInterceptor())

  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app)
  }

  // Graceful shutdown: enable NestJS shutdown hooks for SIGTERM/SIGINT
  app.enableShutdownHooks()

  const port = process.env.PORT ? Number(process.env.PORT) : 3001
  await app.listen(port)
  logger.log(`API running on http://localhost:${port}/api [${nodeEnv}]`)
}

// Process-level error handlers — prevent silent failures in production
process.on('unhandledRejection', (reason: unknown) => {
  // eslint-disable-next-line no-console
  console.error('[UNHANDLED_REJECTION]', reason)
})

process.on('uncaughtException', (error: Error) => {
  // eslint-disable-next-line no-console
  console.error('[UNCAUGHT_EXCEPTION]', error)
  process.exit(1)
})

bootstrap()
