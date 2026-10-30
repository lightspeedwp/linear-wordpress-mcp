# Troubleshooting Guide

Solutions for common issues when using the Linear-WordPress MCP.

---

## Connection Issues

### Linear Client Not Initializing

**Symptom:** `[MCP] Failed to initialize Linear client` in server logs

**Solution:**
1. Verify `LINEAR_API_KEY` is set:
   ```bash
   echo $LINEAR_API_KEY
   ```
2. Check the key format (should start with `lin_api_`):
   ```bash
   grep "lin_api_" .env
   ```
3. Verify the key hasn't expired in Linear Settings → API
4. Generate a new key if needed:
   - Linear Settings → API → Create personal API key
   - Add to `.env`: `LINEAR_API_KEY=lin_api_xxx`
   - Restart the MCP server

---

### WordPress Client Not Initializing

**Symptom:** `[MCP] Failed to initialize WordPress client` in server logs

**Solution:**
1. Verify all three WordPress variables are set:
   ```bash
   echo $WORDPRESS_REST_API_URL
   echo $WORDPRESS_AUTH_USER
   echo $WORDPRESS_AUTH_PASSWORD
   ```
2. Check `WORDPRESS_REST_API_URL` format:
   - Correct: `https://yoursite.com/wp-json/wp/v2`
   - Wrong: `https://yoursite.com` (missing `/wp-json/wp/v2`)
   - Wrong: `http://yoursite.com` (must use https)
3. Verify REST API is enabled in WordPress:
   - WordPress Admin → Plugins
   - Search for and activate "REST API" if disabled
4. Verify Application Password is correct:
   - WordPress Admin → Users → (your user) → App Passwords
   - Create new: Application password name → Generate
   - Copy the generated password (16 characters with spaces)
5. Update `.env` with correct credentials and restart

---

### Zendesk MCP Not Responding

**Symptom:** Tools from Zendesk MCP not appearing in Claude

**Solution:**
1. Verify the endpoint is accessible:
   ```bash
   curl -I https://lightspeed-zendesk-mcp.lsh.workers.dev/mcp
   ```
   Should return `200 OK`

2. Check `.claude/mcp.json` configuration:
   ```json
   "zendesk": {
     "type": "http",
     "url": "https://lightspeed-zendesk-mcp.lsh.workers.dev/mcp",
     "disabled": false
   }
   ```
   - URL must include `/mcp` path
   - `disabled` must be `false`

3. Restart Claude Code completely:
   - Quit Claude Code app
   - Wait 5 seconds
   - Reopen Claude Code
   - Check Settings → MCPs

4. Contact your teammate if the endpoint is still down

---

## Build and Runtime Issues

### TypeScript Build Fails

**Symptom:** `npm run build` returns errors

**Solution:**
1. Check TypeScript version:
   ```bash
   npx tsc --version
   ```
   Should be 5.5.0 or higher

2. Clear build cache:
   ```bash
   rm -rf dist/
   npm run build
   ```

3. Check for strict mode violations:
   ```bash
   npm run typecheck
   ```
   Fix any `strict` mode errors

4. Verify all dependencies are installed:
   ```bash
   npm install
   npm run build
   ```

---

### MCP Server Won't Start

**Symptom:** `npm run dev` exits immediately with errors

**Solution:**
1. Check environment variables are set:
   ```bash
   source .env
   npm run dev
   ```

2. Verify Node.js version:
   ```bash
   node --version
   ```
   Should be 18+ (ideally 20+)

3. Check for port conflicts:
   ```bash
   # MCP uses stdio, not ports, so this shouldn't be the issue
   # But verify no other Node processes are running
   ps aux | grep node
   ```

4. Review full error message:
   ```bash
   npm run dev 2>&1 | head -50
   ```

5. Try clean rebuild:
   ```bash
   rm -rf dist node_modules package-lock.json
   npm install
   npm run build
   npm run dev
   ```

---

## API Query Issues

### Linear Search Returns No Results

**Symptom:** `search_linear_issues` returns empty array

**Solution:**
1. Verify the search query is valid:
   - Use simple keywords first (e.g., "bug", "payment")
   - Complex queries may not match

2. Check issue states:
   - Use optional `state` parameter: `backlog`, `todo`, `in_progress`, `in_review`, `done`, `cancelled`
   - Some issues may be archived

3. Verify permissions:
   - API key must have permission to view issues
   - Linear Settings → API → Check key permissions

4. Try exact issue ID:
   ```
   Use get_linear_issue with issue ID PROJ-123
   ```

---

### WordPress Search Returns Wrong Results

**Symptom:** `search_wordpress_posts` finds unrelated posts

**Solution:**
1. Use more specific keywords:
   - Bad: `test`
   - Better: `payment integration test`

2. Filter by status:
   ```
   Search for "payment" in publish status only
   ```

3. Limit results:
   ```
   Search for posts with limit 5 (instead of default 10)
   ```

4. Check post visibility:
   - Some posts may be private or password-protected
   - WordPress REST API only returns posts you can access

---

### API Rate Limit Exceeded

**Symptom:** `RATE_LIMIT` error in tool response

**Solution:**
1. **Linear (60 requests/minute):**
   - Wait 60 seconds before retrying
   - Reduce query frequency
   - Batch multiple searches into one query when possible

2. **WordPress (10 requests/second):**
   - Wait 1 second between requests
   - Use larger `limit` parameter to get more results per request

3. Monitor your usage:
   - Track number of requests per minute
   - Reduce parallel queries

---

## Data Linking Issues

### Link Between Issue and Post Not Working

**Symptom:** `link_issue_to_post` fails or doesn't appear in linked systems

**Solution:**
1. Verify both resources exist:
   ```
   Get the Linear issue details first
   Get the WordPress post details
   Then link them
   ```

2. Check issue_id format:
   - Must be exact: `PROJ-123` (not just `123`)
   - Verify with `get_linear_issue`

3. Check post_id format:
   - Must be numeric: `456`
   - Verify with `get_wordpress_post`

4. Verify link permissions:
   - API key must have permission to update issue metadata
   - WordPress user must have permission to edit post meta

5. Clear MCP cache and retry:
   ```bash
   npm run build
   npm run dev
   ```

---

## Multi-MCP Integration Issues

### Only One MCP Shows in Claude

**Symptom:** Can only see Linear-WordPress tools OR Zendesk tools, not both

**Solution:**
1. Verify `.claude/mcp.json` has both MCPs:
   ```json
   {
     "mcps": {
       "linear-wordpress": { ... },
       "zendesk": { ... }
     }
   }
   ```

2. Check neither is disabled:
   ```json
   "disabled": false
   ```

3. Restart Claude Code:
   - Quit and reopen the app
   - Check Settings → MCPs

4. Review MCP connection status:
   - Settings → MCPs
   - Both should show "Connected"

---

### Cross-MCP Workflow Fails

**Symptom:** Claude can't reference tools from different MCPs together

**Solution:**
1. Verify both MCPs are connected (see above)

2. Use clear tool naming:
   ```
   Use the Linear-WordPress MCP to get issue PROJ-123
   Then use the Zendesk MCP to search for related tickets
   ```

3. Check data format compatibility:
   - Linear issue ID: `PROJ-123`
   - WordPress post ID: `456`
   - Zendesk ticket ID: `789`

4. Test each MCP individually first:
   ```
   1. Get a Linear issue (Linear MCP works)
   2. Get a WordPress post (WordPress MCP works)
   3. Get a Zendesk ticket (Zendesk MCP works)
   4. Then try cross-MCP workflows
   ```

---

## Performance Issues

### Slow Responses from MCP Tools

**Symptom:** Tools take 5+ seconds to return results

**Solution:**
1. Check Linear API performance:
   - Linear GraphQL queries can be slow with complex searches
   - Use smaller `limit` for faster results

2. Check WordPress API performance:
   - Large WordPress sites may be slow
   - Use specific keywords instead of broad searches

3. Monitor network latency:
   ```bash
   curl -w "@-" -o /dev/null -s https://lightspeed-zendesk-mcp.lsh.workers.dev/mcp
   ```

4. Check server logs for errors:
   ```bash
   npm run dev 2>&1 | grep -i error
   ```

---

## Debugging

### Enable Verbose Logging

**In your Claude Code prompt:**
```
Enable debug logging for this MCP server
```

**In .env:**
```
DEBUG=linear-wordpress-mcp:*
```

**Then restart:**
```bash
npm run dev
```

### Inspect MCP Messages

Use the MCP inspector:
```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

This opens a web interface to test tools directly.

---

## Getting Help

1. **Check the docs:**
   - [SETUP_GUIDE.md](../SETUP_GUIDE.md) — Credential setup
   - [TESTING_GUIDE.md](../TESTING_GUIDE.md) — Test examples
   - [docs/API_REFERENCE.md](./API_REFERENCE.md) — Tool reference

2. **Review your credentials:**
   - Is `.env` correctly set?
   - Are API keys valid and not expired?

3. **Check the logs:**
   ```bash
   npm run dev 2>&1 | tail -50
   ```

4. **Test with MCP Inspector:**
   ```bash
   npx @modelcontextprotocol/inspector node dist/index.js
   ```

5. **Reach out to the team:**
   - Share the error message from step 3
   - Include the tool you were trying to use
   - Include your Linear/WordPress configuration (without secrets)
