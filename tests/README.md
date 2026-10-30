# Tests

Integration and shell script tests using BATS (Bash Automated Testing System).

## Structure

- **integration.bats** - Comprehensive integration tests for the project
  - Build pipeline validation
  - File structure verification
  - Documentation completeness checks
  - Git configuration validation
  - Security checks
  - Environment variable validation

## Running Tests

Run all BATS tests:
```bash
npm run test:bats
```

Run with verbose output:
```bash
npm run test:bats:verbose
```

## Test Coverage

Current test suite includes 61 BATS tests covering:
- ✅ TypeScript build process
- ✅ Project file organization
- ✅ Documentation completeness
- ✅ Configuration files
- ✅ Git hooks setup
- ✅ Security checks
- ✅ Environment variables

## Writing Tests

BATS tests follow this pattern:
```bash
@test "description of what is tested" {
  # Arrange
  setup_test_files
  
  # Act
  run actual_command
  
  # Assert
  [ "$status" -eq 0 ]
  [[ "$output" == *"expected"* ]]
}
```

See [BATS documentation](https://github.com/bats-core/bats-core) for full syntax.

## See Also

- `__tests__/` - Jest unit tests
- `package.json` - Test scripts (npm test, npm run test:bats)
- `jest.config.cjs` - Jest configuration
