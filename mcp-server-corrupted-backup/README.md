# Remotion AI Copilot MCP Server

**Transform Claude Desktop into a powerful video animation AI copilot**

## 🎬 What This Does

This MCP server gives Claude Desktop the ability to create **any type of video animation** from natural language descriptions. Claude becomes your AI video creator, generating professional Remotion components that render to high-quality MP4 videos.

## 🚀 Quick Setup

### 1. Install Dependencies and Build

```bash
cd "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\rough-cuts-mcp\mcp-server"
npm install
npm run build
```

### 2. Add to Claude Desktop Configuration

Add this to your Claude Desktop configuration file:

**Windows**: `%APPDATA%\Claude\claude.json`
**Mac**: `~/Library/Application Support/Claude/claude.json`

```json
{
  "mcpServers": {
    "remotion-ai-copilot": {
      "type": "stdio",
      "command": "node",
      "args": [
        "D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Video + Motion\\rough-cuts-mcp\\mcp-server\\dist\\index.js"
      ],
      "env": {}
    }
  }
}
```

### 3. Restart Claude Desktop

Restart Claude Desktop to load the new MCP server.

## 🎯 Usage Examples

### Create Any Animation
```
Create a GitHub repository showcase video for a React library called "AnimateX" that helps developers build smooth animations. Make it modern and professional with a blue color scheme.
```

### Edit Existing Animations  
```
Make the title text bigger and add a bounce effect when it appears
```

### Export Videos
```
Render the GitHubShowcase component to MP4
```

## 🛠️ Available Tools

Claude Desktop will have access to these tools:

- **`create_remotion_component`** - Claude generates and saves Remotion components
- **`edit_remotion_component`** - Claude modifies existing components  
- **`read_component`** - Claude reads current component code
- **`launch_remotion_studio`** - Launch live preview
- **`render_video`** - Export to MP4
- **`list_components`** - Show all components
- **`get_remotion_patterns`** - Reference patterns for best practices

## 📁 Project Structure

Your Remotion project structure will be:

```
rough-cuts-mcp/
├── mcp-server/              # MCP Server files
│   ├── src/index.ts         # Main MCP server
│   ├── package.json         # MCP dependencies
│   └── dist/                # Built files
├── src/
│   ├── components/          # Generated video components
│   │   ├── GitHubShowcase.tsx
│   │   └── ProductDemo.tsx
│   ├── Root.tsx            # Automatically updated compositions
│   └── index.ts
├── out/                    # Rendered videos
└── package.json           # Main Remotion project
```

## 🎨 What Claude Can Create

- **GitHub Repository Showcases** - Professional repo presentations
- **Product Demonstrations** - Feature highlights with animations  
- **Data Visualizations** - Animated charts and graphs
- **Brand Videos** - Logo animations and reveals
- **Tutorial Content** - Step-by-step animations
- **Social Media Content** - Engaging video posts
- **Marketing Videos** - Professional promotional content
- **And Much More!** - Any animation you can describe

## ✅ Quality Guarantees

Every generated component follows Remotion best practices:

- ✅ **Video-optimized typography** (large, readable fonts)
- ✅ **Proper dimensions** (1920x1080 full HD)
- ✅ **Smooth animations** (60fps with proper interpolation)
- ✅ **Professional styling** (inline styles, no CSS issues)
- ✅ **Error-free code** (validated against common mistakes)

## 🔧 Development Workflow

1. **Describe** your video idea to Claude
2. **Claude generates** optimized Remotion code
3. **Preview** in Remotion Studio (auto-launches)
4. **Iterate** through conversation ("make it bigger", "change color")
5. **Render** to professional MP4 video

## 🎬 Example Conversation

```
You: "Create a video animation showcasing a GitHub repository"

Claude: I'll create a GitHub repository showcase animation for you! Let me generate a professional Remotion component.

[Claude calls create_remotion_component with generated code]

✅ Component Created Successfully!
Name: GitHubShowcase
Duration: 5 seconds (150 frames)

You: "Make the text bigger and add a spring animation"

Claude: I'll edit the component to make the text larger and add a spring animation effect.

[Claude calls edit_remotion_component with updated code]

✅ Component Updated Successfully!

You: "Launch the preview so I can see it"

Claude: [calls launch_remotion_studio]

🎬 Remotion Studio Launched!
URL: http://localhost:3000

You: "Perfect! Now render it to MP4"

Claude: [calls render_video]

🎥 Video Rendering Complete!
Your video is ready at: out/GitHubShowcase.mp4
```

## 🚨 Requirements

- **Node.js** 18+ with npm
- **Claude Desktop** with MCP support
- **TypeScript** support (included in dependencies)

## 🎯 Why This Works

Unlike conversion-based tools that break, this MCP uses Claude's intelligence to generate **native Remotion code** directly. No conversion pipelines, no CSS issues, no broken templates - just clean, working video components every time.

---

**Ready to turn your ideas into professional video animations with AI? 🚀**

Just tell Claude what you want to animate, and watch the magic happen!
