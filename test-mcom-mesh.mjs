// MCOM Ecosystem Service Mesh — zero-dependency connectivity smoke test.
//
// Run from the repo root (loads the API's local credentials):
//   node --env-file=apps/api/.env test-mcom-mesh.mjs
//
// Optional: TARGET_PEER=mcom-rewards SERVICE_SCOPE=service:read
//
// Note: Service Mesh access is deny-by-default. A 403 here means the target
// peer is not in this app's Allowed Audiences (Egress) yet — configure it in
// MCOM Console → Service Mesh Policy.

const MCOM_URL = (process.env.MCOM_SOLUTIONS_URL || 'http://localhost:3010').replace(/\/+$/, '')
const CLIENT_ID = process.env.MCOM_CLIENT_ID || 'mcom-vcards'
const CLIENT_SECRET = process.env.MCOM_CLIENT_SECRET || ''
const TARGET_PEER = process.env.TARGET_PEER || 'mcom-rewards'
const SCOPE = process.env.SERVICE_SCOPE || 'service:read'

function line(label, value) {
  console.log(`${label} ${value}`)
}

console.log(`\n[1/3] Testing ecosystem discovery at ${MCOM_URL}...`)
try {
  const discoveryRes = await fetch(`${MCOM_URL}/api/v1/ecosystem/discovery`)
  const discovery = await discoveryRes.json()
  line('✅ Discovery OK! Issuer:', discovery.issuer)
  line('   Signing alg:', discovery.signing_alg)
  line('   JWKS URI:', discovery.jwks_uri)

  console.log(`\n[2/3] Requesting RS256 service token for audience "${TARGET_PEER}" (scope: ${SCOPE})...`)
  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const tokenRes = await fetch(`${MCOM_URL}/api/v1/auth/service-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basicAuth}`,
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      audience: TARGET_PEER,
      scope: SCOPE,
    }),
  })
  const tokenData = await tokenRes.json()

  if (!tokenRes.ok) {
    console.error(`❌ Service token failed (${tokenRes.status}):`, tokenData.message || tokenData)
    console.log(`💡 HINT: add "${TARGET_PEER}" to ${CLIENT_ID}'s Allowed Audiences in MCOM Console → Service Mesh Policy.`)
  } else {
    line('✅ Service token minted! Type:', tokenData.token_type)
    line('   Expires in:', `${tokenData.expires_in}s`)
    line('   Token preview:', `${String(tokenData.access_token).slice(0, 32)}...`)
  }

  console.log('\n[3/3] Fetching ecosystem peer directory...')
  const peersRes = await fetch(`${MCOM_URL}/api/v1/ecosystem/services`)
  const peers = await peersRes.json()
  const list = Array.isArray(peers) ? peers : []
  line('✅ Registry reachable. Active peers:', list.length)
  line('   Peers:', list.map((peer) => peer.clientId).join(', '))

  const me = list.find((peer) => peer.clientId === CLIENT_ID)
  if (me) {
    line('   This app — scopes:', JSON.stringify(me.scopes || []))
    line('   This app — allowed callers:', JSON.stringify(me.allowedCallers || []))
  }
} catch (err) {
  console.error('❌ Connectivity test failed:', err instanceof Error ? err.message : err)
  process.exitCode = 1
}
