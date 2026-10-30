# Scripts

Executable scripts and automation tools for development, testing, and deployment.

## Contents

- **quality-check.sh** - Comprehensive code quality validation (TypeScript, tests, linting)
- **build.sh** - Build and deployment scripts
- **test-automation** - Test runner and coverage analysis scripts
- **git-hooks** - Git hook scripts (via lefthook)

## Running Scripts

All scripts should be executable:
```bash
chmod +x scripts/*.sh
./scripts/script-name.sh
```

Scripts are also available via npm:
```bash
npm run quality-check  # Runs scripts/quality-check.sh
```

## Guidelines

Scripts should:
- Be executable (mode 755)
- Include a shebang line (`#!/bin/bash`)
- Handle errors gracefully
- Provide clear output and exit codes
- Be idempotent when possible
- Include comments for complex logic

## See Also

- `package.json` - npm scripts configuration
- `.lefthook.yml` - Git hook automation via Lefthook
- `tests/` - Test suites and testing documentation
