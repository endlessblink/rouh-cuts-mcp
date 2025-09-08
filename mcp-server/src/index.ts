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
import os from 'os';

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
const DEFAULT_PROJECT_PATH = path.join(os.homedir(), 'Claude-Videos', 'remotion-project');

async function ensureRemotionProject(): Promise<string> {
  // First, try to find existing project using current logic
  const existingProject = findExistingProject();
  if (existingProject) {
    return existingProject;
  }
  
  // No project found - create one automatically
  console.log('🎬 No Remotion project found. Creating one automatically...');
  return await createRemotionProject();
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
  console.log(`📁 Creating Remotion project at: ${DEFAULT_PROJECT_PATH}`);
  
  // Ensure directory exists
  await fs.ensureDir(DEFAULT_PROJECT_PATH);
  
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
  
  await fs.writeJson(path.join(DEFAULT_PROJECT_PATH, 'package.json'), packageJson, { spaces: 2 });
  
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
  
  await fs.writeJson(path.join(DEFAULT_PROJECT_PATH, 'tsconfig.json'), tsConfig, { spaces: 2 });
  
  // Create remotion.config.ts
  const remotionConfig = `import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
`;
  
  await fs.writeFile(path.join(DEFAULT_PROJECT_PATH, 'remotion.config.ts'), remotionConfig);
  
  // Create src directory and initial files
  const srcDir = path.join(DEFAULT_PROJECT_PATH, 'src');
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
  await copyGuidelinesIfAvailable(DEFAULT_PROJECT_PATH);
  
  // Install dependencies
  console.log('📦 Installing Remotion dependencies...');
  try {
    execSync('npm install', { 
      cwd: DEFAULT_PROJECT_PATH, 
      stdio: 'inherit' 
    });
    console.log('✅ Remotion project created successfully!');
  } catch (error) {
    console.log('⚠️  Project created but npm install failed. Dependencies will be installed when first component is created.');
  }
  
  return DEFAULT_PROJECT_PATH;
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
      }
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
        
        await createSimpleComponent(componentName, code);
        await updateRootComposition(componentName, durationFrames);
        
        return {
          content: [
            {
              type: 'text',
              text: 'Component "' + componentName + '" created successfully! Duration: ' + duration + ' seconds (' + durationFrames + ' frames)'
            }
          ]
        };
      }
      
      case 'edit_remotion_component': {
        const { componentName, newCode } = args as any;
        
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
        const projectRoot = await ensureRemotionProject();
        await ensureDependenciesInstalled(projectRoot);
        
        return new Promise((resolve) => {
          const studio = spawn('npx', ['remotion', 'studio', '--port=' + port], {
            cwd: projectRoot,
            detached: true,
            stdio: 'ignore',
            shell: true
          });
          
          studio.unref();
          
          setTimeout(() => {
            resolve({
              content: [
                {
                  type: 'text',
                  text: 'Remotion Studio launched on port ' + port + '. Access at: http://localhost:' + port
                }
              ]
            });
          }, 2000);
        });
      }
      
      case 'render_video': {
        const { componentId, outputPath } = args as any;
        const projectRoot = await ensureRemotionProject();
        await ensureDependenciesInstalled(projectRoot);
        const defaultOutput = path.join(projectRoot, 'out', componentId + '.mp4');
        const finalOutput = outputPath || defaultOutput;
        
        await fs.ensureDir(path.dirname(finalOutput));
        
        return new Promise((resolve, reject) => {
          const render = spawn('npx', [
            'remotion', 'render', 
            'src/Root.tsx', 
            componentId, 
            finalOutput
          ], {
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
                    text: 'Video rendered successfully to: ' + finalOutput
                  }
                ]
              });
            } else {
              reject(new Error('Render failed: ' + output));
            }
          });
        });
      }
      
      case 'list_components': {
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