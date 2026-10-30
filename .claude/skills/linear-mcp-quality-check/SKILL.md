---
name: linear-mcp-quality-check
description: |
  Validate code quality and test coverage for the Linear-WordPress MCP project. 
  Use this skill whenever you need to ensure code meets quality standards before committing, 
  pushing, or merging. It runs all tests (Jest unit + BATS integration), verifies TypeScript 
  compilation with strict mode, runs ESLint linting, and confirms test coverage meets thresholds.
  
  Trigger this skill for:
  - Pre-commit validation
  - Pre-push quality checks
  - CI/CD pipeline validation
  - Code review preparation
  - Release candidate verification
---

# Linear-WordPress MCP Quality Check

A comprehensive code quality validation workflow for the Linear-WordPress MCP project.

## What this skill does

This skill runs a complete quality validation pipeline:

1. **TypeScript Compilation** - Ensures all TypeScript compiles without errors in strict mode
2. **Unit Tests** - Runs Jest test suite with coverage reporting
3. **Integration Tests** - Runs BATS shell integration tests
4. **Linting** - Checks code style with ESLint
5. **Coverage Verification** - Confirms test coverage meets 50% threshold

All checks must pass for the validation to succeed.

## When to use this skill

- **Before committing** — Catch issues early with `npm run quality-check`
- **Before pushing** — Validate branch is ready via pre-push hook
- **In CI/CD pipelines** — Add `npm run quality-check` to GitHub Actions
- **Code review** — Run before asking for review to save reviewers time
- **Release validation** — Final check before tagging a release

## How to run

### Direct command
```bash
cd /Users/ash/Studio/linear-wordpress-mcp
npm run quality-check
```

### In pre-commit hook
Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
npm run quality-check || exit 1
```

### In CI/CD (GitHub Actions)
```yaml
- name: Quality Check
  run: npm run quality-check
```

## What success looks like

All components pass:
- ✅ TypeScript compilation succeeds
- ✅ Jest unit tests: 22 passed (0 failed)
- ✅ BATS integration tests: 61 passed (0 failed)
- ✅ ESLint: 0 errors
- ✅ Coverage: meets 50% threshold

## Output format

The skill reports results in this format:

```
✅ TypeScript compilation: PASSED
✅ Jest tests: 22 passed in 1.2s
✅ BATS tests: 61 passed in 4.3s
✅ ESLint: 0 errors
✅ Coverage: statements 50%, branches 50%, lines 50%, functions 50%

RESULT: All quality checks passed ✓
```

If any check fails:

```
❌ TypeScript compilation: FAILED
  Error: Type 'X' is not assignable to type 'Y'

Stopping quality check. Fix errors above and try again.
```

## Understanding the checks

### TypeScript Compilation
Verifies that all TypeScript code compiles correctly with strict mode enabled:
- No implicit `any` types
- Full type coverage
- No null/undefined errors
- Correct type narrowing

### Jest Unit Tests (22 tests)
Validates MCP server structure:
- All 8 tools properly defined
- Schemas configured correctly
- Tool discovery works
- Handlers are functions

### BATS Integration Tests (61 tests)
Comprehensive project validation:
- Build pipeline works
- File structure is correct
- Documentation is complete
- Git configuration is proper
- Security checks pass
- Environment variables are set
- API credentials format is valid

### ESLint
Checks code style:
- Variable naming conventions
- Import organization
- Unused code
- Code consistency

### Coverage Verification
Ensures test files have adequate code coverage:
- Statement coverage ≥ 50%
- Branch coverage ≥ 50%
- Line coverage ≥ 50%
- Function coverage ≥ 50%

## Troubleshooting

### TypeScript compilation fails
- Check error message for type mismatches
- Run `npm run typecheck` for details
- Ensure all imports are correct

### Jest tests fail
- Run `npm run test:watch` to debug interactively
- Check test output for assertion failures
- Review changes to tools or schemas

### BATS tests fail
- Run `npm run test:bats:verbose` to see detailed test output
- Verify file structure matches expectations
- Check environment variables are set

### ESLint fails
- Run `npm run lint` to see violations
- Most issues can be auto-fixed: `npm run lint -- --fix`
- Review reported code style issues

### Coverage below threshold
- Run `npm test` to see coverage report
- Add or improve tests for uncovered code
- Focus on critical paths first

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Quality Check
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run quality-check
```

### Pre-commit Hook Integration
See the `lefthook` configuration in `.lefthook.yml` for automatic quality checks before commits.

## Performance

Typical execution times:
- TypeScript compilation: 1-2s
- Jest unit tests: 1-2s  
- BATS integration tests: 3-5s
- ESLint: 1-2s
- **Total: 6-11s**

Run in parallel with pre-push hook for speed.

## Next steps after validation

Once quality checks pass:
1. Create a commit with your changes
2. Push to your feature branch
3. Open a pull request
4. Request code review

The validation here doesn't replace human code review — it just ensures the basics are handled before review.
