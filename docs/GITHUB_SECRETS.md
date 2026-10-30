# GitHub Secrets Setup Guide

Step-by-step instructions for configuring GitHub Actions secrets for automatic Cloudflare Workers deployment.

## Overview

The Linear-WordPress MCP uses GitHub Actions to automatically deploy to Cloudflare Workers whenever you push to the main branch. This requires 7 secrets to be configured in your GitHub repository.

## Required Secrets

| Secret | Source | Format | Example |
|--------|--------|--------|---------|
| CLOUDFLARE_API_TOKEN | Cloudflare Dashboard | API Token | c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6 |
| LINEAR_API_KEY | Linear Settings | API Key | lin_api_xxx... |
| WORDPRESS_REST_API_URL | Your WordPress site | Full URL | https://example.com/wp-json |
| WORDPRESS_AUTH_USER | WordPress admin | Username/email | admin@example.com |
| WORDPRESS_AUTH_PASSWORD | WordPress profile | App Password | xxxx xxxx xxxx xxxx xxxx |
| MCP_AUTH_TOKEN | Generated locally | 64-char hex | abc123def456... |
| USER_EMAIL | Your email | Email address | ashley@lightspeedwp.agency |

## Step-by-Step Setup

### 1. Create Cloudflare API Token

**URL**: https://dash.cloudflare.com/profile/api-tokens

1. Click "Create Token"
2. Select "Edit Cloudflare Workers" template
3. Click "Use template"
4. Configure:
   - **Token name**: "GitHub Actions Deploy"
   - **Permissions**: 
     - Account → Workers Namespace → Edit
     - Account → Workers Routes → Edit
     - Account → Workers Scripts → Edit
   - **Account Resources**: All accounts
   - **TTL**: 12 months (or your preference)
5. Click "Continue to summary"
6. Click "Create Token"
7. **Copy the token immediately** (only shown once)

Your token looks like: `c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6abcdef1234567890`

### 2. Gather Linear API Key

**URL**: https://linear.app/settings/api

1. Under "Personal API keys", click "Generate new key"
2. Copy the key (format: `lin_api_...`)

Keep this secure - it grants full access to your Linear workspace.

### 3. Gather WordPress Credentials

#### REST API URL
Your WordPress site's REST API endpoint:
```
https://yoursite.com/wp-json
```

Common WordPress installations:
- Hosted WordPress: `https://yoursite.wordpress.com/wp-json`
- Self-hosted: `https://yoursite.com/wp-json`
- Subdirectory: `https://example.com/blog/wp-json`

#### Application Password

**URL**: `https://youwordpresssite.com/wp-admin/profile.php`

1. Scroll to "Application Passwords" section
2. Enter "Linear MCP" as the name
3. Click "Generate Application Password"
4. **Copy the password immediately** (only shown once)

⚠️ **Important**: This is NOT your WordPress login password. Application passwords are special tokens that can be revoked independently.

Your password looks like: `xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx`

### 4. Generate MCP Authentication Token

Run locally:

```bash
MCP_TOKEN=$(openssl rand -hex 32)
echo "Your MCP_AUTH_TOKEN: $MCP_TOKEN"
```

This generates a 64-character random hex string for API authentication.

### 5. Add Secrets to GitHub

**URL**: https://github.com/lightspeedwp/linear-wordpress-mcp/settings/secrets/actions

#### Method 1: Web UI (Recommended for first-time setup)

1. Click "New repository secret"
2. For each secret below, repeat these steps:
   - Name: (exact name from list below)
   - Value: (paste the value)
   - Click "Add secret"

#### Method 2: GitHub CLI

```bash
# Install GitHub CLI if needed: brew install gh
# Authenticate: gh auth login

gh secret set CLOUDFLARE_API_TOKEN --body "c1d2e3f4..."
gh secret set LINEAR_API_KEY --body "lin_api_..."
gh secret set WORDPRESS_REST_API_URL --body "https://example.com/wp-json"
gh secret set WORDPRESS_AUTH_USER --body "admin@example.com"
gh secret set WORDPRESS_AUTH_PASSWORD --body "xxxx xxxx xxxx xxxx..."
gh secret set MCP_AUTH_TOKEN --body "abc123def456..."
gh secret set USER_EMAIL --body "ashley@lightspeedwp.agency"

# Verify
gh secret list
```

### Secret Details

#### 1. CLOUDFLARE_API_TOKEN

**From**: Cloudflare Dashboard → API Tokens

```
Name: CLOUDFLARE_API_TOKEN
Value: c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6abcdef1234567890
Permissions: Workers Scripts Edit, Workers Routes Edit, Workers Namespace Edit
```

#### 2. LINEAR_API_KEY

**From**: Linear Settings → API

```
Name: LINEAR_API_KEY
Value: lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Scope: Full access to workspace
```

#### 3. WORDPRESS_REST_API_URL

**From**: Your WordPress site configuration

```
Name: WORDPRESS_REST_API_URL
Value: https://yoursite.com/wp-json
```

Common mistakes:
- ❌ Missing protocol: `yoursite.com/wp-json`
- ❌ With trailing slash: `https://yoursite.com/wp-json/`
- ❌ Wrong path: `https://yoursite.com/api`
- ✅ Correct: `https://yoursite.com/wp-json`

#### 4. WORDPRESS_AUTH_USER

**From**: WordPress admin account

```
Name: WORDPRESS_AUTH_USER
Value: admin@yoursite.com
```

Can be either:
- Username (e.g., `admin`)
- Email address (e.g., `admin@example.com`)

#### 5. WORDPRESS_AUTH_PASSWORD

**From**: WordPress Application Password (see Step 3)

```
Name: WORDPRESS_AUTH_PASSWORD
Value: xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx
```

⚠️ This is the app password, NOT your WordPress login password.

#### 6. MCP_AUTH_TOKEN

**From**: Generated locally (see Step 4)

```
Name: MCP_AUTH_TOKEN
Value: abc123def456abc123def456abc123def456abc123def456abc123def456abc1
```

Should be exactly 64 characters of lowercase hex (0-9, a-f).

#### 7. USER_EMAIL

**From**: Your email address

```
Name: USER_EMAIL
Value: ashley@lightspeedwp.agency
```

Used for logging and identification in Cloudflare Workers logs.

## Verification Checklist

After adding all secrets, verify they're correctly configured:

```bash
# List all secrets (values are masked)
gh secret list

# You should see all 7 secrets listed
```

Each secret should show:
```
CLOUDFLARE_API_TOKEN        Updated 2026-10-30
LINEAR_API_KEY              Updated 2026-10-30
WORDPRESS_REST_API_URL      Updated 2026-10-30
WORDPRESS_AUTH_USER         Updated 2026-10-30
WORDPRESS_AUTH_PASSWORD     Updated 2026-10-30
MCP_AUTH_TOKEN              Updated 2026-10-30
USER_EMAIL                  Updated 2026-10-30
```

## Testing the Workflow

### Trigger Deployment Manually

```bash
# Push to main or create a pull request
git push origin main

# Watch the workflow
# Go to: https://github.com/lightspeedwp/linear-wordpress-mcp/actions
# Click the latest workflow run
```

### Expected Workflow Steps

1. ✅ Checkout code
2. ✅ Setup Node.js
3. ✅ Install dependencies
4. ✅ Build project
5. ✅ Run tests
6. ✅ Deploy to staging
7. ✅ Test staging endpoint
8. ✅ Deploy to production (if on main branch)
9. ✅ Test production endpoint

### What Success Looks Like

```
✓ Build project
✓ Run tests  
✓ Deploy to Staging (2m 15s)
✓ Test Staging Deployment
  HTTP Status: 200
✓ Deploy to Production (2m 18s)
✓ Test Production Deployment
  HTTP Status: 200
✓ Deployment Summary
```

## Troubleshooting

### Workflow Fails: "Authentication failed"

**Cause**: Invalid Cloudflare API token

**Solution**:
1. Verify token in Cloudflare Dashboard → API Tokens
2. Check token hasn't expired or been revoked
3. Update secret: `gh secret set CLOUDFLARE_API_TOKEN --body "new_token"`
4. Retrigger workflow

### Workflow Fails: "Deployment: 401 Unauthorized"

**Cause**: Invalid Linear or WordPress credentials

**Solution**:
1. Test credentials locally first:
   ```bash
   # Test Linear
   curl -H "Authorization: Bearer $LINEAR_API_KEY" \
     https://api.linear.app/graphql \
     -d '{"query": "{ teams { nodes { name } } }"}'
   ```
2. Verify secrets match exactly (no extra spaces)
3. For WordPress: confirm application password format (xxxx xxxx xxxx...)
4. Update the relevant secret

### Workflow Fails: "No such secret"

**Cause**: Secret name doesn't match

**Solution**:
1. Check GitHub Actions workflow file for exact secret name
2. Verify secret exists: `gh secret list`
3. Spelling must match exactly (case-sensitive)

### Staging Deploys but Production Doesn't

**Cause**: Production workflow only runs on `main` branch

**Solution**:
1. Merge PR to main branch
2. Check that commit is on main: `git log --oneline main | head -1`
3. Re-push to trigger: `git push origin main`

### Tests Pass Locally but Fail in GitHub Actions

**Cause**: Environment differences

**Common issues**:
- Different Node.js version (check `.github/workflows/deploy-workers.yml`)
- Missing environment variable in workflow
- Cache/dependency issues

**Solution**:
```bash
# Check Node version locally
node --version

# Update in workflow if different
uses: actions/setup-node@v4
  with:
    node-version: '20'  # Match your local version

# Clear cache and retry
# Go to Actions tab → all workflows → Clear all caches
```

### "Secret value is invalid"

**Cause**: Secret value has invalid characters or format

**Solution**:
1. Verify you copied the entire value (no truncation)
2. Check for extra spaces or newlines
3. For Linear key: should start with `lin_api_`
4. For password: should have spaces between groups (xxxx xxxx...)
5. Delete and recreate the secret

## Updating Secrets

### Regular Maintenance

Update secrets when:
- API token expires or is revoked
- WordPress password changes
- Team member rotation (especially for auth tokens)
- Quarterly security review (rotate MCP_AUTH_TOKEN)

```bash
# Update a secret
gh secret set SECRET_NAME --body "new_value"

# Delete a secret (if needed)
gh secret delete SECRET_NAME
```

### Emergency Rotation

If a secret is compromised:

```bash
# 1. Generate new value
NEW_VALUE=$(openssl rand -hex 32)

# 2. Update immediately
gh secret set MCP_AUTH_TOKEN --body "$NEW_VALUE"

# 3. Trigger deployment (uses new secret)
git push origin main --force-if-necessary

# 4. Verify working
# Check GitHub Actions workflow completes successfully
```

## Security Notes

### What GitHub Can Access

- All secrets are encrypted at rest
- Only GitHub Actions workflows can read secrets
- Values are masked in logs
- Secrets are only available to authorized branches/workflows

### What We Recommend

✅ **Do**:
- Rotate MCP_AUTH_TOKEN monthly
- Use application passwords for WordPress (not login password)
- Limit API token permissions (minimum required)
- Monitor workflow runs for failures
- Use GitHub's security log to audit secret access

❌ **Don't**:
- Share secrets in pull requests or comments
- Commit secrets to git
- Use personal access tokens (use application-specific ones)
- Reuse secrets across projects
- Skip rotation

## Support

- **Cloudflare**: https://support.cloudflare.com/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Linear API**: https://linear.app/docs
- **WordPress REST API**: https://developer.wordpress.org/rest-api/

## Next Steps

1. ✅ Add all 7 secrets to GitHub
2. ✅ Verify secrets are set: `gh secret list`
3. ✅ Push to main to trigger workflow
4. ✅ Monitor first deployment in GitHub Actions tab
5. ✅ Test production endpoint with MCP_AUTH_TOKEN
6. ✅ Share endpoint URL and token with team securely
