#!/usr/bin/env bats

# BATS tests for Linear-WordPress MCP integration

setup() {
  # Set up test environment
  export NODE_ENV="test"
  export LINEAR_API_KEY="lin_api_test_key"
  export WORDPRESS_REST_API_URL="https://test.local/wp-json/wp/v2"
  export WORDPRESS_AUTH_USER="testuser"
  export WORDPRESS_AUTH_PASSWORD="testpass1234"

  # Navigate to project root
  cd "${BATS_TEST_DIRNAME}/.."
}

teardown() {
  # Clean up after tests
  :
}

# Build tests

@test "npm install completes successfully" {
  run npm install --silent
  [ "$status" -eq 0 ]
  [ -d "node_modules" ]
}

@test "npm run build produces dist/ folder" {
  run npm run build
  [ "$status" -eq 0 ]
  [ -d "dist" ]
}

@test "dist/index.js is executable" {
  [ -f "dist/index.js" ]
  [ -x "dist/index.js" ]
}

@test "package.json is valid JSON" {
  run jq empty package.json
  [ "$status" -eq 0 ]
}

@test "tsconfig.json is valid JSON" {
  run jq empty tsconfig.json
  [ "$status" -eq 0 ]
}

@test "jest.config.js exists" {
  [ -f "jest.config.js" ]
}

# Environment tests

@test "LINEAR_API_KEY environment variable is set" {
  [ -n "$LINEAR_API_KEY" ]
  [[ "$LINEAR_API_KEY" =~ ^lin_api_ ]]
}

@test "WORDPRESS_REST_API_URL environment variable is set" {
  [ -n "$WORDPRESS_REST_API_URL" ]
  [[ "$WORDPRESS_REST_API_URL" =~ wp-json/wp/v2 ]]
}

@test "WORDPRESS_AUTH_USER environment variable is set" {
  [ -n "$WORDPRESS_AUTH_USER" ]
}

@test "WORDPRESS_AUTH_PASSWORD environment variable is set" {
  [ -n "$WORDPRESS_AUTH_PASSWORD" ]
}

# File structure tests

@test "src/ directory exists" {
  [ -d "src" ]
}

@test "src/index.ts exists" {
  [ -f "src/index.ts" ]
}

@test "src/linear/ directory exists" {
  [ -d "src/linear" ]
}

@test "src/linear/client.ts exists" {
  [ -f "src/linear/client.ts" ]
}

@test "src/wordpress/ directory exists" {
  [ -d "src/wordpress" ]
}

@test "src/wordpress/client.ts exists" {
  [ -f "src/wordpress/client.ts" ]
}

@test "src/tools/ directory exists" {
  [ -d "src/tools" ]
}

@test "src/tools/index.ts exists" {
  [ -f "src/tools/index.ts" ]
}

@test "src/types/ directory exists" {
  [ -d "src/types" ]
}

@test "src/types/index.ts exists" {
  [ -f "src/types/index.ts" ]
}

# Documentation tests

@test "README.md exists and is not empty" {
  [ -s "README.md" ]
}

@test "SETUP_GUIDE.md exists and is not empty" {
  [ -s "SETUP_GUIDE.md" ]
}

@test "CLAUDE.md exists and is not empty" {
  [ -s "CLAUDE.md" ]
}

@test "CHANGELOG.md exists and is not empty" {
  [ -s "CHANGELOG.md" ]
}

@test "AGENTS.md exists and is not empty" {
  [ -s "AGENTS.md" ]
}

@test "docs/ directory exists" {
  [ -d "docs" ]
}

@test "docs/README.md exists" {
  [ -f "docs/README.md" ]
}

@test "docs/API_REFERENCE.md exists" {
  [ -f "docs/API_REFERENCE.md" ]
}

@test "docs/TROUBLESHOOTING.md exists" {
  [ -f "docs/TROUBLESHOOTING.md" ]
}

@test "docs/DEPLOYMENT.md exists" {
  [ -f "docs/DEPLOYMENT.md" ]
}

# Configuration tests

@test ".claude/ directory exists" {
  [ -d ".claude" ]
}

@test ".claude/mcp.json exists" {
  [ -f ".claude/mcp.json" ]
}

@test ".claude/mcp.json is valid JSON" {
  run jq empty ".claude/mcp.json"
  [ "$status" -eq 0 ]
}

@test ".claude/instructions.md exists" {
  [ -f ".claude/instructions.md" ]
}

@test ".github/ directory exists" {
  [ -d ".github" ]
}

@test ".github/labels.yml exists" {
  [ -f ".github/labels.yml" ]
}

@test ".env.example exists" {
  [ -f ".env.example" ]
}

@test ".gitignore exists" {
  [ -f ".gitignore" ]
}

# Test infrastructure tests

@test "__tests__/ directory exists" {
  [ -d "__tests__" ]
}

@test "__tests__/ contains test files" {
  [ $(find __tests__ -name "*.test.ts" | wc -l) -gt 0 ]
}

@test "tests/ directory exists" {
  [ -d "tests" ]
}

@test "tests/integration.bats exists" {
  [ -f "tests/integration.bats" ]
}

# Linting and type checking tests

@test "TypeScript compilation succeeds" {
  run npm run build
  [ "$status" -eq 0 ]
}

@test "npm run typecheck succeeds" {
  run npm run typecheck
  [ "$status" -eq 0 ]
}

@test "ESLint configuration exists" {
  [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ] || [ -f ".eslintrc.yml" ]
}

# Git tests

@test ".git directory exists" {
  [ -d ".git" ]
}

@test "git log shows commits" {
  run sh -c "git log --oneline | wc -l"
  [ "$output" -gt 0 ]
}

@test ".gitignore excludes node_modules" {
  run grep -q "node_modules" ".gitignore"
  [ "$status" -eq 0 ]
}

@test ".gitignore excludes dist" {
  run grep -q "dist" ".gitignore"
  [ "$status" -eq 0 ]
}

@test ".gitignore excludes .env" {
  run grep -q ".env" ".gitignore"
  [ "$status" -eq 0 ]
}

# Security tests

@test ".env file is not tracked by git" {
  run sh -c "git ls-files | grep -q '^.env$'"
  [ "$status" -ne 0 ]
}

@test "dist/ is not tracked by git" {
  run sh -c "git ls-files | grep -q '^dist/'"
  [ "$status" -ne 0 ]
}

@test "node_modules/ is not tracked by git" {
  run sh -c "git ls-files | grep -q '^node_modules/'"
  [ "$status" -ne 0 ]
}

# API Key validation tests

@test "Linear API key format is valid" {
  [[ "$LINEAR_API_KEY" =~ ^lin_api_[a-zA-Z0-9_]{20,}$ ]]
}

@test "WordPress URL has wp-json endpoint" {
  [[ "$WORDPRESS_REST_API_URL" =~ /wp-json/wp/v2$ ]]
}

@test "WordPress password meets minimum length" {
  [ ${#WORDPRESS_AUTH_PASSWORD} -ge 8 ]
}

# Performance and limits tests

@test "jest.config.js has coverage threshold" {
  run grep -q "coverageThreshold" "jest.config.js"
  [ "$status" -eq 0 ]
}

@test "jest.config.js requires 100% coverage" {
  run grep -q '"lines": 100' "jest.config.js"
  [ "$status" -eq 0 ]
}

@test "package.json has test script" {
  run jq -e '.scripts.test' package.json
  [ "$status" -eq 0 ]
}

@test "package.json has test:bats script" {
  run jq -e '.scripts["test:bats"]' package.json
  [ "$status" -eq 0 ]
}

@test "package.json has test:all script" {
  run jq -e '.scripts["test:all"]' package.json
  [ "$status" -eq 0 ]
}
