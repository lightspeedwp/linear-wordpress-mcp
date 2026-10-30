# Prompts

Claude Code prompts for specialized workflows and development tasks.

## Contents

- **mcp-extension.prompt.md** - Guidelines for extending MCP with new tools
- **testing.prompt.md** - Test strategy and templates for Jest/BATS
- **debugging.prompt.md** - Debugging workflows and diagnostic tools

## Using Prompts

Prompts are loaded when needed for specific development tasks:

### MCP Extension
When adding new tools to the MCP server:
```
Load prompt: .claude/prompts/mcp-extension.prompt.md
```

### Testing
When writing or debugging tests:
```
Load prompt: .claude/prompts/testing.prompt.md
```

### Debugging
When troubleshooting issues:
```
Load prompt: .claude/prompts/debugging.prompt.md
```

## Prompt Guidelines

Prompts should:
- Be focused on a specific task or workflow
- Include concrete examples and templates
- Link to related documentation
- Be under 500 lines when possible
- Use clear section headings

## See Also

- `references/` - Reference materials and external documentation
- `.claude/skills/` - Reusable skills for complex workflows
- `docs/` - User-facing documentation
