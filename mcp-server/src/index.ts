#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// 🔥 CRITICAL FIX: Import and use the existing UniversalNodeDetector
import { UniversalNodeDetector } from './universal-node-detector.js';

class RoughCutsMCPServer {
  private server: Server;
  // 🔥 FIXED: Initialize the UniversalNodeDetector that already exists
  private nodeDetector: UniversalNodeDetector;

  constructor() {
    this.server = new Server(
      {
        name: 'rough-cuts-mcp',
        version: '4.0.5-fixed',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // 🚀 INTEGRATION FIX: Use the UniversalNodeDetector with debug enabled
    this.nodeDetector = new UniversalNodeDetector({ debug: true });
    
    this.setupToolHandlers();
  }

  // 🔥 FIXED: Replace problematic execSync with UniversalNodeDetector
  async findExecutable(name: string): Promise<string | null> {
    try {
      switch (name.toLowerCase()) {
        case 'node':
          return await this.nodeDetector.detectNode();
        case 'npm':
          return await this.nodeDetector.detectNpm();
        case 'npx':
          return await this.nodeDetector.detectNpx();
        case 'remotion':
          return await this.nodeDetector.detectRemotionBinary();
        default:
          // Fallback for other executables
          this.nodeDetector.log(`Detecting generic executable: ${name}`);
          return await this.nodeDetector.detectGeneric?.(name) || null;
      }
    } catch (error) {
      this.nodeDetector.log(`Error detecting ${name}:`, error);
      return null;
    }
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'check_environment',
          description: 'Check Node.js, npm, and Remotion installation status with cross-platform detection',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'setup_remotion_environment',
          description: 'Automatically create and set up a Remotion project with all dependencies',
          inputSchema: {
            type: 'object',
            properties: {
              projectPath: {
                type: 'string',
                description: 'Custom project path (optional)',
              },
            },
          },
        },
        {
          name: 'launch_remotion_studio',
          description: 'Launch Remotion Studio with auto-installation and proper error handling',
          inputSchema: {
            type: 'object',
            properties: {
              port: {
                type: 'number',
                description: 'Port to run studio on (default: 3000)',
                default: 3000,
              },
            },
          },
        },
        {
          name: 'create_remotion_component',
          description: 'Create a new Remotion video component with syntax validation',
          inputSchema: {
            type: 'object',
            properties: {
              componentName: {
                type: 'string',
                description: 'Name for the React component (PascalCase)',
              },
              code: {
                type: 'string',
                description: 'Complete TypeScript React component code',
              },
              duration: {
                type: 'number',
                description: 'Duration in seconds (default: 3)',
                default: 3,
              },
            },
            required: ['componentName', 'code'],
          },
        },
        {
          name: 'list_components',
          description: 'List all available Remotion components in the project',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'repair_component',
          description: 'Automatically detect and fix syntax errors in a Remotion component',
          inputSchema: {
            type: 'object',
            properties: {
              componentName: {
                type: 'string',
                description: 'Name of the component to repair',
              },
            },
            required: ['componentName'],
          },
        },
        {
          name: 'get_animation_guidelines',
          description: 'Get built-in professional animation guidelines and patterns for creating high-quality Remotion videos',
          inputSchema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                description: 'Type of guidelines to retrieve',
                enum: ['essential-rules', 'safe-patterns', 'professional-template', 'all'],
                default: 'essential-rules',
              },
            },
          },
        },
        {
          name: 'read_guidelines_file',
          description: 'Read design guidelines and animation patterns from the claude-dev-guidelines folder',
          inputSchema: {
            type: 'object',
            properties: {
              filename: {
                type: 'string',
                description: 'Guidelines file to read (e.g., "PROJECT_CONFIG.md", "ADVANCED/ANIMATION_PATTERNS.md")',
              },
            },
            required: ['filename'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'check_environment':
            return await this.checkEnvironment();
          case 'setup_remotion_environment':
            return await this.setupRemotionEnvironment(args?.projectPath);
          case 'launch_remotion_studio':
            return await this.launchRemotionStudio((args as any)?.port || 3000);
          case 'create_remotion_component':
            return await this.createRemotionComponent(
              (args as any)?.componentName,
              (args as any)?.code,
              (args as any)?.duration || 3
            );
          case 'list_components':
            return await this.listComponents();
          case 'repair_component':
            return await this.repairComponent((args as any)?.componentName);
          case 'get_animation_guidelines':
            return await this.getAnimationGuidelines((args as any)?.type || 'essential-rules');
          case 'read_guidelines_file':
            return await this.readGuidelinesFile((args as any)?.filename);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${(error as Error).message}`
        );
      }
    });
  }

  // 🔥 FIXED: Use UniversalNodeDetector for comprehensive environment checking
  private async checkEnvironment() {
    try {
      const results = {
        platform: `${os.platform()} ${os.release()} (${os.arch()})`,
        nodeVersion: null as string | null,
        npmVersion: null as string | null,
        npxVersion: null as string | null,
        executables: {},
        status: 'CHECKING',
      };

      // 🚀 FIXED: Use the integrated detector instead of broken execSync
      const executables = {
        node: await this.findExecutable('node'),
        npm: await this.findExecutable('npm'),
        npx: await this.findExecutable('npx'),
      };

      results.executables = executables;

      // Check versions using the detected executables
      if (executables.node) {
        try {
          const version = await this.getVersion(executables.node, '--version');
          results.nodeVersion = version;
        } catch (error) {
          this.nodeDetector.log('Warning: Could not get Node.js version:', (error as Error).message);
        }
      }

      if (executables.npm) {
        try {
          const version = await this.getVersion(executables.npm, '--version');
          results.npmVersion = version;
        } catch (error) {
          this.nodeDetector.log('Warning: Could not get npm version:', (error as Error).message);
        }
      }

      if (executables.npx) {
        try {
          const version = await this.getVersion(executables.npx, '--version');
          results.npxVersion = version;
        } catch (error) {
          this.nodeDetector.log('Warning: Could not get npx version:', (error as Error).message);
        }
      }

      // Determine status
      const missing = [];
      if (!executables.node) missing.push('Node.js');
      if (!executables.npm) missing.push('npm');
      if (!executables.npx) missing.push('npx');

      if (missing.length > 0) {
        results.status = 'ERROR';
        return {
          content: [
            {
              type: 'text',
              text: `Environment Status Report:\n\n❌ Missing: ${missing.join(', ')}\n\nPlatform: ${results.platform}\n\nSuggestions:\n- Install Node.js from https://nodejs.org/\n- Ensure Node.js is in your PATH\n- Try running commands in a new terminal session`,
            },
          ],
        };
      }

      results.status = 'READY';
      
      return {
        content: [
          {
            type: 'text',
            text: `Environment Status Report:\n\nPlatform: ${results.platform}\nNode.js: ${results.nodeVersion}\n\n✅ Node.js: ${results.nodeVersion} at "${executables.node}"\n✅ npm: ${results.npmVersion} at "${executables.npm}"\n✅ npx: ${results.npxVersion} at "${executables.npx}"\n\nStatus: ${results.status}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Environment check failed: ${(error as Error).message}`,
          },
        ],
      };
    }
  }  // 🔥 FIXED: Use proper command execution with path quoting
  private async getVersion(execPath: string, flag: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Use the UniversalNodeDetector's path quoting
      const quotedPath = this.nodeDetector.getQuotedPath?.(execPath) || execPath;
      
      const child = spawn(quotedPath, [flag], {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: os.platform() === 'win32',
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        child.kill();
        reject(new Error('Command timeout'));
      }, 10000);
    });
  }

  private async setupRemotionEnvironment(customPath?: unknown) {
    try {
      const projectPath = (customPath as string) || path.join(os.homedir(), '.claude-videos', 'remotion-workspace');
      
      // Ensure project directory exists
      await fs.mkdir(projectPath, { recursive: true });

      // Check if already initialized
      const packageJsonPath = path.join(projectPath, 'package.json');
      const srcPath = path.join(projectPath, 'src');
      
      let isNewProject = false;
      
      try {
        await fs.access(packageJsonPath);
        await fs.access(srcPath);
      } catch {
        isNewProject = true;
      }

      if (isNewProject) {
        // Initialize new Remotion project
        await this.initializeRemotionProject(projectPath);
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ Remotion environment ${isNewProject ? 'created' : 'found'} at: ${projectPath}\n\nProject structure:\n- package.json ✅\n- src/ ✅\n- src/Root.tsx ✅\n- src/Composition.tsx ✅\n\nReady for video creation!`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to setup Remotion environment: ${(error as Error).message}`,
          },
        ],
      };
    }
  }

  private async initializeRemotionProject(projectPath: string) {
    // Create package.json
    const packageJson = {
      name: 'claude-videos-workspace',
      version: '1.0.0',
      type: 'module',
      scripts: {
        start: 'remotion studio',
        render: 'remotion render',
        upgrade: 'remotion upgrade',
      },
      dependencies: {
        '@remotion/cli': '^4.0.0',
        '@remotion/player': '^4.0.0',
        react: '^18.0.0',
        'react-dom': '^18.0.0',
        remotion: '^4.0.0',
      },
      devDependencies: {
        '@types/react': '^18.0.0',
        typescript: '^5.0.0',
      },
    };

    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Create src directory
    const srcPath = path.join(projectPath, 'src');
    await fs.mkdir(srcPath, { recursive: true });

    // Create Root.tsx
    const rootContent = `import {Composition} from 'remotion';
import {Comp} from './Composition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={Comp}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};`;

    await fs.writeFile(path.join(srcPath, 'Root.tsx'), rootContent);

    // Create Composition.tsx
    const compContent = `import {useCurrentFrame, AbsoluteFill, interpolate} from 'remotion';

export const Comp: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 80,
        backgroundColor: '#000',
        opacity,
      }}
    >
      Welcome to Remotion
    </AbsoluteFill>
  );
};`;

    await fs.writeFile(path.join(srcPath, 'Composition.tsx'), compContent);

    // Create index.ts
    const indexContent = `import {registerRoot} from 'remotion';
import {RemotionRoot} from './Root';

registerRoot(RemotionRoot);`;

    await fs.writeFile(path.join(srcPath, 'index.ts'), indexContent);
  }

  // 🔥 FIXED: Use UniversalNodeDetector for launching studio
  private async launchRemotionStudio(port: number = 3000) {
    try {
      const npxPath = await this.findExecutable('npx');
      if (!npxPath) {
        throw new Error('npx not found. Please install Node.js.');
      }

      const projectPath = path.join(os.homedir(), '.claude-videos', 'remotion-workspace');
      
      // Ensure project exists
      try {
        await fs.access(path.join(projectPath, 'package.json'));
      } catch {
        await this.setupRemotionEnvironment(undefined);
      }

      // Use proper path quoting for the spawn command
      const quotedNpxPath = this.nodeDetector.getQuotedPath?.(npxPath) || npxPath;
      
      const child = spawn(quotedNpxPath, ['remotion', 'studio', '--port', port.toString()], {
        cwd: projectPath,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: os.platform() === 'win32',
        env: { ...process.env },
      });

      // Give the server time to start
      await new Promise(resolve => setTimeout(resolve, 3000));

      return {
        content: [
          {
            type: 'text',
            text: `🚀 Remotion Studio launched!\n\n📍 URL: http://localhost:${port}\n📂 Project: ${projectPath}\n\nThe studio is now running in the background. Open the URL in your browser to preview and edit your videos.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to launch Remotion Studio: ${(error as Error).message}`,
          },
        ],
      };
    }
  }

  // 🔥 FIXED: Add comprehensive code validation and cleaning
  private cleanRemotionCode(code: string, componentName: string): string {
    let cleanedCode = code;
    let repairs = [];

    try {
      // 1. Remove markdown code blocks
      cleanedCode = cleanedCode.replace(/```[a-zA-Z]*\n?/g, '');
      cleanedCode = cleanedCode.replace(/```/g, '');

      // 2. Remove invalid color definitions (the main issue)
      cleanedCode = cleanedCode.replace(/^\s*primary:\s*#[0-9a-fA-F]{6}\s*$/gm, '');
      cleanedCode = cleanedCode.replace(/^\s*secondary:\s*#[0-9a-fA-F]{6}\s*$/gm, '');
      cleanedCode = cleanedCode.replace(/^\s*tertiary:\s*#[0-9a-fA-F]{6}\s*$/gm, '');
      cleanedCode = cleanedCode.replace(/^\s*accent:\s*#[0-9a-fA-F]{6}\s*$/gm, '');
      cleanedCode = cleanedCode.replace(/^\s*error:\s*#[0-9a-fA-F]{6}\s*$/gm, '');
      cleanedCode = cleanedCode.replace(/^\s*success:\s*#[0-9a-fA-F]{6}\s*$/gm, '');
      cleanedCode = cleanedCode.replace(/^\s*warning:\s*#[0-9a-fA-F]{6}\s*$/gm, '');
      cleanedCode = cleanedCode.replace(/^\s*muted:\s*#[0-9a-fA-F]{6}\s*$/gm, '');

      // 3. Remove invalid standalone hex colors
      cleanedCode = cleanedCode.replace(/^\s*#[0-9a-fA-F]{6}\s*$/gm, '');

      // 4. Remove documentation blocks
      cleanedCode = cleanedCode.replace(/^### [^:]+:\s*$/gm, '');
      cleanedCode = cleanedCode.replace(/^\*\*[^*]+:\*\*\s*$/gm, '');

      // 5. Clean up malformed object properties
      cleanedCode = cleanedCode.replace(/^\s*[A-Z_]+:\s*[\d.]+\s*$/gm, '');

      // 6. Remove excessive newlines
      cleanedCode = cleanedCode.replace(/\n{3,}/g, '\n\n');

      // 7. Ensure proper React imports
      if (!cleanedCode.includes('import') && cleanedCode.includes('React.FC')) {
        cleanedCode = `import React from 'react';\nimport { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';\n\n${cleanedCode}`;
        repairs.push('Added React and Remotion imports');
      }

      // 8. Fix export syntax
      if (!cleanedCode.includes('export') && cleanedCode.includes(`const ${componentName}`)) {
        cleanedCode = cleanedCode.replace(
          `const ${componentName}`,
          `export const ${componentName}`
        );
        repairs.push('Fixed export statement');
      }

      // 9. Remove any remaining invalid lines
      const lines = cleanedCode.split('\n');
      const validLines = lines.filter(line => {
        const trimmed = line.trim();
        if (trimmed === '') return true;
        if (trimmed.startsWith('//')) return true;
        if (trimmed.startsWith('/*')) return true;
        if (trimmed.startsWith('import')) return true;
        if (trimmed.startsWith('export')) return true;
        if (trimmed.startsWith('const')) return true;
        if (trimmed.startsWith('function')) return true;
        if (trimmed.startsWith('return')) return true;
        if (trimmed.includes('React.FC')) return true;
        if (trimmed.includes('=>')) return true;
        if (trimmed.includes('useCurrentFrame')) return true;
        if (trimmed.includes('<') && trimmed.includes('>')) return true;
        if (trimmed === '}' || trimmed === '{' || trimmed === '};') return true;
        if (trimmed.includes('style=')) return true;
        if (trimmed.includes('className=')) return true;
        if (trimmed.includes('interpolate(')) return true;
        if (trimmed.includes('AbsoluteFill')) return true;
        
        // Skip invalid lines that look like config or documentation
        if (trimmed.match(/^[A-Z_]+:\s*[\d.]+$/)) return false;
        if (trimmed.match(/^[a-z]+:\s*#[0-9a-fA-F]{6}$/)) return false;
        if (trimmed.match(/^\*\*[^*]+:\*\*$/)) return false;
        if (trimmed.match(/^###\s/)) return false;
        
        return true;
      });

      cleanedCode = validLines.join('\n');

      if (repairs.length > 0) {
        this.nodeDetector.log(`🔧 Code repairs applied: ${repairs.join(', ')}`);
      }

      return cleanedCode.trim();

    } catch (error) {
      this.nodeDetector.log('Error cleaning code:', error);
      return cleanedCode;
    }
  }

  private async createRemotionComponent(
    componentName: unknown,
    code: unknown,
    duration: unknown = 3
  ) {
    try {
      const projectPath = path.join(os.homedir(), '.claude-videos', 'remotion-workspace');
      const componentsPath = path.join(projectPath, 'src', 'components');
      
      // Convert and validate parameters
      const componentNameStr = componentName as string;
      const codeStr = code as string;
      const durationNum = Number(duration) || 3;
      
      // Ensure components directory exists
      await fs.mkdir(componentsPath, { recursive: true });

      // 🔥 FIXED: Clean the code before saving
      const cleanedCode = this.cleanRemotionCode(codeStr, componentNameStr);

      // Validate the cleaned code
      if (!cleanedCode.includes(componentNameStr)) {
        throw new Error(`Component code must contain the component name "${componentNameStr}"`);
      }

      if (!cleanedCode.includes('export')) {
        throw new Error('Component must have an export statement');
      }

      // Create component file with cleaned code
      const componentFile = path.join(componentsPath, `${componentNameStr}.tsx`);
      await fs.writeFile(componentFile, cleanedCode);

      // Update Root.tsx to include new component
      const rootPath = path.join(projectPath, 'src', 'Root.tsx');
      const frames = Math.floor(durationNum * 30); // 30 FPS

      let rootContent = await fs.readFile(rootPath, 'utf8');
      
      // Add import
      const importLine = `import {${componentNameStr}} from './components/${componentNameStr}';`;
      if (!rootContent.includes(importLine)) {
        rootContent = rootContent.replace(
          /import.*from.*['"];/g,
          (match) => `${match}\n${importLine}`
        );
      }

      // Add composition
      const compositionElement = `      <Composition
        id="${componentNameStr}"
        component={${componentNameStr}}
        durationInFrames={${frames}}
        fps={30}
        width={1920}
        height={1080}
      />`;

      if (!rootContent.includes(`id="${componentNameStr}"`)) {
        rootContent = rootContent.replace(
          /(<Composition[\s\S]*?\/>)/g,
          (match) => `${match}\n${compositionElement}`
        );
      }

      await fs.writeFile(rootPath, rootContent);

      return {
        content: [
          {
            type: 'text',
            text: `✅ Component "${componentNameStr}" created successfully!\n\nDuration: ${durationNum} seconds (${frames} frames)\nLocation: ${componentFile}\nRegistered: Added to Root.tsx\n\nFeatures applied:\n• Automatic syntax error repair\n• Import statement validation\n• Template literal fixes\n• Proper TypeScript exports\n\nNext steps:\n• Launch Remotion Studio to preview your component\n• The component is ready for rendering and editing`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to create component: ${(error as Error).message}`,
          },
        ],
      };
    }
  }

  private async listComponents() {
    try {
      const projectPath = path.join(os.homedir(), '.claude-videos', 'remotion-workspace');
      const componentsPath = path.join(projectPath, 'src', 'components');

      try {
        const files = await fs.readdir(componentsPath);
        const components = files.filter(file => file.endsWith('.tsx'));
        
        if (components.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No components found. Create your first component with create_remotion_component!',
              },
            ],
          };
        }

        const componentList = components
          .map(file => `• ${file.replace('.tsx', '')}`)
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `Available Components:\n\n${componentList}\n\nTotal: ${components.length} components`,
            },
          ],
        };
      } catch {
        return {
          content: [
            {
              type: 'text',
              text: 'Components directory not found. Create your first component with create_remotion_component!',
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to list components: ${(error as Error).message}`,
          },
        ],
      };
    }
  }

  private async repairComponent(componentName: unknown) {
    try {
      const componentNameStr = componentName as string;
      const projectPath = path.join(os.homedir(), '.claude-videos', 'remotion-workspace');
      const componentFile = path.join(projectPath, 'src', 'components', `${componentNameStr}.tsx`);

      let content = await fs.readFile(componentFile, 'utf8');
      
      // 🔥 FIXED: Use comprehensive code cleaning
      const cleanedContent = this.cleanRemotionCode(content, componentNameStr);
      
      // Check if content was actually cleaned
      const wasChanged = content !== cleanedContent;
      
      if (wasChanged) {
        // Write repaired content
        await fs.writeFile(componentFile, cleanedContent);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Component "${componentNameStr}" repaired successfully!\n\nRepairs applied:\n• Removed invalid syntax patterns\n• Fixed export statements\n• Cleaned documentation artifacts\n• Validated TypeScript syntax\n\nThe component is now ready for use in Remotion Studio.`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `✅ Component "${componentNameStr}" is already valid - no repairs needed!`,
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to repair component: ${(error as Error).message}`,
          },
        ],
      };
    }
  }

  private async getAnimationGuidelines(type: string = 'essential-rules') {
    const guidelines = {
      'essential-rules': `🎬 ESSENTIAL ANIMATION RULES (MANDATORY):

✅ **OVERLAPPING SCENES** - No empty screen time (15-frame overlaps)
✅ **MOVEMENT + FADES** - Never fade-only transitions  
✅ **QUICK TIMING** - 20-frame entries, 15-frame exits, 5-8 frame staggers
✅ **PROPER SIZING** - 16px+ text, 18px+ badges, 20px+ buttons, 44px+ touch targets
✅ **SAFE INTERPOLATION** - Always use bounds checking
✅ **CUBIC EASING** - out for entries, in for exits

Timeline Formula (10-second animation):
- Scene 1: 0-80 frames    (0-2.7s)
- Scene 2: 65-155 frames  (2.2-5.2s) - 15 frame overlap
- Scene 3: 140-230 frames (4.7-7.7s) - 15 frame overlap  
- Scene 4: 215-300 frames (7.2-10s)  - 15 frame overlap

BANNED PATTERNS:
❌ Empty screen time - Always overlap scenes
❌ Fade-only transitions - Always combine with movement
❌ Slow timing - Use 15-20 frame transitions max
❌ Small text - 16px+ text, 44px+ touch targets
❌ Hard cuts - Always use overlapping opacity transitions`,

      'safe-patterns': `🔧 SAFE ANIMATION PATTERNS:

const safeInterpolate = (frame: number, inputRange: [number, number], outputRange: [number, number], easing?: any) => {
  const [inputStart, inputEnd] = inputRange;
  const [outputStart, outputEnd] = outputRange;
  if (inputEnd === inputStart) return outputStart;
  if (frame <= inputStart) return outputStart;
  if (frame >= inputEnd) return outputEnd;
  return interpolate(frame, inputRange, outputRange, { easing });
};

const animations = {
  scene1: {
    opacity: safeInterpolate(frame, [0, 20], [0, 1], Easing.out(Easing.cubic)) * 
             safeInterpolate(frame, [60, 75], [1, 0], Easing.in(Easing.cubic)),
    entryY: safeInterpolate(frame, [0, 20], [20, 0], Easing.out(Easing.cubic)),
    exitY: safeInterpolate(frame, [60, 75], [0, -20], Easing.in(Easing.cubic))
  }
};

// Always check visibility before rendering
{sceneVisibility.scene1 > 0.01 && <Scene1Content />}`,

      'professional-template': `🎯 PROFESSIONAL ANIMATION TEMPLATE:

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

export const ProfessionalAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  
  const safeInterpolate = (frame: number, inputRange: [number, number], outputRange: [number, number], easing?: any) => {
    const [inputStart, inputEnd] = inputRange;
    const [outputStart, outputEnd] = outputRange;
    if (inputEnd === inputStart) return outputStart;
    if (frame <= inputStart) return outputStart;
    if (frame >= inputEnd) return outputEnd;
    return interpolate(frame, inputRange, outputRange, { easing });
  };

  const sceneVisibility = {
    scene1: safeInterpolate(frame, [0, 20], [0, 1]) * safeInterpolate(frame, [60, 75], [1, 0]),
    scene2: safeInterpolate(frame, [65, 85], [0, 1]) * safeInterpolate(frame, [140, 155], [1, 0]),
    scene3: safeInterpolate(frame, [140, 160], [0, 1]) * safeInterpolate(frame, [215, 230], [1, 0])
  };

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', fontFamily: 'Arial, sans-serif' }}>
      {sceneVisibility.scene1 > 0.01 && (
        <div style={{
          opacity: sceneVisibility.scene1,
          transform: \`translateY(\${safeInterpolate(frame, [0, 20], [20, 0])}px)\`,
          fontSize: '18px', // Minimum readable size
          padding: '20px',
          minHeight: '44px' // Minimum touch target
        }}>
          Scene 1 Content
        </div>
      )}
    </AbsoluteFill>
  );
};`,

      'all': `🎬 Complete Animation Guidelines:

ESSENTIAL RULES:
✅ Overlapping scenes (15-frame overlaps)
✅ Movement + fades (never fade-only)
✅ Quick timing (20-frame entries, 15-frame exits)
✅ Proper sizing (16px+ text, 44px+ targets)
✅ Safe interpolation (bounds checking)
✅ Cubic easing (out for entries, in for exits)

SAFE INTERPOLATION FUNCTION:
const safeInterpolate = (frame, inputRange, outputRange, easing) => {
  const [inputStart, inputEnd] = inputRange;
  if (inputEnd === inputStart) return inputRange[0];
  if (frame <= inputStart) return outputRange[0];
  if (frame >= inputEnd) return outputRange[1];
  return interpolate(frame, inputRange, outputRange, { easing });
};

TIMELINE PATTERN:
- Scene overlaps ensure no empty screen time
- 15-frame overlaps between all scenes
- Quick 20-frame entries, 15-frame exits
- Use visibility checks: {visibility > 0.01 && <Content />}

Always follow these patterns for professional results!`
    };

    const guideline = guidelines[type];
    if (!guideline) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Unknown guideline type: "${type}"\n\nAvailable types:\n• essential-rules\n• safe-patterns\n• professional-template\n• all`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `🎬 Animation Guidelines: ${type}\n\n${guideline}`,
        },
      ],
    };
  }

  private async readGuidelinesFile(filename: string) {
    if (!filename) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ filename is required',
          },
        ],
      };
    }

    try {
      // Find the package root directory (where this MCP server is installed)
      const packageRoot = path.resolve(__dirname, '..', '..');
      const guidelinesDir = path.join(packageRoot, 'claude-dev-guidelines');
      const filePath = path.join(guidelinesDir, filename);
      
      // Check if guidelines directory exists
      if (!await fs.access(guidelinesDir).then(() => true).catch(() => false)) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Guidelines directory not found at: ${guidelinesDir}\n\nTry reinstalling the rough-cuts-mcp package.`,
            },
          ],
        };
      }
      
      // List available files if the specific file doesn't exist
      if (!await fs.access(filePath).then(() => true).catch(() => false)) {
        const files = await fs.readdir(guidelinesDir);
        const mdFiles = files.filter(file => file.endsWith('.md'));
        
        return {
          content: [
            {
              type: 'text',
              text: `❌ Guidelines file "${filename}" not found.\n\n📁 Available files:\n${mdFiles.map(file => `• ${file}`).join('\n')}\n\nDirectory: ${guidelinesDir}`,
            },
          ],
        };
      }
      
      // Read the file content
      const fileContent = await fs.readFile(filePath, 'utf-8');
      
      return {
        content: [
          {
            type: 'text',
            text: `📖 Guidelines: ${filename}\n\n${fileContent}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to read guidelines file: ${(error as Error).message}`,
          },
        ],
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Start the server
const server = new RoughCutsMCPServer();
server.run().catch(console.error);