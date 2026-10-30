# Linear-WordPress MCP Setup Guide

Complete guide to setting up the Linear-WordPress MCP and using it with Claude.

## Prerequisites

- Node.js 18+ and npm
- Linear workspace with API access
- WordPress site with REST API enabled
- Claude Code or Claude desktop app

## Step 1: Get Credentials

### Linear API Key

1. Open Linear: https://linear.app
2. Click your profile icon (bottom left) → **Settings**
3. Navigate to **API** section
4. Click **Create personal API key**
5. Give it a name like "Claude MCP" and click **Create**
6. Copy the key (starts with `lin_api_`)

### WordPress REST API Credentials

1. Log in to your WordPress admin dashboard
2. Go to **Users** → **Your Profile** (or target user)
3. Scroll down to **Application Passwords** section
4. Enter an app name: "Linear MCP"
5. Click **Create Application Password**
6. Copy the generated password (16 characters in groups)
7. Note your username (usually shown in the same section)

### WordPress REST API URL

The REST API URL follows this pattern:
- **Default**: `https://yourdomain.com/wp-json/wp/v2`
- **With subdirectory**: `https://yourdomain.com/blog/wp-json/wp/v2`
- **Local**: `http://localhost:8888/wp-json/wp/v2`

Test it by visiting: `https://yourdomain.com/wp-json/wp/v2/posts?per_page=1` in your browser

## Step 2: Install and Configure MCP

### Option A: Build from Source (Recommended for Development)

```bash
# Clone the repository
git clone https://github.com/lightspeedwp/linear-wordpress-mcp.git
cd linear-wordpress-mcp

# Install dependencies
npm install

# Build
npm run build

# Create .env file with your credentials
cp .env.example .env
nano .env  # Edit with your actual credentials
```

### Option B: Use with Claude Code

1. Open Claude Code
2. Go to **Settings** → **MCPs** → **Add MCP**
3. Choose **From GitHub URL** if available
4. Set environment variables in the MCP settings

## Step 3: Test the Connection

### Using Node.js

```bash
# Start the MCP server (use Ctrl+C to stop)
npm run dev
```

The server should output:
```
[MCP] Starting Linear-WordPress MCP server...
[MCP] Linear client initialized
[MCP] WordPress client initialized
[MCP] Server connected and ready
```

### In Claude

Once the MCP is running, test it in a Claude conversation:

```
Claude: Can you list all the teams in my Linear workspace?

[You should see your Linear teams returned]

Claude: Search for blog posts about "authentication"

[You should see matching WordPress posts]
```

## Step 4: Integrate with Claude

### In Claude Code Desktop App

1. Open **Settings** → **MCPs**
2. Click **+ Add MCP**
3. Choose **Custom** or **From Repository**
4. Configure the MCP with your environment variables
5. The MCP will be available in all Claude conversations

### In Claude Web (claude.ai)

MCPs are not directly available in the web version, but you can:
1. Use Claude Code for MCP access
2. Run the MCP server and expose it via HTTP
3. Configure Claude to connect to the remote MCP

## Step 5: Multi-MCP Setup

The Linear-WordPress MCP is designed to work with other MCPs simultaneously.

### Configure Multiple MCPs in Claude Code

Create or edit `.claude/mcp_config.json` (or use Settings UI):

```json
{
  "mcps": {
    "linear-wordpress": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/linear-wordpress-mcp/dist/index.js"],
      "env": {
        "LINEAR_API_KEY": "lin_api_xxx...",
        "WORDPRESS_REST_API_URL": "https://myblog.com/wp-json/wp/v2",
        "WORDPRESS_AUTH_USER": "admin",
        "WORDPRESS_AUTH_PASSWORD": "xxxx xxxx xxxx..."
      }
    },
    "zendesk": {
      "type": "http",
      "url": "https://zendesk-mcp.example.com/mcp"
    },
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"]
    }
  }
}
```

### Using Multiple MCPs in Conversations

Claude automatically makes all tools from all MCPs available:

```
Claude: Search for authentication bugs in Linear, 
        find related GitHub issues, 
        and list related Zendesk support tickets

[Claude will use linear-wordpress, github, and zendesk MCPs together]
```

## Common Workflows

### Workflow 1: Document a Bug Fix

```
Claude: 
1. Find the "login fails on mobile" issue in Linear
2. Create a WordPress blog post explaining the fix
3. Link them together

[Claude will:
  - search_linear_issues("login fails on mobile")
  - get_linear_issue(issue_id)
  - create_wordpress_post(title="...", content="...")
  - link_issue_to_post(issue_id, post_id)
]
```

### Workflow 2: Track Feature Development

```
Claude:
1. Search WordPress for "reporting" posts
2. Find corresponding Linear issues
3. Create new issue if one doesn't exist
4. Link them together

[Uses search_wordpress_posts + create_linear_issue + link_issue_to_post]
```

### Workflow 3: Multi-Service Integration

```
Claude:
Use Linear, WordPress, and Zendesk MCPs to:
1. Find recent WordPress release posts
2. Link to Linear milestones
3. Find related Zendesk support tickets
4. Create summary for team

[Combines all three MCPs in one workflow]
```

## Troubleshooting

### "Linear client not configured"

**Problem**: Getting this error when calling Linear tools.

**Solution**:
1. Verify `LINEAR_API_KEY` is set in environment
2. Check the key starts with `lin_api_`
3. Test the key in Linear: Settings → API → "Test" (if available)
4. Regenerate the key if unsure

### "WordPress returned 401"

**Problem**: Authentication failing for WordPress.

**Solution**:
1. Verify username is correct
2. Confirm password is Application Password (not regular password)
3. Check REST API is enabled (WordPress → Plugins)
4. Verify user has REST API permissions
5. Test by visiting the API URL in browser with Basic Auth

### "WordPress returned 404"

**Problem**: Wrong REST API URL.

**Solution**:
1. Check the REST API URL format
2. For custom post types, URL might be different
3. Test: `curl https://yourdomain.com/wp-json/wp/v2/posts`
4. If using Nginx, verify `index.php` is accessible

### Tools not showing in Claude

**Problem**: MCP is connected but tools aren't available.

**Solution**:
1. Restart Claude completely
2. Check MCP logs in Claude settings
3. Verify environment variables are set
4. Confirm both clients initialized successfully

### Rate limiting

**Problem**: Getting 429 errors.

**Solution**:
1. Linear: 100 requests/minute per API key
2. WordPress: Depends on server config
3. Space out requests or batch operations
4. Use pagination (per_page parameter)

## Environment Variables Reference

| Variable | Required | Type | Example |
|----------|----------|------|---------|
| LINEAR_API_KEY | Yes | Secret | lin_api_abc123xyz |
| WORDPRESS_REST_API_URL | Yes | URL | https://site.com/wp-json/wp/v2 |
| WORDPRESS_AUTH_USER | Yes | String | admin |
| WORDPRESS_AUTH_PASSWORD | Yes | Secret | xxxx xxxx xxxx xxxx |
| USER_EMAIL | No | Email | user@example.com |

## Performance Tips

1. **Use specific searches** - More specific queries are faster
2. **Limit results** - Use `per_page` parameter to limit data
3. **Batch operations** - Link multiple issues in one conversation
4. **Cache locally** - Store frequently accessed data
5. **Filter by team** - When searching Linear, specify team if possible

## Security Best Practices

1. **Never commit credentials** - Use `.env` file (already in `.gitignore`)
2. **Use application passwords** - WordPress: never use your main password
3. **Rotate keys periodically** - Generate new Linear API keys quarterly
4. **Limit permissions** - In Linear, use read-only keys if possible
5. **Use HTTPS** - All API calls must use HTTPS
6. **Audit logs** - Set USER_EMAIL to track who made changes

## Advanced Configuration

### Using with Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["node", "dist/index.js"]
```

```bash
docker run -e LINEAR_API_KEY=xxx -e WORDPRESS_REST_API_URL=xxx \
  -e WORDPRESS_AUTH_USER=xxx -e WORDPRESS_AUTH_PASSWORD=xxx \
  linear-wordpress-mcp
```

### Using with Environment Variables File

```bash
# Create .env.local
source .env.local
npm run dev
```

### Remote Server Deployment

For deploying the MCP server on a remote machine:

```bash
# On remote server
npm install
npm run build
# Create systemd service or PM2 config
pm2 start dist/index.js --name "linear-wp-mcp"
```

Then connect from Claude to the remote server's stdio or HTTP endpoint.

## Need Help?

1. Check the troubleshooting section above
2. Review logs in Claude settings
3. Open an issue on GitHub
4. Check Linear and WordPress documentation
5. Verify credentials are correct

## Next Steps

- [Read the full API reference](./README.md)
- [View tool documentation](./README.md#available-tools)
- [Set up additional MCPs](https://modelcontextprotocol.io/)
- [Configure automation workflows](./docs/workflows.md)
