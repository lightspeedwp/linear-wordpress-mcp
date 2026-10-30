# Linear-WordPress MCP

An MCP (Model Context Protocol) server that enables Claude to seamlessly interact with Linear issues and WordPress posts. Create, search, and link issues to posts—all from Claude conversations.

## Features

- **Linear Integration**: Search issues, get issue details, create new issues, view teams
- **WordPress Integration**: Search posts, retrieve post content, create new posts
- **Bidirectional Linking**: Link Linear issues to WordPress posts with automatic metadata
- **Multi-MCP Support**: Designed to work alongside other MCPs (Zendesk, etc.)
- **GraphQL-Powered**: Uses Linear's efficient GraphQL API
- **REST API**: Uses WordPress REST API for maximum compatibility

## Environment Setup

### Required Environment Variables

```bash
# Linear API Configuration
LINEAR_API_KEY=lin_api_xxx...  # Get from Linear: Settings > API > Create personal API key

# WordPress REST API Configuration
WORDPRESS_REST_API_URL=https://your-site.com/wp-json/wp/v2  # Your WordPress REST API endpoint
WORDPRESS_AUTH_USER=admin  # WordPress username
WORDPRESS_AUTH_PASSWORD=xxxx  # WordPress application password (from WordPress admin)
```

### Getting Credentials

**Linear API Key:**
1. Go to Linear Settings → API → Personal API keys
2. Click "Create new"
3. Copy the generated key

**WordPress REST API:**
1. In WordPress admin, go to Users → Your Profile
2. Scroll to "Application Passwords"
3. Create new application password (copy username + password)
4. REST API endpoint: `https://your-site.com/wp-json/wp/v2`

## Installation

### Build from Source

```bash
# Clone and setup
git clone <repo-url>
cd linear-wordpress-mcp
npm install
npm run build

# Run the server
LINEAR_API_KEY=xxx WORDPRESS_REST_API_URL=xxx WORDPRESS_AUTH_USER=xxx WORDPRESS_AUTH_PASSWORD=xxx npm run dev
```

### Via Claude Code

1. Add the MCP to Claude Code via Settings → MCPs → Add MCP
2. Set the environment variables
3. Start using the tools in Claude conversations

## Available Tools

### Linear Tools

#### `search_linear_issues`
Search for issues across your Linear workspace.

```
Parameters:
- query (required): Search term (title, description, identifier)
- team_id (optional): Filter by specific team

Returns:
- List of matching issues with details (id, identifier, title, status, priority, url)
```

#### `get_linear_issue`
Get detailed information about a specific issue.

```
Parameters:
- issue_id (required): Linear issue ID

Returns:
- Complete issue details including description, assignee, dates
```

#### `get_linear_teams`
List all teams in your Linear workspace.

```
Returns:
- Array of teams with id, name, key, description, issue count
```

#### `create_linear_issue`
Create a new issue in Linear.

```
Parameters:
- team_id (required): Target team ID
- title (required): Issue title
- description (optional): Issue description
- priority (optional): 0-4 (No priority, Low, Medium, High, Urgent)

Returns:
- Newly created issue with URL
```

### WordPress Tools

#### `search_wordpress_posts`
Search for posts by title, content, or excerpt.

```
Parameters:
- query (required): Search term
- per_page (optional): Results per page (1-100, default: 10)

Returns:
- Array of matching posts with metadata
```

#### `get_wordpress_post`
Retrieve a specific post.

```
Parameters:
- post_id (required): WordPress post ID

Returns:
- Full post content, metadata, author, dates
```

#### `create_wordpress_post`
Create a new WordPress post.

```
Parameters:
- title (required): Post title
- content (required): Post content (HTML or plain text)
- status (optional): publish|draft|pending (default: draft)
- excerpt (optional): Post excerpt

Returns:
- Created post with ID and URL
```

### Integration Tools

#### `link_issue_to_post`
Link a Linear issue to a WordPress post.

```
Parameters:
- issue_id (required): Linear issue ID
- post_id (required): WordPress post ID

Returns:
- Confirmation with bidirectional link info
- Stores metadata in WordPress post for future reference
```

## Usage Examples

### Example 1: From Issue to Blog Post

1. Search for a bug report in Linear
   ```
   Claude: "Find issues about login problems in our Engineering team"
   → search_linear_issues(query="login problems", team_id="team_123")
   ```

2. Create a blog post about the fix
   ```
   Claude: "Create a post explaining how we fixed the login issue"
   → create_wordpress_post(title="Fixing Login Issues", content="...", status="draft")
   ```

3. Link them together
   ```
   Claude: "Link this issue to the WordPress post"
   → link_issue_to_post(issue_id="LIN-123", post_id="456")
   ```

### Example 2: Document Feature Request

1. Search for feature requests
   ```
   Claude: "What feature requests do we have about reporting?"
   → search_linear_issues(query="reporting feature")
   ```

2. Convert to documentation
   ```
   Claude: "Create a post documenting this new reporting feature"
   → create_wordpress_post(...)
   ```

3. Create follow-up issue
   ```
   Claude: "Create a Linear issue for documenting the admin panel"
   → create_linear_issue(team_id="...", title="Document admin reporting panel")
   ```

## Multi-MCP Support

This MCP is designed to work alongside other MCPs:

- **With Zendesk MCP**: Connect customer support tickets to issues and documentation
- **With Multiple WordPress Instances**: Configure different WordPress sites
- **Extensible**: Add more services by extending the client model

### Running Multiple MCPs

Claude Code automatically manages multiple MCPs. Just add them all to your configuration:

```json
{
  "mcps": {
    "linear-wordpress": { "url": "..." },
    "zendesk": { "url": "..." },
    "custom-service": { "url": "..." }
  }
}
```

Claude will make all tools available and route requests appropriately.

## Architecture

```
┌─────────────────────────────────────┐
│         Claude Conversation         │
└──────────────┬──────────────────────┘
               │
       ┌───────▼────────┐
       │  MCP Protocol  │
       └───────┬────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────────────┐  ┌────▼──────────────┐
│ LinearClient   │  │ WordPressClient   │
│ (GraphQL)      │  │ (REST API)        │
└───┬────────────┘  └────┬──────────────┘
    │                    │
┌───▼──────────────┐  ┌──▼───────────────┐
│ Linear API       │  │ WordPress REST   │
│ api.linear.app   │  │ /wp-json/wp/v2   │
└──────────────────┘  └──────────────────┘
```

## Development

### Project Structure

```
src/
├── index.ts          # MCP server entry point
├── types/
│   └── index.ts      # TypeScript types & interfaces
├── linear/
│   └── client.ts     # Linear GraphQL client
├── wordpress/
│   └── client.ts     # WordPress REST client
└── tools/
    └── index.ts      # Tool definitions
```

### Testing

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

### Type Checking

```bash
npm run typecheck
```

## Error Handling

The MCP includes comprehensive error handling:

- **Configuration errors**: Missing or invalid environment variables
- **API errors**: Network issues, authentication failures, rate limiting
- **Validation errors**: Invalid tool parameters
- **Data transformation errors**: Unexpected API responses

All errors are reported with actionable messages to help diagnose issues.

## Security

- **API Keys**: Store securely in environment variables, never in version control
- **Credentials**: WordPress passwords handled as Basic auth headers
- **CORS**: No cross-origin issues (server-to-server communication)
- **Validation**: All inputs validated with Zod schemas
- **Read-Only Options**: Can be configured for read-only access to both services

## Troubleshooting

### Linear client not initializing
- Check `LINEAR_API_KEY` is set and valid
- Verify API key has appropriate permissions
- Check for network connectivity to `api.linear.app`

### WordPress client not initializing
- Verify `WORDPRESS_REST_API_URL` is correct (ends with `/wp-json/wp/v2`)
- Check username and password are correct
- Ensure user has REST API access permissions
- Application passwords must be enabled in WordPress

### Tools not appearing in Claude
- Verify MCP is properly connected
- Check browser console for errors
- Restart Claude or refresh the MCP connection
- Verify environment variables are set

## Performance Notes

- Linear GraphQL queries are optimized for minimal data transfer
- WordPress REST API paginated (default 10 posts per search)
- Caching recommended for frequently accessed data
- Rate limits: Linear (100 requests/min), WordPress (depends on server)

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review environment variable configuration
3. Check MCP server logs for detailed errors
4. Open an issue on the repository
