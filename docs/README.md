# Linear-WordPress MCP - Documentation Index

Complete documentation for setting up, deploying, and securing the Linear-WordPress MCP server.

---

## 🚀 Quick Start by Path

Choose your path based on what you need:

| Path | Time | For You | Start Here |
|------|------|---------|-----------|
| ⚡ **Just Deploy** | 10 min | Experienced devs | [QUICKSTART_CLOUDFLARE.md](QUICKSTART_CLOUDFLARE.md) |
| 📋 **Complete Setup** | 1.5 hrs | First-time setup | [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md) |
| 🔒 **Just Security** | 20 min | Auth/ops focused | [SECURITY_AUTHENTICATION.md](SECURITY_AUTHENTICATION.md) |
| 🔑 **Just GitHub** | 15 min | DevOps focused | [GITHUB_SECRETS.md](GITHUB_SECRETS.md) |

---

## 📚 Core Documentation

### Deployment & Setup (NEW - Cloudflare Workers)

- **[QUICKSTART_CLOUDFLARE.md](QUICKSTART_CLOUDFLARE.md)** — 5-minute deployment to Cloudflare Workers
- **[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)** — Full end-to-end setup from scratch
- **[CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)** — Detailed Cloudflare Workers guide

### Security & Configuration (NEW)

- **[SECURITY_AUTHENTICATION.md](SECURITY_AUTHENTICATION.md)** — Authentication token management and security
- **[GITHUB_SECRETS.md](GITHUB_SECRETS.md)** — GitHub Actions secrets configuration

### User Guides

- **[README.md](../README.md)** — Feature overview and getting started
- **[SETUP_GUIDE.md](../SETUP_GUIDE.md)** — Step-by-step installation guide
- **[QUICK_REFERENCE.md](../QUICK_REFERENCE.md)** — Common commands and workflows

### Integration Guides

- **[MULTI_MCP_GUIDE.md](../MULTI_MCP_GUIDE.md)** — Using multiple MCPs together (Zendesk, GitHub, Slack)
- **[docs/API_REFERENCE.md](./API_REFERENCE.md)** — Complete tool and parameter reference

### Testing & Validation

- **[TESTING_GUIDE.md](../TESTING_GUIDE.md)** — Test cases for verification
- **[docs/TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** — Common issues and solutions
- **[docs/DEPLOYMENT.md](./DEPLOYMENT.md)** — Production deployment procedures

---

## Technical Documentation

### Architecture & Design

- **[ARCHITECTURE.md](../ARCHITECTURE.md)** — System design and request flow
- **[docs/API_REFERENCE.md](./API_REFERENCE.md)** — Detailed API parameters and responses

### Developer Guides

- **[CLAUDE.md](../CLAUDE.md)** — Developer context and extension guide
- **[AGENTS.md](../AGENTS.md)** — Available agents and skills
- **[docs/DEPLOYMENT.md](./DEPLOYMENT.md)** — Deployment and CI/CD

### Configuration

- **[.claude/mcp.json](./../.claude/mcp.json)** — MCP server configuration
- **[.claude/instructions.md](./../.claude/instructions.md)** — Claude Code setup
- **[.github/ files](./../.github/)** — GitHub Actions and automation

---

## Project Management

- **[CHANGELOG.md](../CHANGELOG.md)** — Version history and releases
- **[PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md)** — Project overview
- **[DELIVERY_SUMMARY.md](../DELIVERY_SUMMARY.md)** — Delivered features and roadmap

---

## Quick Links

### Setup

```bash
# Install dependencies
npm install

# Build the MCP
npm run build

# Start in development mode
npm run dev

# Run tests
npm run test
```

### Documentation Files in Order

1. **README.md** — What this is and how to use it
2. **SETUP_GUIDE.md** — Get your credentials and start
3. **QUICK_REFERENCE.md** — Common commands
4. **TESTING_GUIDE.md** — Verify it works
5. **MULTI_MCP_GUIDE.md** — Integrate with other systems
6. **docs/API_REFERENCE.md** — Look up tool details
7. **docs/TROUBLESHOOTING.md** — Debug problems
8. **ARCHITECTURE.md** — Understand the design
9. **docs/DEPLOYMENT.md** — Production setup
10. **CLAUDE.md** — Extend and develop

---

## By Use Case

### I want to...

#### Deploy to Cloudflare Workers (NEW!)
1. Quick: [QUICKSTART_CLOUDFLARE.md](QUICKSTART_CLOUDFLARE.md) — 10-minute deploy
2. Full: [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md) — Complete end-to-end
3. Details: [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) — Full reference
4. Security: [SECURITY_AUTHENTICATION.md](SECURITY_AUTHENTICATION.md) — Auth setup
5. GitHub: [GITHUB_SECRETS.md](GITHUB_SECRETS.md) — Actions automation

#### Use the MCP in Claude
1. [SETUP_GUIDE.md](../SETUP_GUIDE.md) — Set up credentials
2. [.claude/instructions.md](./../.claude/instructions.md) — Add to Claude Code
3. [QUICK_REFERENCE.md](../QUICK_REFERENCE.md) — See available commands

#### Integrate with other MCPs
1. [MULTI_MCP_GUIDE.md](../MULTI_MCP_GUIDE.md) — Integration patterns
2. [.claude/mcp.json](./../.claude/mcp.json) — Configure multiple MCPs
3. [TESTING_GUIDE.md](../TESTING_GUIDE.md) — Test the integration

#### Test the MCP
1. [TESTING_GUIDE.md](../TESTING_GUIDE.md) — Run test cases
2. [docs/TROUBLESHOOTING.md](./TROUBLESHOOTING.md) — Fix issues
3. [docs/API_REFERENCE.md](./API_REFERENCE.md) — Verify parameters

#### Extend the MCP
1. [CLAUDE.md](../CLAUDE.md) — Developer context
2. [ARCHITECTURE.md](../ARCHITECTURE.md) — System design
3. [AGENTS.md](../AGENTS.md) — Available development tools
4. [docs/API_REFERENCE.md](./API_REFERENCE.md) — Tool reference

#### Debug a problem
1. [docs/TROUBLESHOOTING.md](./TROUBLESHOOTING.md) — Common issues
2. [TESTING_GUIDE.md](../TESTING_GUIDE.md) — Diagnostic tests
3. [docs/API_REFERENCE.md](./API_REFERENCE.md) — Tool parameters
4. [CLAUDE.md](../CLAUDE.md) — Developer resources

---

## Documentation Standards

All documentation follows these standards:

- **Markdown format** (.md files)
- **Organized by section** with clear headings
- **Code examples** for each major concept
- **Links to related docs** for navigation
- **Updated with each release** (CHANGELOG.md)

---

## File Structure

```
linear-wordpress-mcp/
├── README.md                    # Main overview
├── SETUP_GUIDE.md              # Installation guide
├── QUICK_REFERENCE.md          # Command cheat sheet
├── TESTING_GUIDE.md            # Test procedures
├── MULTI_MCP_GUIDE.md          # Multi-system workflows
├── ARCHITECTURE.md             # System design
├── CLAUDE.md                   # Developer guide
├── CHANGELOG.md                # Version history
├── AGENTS.md                   # Available tools (NEW)
├── PROJECT_SUMMARY.md          # Project overview
├── DELIVERY_SUMMARY.md         # Delivery details
├── .claude/
│   ├── mcp.json               # MCP configuration
│   └── instructions.md         # Claude Code setup
├── .github/
│   ├── branch-labels.yml       # Label automation
│   ├── branch-types.yml        # Branch conventions
│   ├── changelog-rules.yml     # Changelog config
│   ├── issue-types.yml         # Issue types
│   ├── labeler.yml             # Auto-labeler
│   └── labels.yml              # Label taxonomy
├── docs/                       # Documentation folder (NEW)
│   ├── README.md              # This file (docs index)
│   ├── API_REFERENCE.md       # Tool reference (NEW)
│   ├── TROUBLESHOOTING.md     # Common issues (NEW)
│   └── DEPLOYMENT.md          # Production guide (NEW)
├── src/
│   ├── index.ts               # MCP server
│   ├── linear/
│   │   └── client.ts          # Linear API client
│   ├── wordpress/
│   │   └── client.ts          # WordPress REST client
│   ├── tools/                 # Tool implementations
│   └── types/                 # TypeScript types
└── package.json               # Dependencies
```

---

## Contributing

When adding documentation:

1. Follow the file structure above
2. Use consistent markdown formatting
3. Include code examples
4. Link to related documentation
5. Update CHANGELOG.md with changes
6. Add entry to this README.md index

---

## Support

- **Questions?** Check [docs/TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Need help?** See [SETUP_GUIDE.md](../SETUP_GUIDE.md)
- **Found a bug?** See [docs/TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Want to extend?** See [CLAUDE.md](../CLAUDE.md)

---

Last Updated: 2026-10-30
