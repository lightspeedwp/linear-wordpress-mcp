#!/bin/bash
# Linear-WordPress MCP Quality Check
# Validates TypeScript, tests, linting, and coverage

set -e

PROJECT_ROOT="${1:-.}"
cd "$PROJECT_ROOT"

echo "🔍 Starting Linear-WordPress MCP Quality Check..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to run a check
run_check() {
  local name=$1
  local command=$2

  echo -n "Checking $name... "
  if eval "$command" > /tmp/check_output.log 2>&1; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}❌ FAILED${NC}"
    echo ""
    cat /tmp/check_output.log
    echo ""
    ((CHECKS_FAILED++))
  fi
}

# 1. TypeScript Compilation
echo "📦 TypeScript Compilation"
run_check "TypeScript compilation" "npm run build"
echo ""

# 2. Jest Unit Tests
echo "🧪 Jest Unit Tests"
run_check "Jest unit tests" "npm test 2>&1 | grep -q 'Tests:.*passed'"
echo ""

# 3. BATS Integration Tests
echo "🐚 BATS Integration Tests"
run_check "BATS integration tests" "npm run test:bats 2>&1 | grep -q 'tests passed'"
echo ""

# 4. ESLint
echo "📋 ESLint"
run_check "ESLint" "npm run lint"
echo ""

# 5. Type Check
echo "🔍 TypeScript Type Check"
run_check "TypeScript strict mode" "npm run typecheck"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Quality Check Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passed: $CHECKS_PASSED${NC}"
if [ $CHECKS_FAILED -gt 0 ]; then
  echo -e "${RED}❌ Failed: $CHECKS_FAILED${NC}"
  echo ""
  echo "Please fix the issues above and try again."
  exit 1
else
  echo ""
  echo -e "${GREEN}All quality checks passed!${NC}"
  exit 0
fi
