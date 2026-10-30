# Security & Authentication Reference

Complete guide to securing the Linear-WordPress MCP endpoint and managing authentication.

## Overview

The Linear-WordPress MCP endpoint is **protected with bearer token authentication** to prevent unauthorized access to your Linear and WordPress data.

- Every request requires an `Authorization: Bearer <token>` header
- Requests without valid authentication return `401 Unauthorized`
- Tokens are 64-character hex strings (256 bits of entropy)
- Authentication is validated with timing-safe comparison to prevent timing attacks

## Authentication Token Management

### Generating a Token

Generate a cryptographically secure token:

```bash
# One-time generation
MCP_TOKEN=$(openssl rand -hex 32)
echo "Your token: $MCP_TOKEN"

# Save securely (1Password, LastPass, AWS Secrets Manager, etc.)
# DO NOT commit to git
# DO NOT share in Slack, email, or chat
```

### Storing the Token

#### For Local Development
Store in `.env.local` (ignored by git):
```bash
MCP_AUTH_TOKEN=your_64_character_hex_token_here
```

Load in your client:
```bash
# In shell
MCP_TOKEN=$(grep MCP_AUTH_TOKEN .env.local | cut -d= -f2)
curl -X POST ... -H "Authorization: Bearer $MCP_TOKEN"

# In Node.js
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const token = process.env.MCP_AUTH_TOKEN
```

#### For Cloudflare Workers (Production)
Store as a Cloudflare secret:
```bash
wrangler secret put MCP_AUTH_TOKEN --env production
# Paste your token when prompted
```

Wrangler encrypts the secret at rest and provides it to the worker at runtime.

#### For GitHub Actions
Store as a GitHub Actions secret:
```
Settings → Secrets and variables → Actions → New repository secret
Name: MCP_AUTH_TOKEN
Value: your_64_character_token
```

### Using the Token

In API requests, include the Authorization header:

```bash
curl -X POST https://linear-wordpress-mcp.lsh.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MCP_AUTH_TOKEN" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

In JavaScript/Node.js:
```javascript
const response = await fetch(
  'https://linear-wordpress-mcp.lsh.workers.dev/mcp',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MCP_AUTH_TOKEN}`
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list'
    })
  }
)
```

In Python:
```python
import requests
import os

token = os.getenv('MCP_AUTH_TOKEN')
headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {token}'
}

response = requests.post(
    'https://linear-wordpress-mcp.lsh.workers.dev/mcp',
    headers=headers,
    json={
        'jsonrpc': '2.0',
        'id': 1,
        'method': 'tools/list'
    }
)
```

## Token Rotation

Rotate tokens regularly to limit exposure window if compromised.

### Monthly Rotation Process

```bash
# 1. Generate new token
NEW_TOKEN=$(openssl rand -hex 32)

# 2. Update Cloudflare secrets
wrangler secret put MCP_AUTH_TOKEN --env production
# Paste: $NEW_TOKEN

wrangler secret put MCP_AUTH_TOKEN --env staging
# Paste: $NEW_TOKEN

# 3. Update GitHub Actions secrets
# Go to Settings → Secrets → MCP_AUTH_TOKEN
# Update the value

# 4. Update client configurations
# Update .claude/mcp.json
# Update .env files
# Update team's saved credentials

# 5. Notify team of new token
# Share via secure channel (1Password, password manager)

# 6. Verify deployment
wrangler deploy --env production
curl -X POST https://linear-wordpress-mcp.lsh.workers.dev/mcp \
  -H "Authorization: Bearer $NEW_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

### Emergency Token Rotation (If Compromised)

If you suspect the token was exposed:

```bash
# 1. Generate new token immediately
EMERGENCY_TOKEN=$(openssl rand -hex 32)

# 2. Update production immediately
wrangler secret put MCP_AUTH_TOKEN --env production
# Paste: $EMERGENCY_TOKEN

# 3. Verify it works
curl -X POST https://linear-wordpress-mcp.lsh.workers.dev/mcp \
  -H "Authorization: Bearer $EMERGENCY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'

# 4. Notify team immediately
# Share new token through secure channel only

# 5. Update all systems
# GitHub Actions secrets
# Client configurations
# Team credentials

# 6. Monitor logs for suspicious activity
wrangler tail --env production
```

## Authentication Errors

### 401 Unauthorized

**Cause**: Missing or invalid `Authorization` header

**Response**:
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32000,
    "message": "Unauthorized"
  },
  "id": null
}
```

**Fix**:
```bash
# Include the header
curl -X POST https://linear-wordpress-mcp.lsh.workers.dev/mcp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

### Invalid Token Format

**Cause**: Token doesn't match expected format

**Response**:
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32000,
    "message": "Unauthorized"
  },
  "id": null
}
```

**Fix**:
- Verify token is 64 hex characters: `echo -n $MCP_TOKEN | wc -c`
- Check header format: `Authorization: Bearer <token>` (with space)
- No quotes around token value

### Expired or Rotated Token

**Cause**: Token was rotated and old token no longer works

**Response**: 401 Unauthorized

**Fix**:
1. Get new token from team
2. Update in your client configuration
3. Test with new token

## Security Best Practices

### 1. Never Commit Tokens to Git

```bash
# Good - token in .env.local (ignored)
echo "MCP_AUTH_TOKEN=..." >> .env.local

# BAD - token committed to repo
echo "MCP_AUTH_TOKEN=..." >> .env
git add .env
git commit

# If you accidentally commit:
git filter-repo --path .env --invert-paths
git push --force-with-lease
# Regenerate and rotate the token immediately
```

### 2. Use Environment Variables

```bash
# Good
export MCP_AUTH_TOKEN="your_token"
curl -H "Authorization: Bearer $MCP_AUTH_TOKEN" ...

# BAD - token visible in shell history
curl -H "Authorization: Bearer abc123def456..." ...
```

### 3. Share Securely

```bash
# Good - 1Password, LastPass, AWS Secrets Manager
# Share link only, recipient retrieves from secure storage

# BAD - Slack, email, unencrypted chat
# Tokens exposed in message history and backups
```

### 4. Limit Token Scope

Each token should:
- Only access Linear and WordPress APIs
- Only be used for the MCP endpoint
- Not be reused for other services
- Not have write access beyond necessary

### 5. Monitor Usage

```bash
# Check endpoint logs
wrangler tail --env production

# Look for:
# - Unusual request patterns
# - Errors or failures
# - Authentication mismatches
# - Performance degradation
```

### 6. Rotation Schedule

- **Monthly**: Routine rotation (predictable schedule)
- **Quarterly**: Full review + rotation
- **Immediately**: If suspected compromise
- **On departure**: Rotate when team member leaves

## Integrating with 1Password

Store the token securely in 1Password for team access:

### Create 1Password Entry

1. Open 1Password
2. Create new item → "Password"
3. Fill in:
   - Name: "Linear-WordPress MCP Token"
   - Password: `$MCP_TOKEN`
   - URL: `https://linear-wordpress-mcp.lsh.workers.dev/mcp`
   - Tag: `api-token`
4. Share with team vault

### Retrieve in Scripts

```bash
# Install 1Password CLI: brew install 1password-cli
# Authenticate: op account add

TOKEN=$(op read "op://Team Vault/Linear-WordPress MCP Token/password")
curl -H "Authorization: Bearer $TOKEN" ...
```

## Integrating with AWS Secrets Manager

Store the token in AWS for production systems:

```bash
# Store token
aws secretsmanager create-secret \
  --name linear-wordpress-mcp-token \
  --secret-string "your_64_character_token"

# Retrieve in Lambda/code
import json
import boto3

client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='linear-wordpress-mcp-token')
token = secret['SecretString']
```

## Monitoring & Alerts

### Set Up Cloudflare Alerts

1. Cloudflare Dashboard → Workers → linear-wordpress-mcp
2. Go to Notifications
3. Create alerts for:
   - High error rate (> 5%)
   - Slow response times (> 2 seconds)
   - Script timeout errors
   - Authentication failures

### Log Analysis

```bash
# Get production logs
wrangler tail --env production --format json

# Look for:
# - 401 errors (auth failures)
# - Pattern changes
# - Unusual IPs or user agents
```

### Metrics to Track

- Requests per hour
- Error rate (401 vs other errors)
- Average response time
- 95th percentile latency
- Authentication success rate

## Troubleshooting

### Token works locally but not in Cloudflare

**Problem**: Local curl works, but deployed worker returns 401

**Solutions**:
1. Verify token is set in Cloudflare:
   ```bash
   wrangler secret list --env production
   ```
2. Check exact token value (copy-paste errors?)
3. Verify no extra whitespace in secret
4. Test with both staging and production

### Token doesn't work after rotation

**Problem**: New token returns 401

**Solutions**:
1. Verify new token was saved: `wrangler secret list`
2. Re-deploy: `wrangler deploy --env production`
3. Check token format: should be 64 hex characters
4. Clear any cached credentials in clients

### Team member can't authenticate

**Problem**: They have the token but still get 401

**Solutions**:
1. Verify they have the current token (not rotated)
2. Check Authorization header format (no extra spaces)
3. Check for encoding issues (UTF-8, not Unicode escapes)
4. Test with curl first, then in their client
5. Verify they're using production URL, not staging

### Logs show many 401 errors

**Problem**: Spike in authentication failures

**Solutions**:
1. Check if token was recently rotated
2. Verify all clients have new token
3. Check for automated systems using old token
4. Review Cloudflare rate limiting
5. Check for brute-force attempts (different IPs)
6. Rotate token immediately if suspicious

## References

- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)
- [HTTP Bearer Authentication (RFC 6750)](https://tools.ietf.org/html/rfc6750)
- [Cloudflare Secrets Management](https://developers.cloudflare.com/workers/platform/environment-variables/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
