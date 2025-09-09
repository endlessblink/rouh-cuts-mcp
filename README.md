# 🎬 Rough Cuts MCP - Zero-Setup Video Generation

**The ONLY video generation tool that requires ZERO manual setup!**

## ✨ What This Does

- ✅ **Auto-creates Remotion projects** when none exist at `~/Claude-Videos/remotion-project`
- ✅ **Auto-installs all dependencies** (Remotion, React, TypeScript)
- ✅ **Works from anywhere** - no manual navigation needed  
- ✅ **Generates professional video components** with Claude AI
- ✅ **Launches preview studio** automatically
- ✅ **Renders to MP4** with one command
- ✅ **Copies animation guidelines** for professional quality

## 🚀 Installation (30 seconds)

### Prerequisites
- Node.js 18+ ([download here](https://nodejs.org))
- Claude Desktop installed

### One-Command Global Install

```bash
# Install globally - works from anywhere
npm install -g @endlessblink/rough-cuts-mcp
```

**That's it!** The package will:
1. ✅ **Auto-configure Claude Desktop** (any OS)
2. ✅ **Build the MCP server** 
3. ✅ **Set up project structure**
4. ✅ **Install all dependencies**

Just restart Claude Desktop and start creating videos!

## 🎯 Auto-Installation Magic

### **First Use Experience:**
1. **User**: *"Create a dynamic product showcase video"*
2. **MCP Detects**: No Remotion project exists
3. **Auto-Creates**: `~/Claude-Videos/remotion-project/`
4. **Auto-Installs**: All Remotion dependencies
5. **Auto-Copies**: Professional animation guidelines  
6. **Creates**: Welcome video component
7. **Ready**: Claude generates your requested video

### **Subsequent Uses:**
- ⚡ **Instant**: Uses existing project
- 🔄 **Smart**: Auto-detects any Remotion project in current directory
- 📁 **Flexible**: Works with existing projects or creates new ones

## 💡 Usage Examples

Just ask Claude naturally - **no setup commands needed**:

- 🎥 **"Create a GitHub profile showcase video"**
- 🚀 **"Make an animated logo intro for my startup"** 
- 📊 **"Generate a data visualization video with charts"**
- 🎨 **"Create a dynamic text animation for social media"**
- 📱 **"Make a product demo video with smooth transitions"**

## 🎬 Complete Workflow

### **Step 1: Ask Claude**
```
User: "Create a sleek company intro video with our logo"
```

### **Step 2: Auto-Installation (First Time Only)**
```
🎬 No Remotion project found. Creating one automatically...
📁 Creating Remotion project at: ~/Claude-Videos/remotion-project
📦 Installing Remotion dependencies...
📋 Copied animation guidelines to project
✅ Remotion project created successfully!
✅ Component "CompanyIntro" created successfully!
```

### **Step 3: Preview & Render**
```
User: "Launch Remotion Studio to preview it"
Claude: ✅ Remotion Studio launched on port 3000

User: "Render the video to MP4"
Claude: ✅ Video rendered successfully to: ~/Claude-Videos/remotion-project/out/CompanyIntro.mp4
```

## 🛡️ Professional Quality Built-In

### **Bulletproof Animation System:**
- ✅ **No text overlap** - Scene-based rendering prevents layout issues
- ✅ **Professional transitions** - Overlapping scenes with smooth timing
- ✅ **Proper sizing** - All text 16px+, touch targets 44px+
- ✅ **Safe interpolation** - Bounds checking prevents animation errors
- ✅ **Modern motion design** - Directional slides, scales, strategic fades

### **Auto-Included Guidelines:**
- 📋 **Animation patterns** for any content type
- 🎯 **Layout rules** that prevent common mistakes  
- ⚡ **Quick templates** for immediate use
- 🏆 **Professional standards** built-in

## 📂 Auto-Generated Project Structure

```
~/Claude-Videos/remotion-project/
├── package.json              # Remotion dependencies (auto-installed)
├── tsconfig.json             # TypeScript config  
├── remotion.config.ts        # Video settings
├── claude-dev-guidelines/    # Professional animation rules
├── src/
│   ├── index.ts             # Entry point
│   ├── Root.tsx             # Composition registry
│   └── components/          # Your video components
│       └── WelcomeVideo.tsx # Auto-generated starter
└── out/                     # Rendered videos (auto-created)
```

## 🔧 Advanced Features

### **Smart Project Detection:**
1. **Current directory** - Looks for existing Remotion projects
2. **Parent directories** - Searches upward for projects
3. **Default location** - Uses `~/Claude-Videos/remotion-project`
4. **Auto-creation** - Creates new project if none found

### **Dependency Management:**
- **Auto-installs** Remotion, React, TypeScript on first use
- **Checks existence** of node_modules before operations
- **Graceful fallback** if npm install fails
- **Version pinning** for stability

### **Professional Output:**
- **1920x1080 HD** resolution
- **30fps** smooth playback  
- **Video-optimized** typography (no tiny text)
- **Cross-platform** MP4 export
- **Efficient rendering** with Remotion CLI

## 🎯 Supported Video Types

- 🎨 **GitHub showcases** with real repository data
- 📊 **Data visualizations** with animated charts
- 🚀 **Product demos** with smooth transitions  
- 💼 **Corporate presentations** with professional styling
- 🎮 **Gaming content** with particle effects
- 📱 **Social media** content (Instagram, TikTok, YouTube)
- 🏢 **Brand videos** with company colors and fonts
- 📈 **Analytics dashboards** with live data
- 🎪 **Event promotions** with dynamic text
- 🎓 **Educational content** with clear explanations

## 🔄 Cross-Platform Auto-Configuration

### **Windows:**
- **Config**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Projects**: `%USERPROFILE%\Claude-Videos\remotion-project`

### **macOS:**
- **Config**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
- **Projects**: `~/Claude-Videos/remotion-project`

### **Linux:**
- **Config**: `~/.config/claude/claude_desktop_config.json`
- **Projects**: `~/Claude-Videos/remotion-project`

## 🚨 Troubleshooting

### **"Node.js not found"**
- Install Node.js 18+ from [nodejs.org](https://nodejs.org)
- Restart your terminal/Claude Desktop

### **"Permission denied on config"**
- Run with administrator/sudo privileges
- Or manually edit the Claude config file (shown in error)

### **"Dependencies failed to install"**
- Check internet connection
- Run `npm install` manually in the project directory
- Ensure you have npm 8+ (`npm --version`)

### **"No Remotion project found"**
- The MCP will auto-create one at `~/Claude-Videos/remotion-project`
- Or create your own with `npx create-remotion-video@latest`
- Ensure the project has Remotion in package.json

## 🎯 What Makes This Special

### **🤖 AI-First Design**
Built specifically for Claude AI video generation with smart defaults

### **🚀 Zero-Touch Setup**  
From npm install to video creation in under 2 minutes

### **🎬 Professional Quality**
Follows Remotion best practices automatically with bulletproof patterns

### **🔄 Universal Compatibility**
Works with existing Remotion projects or creates new ones seamlessly

### **📱 Complete Ecosystem**
Live preview + rendering + guidelines + templates in one package

---

## 🏆 Success Story

**Before**: Complex Remotion setup, manual configuration, layout issues  
**After**: `npm install -g @endlessblink/rough-cuts-mcp` → "Create a video" → Professional MP4 ready!

**Ready to create amazing videos with AI?** Install now and ask Claude to make your first video! 🎬
