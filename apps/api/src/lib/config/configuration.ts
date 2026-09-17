export default () => ({
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  webPublicUrl: process.env.WEB_PUBLIC_URL || 'http://localhost:3000',
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  db: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    username: process.env.POSTGRES_USERNAME || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_NAME || 'mcomvcard',
  },
  mcom: {
    solutionsUrl: (process.env.MCOM_SOLUTIONS_URL || 'http://localhost:3010').replace(/\/+$/, ''),
    clientId: process.env.MCOM_CLIENT_ID || '',
    clientSecret: process.env.MCOM_CLIENT_SECRET || '',
    hmacSecret: process.env.MCOM_HMAC_SECRET || '',
    platformSlug: process.env.MCOM_PLATFORM_SLUG || 'vcard',
    walletEnabled: process.env.MCOM_WALLET_ENABLED === 'true',
  },
})
