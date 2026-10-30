# Debugging Prompt

Use this prompt when diagnosing issues with the Linear-WordPress MCP.

---

## Debugging Approach

### 1. Identify the Problem

**Symptoms → Root Cause**

```
MCP server won't start
  ↓
Check environment variables
  ↓
Check TypeScript build
  ↓
Check Node.js version
  ↓
Review server logs
```

### 2. Gather Information

- What error message are you seeing?
- Which tool/feature is affected?
- What were you doing when it broke?
- Has it worked before?
- What changed recently?

### 3. Isolate the Issue

- Test with minimal example
- Try disabling features
- Test with different inputs
- Check specific component

### 4. Fix and Verify

- Implement fix
- Test the fix works
- Test edge cases
- Update documentation

---

## Common Issues & Solutions

### Server Won't Start

**Error:** `npm run dev` exits immediately

**Diagnosis:**
```bash
# 1. Check environment variables
echo $LINEAR_API_KEY
echo $WORDPRESS_REST_API_URL

# 2. Build TypeScript
npm run build

# 3. Check Node.js
node --version

# 4. Run with verbose output
npm run dev 2>&1 | head -50
```

**Solutions:**
- Set missing environment variables
- Run `npm install` to install dependencies
- Upgrade to Node.js 18+
- Check `.env` file exists and is readable

### API Connection Fails

**Error:** `Failed to initialize Linear/WordPress client`

**Diagnosis:**
```typescript
// Test API connection manually
const axios = require('axios')

// Linear test
axios.post('https://api.linear.app/graphql', 
  { query: '{ teams { edges { node { id name } } } }' },
  { headers: { Authorization: `Bearer ${process.env.LINEAR_API_KEY}` } }
)

// WordPress test
axios.get(
  `${process.env.WORDPRESS_REST_API_URL}/posts`,
  { auth: {
    username: process.env.WORDPRESS_AUTH_USER,
    password: process.env.WORDPRESS_AUTH_PASSWORD
  }}
)
```

**Solutions:**
- Verify API keys haven't expired
- Check API endpoints are correct
- Verify network connectivity
- Check firewall/proxy settings

### Tool Returns Empty Results

**Error:** `search_linear_issues` returns empty array

**Diagnosis:**
```typescript
// Test Linear API directly
const client = new LinearClient(env)
const results = await client.searchIssues('payment')
console.log('Results:', results)
console.log('Total:', results.length)

// Check GraphQL query
console.log('Query:', client.buildQuery('payment'))
```

**Solutions:**
- Try simpler search term
- Check you have permission to view issues
- Verify issues exist in workspace
- Check issue state filter if using

### API Rate Limit

**Error:** `RATE_LIMIT` in tool response

**Diagnosis:**
```bash
# Linear: 60 requests/minute
# WordPress: 10 requests/second

# Check how many requests you're making
npm run dev 2>&1 | grep "request\|api"
```

**Solutions:**
- Wait 60 seconds and retry
- Reduce number of parallel requests
- Use larger `limit` parameter
- Batch multiple queries

---

## Debugging Tools

### MCP Inspector

```bash
# Start inspector
npx @modelcontextprotocol/inspector node dist/index.js

# Opens web UI at http://localhost:3000
# Test tools directly
```

### Enable Debug Logging

**In environment:**
```bash
DEBUG=linear-wordpress-mcp:* npm run dev
```

**In code:**
```typescript
console.error('[DEBUG]', 'message', data)
```

**See logs:**
```bash
npm run dev 2>&1 | grep DEBUG
```

### TypeScript Diagnostics

```bash
# Check for errors
npm run typecheck

# Detailed error info
npm run typecheck --pretty false

# Check specific file
npx tsc src/linear/client.ts --noEmit
```

### Lint Check

```bash
# Find style issues
npm run lint

# Show detailed issues
npm run lint -- --format json | jq '.'

# Fix issues automatically
npm run lint -- --fix
```

---

## Testing Individual Components

### Test Linear Client

```typescript
import { LinearClient } from './src/linear/client'

const client = new LinearClient({
  LINEAR_API_KEY: process.env.LINEAR_API_KEY!,
  WORDPRESS_REST_API_URL: 'https://example.com/wp-json/wp/v2',
  WORDPRESS_AUTH_USER: 'admin',
  WORDPRESS_AUTH_PASSWORD: 'pass'
})

// Test search
const issues = await client.searchIssues('test')
console.log('Found issues:', issues.length)

// Test get
const issue = await client.getIssue('LW-123')
console.log('Issue:', issue)

// Test teams
const teams = await client.getTeams()
console.log('Teams:', teams)
```

### Test WordPress Client

```typescript
import { WordPressClient } from './src/wordpress/client'

const client = new WordPressClient({
  LINEAR_API_KEY: '',
  WORDPRESS_REST_API_URL: process.env.WORDPRESS_REST_API_URL!,
  WORDPRESS_AUTH_USER: process.env.WORDPRESS_AUTH_USER!,
  WORDPRESS_AUTH_PASSWORD: process.env.WORDPRESS_AUTH_PASSWORD!
})

// Test search
const posts = await client.searchPosts('test')
console.log('Found posts:', posts.length)

// Test get
const post = await client.getPost(123)
console.log('Post:', post)

// Test create
const newPost = await client.createPost({
  title: 'Test Post',
  content: 'Test content'
})
console.log('Created:', newPost.id)
```

### Test Tool Validation

```typescript
import { tools } from './src/tools'

// Find tool
const searchTool = tools.find(t => t.name === 'search_linear_issues')!

// Test validation
try {
  searchTool.inputSchema.parse({ query: '' })
} catch (e) {
  console.log('Validation error (expected):', e.message)
}

// Valid input
const valid = searchTool.inputSchema.parse({ query: 'test', limit: 10 })
console.log('Valid input:', valid)
```

---

## Debugging Workflows

### Multi-MCP Issue

**Problem:** Zendesk MCP not showing in Claude

**Debug checklist:**
- [ ] Verify `.claude/mcp.json` has Zendesk entry
- [ ] Check `"disabled": false` for Zendesk
- [ ] Verify URL: `https://lightspeed-zendesk-mcp.lsh.workers.dev/mcp`
- [ ] Test endpoint: `curl -I https://lightspeed-zendesk-mcp.lsh.workers.dev/mcp`
- [ ] Restart Claude Code app
- [ ] Check Settings → MCPs → Zendesk status

**Fix:**
```bash
# Restart MCP server
npm run dev

# Verify both tools list
npx @modelcontextprotocol/inspector node dist/index.js
# Check if Zendesk tools appear
```

### Linking Issues Fails

**Problem:** `link_issue_to_post` returns error

**Debug checklist:**
- [ ] Issue exists: `get_linear_issue PROJ-123`
- [ ] Post exists: `get_wordpress_post 456`
- [ ] API permissions are sufficient
- [ ] Post meta is writable
- [ ] No existing link conflict

**Test linking:**
```typescript
const result = await linkTool.handler(
  { issue_id: 'LW-123', post_id: 456 },
  linearClient,
  wordPressClient,
  context
)
console.log('Link result:', result)
```

---

## Performance Debugging

### Slow Responses

**Diagnosis:**
```bash
# Measure response time
time npm run test

# Profile with Node.js
node --prof dist/index.js

# Generate report
node --prof-process isolate-*.log > profile.txt
```

**Common causes:**
- Large API response size
- Complex GraphQL query
- Rate limiting
- Network latency

**Solutions:**
- Use smaller `limit` parameter
- Filter results more specifically
- Check network connectivity
- Review query complexity

### Memory Leaks

**Diagnosis:**
```bash
# Run with memory profiling
node --expose-gc dist/index.js

# Check heap size
console.log('Memory:', process.memoryUsage())
```

**Solutions:**
- Close/destroy unused clients
- Paginate large result sets
- Clear caches periodically

---

## Getting Help

### Information to Provide

When asking for help:
1. **Error message** — Exact text from logs
2. **Steps to reproduce** — What you were doing
3. **Environment** — Node version, OS, MCP version
4. **Logs** — Full output from `npm run dev 2>&1`
5. **Configuration** — `.env` (without secrets)

### Resources

- [docs/TROUBLESHOOTING.md](../../docs/TROUBLESHOOTING.md) — Known issues
- [docs/API_REFERENCE.md](../../docs/API_REFERENCE.md) — Tool specifications
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — System design
- [CLAUDE.md](../../CLAUDE.md) — Developer guidelines

---

## Debugging Checklist

Before asking for help:
- [ ] Check environment variables are set
- [ ] Verify API credentials are valid
- [ ] Run `npm run build` successfully
- [ ] Check TypeScript errors: `npm run typecheck`
- [ ] Run tests: `npm run test`
- [ ] Review logs: `npm run dev 2>&1 | tail -50`
- [ ] Try MCP Inspector: `npx @modelcontextprotocol/inspector`
- [ ] Check network connectivity
- [ ] Review relevant documentation

---

Now help me debug the Linear-WordPress MCP. What issue are you experiencing?
