# 🎬 Zero-Setup Remotion MCP for Claude

**The only video generation tool that requires ZERO manual setup!**

## What This Does

- ✅ **Auto-creates Remotion projects** when none exist
- ✅ **Works from any directory** - no manual navigation needed  
- ✅ **Generates professional video components** with Claude AI
- ✅ **Launches preview studio** automatically
- ✅ **Renders to MP4** with one command

## Installation (30 seconds)

### Prerequisites
- Node.js installed ([download here](https://nodejs.org))
- Claude Desktop installed

### One-Command Setup

```bash
# Clone and auto-configure everything
git clone https://github.com/your-username/rough-cuts-mcp.git
cd rough-cuts-mcp
npm run install-for-claude
```

**That's it!** Restart Claude Desktop and start creating videos.

## Usage Examples

Just ask Claude naturally:

- 🎥 **"Create a product showcase video"**
- 🚀 **"Make an animated logo intro"** 
- 📊 **"Generate a data visualization video"**
- 🎨 **"Create a dynamic text animation"**
- 📱 **"Make a social media video"**

Claude will:
1. **Auto-create a Remotion project** (if you don't have one)
2. **Generate the video component** with professional animations
3. **Launch Remotion Studio** for live preview
4. **Render to MP4** when you're ready

## No Manual Steps Required

❌ **You DON'T need to:**
- Run `npx create-remotion-video`
- Navigate to specific directories
- Configure project settings
- Set up file structures
- Install Remotion manually

✅ **The MCP automatically:**
- Finds existing Remotion projects
- Creates new projects at `~/Claude-Videos/remotion-project`
- Sets up all required files and dependencies
- Generates a welcome video to get you started

## Example Workflow

1. **Ask Claude**: *"Create a dynamic showcase video for my AI startup"*

2. **Claude responds**: 
   ```
   ✅ Component Created Successfully!
   🎬 Next Steps:
   - Use launch_remotion_studio to preview
   - Use render_video to export as MP4
   ```

3. **Preview**: *"Launch Remotion Studio"*
   - Opens http://localhost:3000 with live preview

4. **Export**: *"Render the video to MP4"*
   - Creates `~/Claude-Videos/remotion-project/out/YourVideo.mp4`

## Supported Video Types

- 🎨 **Animated presentations** with dynamic text
- 📊 **Data visualizations** with charts and graphs  
- 🚀 **Product showcases** with smooth transitions
- 💼 **Corporate videos** with professional styling
- 🎮 **Gaming content** with particle effects
- 📱 **Social media** content (Instagram, TikTok, YouTube)

## Advanced Features

### Custom Animations
- Spring physics for natural motion
- Frame-based interpolation for precise timing
- Gradient backgrounds with color transitions
- 3D transforms and perspective effects

### Professional Output
- 1920x1080 HD resolution
- 30fps smooth playback
- Video-optimized typography (no tiny text)
- Cross-platform MP4 export

### Smart Validation
- Prevents common Remotion mistakes
- Ensures video-optimized font sizes
- Validates component structure
- Suggests best practices

## File Structure (Auto-Created)

```
~/Claude-Videos/remotion-project/
├── package.json              # Remotion dependencies
├── tsconfig.json             # TypeScript config  
├── remotion.config.ts        # Video settings
├── src/
│   ├── index.ts             # Entry point
│   ├── Root.tsx             # Composition registry
│   └── components/          # Your video components
│       └── WelcomeVideo.tsx # Auto-generated starter
└── out/                     # Rendered videos
```

## Troubleshooting

### "Node.js not found"
- Install Node.js from [nodejs.org](https://nodejs.org)
- Restart your terminal/Claude Desktop

### "Permission denied"
- Run with administrator/sudo privileges
- Or manually edit `~/.config/claude/claude_desktop_config.json`

### "Project not found"
- The MCP will auto-create one at `~/Claude-Videos/remotion-project`
- Or create your own with `npx create-remotion-video@latest`

## What Makes This Special

🤖 **AI-First Design**: Built specifically for Claude AI video generation
🚀 **Zero Manual Setup**: Works out of the box, no configuration needed
🎬 **Professional Quality**: Follows Remotion best practices automatically  
🔄 **Live Preview**: See changes instantly in Remotion Studio
📱 **Universal Export**: MP4 videos work everywhere

---

**Ready to create amazing videos with AI?** Just install and ask Claude!
