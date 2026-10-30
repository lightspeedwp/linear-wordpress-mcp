# Testing Guide: Linear-WordPress MCP + Zendesk MCP

Complete guide for testing the multi-MCP setup with Zendesk integration.

---

## Quick Start: Testing Zendesk MCP

Your teammate deployed the Zendesk MCP at: **https://lightspeed-zendesk-mcp.lsh.workers.dev**

### Test 1: Verify Zendesk MCP is Live

```bash
curl -X POST https://lightspeed-zendesk-mcp.lsh.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

Expected response: JSON with available Zendesk tools

### Test 2: Add to Claude Code

1. Open Claude Code → Settings → MCPs
2. Click "Add MCP"
3. Configure:
   - **Type**: HTTP
   - **URL**: `https://lightspeed-zendesk-mcp.lsh.workers.dev/mcp`
4. Save and test

---

## Multi-MCP Setup Testing

### Prerequisites

1. **Linear API Key**
   - Go to Linear: Settings → API → Create personal API key
   - Copy the key (starts with `lin_api_`)

2. **WordPress Credentials**
   - WordPress admin: Users → App Passwords
   - Create new app password
   - Copy username + password

3. **Zendesk Access**
   - Already deployed at: `lightspeed-zendesk-mcp.lsh.workers.dev`
   - Should work immediately

### Step 1: Configure Local Environment

```bash
cd /Users/ash/Studio/linear-wordpress-mcp

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
# LINEAR_API_KEY=lin_api_xxx...
# WORDPRESS_REST_API_URL=https://yourdomain.com/wp-json/wp/v2
# WORDPRESS_AUTH_USER=admin
# WORDPRESS_AUTH_PASSWORD=xxxx xxxx xxxx xxxx
```

### Step 2: Build and Start Local MCP

```bash
# Build TypeScript
npm run build

# Start the MCP server
npm run dev
```

Expected output:
```
[MCP] Starting Linear-WordPress MCP server...
[MCP] Linear client initialized
[MCP] WordPress client initialized
[MCP] Server connected and ready
```

### Step 3: Add to Claude Code

**Option A: Both MCPs (Local + Remote)**

1. Edit `.claude/mcp.json` (already configured)
2. Add to Claude Code:
   - Linear-WordPress (local): stdio, `./dist/index.js`
   - Zendesk (remote): HTTP, `https://lightspeed-zendesk-mcp.lsh.workers.dev/mcp`

**Option B: Just Zendesk MCP**

```bash
curl -X POST https://lightspeed-zendesk-mcp.lsh.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

---

## Test Cases

### Test Group 1: Individual MCP Tests

#### Test 1A: List Linear-WordPress Tools

In Claude:
```
Show me all available tools from the Linear-WordPress MCP
```

Expected: 8 tools listed
- search_linear_issues
- get_linear_issue
- get_linear_teams
- create_linear_issue
- search_wordpress_posts
- get_wordpress_post
- create_wordpress_post
- link_issue_to_post

#### Test 1B: List Zendesk Tools

In Claude:
```
Show me all available tools from the Zendesk MCP
```

Expected: Zendesk tools listed (search_tickets, get_ticket, etc.)

#### Test 1C: Test Linear Functionality

In Claude:
```
Use the Linear-WordPress MCP to get my teams
```

Expected: Returns your Linear teams with IDs and names

#### Test 1D: Test WordPress Functionality

In Claude:
```
Search for "test" in my WordPress site using the Linear-WordPress MCP
```

Expected: Returns matching posts from your WordPress site

#### Test 1E: Test Zendesk Functionality

In Claude:
```
Use the Zendesk MCP to search for recent tickets
```

Expected: Returns recent Zendesk tickets

### Test Group 2: Cross-MCP Integration Tests

#### Test 2A: Correlation Workflow

In Claude:
```
1. Find recent Zendesk tickets about "payment"
2. Search for related issues in Linear
3. Search for related documentation in WordPress
4. Show me how they connect
```

Expected: Shows tickets, issues, and docs all together

#### Test 2B: Create and Link Workflow

In Claude:
```
1. Create a Linear issue for "Customer payment timeout"
2. Create a WordPress post explaining the solution
3. Link the two together
4. Create a Zendesk ticket about this for tracking
```

Expected: All three items created and linked

#### Test 2C: Multi-System Search

In Claude:
```
Find all references to "authentication" across:
- Zendesk support tickets
- Linear issues
- WordPress documentation
```

Expected: Aggregated results from all three systems

---

## Verification Checklist

### For Local Linear-WordPress MCP

- [ ] `npm install` completes without errors
- [ ] `npm run build` produces `dist/index.js`
- [ ] `npm run dev` shows both clients initialized
- [ ] Linear tools list 8 tools
- [ ] WordPress tools are available
- [ ] Test Linear query returns results
- [ ] Test WordPress query returns results

### For Remote Zendesk MCP

- [ ] Endpoint responds to `/mcp` POST requests
- [ ] `tools/list` returns Zendesk tools
- [ ] Zendesk queries return results
- [ ] No authentication errors

### For Multi-MCP Setup

- [ ] Both MCPs show in Claude Code settings
- [ ] Tools from both MCPs appear in Claude
- [ ] Can use Linear tools in same conversation as Zendesk
- [ ] Can use WordPress tools in same conversation as Zendesk
- [ ] Cross-MCP workflows work (e.g., ticket → issue → doc)

---

## Troubleshooting

### Linear-WordPress MCP Issues

**Problem**: `npm install` fails
```
Solution: Check Node.js version (18+), clear cache:
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Build fails with TypeScript errors
```
Solution: Rebuild from scratch:
npm run build
```

**Problem**: Server doesn't start
```
Solution: Check environment variables:
echo $LINEAR_API_KEY
echo $WORDPRESS_REST_API_URL
# Both should be set
```

**Problem**: Linear client not initializing
```
Solution: Verify API key:
- Check starts with lin_api_
- Check hasn't expired
- Generate new key in Linear Settings
```

**Problem**: WordPress client not initializing
```
Solution: Verify WordPress credentials:
- Check REST API endpoint format
- Verify username (not email)
- Use Application Password, not login password
- Enable REST API in WordPress Plugins
```

### Zendesk MCP Issues

**Problem**: 404 on endpoint
```
Solution: Verify URL:
https://lightspeed-zendesk-mcp.lsh.workers.dev/mcp
(not just domain, must include /mcp)
```

**Problem**: Connection timeout
```
Solution: Check network access:
curl -I https://lightspeed-zendesk-mcp.lsh.workers.dev
# Should get 200 OK
```

**Problem**: Zendesk MCP returns errors
```
Solution: Check Zendesk MCP logs from teammate
- May need to restart the worker
- May need to check Cloudflare Worker status
```

### Multi-MCP Issues

**Problem**: Tools from only one MCP showing
```
Solution: Check .claude/mcp.json:
1. Both MCPs should be listed
2. Check neither is marked "disabled": true
3. Restart Claude Code
4. Re-verify MCP connections
```

**Problem**: Cross-MCP queries fail
```
Solution: Test each MCP individually first:
1. Test Linear-WordPress MCP alone
2. Test Zendesk MCP alone
3. Then test together
```

---

## Test Results Template

Use this to document your testing:

```
## Test Execution - [DATE]

### Linear-WordPress MCP (Local)
- [ ] NPM install: ✓/✗
- [ ] Build: ✓/✗
- [ ] Server starts: ✓/✗
- [ ] Tools list (8): ✓/✗
- [ ] Linear query works: ✓/✗
- [ ] WordPress query works: ✓/✗

### Zendesk MCP (Remote)
- [ ] Endpoint responds: ✓/✗
- [ ] Tools list returns results: ✓/✗
- [ ] Query works: ✓/✗

### Multi-MCP Integration
- [ ] Both MCPs in Claude Code: ✓/✗
- [ ] Both tool sets available: ✓/✗
- [ ] Cross-MCP workflow works: ✓/✗

### Issues Found
1. [List any blockers]

### Verified Working
1. [List what works]
```

---

## Next Steps After Testing

1. ✅ Verify local Linear-WordPress MCP works
2. ✅ Verify remote Zendesk MCP works
3. ✅ Test multi-MCP setup in Claude Code
4. Deploy Linear-WordPress MCP (to Cloudflare Workers like Zendesk)
5. Document team workflows
6. Train team on multi-MCP usage
7. Create standard workflows as Claude Code skills

---

## Resources

- [Linear API Docs](https://developers.linear.app/)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [Zendesk MCP](https://lightspeed-zendesk-mcp.lsh.workers.dev)
- [Multi-MCP Guide](./INTEGRATION_PLANNING.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Claude Code Instructions](./.claude/instructions.md)
