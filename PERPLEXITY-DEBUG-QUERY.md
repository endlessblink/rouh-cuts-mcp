# Comprehensive Perplexity Query: MCP Remotion Studio Universal Installation & PATH Resolution

## Core Problem Statement

I'm developing an MCP (Model Context Protocol) server for Claude Desktop that automatically installs and launches Remotion Studio for AI-driven video generation. The system works on some machines but fails on others due to PATH environment issues, Node.js spawning problems, and cross-platform compatibility issues.

## Current Architecture

**MCP Server Location**: `rough-cuts-mcp/mcp-server/dist/index.js`  
**Target Workflow**: `npm install @endlessblink/rough-cuts-mcp` → Configure Claude Desktop → Request animation → Auto-install Remotion → Generate code → Launch Studio

## Critical Issues Requiring Solutions

### 1. **PATH Environment Problems in Child Processes**

**Problem**: When the MCP server spawns child processes using Node.js `spawn()`, the child processes cannot find `npx`, `npm`, or `node` commands even when they're installed and working in the main terminal.

**Error Messages**:
```
Error: spawn npx ENOENT
Could not determine Node.js install directory
'node' is not recognized as the name of a cmdlet, function, script file, or operable program
```

**Current Detection**: 
- `execSync('node --version')` works in MCP server
- `spawn('npx', ['remotion', 'studio'])` fails with ENOENT

**Question**: What's the most reliable cross-platform method to ensure child processes inherit the correct PATH environment that includes Node.js, npm, and npx? Should I use `env: { PATH: process.env.PATH }` in spawn options, or set explicit paths?

### 2. **Cross-Platform Node.js Path Resolution**

**Windows Specific Issues**:
- Node.js installed at: `C:\Program Files\nodejs\`
- PowerShell vs CMD shell differences
- `.cmd` vs `.exe` executable variations
- PATH inheritance in spawned processes

**Question**: What's the best practice for programmatically finding Node.js, npm, and npx executable paths across Windows, macOS, and Linux? Should I use `which`/`where` commands, check standard installation directories, or use Node.js's own path resolution?

### 3. **MCP Server JSON Protocol Violations**

**Problem**: Raw console output from npm/yarn operations breaks the MCP JSON communication protocol.

**Current Error**:
```
SyntaxError: Unexpected token 'I', "Installing"... is not valid JSON
```

**Question**: How should I suppress or redirect stdout/stderr from child processes in an MCP server while still capturing success/failure status? Should I use silent spawn options, redirect to files, or implement a logging wrapper?

### 4. **Universal Auto-Installation Strategy**

**Current Approach**: 
```javascript
// Check if Remotion project exists
// If not, create new project and install dependencies
// Launch studio with proper PATH
```

**Requirements**:
- Work after `npm install -g @endlessblink/rough-cuts-mcp`
- Work in any directory
- Work on Windows, macOS, Linux
- Work in Docker containers and VMs
- Handle corporate networks and proxy settings

**Question**: What's the most robust strategy for auto-installing Remotion in a way that works universally? Should I create projects in a standard location like `~/.claude-videos/`, use the current working directory, or prompt the user?

### 5. **Claude Desktop MCP Configuration Reliability**

**Current Config**:
```json
{
  "mcpServers": {
    "rough-cuts-mcp": {
      "command": "node",
      "args": ["path/to/dist/index.js"],
      "env": { "PATH": "..." }
    }
  }
}
```

**Question**: What's the most reliable way to configure an MCP server in Claude Desktop that handles PATH issues? Should I use full absolute paths, set custom environment variables, or create a wrapper script?

### 6. **Remotion Studio Launch Reliability**

**Target**: Launch `remotion studio --port=3000` from any environment

**Current Failures**:
- Studio launches but shows blank page
- Process exits with code 1
- Port binding issues
- Missing dependencies

**Question**: What are the common causes of Remotion Studio launch failures, and how can I programmatically verify the studio is properly running and accessible before reporting success to the user?

## Specific Technical Questions

### Environment Detection
1. How do I reliably detect if Node.js, npm, and Remotion are properly installed and accessible to child processes?
2. What's the best way to handle missing dependencies with automatic installation prompts?

### Process Management
3. Should I use `spawn`, `exec`, or `fork` for launching long-running processes like Remotion Studio?
4. How do I properly handle process cleanup when Claude Desktop shuts down?

### Error Handling
5. What are the most common error scenarios when launching Remotion Studio programmatically?
6. How should I provide helpful error messages to users when installation fails?

### Cross-Platform Compatibility
7. What are the key differences in PATH handling between Windows PowerShell, CMD, macOS Terminal, and Linux shells?
8. How do I handle corporate environments with restricted npm access or proxy requirements?

## Expected Solution Outcome

A working MCP server that:
1. ✅ Installs via `npm install -g @endlessblink/rough-cuts-mcp`
2. ✅ Auto-configures in Claude Desktop
3. ✅ Detects and installs Remotion dependencies automatically
4. ✅ Launches Remotion Studio reliably on any platform
5. ✅ Handles PATH and environment issues gracefully
6. ✅ Provides clear error messages when things go wrong
7. ✅ Works in Docker, VMs, and corporate environments

## Code Context

**MCP Server Structure**:
```
rough-cuts-mcp/
├── mcp-server/src/index.ts (main MCP server)
├── package.json (Remotion dependencies)
├── setup-universal.js (auto-installation script)
└── remotion.config.ts
```

**Key Functions Needing Fixes**:
- `launch_remotion_studio()` - Currently fails with PATH issues
- `setup_remotion_environment()` - Auto-installation logic
- `check_environment()` - Environment detection

The goal is a zero-configuration experience where users can install the package, configure Claude Desktop, and immediately start creating videos without manual Remotion setup.
