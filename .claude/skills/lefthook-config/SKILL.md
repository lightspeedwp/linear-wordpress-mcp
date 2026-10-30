---
name: lefthook-config-validator
description: |
  Validates Lefthook configuration for git hooks in the Linear-WordPress MCP project. 
  Use this skill whenever you need to verify .lefthook.yml setup, ensure hooks are properly 
  configured, validate hook structure and commands, or troubleshoot git hook issues. 
  Checks configuration against LightSpeed WP org-wide standards and the branch-validation 
  agent requirements. Specifically designed for migrating from Husky to Lefthook.
---

# Lefthook Configuration Validator

A comprehensive validation skill for Lefthook git hooks configuration in the Linear-WordPress MCP project.

## Overview

This skill validates that:
- ✅ `.lefthook.yml` is located in the project root
- ✅ Configuration follows Lefthook v1+ structure
- ✅ All required hooks are defined (pre-commit, pre-push, commit-msg, post-commit)
- ✅ Hook commands match LightSpeed WP org standards
- ✅ Branch validation is integrated with the branch-validation agent
- ✅ Commit message validation follows conventional commit format
- ✅ Git hook scripts are properly executable

## When to Use

**Use this skill when:**
- Setting up Lefthook for the first time
- Validating existing `.lefthook.yml` configuration
- Migrating from Husky to Lefthook
- Adding or modifying git hooks
- Debugging hook execution issues
- Running pre-commit quality checks
- CI/CD pipeline validation
- Onboarding new team members

**Triggers:** Keywords include "lefthook", "git hooks", "pre-commit", ".lefthook.yml", "branch validation", "commit message", "hook config", "hook validation"

## Required Configuration

### .lefthook.yml Location
**Must be in the project root**, not in `.git/hooks`:
```
linear-wordpress-mcp/
├── .lefthook.yml       ← HERE
├── .git/
├── package.json
└── ...
```

### Required Sections
All projects need these hook definitions:

1. **pre-commit** - Runs before commit (linting, formatting, quality checks)
2. **commit-msg** - Validates commit message format (conventional commits)
3. **pre-push** - Runs before push (final validation, branch name check)
4. **post-commit** - Informational (provides next-step guidance)

## Validation Checklist

### File Structure
- [ ] `.lefthook.yml` exists in project root
- [ ] File is valid YAML (no syntax errors)
- [ ] `min_nodejs_version` is set to 18+
- [ ] `node_compat` is true (for Cloudflare Workers compatibility)

### Hook Configuration
- [ ] **pre-commit**: Runs branch validation, quality checks, type checking
- [ ] **commit-msg**: Validates conventional commit format (feat:, fix:, docs:, etc.)
- [ ] **pre-push**: Runs full test suite before push
- [ ] **post-commit**: Provides guidance and next steps

### Branch Validation
- [ ] Branch naming pattern matches: `(feature|bugfix|docs|refactor|test|chore|ci)/`
- [ ] Validates against branch-validation agent requirements
- [ ] Rejects invalid branch names with helpful error message
- [ ] Example valid branches: `feature/LW-123/add-feature`, `bugfix/fix-issue`

### Commit Message Validation
- [ ] Format: `{type}: {description}` (e.g., `feat: add new tool`)
- [ ] Supported types: feat, fix, docs, style, refactor, perf, test, chore, ci, build
- [ ] Rejects invalid format with example
- [ ] Optional scope: `feat(auth): add login` is valid

### Script Execution
- [ ] All hook scripts are executable (mode 755)
- [ ] Scripts use proper shebang (`#!/bin/bash` for bash scripts)
- [ ] Scripts handle errors gracefully
- [ ] Scripts exit with appropriate exit codes

## Integration with Branch-Validation Agent

This skill coordinates with the `branch-validation` agent to:

1. **Enforce consistent branch naming** across all development work
2. **Validate branch types** before commits (feature, bugfix, docs, etc.)
3. **Integrate CI/CD gates** to prevent invalid branches from being pushed
4. **Provide helpful feedback** when branch names don't match pattern

The `.lefthook.yml` pre-commit hook calls the branch-validation agent:
```bash
git symbolic-ref --short HEAD | grep -qE '^(feature|bugfix|docs|refactor|test|chore|ci)/'
```

## Common Issues and Fixes

### Issue: Hooks Not Running
**Cause:** Git hooks path not configured correctly

**Fix:**
```bash
# Verify Lefthook is installed
npm list lefthook

# Install Lefthook if missing
npm install lefthook --save-dev

# Initialize hooks
npx lefthook install

# Verify hooks are installed
git config core.hooksPath
# Should output: .git/hooks
```

### Issue: "Invalid branch name" on Commit
**Cause:** Branch doesn't match validation pattern

**Fix:**
```bash
# Rename branch to match pattern
git branch -m feature/LW-XXX/your-feature-description

# Or use bugfix, docs, test, chore, ci prefixes
# Pattern: (feature|bugfix|docs|refactor|test|chore|ci)/{ticket-id}/{description}
```

### Issue: Commit Message Rejected
**Cause:** Message format invalid

**Fix:**
```bash
# Use conventional commit format
git commit -m "feat: description of change"
git commit -m "fix: address specific issue"
git commit -m "docs: update README"

# With scope (optional)
git commit -m "feat(auth): add JWT support"
```

### Issue: Pre-push Validation Fails
**Cause:** Tests or quality checks failing

**Fix:**
```bash
# Run locally first
npm run test:all
npm run quality-check

# Fix issues, stage changes, try again
git push
```

## Setup Instructions

### 1. Install Lefthook
```bash
npm install --save-dev lefthook
```

### 2. Create .lefthook.yml
Copy the template from `references/lefthook-template.yml` or use:
```bash
npx lefthook install
```

### 3. Configure Hooks
Update `.lefthook.yml` with project-specific commands (see references)

### 4. Initialize Git Hooks
```bash
npx lefthook install
```

### 5. Verify Setup
```bash
# Test branch validation
git checkout -b feature/test/test-branch
# Should succeed

git checkout -b invalid-branch
# Should be rejected
```

## Troubleshooting

### Enable Debug Mode
```bash
# See what hooks are running
LEFTHOOK_DEBUG=true git commit -m "test commit"

# Check hook status
npx lefthook status

# Run hooks manually
npx lefthook run pre-commit
```

### Skip Hooks (Emergency Only)
```bash
# Skip all hooks (NOT RECOMMENDED)
git commit --no-verify -m "emergency fix"

# Skip specific hook type (NOT RECOMMENDED)
# Not easily done with Lefthook; use full --no-verify
```

## References

- **Lefthook Documentation:** https://lefthook.dev/
- **Conventional Commits:** https://www.conventionalcommits.org/
- **Branch Naming Standards:** See `.lefthook.yml` and branch-validation agent
- **Org Hooks Standards:** https://github.com/lightspeedwp/.github/docs/HOOKS_STANDARDS.md

## Related Skills

- **branch-validation** - Validates branch names against org standards
- **linear-mcp-quality-check** - Comprehensive code quality validation
- **commit-linting** - Validates commit message format

## Output Format

When run, this skill produces:
```
✅ Configuration Valid
  - .lefthook.yml found in project root
  - YAML syntax valid
  - All required hooks defined
  - Branch validation configured
  - Commit message validation configured
  - Scripts are executable

Status: READY
```

Or if issues found:
```
❌ Configuration Issues Found

- ❌ .lefthook.yml not found in project root
  Fix: Run `npx lefthook install` or create .lefthook.yml
  
- ⚠️  Hook script not executable
  Fix: Run `chmod +x .git/hooks/pre-commit`

Status: NEEDS ATTENTION
```

## See Also

- `.lefthook.yml` - The actual hook configuration
- `.claude/skills/linear-mcp-quality-check/` - Quality validation skill
- `docs/` - Project documentation including hook guides
