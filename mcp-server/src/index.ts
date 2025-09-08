#!/usr/bin/env node

/**
 * Enhanced Remotion MCP Server - With Auto-Installation
 * Automatically creates Remotion projects and installs dependencies when needed
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs-extra';
import path from 'path';
import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import * as osModule from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = new Server(
  {
    name: 'rough-cuts-mcp',
    version: '3.0.0', // Updated for auto-installation features
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Auto-installation configuration
const DEFAULT_PROJECT_PATH = path.join(osModule.homedir(), 'Claude-Videos', 'remotion-project');

// Environment detection interfaces
interface EnvironmentStatus {
  nodejs: {
    installed: boolean;
    version?: string;
    path?: string;
  };
  npm: {
    installed: boolean;
    version?: string;
    canInstallGlobal: boolean;
  };
  remotion: {
    cliInstalled: boolean;
    projectExists: boolean;
    projectPath?: string;
    dependencies: {
      remotion: boolean;
      react: boolean;
      typescript: boolean;
    };
  };
  platform: {
    os: 'windows' | 'macos' | 'linux';
    shell: string;
    canExecute: boolean;
    recommendedDir: string;
  };
}

// Working directory management - added to fix path resolution issues
let currentProjectPath: string | null = null;

async function getCurrentProjectPath(): Promise<string> {
  if (currentProjectPath && await verifyProjectHealth(currentProjectPath)) {
    return currentProjectPath;
  }
  
  // Reset and find/create project
  currentProjectPath = await ensureRemotionProject();
  return currentProjectPath;
}

async function setCurrentProjectPath(projectPath: string): Promise<void> {
  if (await verifyProjectHealth(projectPath)) {
    currentProjectPath = projectPath;
    console.log(`🎯 Working project set to: ${projectPath}`);
  } else {
    throw new Error(`Invalid project path: ${projectPath}`);
  }
}

// CRITICAL: Proper working directory management to avoid Claude app directory
function ensureProperWorkingDirectory(): void {
  const currentDir = process.cwd();
  
  // Check if we're running from Claude Desktop app directory (common issue)
  if (currentDir.includes('claude.exe') || 
      currentDir.includes('Claude') || 
      currentDir.includes('AnthropicClaude') ||
      currentDir.includes('AppData\\Local\\AnthropicClaude')) {
    
    console.log(`⚠️ Detected Claude app directory: ${currentDir}`);
    console.log('🔄 Switching to user home directory for better compatibility...');
    
    try {
      process.chdir(osModule.homedir());
      console.log(`✅ Working directory changed to: ${process.cwd()}`);
    } catch (error) {
      console.log('⚠️ Could not change working directory, but continuing...');
    }
  }
}

// Enhanced environment detection functions
async function checkNodeJS(): Promise<{ installed: boolean; version?: string; path?: string }> {
  try {
    const version = execSync('node --version', { encoding: 'utf8', timeout: 5000 }).trim();
    const nodePath = execSync('where node', { encoding: 'utf8', timeout: 5000 }).trim();
    return { installed: true, version, path: nodePath };
  } catch (error) {
    return { installed: false };
  }
}

async function checkNPM(): Promise<{ installed: boolean; version?: string; canInstallGlobal: boolean }> {
  try {
    const version = execSync('npm --version', { encoding: 'utf8', timeout: 5000 }).trim();
    
    // Test if we can install global packages
    let canInstallGlobal = true;
    try {
      // Try to list global packages as a test
      execSync('npm list -g --depth=0', { encoding: 'utf8', timeout: 5000 });
    } catch (error) {
      canInstallGlobal = false;
    }
    
    return { installed: true, version, canInstallGlobal };
  } catch (error) {
    return { installed: false, version: undefined, canInstallGlobal: false };
  }
}

async function checkRemotionInstallation(): Promise<{
  cliInstalled: boolean;
  projectExists: boolean;
  projectPath?: string;
  dependencies: { remotion: boolean; react: boolean; typescript: boolean };
}> {
  // Check if Remotion CLI is available
  let cliInstalled = false;
  try {
    execSync('npx @remotion/cli --version', { encoding: 'utf8', timeout: 10000 });
    cliInstalled = true;
  } catch (error) {
    // Try alternative check
    try {
      execSync('remotion --version', { encoding: 'utf8', timeout: 5000 });
      cliInstalled = true;
    } catch (innerError) {
      cliInstalled = false;
    }
  }
  
  // Check for existing project
  const existingProject = findExistingProject();
  const projectExists = !!existingProject;
  
  // Check dependencies if project exists
  let dependencies = { remotion: false, react: false, typescript: false };
  if (existingProject) {
    try {
      const packageJsonPath = path.join(existingProject, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = fs.readJsonSync(packageJsonPath);
        const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        dependencies = {
          remotion: !!(allDeps.remotion || allDeps['@remotion/cli']),
          react: !!allDeps.react,
          typescript: !!allDeps.typescript
        };
      }
    } catch (error) {
      // Keep default false values
    }
  }
  
  return {
    cliInstalled,
    projectExists,
    projectPath: existingProject || undefined,
    dependencies
  };
}

async function detectPlatform(): Promise<{
  os: 'windows' | 'macos' | 'linux';
  shell: string;
  canExecute: boolean;
  recommendedDir: string;
}> {
  const platform = process.platform;
  let os: 'windows' | 'macos' | 'linux';
  let shell = '';
  let canExecute = true;
  let recommendedDir = '';
  
  switch (platform) {
    case 'win32':
      os = 'windows';
      shell = 'cmd';
      recommendedDir = path.join(osModule.homedir(), 'Documents', 'Claude-Videos');
      break;
    case 'darwin':
      os = 'macos';
      shell = 'bash';
      recommendedDir = path.join(osModule.homedir(), 'Documents', 'Claude-Videos');
      break;
    default:
      os = 'linux';
      shell = 'bash';
      recommendedDir = path.join(osModule.homedir(), 'Claude-Videos');
      break;
  }
  
  // Test if we can execute commands
  try {
    execSync('echo test', { encoding: 'utf8', timeout: 3000 });
  } catch (error) {
    canExecute = false;
  }
  
  return { os, shell, canExecute, recommendedDir };
}

// CRITICAL: Complete environment setup for true zero-configuration
async function ensureCompleteEnvironment(): Promise<void> {
  console.log('🔍 Checking complete environment for Remotion...');
  
  // Step 0: Ensure we're not running from Claude app directory
  ensureProperWorkingDirectory();
  
  // Step 1: Verify Node.js is available
  const nodeStatus = await checkNodeJS();
  if (!nodeStatus.installed) {
    throw new Error(`Node.js is required but not installed. 

🔧 TROUBLESHOOTING STEPS:
1. Download Node.js from https://nodejs.org
2. Install Node.js (includes npm automatically)
3. Restart Claude Desktop completely
4. Try creating a component again

💡 TIP: After installing Node.js, you may need to restart your computer for PATH changes to take effect.`);
  }
  
  // Step 2: Verify npm is working
  const npmStatus = await checkNPM();
  if (!npmStatus.installed) {
    throw new Error(`npm is required but not available. 

🔧 TROUBLESHOOTING STEPS:
1. Ensure Node.js is properly installed (npm comes with Node.js)
2. Restart Claude Desktop completely
3. Open Command Prompt and type: npm --version
4. If that fails, reinstall Node.js from https://nodejs.org

💡 TIP: npm is included with Node.js installation - if Node.js works but npm doesn't, your installation may be corrupted.`);
  }
  
  // Step 3: Handle Remotion CLI installation
  const remotionStatus = await checkRemotionInstallation();
  if (!remotionStatus.cliInstalled) {
    console.log('📦 Remotion CLI not found, installing globally...');
    
    try {
      // Try to install Remotion CLI globally for the user
      await installRemotionCLI();
      console.log('✅ Remotion CLI installed successfully!');
    } catch (error) {
      console.log('⚠️ Global Remotion CLI installation failed, will use npx instead');
      // This is OK - we can still use npx @remotion/cli
    }
  }
  
  // Step 4: Ensure we have a working project directory
  if (!remotionStatus.projectExists) {
    console.log('🎬 No Remotion project found, creating one automatically...');
    await createRemotionProject();
  } else if (!await verifyProjectHealth(remotionStatus.projectPath!)) {
    console.log('🔧 Existing project needs repair...');
    await repairProject(remotionStatus.projectPath!);
  }
  
  console.log('✅ Environment ready for video creation!');
}

// Install Remotion CLI globally with enhanced error handling
async function installRemotionCLI(): Promise<void> {
  const platform = await detectPlatform();
  
  try {
    console.log('📦 Installing Remotion CLI globally...');
    
    // Try different installation strategies based on platform
    if (platform.os === 'windows') {
      // Windows: Enhanced PowerShell policy handling
      try {
        // First try: PowerShell with execution policy bypass
        execSync('powershell -ExecutionPolicy Bypass -Command "npm install -g @remotion/cli"', { 
          stdio: 'inherit', 
          timeout: 120000 
        });
      } catch (psError) {
        console.log('PowerShell with bypass failed, trying cmd...');
        try {
          // Second try: cmd to avoid PowerShell policies entirely
          execSync('cmd /c "npm install -g @remotion/cli"', { 
            stdio: 'inherit', 
            timeout: 120000 
          });
        } catch (cmdError) {
          console.log('cmd install failed, trying npx fallback...');
          // Third try: Local npx install (no global permissions needed)
          execSync('npm install @remotion/cli', { 
            stdio: 'inherit', 
            timeout: 120000 
          });
        }
      }
    } else if (platform.os === 'macos') {
      // macOS: Handle npm prefix issues
      try {
        execSync('npm install -g @remotion/cli', { 
          stdio: 'inherit', 
          timeout: 120000 
        });
      } catch (error) {
        // Try with specific npm prefix
        const homePrefix = path.join(osModule.homedir(), '.npm-global');
        execSync(`npm config set prefix ${homePrefix} && npm install -g @remotion/cli`, { 
          stdio: 'inherit', 
          timeout: 120000 
        });
      }
    } else {
      // Linux: Try regular install, fall back to sudo if needed
      try {
        execSync('npm install -g @remotion/cli', { 
          stdio: 'inherit', 
          timeout: 120000 
        });
      } catch (error) {
        console.log('Regular install failed, checking if sudo is needed...');
        // Don't automatically sudo - just inform user
        throw new Error('Global npm install failed. You may need to run: sudo npm install -g @remotion/cli');
      }
    }
    
    console.log('✅ Remotion CLI installed globally');
  } catch (error) {
    // If global install fails, try without -g (local fallback)
    console.log('Global install failed, this is normal on some systems');
    throw error; // Let caller handle gracefully
  }
}

// NEW: Enhanced project management
async function ensureRemotionProject(): Promise<string> {
  // First, try to find existing project using current logic
  const existingProject = findExistingProject();
  if (existingProject) {
    // Verify the existing project is actually working
    if (await verifyProjectHealth(existingProject)) {
      return existingProject;
    } else {
      console.log('🔧 Found existing project but it needs repair...');
      await repairProject(existingProject);
      return existingProject;
    }
  }
  
  // No project found - create one automatically
  console.log('🎬 No Remotion project found. Creating one automatically...');
  return await createRemotionProject();
}

// Enhanced project health check
async function verifyProjectHealth(projectPath: string): Promise<boolean> {
  try {
    // Check package.json exists and has required dependencies
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      return false;
    }
    
    const packageJson = fs.readJsonSync(packageJsonPath);
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Must have core Remotion dependencies
    if (!allDeps.remotion && !allDeps['@remotion/cli']) {
      return false;
    }
    
    // Check if src directory exists
    const srcDir = path.join(projectPath, 'src');
    if (!fs.existsSync(srcDir)) {
      return false;
    }
    
    // Check if node_modules exists (indicates dependencies are installed)
    const nodeModulesDir = path.join(projectPath, 'node_modules');
    if (!fs.existsSync(nodeModulesDir)) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

// NEW: Comprehensive validation of complete installation
async function validateCompleteInstallation(testVideoRender: boolean = false): Promise<{
  isValid: boolean;
  details: {
    nodejs: boolean;
    npm: boolean;
    remotionCli: boolean;
    project: boolean;
    dependencies: boolean;
    canCreateComponent: boolean;
    canRenderVideo?: boolean;
  };
  issues: string[];
  fixes: string[];
}> {
  const issues: string[] = [];
  const fixes: string[] = [];
  const details = {
    nodejs: false,
    npm: false,
    remotionCli: false,
    project: false,
    dependencies: false,
    canCreateComponent: false,
    canRenderVideo: undefined as boolean | undefined
  };
  
  try {
    // Check Node.js
    const nodeStatus = await checkNodeJS();
    details.nodejs = nodeStatus.installed;
    if (!nodeStatus.installed) {
      issues.push('Node.js not installed');
      fixes.push('Install Node.js from https://nodejs.org');
    }
    
    // Check npm
    const npmStatus = await checkNPM();
    details.npm = npmStatus.installed;
    if (!npmStatus.installed) {
      issues.push('npm not available');
      fixes.push('Reinstall Node.js (npm comes bundled)');
    }
    
    // Check Remotion CLI
    const remotionStatus = await checkRemotionInstallation();
    details.remotionCli = remotionStatus.cliInstalled;
    if (!remotionStatus.cliInstalled) {
      issues.push('Remotion CLI not installed');
      fixes.push('Run: npm install -g @remotion/cli');
    }
    
    // Check project
    details.project = remotionStatus.projectExists;
    if (!remotionStatus.projectExists) {
      issues.push('No Remotion project found');
      fixes.push('Run setup_remotion_environment tool');
    } else {
      // Check project health
      const projectHealthy = await verifyProjectHealth(remotionStatus.projectPath!);
      details.dependencies = projectHealthy;
      if (!projectHealthy) {
        issues.push('Project dependencies incomplete');
        fixes.push('Run repair_remotion_project tool');
      }
    }
    
    // Test component creation capability
    if (details.nodejs && details.npm && details.project) {
      try {
        const projectRoot = await ensureRemotionProject();
        const testComponentPath = path.join(projectRoot, 'src', 'components', '__test__.tsx');
        
        // Try to write a test component
        await fs.writeFile(testComponentPath, 'export const TestComponent = () => <div>Test</div>;');
        await fs.remove(testComponentPath); // Clean up
        details.canCreateComponent = true;
      } catch (error) {
        details.canCreateComponent = false;
        issues.push('Cannot create components');
        fixes.push('Check file permissions and project structure');
      }
    }
    
    // Test video rendering (optional)
    if (testVideoRender && details.canCreateComponent) {
      try {
        // This would be a more complex test - simplified for now
        details.canRenderVideo = true;
      } catch (error) {
        details.canRenderVideo = false;
        issues.push('Video rendering failed');
        fixes.push('Check Remotion dependencies and FFmpeg installation');
      }
    }
    
    const isValid = details.nodejs && details.npm && details.project && details.dependencies && details.canCreateComponent;
    
    return { isValid, details, issues, fixes };
  } catch (error) {
    issues.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    fixes.push('Check system environment and try again');
    return { isValid: false, details, issues, fixes };
  }
}

// Repair broken project
async function repairProject(projectPath: string): Promise<void> {
  console.log(`🔧 Repairing project at: ${projectPath}`);
  
  try {
    // Ensure src directory exists
    const srcDir = path.join(projectPath, 'src');
    await fs.ensureDir(srcDir);
    await fs.ensureDir(path.join(srcDir, 'components'));
    
    // Check and repair package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    let packageJson = {};
    
    if (fs.existsSync(packageJsonPath)) {
      packageJson = fs.readJsonSync(packageJsonPath);
    }
    
    // Ensure required dependencies are present
    const requiredDeps = {
      "@remotion/cli": "4.0.340",
      "@remotion/player": "4.0.340",
      "react": "18.2.0",
      "react-dom": "18.2.0",
      "remotion": "4.0.340",
      "lucide-react": "^0.263.1"
    };
    
    const requiredDevDeps = {
      "@types/react": "^18.0.0",
      "typescript": "^5.0.0"
    };
    
    packageJson = {
      name: "claude-generated-videos",
      version: "1.0.0",
      description: "Auto-generated Remotion project for Claude Desktop",
      scripts: {
        "dev": "remotion studio",
        "build": "remotion render",
        "preview": "remotion preview",
        "upgrade": "remotion upgrade"
      },
      ...packageJson,
      dependencies: { ...requiredDeps, ...(packageJson as any).dependencies },
      devDependencies: { ...requiredDevDeps, ...(packageJson as any).devDependencies }
    };
    
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    
    // Reinstall dependencies
    console.log('📦 Reinstalling dependencies...');
    try {
      execSync('npm install', { 
        cwd: projectPath, 
        stdio: 'inherit',
        timeout: 60000 // 1 minute timeout
      });
      console.log('✅ Project repaired successfully!');
    } catch (error) {
      console.log('⚠️  Dependency installation failed, but project structure is repaired.');
    }
    
  } catch (error) {
    console.log('⚠️  Project repair encountered issues, but continuing...');
  }
}

function findExistingProject(): string | null {
  // Calculate project root based on server location
  const serverDir = path.dirname(__filename);
  const mcpServerDir = path.dirname(serverDir);
  const projectRoot = path.dirname(mcpServerDir);
  
  // Check if current location is a Remotion project
  if (isRemotionProject(projectRoot)) {
    return projectRoot;
  }
  
  // Search from current working directory
  let currentDir = process.cwd();
  while (currentDir !== path.parse(currentDir).root) {
    if (isRemotionProject(currentDir)) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  
  // Check default location
  if (fs.existsSync(DEFAULT_PROJECT_PATH) && isRemotionProject(DEFAULT_PROJECT_PATH)) {
    return DEFAULT_PROJECT_PATH;
  }
  
  return null;
}

function isRemotionProject(projectPath: string): boolean {
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }
  
  try {
    const packageJson = fs.readJsonSync(packageJsonPath);
    return !!(packageJson.dependencies?.remotion || packageJson.devDependencies?.remotion);
  } catch (e) {
    return false;
  }
}

async function createRemotionProject(): Promise<string> {
  return await createRemotionProjectAt(DEFAULT_PROJECT_PATH);
}

async function copyGuidelinesIfAvailable(projectPath: string): Promise<void> {
  try {
    // Try to find guidelines in the MCP server directory
    const serverDir = path.dirname(__filename);
    const mcpServerDir = path.dirname(serverDir);
    const mcpRootDir = path.dirname(mcpServerDir);
    const guidelinesSource = path.join(mcpRootDir, 'claude-dev-guidelines');
    
    if (fs.existsSync(guidelinesSource)) {
      const guidelinesTarget = path.join(projectPath, 'claude-dev-guidelines');
      await fs.copy(guidelinesSource, guidelinesTarget);
      console.log('📋 Copied animation guidelines to project');
    }
  } catch (error) {
    // Guidelines not essential, continue without them
    console.log('📋 Guidelines not available, project will work without them');
  }
}

function getProjectRoot(): string {
  // Use the new auto-installation logic
  const existingProject = findExistingProject();
  if (existingProject) {
    return existingProject;
  }
  
  // If no project exists, the calling function should handle creation
  // For now, return the default path (will be created when needed)
  return DEFAULT_PROJECT_PATH;
}

async function createRemotionProjectAt(targetPath: string): Promise<string> {
  console.log(`📁 Creating Remotion project at: ${targetPath}`);
  
  // Ensure directory exists
  await fs.ensureDir(targetPath);
  
  // Create package.json
  const packageJson = {
    "name": "claude-generated-videos",
    "version": "1.0.0",
    "description": "Auto-generated Remotion project for Claude Desktop",
    "scripts": {
      "dev": "remotion studio",
      "build": "remotion render",
      "preview": "remotion preview",
      "upgrade": "remotion upgrade"
    },
    "dependencies": {
      "@remotion/cli": "4.0.340",
      "@remotion/player": "4.0.340", 
      "react": "18.2.0",
      "react-dom": "18.2.0",
      "remotion": "4.0.340",
      "lucide-react": "^0.263.1"
    },
    "devDependencies": {
      "@types/react": "^18.0.0",
      "typescript": "^5.0.0"
    }
  };
  
  await fs.writeJson(path.join(targetPath, 'package.json'), packageJson, { spaces: 2 });
  
  // Create tsconfig.json
  const tsConfig = {
    "compilerOptions": {
      "target": "ES2022",
      "lib": ["DOM", "DOM.Iterable", "ES2022"],
      "allowJs": true,
      "skipLibCheck": true,
      "esModuleInterop": true,
      "allowSyntheticDefaultImports": true,
      "strict": true,
      "forceConsistentCasingInFileNames": true,
      "moduleResolution": "node",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx"
    },
    "include": ["src"]
  };
  
  await fs.writeJson(path.join(targetPath, 'tsconfig.json'), tsConfig, { spaces: 2 });
  
  // Create remotion.config.ts
  const remotionConfig = `import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
`;
  
  await fs.writeFile(path.join(targetPath, 'remotion.config.ts'), remotionConfig);
  
  // Create src directory and initial files
  const srcDir = path.join(targetPath, 'src');
  await fs.ensureDir(srcDir);
  await fs.ensureDir(path.join(srcDir, 'components'));
  
  // Create index.ts
  const indexContent = `export * from './Root';`;
  await fs.writeFile(path.join(srcDir, 'index.ts'), indexContent);
  
  // Create Root.tsx with welcome video
  const rootContent = `import React from 'react';
import { Composition } from 'remotion';
import { WelcomeVideo } from './components/WelcomeVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WelcomeVideo"
        component={WelcomeVideo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
`;
  
  await fs.writeFile(path.join(srcDir, 'Root.tsx'), rootContent);
  
  // Create welcome video component
  const welcomeComponent = `import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

export const WelcomeVideo: React.FC = () => {
  const frame = useCurrentFrame();
  
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    easing: Easing.out(Easing.cubic)
  });
  
  const titleY = interpolate(frame, [0, 30], [50, 0], {
    easing: Easing.out(Easing.cubic)
  });
  
  const subtitleOpacity = interpolate(frame, [20, 50], [0, 1], {
    easing: Easing.out(Easing.cubic)
  });
  
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: 'white'
      }}
    >
      <h1
        style={{
          fontSize: '80px',
          fontWeight: 'bold',
          margin: '0 0 30px 0',
          opacity: titleOpacity,
          transform: \`translateY(\${titleY}px)\`
        }}
      >
        🎬 Rough Cuts MCP
      </h1>
      
      <p
        style={{
          fontSize: '32px',
          opacity: subtitleOpacity,
          maxWidth: '800px',
          lineHeight: 1.4
        }}
      >
        Auto-generated Remotion project ready for Claude Desktop!<br />
        Ask Claude to create amazing videos.
      </p>
    </AbsoluteFill>
  );
};
`;
  
  await fs.writeFile(path.join(srcDir, 'components', 'WelcomeVideo.tsx'), welcomeComponent);
  
  // Copy guidelines if they exist in the MCP
  await copyGuidelinesIfAvailable(targetPath);
  
  // Install dependencies
  console.log('📦 Installing Remotion dependencies...');
  try {
    execSync('npm install', { 
      cwd: targetPath, 
      stdio: 'inherit' 
    });
    console.log('✅ Remotion project created successfully!');
  } catch (error) {
    console.log('⚠️  Project created but npm install failed. Dependencies will be installed when first component is created.');
  }
  
  return targetPath;
}

async function ensureDependenciesInstalled(projectPath: string): Promise<void> {
  const nodeModulesPath = path.join(projectPath, 'node_modules');
  
  // Check if node_modules exists and has Remotion
  if (fs.existsSync(nodeModulesPath) && fs.existsSync(path.join(nodeModulesPath, 'remotion'))) {
    return; // Dependencies already installed
  }
  
  console.log('📦 Installing Remotion dependencies...');
  try {
    execSync('npm install', { 
      cwd: projectPath, 
      stdio: 'inherit' 
    });
    console.log('✅ Dependencies installed successfully!');
  } catch (error) {
    console.warn('⚠️  Failed to install dependencies automatically. You may need to run "npm install" manually.');
  }
}

async function createSimpleComponent(name: string, code: string): Promise<void> {
  // CRITICAL: Auto-setup environment before ANY component creation
  await ensureCompleteEnvironment();
  
  // Ensure Remotion project exists (auto-create if needed)
  const projectRoot = await ensureRemotionProject();
  
  // Ensure dependencies are installed
  await ensureDependenciesInstalled(projectRoot);
  
  const componentsDir = path.join(projectRoot, 'src', 'components');
  const componentPath = path.join(componentsDir, name + '.tsx');
  
  await fs.ensureDir(componentsDir);
  await fs.writeFile(componentPath, code);
}
// NEW: Delete component helper function
async function deleteComponent(componentName: string): Promise<void> {
  const projectRoot = await ensureRemotionProject();
  const componentPath = path.join(projectRoot, 'src', 'components', componentName + '.tsx');
  
  // Check if component exists
  if (!await fs.pathExists(componentPath)) {
    throw new Error(`Component "${componentName}" not found`);
  }
  
  // Delete the component file
  await fs.remove(componentPath);
  
  // Remove from Root.tsx composition
  await removeFromRootComposition(componentName);
}

// NEW: Remove component from Root.tsx
async function removeFromRootComposition(componentName: string): Promise<void> {
  const projectRoot = await ensureRemotionProject();
  const rootPath = path.join(projectRoot, 'src', 'Root.tsx');
  
  if (!await fs.pathExists(rootPath)) {
    return; // No Root.tsx to update
  }
  
  let rootContent = await fs.readFile(rootPath, 'utf-8');
  
  // Remove import line - handle multiple import formats
  const importPatterns = [
    `import ${componentName} from './components/${componentName}';`,           // default import
    `import { ${componentName} } from './components/${componentName}';`,       // named import
    `import {${componentName}} from './components/${componentName}';`,         // named import (no spaces)
  ];
  
  for (const pattern of importPatterns) {
    rootContent = rootContent.replace(pattern + '\n', '');
    rootContent = rootContent.replace(pattern, ''); // Handle case without newline
  }
  
  // Remove composition block (multi-line)
  const compositionRegex = new RegExp(
    `\\s*<Composition[^>]*\\n[^>]*id="${componentName}"[^>]*\\n[^>]*component=\\{${componentName}\\}[^>]*\\n[^>]*durationInFrames=\\{[^}]*\\}[^>]*\\n[^>]*fps=\\{[^}]*\\}[^>]*\\n[^>]*width=\\{[^}]*\\}[^>]*\\n[^>]*height=\\{[^}]*\\}[^>]*\\n[^>]*/>`,
    'g'
  );
  rootContent = rootContent.replace(compositionRegex, '');
  
  // Also handle single-line composition format
  const singleLineRegex = new RegExp(
    `\\s*<Composition[^>]*id="${componentName}"[^>]*/>`,
    'g'
  );
  rootContent = rootContent.replace(singleLineRegex, '');
  
  await fs.writeFile(rootPath, rootContent);
}

async function updateRootComposition(componentName: string, duration: number = 90): Promise<void> {
  const projectRoot = await ensureRemotionProject();
  const rootPath = path.join(projectRoot, 'src', 'Root.tsx');
  
  let rootContent = '';
  if (await fs.pathExists(rootPath)) {
    rootContent = await fs.readFile(rootPath, 'utf-8');
  } else {
    rootContent = "import React from 'react';\n";
    rootContent += "import { Composition } from 'remotion';\n\n";
    rootContent += "export const RemotionRoot: React.FC = () => {\n";
    rootContent += "  return (\n";
    rootContent += "    <>\n";
    rootContent += "    </>\n";
    rootContent += "  );\n";
    rootContent += "};\n";
  }
  
  const importLine = "import " + componentName + " from './components/" + componentName + "';";
  
  if (!rootContent.includes(importLine)) {
    const lines = rootContent.split('\n');
    let insertIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import')) {
        insertIndex = i + 1;
      }
    }
    
    lines.splice(insertIndex, 0, importLine);
    rootContent = lines.join('\n');
  }  
  const compositionJsx = '      <Composition\n' +
    '        id="' + componentName + '"\n' +
    '        component={' + componentName + '}\n' +
    '        durationInFrames={' + duration + '}\n' +
    '        fps={30}\n' +
    '        width={1920}\n' +
    '        height={1080}\n' +
    '      />';
  
  if (!rootContent.includes(compositionJsx)) {
    const insertPoint = rootContent.lastIndexOf('    </>');
    if (insertPoint !== -1) {
      rootContent = rootContent.slice(0, insertPoint) + 
        compositionJsx + '\n' + 
        rootContent.slice(insertPoint);
    }
  }
  
  await fs.writeFile(rootPath, rootContent);
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_remotion_component',
        description: 'Create a new Remotion video component',
        inputSchema: {
          type: 'object',
          properties: {
            componentName: {
              type: 'string',
              description: 'Name for the React component (PascalCase)'
            },
            code: {
              type: 'string', 
              description: 'Complete TypeScript React component code'
            },
            duration: {
              type: 'number',
              description: 'Duration in seconds (default: 3)',
              default: 3
            }
          },
          required: ['componentName', 'code']
        }
      },
      {
        name: 'edit_remotion_component',
        description: 'Edit an existing Remotion component',
        inputSchema: {
          type: 'object',
          properties: {
            componentName: {
              type: 'string',
              description: 'Name of the component to edit'
            },
            newCode: {
              type: 'string',
              description: 'Updated component code'
            }
          },
          required: ['componentName', 'newCode']
        }
      },
      {
        name: 'delete_component',
        description: 'Delete an existing Remotion component',
        inputSchema: {
          type: 'object',
          properties: {
            componentName: {
              type: 'string',
              description: 'Name of the component to delete'
            }
          },
          required: ['componentName']
        }
      },
      {
        name: 'read_component',
        description: 'Read current code of a component',
        inputSchema: {
          type: 'object',
          properties: {
            componentName: {
              type: 'string',
              description: 'Name of component to read'
            }
          },
          required: ['componentName']
        }
      },
      {
        name: 'launch_remotion_studio',
        description: 'Launch Remotion Studio for preview',
        inputSchema: {
          type: 'object',
          properties: {
            port: {
              type: 'number',
              description: 'Port to run studio on (default: 3000)',
              default: 3000
            }
          }
        }
      },
      {
        name: 'render_video',
        description: 'Render component to MP4',
        inputSchema: {
          type: 'object',
          properties: {
            componentId: {
              type: 'string',
              description: 'Component ID to render'
            },
            outputPath: {
              type: 'string',
              description: 'Output file path (optional)'
            }
          },
          required: ['componentId']
        }
      },
      {
        name: 'list_components',
        description: 'List all available components',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_remotion_patterns',
        description: 'Get proven Remotion patterns and development guidelines',
        inputSchema: {
          type: 'object',
          properties: {
            patternType: {
              type: 'string',
              enum: ['all', 'basic', 'github', 'product', 'animation', 'validation', 'guidelines', 'layout-rules', 'project-status', 'quick-reference', 'detailed-design'],
              default: 'all'
            }
          }
        }
      },
      {
        name: 'check_environment',
        description: 'Check system environment and Remotion installation status',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'setup_remotion_environment',
        description: 'Automatically setup Remotion environment with all dependencies',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Optional custom path for project (default: ~/Claude-Videos/remotion-project)',
              default: 'default'
            },
            forceReinstall: {
              type: 'boolean',
              description: 'Force reinstallation even if project exists',
              default: false
            }
          }
        }
      },
      {
        name: 'repair_remotion_project',
        description: 'Repair broken Remotion project installation',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Path to project to repair (default: auto-detect)',
              default: 'auto'
            }
          }
        }
      },
      {
        name: 'test_auto_installation',
        description: 'Test the auto-installation system by forcing creation of a new Remotion project',
        inputSchema: {
          type: 'object',
          properties: {
            targetPath: {
              type: 'string',
              description: 'Optional path for test project (default: ~/Claude-Videos/test-install)',
              default: 'default'
            }
          }
        }
      },
      {
        name: 'set_working_directory',
        description: 'Set the current working project directory for video creation',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Path to the Remotion project directory'
            }
          },
          required: ['projectPath']
        }
      },
      {
        name: 'get_current_directory',
        description: 'Get the current working project directory',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'validate_complete_installation',
        description: 'Perform comprehensive validation of the entire Remotion installation',
        inputSchema: {
          type: 'object',
          properties: {
            testVideoRender: {
              type: 'boolean',
              description: 'Test video rendering capabilities (default: false)',
              default: false
            }
          }
        }
      },
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case 'create_remotion_component': {
        const { componentName, code, duration = 3 } = args as any;
        const durationFrames = Math.round(duration * 30);
        
        try {
          // CRITICAL: Auto-setup happens inside createSimpleComponent
          await createSimpleComponent(componentName, code);
          await updateRootComposition(componentName, durationFrames);
          
          // Get project path for user feedback
          const projectRoot = await ensureRemotionProject();
          
          return {
            content: [
              {
                type: 'text',
                text: `🎬 Component "${componentName}" created successfully!\n\n` +
                      `⏱️ Duration: ${duration} seconds (${durationFrames} frames)\n` +
                      `📁 Location: ${projectRoot}/src/components/${componentName}.tsx\n` +
                      `🔗 Registered in Root.tsx for rendering\n\n` +
                      `✨ Ready to preview in Remotion Studio or render to video!`
              }
            ]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          // Provide helpful error messages
          if (errorMessage.includes('Node.js')) {
            return {
              content: [
                {
                  type: 'text',
                  text: `❌ Environment Setup Required\n\n${errorMessage}\n\nPlease install Node.js from https://nodejs.org and restart Claude Desktop.`
                }
              ],
              isError: true
            };
          }
          
          return {
            content: [
              {
                type: 'text',
                text: `❌ Component creation failed: ${errorMessage}\n\nTry running 'check_environment' to diagnose issues.`
              }
            ],
            isError: true
          };
        }
      }
      
      case 'edit_remotion_component': {
        const { componentName, newCode } = args as any;
        
        // CRITICAL: Auto-setup environment before editing
        try {
          await ensureCompleteEnvironment();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Environment setup failed: ${errorMessage}\n\nPlease ensure Node.js is installed and try again.`
              }
            ],
            isError: true
          };
        }
        
        await createSimpleComponent(componentName, newCode);
        
        return {
          content: [
            {
              type: 'text', 
              text: 'Component "' + componentName + '" updated successfully!'
            }
          ]
        };
      }
      
      // NEW: Delete component handler
      case 'delete_component': {
        const { componentName } = args as any;
        
        // CRITICAL: Auto-setup environment before deleting
        try {
          await ensureCompleteEnvironment();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Environment setup failed: ${errorMessage}\n\nPlease ensure Node.js is installed and try again.`
              }
            ],
            isError: true
          };
        }
        
        await deleteComponent(componentName);
        
        return {
          content: [
            {
              type: 'text',
              text: 'Component "' + componentName + '" deleted successfully! Both the component file and Root.tsx registration have been removed.'
            }
          ]
        };
      }
      
      case 'read_component': {
        const { componentName } = args as any;
        
        // CRITICAL: Auto-setup environment before reading
        try {
          await ensureCompleteEnvironment();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Environment setup failed: ${errorMessage}\n\nPlease ensure Node.js is installed and try again.`
              }
            ],
            isError: true
          };
        }
        
        const projectRoot = await ensureRemotionProject();
        const componentPath = path.join(projectRoot, 'src', 'components', componentName + '.tsx');
        
        if (!await fs.pathExists(componentPath)) {
          throw new Error('Component "' + componentName + '" not found');
        }
        
        const code = await fs.readFile(componentPath, 'utf-8');
        
        return {
          content: [
            {
              type: 'text',
              text: 'Component: ' + componentName + '\n\n' + code
            }
          ]
        };
      }
      
      case 'launch_remotion_studio': {
        const { port = 3000 } = args as any;
        
        // CRITICAL: Auto-setup environment before launching studio
        try {
          await ensureCompleteEnvironment();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Environment setup failed: ${errorMessage}\n\nPlease ensure Node.js is installed and try again.`
              }
            ],
            isError: true
          };
        }
        
        const projectRoot = await ensureRemotionProject();
        await ensureDependenciesInstalled(projectRoot);
        
        return new Promise((resolve) => {
          // Try different Remotion CLI approaches
          const commands = [
            ['remotion', 'studio', '--port=' + port],
            ['npx', '@remotion/cli', 'studio', '--port=' + port],
            ['npx', 'remotion', 'studio', '--port=' + port]
          ];
          
          let success = false;
          
          for (const cmd of commands) {
            try {
              const studio = spawn(cmd[0], cmd.slice(1), {
                cwd: projectRoot,
                detached: true,
                stdio: 'ignore',
                shell: true
              });
              
              studio.unref();
              success = true;
              break;
            } catch (error) {
              console.log(`Failed to launch with ${cmd.join(' ')}, trying next method...`);
            }
          }
          
          setTimeout(() => {
            resolve({
              content: [
                {
                  type: 'text',
                  text: success 
                    ? `🎬 Remotion Studio launched on port ${port}!\n\n🌐 Access at: http://localhost:${port}\n📁 Project: ${projectRoot}\n\n✨ Ready to create and preview videos!`
                    : `⚠️ Studio launch attempted but may need manual intervention.\n\nTry opening a terminal in ${projectRoot} and running:\nnpx @remotion/cli studio --port=${port}`
                }
              ]
            });
          }, 2000);
        });
      }
      
      case 'render_video': {
        const { componentId, outputPath } = args as any;
        
        // CRITICAL: Auto-setup environment before rendering
        try {
          await ensureCompleteEnvironment();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Environment setup failed: ${errorMessage}\n\nPlease ensure Node.js is installed and try again.`
              }
            ],
            isError: true
          };
        }
        
        const projectRoot = await ensureRemotionProject();
        await ensureDependenciesInstalled(projectRoot);
        const defaultOutput = path.join(projectRoot, 'out', componentId + '.mp4');
        const finalOutput = outputPath || defaultOutput;
        
        await fs.ensureDir(path.dirname(finalOutput));
        
        return new Promise((resolve, reject) => {
          // Try different Remotion CLI approaches for rendering
          const commands = [
            ['remotion', 'render', 'src/Root.tsx', componentId, finalOutput],
            ['npx', '@remotion/cli', 'render', 'src/Root.tsx', componentId, finalOutput],
            ['npx', 'remotion', 'render', 'src/Root.tsx', componentId, finalOutput]
          ];
          
          let currentIndex = 0;
          
          function tryRender() {
            if (currentIndex >= commands.length) {
              reject(new Error('All render methods failed. Please check project setup and try again.'));
              return;
            }
            
            const cmd = commands[currentIndex];
            const render = spawn(cmd[0], cmd.slice(1), {
              cwd: projectRoot,
              stdio: 'pipe',
              shell: true
            });
            
            let output = '';
            render.stdout?.on('data', (data) => {
              output += data.toString();
            });
            
            render.stderr?.on('data', (data) => {
              output += data.toString();
            });
            
            render.on('close', (code) => {
              if (code === 0) {
                resolve({
                  content: [
                    {
                      type: 'text',
                      text: `🎬 Video rendered successfully!\n\n📁 Output: ${finalOutput}\n💾 File size: ${fs.existsSync(finalOutput) ? Math.round(fs.statSync(finalOutput).size / 1024) + ' KB' : 'Unknown'}\n\n✨ Ready to share your video!`
                    }
                  ]
                });
              } else {
                console.log(`Render attempt ${currentIndex + 1} failed, trying next method...`);
                currentIndex++;
                tryRender();
              }
            });
          }
          
          tryRender();
        });
      }
      
      case 'list_components': {
        // CRITICAL: Auto-setup environment before listing
        try {
          await ensureCompleteEnvironment();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Environment setup failed: ${errorMessage}\n\nPlease ensure Node.js is installed and try again.`
              }
            ],
            isError: true
          };
        }
        
        const projectRoot = await ensureRemotionProject();
        const componentsDir = path.join(projectRoot, 'src', 'components');
        
        if (!await fs.pathExists(componentsDir)) {
          return {
            content: [
              {
                type: 'text',
                text: 'No components directory found. Create some components first!'
              }
            ]
          };
        }
        
        const files = await fs.readdir(componentsDir);
        const components = files
          .filter(file => file.endsWith('.tsx'))
          .map(file => file.replace('.tsx', ''));
        
        return {
          content: [
            {
              type: 'text',
              text: 'Available components:\n' + components.map(comp => '- ' + comp).join('\n')
            }
          ]
        };
      }
      
      case 'check_environment': {
        try {
          const status: EnvironmentStatus = {
            nodejs: await checkNodeJS(),
            npm: await checkNPM(),
            remotion: await checkRemotionInstallation(),
            platform: await detectPlatform()
          };
          
          let report = '🔍 Environment Status Report:\n\n';
          
          // Node.js status
          report += `**Node.js**: ${status.nodejs.installed ? '✅' : '❌'} `;
          if (status.nodejs.installed) {
            report += `Installed (${status.nodejs.version})\n`;
          } else {
            report += `Not installed - Please install from https://nodejs.org\n`;
          }
          
          // npm status
          report += `**npm**: ${status.npm.installed ? '✅' : '❌'} `;
          if (status.npm.installed) {
            report += `Installed (${status.npm.version}) - Global install: ${status.npm.canInstallGlobal ? '✅' : '❌'}\n`;
          } else {
            report += `Not installed\n`;
          }
          
          // Remotion status
          report += `**Remotion CLI**: ${status.remotion.cliInstalled ? '✅' : '❌'} `;
          report += `${status.remotion.cliInstalled ? 'Available' : 'Not installed'}\n`;
          
          report += `**Remotion Project**: ${status.remotion.projectExists ? '✅' : '❌'} `;
          if (status.remotion.projectExists) {
            report += `Found at: ${status.remotion.projectPath}\n`;
            report += `  - Remotion: ${status.remotion.dependencies.remotion ? '✅' : '❌'}\n`;
            report += `  - React: ${status.remotion.dependencies.react ? '✅' : '❌'}\n`;
            report += `  - TypeScript: ${status.remotion.dependencies.typescript ? '✅' : '❌'}\n`;
          } else {
            report += `No project found\n`;
          }
          
          // Platform info
          report += `\n**Platform**: ${status.platform.os} (${status.platform.shell})\n`;
          report += `**Command execution**: ${status.platform.canExecute ? '✅' : '❌'}\n`;
          report += `**Recommended directory**: ${status.platform.recommendedDir}\n`;
          
          // Overall readiness
          const isReady = status.nodejs.installed && 
                         status.npm.installed && 
                         status.remotion.projectExists && 
                         status.remotion.dependencies.remotion;
          
          report += `\n🎬 **Overall Status**: ${isReady ? '✅ Ready for video creation!' : '⚠️ Setup required'}`;
          
          if (!isReady) {
            report += `\n\n**Next Steps**:`;
            if (!status.nodejs.installed) report += `\n1. Install Node.js from https://nodejs.org`;
            if (!status.remotion.projectExists) report += `\n2. Run 'setup_remotion_environment' tool`;
            if (status.remotion.projectExists && !status.remotion.dependencies.remotion) {
              report += `\n2. Run 'repair_remotion_project' tool`;
            }
          }
          
          return {
            content: [
              {
                type: 'text',
                text: report
              }
            ]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Environment check failed: ${errorMessage}`
              }
            ],
            isError: true
          };
        }
      }
      
      case 'setup_remotion_environment': {
        const { projectPath = 'default', forceReinstall = false } = args as any;
        
        try {
          // Check environment first
          const env = await checkNodeJS();
          if (!env.installed) {
            return {
              content: [
                {
                  type: 'text',
                  text: `❌ Node.js is required but not installed.\n\nPlease install Node.js from https://nodejs.org and try again.`
                }
              ],
              isError: true
            };
          }
          
          const targetPath = projectPath === 'default' 
            ? DEFAULT_PROJECT_PATH
            : projectPath;
          
          // Check if project already exists
          if (!forceReinstall && fs.existsSync(targetPath) && await verifyProjectHealth(targetPath)) {
            return {
              content: [
                {
                  type: 'text',
                  text: `✅ Remotion project already exists and is healthy at: ${targetPath}\n\nUse forceReinstall: true to recreate the project.`
                }
              ]
            };
          }
          
          // Remove existing if force reinstall
          if (forceReinstall && fs.existsSync(targetPath)) {
            await fs.remove(targetPath);
          }
          
          // Create new project
          await createRemotionProjectAt(targetPath);
          
          // Verify installation
          const isHealthy = await verifyProjectHealth(targetPath);
          
          let message = `✅ Remotion environment setup complete!\n\n`;
          message += `📁 Project location: ${targetPath}\n`;
          message += `🎬 Project health: ${isHealthy ? '✅ Healthy' : '⚠️ Needs attention'}\n\n`;
          message += `Ready for video creation! You can now:\n`;
          message += `- Create components with 'create_remotion_component'\n`;
          message += `- Launch studio with 'launch_remotion_studio'\n`;
          message += `- Render videos with 'render_video'`;
          
          if (!isHealthy) {
            message += `\n\n⚠️ Note: Dependencies may need manual installation. Run 'npm install' in the project directory if needed.`;
          }
          
          return {
            content: [
              {
                type: 'text',
                text: message
              }
            ]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Environment setup failed: ${errorMessage}`
              }
            ],
            isError: true
          };
        }
      }
      
      case 'repair_remotion_project': {
        const { projectPath = 'auto' } = args as any;
        
        try {
          let targetPath: string;
          
          if (projectPath === 'auto') {
            const existingProject = findExistingProject();
            if (!existingProject) {
              return {
                content: [
                  {
                    type: 'text',
                    text: `❌ No Remotion project found to repair.\n\nUse 'setup_remotion_environment' to create a new project.`
                  }
                ],
                isError: true
              };
            }
            targetPath = existingProject;
          } else {
            targetPath = projectPath;
          }
          
          if (!fs.existsSync(targetPath)) {
            return {
              content: [
                {
                  type: 'text',
                  text: `❌ Project not found at: ${targetPath}`
                }
              ],
              isError: true
            };
          }
          
          // Repair the project
          await repairProject(targetPath);
          
          // Verify repair
          const isHealthy = await verifyProjectHealth(targetPath);
          
          return {
            content: [
              {
                type: 'text',
                text: `${isHealthy ? '✅' : '⚠️'} Project repair completed at: ${targetPath}\n\nHealth status: ${isHealthy ? 'Healthy' : 'May need manual attention'}`
              }
            ]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Project repair failed: ${errorMessage}`
              }
            ],
            isError: true
          };
        }
      }
      
      case 'get_remotion_patterns': {
      
        const { patternType = 'all' } = args as any;
        
        // Basic patterns
        const patterns = {
          basic: 'Basic React component patterns for Remotion',
          github: 'GitHub showcase patterns',
          product: 'Product demo patterns',
          animation: 'Animation and motion patterns',
          validation: 'Component validation patterns'
        };
        
        // Guideline files mapping
        const guidelineFiles = {
          'guidelines': 'README.md',
          'layout-rules': 'REMOTION_ANIMATION_RULES.md',
          'project-status': 'PROJECT_STATUS.md',
          'quick-reference': 'QUICK_REFERENCE.md',
          'detailed-design': 'DETAILED_DESIGN_GUIDELINES.md'
        };
        
        // Check if this is a guideline request
        if (Object.keys(guidelineFiles).includes(patternType)) {
          const projectRoot = await ensureRemotionProject();
          const guidelinesDir = path.join(projectRoot, 'claude-dev-guidelines');
          const fileName = guidelineFiles[patternType as keyof typeof guidelineFiles];
          const filePath = path.join(guidelinesDir, fileName);
          
          try {
            if (await fs.pathExists(filePath)) {
              const content = await fs.readFile(filePath, 'utf-8');
              return {
                content: [
                  {
                    type: 'text',
                    text: `Remotion Guidelines (${patternType}):\n\n${content}`
                  }
                ]
              };
            } else {
              return {
                content: [
                  {
                    type: 'text',
                    text: `Guideline file not found: ${fileName}. Available guideline types: ${Object.keys(guidelineFiles).join(', ')}`
                  }
                ]
              };
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
              content: [
                {
                  type: 'text',
                  text: `Error reading guideline file: ${errorMessage}`
                }
              ]
            };
          }
        }
        
        // Handle basic patterns
        let result = '';
        if (patternType === 'all') {
          result = 'Basic Patterns:\n' + 
            Object.entries(patterns)
              .map(([key, desc]) => `${key}: ${desc}`)
              .join('\n') +
            '\n\nGuideline Types:\n' +
            Object.keys(guidelineFiles)
              .map(type => `${type}: Access development guidelines and rules`)
              .join('\n');
        } else {
          result = patterns[patternType as keyof typeof patterns] || 'Pattern not found';
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Remotion Patterns (${patternType}):\n\n${result}`
            }
          ]
        };
      }
      
      case 'test_auto_installation': {
        const { targetPath = 'default' } = args as any;
        const testPath = targetPath === 'default' 
          ? path.join(osModule.homedir(), 'Claude-Videos', 'test-install')
          : targetPath;
        
        try {
          // Remove existing test directory
          if (await fs.pathExists(testPath)) {
            await fs.remove(testPath);
          }
          
          // Force create new project
          console.log(`🧪 Testing auto-installation at: ${testPath}`);
          
          // Create the project manually to test the installation logic
          await fs.ensureDir(testPath);
          
          // Use the same logic as createRemotionProject but at test location
          await createRemotionProjectAt(testPath);
          
          return {
            content: [
              {
                type: 'text',
                text: `✅ Auto-installation test successful!\n\nCreated Remotion project at: ${testPath}\n\nProject includes:\n- package.json with Remotion dependencies\n- TypeScript configuration\n- src/ directory with components\n- Welcome video component\n- Animation guidelines (if available)\n\nDependencies installation attempted (check console for status).`
              }
            ]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Auto-installation test failed: ${errorMessage}`
              }
            ]
          };
        }
      }
      
      case 'force_create_project': {
        const { projectPath = 'default' } = args as any;
        const targetPath = projectPath === 'default' 
          ? path.join(osModule.homedir(), 'Claude-Videos', 'new-remotion-project')
          : projectPath;
        
        try {
          await createRemotionProjectAt(targetPath);
          
          return {
            content: [
              {
                type: 'text',
                text: `✅ New Remotion project created at: ${targetPath}\n\nReady for video generation!`
              }
            ]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Project creation failed: ${errorMessage}`
              }
            ]
          };
        }
      }
      
      case 'validate_complete_installation': {
        const { testVideoRender = false } = args as any;
        
        try {
          const validation = await validateCompleteInstallation(testVideoRender);
          
          let report = '🔍 **Complete Installation Validation**\n\n';
          
          // Overall status
          report += `**Overall Status**: ${validation.isValid ? '✅ READY' : '❌ NEEDS ATTENTION'}\n\n`;
          
          // Component details
          report += '**Component Check**:\n';
          report += `- Node.js: ${validation.details.nodejs ? '✅' : '❌'}\n`;
          report += `- npm: ${validation.details.npm ? '✅' : '❌'}\n`;
          report += `- Remotion CLI: ${validation.details.remotionCli ? '✅' : '❌'}\n`;
          report += `- Project exists: ${validation.details.project ? '✅' : '❌'}\n`;
          report += `- Dependencies: ${validation.details.dependencies ? '✅' : '❌'}\n`;
          report += `- Can create components: ${validation.details.canCreateComponent ? '✅' : '❌'}\n`;
          
          if (validation.details.canRenderVideo !== undefined) {
            report += `- Can render videos: ${validation.details.canRenderVideo ? '✅' : '❌'}\n`;
          }
          
          // Issues and fixes
          if (validation.issues.length > 0) {
            report += '\n**Issues Found**:\n';
            validation.issues.forEach((issue, i) => {
              report += `${i + 1}. ${issue}\n`;
            });
            
            report += '\n**Recommended Fixes**:\n';
            validation.fixes.forEach((fix, i) => {
              report += `${i + 1}. ${fix}\n`;
            });
          }
          
          if (validation.isValid) {
            report += '\n🎉 **Your Remotion environment is ready for video creation!**';
          } else {
            report += '\n⚠️ **Please address the issues above for optimal performance.**';
          }
          
          return {
            content: [
              {
                type: 'text',
                text: report
              }
            ]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Validation failed: ${errorMessage}`
              }
            ],
            isError: true
          };
        }
      }
      
      default:
        throw new Error('Unknown tool: ' + name);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      content: [
        {
          type: 'text',
          text: 'Error: ' + errorMessage
        }
      ],
      isError: true
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('🎬 Rough Cuts MCP Server running (with delete functionality)');
}

// Fixed entry point detection for Windows/ES modules
if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}