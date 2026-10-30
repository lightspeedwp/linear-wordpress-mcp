---
name: git-hooks-enforcer
description: |
  Enforces git hook standards and validates git workflow for the Linear-WordPress MCP project.
  Use this skill to validate branch naming conventions, commit message format, enforce pre-commit 
  quality checks, and ensure all git hooks are properly integrated. Coordinates with the 
  lefthook-config-validator skill and branch-validation agent. Essential for maintaining 
  consistent development practices across the team.
---

# Git Hooks Enforcer

Enforces git hook standards and validates adherence to development best practices.

## Overview

This skill ensures:
- ✅ Branch names follow org conventions (feature/, bugfix/, docs/, etc.)
- ✅ Commit messages use conventional commit format
- ✅ Pre-commit quality checks pass before committing
- ✅ Code quality standards are maintained
- ✅ Type safety and linting requirements are met
- ✅ Git hooks are integrated with CI/CD pipeline
- ✅ Team follows consistent development workflow

## Standards Enforced

### Branch Naming Convention

**Format:** `{type}/{ticket-id}/{description}`

**Valid Types:**
- `feature/` — New features or enhancements
- `bugfix/` — Bug fixes and corrections
- `docs/` — Documentation updates
- `refactor/` — Code refactoring and cleanup
- `test/` — Test additions and improvements
- `chore/` — Maintenance tasks and dependency updates
- `ci/` — CI/CD configuration and workflow changes

**Examples:**
```
✅ feature/LW-123/add-linear-search
✅ bugfix/LW-456/handle-empty-response
✅ docs/update-api-reference
✅ refactor/simplify-client-logic
✅ test/add-integration-tests
✅ chore/update-dependencies
✅ ci/add-github-actions
```

**Invalid Examples:**
```
❌ main                          (wrong: default branch)
❌ feature-name                  (wrong: missing slash)
❌ add-new-feature              (wrong: no type prefix)
❌ LW-123                        (wrong: no type)
❌ feature/123/add-feature       (wrong: ticket ID format)
```

### Commit Message Format

**Format:** `{type}: {description}` or `{type}({scope}): {description}`

**Supported Types:**
- `feat` — A new feature
- `fix` — A bug fix
- `docs` — Documentation only changes
- `style` — Changes that don't affect code meaning (formatting, semicolons, etc.)
- `refactor` — Code change that neither fixes a bug nor adds a feature
- `perf` — Code change that improves performance
- `test` — Adding or updating tests
- `chore` — Changes to build process, dependencies, etc.
- `ci` — Changes to CI/CD configuration
- `build` — Changes to build system or external dependencies

**Examples:**
```
✅ feat: add Linear search by label
✅ fix: handle empty WordPress response
✅ docs: update API reference
✅ feat(auth): add JWT support
✅ fix(api): correct pagination limit
✅ test: add integration tests for linking
✅ ci: add GitHub Actions workflow
```

**Invalid Examples:**
```
❌ Added new feature              (wrong: no type)
❌ updated code                   (wrong: lowercase, no type)
❌ Feature: add new tool          (wrong: capitalized, extra space)
❌ fix lowercase                  (wrong: description too short)
```

## Pre-Commit Quality Checks

Before each commit, these checks must pass:

### 1. Branch Validation
- Verifies branch name matches convention
- Rejects commits to invalid branches
- Provides helpful guidance for renaming

### 2. Type Checking
```bash
npm run typecheck
```
- TypeScript strict mode enabled
- No implicit `any` types
- Full type coverage required

### 3. Linting
```bash
npm run lint
```
- ESLint validation for `.ts` and `.js` files
- Prettier formatting check
- Auto-fixes styling issues when possible

### 4. Test Coverage
```bash
npm test
```
- Jest unit tests must pass
- 50% coverage threshold minimum
- Coverage reports generated

### 5. Quality Check Suite
```bash
npm run quality-check
```
- All checks bundled together
- Runs TypeScript, Jest, BATS, ESLint
- Required before pushing to main

## Pre-Push Validation

Before pushing to remote, these checks run:

### 1. Full Test Suite
```bash
npm run test:all
```
- Jest unit tests
- BATS integration tests
- Must all pass before push allowed

### 2. Branch Name Validation
- Final check that branch matches convention
- Prevents pushing invalid branch names

### 3. Commit Message Validation
- All commits in push must have valid messages
- Conventional commit format enforced

## Post-Commit Guidance

After each commit, provides next steps:
```
✅ Commit created: abc123d on feature/LW-123/add-feature

Next steps:
  1. Push: git push origin feature/LW-123/add-feature
  2. Create PR on GitHub
  3. Request code review
```

## Workflow Example

### Step 1: Create Branch
```bash
# ✅ Valid
git checkout -b feature/LW-123/add-search-function

# ❌ Invalid - will be rejected
git checkout -b add-search-function
```

### Step 2: Make Changes
```bash
# Edit files...
git add src/
```

### Step 3: Commit
```bash
# ✅ Valid
git commit -m "feat: add search functionality"

# ❌ Invalid - will be rejected
git commit -m "Added search"
git commit -m "Update"
```

Pre-commit hooks run automatically:
- ✅ Branch name validated
- ✅ Quality checks pass
- ✅ Type checking passes
- ✅ Linting passes
- ✅ Tests pass

### Step 4: Push
```bash
git push origin feature/LW-123/add-search-function
```

Pre-push hooks run automatically:
- ✅ Full test suite passes
- ✅ Branch name re-validated
- ✅ Commit messages re-validated

### Step 5: Create Pull Request
```bash
gh pr create --title "Add search functionality" \
             --body "Implements Linear search by label"
```

## Troubleshooting

### "Invalid branch name" Error

**Problem:** Commit rejected due to branch name

**Solution:**
```bash
# Rename the branch to match convention
git branch -m feature/LW-XXX/your-feature

# Or use different type if appropriate
git branch -m bugfix/FIX-123/issue
git branch -m docs/update-readme
```

### "Invalid commit message" Error

**Problem:** Commit message doesn't match format

**Solution:**
```bash
# Use conventional commit format
git commit -m "feat: description of feature"
git commit -m "fix: description of fix"
git commit -m "docs: description of docs"

# With scope (optional)
git commit -m "feat(auth): add JWT support"
```

### Pre-commit Checks Fail

**Problem:** Quality checks or tests fail on commit

**Solution:**
```bash
# Run the checks locally to debug
npm run quality-check

# Fix the issues
# eslint may auto-fix some issues
npm run lint -- --fix

# Stage the fixes
git add src/

# Try commit again
git commit -m "feat: your feature"
```

### Hooks Not Running

**Problem:** Pre-commit or pre-push hooks don't run

**Solution:**
```bash
# Check if Lefthook is installed
npm list lefthook

# Initialize hooks
npx lefthook install

# Verify git hooks are set up
git config core.hooksPath
# Should output: .git/hooks

# Test hooks manually
npx lefthook run pre-commit
```

## Integration with Branch-Validation Agent

This skill works closely with the `branch-validation` agent:

- **Agent validates:** Complex branch naming logic, multiple patterns
- **Skill enforces:** Integration with git workflow, error handling
- **Together:** Ensure consistent, enforced branch naming

The branch-validation agent checks:
- Correct type prefix (feature, bugfix, docs, etc.)
- Proper ticket ID format when required
- Description clarity and completeness
- CI/CD gate compliance

## Integration with Quality-Check Skill

This skill coordinates with `linear-mcp-quality-check`:

- **Quality check runs:** All tests, linting, type checking
- **Hooks enforce:** Pre-commit and pre-push gating
- **Together:** Quality gates at every stage of git workflow

## References

- **Conventional Commits:** https://www.conventionalcommits.org/
- **Git Hooks Guide:** https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks
- **Lefthook Documentation:** https://lefthook.dev/
- **Org Hooks Standards:** https://github.com/lightspeedwp/.github/docs/HOOKS_STANDARDS.md
- **Branch Naming Strategy:** `.lefthook.yml` pre-commit configuration

## When to Bypass Hooks

**Bypass only in true emergencies:**

```bash
# Skip all hooks (ONLY IF NECESSARY)
git commit --no-verify -m "emergency: critical fix"
git push --no-verify
```

**After bypassing:**
1. Create an issue documenting why
2. Schedule a follow-up fix with proper process
3. Ensure CI/CD catches any issues
4. Request urgent review

**Never bypass:**
- Main/develop branch pushes
- Without team discussion
- Security-related changes
- Without CI/CD validation

## Output Examples

### Successful Workflow
```
✅ Branch name valid: feature/LW-123/add-feature
✅ Quality checks passed
✅ TypeScript compilation successful
✅ All tests passed
✅ Commit message format valid
✅ Ready to push
```

### Branch Name Failure
```
❌ Invalid branch name: add-feature

Branch naming convention:
  Format: {type}/{ticket-id}/{description}
  Types: feature, bugfix, docs, refactor, test, chore, ci
  Example: feature/LW-123/add-linear-search

To rename this branch:
  git branch -m add-feature feature/LW-123/your-feature
```

### Commit Message Failure
```
❌ Invalid commit message format

Commit message format:
  {type}: {description}

Examples:
  feat: add Linear search by label
  fix: handle empty WordPress response
  docs: update API reference
  test: add integration tests for linking

Types: feat, fix, docs, style, refactor, perf, test, chore, ci, build
```

## See Also

- **lefthook-config-validator** - Validate Lefthook configuration
- **branch-validation** - Detailed branch validation rules
- **linear-mcp-quality-check** - Comprehensive quality checks
- `.lefthook.yml` - Git hooks configuration file
