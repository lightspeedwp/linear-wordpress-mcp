# Multi-MCP Support Guide

How to run the Linear-WordPress MCP alongside other MCPs and use them together in Claude conversations.

## What is Multi-MCP Support?

Multi-MCP support allows you to run multiple MCP servers simultaneously, with all their tools available in a single Claude conversation. Claude automatically routes requests to the appropriate MCP based on the tool being called.

## Architecture

```
┌─────────────────────────────────────────┐
│       Claude Conversation               │
│  (All tools from all MCPs available)    │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴──────────┬──────────┐
    │                     │          │
┌───▼──────────────┐ ┌───▼────────┐ ┌──▼────────────┐
│ Linear-WordPress │ │   Zendesk  │ │    GitHub     │
│      MCP         │ │    MCP     │ │     MCP       │
│                  │ │            │ │               │
│ • Linear Client  │ │ • Zendesk  │ │ • GitHub      │
│ • WordPress      │ │   Client   │ │   Client      │
│   Client         │ │            │ │               │
└────┬────────────┘ └──┬─────────┘ └───┬──────────┘
     │                 │               │
  ┌──▼─────┐       ┌───▼──┐        ┌──▼─────┐
  │ Linear  │       │      │        │ GitHub │
  │ GraphQL │       │  API │        │   API  │
  │   API   │       │      │        │        │
  └────────┘       └──────┘        └────────┘
```

## Supported MCP Combinations

### With Zendesk MCP

**Zendesk MCP**: https://github.com/lightspeedwp/zendesk-mcp

Use together to bridge customer support with internal tracking:

```
Zendesk Ticket → Link to → Linear Issue → Link to → WordPress Documentation
```

**Combined Tools**:
- Search Zendesk tickets + Linear issues
- Create issues from tickets
- Document solutions
- Track customer impact

**Example Workflow**:
```
Claude:
1. Find "payment integration" support tickets in Zendesk
2. Search for related issues in Linear
3. Create WordPress post documenting the solution
4. Link all three together

Result:
- Customers see solution in KB
- Support team has context
- Product team sees issue status
```

### With GitHub MCP

**GitHub MCP**: https://modelcontextprotocol.io/servers

Use together to link code changes to issues and documentation:

```
GitHub PR → Link to → Linear Issue → Link to → WordPress Release Notes
```

**Combined Tools**:
- Search GitHub PRs
- Link to Linear milestones
- Generate documentation
- Create release notes

**Example Workflow**:
```
Claude:
1. Find closed GitHub PRs in "feat" category
2. Search Linear for related issues
3. Extract PR descriptions and create blog post
4. Link all together

Result:
- Release notes auto-generated
- Team knows what shipped
- Customers informed
```

### With Slack MCP

**Slack MCP**: Included in Claude Code

Use together to announce and track decisions:

```
Slack Discussion → Create → Linear Issue → Document in → WordPress
```

**Combined Tools**:
- Post updates to Slack
- Create Linear issues from discussions
- Create documentation automatically
- Announce in channels

### With Multiple WordPress Instances

Run multiple instances of this MCP with different WordPress sites:

```
WordPress A (Blog)    Linear    WordPress B (Docs)
      ↓              ↙  ↓  ↖         ↓
   MCP Config A → Linear-WP → MCP Config B
                     ↑
                  Claude
```

## Setting Up Multiple MCPs

### Option 1: Using Claude Code Desktop

1. **Open Settings → MCPs**

2. **Click + Add MCP** for each service:
   - Linear-WordPress MCP
   - Zendesk MCP
   - GitHub MCP
   - Others as needed

3. **Configure Environment Variables**:
   - Each MCP has its own env var section
   - Set credentials for each service
   - Verify connections

4. **Verify All MCPs Connect**:
   - Look for green checkmarks
   - No red error indicators
   - Message shows "Ready"

### Option 2: Manual Configuration

Edit `.claude/mcp_config.json`:

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
        "WORDPRESS_AUTH_PASSWORD": "xxxx xxxx xxxx"
      }
    },
    "zendesk": {
      "type": "http",
      "url": "https://zendesk-mcp-instance.example.com:8080/mcp"
    },
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_xxx..."
      }
    }
  }
}
```

### Option 3: Docker Compose

Run all MCPs in containers:

```yaml
version: '3.8'
services:
  linear-wordpress:
    build: ./linear-wordpress-mcp
    environment:
      LINEAR_API_KEY: ${LINEAR_API_KEY}
      WORDPRESS_REST_API_URL: ${WORDPRESS_REST_API_URL}
      WORDPRESS_AUTH_USER: ${WORDPRESS_AUTH_USER}
      WORDPRESS_AUTH_PASSWORD: ${WORDPRESS_AUTH_PASSWORD}
    ports:
      - "8001:3000"

  zendesk:
    image: lightspeed/zendesk-mcp:latest
    environment:
      ZENDESK_API_KEY: ${ZENDESK_API_KEY}
      ZENDESK_SUBDOMAIN: ${ZENDESK_SUBDOMAIN}
    ports:
      - "8002:3000"

  github:
    image: github-mcp:latest
    environment:
      GITHUB_TOKEN: ${GITHUB_TOKEN}
    ports:
      - "8003:3000"
```

## Multi-MCP Workflows

### Workflow 1: Full Ticket-to-Documentation Pipeline

**Services**: Zendesk + Linear-WordPress + GitHub

```
Claude:
Search for "payment" tickets in Zendesk, 
find related issues in Linear,
check related PRs on GitHub,
create blog post documenting solution,
link everything together

Steps:
1. search_zendesk_tickets("payment")
   → Found: TICKET-123, TICKET-456

2. search_linear_issues("payment")
   → Found: LIN-789, LIN-790

3. search_github_prs("payment fix")
   → Found: PR #1234, PR #1235

4. create_wordpress_post(
     title="Payment Integration Fix",
     content="..."
   )
   → Created: POST-567

5. link_issue_to_post(LIN-789, 567)
6. link_issue_to_post(LIN-790, 567)
   → All linked
```

Result: Customer issue → Internal tracking → Code → Documentation

### Workflow 2: Release Coordination

**Services**: GitHub + Linear-WordPress + Slack

```
Claude:
1. Get merged PRs from GitHub
2. Create Linear release milestone
3. Create blog post announcing release
4. Post announcement to Slack
5. Link everything

Tools used:
- github: get_merged_prs()
- linear: create_linear_issue()
- wordpress: create_wordpress_post()
- slack: send_message()
- linear_wordpress: link_issue_to_post()
```

### Workflow 3: Content-Driven Development

**Services**: WordPress + Linear + GitHub

```
Claude:
1. Find WordPress posts in "features" category
2. Search Linear for implementation issues
3. Check GitHub for PRs
4. Create consolidated status report

Result: You see what's documented, what's in progress, what's shipped
```

### Workflow 4: Multi-WordPress + Linear + Zendesk

**Services**: Linear-WordPress (x2) + Zendesk

```
WordPress A (Public Blog)
    ↓
Linear Issues ← Zendesk Tickets
    ↓
WordPress B (Internal Wiki)
```

Configuration:
```json
{
  "mcps": {
    "linear-wordpress-blog": {
      "env": {
        "WORDPRESS_REST_API_URL": "https://blog.example.com/wp-json/wp/v2"
      }
    },
    "linear-wordpress-wiki": {
      "env": {
        "WORDPRESS_REST_API_URL": "https://wiki.example.com/wp-json/wp/v2"
      }
    },
    "zendesk": { /* zendesk config */ }
  }
}
```

## Tool Naming & Conflicts

All MCPs use unique tool names to avoid conflicts:

| MCP | Prefix | Example |
|-----|--------|---------|
| Linear-WordPress | `search_linear_`, `create_wordpress_`, etc. | `search_linear_issues` |
| Zendesk | `get_ticket_`, `search_tickets_`, etc. | `search_tickets` |
| GitHub | `search_repos_`, `create_pull_request_`, etc. | `search_repos` |

**No naming conflicts** - Claude can distinguish which tool belongs to which MCP.

## Troubleshooting Multi-MCP Setup

### One MCP not connecting

**Problem**: Some MCPs show errors while others work.

**Solution**:
1. Check environment variables for failing MCP
2. Verify credentials are correct
3. Test the service directly (Linear, WordPress, etc.)
4. Check network connectivity
5. Look at MCP logs in Claude settings

### Tools not appearing from one MCP

**Problem**: Tools from one MCP don't show in Claude.

**Solution**:
1. Restart Claude completely
2. Check MCP connection status
3. Verify MCP is properly configured
4. Check for errors in MCP output
5. Try restarting just that MCP

### Slow performance with multiple MCPs

**Problem**: Claude is slow with all MCPs running.

**Solution**:
1. Only load MCPs you actually need
2. Close unused MCPs to free resources
3. Optimize individual MCP queries
4. Use pagination/filtering to limit data
5. Consider running MCPs on separate machines

### Conflicting configurations

**Problem**: Different MCPs have different requirements.

**Solution**:
1. Each MCP has isolated environment variables
2. Different MCPs can use different authentication methods
3. Configure each MCP independently in settings
4. No cross-MCP configuration needed

## Best Practices

1. **Start Small**: Add one MCP at a time, verify it works
2. **Document Credentials**: Keep track of which env vars go with which MCP
3. **Monitor Performance**: Watch for slowdowns with multiple MCPs
4. **Use Appropriate Tools**: Don't search all MCPs for every query
5. **Link Systematically**: Keep links between systems consistent
6. **Test Connections**: Verify all MCPs connect before heavy use
7. **Backup Credentials**: Store API keys securely

## Performance Tips

When running multiple MCPs:

1. **Use filtering**: Be specific in searches
2. **Limit results**: Use pagination parameters
3. **Batch operations**: Combine multiple tool calls
4. **Cache locally**: Store frequently accessed data
5. **Async operations**: Use Claude's ability to parallelize
6. **Monitor limits**: Watch API rate limits on each service

## Examples with Other Services

### Adding AWS MCP

Link AWS resources to Linear issues and documentation:

```json
"aws": {
  "type": "stdio",
  "command": "npx",
  "args": ["@aws-sdk/client-s3"],
  "env": { "AWS_ACCESS_KEY": "...", "AWS_SECRET_KEY": "..." }
}
```

### Adding Slack MCP

Announce posts and issues in Slack:

```json
"slack": {
  "type": "stdio",
  "command": "npx",
  "args": ["@slack/mcp-server"],
  "env": { "SLACK_TOKEN": "xoxb-..." }
}
```

### Adding Notion MCP

Sync posts to Notion workspace:

```json
"notion": {
  "type": "http",
  "url": "https://notion-mcp.example.com:3000"
}
```

## Advanced: Custom MCP Development

To create a new MCP that works with Linear-WordPress:

1. Follow the [MCP specification](https://modelcontextprotocol.io/)
2. Use the same tool naming conventions
3. Support the same authentication patterns
4. Implement error handling consistently
5. Document tool parameters clearly

See [CLAUDE.md](./CLAUDE.md) for the development guide.

## Summary

Multi-MCP support allows you to:
- ✅ Run multiple services simultaneously
- ✅ Use all tools in one conversation
- ✅ Link data across systems
- ✅ Create complex workflows
- ✅ Automate multi-service operations

The Linear-WordPress MCP is designed specifically for this!
