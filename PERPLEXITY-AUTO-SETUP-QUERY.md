# Perplexity Query: Automatic NPM Package Setup for MCP Servers

## Core Problem
I have an npm package `@endlessblink/rough-cuts-mcp` that contains an MCP (Model Context Protocol) server. When users install it globally via `npm install -g @endlessblink/rough-cuts-mcp`, it needs to automatically configure Claude Desktop by updating the user's `claude_desktop_config.json` file with the correct paths to the installed MCP server.

Currently, the setup only works if users manually run additional commands after installation, but I need it to be 100% automatic.

## Current Package Structure
```
@endlessblink/rough-cuts-mcp/
├── package.json (has postinstall: "node setup-universal.js")
├── setup-universal.js (updates claude_desktop_config.json)
├── mcp-server/
│   └── dist/
│       └── index.js (the actual MCP server)
└── claude-dev-guidelines/ (markdown files)
```

## Current Issues
1. **postinstall scripts don't always run** with global npm installs (`npm install -g`)
2. **Users expect zero manual steps** - just `npm install -g package-name` should work
3. **Need cross-platform compatibility** (Windows/macOS/Linux)
4. **Different npm installation methods** (global vs local vs npx) need different handling

## Specific Questions

### 1. NPM Global Installation Hooks
- **What are the most reliable ways to ensure setup scripts run automatically after `npm install -g package-name`?**
- **Do postinstall scripts work consistently with global installs across npm versions?**
- **Are there alternative npm lifecycle hooks that work better for global packages?**
- **Should I use `preinstall`, `postinstall`, `prepack`, or other hooks?**

### 2. NPX Auto-Setup Pattern
- **How can I structure the package so `npx @endlessblink/rough-cuts-mcp` automatically runs setup?**
- **What's the best way to make npx both install AND configure in a single command?**
- **Should the main entry point be the setup script or the MCP server itself?**
- **How do I handle cases where users run npx multiple times?**

### 3. Cross-Platform File Path Resolution
- **Best practices for dynamically finding the installed package location across platforms?**
- **How to reliably construct paths to `claude_desktop_config.json` on Windows/macOS/Linux?**
- **Handling different npm installation directories (system vs user vs custom)?**
- **Should I use `__dirname`, `process.cwd()`, or `require.resolve()` for path detection?**

### 4. Package.json Configuration
```json
{
  "name": "@endlessblink/rough-cuts-mcp",
  "main": "setup-universal.js",
  "bin": {
    "rough-cuts-install": "setup-universal.js"
  },
  "scripts": {
    "postinstall": "node setup-universal.js"
  }
}
```
- **Is this the optimal package.json setup for automatic configuration?**
- **Should `main` point to setup script or MCP server?**
- **Best practices for the `bin` field for auto-setup packages?**
- **Alternative package.json patterns for zero-setup npm packages?**

### 5. Error Handling & Fallbacks
- **What happens when postinstall fails (permissions, missing directories)?**
- **How to provide clear user feedback when automatic setup fails?**
- **Should the package work partially even if config update fails?**
- **Best practices for handling existing config files without overwriting user settings?**

### 6. Similar Package Examples
- **Examples of npm packages that automatically configure other applications on install?**
- **How do packages like `create-react-app`, `@nestjs/cli`, or similar tools handle auto-setup?**
- **MCP server packages that successfully auto-configure Claude Desktop?**
- **npm packages that modify system/application config files automatically?**

### 7. Alternative Approaches
- **Would an installer script (separate from npm) be more reliable?**
- **Using npm scripts vs standalone executables for setup?**
- **Docker or containerized approaches for guaranteed environment setup?**
- **Should I provide multiple installation methods (npm + manual + installer)?**

## Expected Outcome
A robust installation pattern where:
1. User runs: `npm install -g @endlessblink/rough-cuts-mcp` 
2. Package automatically detects its installation location
3. Updates `claude_desktop_config.json` with correct paths
4. Works across Windows/macOS/Linux
5. Handles edge cases gracefully
6. Provides clear feedback to user

## Context
- **Target users**: Developers and content creators using Claude Desktop
- **Package type**: MCP (Model Context Protocol) server for AI integration
- **Installation requirement**: Must work with Claude Desktop application
- **User expectation**: Zero manual configuration steps
- **Criticality**: High - package is unusable if setup fails

Please provide detailed technical solutions, code examples, and best practices for making npm package installation completely automatic and reliable across all platforms and installation scenarios.