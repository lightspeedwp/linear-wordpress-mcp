# Linear-WordPress MCP - Claude Code Setup

This document explains how to set up and use this MCP with Claude Code.

## Prerequisites

- Claude Code (desktop app)
- Node.js 18+
- Test credentials for Linear and WordPress APIs

## Setup Steps

### 1. Configure Environment Variables

Create a `.env` file in the project root with test credentials:

```bash
cp .env.example .env

# Edit .env and fill in:
LINEAR_API_KEY=lin_api_xxx...
WORDPRESS_REST_API_URL=https://yourdomain.com/wp-json/wp/v2
WORDPRESS_AUTH_USER=admin
WORDPRESS_AUTH_PASSWORD=xxxx xxxx xxxx xxxx
```

### 2. Build the Project

```bash
npm install
npm run build
```

### 3. Add to Claude Code

Two options:

#### Option A: Use Local MCP Configuration
1. Copy `.claude/mcp.json` to your Claude Code config
2. Or manually add the MCP in Claude Code Settings → MCPs
3. Set environment variables in the MCP settings

#### Option B: Use Remote Zendesk MCP Only
The Zendesk MCP is already deployed at: https://lightspeed-zendesk-mcp.lsh.workers.dev

## Testing Multi-MCP Setup

### Test 1: List Available Tools

In Claude:
```
What tools are available from both MCPs?
```

Expected: Tools from both Linear-WordPress and Zendesk MCPs should be listed.

### Test 2: Simple Linear Query

In Claude:
```
Get my Linear teams using the Linear-WordPress MCP
```

Expected: Should return your Linear workspace teams.

### Test 3: Simple WordPress Query

In Claude:
```
Search for "test" posts on my WordPress site
```

Expected: Should return matching posts from your site.

### Test 4: Cross-MCP Workflow

In Claude:
```
1. Find a support ticket in Zendesk mentioning "payment"
2. Search for related Linear issues
3. Search for documentation in WordPress
4. Show me all three together
```

Expected: Shows integrated results from all systems.

## Configuration Files

The `.github/` folder contains org-wide configuration:

- `branch-labels.yml` - GitHub branch labels
- `branch-types.yml` - Branch naming conventions
- `changelog-rules.yml` - Changelog generation rules
- `issue-types.yml` - Issue type definitions
- `labeler.yml` - Automatic PR/issue labeling
- `labels.yml` - GitHub labels

These are synced from: https://github.com/lightspeedwp/.github

## Troubleshooting

### Linear Client Not Connecting
- Verify `LINEAR_API_KEY` is set and valid
- Check API key starts with `lin_api_`
- Ensure the key hasn't expired

### WordPress Client Not Connecting
- Verify `WORDPRESS_REST_API_URL` format: `https://site.com/wp-json/wp/v2`
- Check username is correct (not email)
- Use Application Password, not regular login password
- Verify REST API is enabled in WordPress

### Zendesk MCP Not Responding
- Check URL: https://lightspeed-zendesk-mcp.lsh.workers.dev/mcp
- Verify network access to the endpoint
- Check if Zendesk MCP is deployed and running

### MCP Tools Not Showing in Claude

1. Restart Claude Code completely
2. Check MCP connection status in Settings → MCPs
3. Verify `.claude/mcp.json` is correctly formatted
4. Check MCP server logs for errors

## Next Steps

1. Test individual MCPs first (Linear-WordPress, then Zendesk)
2. Test simple queries from each
3. Test cross-MCP workflows
4. Deploy to team environment
5. Document team workflows

## Resources

- [Linear-WordPress MCP README](./README.md)
- [Multi-MCP Integration Guide](./INTEGRATION_PLANNING.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Zendesk MCP](https://lightspeed-zendesk-mcp.lsh.workers.dev)
