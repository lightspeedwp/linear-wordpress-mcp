# Cloudflare Workers Deployment Quick Start

Deploy the Linear-WordPress MCP to Cloudflare Workers in 10 minutes.

## Prerequisites

- Cloudflare account with Workers access
- Node.js 18+ and npm installed
- GitHub repository with the codebase
- Access to Linear and WordPress APIs

## 5-Minute Deploy (for existing Cloudflare account)

```bash
# 1. Install Wrangler (one-time)
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Generate auth token
MCP_TOKEN=$(openssl rand -hex 32)
echo "Save this: $MCP_TOKEN"

# 4. Build and deploy
npm install
npm run build
wrangler secret put LINEAR_API_KEY --env staging
wrangler secret put WORDPRESS_REST_API_URL --env staging
wrangler secret put WORDPRESS_AUTH_USER --env staging
wrangler secret put WORDPRESS_AUTH_PASSWORD --env staging
wrangler secret put MCP_AUTH_TOKEN --env staging
# Paste: $MCP_TOKEN
wrangler secret put USER_EMAIL --env staging
wrangler deploy --env staging

# 5. Test it works
curl -X POST https://linear-wordpress-mcp-staging.lsh.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MCP_TOKEN" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

Done! Your MCP is at:
- **Staging**: `https://linear-wordpress-mcp-staging.lsh.workers.dev/mcp`
- **Production**: `https://linear-wordpress-mcp.lsh.workers.dev/mcp`

## What You Need

### 1. Linear API Key
From https://linear.app/settings/api

### 2. WordPress Credentials
- REST API URL: `https://yoursite.com/wp-json`
- Username: Your WordPress user
- Application Password: [Create in WordPress](https://yoursite.com/wp-admin/profile.php) (not your account password)

### 3. MCP Authentication Token
```bash
# Generate once, save securely
MCP_TOKEN=$(openssl rand -hex 32)
```

### 4. Your Email
For logging and identification

## Next: Automate with GitHub

After manual deploy works, set up GitHub Actions to auto-deploy on every push:

1. Go to GitHub repo Settings → Secrets and variables → Actions
2. Add these secrets:
   - `CLOUDFLARE_API_TOKEN` (from Cloudflare Dashboard → API Tokens)
   - `LINEAR_API_KEY`
   - `WORDPRESS_REST_API_URL`
   - `WORDPRESS_AUTH_USER`
   - `WORDPRESS_AUTH_PASSWORD`
   - `MCP_AUTH_TOKEN`
   - `USER_EMAIL`

3. Workflow auto-runs on push to main
4. Check GitHub Actions tab for deployment status

## Testing Endpoints

### List Tools
```bash
curl -X POST https://linear-wordpress-mcp.lsh.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MCP_AUTH_TOKEN" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

### Call a Tool
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

### Verify Auth Fails Without Token
```bash
# Should return 401 Unauthorized
curl -X POST https://linear-wordpress-mcp.lsh.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

## Troubleshooting

### Build fails
- Run `npm run build` locally first
- Check TypeScript errors: `npm run typecheck`
- Verify dist/cloudflare-worker.js exists

### Deploy fails
- Check Wrangler is logged in: `wrangler whoami`
- Verify wrangler.toml exists in project root
- Check Cloudflare account has Workers enabled

### Endpoint returns 401
- Verify MCP_AUTH_TOKEN is set: `wrangler secret list --env production`
- Check Authorization header format: `Authorization: Bearer TOKEN`

### Endpoint returns 500
- Check Cloudflare dashboard logs
- Verify all 6 secrets are set correctly
- Try staging first: `wrangler deploy --env staging`

## Full Documentation

- **[CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md)** — Complete deployment guide
- **[SECURITY_AUTHENTICATION.md](SECURITY_AUTHENTICATION.md)** — Authentication details
- **[GITHUB_SECRETS.md](GITHUB_SECRETS.md)** — GitHub Actions setup

## Next Steps

1. Deploy to staging and test
2. Configure GitHub secrets
3. Merge to main to auto-deploy to production
4. Share endpoint URL and token securely with team
5. Monitor Cloudflare dashboard for usage
