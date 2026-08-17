import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { AllExceptionsFilter } from './common/filters/http-exception.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { setupSwagger } from './swagger'
import { requestIdMiddleware } from './common/middleware/request-id.middleware'
import { httpLoggerMiddleware } from './common/middleware/http-logger.middleware'
import helmet from 'helmet'
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')

  const config = app.get(ConfigService)
  const nodeEnv = config.get('NODE_ENV') || process.env.NODE_ENV

  // CORS config driven by env; default to permissive in development
  if (nodeEnv === 'production') {
    const origins = config.get('CORS_ORIGINS') ? config.get('CORS_ORIGINS').split(',') : []
    app.enableCors({ origin: origins, credentials: true })
  } else {
    app.enableCors()
  }

  // request id middleware
  app.use(requestIdMiddleware)
  // request logging (request id must be set first)
  app.use(httpLoggerMiddleware)
  // security headers
  app.use(helmet())

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

  const port = process.env.PORT ? Number(process.env.PORT) : 3001
  await app.listen(port)
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${port}/api`)
}

bootstrap()
