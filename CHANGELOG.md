# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-10-30

### Added
- Initial release of Linear-WordPress MCP
- Linear GraphQL client with support for:
  - Searching issues across teams
  - Getting issue details
  - Retrieving all teams
  - Creating new issues
  - Support for issue priorities and status
- WordPress REST API client with support for:
  - Searching posts by content
  - Getting individual post details
  - Creating new posts (draft, pending, published)
  - Listing posts with pagination
  - Post metadata management
- 8 core tools for Claude integration:
  - `search_linear_issues`
  - `get_linear_issue`
  - `get_linear_teams`
  - `create_linear_issue`
  - `search_wordpress_posts`
  - `get_wordpress_post`
  - `create_wordpress_post`
  - `link_issue_to_post`
- Full TypeScript implementation with strict mode
- Comprehensive error handling with custom error types
- Input validation using Zod schemas
- Complete documentation:
  - README.md with feature overview
  - SETUP_GUIDE.md with step-by-step instructions
  - MULTI_MCP_GUIDE.md for multi-service workflows
  - CLAUDE.md for project context
  - .env.example with configuration template
- Plugin manifest (plugin.json) with:
  - Tool capability grouping
  - Setup wizard
  - Use case examples
  - Troubleshooting guides
- Multi-MCP support from day one
- Environment-based configuration
- Support for both Bearer tokens and API keys

### Technical Details
- Node.js 18+ with TypeScript 5.5
- @modelcontextprotocol/server v1.2.0
- Zod for runtime type validation
- Streamable HTTP transport support
- Stdio transport for local execution
- GraphQL queries optimized for performance
- Basic auth for WordPress REST API
- Bearer token auth for Linear GraphQL

### Project Structure
```
src/
├── index.ts           # MCP server entry point
├── types/
│   └── index.ts       # TypeScript interfaces
├── linear/
│   └── client.ts      # Linear GraphQL client
├── wordpress/
│   └── client.ts      # WordPress REST client
└── tools/
    └── index.ts       # Tool definitions
```

### Documentation Included
- Feature overview and architecture
- Complete setup guide with credential retrieval
- Multi-MCP integration patterns
- Example workflows
- Troubleshooting guide
- API reference for all 8 tools
- Security best practices
- Performance optimization tips

### Known Limitations
- Linear API read operations only in v1.0
- WordPress post updates limited to basic fields
- No batch operations in this release
- No caching layer
- Linear rate limit: 100 requests/minute
- WordPress rate limit: server-dependent

## [Unreleased]

### Planned
- [ ] Write operations for Linear issues (update, close, assign)
- [ ] WordPress custom fields support
- [ ] Batch linking operations
- [ ] Caching layer for frequently accessed data
- [ ] Webhook support for real-time updates
- [ ] Advanced filtering and sorting
- [ ] Rate limit handling and backoff
- [ ] Audit logging
- [ ] Support for Linear webhooks
- [ ] Comment operations
- [ ] Attachment/media management
- [ ] Team collaboration features

### Under Consideration
- Stripe/billing integration
- Slack integration
- GitHub integration
- Salesforce integration
- Jira integration
- Airtable integration

---

## Versioning

This project follows Semantic Versioning:
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Migration Guide

### From 0.x to 1.0
This is the initial release - no migration needed.

## Support

For issues, questions, or feature requests:
1. Check existing issues on GitHub
2. Review the [Troubleshooting Guide](./SETUP_GUIDE.md#troubleshooting)
3. Open a new issue with detailed information
4. Include environment setup details for debugging
