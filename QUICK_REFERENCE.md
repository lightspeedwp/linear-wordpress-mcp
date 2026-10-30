# Quick Reference Card

## Setup (5 minutes)

```bash
# 1. Clone or download
git clone <repo> && cd linear-wordpress-mcp

# 2. Install
npm install

# 3. Get credentials
# Linear: Settings → API → Create personal API key
# WordPress: Users → App Passwords → Create new
# REST URL: https://yourdomain.com/wp-json/wp/v2

# 4. Configure
cp .env.example .env
# Edit .env with your credentials

# 5. Run
npm run dev
```

## 8 Tools at a Glance

### Search & Read
```
search_linear_issues        Search Linear for issues
get_linear_issue           Get one issue's full details
get_linear_teams           List all teams
search_wordpress_posts     Search WordPress posts
get_wordpress_post         Get one post's full content
```

### Create & Link
```
create_linear_issue        Create new Linear issue
create_wordpress_post      Create new WordPress post
link_issue_to_post         Link issue ↔ post
```

## Common Commands

```typescript
// Search Linear issues
search_linear_issues(query="bug", team_id="TEAM_123")

// Get a specific issue
get_linear_issue(issue_id="LIN-456")

// Create issue
create_linear_issue(
  team_id="TEAM_123",
  title="New feature request",
  description="Details...",
  priority=2  // 0-4: None, Low, Medium, High, Urgent
)

// Search WordPress
search_wordpress_posts(query="authentication", per_page=10)

// Create WordPress post
create_wordpress_post(
  title="How to...",
  content="<p>Content...</p>",
  status="draft"  // "draft" | "pending" | "publish"
)

// Link issue to post
link_issue_to_post(issue_id="LIN-456", post_id=789)
```

## Environment Variables

| Variable | Value |
|----------|-------|
| LINEAR_API_KEY | lin_api_xxxxx (from Linear) |
| WORDPRESS_REST_API_URL | https://yourdomain.com/wp-json/wp/v2 |
| WORDPRESS_AUTH_USER | your_username |
| WORDPRESS_AUTH_PASSWORD | app_password_from_wordpress |

## Common Workflows

### "Document this issue"
```
1. get_linear_issue(issue_id)
2. create_wordpress_post(title, content)
3. link_issue_to_post(issue_id, post_id)
```

### "Find docs for this ticket"
```
1. search_linear_issues(ticket_summary)
2. search_wordpress_posts(keywords)
3. link_issue_to_post(issue_id, post_id)
```

### "What's shipped?"
```
1. get_linear_teams()
2. search_linear_issues(query="solved")
3. search_wordpress_posts(query="release")
4. Compare & link
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Linear not connecting | Check LINEAR_API_KEY in .env |
| WordPress 401 error | Use App Password, not regular password |
| WordPress 404 error | Verify REST API URL is correct |
| Tools not showing | Restart Claude, check MCP connection |

## Multi-MCP Combinations

```
Linear-WordPress + Zendesk
  → Link support tickets to issues and docs

Linear-WordPress + GitHub  
  → Link PRs to issues and release notes

Linear-WordPress (x2)
  → Blog + Internal Wiki, both linked to issues

Add Slack
  → Post announcements when items linked
```

## Performance Tips

- Use specific search terms (faster results)
- Filter by team when searching Linear
- Limit per_page to needed results
- Batch operations when possible
- Don't search all systems for every query

## Key URLs

- Linear API: https://linear.app/settings/api
- WordPress Admin: https://yourdomain.com/wp-admin/
- WordPress App Passwords: Users → Profile
- Linear Workspace: https://linear.app/
- MCP Docs: https://modelcontextprotocol.io/

## Files Reference

| File | Contains |
|------|----------|
| src/index.ts | MCP server logic |
| src/linear/client.ts | Linear API calls |
| src/wordpress/client.ts | WordPress API calls |
| src/tools/index.ts | Tool definitions |
| SETUP_GUIDE.md | Detailed setup |
| MULTI_MCP_GUIDE.md | Multi-service workflows |
| README.md | Complete documentation |

## One-Minute Example

```bash
# Start server
npm run dev

# In Claude:
Claude: Search for "payment" issues in Linear

Claude: Create a blog post explaining the fix

Claude: Link the issue to the post

# Done! Issue → Documentation linked
```

## Debugging

```bash
# Type check
npm run typecheck

# Test
npm run test

# Build
npm run build

# Verbose logging
DEBUG=* npm run dev
```

## Next Level

- Add more MCPs (Zendesk, GitHub, Slack)
- Customize tool names in src/tools/index.ts
- Add custom fields to links
- Implement caching
- Add batch operations
- Extend to new services

See CLAUDE.md for development guide.

---

**Save this card for quick reference!**
