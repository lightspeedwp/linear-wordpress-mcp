#!/bin/bash
# Validate Lefthook configuration for Linear-WordPress MCP
# Usage: ./validate-lefthook.sh

set -e

PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
LEFTHOOK_CONFIG="$PROJECT_ROOT/.lefthook.yml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Validating Lefthook Configuration"
echo "📁 Project Root: $PROJECT_ROOT"
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0

# Helper functions
check_pass() {
  echo -e "${GREEN}✅ PASS${NC}: $1"
  ((CHECKS_PASSED++))
}

check_fail() {
  echo -e "${RED}❌ FAIL${NC}: $1"
  ((CHECKS_FAILED++))
}

check_warn() {
  echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

# 1. Check if .lefthook.yml exists
echo "1️⃣  Configuration File"
if [ -f "$LEFTHOOK_CONFIG" ]; then
  check_pass ".lefthook.yml exists in project root"
else
  check_fail ".lefthook.yml not found in project root"
  echo "  Run: npx lefthook install"
fi
echo ""

# 2. Validate YAML syntax
echo "2️⃣  YAML Syntax"
if [ -f "$LEFTHOOK_CONFIG" ]; then
  if command -v yamllint &> /dev/null; then
    if yamllint -d relaxed "$LEFTHOOK_CONFIG" > /dev/null 2>&1; then
      check_pass "YAML syntax is valid"
    else
      check_fail "YAML syntax errors found"
    fi
  else
    check_warn "yamllint not installed, skipping syntax check"
  fi
else
  check_warn "Cannot validate YAML - .lefthook.yml not found"
fi
echo ""

# 3. Check for required hook sections
echo "3️⃣  Required Hooks"
if [ -f "$LEFTHOOK_CONFIG" ]; then
  for hook in "pre-commit" "commit-msg" "pre-push"; do
    if grep -q "^$hook:" "$LEFTHOOK_CONFIG"; then
      check_pass "Hook '$hook' is defined"
    else
      check_fail "Hook '$hook' is not defined"
    fi
  done
else
  check_warn "Cannot check hooks - .lefthook.yml not found"
fi
echo ""

# 4. Check branch validation
echo "4️⃣  Branch Validation"
if [ -f "$LEFTHOOK_CONFIG" ]; then
  if grep -q "branch-check" "$LEFTHOOK_CONFIG" || grep -q "branch-validation" "$LEFTHOOK_CONFIG"; then
    check_pass "Branch validation is configured"
  else
    check_fail "Branch validation hook not found"
  fi
else
  check_warn "Cannot check branch validation - .lefthook.yml not found"
fi
echo ""

# 5. Check commit message validation
echo "5️⃣  Commit Message Validation"
if [ -f "$LEFTHOOK_CONFIG" ]; then
  if grep -q "validate-commit" "$LEFTHOOK_CONFIG" || grep -q "commit.*format" "$LEFTHOOK_CONFIG"; then
    check_pass "Commit message validation is configured"
  else
    check_fail "Commit message validation not found"
  fi
else
  check_warn "Cannot check commit validation - .lefthook.yml not found"
fi
echo ""

# 6. Check if Lefthook is installed
echo "6️⃣  Lefthook Installation"
if command -v lefthook &> /dev/null; then
  LEFTHOOK_VERSION=$(lefthook version 2>/dev/null || echo "unknown")
  check_pass "Lefthook CLI is installed (version: $LEFTHOOK_VERSION)"
else
  if [ -f "$PROJECT_ROOT/node_modules/.bin/lefthook" ]; then
    check_pass "Lefthook is installed via npm"
  else
    check_fail "Lefthook is not installed"
    echo "  Run: npm install --save-dev lefthook"
  fi
fi
echo ""

# 7. Check Git hooks are initialized
echo "7️⃣  Git Hooks Status"
HOOKS_PATH=$(git config core.hooksPath 2>/dev/null || echo "")
if [ -n "$HOOKS_PATH" ]; then
  check_pass "Git hooks path is configured: $HOOKS_PATH"
else
  check_warn "Git hooks path is not configured"
  echo "  Run: npx lefthook install"
fi
echo ""

# 8. Check hook script executability
echo "8️⃣  Hook Script Permissions"
GIT_DIR=$(git rev-parse --git-dir 2>/dev/null || echo ".git")
if [ -d "$GIT_DIR/hooks" ]; then
  for hook_file in "$GIT_DIR/hooks"/{pre-commit,commit-msg,pre-push,post-commit}; do
    if [ -f "$hook_file" ]; then
      if [ -x "$hook_file" ]; then
        check_pass "Hook script is executable: $(basename "$hook_file")"
      else
        check_fail "Hook script is not executable: $(basename "$hook_file")"
        echo "  Run: chmod +x $hook_file"
      fi
    fi
  done
else
  check_warn "Git hooks directory not found (hooks may not be initialized)"
fi
echo ""

# 9. Check branch naming on current branch
echo "9️⃣  Current Branch"
if command -v git &> /dev/null; then
  CURRENT_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "unknown")
  PATTERN="^(feature|bugfix|docs|refactor|test|chore|ci)/"

  if [[ "$CURRENT_BRANCH" =~ $PATTERN ]]; then
    check_pass "Current branch '$CURRENT_BRANCH' matches naming convention"
  else
    if [ "$CURRENT_BRANCH" != "unknown" ] && [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "develop" ]; then
      check_warn "Current branch '$CURRENT_BRANCH' does not match naming convention"
      echo "  Expected format: feature/LW-XXX/description"
    else
      check_pass "On default branch: $CURRENT_BRANCH (naming check skipped)"
    fi
  fi
else
  check_warn "Git not available, cannot check current branch"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Lefthook Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passed: $CHECKS_PASSED${NC}"
if [ $CHECKS_FAILED -gt 0 ]; then
  echo -e "${RED}❌ Failed: $CHECKS_FAILED${NC}"
  echo ""
  echo "⚠️  Some checks failed. Please review the issues above."
  exit 1
else
  echo ""
  echo -e "${GREEN}All checks passed! Lefthook is properly configured.${NC}"
  exit 0
fi
