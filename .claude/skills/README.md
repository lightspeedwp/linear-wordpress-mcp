# Skills

Claude skills for specialized development workflows and quality assurance.

## Contents

- **linear-mcp-quality-check/** - Comprehensive code quality validation
  - TypeScript compilation verification
  - Jest unit test execution and coverage
  - BATS integration test execution
  - ESLint code quality checks
  - Coverage threshold enforcement

## Using Skills

Skills are invoked via Claude Code:
```bash
/linear-mcp-quality-check
```

Or via npm:
```bash
npm run quality-check
```

## Available Skills

### 1. Quality Check Skill
Validates all aspects of code quality:
- ✅ TypeScript compilation (strict mode)
- ✅ Jest unit tests (22 tests, 50% coverage threshold)
- ✅ BATS integration tests (61 tests)
- ✅ ESLint and code style
- ✅ Type checking with strict mode

**Trigger:** Use when committing, pushing, or preparing for review

**Input:** Project root directory

**Output:** Pass/fail report with detailed results

### 2. Lefthook Config Validator
Validates Lefthook git hook configuration:
- ✅ `.lefthook.yml` placement and syntax
- ✅ All required hooks defined (pre-commit, commit-msg, pre-push, post-commit)
- ✅ Branch validation integration
- ✅ Commit message validation
- ✅ Script executability

**Trigger:** When setting up Lefthook, migrating from Husky, or troubleshooting hooks

**Input:** Project root directory

**Output:** Validation report with pass/fail per hook type

**Script:** `scripts/validate-lefthook.sh` - Runs comprehensive configuration checks

### 3. Git Hooks Enforcer
Enforces git workflow standards and validates adherence:
- ✅ Branch naming conventions (feature/, bugfix/, docs/, etc.)
- ✅ Commit message format (conventional commits)
- ✅ Pre-commit quality checks
- ✅ Pre-push validation
- ✅ Integration with branch-validation agent

**Trigger:** When starting new work, committing changes, or pushing code

**Input:** Git branch and commit operations

**Output:** Validation feedback, error messages with guidance

## Creating New Skills

To add a new skill:
1. Create a new folder: `skills/skill-name/`
2. Add `SKILL.md` with frontmatter and instructions
3. Add `scripts/` folder for executable scripts
4. Add `references/` for documentation as needed
5. Update this README with the new skill

## See Also

- `SKILL.md` files - Individual skill documentation
- `scripts/` - Skill implementation scripts
- `references/` - Reference materials for skills
