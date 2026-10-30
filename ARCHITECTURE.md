# Architecture Guide

Deep dive into how the Linear-WordPress MCP is designed and structured.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Claude Conversation                        │
│  (User asks Claude to search issues, create posts, link)    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ MCP Protocol (JSON-RPC 2.0)
                       │ methods: tools/list, tools/call
                       │
┌──────────────────────▼──────────────────────────────────────┐
│         MCP Server (Node.js + TypeScript)                   │
│                                                               │
│  ┌────────────────┐  ┌──────────────────┐                  │
│  │  Tool Handler  │  │  Tool Handler    │                  │
│  │  (tools/call)  │  │  (tools/list)    │                  │
│  └────────┬───────┘  └──────────────────┘                  │
│           │                                                  │
│  ┌────────▼──────────────────────────────────────────┐     │
│  │  Tool Dispatcher                                  │     │
│  │  Routes to LinearClient or WordPressClient        │     │
│  └────────┬───────────────────┬──────────────────────┘     │
│           │                   │                             │
│  ┌────────▼────────┐  ┌───────▼──────────┐                │
│  │ LinearClient    │  │ WordPressClient  │                │
│  │ (GraphQL)       │  │ (REST API)       │                │
│  └────────┬────────┘  └───────┬──────────┘                │
└───────────┼──────────────────┼──────────────────────────────┘
            │                  │
    ┌───────▼────────┐  ┌──────▼─────────┐
    │  Linear API    │  │ WordPress API  │
    │ api.linear.app │  │ /wp-json/wp/v2 │
    └────────────────┘  └────────────────┘
```

## Request Flow

### Tool Execution Flow

```
1. User in Claude
   ↓
2. Claude calls tool via MCP
   "Please run search_linear_issues(query='bug')"
   ↓
3. MCP Server receives
   method: "tools/call"
   params: { name: "search_linear_issues", arguments: { query: "bug" } }
   ↓
4. Tool Handler (index.ts)
   const toolDef = getToolByName("search_linear_issues")
   ↓
5. Tool Handler calls handler()
   handler(args, linearClient, wordPressClient, context)
   ↓
6. Handler uses appropriate client
   await linearClient.searchIssues("bug")
   ↓
7. Client makes API call
   POST https://api.linear.app/graphql
   with GraphQL query
   ↓
8. API returns data
   ↓
9. Handler formats response
   { issues: [...] }
   ↓
10. MCP returns result
    { type: "text", text: JSON.stringify(result) }
    ↓
11. Claude receives and displays to user
```

## Component Breakdown

### 1. MCP Server (src/index.ts)

**Responsibilities:**
- Initialize both clients from environment variables
- Handle JSON-RPC 2.0 protocol
- Route requests to appropriate handlers
- Manage error responses
- Convert tool definitions to MCP format

**Key Methods:**
```typescript
// Handle incoming requests
server.setRequestHandler(async (request) => {
  if (request.method === "tools/list") return list of tools
  if (request.method === "tools/call") execute tool
})

// Initialize clients
function initializeClients() {
  linearClient = new LinearClient(env)
  wordPressClient = new WordPressClient(env)
}
```

### 2. Linear Client (src/linear/client.ts)

**Responsibilities:**
- GraphQL query construction
- Authentication handling (Bearer token or API key)
- API call execution
- Response parsing and type conversion
- Error handling

**API Methods:**
- `query<T>(operation, query, variables)` - Execute GraphQL
- `getIssue(id)` - Fetch single issue
- `searchIssues(query, teamId)` - Search issues
- `getTeams()` - List all teams
- `createIssue(teamId, title, description, priority)` - Create issue

**Authentication:**
```typescript
// Supports both formats:
// 1. Raw API key: "lin_api_xxx"
// 2. Bearer token: "Bearer lin_api_xxx"

const authorization = /^bearer\s+/i.test(credential)
  ? credential.replace(/^bearer\s+/i, "Bearer ")
  : credential
```

### 3. WordPress Client (src/wordpress/client.ts)

**Responsibilities:**
- REST API endpoint management
- Basic authentication (username:password in Base64)
- HTTP request/response handling
- Post data transformation
- Metadata operations

**API Methods:**
- `fetch(path, options)` - Low-level HTTP calls
- `getPost(id)` - Fetch single post
- `listPosts(page, perPage, search)` - List/search posts
- `searchPosts(query)` - Search all posts
- `createPost(title, content, status, excerpt)` - Create post
- `updatePost(id, updates)` - Update post
- `getPostMeta(postId)` - Retrieve post metadata
- `updatePostMeta(postId, key, value)` - Store metadata

**Authentication:**
```typescript
// Basic Auth: username:password → Base64
const credentials = `${user}:${password}`
const auth = `Basic ${Buffer.from(credentials).toString("base64")}`
```

### 4. Tools (src/tools/index.ts)

**Structure:**
```typescript
interface ToolDefinition {
  name: string              // Unique tool name
  description: string       // User-facing description
  inputSchema: object       // JSON Schema for MCP
  handler: function         // async (input, linear, wp, context) => result
}
```

**Tool Types:**

| Category | Tools | Purpose |
|----------|-------|---------|
| Read | search_linear_issues, get_linear_issue, get_linear_teams | Retrieve data |
| Create | create_linear_issue, create_wordpress_post | Create items |
| Search | search_wordpress_posts, get_wordpress_post | Query content |
| Link | link_issue_to_post | Connect systems |

**Validation:**
Each tool has a Zod schema for runtime input validation:
```typescript
const SearchLinearIssuesSchema = z.object({
  query: z.string().describe("Search query"),
  team_id: z.string().optional(),
})
```

### 5. Types (src/types/index.ts)

**Key Interfaces:**
```typescript
interface Env                   // Environment configuration
interface LinearIssue           // Linear issue data
interface LinearTeam            // Linear team data
interface WordPressPost         // WordPress post data
interface LinkedIssuePost       // Link relationship
interface ToolContext           // Tool execution context
class AppErrorImpl               // Error handling
```

## Data Flow

### Creating an Issue in Linear

```
Claude: "Create issue about login bug in Engineering team"
  ↓
create_linear_issue handler
  ↓
Input validation (Zod schema)
  ↓
linearClient.createIssue(
  teamId="TEAM_123",
  title="Login bug",
  description="...",
  priority=3
)
  ↓
GraphQL mutation construction
  mutation CreateIssue($input: IssueCreateInput!) {
    issueCreate(input: $input) { issue { ... } }
  }
  ↓
fetch("https://api.linear.app/graphql", {
  headers: { authorization: "Bearer lin_api_..." },
  body: JSON.stringify(mutation)
})
  ↓
Response parsing
  data.issueCreate.issue → LinearIssue object
  ↓
Return to Claude
  { issue: { id: "...", title: "...", url: "..." } }
```

### Linking Issue to Post

```
Claude: "Link this issue to the WordPress post"
  ↓
link_issue_to_post handler
  ↓
Get issue details
  linearClient.getIssue(issue_id)
  ↓
Get post details
  wordPressClient.getPost(post_id)
  ↓
Store link as post metadata
  wordPressClient.updatePostMeta(
    post_id,
    "_linear_issue_link",
    {
      linear_issue_id: "LIN-456",
      linear_issue_identifier: "LIN-456",
      linear_issue_url: "https://linear.app/issues/LIN-456",
      linked_at: ISO datetime
    }
  )
  ↓
Return confirmation with both URLs
```

## Error Handling Strategy

```
Error occurs (Network, API, Validation)
  ↓
Caught in try/catch
  ↓
Wrap in AppErrorImpl
  AppErrorImpl(code, message, statusCode, retryable)
  ↓
Error information:
  - Unique code for categorization
  - User-friendly message
  - HTTP status code
  - Whether to retry
  ↓
Return to Claude as error response
  Claude receives detailed error and explains to user
```

**Error Types:**
- `config_error`: Missing environment variables
- `linear_upstream_error`: Linear API issue (may be retryable)
- `linear_graphql_error`: GraphQL query error
- `wordpress_error`: WordPress API error
- `validation_error`: Input doesn't match schema

## Authentication Patterns

### Linear GraphQL
```
POST https://api.linear.app/graphql
Authorization: Bearer <api_key>
Content-Type: application/json

{
  "query": "...",
  "variables": {...},
  "operationName": "GetIssue"
}
```

### WordPress REST
```
GET https://site.com/wp-json/wp/v2/posts
Authorization: Basic base64(user:password)
```

## Multi-MCP Support

When running multiple MCPs:

```
Claude Conversation
  ↓
├─→ MCP Request for linear-wordpress
│   └─→ Linear-WordPress Server
│       ├─→ LinearClient (Linear API)
│       └─→ WordPressClient (WordPress API)
├─→ MCP Request for zendesk
│   └─→ Zendesk Server
│       └─→ ZendeskClient (Zendesk API)
└─→ MCP Request for github
    └─→ GitHub Server
        └─→ GitHubClient (GitHub API)

Claude routes each tool call to the correct MCP
```

**Design Benefits:**
- Clean separation of concerns
- No tool name conflicts
- Independent error handling
- Scalable to many MCPs
- Each MCP manages its own auth

## Performance Considerations

### Linear GraphQL Optimization
- Single GraphQL query fetches only needed fields
- Query batching possible (not yet implemented)
- Pagination via `first` parameter
- Rate limit: 100 requests/minute

### WordPress REST Efficiency
- Paginated by default (25 posts)
- Configurable `per_page` parameter
- Search via native WordPress search
- Metadata stored with post (no extra queries)

### Caching Strategy (Future)
```
Current: No caching, fresh data each query
Future:
- Cache issue details for 5 minutes
- Cache team list for 30 minutes
- Invalidate on write operations
- Optional Redis backend
```

## Extension Points

### Adding a New Service (e.g., Slack)
```
1. Create src/slack/client.ts
   class SlackClient with methods

2. Update src/types/index.ts
   Add SlackClient to ToolContext

3. Initialize in src/index.ts
   slackClient = new SlackClient(env)

4. Create tools in src/tools/index.ts
   postMessage, listChannels, etc.

5. Export tools array
```

### Adding a New Tool
```
1. Define Zod schema
2. Create ToolDefinition
3. Add to tools array
4. Update plugin.json if user-facing
```

## Testing Strategy

### Unit Tests (per component)
- LinearClient: Mock GraphQL responses
- WordPressClient: Mock HTTP responses
- Tool handlers: Test input validation, output format

### Integration Tests
- Full tool execution with real APIs
- Error scenarios
- Multi-MCP scenarios

### E2E Tests
- Claude conversation with MCP
- Full workflows (search, create, link)

## Security Architecture

```
Secrets Management
├─ Environment variables (.env file)
├─ No secrets in code
├─ No secrets in logs
└─ Secure transmission (HTTPS only)

Input Validation
├─ Zod schema validation
├─ Type checking (TypeScript)
└─ Error handling

API Security
├─ Bearer tokens for Linear
├─ Basic auth for WordPress
├─ HTTPS all requests
└─ No credential logging
```

## Scalability

### Current Limits
- Linear: 100 req/min
- WordPress: Server-dependent (usually higher)
- No persistent connections
- Stateless requests

### Future Scalability
- Add caching layer
- Implement connection pooling
- Rate limit queuing
- Load balancing across instances
- WebSocket for real-time updates

## Monitoring & Debugging

### Logging Strategy
```
All logs go to stderr (not stdout)
Format: [MCP] <component> <message>

Examples:
[MCP] Linear client initialized
[MCP] Tool error in search_linear_issues: ...
[MCP] Request took 245ms
```

### Debug Output
Set environment variable:
```bash
DEBUG=* npm run dev
```

### Error Recovery
```
Transient error (network)
  ↓ Mark as retryable
  ↓ Claude can retry

Permanent error (auth, config)
  ↓ Mark as non-retryable
  ↓ User needs to fix
```

---

**This architecture supports:**
✅ Current functionality (8 tools)
✅ Future extensions (new services)
✅ Multi-MCP usage (with others)
✅ Production deployment (stateless, secure)
✅ Developer experience (TypeScript, validation)
