# Complete Linear-WordPress MCP Setup Guide

End-to-end setup from zero to production deployment on Cloudflare Workers.

## Phase 1: Project Setup (10 minutes)

### Clone the Repository
```bash
git clone https://github.com/lightspeedwp/linear-wordpress-mcp.git
cd linear-wordpress-mcp
```

### Install Dependencies
```bash
npm install
```

### Verify Installation
```bash
npm run typecheck
npm run build
```

You should see:
- No TypeScript errors
- `dist/cloudflare-worker.js` created (~200KB)

## Phase 2: Local Configuration (15 minutes)

### 1. Get Linear API Key

1. Go to https://linear.app/settings/api
2. Under "Personal API keys", create a new key
3. Copy the key (format: `lin_api_...`)
4. Save temporarily for next step

### 2. Get WordPress Application Password

1. Go to `https://yourwordpresssite.com/wp-admin/profile.php`
2. Scroll to "Application Passwords"
3. Enter name: "Linear MCP"
4. Click "Generate Application Password"
5. Copy the password (you'll only see it once)
6. Save for next step

### 3. Create Local Environment File

Create `.env.local` (don't commit this):

```bash
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxx
WORDPRESS_REST_API_URL=https://yourwordpresssite.com/wp-json
WORDPRESS_AUTH_USER=yourwordpressusername
WORDPRESS_AUTH_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx
USER_EMAIL=ashley@lightspeedwp.agency
```

## Phase 3: Local Testing (10 minutes)

### Test with Local MCP Server

The project includes a local stdio MCP server for testing:

```bash
# Start the local MCP server
npm run dev

# In another terminal, test it
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

You should see a list of 8 tools:
- `get_linear_teams`
- `get_linear_issues`
- `get_wordpress_posts`
- `create_wordpress_post`
- `link_issue_to_post`
- `update_issue_status`
- `search_linear_issues`
- `search_wordpress_posts`

### Run Tests

```bash
# Run all tests (Jest + BATS)
npm run test:all

# Should see: 83 passing tests, 100% coverage
```

## Phase 4: Cloudflare Workers Setup (20 minutes)

### Prerequisites

1. **Cloudflare Account** — Must have access to `lsh.workers.dev`
2. **Wrangler CLI** — Install globally:
   ```bash
   npm install -g wrangler
   ```
3. **Authentication Token** — Generate one:
   ```bash
   MCP_TOKEN=$(openssl rand -hex 32)
   echo "Save this securely: $MCP_TOKEN"
   ```

### Deploy to Staging

```bash
# Login to Cloudflare
wrangler login

# Set secrets for staging
wrangler secret put LINEAR_API_KEY --env staging
# Paste: your Linear API key

wrangler secret put WORDPRESS_REST_API_URL --env staging
# Paste: https://yoursite.com/wp-json

wrangler secret put WORDPRESS_AUTH_USER --env staging
# Paste: your WordPress username

wrangler secret put WORDPRESS_AUTH_PASSWORD --env staging
# Paste: your WordPress app password

wrangler secret put MCP_AUTH_TOKEN --env staging
# Paste: the token from above

wrangler secret put USER_EMAIL --env staging
# Paste: ashley@lightspeedwp.agency

# Build and deploy
npm run build
wrangler deploy --env staging
```

### Test Staging Deployment

```bash
# Should return 401 (auth required)
curl -I https://linear-wordpress-mcp-staging.lsh.workers.dev/mcp

# Should return tools list
curl -X POST https://linear-wordpress-mcp-staging.lsh.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MCP_TOKEN" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

## Phase 5: GitHub Actions & Automation (10 minutes)

### Add GitHub Secrets

1. Go to your repo: https://github.com/lightspeedwp/linear-wordpress-mcp/settings/secrets/actions
2. Click "New repository secret"
3. Add these 7 secrets:

| Secret Name | Value |
|-------------|-------|
| CLOUDFLARE_API_TOKEN | [From Cloudflare Dashboard → API Tokens] |
| LINEAR_API_KEY | Your Linear API key |
| WORDPRESS_REST_API_URL | Your WordPress REST URL |
| WORDPRESS_AUTH_USER | WordPress username |
| WORDPRESS_AUTH_PASSWORD | WordPress app password |
| MCP_AUTH_TOKEN | Your auth token from Phase 4 |
| USER_EMAIL | ashley@lightspeedwp.agency |

### Deploy to Production

```bash
# Set production secrets (same values as staging for now)
wrangler secret put LINEAR_API_KEY --env production
wrangler secret put WORDPRESS_REST_API_URL --env production
wrangler secret put WORDPRESS_AUTH_USER --env production
wrangler secret put WORDPRESS_AUTH_PASSWORD --env production
wrangler secret put MCP_AUTH_TOKEN --env production
wrangler secret put USER_EMAIL --env production

# Deploy
wrangler deploy --env production

# Test production endpoint
curl -X POST https://linear-wordpress-mcp.lsh.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MCP_TOKEN" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

### Enable Auto-Deployment

The `.github/workflows/deploy-workers.yml` workflow will now:
- Auto-deploy to staging on every push
- Auto-deploy to production on push to main
- Test both endpoints after deployment
- Fail the build if tests don't pass

## Phase 6: Integration Setup (10 minutes)

### Update Claude Configuration

Edit `.claude/mcp.json`:

```json
{
  "mcps": {
    "linear-wordpress": {
      "type": "http",
      "name": "Linear-WordPress MCP",
      "url": "https://linear-wordpress-mcp.lsh.workers.dev/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_MCP_AUTH_TOKEN"
      }
    },
    "zendesk": {
      "type": "http",
      "name": "Zendesk MCP",
      "url": "https://lightspeed-zendesk-mcp.lsh.workers.dev/mcp"
    }
  }
}
```

Replace `YOUR_MCP_AUTH_TOKEN` with your token from Phase 4.

### Test Multi-MCP Configuration

```bash
# Should connect to both MCPs
claude code
```

Then in Claude ask:
> "What Linear teams do we have, and list recent Zendesk tickets"

Claude should use both MCPs to answer.

## Phase 7: Team Sharing (5 minutes)

### Share with Team Securely

1. **Endpoint URL**: `https://linear-wordpress-mcp.lsh.workers.dev/mcp`
2. **Authentication Token**: Share via 1Password or password manager, NOT in Slack/email
3. **Documentation**: Share link to this guide

### Team Integration Steps

Each team member should:

1. Get the auth token from secure storage
2. Update their `.claude/mcp.json` with the endpoint and token
3. Restart Claude Code
4. Test with a simple query

## Verification Checklist

- [ ] `npm run build` succeeds with no errors
- [ ] `npm run test:all` shows 83 passing tests
- [ ] Staging endpoint responds with auth header
- [ ] Staging endpoint returns 401 without auth header
- [ ] Production endpoint responds correctly
- [ ] GitHub Actions workflow passes on push to main
- [ ] `.claude/mcp.json` configured with endpoint and token
- [ ] Claude Code connects to both Linear and Zendesk MCPs
- [ ] Team can access endpoint with shared token

## Troubleshooting

### Build fails
See [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md#troubleshooting)

### Tests fail
See [../../TESTING_GUIDE.md](../TESTING_GUIDE.md)

### Endpoint returns errors
See [SECURITY_AUTHENTICATION.md](SECURITY_AUTHENTICATION.md#troubleshooting)

### GitHub Actions fails
See [GITHUB_SECRETS.md](GITHUB_SECRETS.md#troubleshooting)

## Next: Monitoring & Maintenance

### Weekly
- Check Cloudflare Workers dashboard for errors
- Review API quota usage in Linear and WordPress
- Monitor response times

### Monthly
- Rotate MCP_AUTH_TOKEN (generate new, update secrets)
- Review logs for any API failures
- Update dependencies: `npm update`

### Quarterly
- Full security audit
- Performance optimization review
- Capacity planning for growing usage

## Support

- **Linear API Questions**: https://linear.app/docs
- **WordPress REST API**: https://developer.wordpress.org/rest-api/
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **MCP Protocol**: https://modelcontextprotocol.io/

## Additional Resources

- [Cloudflare Deployment Guide](CLOUDFLARE_DEPLOYMENT.md)
- [Security & Authentication](SECURITY_AUTHENTICATION.md)
- [GitHub Secrets Setup](GITHUB_SECRETS.md)
- [API Reference](API_REFERENCE.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Testing Guide](../TESTING_GUIDE.md)
