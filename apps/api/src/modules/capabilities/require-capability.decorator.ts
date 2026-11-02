import { SetMetadata } from '@nestjs/common'

export const CAPABILITY_KEY = 'required_capability'

/**
 * Require a plan capability on a route.
 *
 * The key is the same key the admin configures under a plan variant's
 * `configuration.quotas` / `configuration.featureFlags`.
 *
 * @example
 *   @RequireCapability('advancedAnalytics')
 *   @Get('analytics/advanced')
 *   advancedAnalytics() { ... }
 */
export const RequireCapability = (key: string) => SetMetadata(CAPABILITY_KEY, key)
