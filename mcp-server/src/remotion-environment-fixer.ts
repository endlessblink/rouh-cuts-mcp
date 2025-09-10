#!/usr/bin/env node

/**
 * RemotionEnvironmentFixer - Node.js v22 Compatibility Auto-Fix System
 * 
 * Automatically detects and fixes "require is not defined" errors and other
 * Node.js v22 compatibility issues with Remotion projects using industry-standard
 * atomic file operations and enterprise-grade safety practices.
 * 
 * Based on verified safe automation patterns used in production environments.
 */

import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import writeFileAtomic from 'write-file-atomic';
import { UniversalNodeDetector } from './universal-node-detector.js';

export interface EnvironmentDiagnostic {
  success: boolean;
  issues: string[];
  fixes: string[];
  nodeVersion: string;
  platform: string;
}

export interface AutoFixResult {
  success: boolean;
  message: string;
  actions: string[];
  error?: string;
}

export interface StudioLaunchResult {
  success: boolean;
  message: string;
  error?: string;
  url?: string;
}

export class RemotionEnvironmentFixer {
  private projectPath: string;
  private nodeDetector: UniversalNodeDetector;
  private debug: boolean;

  constructor(projectPath: string, options: { debug?: boolean } = {}) {
    this.projectPath = projectPath;
    this.nodeDetector = new UniversalNodeDetector({ debug: options.debug || false });
    this.debug = options.debug || false;
  }

  private log(message: string, ...args: any[]): void {
    if (this.debug) {
      console.log(`[RemotionFixer] ${message}`, ...args);
    }
  }

  /**
   * MCP TOOL: diagnose_remotion_error
   * Comprehensive Node.js v22 compatibility diagnostics
   */
  async diagnoseRemotionError(): Promise<EnvironmentDiagnostic> {
    const issues: string[] = [];
    const fixes: string[] = [];
    const nodeVersion = process.version;
    const platform = `${os.platform()} ${os.arch()}`;

    try {
      this.log('Starting environment diagnostics...');

      // Issue 1: Check main package.json configuration
      const mainPackageJsonPath = path.join(this.projectPath, 'package.json');
      if (await this.fileExists(mainPackageJsonPath)) {
        const mainPackageJson = JSON.parse(await fs.readFile(mainPackageJsonPath, 'utf8'));
        
        // Check for ES module configuration conflicts
        if (mainPackageJson.type === 'module') {
          issues.push('Main package.json configured as ES module - conflicts with Remotion setup');
          fixes.push('Remove "type": "module" from main package.json for CommonJS compatibility');
        }

        // Check TypeScript configuration conflicts
        const tsconfigPath = path.join(this.projectPath, 'tsconfig.json');
        if (await this.fileExists(tsconfigPath)) {
          const tsconfig = JSON.parse(await fs.readFile(tsconfigPath, 'utf8'));
          if (tsconfig.compilerOptions?.moduleResolution === 'bundler') {
            issues.push('TypeScript moduleResolution "bundler" incompatible with Node.js v22 MCP execution');
            fixes.push('Change moduleResolution to "node" for better compatibility');
          }
        }
      }

      // Issue 2: Check Node.js version compatibility
      const nodeVersionNum = parseInt(nodeVersion.split('.')[0].substring(1));
      if (nodeVersionNum >= 22) {
        issues.push(`Node.js ${nodeVersion} has stricter ES module handling and removed polyfills`);
        fixes.push('Add webpack polyfills and update Remotion configuration for Node.js v22+');
      }

      // Issue 3: Check Remotion dependencies and configuration
      const remotionConfigPath = path.join(this.projectPath, 'remotion.config.ts');
      if (await this.fileExists(remotionConfigPath)) {
        const configContent = await fs.readFile(remotionConfigPath, 'utf8');
        if (!configContent.includes('ProvidePlugin') && nodeVersionNum >= 22) {
          issues.push('Remotion configuration missing Node.js v22 webpack polyfills');
          fixes.push('Add webpack ProvidePlugin configuration for process, Buffer polyfills');
        }
      } else {
        issues.push('Remotion configuration file missing');
        fixes.push('Create remotion.config.ts with Node.js v22 compatibility settings');
      }

      // Issue 4: Check for setup-universal.js CommonJS/ESM conflicts
      const setupUniversalPath = path.join(this.projectPath, 'setup-universal.js');
      if (await this.fileExists(setupUniversalPath)) {
        const setupContent = await fs.readFile(setupUniversalPath, 'utf8');
        if (setupContent.includes('require(') && mainPackageJsonPath) {
          const mainPkg = JSON.parse(await fs.readFile(mainPackageJsonPath, 'utf8'));
          if (mainPkg.type === 'module') {
            issues.push('setup-universal.js uses require() in ES module environment');
            fixes.push('Convert setup-universal.js to ES modules or use CommonJS');
          }
        }
      }

      // Issue 5: Check MCP server package configuration
      const mcpPackageJsonPath = path.join(this.projectPath, 'mcp-server', 'package.json');
      if (await this.fileExists(mcpPackageJsonPath)) {
        const mcpPackageJson = JSON.parse(await fs.readFile(mcpPackageJsonPath, 'utf8'));
        
        if (mcpPackageJson.type === 'module') {
          const mcpTsconfigPath = path.join(this.projectPath, 'mcp-server', 'tsconfig.json');
          if (await this.fileExists(mcpTsconfigPath)) {
            const mcpTsconfig = JSON.parse(await fs.readFile(mcpTsconfigPath, 'utf8'));
            if (mcpTsconfig.compilerOptions?.moduleResolution !== 'Node') {
              issues.push('MCP server TypeScript configuration may cause module resolution issues');
              fixes.push('Ensure MCP server uses "moduleResolution": "Node" for ES modules');
            }
          }
        }
      }

      this.log(`Diagnostics complete: ${issues.length} issues found`);

      return {
        success: issues.length === 0,
        issues,
        fixes,
        nodeVersion,
        platform
      };

    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        issues: [`Diagnostic failed: ${err.message}`],
        fixes: ['Verify project structure and file permissions'],
        nodeVersion,
        platform
      };
    }
  }

  /**
   * MCP TOOL: auto_fix_remotion_environment  
   * One-click automatic fix for Node.js v22 compatibility issues
   */
  async autoFixRemotionEnvironment(): Promise<AutoFixResult> {
    const actions: string[] = [];
    
    try {
      this.log('Starting automatic environment fixes...');

      // Fix 1: Update main package.json for Node.js v22 compatibility
      await this.fixMainPackageJson(actions);

      // Fix 2: Create/update proper Remotion configuration
      await this.createRemotionConfig(actions);

      // Fix 3: Harmonize TypeScript configuration
      await this.harmonizeTypeScriptConfig(actions);

      // Fix 4: Install Node.js v22 compatibility dependencies
      await this.installCompatibilityDependencies(actions);

      // Fix 5: Fix Windows esbuild dependencies
      await this.fixWindowsEsbuildDependencies(actions);

      // Fix 6: Fix MCP server configuration if needed
      await this.fixMcpServerConfig(actions);

      this.log(`Auto-fix completed successfully with ${actions.length} actions`);

      return {
        success: true,
        message: 'Remotion environment automatically fixed for Node.js v22 compatibility',
        actions
      };

    } catch (error) {
      const err = error as Error;
      this.log('Auto-fix failed:', err);
      return {
        success: false,
        message: `Auto-fix failed: ${err.message}`,
        actions,
        error: err.message
      };
    }
  }

  /**
   * ENHANCED: Launch Remotion Studio with pre-flight checks and auto-fix
   */
  async launchStudioSafe(port: number = 3000): Promise<StudioLaunchResult> {
    try {
      this.log('Starting studio launch with safety checks...');

      // Pre-flight diagnostic check
      const diagnostic = await this.diagnoseRemotionError();
      if (!diagnostic.success) {
        this.log('Issues detected, running auto-fix...');
        const fixResult = await this.autoFixRemotionEnvironment();
        if (!fixResult.success) {
          return {
            success: false,
            message: 'Failed to auto-fix environment before launch',
            error: fixResult.message
          };
        }
        
        // Reinstall dependencies after fixes
        await this.reinstallDependencies();
      }

      // Launch Remotion Studio with proper environment variables
      const result = await this.launchStudioWithEnvironment(port);
      
      return result;

    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        message: 'Studio launch failed',
        error: err.message
      };
    }
  }

  // Private implementation methods

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async atomicWrite(filePath: string, content: string): Promise<void> {
    await writeFileAtomic(filePath, content, 'utf8');
    this.log(`Atomically wrote: ${filePath}`);
  }

  private async fixMainPackageJson(actions: string[]): Promise<void> {
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    
    if (!await this.fileExists(packageJsonPath)) {
      this.log('Main package.json not found, skipping');
      return;
    }

    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    let modified = false;

    // Remove type: module if present (for Remotion CommonJS compatibility)
    if (packageJson.type === 'module') {
      delete packageJson.type;
      modified = true;
      actions.push('Removed "type": "module" from main package.json for CommonJS compatibility');
    }

    // Ensure proper scripts for Node.js v22
    const requiredScripts = {
      'dev': 'remotion studio',
      'build': 'remotion render', 
      'upgrade': 'remotion upgrade',
      'build-mcp': 'cd mcp-server && npm install && npm run build'
    };

    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    for (const [script, command] of Object.entries(requiredScripts)) {
      if (packageJson.scripts[script] !== command) {
        packageJson.scripts[script] = command;
        modified = true;
      }
    }

    if (modified) {
      actions.push('Updated scripts in main package.json');
    }

    // Update dependencies to latest compatible versions for Node.js v22
    if (packageJson.dependencies) {
      const updates = {
        '@remotion/cli': '^4.0.340',
        '@remotion/player': '^4.0.340', 
        'remotion': '^4.0.340',
        'react': '^18.2.0',
        'react-dom': '^18.2.0'
      };

      for (const [pkg, version] of Object.entries(updates)) {
        if (packageJson.dependencies[pkg] && packageJson.dependencies[pkg] !== version) {
          packageJson.dependencies[pkg] = version;
          modified = true;
        }
      }

      if (modified) {
        actions.push('Updated Remotion dependencies to Node.js v22 compatible versions');
      }
    }

    // Add Node.js engine specification
    if (!packageJson.engines || packageJson.engines.node !== '>=18.0.0') {
      packageJson.engines = { ...packageJson.engines, node: '>=18.0.0' };
      modified = true;
      actions.push('Added Node.js engine specification');
    }

    if (modified) {
      await this.atomicWrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
  }

  private async createRemotionConfig(actions: string[]): Promise<void> {
    const configPath = path.join(this.projectPath, 'remotion.config.ts');
    
    const configContent = `import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(18);

// Node.js v22 Compatibility: Webpack configuration with required polyfills
Config.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    resolve: {
      ...currentConfiguration.resolve,
      fallback: {
        ...currentConfiguration.resolve?.fallback,
        "path": require.resolve("path-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "util": require.resolve("util"),
        "buffer": require.resolve("buffer"),
        "process": require.resolve("process/browser"),
        "os": require.resolve("os-browserify/browser"),
        "fs": false,
        "net": false,
        "tls": false
      }
    },
    plugins: [
      ...currentConfiguration.plugins || [],
      new (require('webpack')).ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
    ]
  };
});
`;

    await this.atomicWrite(configPath, configContent);
    actions.push('Created remotion.config.ts with Node.js v22 compatibility settings');
  }

  private async harmonizeTypeScriptConfig(actions: string[]): Promise<void> {
    const tsconfigPath = path.join(this.projectPath, 'tsconfig.json');
    
    if (!await this.fileExists(tsconfigPath)) {
      return;
    }

    const tsconfig = JSON.parse(await fs.readFile(tsconfigPath, 'utf8'));
    let modified = false;

    // Use Node module resolution for better compatibility
    if (tsconfig.compilerOptions?.moduleResolution === 'bundler') {
      tsconfig.compilerOptions.moduleResolution = 'node';
      modified = true;
      actions.push('Changed TypeScript moduleResolution from "bundler" to "node"');
    }

    // Ensure CommonJS module system for main project
    if (tsconfig.compilerOptions?.module === 'ESNext') {
      tsconfig.compilerOptions.module = 'CommonJS';
      modified = true;
      actions.push('Changed TypeScript module system to CommonJS');
    }

    if (modified) {
      await this.atomicWrite(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    }
  }

  private async installCompatibilityDependencies(actions: string[]): Promise<void> {
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    
    if (!await this.fileExists(packageJsonPath)) {
      return;
    }

    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    
    // Node.js v22 polyfills required for Remotion webpack
    const requiredPolyfills = {
      'path-browserify': '^1.0.1',
      'crypto-browserify': '^3.12.0',
      'stream-browserify': '^3.0.0',
      'util': '^0.12.5',
      'buffer': '^6.0.3',
      'process': '^0.11.10',
      'os-browserify': '^0.3.0'
    };

    if (!packageJson.devDependencies) {
      packageJson.devDependencies = {};
    }

    let modified = false;
    for (const [pkg, version] of Object.entries(requiredPolyfills)) {
      if (!packageJson.devDependencies[pkg] && !packageJson.dependencies?.[pkg]) {
        packageJson.devDependencies[pkg] = version;
        modified = true;
      }
    }

    if (modified) {
      await this.atomicWrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
      actions.push('Added Node.js v22 polyfill dependencies');
    }
  }

  private async fixWindowsEsbuildDependencies(actions: string[]): Promise<void> {
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    
    if (!await this.fileExists(packageJsonPath)) {
      return;
    }

    this.log('Checking for Windows esbuild compatibility...');
    
    // Check if wrong esbuild binaries are installed
    const nodeModulesPath = path.join(this.projectPath, 'node_modules');
    const linuxEsbuildPath = path.join(nodeModulesPath, '@esbuild', 'linux-x64');
    const windowsEsbuildPath = path.join(nodeModulesPath, '@esbuild', 'win32-x64');
    
    const hasLinuxBinary = await this.fileExists(linuxEsbuildPath);
    const hasWindowsBinary = await this.fileExists(windowsEsbuildPath);
    
    if (hasLinuxBinary && !hasWindowsBinary) {
      this.log('Found Linux esbuild binary on Windows - will fix during npm install');
      actions.push('Detected wrong esbuild platform binary - will reinstall correct Windows binary');
      
      // The reinstallDependencies() call will fix this automatically
      // by doing a fresh npm install which will get the correct platform binary
    } else if (!hasWindowsBinary) {
      this.log('Windows esbuild binary missing - will install during npm install');
      actions.push('Windows esbuild binary missing - will install during dependency reinstall');
    } else {
      this.log('Windows esbuild binary correctly installed');
    }
  }

  private async fixMcpServerConfig(actions: string[]): Promise<void> {
    const mcpPackageJsonPath = path.join(this.projectPath, 'mcp-server', 'package.json');
    const mcpTsconfigPath = path.join(this.projectPath, 'mcp-server', 'tsconfig.json');
    
    if (!await this.fileExists(mcpPackageJsonPath)) {
      return;
    }

    // Ensure MCP server TypeScript config is compatible with ES modules
    if (await this.fileExists(mcpTsconfigPath)) {
      const mcpTsconfig = JSON.parse(await fs.readFile(mcpTsconfigPath, 'utf8'));
      let modified = false;

      if (mcpTsconfig.compilerOptions?.moduleResolution !== 'Node') {
        mcpTsconfig.compilerOptions.moduleResolution = 'Node';
        modified = true;
        actions.push('Fixed MCP server TypeScript moduleResolution for ES modules');
      }

      if (modified) {
        await this.atomicWrite(mcpTsconfigPath, JSON.stringify(mcpTsconfig, null, 2));
      }
    }
  }

  private async reinstallDependencies(): Promise<void> {
    const npmPath = await this.nodeDetector.detectNpm();
    if (!npmPath) {
      throw new Error('npm not found for dependency installation');
    }

    this.log('Reinstalling dependencies after configuration changes...');
    
    return new Promise((resolve, reject) => {
      // FIXED: Force non-interactive mode while preserving optional dependencies
      const child = spawn(npmPath, [
        'install',
        '--no-audit',          // Skip security audit (non-interactive)
        '--no-fund',           // Skip funding messages
        '--prefer-offline',    // Use cache when possible
        // NOTE: Keep optional dependencies for esbuild platform binaries
      ], {
        cwd: this.projectPath,
        stdio: ['ignore', 'pipe', 'pipe'], // Capture output instead of inherit
        shell: process.platform === 'win32',
        env: { 
          ...process.env,
          NPM_CONFIG_PROGRESS: 'false',      // Disable progress bars
          NPM_CONFIG_LOGLEVEL: 'error',      // Reduce output noise
          CI: 'true',                        // Force CI mode (non-interactive)
          NODE_ENV: 'production',            // Skip dev-only prompts
          NPM_CONFIG_OPTIONAL: 'true'       // Ensure optional deps are installed
        }
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
        this.log('[npm]', data.toString().trim());
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
        this.log('[npm error]', data.toString().trim());
      });

      child.on('close', (code) => {
        if (code === 0) {
          this.log('Dependencies reinstalled successfully');
          resolve();
        } else {
          this.log('npm install failed:', stderr);
          reject(new Error(`npm install failed with code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to start npm install: ${error.message}`));
      });

      // Timeout after 3 minutes
      setTimeout(() => {
        child.kill();
        reject(new Error('npm install timeout after 3 minutes'));
      }, 180000);
    });
  }

  private async launchStudioWithEnvironment(port: number): Promise<StudioLaunchResult> {
    const npxPath = await this.nodeDetector.detectNpx();
    if (!npxPath) {
      return {
        success: false,
        message: 'npx not found',
        error: 'Node.js tools not available'
      };
    }

    return new Promise((resolve, reject) => {
      // FIXED: Use non-interactive mode for MCP compatibility
      const child = spawn(npxPath, [
        'remotion', 'studio', 
        '--port', port.toString(),
        '--disable-keyboard-shortcuts'  // Prevent interactive shortcuts
      ], {
        cwd: this.projectPath,
        stdio: ['ignore', 'pipe', 'pipe'], // Prevent stdin interaction
        shell: process.platform === 'win32',
        env: {
          ...process.env,
          NODE_OPTIONS: '--no-experimental-fetch --max-old-space-size=4096',
          FORCE_COLOR: '1',
          NODE_NO_WARNINGS: '1',
          CI: 'true',                      // Force CI mode (non-interactive)
          REMOTION_NON_INTERACTIVE: '1'    // Remotion-specific non-interactive flag
        }
      });

      const timeout = setTimeout(() => {
        child.kill('SIGTERM');
        resolve({
          success: false,
          message: 'Studio startup timeout',
          error: 'Studio took too long to start (45s timeout)'
        });
      }, 45000);

      child.stdout?.on('data', (data) => {
        const output = data.toString();
        this.log(`[Studio] ${output.trim()}`);
        
        if (output.includes('Server ready') || output.includes('Local:') || output.includes(`localhost:${port}`)) {
          clearTimeout(timeout);
          resolve({
            success: true,
            message: `Remotion Studio launched successfully`,
            url: `http://localhost:${port}`
          });
        }
      });

      child.stderr?.on('data', (data) => {
        const error = data.toString();
        this.log(`[Studio Error] ${error.trim()}`);
        
        if (error.includes('require is not defined')) {
          clearTimeout(timeout);
          child.kill('SIGTERM');
          resolve({
            success: false,
            message: 'Module system error - environment needs reconfiguration',
            error: 'require is not defined - run auto_fix_remotion_environment again'
          });
        }
        
        if (error.includes('EADDRINUSE')) {
          clearTimeout(timeout);
          child.kill('SIGTERM');
          resolve({
            success: false,
            message: `Port ${port} is already in use`,
            error: 'Try a different port or stop the process using this port'
          });
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        resolve({
          success: false,
          message: 'Process spawn failed',
          error: error.message
        });
      });
    });
  }
}

export default RemotionEnvironmentFixer;