# Third-Party Services — Go-Live Checklist

Overview of external services required for production deployment.

---

## 1. Already Integrated (provider abstraction — swap for production)

### Email (SMTP)
- **Current:** Dev fallback — logs emails to console when SMTP is not configured
- **Production:** Pick one:
  - [Postmark](https://postmarkapp.com/) — reliable, great deliverability
  - [SendGrid](https://sendgrid.com/) — free tier, widely used
  - [Resend](https://resend.com/) — modern, simple API
  - [Mailgun](https://www.mailgun.com/) — good for transactional email
- **Env vars:**
  ```
  MAIL_HOST=smtp.postmarkapp.com
  MAIL_PORT=587
  MAIL_USER=your-smtp-user
  MAIL_PASS=your-smtp-password
  MAIL_FROM=noreply@yourdomain.com
  MAIL_SECURE=true
  ```

### File Storage
- **Current:** Local disk (`uploads/media/`) — files served via express.static
- **Production:** Swap to S3-compatible provider:
  - [AWS S3](https://aws.amazon.com/s3/) — standard, most integrations
  - [Cloudflare R2](https://www.cloudflare.com/r2/) — no egress fees
  - [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces) — simple, cheap
- **Env vars:**
  ```
  MEDIA_STORAGE=s3
  AWS_S3_BUCKET=your-bucket-name
  AWS_S3_REGION=us-east-1
  AWS_ACCESS_KEY_ID=your-access-key
  AWS_SECRET_ACCESS_KEY=your-secret-key
  AWS_S3_ENDPOINT=https://your-region.digitaloceanspaces.com  # optional, for non-AWS
  ```

### Push Notifications
- **Current:** No-op placeholder (in-app notifications only)
- **Production:** Swap provider:
  - [Firebase Cloud Messaging (FCM)](https://firebase.google.com/docs/cloud-messaging) — free, cross-platform
  - [OneSignal](https://onesignal.com/) — easier setup, free tier
  - [Expo Push](https://docs.expo.dev/push-notifications/overview/) — if using React Native
- **Env vars:**
  ```
  PUSH_PROVIDER=firebase
  FIREBASE_PROJECT_ID=your-project-id
  FIREBASE_PRIVATE_KEY=your-private-key
  FIREBASE_CLIENT_EMAIL=your-client-email
  ```

---

## 2. Not Yet Integrated (needed for go-live)

### Payment Processing
- **Purpose:** Voucher purchases, wallet top-ups, cashback payouts, rewards
- **Recommended:** [Stripe](https://stripe.com/)
  - Stripe Connect for marketplace payments (business owners receive payouts)
  - Stripe Billing for subscriptions (membership tiers)
  - Stripe Webhooks for payment status updates
- **Env vars:**
  ```
  STRIPE_SECRET_KEY=sk_live_xxx
  STRIPE_PUBLISHABLE_KEY=pk_live_xxx
  STRIPE_WEBHOOK_SECRET=whsec_xxx
  STRIPE_API_VERSION=2024-12-18.acacia
  ```

### SMS / Phone Verification
- **Purpose:** Phone number verification, 2FA, transactional SMS
- **Recommended:**
  - [Twilio](https://www.twilio.com/) — most popular, reliable
  - [AWS SNS](https://aws.amazon.com/sns/) — cheaper at scale
- **Env vars:**
  ```
  SMS_PROVIDER=twilio
  TWILIO_ACCOUNT_SID=your-account-sid
  TWILIO_AUTH_TOKEN=your-auth-token
  TWILIO_PHONE_NUMBER=+1234567890
  ```

### CDN (Content Delivery Network)
- **Purpose:** Serve media files (card images, logos, uploads) fast globally
- **Recommended:**
  - [Cloudflare](https://www.cloudflare.com/) — free plan, CDN + DDoS protection
  - [AWS CloudFront](https://aws.amazon.com/cloudfront/) — if already on AWS
- **Env vars:**
  ```
  CDN_URL=https://cdn.yourdomain.com
  ```

### Hosting (API Deployment)
- **Recommended:**
  - [Railway](https://railway.app/) — simple, good free tier, Postgres built-in
  - [Render](https://render.com/) — easy deploys, managed Postgres
  - [Fly.io](https://fly.io/) — edge deployment, good performance
  - [AWS ECS/Fargate](https://aws.amazon.com/ecs/) — scalable, more complex
- **Env vars:** Set via hosting provider dashboard

### Database (PostgreSQL)
- **Currently:** Local PostgreSQL (`localhost:5432/mcomvcard`)
- **Production options:**
  - [Supabase](https://supabase.com/) — free tier, Postgres + auth + real-time
  - [Neon](https://neon.tech/) — serverless Postgres, generous free tier
  - [AWS RDS](https://aws.amazon.com/rds/) — managed, scalable
  - [Railway Postgres](https://railway.app/) — if hosting on Railway
- **Env vars:**
  ```
  DB_HOST=your-db-host
  DB_PORT=5432
  DB_USERNAME=your-db-user
  DB_PASSWORD=your-db-password
  DB_NAME=mcomvcard
  ```

### Redis (Caching / Rate Limiting)
- **Purpose:** Rate limiting (replace in-memory throttler), session caching, job queues
- **Recommended:**
  - [Upstash](https://upstash.com/) — serverless Redis, pay-per-request
  - [AWS ElastiCache](https://aws.amazon.com/elasticache/) — managed Redis
  - [Railway Redis](https://railway.app/) — if hosting on Railway
- **Env vars:**
  ```
  REDIS_URL=redis://default:your-password@your-redis-host:6379
  ```

### Domain + DNS
- **Purpose:** Production URL (`api.yourdomain.com`)
- **Recommended:** [Cloudflare](https://www.cloudflare.com/) (free, DNS + SSL + CDN)
- **Env vars:**
  ```
  CORS_ORIGIN=https://yourdomain.com
  ```

---

## 3. Summary — Minimum for Go-Live

| Service | Provider | Cost Estimate |
|---|---|---|
| Email | Postmark | Free tier (100 emails/mo) |
| File Storage | Cloudflare R2 | Free tier (10GB) |
| Payments | Stripe | 2.9% + 30¢ per transaction |
| Database | Neon or Supabase | Free tier |
| Hosting | Railway or Render | $5-20/mo |
| Redis | Upstash | Free tier |
| CDN + DNS | Cloudflare | Free |
| SMS (optional) | Twilio | ~$0.0079/SMS |

**Estimated monthly cost to start:** $5-30/mo

---

## 4. .env Template (Production)

Copy this to `.env.production` and fill in values:

```env
# ── App ──
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

# ── Database ──
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=mcomvcard

# ── Auth ──
JWT_SECRET=generate-a-strong-random-string-here
REFRESH_TOKEN_EXPIRES_IN=7d

# ── Email (SMTP) ──
MAIL_HOST=smtp.postmarkapp.com
MAIL_PORT=587
MAIL_USER=your-smtp-user
MAIL_PASS=your-smtp-password
MAIL_FROM=noreply@yourdomain.com
MAIL_SECURE=true

# ── File Storage (S3) ──
MEDIA_STORAGE=s3
AWS_S3_BUCKET=your-bucket-name
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# ── Redis ──
REDIS_URL=redis://default:your-password@your-redis-host:6379

# ── Payments (Stripe) ──
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# ── SMS (Twilio) ──
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# ── Push Notifications (Firebase) ──
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# ── CDN ──
CDN_URL=https://cdn.yourdomain.com
```
