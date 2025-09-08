# Universal Rough Cuts MCP Setup

This package provides a universal Remotion MCP that works with any Remotion project and Claude Desktop.

## For End Users (One-Time Setup)

### Prerequisites
- Node.js installed
- Claude Desktop

### Installation

1. **Download/Clone this project**:
   ```bash
   git clone <this-repo>
   cd rough-cuts-mcp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   cd mcp-server
   npm install
   npm run build
   ```

3. **Configure Claude Desktop**:
   
   Add this to your Claude Desktop configuration file:
   
   **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   
   ```json
   {
     "mcpServers": {
       "rough-cuts-mcp": {
         "command": "node",
         "args": ["path/to/rough-cuts-mcp/mcp-server/dist/index.js"]
       }
     }
   }
   ```
   
   Replace `path/to/rough-cuts-mcp` with the actual path where you installed this.

4. **Restart Claude Desktop**

## Creating Your First Video Project

The MCP will automatically find Remotion projects, but if you don't have one:

```bash
npx create-remotion-video@latest my-video-project
cd my-video-project
```

## Usage with Claude

Once configured, you can ask Claude to:

- **Generate videos**: "Create a dynamic showcase video for my startup"
- **Launch preview**: "Launch Remotion Studio to preview the video"
- **Render videos**: "Render the DynamicShowcase component to MP4"
- **Edit components**: "Make the title animation faster"

## How It Works

The universal MCP:

1. **Auto-detects Remotion projects** by searching:
   - Current working directory and parent directories
   - Common project locations (`~/projects`, `~/Documents`, etc.)

2. **Initializes missing files** if needed:
   - Creates `src/Root.tsx` with proper composition registration
   - Sets up component directory structure

3. **Validates generated code** for Remotion best practices:
   - Ensures video-optimized font sizes
   - Prevents className usage (Remotion requires inline styles)
   - Suggests proper animation patterns

4. **Handles all video operations**:
   - Component creation and editing
   - Studio preview launching
   - Video rendering to MP4

## Troubleshooting

### "Could not find Remotion project"
- Make sure you're in a directory with a Remotion project
- Or create one with `npx create-remotion-video@latest`

### Node.js not found
- Ensure Node.js is installed and in your PATH
- Try running `node --version` to verify

### MCP not responding
- Check Claude Desktop logs
- Verify the path in your configuration is correct
- Make sure you built the MCP server (`npm run build`)

## For Developers

To modify the MCP behavior, edit `mcp-server/src/index.ts` and rebuild:

```bash
cd mcp-server
npm run build
```

The universal search logic is in the `findRemotionProject()` function.
