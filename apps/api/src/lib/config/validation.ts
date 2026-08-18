import Joi from 'joi'

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().default('postgres'),
  DB_PASS: Joi.string().allow('').default('postgres'),
  DB_NAME: Joi.string().default('mcomvcard'),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('7d'),
  API_PUBLIC_URL: Joi.string().default('http://localhost:3001/api'),
  WEB_PUBLIC_URL: Joi.string().default('http://localhost:3000'),
  MAIL_HOST: Joi.string().optional(),
  MAIL_PORT: Joi.number().optional(),
  MAIL_USER: Joi.string().optional(),
  MAIL_PASS: Joi.string().optional(),
  MAIL_FROM: Joi.string().optional(),
  MAIL_SECURE: Joi.string().valid('true', 'false').optional(),
  // Comma-separated list of allowed CORS origins in production (e.g. "https://app.example.com,https://www.example.com").
  CORS_ORIGINS: Joi.string().optional(),
})
