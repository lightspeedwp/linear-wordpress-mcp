# Cloudflare Workers Deployment Guide

Deploy the Linear-WordPress MCP to Cloudflare Workers like the Zendesk MCP.

---

## Quick Start

If you already have Cloudflare access, deploy in 5 minutes:

```bash
# 1. Install Wrangler CLI (one-time)
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Deploy
wrangler deploy
```

Done! Your MCP will be at: `https://linear-wordpress-mcp.lsh.workers.dev/mcp`

---

## Full Setup Guide

### Step 1: Cloudflare Account & Setup

1. **Create Cloudflare Account** (if needed)
   - Go to https://dash.cloudflare.com/
   - Sign up or log in with your account
   - You should have access to `lsh.workers.dev`

2. **Install Wrangler CLI** (Cloudflare's deployment tool)
   ```bash
   npm install -g wrangler
   ```

3. **Login to Cloudflare**
   ```bash
   wrangler login
   ```
   This opens a browser to authorize Cloudflare access.

### Step 2: Configure Wrangler

Create `wrangler.toml` in project root:

```toml
name = "linear-wordpress-mcp"
main = "dist/index.js"
compatibility_date = "2026-10-30"

# Environment variables (set these in Cloudflare Dashboard)
[env.production]
name = "linear-wordpress-mcp"
routes = [
  { pattern = "linear-wordpress-mcp.lsh.workers.dev/mcp", zone_name = "lsh.workers.dev" }
]

[env.staging]
name = "linear-wordpress-mcp-staging"
routes = [
  { pattern = "linear-wordpress-mcp-staging.lsh.workers.dev/mcp", zone_name = "lsh.workers.dev" }
]

# Variables (public, visible in code)
[vars]
MCP_NAME = "linear-wordpress-mcp"
MCP_VERSION = "1.0.0"

# Secrets (private, secure)
# Set these via: wrangler secret put <KEY>
[[unsafe.bindings]]
name = "ENV_VARS"
type = "rpc"
service = "env-vars-service"
```

### Step 3: Build the Project

```bash
# Build TypeScript to JavaScript
npm run build

# Verify dist/cloudflare-worker.js exists
ls -la dist/cloudflare-worker.js
```

### Step 4: Generate MCP Authentication Token

Create a secure random token for API access:

```bash
# Generate a 32-byte random token
MCP_TOKEN=$(openssl rand -hex 32)
echo "Your MCP_AUTH_TOKEN: $MCP_TOKEN"
# Save this token securely — you'll need it to call the endpoint
```

### Step 5: Set Environment Secrets

Store credentials securely in Cloudflare (not in code):

```bash
# Set Linear API Key
wrangler secret put LINEAR_API_KEY

# Set WordPress credentials
wrangler secret put WORDPRESS_REST_API_URL
wrangler secret put WORDPRESS_AUTH_USER
wrangler secret put WORDPRESS_AUTH_PASSWORD

# Set MCP authentication token
wrangler secret put MCP_AUTH_TOKEN
# Paste the token from Step 4

# Set your email
wrangler secret put USER_EMAIL
```

Wrangler will prompt you to enter each value securely.

### Step 6: Deploy to Staging (Optional)

```bash
# Deploy to staging for testing
wrangler deploy --env staging

# Test staging endpoint (replace TOKEN with your MCP_AUTH_TOKEN)
curl -X POST https://linear-wordpress-mcp-staging.lsh.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MCP_AUTH_TOKEN" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'

# Should return: list of 8 tools
```

### Step 7: Deploy to Production

```bash
# Deploy to production
wrangler deploy --env production

# Test the endpoint (replace TOKEN with your MCP_AUTH_TOKEN)
curl -X POST https://linear-wordpress-mcp.lsh.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MCP_AUTH_TOKEN" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'

# Should return: list of 8 tools
```

### Step 8: Verify Deployment Security

```bash
# Deploy to staging for testing
wrangler deploy --env staging

# Test staging endpoint
curl https://linear-wordpress-mcp-staging.lsh.workers.dev/mcp
```

---

## Authentication

The MCP endpoint is **protected with bearer token authentication**. Every request must include:

```
Authorization: Bearer <MCP_AUTH_TOKEN>
```

### Token Requirements

- **Length:** Minimum 32 characters (256 bits) — validated on server
- **Format:** Hex-encoded random string (use `openssl rand -hex 32`)
- **Security:** Stored as Cloudflare Worker secret, never in code
- **Rotation:** Refresh quarterly for security best practices

### Generate Your Token

```bash
# Generate a cryptographically secure 32-byte (256-bit) token
MCP_TOKEN=$(openssl rand -hex 32)
echo "Your MCP_AUTH_TOKEN: $MCP_TOKEN"
# Save this securely — you'll need it to set up Cloudflare secrets
```

### Server Validation

The server validates:
- ✅ Token is configured (fails with **500** if missing)
- ✅ Token is at least 32 characters (fails with **500** if too short)
- ✅ Authorization header matches token (fails with **401** if invalid)
- ✅ Timing-safe comparison prevents timing attacks

### Response Codes

- **401 Unauthorized** — Invalid or missing Authorization header
- **500 Server Misconfigured** — Token not set or too short
  - This indicates a configuration problem on the server
  - Check that MCP_AUTH_TOKEN is set in Cloudflare environment variables
  - Verify the token is at least 32 characters long

---

## Cloudflare Workers Adapter

The MCP server needs a small adapter to run on Cloudflare Workers. Create `src/cloudflare-worker.ts`:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { LinearClient } from './linear/client.js'
import { WordPressClient } from './wordpress/client.js'
import { tools } from './tools/index.js'
import type { Env } from './types/index.js'

// Export for Cloudflare Workers
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Only accept POST to /mcp
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    if (!request.url.endsWith('/mcp')) {
      return new Response('Not found', { status: 404 })
    }

    try {
      const body = await request.json()
      
      // Initialize clients with environment variables
      const linearClient = new LinearClient(env)
      const wordPressClient = new WordPressClient(env)

      // Create server
      const server = new Server({
        name: 'linear-wordpress-mcp',
        version: '1.0.0'
      })

      // Register tools
      server.setRequestHandler(
        tools as any,
        async (toolName: string, args: unknown) => {
          const tool = tools.find(t => t.name === toolName)
          if (!tool) {
            throw new Error(`Tool not found: ${toolName}`)
          }

          return await tool.handler(args, linearClient, wordPressClient, {
            env,
            userEmail: env.USER_EMAIL
          })
        }
      )

      // Handle the MCP request
      const result = await server.handleRequest(body)
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
}
```

Update `wrangler.toml`:
```toml
main = "dist/cloudflare-worker.js"
```

---

## Environment Variables in Cloudflare Dashboard

1. Go to https://dash.cloudflare.com/
2. Select your Workers
3. Click "linear-wordpress-mcp"
4. Go to **Settings** → **Variables**
5. Add:
   - `LINEAR_API_KEY` (secret)
   - `WORDPRESS_REST_API_URL` (public)
   - `WORDPRESS_AUTH_USER` (secret)
   - `WORDPRESS_AUTH_PASSWORD` (secret)

---

## Deployment Workflow

### First-Time Deploy
```bash
# 1. Install dependencies
npm install

# 2. Build
npm run build

# 3. Set secrets
wrangler secret put LINEAR_API_KEY
wrangler secret put WORDPRESS_REST_API_URL
wrangler secret put WORDPRESS_AUTH_USER
wrangler secret put WORDPRESS_AUTH_PASSWORD

# 4. Deploy to staging first
wrangler deploy --env staging

# 5. Test staging
curl -X POST https://linear-wordpress-mcp-staging.lsh.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'

# 6. Deploy to production
wrangler deploy --env production

# 7. Test production
curl -X POST https://linear-wordpress-mcp.lsh.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

### Update Existing Deploy
```bash
# 1. Make changes
# 2. Build
npm run build

# 3. Deploy to staging
wrangler deploy --env staging

# 4. Test staging
# 5. Deploy to production
wrangler deploy --env production
```

### Update Secrets Only
```bash
# Update a secret
wrangler secret put LINEAR_API_KEY --env production

# List all secrets
wrangler secret list --env production
```

---

## Testing Your Deployment

### Verify Endpoint is Live (Unauthenticated Check)
```bash
curl -I https://linear-wordpress-mcp.lsh.workers.dev/mcp
# Should return: 401 Unauthorized (expected, auth required)
```

### Test Tool List
```bash
curl -X POST https://linear-wordpress-mcp.lsh.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MCP_AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

### Test a Tool
```bash
curl -X POST https://linear-wordpress-mcp.lsh.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MCP_AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_linear_teams"
    }
  }'
```

### Test Without Authentication (Should Fail)
```bash
# This should return 401 Unauthorized
curl -X POST https://linear-wordpress-mcp.lsh.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

---

## Monitoring & Logs

### View Deployment Logs
```bash
# Real-time logs
wrangler tail --env production

# Last 100 logs
wrangler tail --format json --env production | jq
```

### Cloudflare Dashboard Analytics
1. Go to Dash → Workers → linear-wordpress-mcp
2. **Analytics** tab shows:
   - Requests count
   - Response times
   - Errors
   - CPU time

### Set Up Monitoring Alerts
1. Dash → Account Home → Notifications
2. Create alert for:
   - High error rate (>5%)
   - Slow response (>2s)
   - Script timeouts

---

## Troubleshooting

### 401 Unauthorized
**Problem:** `Linear API key is invalid`

**Solution:**
```bash
# Update the secret
wrangler secret put LINEAR_API_KEY --env production

# Redeploy
wrangler deploy --env production
```

### 403 Forbidden WordPress
**Problem:** `WordPress credentials incorrect`

**Solution:**
```bash
# Verify credentials work locally first
# Then update secrets
wrangler secret put WORDPRESS_REST_API_URL --env production
wrangler secret put WORDPRESS_AUTH_USER --env production
wrangler secret put WORDPRESS_AUTH_PASSWORD --env production

wrangler deploy --env production
```

### Timeout Errors
**Problem:** `504 Gateway Timeout` after 30s

**Solution:**
- Cloudflare Workers has 30s timeout limit
- Optimize API queries in `src/linear/client.ts`
- Consider caching frequently accessed data
- Reduce result set sizes

### Cold Starts Slow
**Problem:** First request takes >10s

**Solution:**
- Normal for Cloudflare Workers (loading dependencies)
- Subsequent requests are fast (<500ms)
- Cache results when possible

### CORS Issues
**Problem:** Browser fetch fails with CORS error

**Solution:** Add CORS headers in `cloudflare-worker.ts`:
```typescript
headers: {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type'
}
```

---

## CI/CD Deployment

### GitHub Actions Workflow

Create `.github/workflows/deploy-workers.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm install
      - run: npm run build
      - run: npm test
      
      - name: Deploy to Staging
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          environment: staging
      
      - name: Deploy to Production
        if: github.ref == 'refs/heads/main'
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          environment: production
```

### Add GitHub Secrets
1. Go to GitHub Repo → Settings → Secrets
2. Add:
   - `CLOUDFLARE_API_TOKEN` (from Dash → API Tokens → Create Token)

---

## Rollback

### Quick Rollback
```bash
# List recent deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback --message "Rollback to previous version"
```

### Manual Rollback
```bash
# If you have a git tag for the version
git checkout v1.0.0
npm run build
wrangler deploy --env production
```

---

## Comparison: Local vs. Cloudflare Workers

| Aspect | Local | Cloudflare Workers |
|--------|-------|-------------------|
| **Timeout** | Unlimited | 30 seconds |
| **Memory** | 2GB+ | 128MB |
| **Startup** | Instant | 1-2s (cached) |
| **Cost** | Free (your machine) | Free tier: 100k req/day |
| **Scaling** | Manual | Automatic |
| **Availability** | 99.9% (your ISP) | 99.99% global |
| **URL** | localhost:3000 | linear-wordpress-mcp.lsh.workers.dev |

---

## Next Steps

1. **Deploy staging**: `wrangler deploy --env staging`
2. **Test endpoints** using curl with Authorization header
3. **Update .claude/mcp.json** to use production URL with auth token:
   ```json
   {
     "name": "Linear-WordPress MCP (Production)",
     "type": "http",
     "url": "https://linear-wordpress-mcp.lsh.workers.dev/mcp",
     "headers": {
       "Authorization": "Bearer YOUR_MCP_AUTH_TOKEN"
     }
   }
   ```
4. **Share with team**: Provide the endpoint URL and authentication token securely
   - Never share the token in plain text
   - Use your password manager or secure secret sharing service
   - Rotate tokens quarterly

---

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Zendesk MCP Reference](https://lightspeed-zendesk-mcp.lsh.workers.dev/mcp)

---

## Support

If Chris set up the Zendesk MCP, ask them to verify:
1. Cloudflare account access (should be shared team account)
2. API token permissions
3. Custom domain setup (if applicable)

Your deployment process will be identical to theirs!
