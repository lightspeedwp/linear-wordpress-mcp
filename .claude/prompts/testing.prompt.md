# Testing Prompt

Use this prompt when writing tests for the Linear-WordPress MCP.

---

## Test Strategy

### Unit Tests
Test individual tools and clients in isolation:
- Linear client methods
- WordPress client methods
- Tool input validation (Zod schemas)
- Error handling

### Integration Tests
Test tools working together:
- Linear search → WordPress create
- Issue creation → Post linking
- Multi-MCP workflows

### End-to-End Tests
Test full workflows:
- Search Linear issue
- Create WordPress post
- Link issue to post
- Verify bidirectional link

---

## Test Structure

### Using Vitest (npm run test)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LinearClient } from '../src/linear/client'

describe('LinearClient', () => {
  let client: LinearClient
  
  beforeEach(() => {
    client = new LinearClient({
      LINEAR_API_KEY: 'test-key',
      // ...
    })
  })
  
  describe('searchIssues', () => {
    it('should search issues by query', async () => {
      const results = await client.searchIssues('payment bug')
      expect(results).toHaveLength(expect.any(Number))
      expect(results[0]).toHaveProperty('title')
    })
    
    it('should handle API errors', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(
        new Error('API Error')
      )
      
      await expect(
        client.searchIssues('query')
      ).rejects.toThrow('API Error')
    })
  })
})
```

---

## Testing Each Tool

### Tool Test Template

```typescript
describe('search_linear_issues', () => {
  it('should search by keyword', async () => {
    const result = await toolDef.handler(
      { query: 'payment', limit: 10 },
      linearClient,
      wordPressClient,
      context
    )
    
    expect(result).toHaveProperty('issues')
    expect(Array.isArray(result.issues)).toBe(true)
  })
  
  it('should validate input', async () => {
    expect(() => {
      toolDef.inputSchema.parse({ query: '' })
    }).toThrow()
  })
  
  it('should handle rate limits', async () => {
    // Mock rate limit response
    const result = await toolDef.handler(...)
    expect(result).toHaveProperty('error')
  })
})
```

---

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test -- tools.test.ts

# Run with coverage
npm run test -- --coverage

# Run only unit tests
npm run test -- --grep "Unit"

# Run only integration tests
npm run test -- --grep "Integration"
```

---

## Mocking

### Mock Linear Client

```typescript
const mockLinearClient = {
  searchIssues: vi.fn().mockResolvedValue([
    { id: 'LW-123', title: 'Test issue' }
  ]),
  getIssue: vi.fn(),
  getTeams: vi.fn(),
  createIssue: vi.fn()
}
```

### Mock WordPress Client

```typescript
const mockWordPressClient = {
  searchPosts: vi.fn().mockResolvedValue([
    { id: 1, title: 'Test post' }
  ]),
  getPost: vi.fn(),
  createPost: vi.fn(),
  updatePostMeta: vi.fn()
}
```

---

## Test Coverage

Aim for:
- **Line coverage** > 80%
- **Branch coverage** > 75%
- **Function coverage** > 80%

Run coverage report:
```bash
npm run test -- --coverage
```

---

## Manual Testing in Claude Code

### Test in MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

Opens web interface to test tools directly.

### Test in Claude Code

1. Add MCP to Settings → MCPs
2. Set environment variables
3. Test each tool manually:
   ```
   Search for issues about "payment"
   ```

### Test Multi-MCP Workflows

1. Add both Linear-WordPress and Zendesk MCPs
2. Test cross-MCP queries:
   ```
   1. Find Zendesk ticket about "integration"
   2. Search for related Linear issue
   3. Search for WordPress documentation
   ```

---

## Test Cases for Tools

### search_linear_issues

```typescript
// Valid search
{ query: 'payment bug', limit: 10 }
// Expected: Array of issues with matching text

// Empty query
{ query: '' }
// Expected: Validation error

// Large limit
{ query: 'test', limit: 1000 }
// Expected: Capped to 100, returns up to 100 results

// State filter
{ query: 'payment', state: 'in_progress' }
// Expected: Only in_progress issues
```

### get_linear_issue

```typescript
// Valid issue
{ issue_id: 'LW-123' }
// Expected: Complete issue object

// Invalid issue
{ issue_id: 'INVALID' }
// Expected: NOT_FOUND error

// Wrong format
{ issue_id: 'LW123' }
// Expected: Validation or NOT_FOUND error
```

### create_linear_issue

```typescript
// Valid creation
{
  title: 'New bug',
  description: 'Bug details',
  team_id: 'team-123',
  priority: 1
}
// Expected: New issue created with returned ID

// Missing required field
{ title: 'Bug', description: 'Details' }
// Expected: Validation error (missing team_id)

// Invalid priority
{
  title: 'Bug',
  team_id: 'team-123',
  priority: 999
}
// Expected: Validation error
```

### link_issue_to_post

```typescript
// Valid link
{ issue_id: 'LW-123', post_id: 456 }
// Expected: Link created, stored in post meta and issue description

// Non-existent issue
{ issue_id: 'LW-999', post_id: 456 }
// Expected: NOT_FOUND error

// Non-existent post
{ issue_id: 'LW-123', post_id: 999 }
// Expected: NOT_FOUND error

// Double-link (already linked)
{ issue_id: 'LW-123', post_id: 456 }
// Called twice
// Expected: Successfully re-confirmed or idempotent
```

---

## Debugging Tests

### See detailed output

```bash
npm run test -- --reporter=verbose
```

### Debug specific test

```typescript
it.only('should do something', async () => {
  // This test runs alone
})
```

### Add console logging

```typescript
console.log('Debug info:', variable)
```

See output with:
```bash
npm run test -- --reporter=verbose
```

---

## CI/CD Testing

Tests run automatically on:
- **Push to branch** — All tests must pass
- **Pull request** — All tests must pass before merge
- **GitHub Actions** — `.github/workflows/` runs full suite

Workflow checks:
- `npm run build` — TypeScript compilation
- `npm run typecheck` — Type checking
- `npm run lint` — Code style
- `npm run test` — All unit/integration tests

---

## Best Practices

### Do's ✅
- Test both success and error cases
- Mock external API calls
- Use descriptive test names
- Test edge cases (empty, large, invalid input)
- Keep tests independent
- Use fixtures for common test data

### Don'ts ❌
- Don't make real API calls in tests
- Don't test implementation details
- Don't create interdependent tests
- Don't hardcode API keys in tests
- Don't skip flaky tests without fixing root cause
- Don't test third-party libraries (trust they work)

---

## Resources

- [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — Detailed testing procedures
- [docs/TROUBLESHOOTING.md](../../docs/TROUBLESHOOTING.md) — Debug common issues
- [docs/API_REFERENCE.md](../../docs/API_REFERENCE.md) — Tool specifications
- [package.json](../../package.json) — Test scripts and dependencies

---

Now write tests for the Linear-WordPress MCP. What would you like to test?
