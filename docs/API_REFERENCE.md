# Linear-WordPress MCP - API Reference

Complete reference for all available tools and their parameters.

---

## Linear Tools

### search_linear_issues

Search for Linear issues using text query.

**Parameters:**
- `query` (string, required) — Search terms for issue title, description, or comments
- `limit` (number, optional, default: 10) — Maximum number of results to return (1-100)
- `state` (string, optional) — Filter by state: `backlog`, `todo`, `in_progress`, `in_review`, `done`, or `cancelled`

**Returns:**
```json
{
  "issues": [
    {
      "id": "issue_id",
      "title": "Issue title",
      "description": "Full description",
      "state": "in_progress",
      "priority": 1,
      "estimate": 5,
      "assignee": "user@example.com",
      "team": "Team Name"
    }
  ],
  "total": 42
}
```

**Example:**
```
Search for payment integration issues with a limit of 5 results
```

---

### get_linear_issue

Retrieve a specific Linear issue by ID.

**Parameters:**
- `issue_id` (string, required) — Linear issue ID (e.g., `PROJ-123`)

**Returns:**
```json
{
  "id": "PROJ-123",
  "title": "Issue title",
  "description": "Full description",
  "state": "in_progress",
  "priority": 1,
  "estimate": 5,
  "labels": ["bug", "urgent"],
  "assignee": "user@example.com",
  "team": "Team Name",
  "created_at": "2026-10-30T12:00:00Z",
  "updated_at": "2026-10-30T12:00:00Z"
}
```

**Example:**
```
Get the details for issue PROJ-123
```

---

### get_linear_teams

Get all teams in the Linear workspace.

**Parameters:**
None

**Returns:**
```json
{
  "teams": [
    {
      "id": "team_id",
      "name": "Engineering",
      "description": "Engineering team",
      "key": "ENG"
    }
  ]
}
```

**Example:**
```
Show me all Linear teams
```

---

### create_linear_issue

Create a new Linear issue.

**Parameters:**
- `title` (string, required) — Issue title (max 255 characters)
- `description` (string, optional) — Issue description (supports Markdown)
- `team_id` (string, required) — Team ID from get_linear_teams
- `priority` (number, optional, default: 3) — Priority level (0=urgent, 1=high, 2=medium, 3=low)
- `estimate` (number, optional) — Story points estimate (1-10)

**Returns:**
```json
{
  "id": "PROJ-456",
  "title": "New issue title",
  "description": "Issue description",
  "state": "backlog",
  "priority": 1,
  "team": "Team Name"
}
```

**Example:**
```
Create a high-priority issue in the Engineering team titled "Fix payment flow"
```

---

## WordPress Tools

### search_wordpress_posts

Search for WordPress posts by keyword.

**Parameters:**
- `keyword` (string, required) — Search terms to find in post title or content
- `limit` (number, optional, default: 10) — Maximum number of results (1-100)
- `status` (string, optional, default: `publish`) — Post status: `publish`, `draft`, `pending`, or `trash`

**Returns:**
```json
{
  "posts": [
    {
      "id": 123,
      "title": "Post Title",
      "excerpt": "Post excerpt",
      "content": "Full post content",
      "status": "publish",
      "author": "admin",
      "url": "https://example.com/post-title",
      "created_at": "2026-10-30T12:00:00Z",
      "updated_at": "2026-10-30T12:00:00Z"
    }
  ],
  "total": 5
}
```

**Example:**
```
Search for posts about payment
```

---

### get_wordpress_post

Retrieve a specific WordPress post by ID.

**Parameters:**
- `post_id` (number, required) — WordPress post ID

**Returns:**
```json
{
  "id": 123,
  "title": "Post Title",
  "excerpt": "Post excerpt",
  "content": "Full post content",
  "status": "publish",
  "author": "admin",
  "categories": ["documentation"],
  "tags": ["payment", "integration"],
  "url": "https://example.com/post-title",
  "created_at": "2026-10-30T12:00:00Z",
  "updated_at": "2026-10-30T12:00:00Z"
}
```

**Example:**
```
Get the details for WordPress post 123
```

---

### create_wordpress_post

Create a new WordPress post.

**Parameters:**
- `title` (string, required) — Post title (max 255 characters)
- `content` (string, required) — Post content (supports HTML and Markdown)
- `status` (string, optional, default: `draft`) — Post status: `draft` or `publish`
- `excerpt` (string, optional) — Post excerpt (max 160 characters)

**Returns:**
```json
{
  "id": 456,
  "title": "New Post Title",
  "content": "Post content",
  "status": "draft",
  "url": "https://example.com/new-post",
  "created_at": "2026-10-30T12:00:00Z"
}
```

**Example:**
```
Create a draft post titled "Payment Integration Guide" with documentation content
```

---

## Cross-System Tools

### link_issue_to_post

Create a bidirectional link between a Linear issue and WordPress post.

**Parameters:**
- `issue_id` (string, required) — Linear issue ID (e.g., `PROJ-123`)
- `post_id` (number, required) — WordPress post ID

**Returns:**
```json
{
  "success": true,
  "issue": {
    "id": "PROJ-123",
    "linked_post_id": 456
  },
  "post": {
    "id": 456,
    "linked_issue_id": "PROJ-123"
  }
}
```

**Example:**
```
Link Linear issue PROJ-123 to WordPress post 456
```

---

## Error Responses

All tools may return errors in this format:

```json
{
  "error": "Error message",
  "details": "Additional error details",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `INVALID_API_KEY` — Linear API key is invalid or expired
- `INVALID_CREDENTIALS` — WordPress credentials are incorrect
- `RATE_LIMIT` — API rate limit exceeded (retry after 60 seconds)
- `NOT_FOUND` — Resource not found (issue/post ID doesn't exist)
- `VALIDATION_ERROR` — Invalid input parameters
- `NETWORK_ERROR` — Network connectivity issue

---

## Rate Limits

- **Linear API:** 60 requests per minute per API key
- **WordPress REST API:** 10 requests per second per user

When rate limited, wait the recommended time before retrying.

---

## Authentication

### Linear
- Requires: `LINEAR_API_KEY` environment variable
- Format: Bearer token starting with `lin_api_`
- Get it from: Linear Settings → API → Create personal API key

### WordPress
- Requires: `WORDPRESS_REST_API_URL`, `WORDPRESS_AUTH_USER`, `WORDPRESS_AUTH_PASSWORD`
- Use Application Passwords, not login credentials
- Get it from: WordPress Admin → Users → App Passwords → Create New

---

## Pagination

Results are limited to 100 items by default. For larger datasets:

1. Use the `limit` parameter to request up to 100 results
2. Results include a `total` count
3. For searching multiple pages, refine your query

**Example:**
```
Search for issues with limit 100 (returns up to 100 results)
```

---

## Data Mapping

### Linear → WordPress
When linking issues to posts, the following mapping occurs:

| Linear | WordPress |
|--------|-----------|
| Issue ID | Post meta: `_linear_issue_id` |
| Issue Title | Referenced in post content |
| Issue State | Tracked in post meta: `_linear_state` |

### WordPress → Linear
When creating issues from posts:

| WordPress | Linear |
|-----------|--------|
| Post ID | Issue description includes link |
| Post Title | Issue title prefix |
| Post Content | Issue description |

---

## See Also

- [SETUP_GUIDE.md](../SETUP_GUIDE.md) — Credential setup
- [TESTING_GUIDE.md](../TESTING_GUIDE.md) — Test examples for each tool
- [MULTI_MCP_GUIDE.md](../MULTI_MCP_GUIDE.md) — Cross-MCP workflows
- [ARCHITECTURE.md](../ARCHITECTURE.md) — System design details
