#!/usr/bin/env node

/**
 * Universal Auto-Setup Script for Rough Cuts MCP
 * Automatically configures Claude Desktop with zero user intervention
 * Based on industry best practices for MCP server distribution
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class MCPAutoSetup {
  constructor() {
    this.packageName = '@endlessblink/rough-cuts-mcp';
    this.serverName = 'rough-cuts-mcp';
    this.version = '4.5.4';
  }

  // Cross-platform Claude Desktop config detection
  getClaudeConfigPath() {
    const platform = os.platform();
    const homeDir = os.homedir();
    
    switch (platform) {
      case 'darwin': // macOS
        return path.join(homeDir, 'Library/Application Support/Claude/claude_desktop_config.json');
      case 'win32': // Windows
        return path.join(process.env.APPDATA || path.join(homeDir, 'AppData/Roaming'), 'Claude/claude_desktop_config.json');
      case 'linux': // Linux
        return path.join(homeDir, '.config/Claude/claude_desktop_config.json');
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  // Robust package location detection
  getPackageLocation() {
    try {
      // Method 1: Use require.resolve for installed packages
      const packageJson = require.resolve(`${this.packageName}/package.json`);
      return path.dirname(packageJson);
    } catch (e) {
      try {
        // Method 2: Current execution directory (for npx)
        return __dirname;
      } catch (e2) {
        try {
          // Method 3: Process working directory fallback
          return process.cwd();
        } catch (e3) {
          // Method 4: Try to find via module paths
          const modulePaths = module.paths;
          for (const modPath of modulePaths) {
            const possiblePath = path.join(modPath, this.packageName);
            if (fs.existsSync(possiblePath)) {
              return possiblePath;
            }
          }
          throw new Error('Could not determine package location');
        }
      }
    }
  }

  // Verify MCP server integrity
  verifyServerIntegrity() {
    const packageLocation = this.getPackageLocation();
    const serverPath = path.join(packageLocation, 'mcp-server/dist/index.js');
    const guidelinesDir = path.join(packageLocation, 'claude-dev-guidelines');
    
    const checks = {
      serverExists: fs.existsSync(serverPath),
      guidelinesExist: fs.existsSync(guidelinesDir),
      packageJson: fs.existsSync(path.join(packageLocation, 'package.json'))
    };
    
    return { packageLocation, serverPath, guidelinesDir, checks };
  }

  // Create or update Claude Desktop config
  async updateClaudeConfig() {
    const configPath = this.getClaudeConfigPath();
    const configDir = path.dirname(configPath);
    const integrity = this.verifyServerIntegrity();

    console.log(`🔍 Package verification:`);
    console.log(`   📦 Location: ${integrity.packageLocation}`);
    console.log(`   🚀 Server: ${integrity.checks.serverExists ? '✅' : '❌'} ${integrity.serverPath}`);
    console.log(`   📚 Guidelines: ${integrity.checks.guidelinesExist ? '✅' : '❌'} ${integrity.guidelinesDir}`);

    if (!integrity.checks.serverExists) {
      throw new Error(`MCP server not found at: ${integrity.serverPath}`);
    }

    // Ensure config directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
      console.log(`📁 Created config directory: ${configDir}`);
    }

    let config = {};
    
    // Read existing config or create new one
    if (fs.existsSync(configPath)) {
      try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(configContent);
        console.log('📖 Found existing Claude Desktop configuration');
      } catch (e) {
        console.warn('⚠️  Could not parse existing Claude config. Creating new one.');
        config = {};
      }
    } else {
      console.log('🆕 Creating new Claude Desktop configuration');
    }

    // Initialize mcpServers if it doesn't exist
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    // Add or update the MCP server configuration
    config.mcpServers[this.serverName] = {
      command: "node",
      args: [integrity.serverPath],
      env: {}
    };

    // Write updated config with proper formatting
    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(`✅ Successfully configured ${this.serverName} in Claude Desktop`);
      console.log(`📁 Config location: ${configPath}`);
      console.log(`🚀 Server location: ${integrity.serverPath}`);
      return { success: true, configPath, serverPath: integrity.serverPath };
    } catch (error) {
      throw new Error(`Failed to write config: ${error.message}`);
    }
  }

  // Handle setup failures with detailed troubleshooting
  async handleSetupFailure(error) {
    console.error(`❌ Automatic setup failed: ${error.message}`);
    console.log('\n🔍 Troubleshooting steps:');
    console.log('1. Ensure Claude Desktop is installed');
    console.log('2. Check Node.js version (>=18.0.0 required)');
    console.log('3. Verify file system permissions');
    console.log('4. Try running with elevated permissions');
    console.log('5. Check if Claude Desktop is running (close it during setup)');
    
    // Show manual config for fallback
    await this.showManualConfig();
    
    // Create portable config file
    await this.createPortableConfig();
  }

  // Generate manual configuration instructions
  async showManualConfig() {
    try {
      const integrity = this.verifyServerIntegrity();
      const manualConfig = {
        mcpServers: {
          [this.serverName]: {
            command: "node",
            args: [integrity.serverPath]
          }
        }
      };
      
      console.log('\n📋 Manual configuration for claude_desktop_config.json:');
      console.log(JSON.stringify(manualConfig, null, 2));
      
      const configPath = this.getClaudeConfigPath();
      console.log(`\n📍 Config file location: ${configPath}`);
      
    } catch (e) {
      // Fallback to npx-based config
      const fallbackConfig = {
        mcpServers: {
          [this.serverName]: {
            command: "npx",
            args: ["-y", `${this.packageName}@latest`]
          }
        }
      };
      
      console.log('\n📋 Fallback configuration (npx-based):');
      console.log(JSON.stringify(fallbackConfig, null, 2));
    }
  }

  // Create portable configuration file
  async createPortableConfig() {
    try {
      const portableConfigPath = path.join(process.cwd(), 'rough-cuts-mcp-config.json');
      const integrity = this.verifyServerIntegrity();
      
      const portableConfig = {
        instructions: "Copy the 'mcpServers' section below to your claude_desktop_config.json",
        configLocation: this.getClaudeConfigPath(),
        mcpServers: {
          [this.serverName]: {
            command: "node",
            args: [integrity.serverPath]
          }
        },
        setupInfo: {
          packageVersion: this.version,
          nodeVersion: process.version,
          platform: os.platform(),
          setupDate: new Date().toISOString(),
          packageLocation: integrity.packageLocation
        }
      };
      
      fs.writeFileSync(portableConfigPath, JSON.stringify(portableConfig, null, 2));
      console.log(`\n💾 Created portable config: ${portableConfigPath}`);
      console.log('   You can manually copy this configuration to Claude Desktop');
      
    } catch (error) {
      console.log(`⚠️  Could not create portable config: ${error.message}`);
    }
  }

  // Main setup execution with comprehensive error handling
  async run() {
    console.log(`\n🎬 ${this.packageName} v${this.version} Auto-Setup`);
    console.log('=' .repeat(50));
    
    try {
      // Environment validation
      console.log(`📊 Environment check:`);
      console.log(`   🖥️  Platform: ${os.platform()} ${os.arch()}`);
      console.log(`   📱 Node.js: ${process.version}`);
      console.log(`   👤 User: ${os.userInfo().username}`);
      console.log(`   🏠 Home: ${os.homedir()}`);
      
      // Verify Node.js version
      const nodeVersion = process.version.slice(1); // Remove 'v' prefix
      const [major] = nodeVersion.split('.').map(Number);
      if (major < 18) {
        throw new Error(`Node.js 18.0.0 or higher required (current: ${process.version})`);
      }
      
      // Configure Claude Desktop
      const result = await this.updateClaudeConfig();
      
      console.log('\n🎉 Setup completed successfully!');
      console.log('=' .repeat(50));
      console.log('📋 Next steps:');
      console.log('1. 🔄 Restart Claude Desktop completely');
      console.log('2. 🎬 Ask Claude to create videos using Rough Cuts MCP');
      console.log('3. 📚 Guidelines are automatically loaded - no manual setup needed');
      console.log('\n💡 Example prompts:');
      console.log('   • "Create a dynamic product showcase video"');
      console.log('   • "Make an animated logo intro with smooth transitions"'); 
      console.log('   • "Generate a professional demo video for my app"');
      console.log('\n🚀 The MCP server includes:');
      console.log('   ✓ Automatic Remotion project setup');
      console.log('   ✓ Built-in animation guidelines');
      console.log('   ✓ Professional video templates');
      console.log('   ✓ Studio launch and rendering');
      
      return true;
      
    } catch (error) {
      await this.handleSetupFailure(error);
      return false;
    }
  }

  // Utility method for uninstallation
  async uninstall() {
    try {
      const configPath = this.getClaudeConfigPath();
      
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        if (config.mcpServers && config.mcpServers[this.serverName]) {
          delete config.mcpServers[this.serverName];
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
          console.log(`✅ Removed ${this.serverName} from Claude Desktop config`);
        } else {
          console.log(`ℹ️  ${this.serverName} not found in Claude Desktop config`);
        }
      }
      
      console.log('🗑️  Uninstallation complete. Restart Claude Desktop to apply changes.');
      
    } catch (error) {
      console.error(`❌ Uninstallation failed: ${error.message}`);
    }
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const setup = new MCPAutoSetup();
  
  if (args.includes('--uninstall') || args.includes('-u')) {
    await setup.uninstall();
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${setup.packageName} v${setup.version} - Auto Setup Tool

Usage:
  npx ${setup.packageName}           # Setup MCP server
  npx ${setup.packageName} --help    # Show this help
  npx ${setup.packageName} --uninstall # Remove from Claude Desktop
  
The setup tool automatically configures Claude Desktop to use the Rough Cuts
MCP server for AI-powered video generation with Remotion.
    `);
  } else {
    const success = await setup.run();
    process.exit(success ? 0 : 1);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = MCPAutoSetup;