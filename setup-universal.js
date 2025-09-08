#!/usr/bin/env node

/**
 * Universal Setup Script for Rough Cuts MCP
 * Configures Claude Desktop to work with any Remotion project
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function getClaudeConfigPath() {
  if (os.platform() === 'win32') {
    return path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
  } else if (os.platform() === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else {
    return path.join(os.homedir(), '.config', 'claude', 'claude_desktop_config.json');
  }
}

function setupClaudeConfig() {
  const mcpServerPath = path.join(__dirname, 'mcp-server', 'dist', 'index.js');
  const configPath = getClaudeConfigPath();
  
  console.log('🎬 Setting up Universal Rough Cuts MCP...');
  console.log(`📁 MCP Server: ${mcpServerPath}`);
  console.log(`⚙️  Config File: ${configPath}`);
  
  // Check if MCP server exists
  if (!fs.existsSync(mcpServerPath)) {
    console.error('❌ MCP server not built! Run: cd mcp-server && npm install && npm run build');
    process.exit(1);
  }
  
  // Read existing config or create new one
  let config = {};
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log('📖 Found existing Claude Desktop configuration');
    } catch (error) {
      console.log('⚠️  Invalid existing config, creating new one');
    }
  } else {
    console.log('🆕 Creating new Claude Desktop configuration');
    // Ensure directory exists
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
  }
  
  // Add or update MCP server configuration
  if (!config.mcpServers) {
    config.mcpServers = {};
  }
  
  config.mcpServers['rough-cuts-mcp'] = {
    command: 'node',
    args: [mcpServerPath]
  };
  
  // Write configuration
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Claude Desktop configuration updated!');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Restart Claude Desktop');
    console.log('2. Ask Claude to create videos!');
    console.log('');
    console.log('💡 Example prompts:');
    console.log('   - "Create a dynamic showcase video"');
    console.log('   - "Make an animated logo intro"');
    console.log('   - "Generate a product demo video"');
    console.log('');
    console.log('🎬 The MCP will automatically:');
    console.log('   ✓ Find existing Remotion projects');
    console.log('   ✓ Create new projects when needed at ~/Claude-Videos/');
    console.log('   ✓ Generate professional video components');
    console.log('   ✓ Launch preview studio and render videos');
    console.log('');
    console.log('📂 No manual project creation needed - just ask Claude!');
  } catch (error) {
    console.error('❌ Failed to write configuration:', error.message);
    console.error('');
    console.error('Manual setup required:');
    console.error(`Add this to ${configPath}:`);
    console.error(JSON.stringify({
      mcpServers: {
        'rough-cuts-mcp': {
          command: 'node',
          args: [mcpServerPath]
        }
      }
    }, null, 2));
  }
}

// Build MCP server if needed
const mcpDir = path.join(__dirname, 'mcp-server');
if (!fs.existsSync(path.join(mcpDir, 'dist', 'index.js'))) {
  console.log('🔨 Building MCP server...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install && npm run build', { 
      cwd: mcpDir, 
      stdio: 'inherit' 
    });
  } catch (error) {
    console.error('❌ Failed to build MCP server');
    process.exit(1);
  }
}

setupClaudeConfig();
