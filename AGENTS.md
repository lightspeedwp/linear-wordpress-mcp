# Agents and Skills for Linear-WordPress MCP

This document describes the agents and skills that work with the Linear-WordPress MCP server.

---

## Available Agents

### MCP Builder (`/anthropic-skills:mcp-builder`)

**When to use:** When extending the MCP server, adding new tools, or validating MCP configuration.

**What it does:**
- Reviews MCP protocol compliance
- Guides tool design and implementation
- Validates TypeScript SDK patterns (v1 and v2)
- Provides quality checklists for MCP servers

**Examples:**
```
/anthropic-skills:mcp-builder

Add a new Linear query tool that searches by cycle
```

---

### Code Review (`/code-review`)

**When to use:** Before committing changes to the MCP server code.

**What it does:**
- Reviews changed code for correctness bugs
- Identifies simplification opportunities
- Checks TypeScript strict mode compliance
- Validates Linear and WordPress client patterns

**Usage:**
```
/code-review --max-findings 20
```

---

### Testing (`/test`)

**When to use:** When setting up or running tests for the MCP server.

**What it does:**
- Generates Jest/Vitest test cases
- Creates integration test specs
- Validates test coverage
- Documents testing patterns

---

### Simplify (`/simplify`)

**When to use:** After implementing features, before merging PRs.

**What it does:**
- Reviews code for reusability
- Identifies efficiency improvements
- Suggests DRY (Don't Repeat Yourself) refactoring
- Improves code altitude and clarity

---

## Available Skills

### MCP Configuration (`/anthropic-skills:mcp-builder`)

Sets up and validates `.claude/mcp.json` configuration:
- Configures stdio transport for local MCP
- Configures HTTP transport for remote MCP
- Validates environment variables
- Tests multi-MCP setup

**Example:**
```
Use /anthropic-skills:mcp-builder to verify the .claude/mcp.json configuration
```

---

### Documentation (`/anthropic-skills:docs`)

Generates and maintains documentation:
- Creates API documentation
- Generates setup guides
- Builds integration guides
- Maintains changelog

---

### WordPress Utilities

For WordPress integration work:
- `/wordpress-devkit:doctor` — Diagnose WordPress issues
- `/wordpress-devkit:hardening-check` — Security audit
- `/wordpress-devkit:wp-debug` — Debug WordPress problems

---

## Development Workflow

### When You're Implementing a New Tool

```
1. Use /anthropic-skills:mcp-builder to plan the tool
2. Implement the tool in src/tools/
3. Add Zod schema validation
4. Use /code-review to validate implementation
5. Use /test to create test cases
6. Use /simplify to clean up code
7. Commit with descriptive message
```

### When You're Adding Linear Features

```
1. Review Linear GraphQL API in SETUP_GUIDE.md
2. Extend src/linear/client.ts
3. Add tool definition in src/tools/
4. Use /code-review for validation
5. Test with TESTING_GUIDE.md
```

### When You're Adding WordPress Features

```
1. Review WordPress REST API docs
2. Extend src/wordpress/client.ts
3. Add tool definition in src/tools/
4. Validate authentication in SETUP_GUIDE.md
5. Test with WordPress site credentials
```

---

## Multi-MCP Integration

When integrating with Zendesk or other MCPs:

1. Verify Zendesk MCP endpoint: `https://lightspeed-zendesk-mcp.lsh.workers.dev/mcp`
2. Test `.claude/mcp.json` configuration in TESTING_GUIDE.md
3. Use Test Group 2 (Cross-MCP Integration Tests) from TESTING_GUIDE.md
4. Document workflows in MULTI_MCP_GUIDE.md

---

## Performance Optimization

When performance becomes a concern:

1. Use `/code-review` with focus on efficiency
2. Review GraphQL query optimization in ARCHITECTURE.md
3. Consider caching patterns in src/linear/client.ts
4. Profile response times with TESTING_GUIDE.md

---

## Security and Best Practices

### Code Quality
- Always run `npm run build` before committing
- Always run `npm run lint` to check code style
- Use `/code-review` before merging PRs
- Maintain TypeScript strict mode compliance

### Credentials Handling
- Never commit `.env` files
- Use `.env.example` as template
- Rotate API keys regularly
- Use environment variables for all secrets

### API Integration
- Use whitelisted GraphQL operations for Linear
- Validate input schemas with Zod
- Handle rate limiting gracefully
- Log errors with context

---

## Resources

- **MCP Development:** See `/anthropic-skills:mcp-builder`
- **Setup Guide:** [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Testing:** [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Multi-MCP Guide:** [MULTI_MCP_GUIDE.md](./MULTI_MCP_GUIDE.md)
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Claude Code Instructions:** [.claude/instructions.md](./.claude/instructions.md)

---

## Quick Commands

```bash
# Build the MCP
npm run build

# Start development mode
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Type check
npm run typecheck

# Lint code
npm run lint

# Format code (if configured)
npm run format
```

---

## Next Steps

1. **New to the project?** Start with [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. **Want to test?** Follow [TESTING_GUIDE.md](./TESTING_GUIDE.md)
3. **Adding a feature?** See development workflow above
4. **Integrating with other MCPs?** Read [MULTI_MCP_GUIDE.md](./MULTI_MCP_GUIDE.md)
5. **Understanding the design?** Review [ARCHITECTURE.md](./ARCHITECTURE.md)
