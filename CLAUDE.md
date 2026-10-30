# Claude.md - Linear-WordPress MCP

This file documents the project structure and context for Claude.

## Project Overview

**Linear-WordPress MCP** is a Model Context Protocol server that enables Claude to:
- Search and manage Linear issues
- Search and manage WordPress posts
- Create bidirectional links between issues and posts
- Work with multiple MCPs simultaneously

## Core Architecture

```
MCP Server (Node.js/TypeScript)
├── Linear GraphQL Client
├── WordPress REST Client
└── Tool Handlers (8 tools)
```

### Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | MCP server entry point, handles tool routing |
| `src/linear/client.ts` | Linear GraphQL API client (search, create issues) |
| `src/wordpress/client.ts` | WordPress REST API client (search, create posts) |
| `src/tools/index.ts` | Tool definitions with Zod schemas |
| `src/types/index.ts` | TypeScript interfaces and types |
| `plugin.json` | Claude plugin manifest |
| `README.md` | User-facing documentation |
| `SETUP_GUIDE.md` | Installation and configuration guide |

## Design Principles

1. **Separation of Concerns**: Clients handle API calls, tools handle business logic
2. **Type Safety**: Full TypeScript with Zod validation for all inputs
3. **Error Handling**: Comprehensive error handling with actionable messages
4. **Multi-MCP Support**: Designed to coexist with other MCPs (Zendesk, GitHub, etc.)
5. **Minimal Dependencies**: Only MCP SDK and Zod

## Environment Configuration

The MCP requires 4 environment variables:
- `LINEAR_API_KEY`: Linear personal API key
- `WORDPRESS_REST_API_URL`: WordPress REST API endpoint
- `WORDPRESS_AUTH_USER`: WordPress username
- `WORDPRESS_AUTH_PASSWORD`: WordPress application password

See `.env.example` for template.

## Adding New Tools

To add a new tool:

1. Define Zod schema in `src/tools/index.ts`:
   ```typescript
   const MyToolSchema = z.object({
     param: z.string().describe("Description"),
   });
   ```

2. Create tool definition:
   ```typescript
   const myTool: ToolDefinition = {
     name: "my_tool",
     description: "What this tool does",
     inputSchema: { /* from schema */ },
     async handler(input, linearClient, wordPressClient) {
       const parsed = MyToolSchema.parse(input);
       // Implementation
     }
   };
   ```

3. Add to exports:
   ```typescript
   export const tools: ToolDefinition[] = [
     // ... existing tools
     myTool,
   ];
   ```

## Adding New API Clients

To integrate another service:

1. Create `src/{service}/client.ts`
2. Implement methods for common operations
3. Update `ToolContext` type in `src/types/index.ts`
4. Update `src/index.ts` to initialize the client
5. Create tools using the new client

## Multi-MCP Support Details

This MCP is designed for simultaneous use with others:

- **Zendesk MCP**: Use to link tickets to issues and documentation
- **GitHub MCP**: Use to link PRs to Linear milestones and posts
- **Slack MCP**: Use to announce posts and issues

Claude automatically handles routing between multiple MCPs. Just ensure:
- No environment variable conflicts
- Tool names are unique across MCPs
- Each MCP handles its own authentication

## Testing

```bash
npm run test           # Run all tests
npm run test:watch    # Watch mode
npm run typecheck     # Type checking
```

## Build & Deploy

```bash
npm run build         # Compile TypeScript
npm run dev          # Run dev server
npm start            # Run built server

# With environment variables:
LINEAR_API_KEY=xxx npm run dev
```

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "client not configured" | Missing env vars | Set all required env vars |
| GraphQL errors | Invalid query | Check Linear GraphQL syntax |
| 401 Unauthorized | Wrong credentials | Verify API key/password |
| 404 Not Found | Wrong URL | Verify REST API endpoint |

## Performance Considerations

1. **Linear GraphQL**: Queries are optimized, but respect 100 req/min rate limit
2. **WordPress REST**: Paginated by default, use `per_page` parameter
3. **Network**: All calls are HTTPS, typical latency 200-500ms
4. **Caching**: Currently no caching, implement if needed

## Security Notes

- API credentials stored in environment variables
- No data persisted by the MCP (stateless)
- WordPress uses Basic Auth over HTTPS
- Linear uses Bearer token or API key
- All inputs validated with Zod schemas

## Code Quality Standards

- TypeScript strict mode enabled
- No `any` types allowed
- All functions have type signatures
- Error handling with custom error class
- Tool descriptions include examples
- Zod schemas for all inputs

## Future Enhancements

- [ ] Implement caching layer
- [ ] Add batch operations
- [ ] Support for multiple WordPress instances
- [ ] Webhook support for real-time updates
- [ ] Custom metadata fields
- [ ] Bulk linking operations
- [ ] Advanced filtering/sorting
- [ ] Rate limit handling
- [ ] Audit logging
- [ ] Support for Linear webhooks

## Related Projects

- [Zendesk MCP](https://github.com/lightspeedwp/zendesk-mcp) - Similar MCP for Zendesk
- [MCP Specification](https://modelcontextprotocol.io/)
- [Linear API Docs](https://developers.linear.app/)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)

## Key Contacts & Resources

- Linear API: https://linear.app/settings/api
- WordPress REST: https://developer.wordpress.org/rest-api/
- MCP Protocol: https://modelcontextprotocol.io/
- Issues & Support: See GitHub repository

## Version History

### 1.0.0 (Current)
- Initial release
- 8 core tools
- Full Linear integration
- Full WordPress integration
- Multi-MCP support

## Changelog

See CHANGELOG.md for detailed version history and breaking changes.
