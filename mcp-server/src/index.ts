#!/usr/bin/env node

/**
 * Remotion MCP Server - Clean Version (No Emojis)
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
    version: '3.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Auto-installation configuration
const DEFAULT_PROJECT_PATH = path.join(osModule.homedir(), 'Claude-Videos', 'remotion-project');

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

async function createSimpleComponent(name: string, code: string): Promise<void> {
  // Find or create project
  let projectRoot = findExistingProject();
  if (!projectRoot) {
    throw new Error('No Remotion project found. Please run setup_remotion_environment first.');
  }
  
  const componentsDir = path.join(projectRoot, 'src', 'components');
  const componentPath = path.join(componentsDir, name + '.tsx');
  
  await fs.ensureDir(componentsDir);
  await fs.writeFile(componentPath, code);
}

async function updateRootComposition(componentName: string, duration: number = 90): Promise<void> {
  const projectRoot = findExistingProject();
  if (!projectRoot) return;
  
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
        name: 'list_components',
        description: 'List all available components',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'check_environment',
        description: 'Check system environment and Remotion installation status',
        inputSchema: {
          type: 'object',
          properties: {}
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
        
        // Check if Node.js is available
        const nodeCheck = await checkNodeJS();
        if (!nodeCheck.installed) {
          throw new Error('Node.js is required but not installed. Please install Node.js from https://nodejs.org and restart Claude Desktop.');
        }
        
        await createSimpleComponent(componentName, code);
        await updateRootComposition(componentName, durationFrames);
        
        return {
          content: [
            {
              type: 'text',
              text: `Component "${componentName}" created successfully!\n\nDuration: ${duration} seconds (${durationFrames} frames)\nReady to preview in Remotion Studio or render to video!`
            }
          ]
        };
      }
      
      case 'list_components': {
        const projectRoot = findExistingProject();
        if (!projectRoot) {
          return {
            content: [
              {
                type: 'text',
                text: 'No Remotion project found. Please set up a project first.'
              }
            ]
          };
        }
        
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
        const nodeStatus = await checkNodeJS();
        const projectRoot = findExistingProject();
        
        let report = 'Environment Status Report:\n\n';
        
        report += `Node.js: ${nodeStatus.installed ? 'INSTALLED' : 'NOT FOUND'}\n`;
        if (nodeStatus.installed) {
          report += `Version: ${nodeStatus.version}\n`;
        } else {
          report += 'Please install Node.js from https://nodejs.org\n';
        }
        
        report += `\nRemotion Project: ${projectRoot ? 'FOUND' : 'NOT FOUND'}\n`;
        if (projectRoot) {
          report += `Location: ${projectRoot}\n`;
        } else {
          report += 'No Remotion project found in current directory or parent directories.\n';
        }
        
        const isReady = nodeStatus.installed && !!projectRoot;
        report += `\nStatus: ${isReady ? 'READY for video creation' : 'Setup required'}\n`;
        
        return {
          content: [
            {
              type: 'text',
              text: report
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
  
  console.error('Rough Cuts MCP Server running (clean version)');
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}
