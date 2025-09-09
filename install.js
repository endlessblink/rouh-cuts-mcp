#!/usr/bin/env node

/**
 * 🎬 Rough Cuts MCP - Remote Installation Script
 * Automated setup for fresh machines
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function checkNodeJS() {
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log('green', `✅ Node.js ${nodeVersion} found`);
    log('green', `✅ npm ${npmVersion} found`);
    return true;
  } catch (error) {
    log('red', '❌ Node.js not found. Please install Node.js from https://nodejs.org');
    return false;
  }
}

async function setupMCPServer() {
  log('blue', '🔧 Setting up MCP Server...');
  
  const mcpDir = path.join(process.cwd(), 'mcp-server');
  
  if (!fs.existsSync(mcpDir)) {
    log('red', '❌ MCP server directory not found. Run this script from the rough-cuts-mcp root.');
    return false;
  }
  
  try {
    process.chdir(mcpDir);
    log('blue', '📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    log('blue', '🔨 Building TypeScript...');
    execSync('npm run build', { stdio: 'inherit' });
    
    log('green', '✅ MCP Server built successfully!');
    return true;
  } catch (error) {
    log('red', `❌ Setup failed: ${error.message}`);
    return false;
  }
}

async function generateClaudeConfig() {
  const serverPath = path.join(process.cwd(), 'mcp-server', 'dist', 'index.js');
  const absolutePath = path.resolve(serverPath);
  
  const config = {
    mcpServers: {
      "rough-cuts-mcp": {
        command: "node",
        args: [absolutePath],
        env: {}
      }
    }
  };
  
  log('blue', '📝 Claude Desktop configuration:');
  log('yellow', JSON.stringify(config, null, 2));
  
  // Try to detect Claude Desktop config location
  const possiblePaths = [
    path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json'), // Windows
    path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'), // macOS
    path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json') // Linux
  ];
  
  for (const configPath of possiblePaths) {
    if (fs.existsSync(path.dirname(configPath))) {
      log('blue', `💡 Add this to: ${configPath}`);
      break;
    }
  }
  
  return true;
}

async function testInstallation() {
  log('blue', '🧪 Testing installation...');
  
  const testScript = `
    const server = require('./mcp-server/dist/index.js');
    console.log('✅ MCP Server can be imported successfully');
    process.exit(0);
  `;
  
  try {
    execSync(`node -e "${testScript}"`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log('red', '❌ Installation test failed');
    return false;
  }
}

async function main() {
  log('blue', '🎬 Rough Cuts MCP - Remote Installation');
  log('blue', '=====================================');
  
  // Step 1: Check Node.js
  if (!(await checkNodeJS())) {
    process.exit(1);
  }
  
  // Step 2: Setup MCP Server
  if (!(await setupMCPServer())) {
    process.exit(1);
  }
  
  // Step 3: Generate config
  await generateClaudeConfig();
  
  // Step 4: Test
  if (await testInstallation()) {
    log('green', '🎉 Installation completed successfully!');
    log('yellow', '📋 Next steps:');
    log('yellow', '   1. Add the configuration to Claude Desktop');
    log('yellow', '   2. Restart Claude Desktop');
    log('yellow', '   3. Test: rough-cuts-mcp:check_environment');
    log('yellow', '   4. Create videos: rough-cuts-mcp:launch_remotion_studio');
  } else {
    log('red', '❌ Installation completed with errors');
    process.exit(1);
  }
}

main().catch(error => {
  log('red', `❌ Installation failed: ${error.message}`);
  process.exit(1);
});
