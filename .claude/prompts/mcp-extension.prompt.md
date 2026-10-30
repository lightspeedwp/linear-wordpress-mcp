# MCP Extension Prompt

Use this prompt when extending the Linear-WordPress MCP with new tools or features.

---

## Context

You are working on the Linear-WordPress MCP, a production-grade Model Context Protocol server that enables Claude to interact with Linear issues and WordPress posts.

### Technology Stack
- **Language**: TypeScript with strict mode
- **MCP SDK**: v1.0.0 (@modelcontextprotocol/sdk)
- **APIs**: Linear GraphQL API, WordPress REST API
- **Validation**: Zod v3.23.8
- **Build**: tsc, npm scripts

### Project Structure
```
src/
├── index.ts              # MCP server entry point
├── linear/
│   └── client.ts         # Linear GraphQL client
├── wordpress/
│   └── client.ts         # WordPress REST API client
├── tools/
│   └── index.ts          # Tool definitions (8 tools)
└── types/
    └── index.ts          # TypeScript interfaces
```

### Design Principles
1. **Stateless** — No persistent state, all data from APIs
2. **Secure** — API keys via environment variables, input validation with Zod
3. **Scalable** — Ready for Cloudflare Workers deployment
4. **Composable** — Works with other MCPs (Zendesk, GitHub, Slack)
5. **User-friendly** — Clear error messages, helpful defaults

---

## Available Tools

### Linear Tools
- `search_linear_issues` — Search issues by keyword
- `get_linear_issue` — Get issue details
- `get_linear_teams` — List workspace teams
- `create_linear_issue` — Create new issue

### WordPress Tools
- `search_wordpress_posts` — Search posts by keyword
- `get_wordpress_post` — Get post details
- `create_wordpress_post` — Create new post

### Cross-System
- `link_issue_to_post` — Link issue to post (bidirectional)

---

## Extension Guidelines

### When Adding a New Tool

1. **Define the tool** in `src/tools/`:
   ```typescript
   export const myNewTool = {
     name: 'tool_name',
     description: 'What it does',
     inputSchema: z.object({...}),
     handler: async (args, linearClient, wordPressClient, context) => {
       // Implementation
       return { success: true, data: ... }
     }
   }
   ```

2. **Add to exports** in `src/tools/index.ts`:
   ```typescript
   export const tools = [
     // ... existing tools
     myNewTool
   ]
   ```

3. **Add types** in `src/types/index.ts` if needed

4. **Test** before committing:
   ```bash
   npm run build
   npm run test
   npm run lint
   ```

### When Extending Clients

1. **Linear client** (`src/linear/client.ts`):
   - Add method to LinearClient class
   - Use existing GraphQL query patterns
   - Handle errors with try/catch
   - Return typed objects

2. **WordPress client** (`src/wordpress/client.ts`):
   - Add method to WordPressClient class
   - Use REST API endpoints
   - Handle Basic Auth headers
   - Map WordPress response format to types

### Input Validation

All tools use Zod for validation:
```typescript
inputSchema: z.object({
  query: z.string().min(1).max(255).describe('Search terms'),
  limit: z.number().int().min(1).max(100).optional().default(10)
})
```

### Error Handling

Return errors in this format:
```typescript
{
  error: 'User-friendly message',
  details: 'Technical details',
  code: 'ERROR_CODE'
}
```

Common error codes:
- `INVALID_API_KEY` — Linear/WordPress credentials issue
- `RATE_LIMIT` — API rate limit exceeded
- `NOT_FOUND` — Resource doesn't exist
- `VALIDATION_ERROR` — Invalid input parameters

### Documentation

Update these files when adding tools:
1. **docs/API_REFERENCE.md** — Add tool parameters and examples
2. **TESTING_GUIDE.md** — Add test cases
3. **README.md** — Update feature list if applicable
4. **CHANGELOG.md** — Add entry under [Unreleased] → Added

---

## Code Quality

### TypeScript
- Strict mode: `strict: true` in tsconfig.json
- No implicit any
- Full type coverage
- Interfaces for complex types

### Performance
- Cache GraphQL queries when possible
- Limit API results with pagination
- Handle rate limits gracefully
- Optimize REST API queries

### Security
- Validate all inputs with Zod
- Use environment variables for secrets
- Whitelist GraphQL operations
- Escape user input in queries

---

## Development Workflow

### Branch Naming
```
feature/LW-123/add-new-tool
bugfix/LW-456/fix-api-error
docs/update-api-reference
```

### Commit Message
```
Add search by label to Linear issues tool

- Add label parameter to search_linear_issues
- Update GraphQL query for label filtering
- Add test cases for label search
- Update API reference documentation
```

### Testing
```bash
# Build
npm run build

# Run tests
npm run test

# Type check
npm run typecheck

# Lint
npm run lint
```

### PR Description
```markdown
## Summary
What does this PR do?

## Changes
- Change 1
- Change 2
- Change 3

## Testing
How to test this?

## Documentation
What documentation is updated?
```

---

## Before You Start

Review:
1. [ARCHITECTURE.md](../../ARCHITECTURE.md) — System design
2. [docs/API_REFERENCE.md](../../docs/API_REFERENCE.md) — Existing tools
3. [CLAUDE.md](../../CLAUDE.md) — Developer guidelines
4. [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — Test examples

---

## Questions?

- **How do I add a tool?** See guidelines above
- **What's the API?** Check docs/API_REFERENCE.md
- **How do I test?** Follow TESTING_GUIDE.md
- **Need help?** Check docs/TROUBLESHOOTING.md

Now extend the MCP by following the guidelines above. What would you like to add?
