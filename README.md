# 🎬 Rough Cuts MCP - Zero-Setup Remotion Video Generation 

**Professional AI-powered video creation for Claude Desktop with automatic setup and built-in animation guidelines.**

## ⚡ Quick Start (Zero Configuration Required)

### **Option 1: NPX (Recommended) - Instant Setup**
```bash
npx -y @endlessblink/rough-cuts-mcp@latest
```
**That's it!** Automatically configures Claude Desktop and you're ready to create videos.

### **Option 2: Global Install**
```bash
npm install -g @endlessblink/rough-cuts-mcp
```

### **Option 3: Manual Setup (Fallback)**
If automatic setup fails, add this to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "rough-cuts-mcp": {
      "command": "npx",
      "args": ["-y", "@endlessblink/rough-cuts-mcp@latest"]
    }
  }
}
```

## 🚀 What This Package Does

### **Completely Automatic**
- ✅ **Auto-detects** Node.js, npm, and system configuration
- ✅ **Auto-configures** Claude Desktop (no manual JSON editing)  
- ✅ **Auto-creates** Remotion projects when needed
- ✅ **Auto-installs** all dependencies and requirements
- ✅ **Auto-launches** Remotion Studio for preview and rendering

### **Professional Animation Quality**
- 🎯 **Built-in Guidelines** - Professional animation rules loaded automatically
- 🔧 **Safe Patterns** - Bulletproof interpolation and timing functions  
- ⚡ **Quick Templates** - Professional templates with overlapping scenes
- 🎨 **Syntax Repair** - Automatically fixes animation code issues
- 📚 **Best Practices** - Follows industry standards for motion graphics

### **Cross-Platform Support**  
- 🖥️ **Windows** - Full support with enhanced path detection
- 🍎 **macOS** - Native support with proper app bundle detection
- 🐧 **Linux** - Complete compatibility with standard distributions

## 🎯 Usage with Claude

After installation, simply ask Claude:

### **Example Prompts:**
```
"Create a dynamic product showcase video"
"Make an animated logo intro with smooth transitions"  
"Generate a professional demo video for my SaaS app"
"Build a GitHub repository showcase animation"
"Create a video explaining our company's services"
```

### **Automatic Features:**
- 🏗️ **Project Setup** - Creates workspace at `~/Claude-Videos/` automatically
- 📱 **Studio Launch** - Opens preview at `http://localhost:3000`
- 🎬 **Professional Results** - Follows animation best practices automatically
- 🔧 **Error Recovery** - Fixes syntax and timing issues automatically

## 🛠️ Available MCP Tools

### **Core Animation Tools:**
- `check_environment` - Verify system requirements
- `setup_remotion_environment` - Create new Remotion projects  
- `create_remotion_component` - Generate animation components
- `launch_remotion_studio` - Start preview server
- `list_components` - Show available animations

### **Enhanced Quality Tools:**
- `get_animation_guidelines` - **NEW!** Built-in professional animation rules
- `repair_component` - Auto-fix syntax and timing issues
- `read_guidelines_file` - Access extended documentation

## 📋 Animation Guidelines (Built-In)

The MCP includes professional animation guidelines that ensure:

### **✅ Professional Standards:**
- **Overlapping Scenes** - No empty screen time (15-frame overlaps)
- **Movement + Fades** - Never fade-only transitions
- **Quick Timing** - 20-frame entries, 15-frame exits
- **Proper Sizing** - 16px+ text, 44px+ touch targets
- **Safe Interpolation** - Bounds checking for all animations
- **Cubic Easing** - Professional easing curves

### **❌ Banned Patterns Automatically Avoided:**
- Empty screen time during transitions
- Fade-only transitions without movement  
- Slow timing (>20 frame transitions)
- Small text (<16px) and touch targets (<44px)
- Hard cuts without smooth transitions

## 🔧 Requirements

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher  
- **Claude Desktop** (any recent version)
- **Platform:** Windows, macOS, or Linux

## 🚨 Troubleshooting

### **Setup Issues:**
```bash
# Check Node.js version
node --version  # Should be 18.0.0+

# Restart Claude Desktop after installation
# Close completely and reopen

# Test MCP connection
# Ask Claude: "Check my video creation environment"
```

### **Permission Issues:**
```bash
# Windows: Run as Administrator if needed
# macOS/Linux: Ensure npm global permissions are correct
npm config get prefix  # Check npm global directory
```

### **Manual Configuration:**
If automatic setup fails, the installer creates `rough-cuts-mcp-config.json` with manual instructions.

## 📊 System Compatibility

### **Tested Platforms:**
- ✅ Windows 10/11 (x64, ARM64)
- ✅ macOS 12+ (Intel, Apple Silicon)  
- ✅ Ubuntu 20.04+ (x64, ARM64)
- ✅ Debian 11+ (x64, ARM64)
- ✅ CentOS/RHEL 8+ (x64)

### **Tested Node.js Versions:**
- ✅ Node.js 18.x (LTS)
- ✅ Node.js 20.x (LTS)  
- ✅ Node.js 22.x (Current)

## 🎯 Professional Results

Following the built-in guidelines ensures:
- 🏆 **No text overlap** during transitions
- ⚡ **No empty screen time** - always engaging
- 📱 **Proper sizing** - clearly readable on all devices
- 🎭 **Smooth motion** - professional cinematic feel
- ⚡ **Fast performance** - transform-only animations
- 🎨 **Consistent quality** - industry-standard patterns

## 🆘 Support & Documentation

### **Getting Help:**
- 📖 **Built-in Guidelines** - Use `get_animation_guidelines()` in Claude
- 🐛 **Issues** - Report at [GitHub Issues](https://github.com/endlessblink/rough-cuts-mcp/issues)
- 💬 **Discussions** - Join [GitHub Discussions](https://github.com/endlessblink/rough-cuts-mcp/discussions)

### **Advanced Usage:**
- 📁 **Custom Projects** - Specify project paths: `setup_remotion_environment("/custom/path")`
- 🎛️ **Studio Options** - Custom ports: `launch_remotion_studio(3001)`
- 🔧 **Repair Tools** - Fix components: `repair_component("MyAnimation")`

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🙏 Credits

Built with:
- [Remotion](https://remotion.dev) - React-based video framework
- [Model Context Protocol](https://modelcontextprotocol.io) - AI integration standard  
- [Claude Desktop](https://claude.ai) - AI assistant platform

---

**🎬 Start creating professional videos with AI assistance in under 60 seconds!**

```bash
npx -y @endlessblink/rough-cuts-mcp@latest
# Then ask Claude: "Create my first professional video"
```