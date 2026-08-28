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
  MAIL_HOST: Joi.string().optional().empty(''),
  MAIL_PORT: Joi.number().optional().empty(''),
  MAIL_USER: Joi.string().optional().empty(''),
  MAIL_PASS: Joi.string().optional().empty(''),
  MAIL_FROM: Joi.string().optional().empty(''),
  MAIL_SECURE: Joi.string().valid('true', 'false').optional().empty(''),
  // Comma-separated list of allowed CORS origins in production (e.g. "https://app.example.com,https://www.example.com").
  CORS_ORIGINS: Joi.string().optional().empty(''),
  // MCOM Solutions Central Hub (SSO + billing). Secrets are server-only and
  // must never leak into client bundles.
  MCOM_SOLUTIONS_URL: Joi.string().uri().default('http://localhost:3010'),
  MCOM_CLIENT_ID: Joi.string().optional().empty('').default(''),
  MCOM_CLIENT_SECRET: Joi.string().optional().empty('').default(''),
  MCOM_API_KEY: Joi.string().optional().empty('').default(''),
  MCOM_HMAC_SECRET: Joi.string().optional().empty('').default(''),
  MCOM_WEBHOOK_SECRET: Joi.string().optional().empty('').default(''),
  MCOM_PLATFORM_SLUG: Joi.string().default('vcard'),
  MCOM_REDIRECT_URI: Joi.string().uri().default('http://localhost:8000/auth/callback'),
  MCOM_SCOPES: Joi.string().default('profile email business membership packages'),
  MCOM_MEMBERSHIP_URL: Joi.string().uri().allow('').default(''),
  // Centralized MCOM Wallet partner integration. When enabled, wallet balance,
  // transactions and writes are proxied to MCOM Solutions (/wallet/partner);
  // when disabled the app falls back to the local Postgres wallet tables.
  MCOM_WALLET_ENABLED: Joi.string().valid('true', 'false').default('false'),
})
