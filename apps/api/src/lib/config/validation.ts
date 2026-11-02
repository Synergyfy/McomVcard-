import Joi from 'joi'

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  POSTGRES_HOST: Joi.string().default('localhost'),
  POSTGRES_PORT: Joi.number().default(5432),
  POSTGRES_USERNAME: Joi.string().default('postgres'),
  POSTGRES_PASSWORD: Joi.string().allow('').default('postgres'),
  POSTGRES_NAME: Joi.string().default('mcomvcard'),
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
  RESEND_API_KEY: Joi.string().optional().empty(''),
  RESEND_FROM: Joi.string().optional().empty(''),
  // Comma-separated list of allowed CORS origins in production (e.g. "https://app.example.com,https://www.example.com").
  CORS_ORIGINS: Joi.string().optional().empty(''),
  // MCOM Solutions Central Hub (SSO + billing). Secrets are server-only and
  // must never leak into client bundles.
  MCOM_SOLUTIONS_URL: Joi.string().uri().default('http://localhost:3010'),
  MCOM_CLIENT_ID: Joi.string().optional().empty('').default(''),
  MCOM_CLIENT_SECRET: Joi.string().optional().empty('').default(''),
  // Inbound System API Key — authorizes MCOM Solutions when it calls
  // /api/v1/system/* (sent in the `x-mcom-solution-api-key` or `x-api-key`
  // header). MCOM_SOLUTION_API_KEY is accepted as a legacy alias.
  MCOM_API_KEY: Joi.string().optional().empty('').default(''),
  MCOM_SOLUTION_API_KEY: Joi.string().optional().empty('').default(''),
  MCOM_HMAC_SECRET: Joi.string().optional().empty('').default(''),
  MCOM_WEBHOOK_SECRET: Joi.string().optional().empty('').default(''),
  // Shared JWT secret for the legacy Direct Dashboard Handshake
  // (/sso-login?token=...). Signed by MCOM Central with issuer `mcom-central`.
  SSO_SECRET: Joi.string().optional().empty('').default(''),
  MCOM_PLATFORM_SLUG: Joi.string().default('vcards'),
  MCOM_REDIRECT_URI: Joi.string().uri().default('http://localhost:9024/auth/callback'),
  MCOM_SCOPES: Joi.string().default('profile email business membership packages'),
  MCOM_MEMBERSHIP_URL: Joi.string().uri().allow('').default(''),
  // White-label admission mode. This platform is not white-label, so normal
  // membership/trial entitlement gates apply.
  MCOM_WHITELABEL_ENABLED: Joi.string().valid('true', 'false').default('false'),
  // Direct app-to-app (Ecosystem Service Mesh) integration.
  MCOM_SERVICE_ENABLED: Joi.string().valid('true', 'false').default('true'),
  MCOM_SERVICE_BASE_URL: Joi.string().uri().allow('').default('http://localhost:9024'),
  MCOM_SERVICE_SCOPES: Joi.string().default('profile email service:read service:write'),
  // Optional ingress allowlist; empty means resolve from Central's registry.
  MCOM_ALLOWED_CALLERS: Joi.string().optional().empty('').default(''),
  // Centralized MCOM Wallet partner integration. When enabled, wallet balance,
  // transactions and writes are proxied to MCOM Solutions (/wallet/partner);
  // when disabled the app falls back to the local Postgres wallet tables.
  MCOM_WALLET_ENABLED: Joi.string().valid('true', 'false').default('false'),
  // Optional override for the Central Hub wallet top-up page. Defaults to
  // `${MCOM_SOLUTIONS_URL}/dashboard/wallet` when omitted.
  MCOM_WALLET_TOPUP_URL: Joi.string().uri().allow('').default(''),
  // MCOM Pay partner gateway (/api/v1/app-payments). All in-app charges are
  // created server-side with method "wallet" so customers pay from their
  // centralized MCOM Wallet balance.
  MCOM_PAY_ENABLED: Joi.string().valid('true', 'false').default('true'),
  REDIS_URL: Joi.string().optional().empty('').default('redis://localhost:6379'),
})
