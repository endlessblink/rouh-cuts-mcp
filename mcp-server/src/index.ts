#!/usr/bin/env node

/**
 * Clean Remotion MCP Server - Template Literal Corruption Fix
 * Avoids complex template literals to prevent WSL2/Windows encoding issues
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = new Server(
  {
    name: 'rough-cuts-mcp',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

function getProjectRoot(): string {
  // Calculate project root based on server location
  // Server is at: .../rough-cuts-mcp/mcp-server/dist/index.js
  // Project root is: .../rough-cuts-mcp/
  const serverDir = path.dirname(__filename); // dist directory
  const mcpServerDir = path.dirname(serverDir); // mcp-server directory  
  const projectRoot = path.dirname(mcpServerDir); // rough-cuts-mcp directory
  
  // Verify this is actually a Remotion project
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = fs.readJsonSync(packageJsonPath);
      if (packageJson.dependencies?.remotion || packageJson.devDependencies?.remotion) {
        return projectRoot;
      }
    } catch (e) {
      // Fall back to search method if package.json is invalid
    }
  }
  
  // Fallback: search from current working directory
  let currentDir = process.cwd();
  
  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = fs.readJsonSync(packageJsonPath);
        
        if (packageJson.dependencies?.remotion || packageJson.devDependencies?.remotion) {
          return currentDir;
        }
      } catch (e) {
        // Continue searching if package.json is invalid
      }
    }
    
    currentDir = path.dirname(currentDir);
  }
  
  // Last resort: use calculated project root even if verification failed
  return projectRoot;
}

async function createSimpleComponent(name: string, code: string): Promise<void> {
  const projectRoot = getProjectRoot();
  
  // Validate that we found a valid Remotion project
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`Could not find Remotion project root. No package.json found at: ${projectRoot}`);
  }
  
  try {
    const packageJson = fs.readJsonSync(packageJsonPath);
    if (!packageJson.dependencies?.remotion && !packageJson.devDependencies?.remotion) {
      throw new Error(`Could not find Remotion project root. Make sure you are in a directory with a package.json that includes Remotion. Current path: ${projectRoot}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Could not find Remotion project root')) {
      throw error;
    }
    throw new Error(`Could not find Remotion project root. Invalid package.json at: ${packageJsonPath}`);
  }
  
  const componentsDir = path.join(projectRoot, 'src', 'components');
  const componentPath = path.join(componentsDir, name + '.tsx');
  
  await fs.ensureDir(componentsDir);
  await fs.writeFile(componentPath, code);
}

async function updateRootComposition(componentName: string, duration: number = 90): Promise<void> {
  const projectRoot = getProjectRoot();
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
      },      {
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
      },      {
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
        description: 'Get proven Remotion patterns',
        inputSchema: {
          type: 'object',
          properties: {
            patternType: {
              type: 'string',
              enum: ['all', 'basic', 'github', 'product', 'animation', 'validation'],
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
      
      case 'read_component': {
        const { componentName } = args as any;
        const projectRoot = getProjectRoot();
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
        const projectRoot = getProjectRoot();
        
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
        const projectRoot = getProjectRoot();
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
        const projectRoot = getProjectRoot();
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
        
        const patterns = {
          basic: 'Basic React component patterns for Remotion',
          github: 'GitHub showcase patterns',
          product: 'Product demo patterns',
          animation: 'Animation and motion patterns',
          validation: 'Component validation patterns'
        };
        
        let result = '';
        if (patternType === 'all') {
          result = Object.entries(patterns)
            .map(([key, desc]) => key + ': ' + desc)
            .join('\n');
        } else {
          result = patterns[patternType as keyof typeof patterns] || 'Pattern not found';
        }
        
        return {
          content: [
            {
              type: 'text',
              text: 'Remotion Patterns (' + patternType + '):\n\n' + result
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
  
  console.error('🎬 Rough Cuts MCP Server running (clean version)');
}

// Fixed entry point detection for Windows/ES modules
if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}