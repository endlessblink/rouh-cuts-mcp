#!/usr/bin/env node

/**
 * Remotion AI Copilot MCP Server for Claude Desktop
 * 
 * This MCP provides tools for Claude to generate Remotion video components.
 * Claude Desktop acts as the AI - the MCP provides the video creation tools.
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

// ============================================================================
// SERVER SETUP
// ============================================================================
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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getProjectRoot(): string {
  // Start from the MCP server directory and go up to find the Remotion project
  let currentDir = process.cwd();
  
  // If we're in the mcp-server directory, go up one level
  if (currentDir.endsWith('mcp-server')) {
    currentDir = path.dirname(currentDir);
  }
  
  // Look for Remotion project starting from current directory
  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = fs.readJsonSync(packageJsonPath);
      
      if (packageJson.dependencies?.remotion || packageJson.devDependencies?.remotion) {
        return currentDir;
      }
    }
    
    currentDir = path.dirname(currentDir);
  }
  
  throw new Error('Could not find Remotion project root. Make sure you are in a directory with a package.json that includes Remotion.');
}

function validateRemotionCode(code: string): { isValid: boolean; errors: string[]; suggestions: string[] } {
  const errors: string[] = [];
  const suggestions: string[] = [];
  
  // Critical errors that will break Remotion
  if (code.includes('className=') || code.includes('class=')) {
    errors.push('Found className/class usage - use style prop instead for Remotion');
  }
  
  if (!code.includes('AbsoluteFill')) {
    suggestions.push('Consider using AbsoluteFill for full-screen video layout');
  }
  
  if (!code.includes('useCurrentFrame')) {
    suggestions.push('Consider adding useCurrentFrame for frame-based animations');
  }
  
  // Font size validation for video optimization
  const fontSizeMatches = code.match(/fontSize:\s*['"]([\d.]+)(\w+)['"]/g);
  if (fontSizeMatches) {
    fontSizeMatches.forEach(match => {
      const sizeMatch = match.match(/fontSize:\s*['"]([\d.]+)(\w+)['"]/);
      if (sizeMatch) {
        const size = parseFloat(sizeMatch[1]);
        const unit = sizeMatch[2];
        
        if ((unit === 'px' && size < 32) || (unit === 'rem' && size < 2)) {
          errors.push(`Font size ${size}${unit} is too small for video - use at least 32px or 2rem`);
        }
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    suggestions
  };
}

async function updateRootComposition(componentName: string, duration: number = 90): Promise<void> {
  const projectRoot = getProjectRoot();
  const rootPath = path.join(projectRoot, 'src', 'Root.tsx');
  
  let rootContent = `import React from 'react';
import { Composition } from 'remotion';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Generated compositions will be added here */}
    </>
  );
};`;
  
  if (await fs.pathExists(rootPath)) {
    rootContent = await fs.readFile(rootPath, 'utf-8');
  }
  
  // Add import for new component
  const importLine = `import { ${componentName} } from './components/${componentName}';`;
  
  if (!rootContent.includes(importLine)) {
    // Add import after existing imports
    const importMatch = rootContent.match(/^(import.*?;\n)+/ms);
    if (importMatch) {
      rootContent = rootContent.replace(
        importMatch[0],
        importMatch[0] + importLine + '\n'
      );
    } else {
      rootContent = importLine + '\n' + rootContent;
    }
  }
  
  // Add composition
  const compositionJsx = `      <Composition
        id="${componentName}"
        component={${componentName}}
        durationInFrames={${duration}}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />`;
  
  if (!rootContent.includes(`id="${componentName}"`)) {
    // Insert before the closing fragment
    rootContent = rootContent.replace(
      '    </>',
      compositionJsx + '\n    </>'
    );
  }
  
  await fs.writeFile(rootPath, rootContent);
}

// ============================================================================
// MCP TOOLS FOR CLAUDE
// ============================================================================

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_remotion_component',
        description: 'Create a new Remotion video component. Claude should generate the component code based on user requirements.',
        inputSchema: {
          type: 'object',
          properties: {
            componentName: {
              type: 'string',
              description: 'Name for the React component (PascalCase, e.g., "GitHubShowcase")',
            },
            code: {
              type: 'string', 
              description: 'Complete TypeScript React component code that Claude generated for Remotion',
            },
            duration: {
              type: 'number',
              description: 'Duration in seconds (will be converted to frames at 30fps)',
              default: 3,
            },
          },
          required: ['componentName', 'code'],
        },
      },
      {
        name: 'edit_remotion_component',
        description: 'Edit an existing Remotion component. Claude should read the current code and generate the updated version.',
        inputSchema: {
          type: 'object',
          properties: {
            componentName: {
              type: 'string',
              description: 'Name of the component to edit',
            },
            newCode: {
              type: 'string',
              description: 'Updated TypeScript React component code that Claude generated',
            },
          },
          required: ['componentName', 'newCode'],
        },
      },
      {
        name: 'read_component',
        description: 'Read the current code of an existing Remotion component',
        inputSchema: {
          type: 'object',
          properties: {
            componentName: {
              type: 'string',
              description: 'Name of the component to read',
            },
          },
          required: ['componentName'],
        },
      },
      {
        name: 'launch_remotion_studio',
        description: 'Launch Remotion Studio for live preview and editing',
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
        name: 'render_video',
        description: 'Render a component to MP4 video file',
        inputSchema: {
          type: 'object',
          properties: {
            componentId: {
              type: 'string',
              description: 'Component ID to render',
            },
            outputPath: {
              type: 'string',
              description: 'Output file path (optional, defaults to out/{componentId}.mp4)',
            },
          },
          required: ['componentId'],
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
        name: 'get_remotion_patterns',
        description: 'Get proven Remotion code patterns and best practices for Claude to reference',
        inputSchema: {
          type: 'object',
          properties: {
            patternType: {
              type: 'string',
              description: 'Type of pattern to get',
              enum: ['all', 'basic', 'github', 'product', 'animation', 'validation'],
              default: 'all',
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_remotion_component': {
        const { componentName, code, duration = 3 } = args as {
          componentName: string;
          code: string;
          duration?: number;
        };

        const durationInFrames = Math.round(duration * 30);
        
        // Validate the code Claude generated
        const validation = validateRemotionCode(code);

        // Write component file
        const projectRoot = getProjectRoot();
        const componentPath = path.join(projectRoot, 'src', 'components', `${componentName}.tsx`);
        
        await fs.ensureDir(path.dirname(componentPath));
        await fs.writeFile(componentPath, code);
        
        // Update Root.tsx to include the new composition
        await updateRootComposition(componentName, durationInFrames);

        return {
          content: [
            {
              type: 'text',
              text: `✅ **Component Created Successfully!**

**Name**: ${componentName}
**Duration**: ${duration} seconds (${durationInFrames} frames)
**File**: ${componentPath}

**Validation Results**:
${validation.isValid ? '✅ All checks passed!' : '⚠️ Issues found:'}
${validation.errors.length > 0 ? '\n**Errors**:\n' + validation.errors.map(e => `- ${e}`).join('\n') : ''}
${validation.suggestions.length > 0 ? '\n**Suggestions**:\n' + validation.suggestions.map(s => `- ${s}`).join('\n') : ''}

🎬 **Next Steps**:
- Use \`launch_remotion_studio\` to preview your animation
- Use \`render_video\` to export as MP4
- Use \`edit_remotion_component\` to make changes`,
            },
          ],
        };
      }

      case 'edit_remotion_component': {
        const { componentName, newCode } = args as {
          componentName: string;
          newCode: string;
        };

        const projectRoot = getProjectRoot();
        const componentPath = path.join(projectRoot, 'src', 'components', `${componentName}.tsx`);
        
        if (!await fs.pathExists(componentPath)) {
          throw new Error(`Component ${componentName} not found. Use 'create_remotion_component' first.`);
        }

        // Validate the new code
        const validation = validateRemotionCode(newCode);
        
        // Write updated component
        await fs.writeFile(componentPath, newCode);

        return {
          content: [
            {
              type: 'text',
              text: `✅ **Component Updated Successfully!**

**Name**: ${componentName}
**File**: ${componentPath}

**Validation Results**:
${validation.isValid ? '✅ All checks passed!' : '⚠️ Issues found:'}
${validation.errors.length > 0 ? '\n**Errors**:\n' + validation.errors.map(e => `- ${e}`).join('\n') : ''}
${validation.suggestions.length > 0 ? '\n**Suggestions**:\n' + validation.suggestions.map(s => `- ${s}`).join('\n') : ''}

🔄 **The preview will auto-refresh if Remotion Studio is running**`,
            },
          ],
        };
      }

      case 'read_component': {
        const { componentName } = args as { componentName: string };

        const projectRoot = getProjectRoot();
        const componentPath = path.join(projectRoot, 'src', 'components', `${componentName}.tsx`);
        
        if (!await fs.pathExists(componentPath)) {
          throw new Error(`Component ${componentName} not found.`);
        }

        const code = await fs.readFile(componentPath, 'utf-8');

        return {
          content: [
            {
              type: 'text',
              text: `📖 **Current Code for ${componentName}**:

\`\`\`typescript
${code}
\`\`\`

**File**: ${componentPath}`,
            },
          ],
        };
      }

      case 'launch_remotion_studio': {
        const { port = 3000 } = args as { port?: number };
        
        const projectRoot = getProjectRoot();
        
        // Launch Remotion Studio
        const studio = spawn('npm', ['run', 'dev'], {
          cwd: projectRoot,
          detached: true,
          stdio: 'ignore'
        });
        
        studio.unref();

        return {
          content: [
            {
              type: 'text',
              text: `🎬 **Remotion Studio Launched!**

**URL**: http://localhost:${port}
**Project**: ${projectRoot}

**Studio Features**:
- ▶️ Real-time preview of all compositions
- ⏱️ Timeline scrubbing and playback controls
- 🎨 Visual parameter adjustment
- 📊 Performance metrics and debugging

**Tip**: Studio auto-refreshes when you edit components!

If the browser doesn't open automatically, visit: http://localhost:${port}`,
            },
          ],
        };
      }

      case 'render_video': {
        const { componentId, outputPath } = args as {
          componentId: string;
          outputPath?: string;
        };

        const projectRoot = getProjectRoot();
        const defaultOutput = path.join(projectRoot, 'out', `${componentId}.mp4`);
        const finalOutput = outputPath || defaultOutput;
        
        // Ensure output directory exists
        await fs.ensureDir(path.dirname(finalOutput));
        
        return new Promise((resolve) => {
          // Render using Remotion CLI
          const renderProcess = spawn('npx', [
            'remotion', 'render', componentId, finalOutput
          ], {
            cwd: projectRoot,
            stdio: 'pipe'
          });

          let output = '';
          
          renderProcess.stdout?.on('data', (data) => {
            output += data.toString();
          });
          
          renderProcess.stderr?.on('data', (data) => {
            output += data.toString();
          });
          
          renderProcess.on('close', (code) => {
            resolve({
              content: [
                {
                  type: 'text',
                  text: `🎥 **Video Rendering ${code === 0 ? 'Complete' : 'Failed'}!**

**Component**: ${componentId}
**Output**: ${finalOutput}
**Status**: ${code === 0 ? '✅ Success' : '❌ Error (Code: ' + code + ')'}

**Render Log**:
\`\`\`
${output}
\`\`\`

${code === 0 ? '🎉 **Your video is ready to share!**' : '❌ **Check the errors above and fix any issues**'}`,
                },
              ],
            });
          });
        });
      }

      case 'list_components': {
        const projectRoot = getProjectRoot();
        const componentsDir = path.join(projectRoot, 'src', 'components');
        
        let components: Array<{name: string, path: string, size: number}> = [];
        
        if (await fs.pathExists(componentsDir)) {
          const files = await fs.readdir(componentsDir);
          
          for (const file of files.filter(f => f.endsWith('.tsx'))) {
            const filePath = path.join(componentsDir, file);
            const stats = await fs.stat(filePath);
            
            components.push({
              name: file.replace('.tsx', ''),
              path: filePath,
              size: stats.size
            });
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: `📁 **Available Components** (${components.length} total)

${components.length > 0 ? 
  components.map(comp => 
    `**${comp.name}**
    - Path: ${comp.path}
    - Size: ${(comp.size / 1024).toFixed(1)}KB`
  ).join('\n\n') :
  '*(No components found - create one with \`create_remotion_component\`)*'
}

**Available Actions**:
- \`read_component\` - View component code
- \`edit_remotion_component\` - Modify any component
- \`launch_remotion_studio\` - Preview all components
- \`render_video\` - Export component to MP4`,
            },
          ],
        };
      }

      case 'get_remotion_patterns': {
        const { patternType = 'all' } = args as { patternType?: string };

        const patterns = {
          basic: `// Basic Remotion Component Pattern
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const MyComponent: React.FC = () => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '6rem', // Video-optimized large text
        color: '#fff',
      }}
    >
      <div style={{ opacity }}>Hello World</div>
    </AbsoluteFill>
  );
};`,

          github: `// GitHub Showcase Pattern
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

type Props = {
  repoName: string;
  description: string;
  language: string;
  stars: number;
};

export const GitHubShowcase: React.FC<Props> = ({ repoName, description, language, stars }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame,
    config: { damping: 200 },
  });

  const slideIn = interpolate(frame, [10, 40], [-100, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0d1117', // GitHub dark theme
        color: '#f0f6fc',
        fontFamily: 'system-ui, sans-serif',
        padding: 80,
      }}
    >
      <div
        style={{
          transform: \`scale(\${scale}) translateX(\${slideIn}px)\`,
          textAlign: 'center',
        }}
      >
        <h1 style={{ 
          fontSize: '8rem', 
          fontWeight: 'bold',
          marginBottom: 40,
        }}>
          {repoName}
        </h1>
        <p style={{ 
          fontSize: '3rem', 
          color: '#58a6ff',
          marginBottom: 60,
        }}>
          {description}
        </p>
        <div style={{ 
          fontSize: '2.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: 60,
        }}>
          <span>🔖 {language}</span>
          <span>⭐ {stars}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};`,

          validation: `// Remotion Best Practices and Validation Rules

CRITICAL RULES:
1. ✅ Always use AbsoluteFill as root container
2. ✅ Always use inline styles (never className)
3. ✅ Use video-optimized font sizes (minimum 2rem, prefer 4rem+)
4. ✅ Use useCurrentFrame() for frame-based animations
5. ✅ Use interpolate() with proper extrapolation
6. ✅ Design for 1920x1080 video dimensions

BANNED PATTERNS:
❌ className or class attributes
❌ External CSS or styled-components
❌ Font sizes smaller than 2rem
❌ Missing useCurrentFrame for animations
❌ Layouts not optimized for video

ANIMATION PATTERNS:
- interpolate() for linear animations
- spring() for bouncy physics
- Sequence for multi-part animations
- staticFile() for assets`
        };

        const responseContent = patternType === 'all' ? 
          Object.entries(patterns).map(([key, pattern]) => `## ${key.toUpperCase()} PATTERN\n\n\`\`\`typescript\n${pattern}\n\`\`\``).join('\n\n') :
          `## ${patternType.toUpperCase()} PATTERN\n\n\`\`\`typescript\n${patterns[patternType as keyof typeof patterns] || 'Pattern not found'}\n\`\`\``;

        return {
          content: [
            {
              type: 'text',
              text: `📚 **Remotion Patterns and Best Practices**

${responseContent}

**Usage**: Use these patterns as reference when generating Remotion components. They follow video optimization best practices and prevent common mistakes.`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Error**: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// ============================================================================
// SERVER STARTUP
// ============================================================================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🎬 rough-cuts-mcp v2.0.0 running');
  console.error('🤖 Ready to help Claude create amazing video animations!');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});

