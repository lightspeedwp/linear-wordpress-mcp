# References

External documentation, API reference materials, and architectural guides.

## Contents

- **API Documentation** - Linear API, WordPress REST API reference
- **Framework Guides** - MCP protocol, TypeScript SDK documentation
- **Architecture Decisions** - ADRs and design decisions
- **Integration Guides** - How to integrate with other services and MCPs

## Usage

References are loaded as needed by skills and agents. Each reference file should:
- Be self-contained and understandable in isolation
- Include a table of contents for files over 300 lines
- Use clear section headings and examples
- Include version/date information when applicable

## Loading References

In skills, reference documents using:
```
Read this reference: skill://[skill-name]/references/[filename].md
```

## See Also

- `docs/` - User-facing documentation and guides
- `.claude/prompts/` - Skill prompts and instructions
