# Branch Validation Agent

Validates branch names and enforces LightSpeed WP's organization-wide branching strategy for the Linear-WordPress MCP project.

---

## Purpose

Ensures all feature branches follow naming conventions, use correct type prefixes, and are ready for CI/CD pipeline integration.

---

## When to Use

- Before pushing a new branch to GitHub
- When creating a pull request
- During code review to validate branch naming
- In CI/CD workflows to enforce standards

---

## Branch Naming Convention

Format: `{type}/{ticket-id}/{description}`

### Valid Types

| Type | Use Case | Example |
|------|----------|---------|
| `feature` | New features | `feature/LW-123/add-linear-search` |
| `bugfix` | Bug fixes | `bugfix/LW-456/fix-wordpress-auth` |
| `docs` | Documentation | `docs/LW-789/update-setup-guide` |
| `refactor` | Code refactoring | `refactor/LW-101/simplify-client` |
| `test` | Tests and QA | `test/LW-202/add-mcp-tests` |
| `chore` | Maintenance | `chore/LW-303/update-dependencies` |
| `ci` | CI/CD updates | `ci/LW-404/add-github-workflow` |

### Naming Rules

1. **Type prefix** — Must be one of the valid types above
2. **Ticket ID** — Linear or GitHub issue ID (e.g., `LW-123`, `#456`)
3. **Description** — Lowercase, hyphens instead of spaces
4. **Max length** — 63 characters total (GitHub limit)

### Examples

✅ Valid:
- `feature/LW-123/add-linear-search`
- `bugfix/LW-456/fix-wordpress-auth`
- `docs/update-api-reference`
- `test/add-integration-tests`

❌ Invalid:
- `add-feature` (missing type)
- `feature/Add New Feature` (spaces, uppercase)
- `feature/LW-123/this-is-a-very-long-branch-name-that-exceeds-the-character-limit` (too long)
- `Feature/LW-123/add-feature` (uppercase type)

---

## Validation Process

When you run this agent:

1. **Check branch format** — Validate against naming convention
2. **Identify branch type** — Extract type from branch name
3. **Verify ticket ID** — Confirm ID exists (when possible)
4. **Assess CI readiness** — Check branch is ready for pipeline
5. **Provide guidance** — Suggest corrections or next steps

---

## Commands

```bash
# Validate current branch
/branch-validation

# Validate specific branch
/branch-validation --branch feature/LW-123/my-feature

# Suggest branch name from task
/branch-validation --suggest "Add Linear search functionality"

# Check multiple branches
/branch-validation --all
```

---

## Integration with Workflows

### Pre-Push Hook

Add to `.git/hooks/pre-push`:
```bash
#!/bin/bash
branch=$(git symbolic-ref --short HEAD)
npx @modelcontextprotocol/inspector \
  /branch-validation --branch "$branch"
```

### GitHub Actions

```yaml
- name: Validate branch name
  run: |
    branch=${GITHUB_HEAD_REF}
    npx @modelcontextprotocol/inspector \
      /branch-validation --branch "$branch"
```

### Claude Code

When creating a new feature:
```
/branch-validation --suggest "Add Linear issue linking"
```

---

## CI/CD Integration

### Automated Checks

The repository's `.github/branch-labels.yml` automatically:
- Detects branch type and applies labels
- Routes PRs to correct reviewers
- Triggers appropriate workflows
- Enforces status checks

### Pipeline Behavior

| Branch Type | Auto-merge | Review Required | Tests Required |
|-------------|-----------|-----------------|-----------------|
| `feature/*` | ❌ No | ✅ Yes (2 approvals) | ✅ All must pass |
| `bugfix/*` | ⚠️ Auto after review | ✅ Yes (1 approval) | ✅ All must pass |
| `docs/*` | ✅ Auto | ❌ No | ❌ No |
| `refactor/*` | ❌ No | ✅ Yes (2 approvals) | ✅ All must pass |
| `test/*` | ✅ Auto | ❌ No | ❌ No |
| `chore/*` | ✅ Auto | ❌ No | ❌ No |
| `ci/*` | ⚠️ Manual | ✅ Yes (1 approval) | ✅ Pipeline only |

---

## Workflow

### Starting a New Feature

1. **Create the branch** following the naming convention:
   ```bash
   git checkout -b feature/LW-123/add-linear-search
   ```

2. **Validate the branch** (optional, but recommended):
   ```bash
   /branch-validation
   ```

3. **Make your changes** and commit:
   ```bash
   git add .
   git commit -m "Add Linear search functionality"
   ```

4. **Push the branch**:
   ```bash
   git push origin feature/LW-123/add-linear-search
   ```

5. **Create pull request** — GitHub will automatically:
   - Add labels based on branch type
   - Assign reviewers
   - Run CI tests
   - Set merge requirements

---

## Validation Examples

### Example 1: Valid Feature Branch

```
Branch: feature/LW-123/add-linear-search

✅ Valid branch name
  Type: feature
  Ticket: LW-123
  Description: add-linear-search
  
✅ Ready for CI/CD
  Requires: 2 approvals, all tests passing
  Auto-merge: Not enabled
```

### Example 2: Invalid Branch Name

```
Branch: AddLinearSearch

❌ Invalid branch name
  Error: Missing type prefix
  
Suggestions:
  • feature/LW-123/add-linear-search
  • feature/add-linear-search (if no ticket)
```

### Example 3: Auto-Suggest

```
Request: "Add Linear search functionality for issues"

Suggested branch names:
1. feature/add-linear-search
2. feature/LW-123/add-linear-search (if ticket LW-123 exists)
3. feature/linear/issue-search

Run: git checkout -b feature/LW-123/add-linear-search
```

---

## Tips & Best Practices

### Do's ✅

- Use lowercase letters and hyphens
- Keep descriptions concise and descriptive
- Include ticket ID when available
- Use imperative verbs: `add`, `fix`, `update`, `refactor`
- Push frequently to keep branch fresh

### Don'ts ❌

- Don't use spaces (use hyphens)
- Don't use uppercase letters
- Don't use special characters (except hyphens)
- Don't make descriptions too long or vague
- Don't create branches without a clear purpose

---

## GitHub Integration

### Auto-Labeling

Labels are automatically applied based on branch type:
- `feature` → `type/feature`
- `bugfix` → `type/bug`
- `docs` → `type/docs`
- `refactor` → `type/refactor`
- `test` → `type/test`
- `chore` → `type/chore`
- `ci` → `type/ci`

### Assignees & Reviewers

Based on branch type and team:
- **Feature**: Product & Engineering team
- **Bugfix**: Engineering team
- **Docs**: Product & Docs team
- **Refactor**: Engineering team lead
- **CI**: DevOps team

---

## Troubleshooting

### My branch name was rejected

1. Check you're using a valid type prefix
2. Verify no spaces in description
3. Ensure total length < 63 characters
4. Run `/branch-validation --suggest` for suggestions

### CI tests aren't running

1. Validate branch name with `/branch-validation`
2. Ensure branch is pushed to origin
3. Check GitHub Actions are enabled
4. Review `.github/workflows/` configuration

### Auto-merge not working

1. Verify branch type allows auto-merge (see table above)
2. Ensure all checks pass (✅ all green)
3. Confirm you have merge permissions
4. Check branch protection rules in Settings

---

## See Also

- [CLAUDE.md](../../CLAUDE.md) — Developer context
- [AGENTS.md](../../AGENTS.md) — Other available agents
- [.github/branch-types.yml](../../.github/branch-types.yml) — Branch configuration
- [.github/labels.yml](../../.github/labels.yml) — Label definitions
