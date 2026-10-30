# Deployment Guide

Instructions for deploying the Linear-WordPress MCP to production.

---

## Pre-Deployment Checklist

- [ ] All tests pass: `npm run test`
- [ ] TypeScript compiles without errors: `npm run build`
- [ ] No linting errors: `npm run lint`
- [ ] CHANGELOG.md is updated
- [ ] Version is bumped in package.json
- [ ] Git branch is up to date with main
- [ ] All code is reviewed and approved
- [ ] Documentation is updated

---

## Local Testing

### 1. Verify Build

```bash
npm run build
```

Should produce no TypeScript errors.

### 2. Run Tests

```bash
npm run test
```

All tests should pass.

### 3. Start MCP Server

```bash
npm run dev
```

Verify both clients initialize:
```
[MCP] Linear client initialized
[MCP] WordPress client initialized
[MCP] Server connected and ready
```

### 4. Test All Tools

Use the test cases in [TESTING_GUIDE.md](../TESTING_GUIDE.md):
- Test 1A: List Linear-WordPress tools
- Test 1B: Test Linear functionality
- Test 1D: Test WordPress functionality
- Test 2A: Test cross-system linking

---

## Staging Deployment

Deploy to Cloudflare Workers (like Zendesk MCP):

### 1. Set Up Cloudflare Account

```bash
npm install -g wrangler
wrangler login
```

### 2. Configure wrangler.toml

Create `wrangler.toml`:
```toml
name = "linear-wordpress-mcp"
main = "dist/index.js"
compatibility_date = "2026-10-30"

[env.staging]
routes = [
  { pattern = "staging.lightspeed-mcp.workers.dev/linear-wordpress/*", zone_name = "lightspeedwp.agency" }
]

[env.production]
routes = [
  { pattern = "linear-wordpress-mcp.lsh.workers.dev/linear-wordpress/*", zone_name = "lightspeedwp.agency" }
]

[[triggers.crons]]
cron = "0 0 * * *"
```

### 3. Build and Deploy to Staging

```bash
npm run build
wrangler deploy --env staging
```

Verify: `https://staging.lightspeed-mcp.workers.dev/linear-wordpress/mcp`

### 4. Test Staging Endpoint

```bash
curl -X POST https://staging.lightspeed-mcp.workers.dev/linear-wordpress/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

### 5. Update Configuration

In `.claude/mcp.json`, test with staging URL:
```json
"linear-wordpress": {
  "type": "http",
  "url": "https://staging.lightspeed-mcp.workers.dev/linear-wordpress/mcp"
}
```

Verify all tests pass in Claude Code.

---

## Production Deployment

### 1. Create Release

Update version in package.json following SemVer:

```bash
# Patch release (bug fixes)
npm version patch

# Minor release (new features)
npm version minor

# Major release (breaking changes)
npm version major
```

### 2. Update Changelog

Add entry to CHANGELOG.md:
```markdown
## [1.2.0] - 2026-10-30

### Added
- Description of new features

### Fixed
- Description of bug fixes

### Changed
- Description of changes
```

### 3. Push Release

```bash
git push origin main
git push origin --tags
```

### 4. Deploy to Production

```bash
npm run build
wrangler deploy --env production
```

Verify: `https://linear-wordpress-mcp.lsh.workers.dev/linear-wordpress/mcp`

### 5. Test Production Endpoint

```bash
curl -X POST https://linear-wordpress-mcp.lsh.workers.dev/linear-wordpress/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

### 6. Update All Configurations

Update `.claude/mcp.json` in all projects:
```json
"linear-wordpress": {
  "type": "http",
  "url": "https://linear-wordpress-mcp.lsh.workers.dev/linear-wordpress/mcp"
}
```

### 7. Announce Release

Notify team:
- Update documentation with new features
- Document breaking changes if any
- Share upgrade path if needed

---

## Environment Variables

### Development (.env)

```bash
LINEAR_API_KEY=lin_api_xxx...
WORDPRESS_REST_API_URL=https://dev-site.test/wp-json/wp/v2
WORDPRESS_AUTH_USER=dev-user
WORDPRESS_AUTH_PASSWORD=xxxx xxxx xxxx xxxx
```

### Staging (Cloudflare Workers)

Set environment variables in Cloudflare Dashboard:
1. Workers → linear-wordpress-mcp → Settings → Environment Variables
2. Add:
   - `LINEAR_API_KEY` (staging API key)
   - `WORDPRESS_REST_API_URL` (staging site)
   - `WORDPRESS_AUTH_USER`
   - `WORDPRESS_AUTH_PASSWORD`

Or in `wrangler.toml`:
```toml
[env.staging]
vars = { LINEAR_API_KEY = "lin_api_staging..." }
```

### Production (Cloudflare Workers)

Set production environment variables:
1. Workers → linear-wordpress-mcp → Settings → Environment Variables (Production)
2. Add all required variables with production credentials

---

## Rollback Procedure

If production deployment has issues:

### 1. Identify the Issue

```bash
# Check Cloudflare logs
wrangler logs --env production
```

### 2. Rollback to Previous Version

```bash
# Find previous working version
git log --oneline | head -5

# Checkout previous version
git checkout [commit-hash]

# Rebuild and deploy
npm run build
wrangler deploy --env production --dry-run  # Verify first
wrangler deploy --env production
```

### 3. Notify Team

Post in team Slack channel with:
- What was rolled back
- Why it was rolled back
- Next steps for fixing the issue

### 4. Fix and Redeploy

Once fixed:
```bash
git checkout main
npm run build
wrangler deploy --env production
```

---

## Monitoring

### Set Up Monitoring

1. **Cloudflare Analytics:**
   - Workers → linear-wordpress-mcp → Analytics
   - Monitor request counts, errors, latency

2. **Error Tracking:**
   - Monitor 400/500 errors
   - Check error message logs

3. **Performance:**
   - Average response time should be <500ms
   - P95 response time should be <1s

### Alerting

Set up alerts for:
- Error rate > 1%
- Response time > 1s (P95)
- Failed deployments

---

## Security Considerations

### API Keys

1. **Rotate regularly:** Every 90 days
2. **Use environment variables:** Never in code
3. **Least privilege:** Use minimal required permissions
4. **Audit access:** Monitor API key usage

### Credentials

1. **WordPress:**
   - Use Application Passwords, not login credentials
   - Rotate every 90 days
   - Use separate credentials per environment

2. **Linear:**
   - Use team API keys when possible
   - Rotate personal keys regularly
   - Disable unused keys

### CORS and Headers

Configure CORS headers for security:
```javascript
// In Cloudflare Worker
return new Response(json, {
  headers: {
    'Access-Control-Allow-Origin': 'https://trusted-domain.com',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
})
```

---

## Maintenance

### Regular Tasks

- **Weekly:** Review error logs and performance metrics
- **Monthly:** Check for security updates (`npm audit`)
- **Quarterly:** Rotate API keys and credentials
- **Annually:** Review and update dependencies

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update major versions
npm install [package]@latest

# Run tests after updating
npm run build
npm run test
```

---

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy MCP

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - run: npm run test
      - run: npm run lint

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/')
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          environment: production
```

### GitHub Secrets

Add to repository Secrets:
- `CLOUDFLARE_API_TOKEN` — Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` — Your Cloudflare account ID

---

## See Also

- [SETUP_GUIDE.md](../SETUP_GUIDE.md) — Initial setup
- [TESTING_GUIDE.md](../TESTING_GUIDE.md) — Testing before deployment
- [CHANGELOG.md](../CHANGELOG.md) — Release notes
- [ARCHITECTURE.md](../ARCHITECTURE.md) — System design
