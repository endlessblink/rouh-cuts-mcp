# 🚨 Rough Cuts MCP - CRITICAL ISSUES IDENTIFIED 
**Auto-installation system has fundamental problems that MUST be fixed before publication**

## ❌ **MAJOR ISSUES DISCOVERED**

### **🔥 CRITICAL PROBLEM #1: No True Auto-Installation**
**Issue:** The MCP assumes Remotion is already installed globally or that users have npm/Node.js knowledge.

**What's Missing:**
- ❌ **No global Remotion CLI installation** - Users need `npx @remotion/cli` or global install
- ❌ **No automatic Node.js detection** - Fails silently if Node.js not installed  
- ❌ **No npm installation verification** - Assumes npm works without checking
- ❌ **No permission handling** - Can fail on Windows/Mac without admin rights

**Real User Experience:**
```bash
npm install -g @rough-cuts/mcp
# User: "Create a video"
# Error: 'remotion' is not recognized as internal or external command
# Error: spawn npx ENOENT
```

---

### **🔥 CRITICAL PROBLEM #2: Package Structure Issues**  
**Issue:** The npm package structure is incorrect for global installation.

**Current Problems:**
```json
{
  "name": "@endlessblink/rough-cuts-mcp",     // ← Wrong scope
  "main": "setup-universal.js",              // ← Won't work globally  
  "files": [
    "mcp-server/",                           // ← Source files, not built
    "claude-dev-guidelines/",                // ← Won't copy correctly
    "setup-universal.js"                     // ← Relative paths will break
  ]
}
```

**What Breaks:**
- ❌ **Global install fails** - Package structure assumes local installation
- ❌ **MCP server paths broken** - Points to source instead of dist  
- ❌ **Guidelines not included** - Wrong file paths in npm package
- ❌ **Setup script fails** - Assumes package is in current directory

---

### **🔥 CRITICAL PROBLEM #3: Remotion Studio Installation Gap**
**Issue:** Package installs dependencies locally but doesn't make Remotion Studio globally available.

**Missing Components:**
- ❌ **Global Remotion CLI** - Users can't run `remotion studio` from anywhere
- ❌ **Global project discovery** - Studio doesn't know about auto-created projects
- ❌ **Path resolution** - Created projects aren't in PATH for studio access
- ❌ **Browser launching** - Studio server may not open browser automatically

**Result:** Project created but studio won't launch or work properly.

---

### **🔥 CRITICAL PROBLEM #4: MCP Registration Failure**
**Issue:** The MCP registration assumes the package stays in one location.

**Registration Problems:**
```javascript
// Current setup-universal.js
const mcpServerPath = path.join(__dirname, 'mcp-server', 'dist', 'index.js');
// ↑ This breaks when package is installed globally
```

**What Fails:**
- ❌ **Path calculation wrong** - `__dirname` points to global npm cache
- ❌ **MCP server not found** - Claude can't locate the server file
- ❌ **Registration broken** - Claude Desktop config points to non-existent files
- ❌ **Silent failure** - MCP appears installed but doesn't work

---

### **🔥 CRITICAL PROBLEM #5: Auto-Installation Logic Flawed**
**Issue:** The auto-installation detection logic has multiple failure points.

**Detection Problems:**
```typescript
// Current logic assumes:
if (isRemotionProject(projectRoot)) {
  return projectRoot; // ← But what if project is broken?
}
// ← No verification of working installation
```

**What's Wrong:**
- ❌ **No dependency verification** - Finds package.json but doesn't check if packages work
- ❌ **No studio verification** - Doesn't test if `remotion studio` actually works  
- ❌ **No npm verification** - Doesn't check if npm install succeeded
- ❌ **False positives** - Thinks broken projects are valid

---

### **🔥 CRITICAL PROBLEM #6: Cross-Platform Issues**
**Issue:** Platform-specific problems not handled.

**Windows Issues:**
- ❌ **PowerShell execution policy** - May block npm installs
- ❌ **PATH environment** - Global packages not in PATH
- ❌ **Admin permissions** - Some operations require elevation

**macOS Issues:**  
- ❌ **Gatekeeper warnings** - May block executables
- ❌ **npm prefix issues** - Global installs go to wrong location
- ❌ **Permission errors** - /usr/local access problems

**Linux Issues:**
- ❌ **sudo requirements** - Global installs may need sudo
- ❌ **Package manager conflicts** - npm vs system package managers
- ❌ **Display server issues** - Studio launch in headless environments

---

## 🛠️ **REQUIRED FIXES**

### **📦 Fix #1: Correct Package Structure**
```json
{
  "name": "@rough-cuts/studio-mcp",
  "bin": {
    "rough-cuts-setup": "./bin/setup.js",
    "rough-cuts-studio": "./bin/studio.js"
  },
  "files": [
    "bin/",
    "lib/",
    "mcp-server/dist/",
    "guidelines/",
    "templates/"
  ],
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

### **🔧 Fix #2: Proper Global Installation**
```javascript
// bin/setup.js - Global setup script
#!/usr/bin/env node

// 1. Verify Node.js version
// 2. Verify npm works  
// 3. Install Remotion CLI globally
// 4. Setup MCP server with absolute paths
// 5. Configure Claude Desktop
// 6. Create default project with verification
```

### **🎬 Fix #3: Remotion Studio Integration**
```javascript
// bin/studio.js - Studio launcher
#!/usr/bin/env node

// 1. Find or create Remotion project
// 2. Verify dependencies installed
// 3. Launch studio with correct working directory
// 4. Handle browser opening
// 5. Provide clear error messages
```

### **🔍 Fix #4: Robust Project Detection**
```typescript
async function verifyRemotionProject(projectPath: string): Promise<boolean> {
  // 1. Check package.json exists and has Remotion
  // 2. Verify node_modules has required packages
  // 3. Test that 'remotion studio' command works
  // 4. Validate project structure is complete
  return allChecksPass;
}
```

### **⚙️ Fix #5: MCP Server Registration**
```javascript
function setupMCPServer() {
  // 1. Get global package installation path
  // 2. Build absolute path to MCP server
  // 3. Verify MCP server file exists and works
  // 4. Update Claude Desktop config with correct paths
  // 5. Test MCP connection before finishing
}
```

### **🌐 Fix #6: Cross-Platform Support**
```javascript
function platformSpecificSetup() {
  const platform = process.platform;
  
  if (platform === 'win32') {
    // Handle Windows-specific setup
    // Check PowerShell execution policy
    // Handle PATH updates
    // Request admin if needed
  } else if (platform === 'darwin') {
    // Handle macOS-specific setup  
    // Check npm prefix
    // Handle Gatekeeper
    // Verify permissions
  } else {
    // Handle Linux-specific setup
    // Check sudo requirements
    // Verify display server
    // Handle package conflicts
  }
}
```

---

## 🧪 **TESTING REQUIREMENTS**

### **✅ Required Test Matrix:**
| Platform | Node Version | npm Version | User Type | Expected Result |
|----------|-------------|-------------|-----------|-----------------|
| Windows 11 | 18.x | 8.x | Regular | Full install works |
| Windows 11 | 18.x | 8.x | Admin | Full install works |
| macOS 13+ | 18.x | 8.x | Regular | Full install works |
| Ubuntu 22+ | 18.x | 8.x | Regular | Full install works |
| Ubuntu 22+ | 18.x | 8.x | sudo | Full install works |

### **✅ Test Cases Needed:**
1. **Fresh system** - No Node.js, no npm, no Remotion
2. **Partial system** - Node.js but no Remotion  
3. **Broken system** - Remotion installed but broken
4. **Permission restricted** - Limited user rights
5. **Network restricted** - Slow/limited internet

### **✅ Success Criteria:**
- ✅ **One-command install** - `npm install -g @rough-cuts/studio-mcp`
- ✅ **Automatic detection** - Works on any system configuration
- ✅ **Error recovery** - Handles and fixes broken installations
- ✅ **Clear feedback** - Users know exactly what's happening
- ✅ **Complete verification** - Tests full workflow before declaring success

---

## 🚀 **CORRECTED IMPLEMENTATION PLAN**

### **Phase 1: Fix Package Structure**
1. **Restructure for global installation**
2. **Add proper bin scripts**
3. **Include built files only**
4. **Fix all file paths**

### **Phase 2: Implement Robust Installation**
1. **Add Node.js/npm verification**
2. **Add global Remotion CLI installation**
3. **Add complete project verification**
4. **Add error recovery mechanisms**

### **Phase 3: Fix MCP Integration**
1. **Correct MCP server registration**
2. **Add absolute path resolution**
3. **Add MCP connection testing**
4. **Add startup verification**

### **Phase 4: Cross-Platform Testing**
1. **Test on all target platforms**
2. **Fix platform-specific issues**
3. **Add platform detection**
4. **Add graceful degradation**

### **Phase 5: End-to-End Verification**
1. **Test complete user workflow**
2. **Verify studio launches correctly**  
3. **Verify video rendering works**
4. **Test error scenarios**

---

## 🎯 **CURRENT STATUS: NOT READY FOR PUBLICATION**

### **❌ Blocking Issues:**
- 🔥 **Auto-installation doesn't actually auto-install Remotion Studio**
- 🔥 **Package structure incompatible with global npm installation**
- 🔥 **MCP registration fails with incorrect paths**
- 🔥 **Cross-platform issues not addressed**
- 🔥 **No verification that installations actually work**

### **⚠️ Risk Assessment:**
- **High Risk** - Will fail for most users
- **Poor Experience** - Silent failures and confusing errors
- **Support Burden** - Many users will need manual help
- **Reputation Risk** - "Doesn't work as advertised"

---

## 📋 **IMMEDIATE ACTION ITEMS**

### **🔧 For Next Session:**
1. **Restructure package** for proper global installation
2. **Implement true auto-installation** of Remotion CLI
3. **Fix MCP server registration** with correct paths
4. **Add comprehensive verification** of installations
5. **Test on fresh VM** to validate complete workflow

### **🧪 Validation Required:**
1. **Install on fresh Windows VM** - No development tools
2. **Install on fresh macOS VM** - Clean system
3. **Install on fresh Linux VM** - Minimal installation
4. **Test with restricted users** - No admin rights
5. **Test complete workflow** - Install → Create → Studio → Render

### **📝 Success Definition:**
- User runs `npm install -g @rough-cuts/studio-mcp`
- User restarts Claude Desktop
- User asks "Create a video"
- System auto-installs everything needed
- Remotion Studio launches and works
- Video renders successfully
- **ALL ON FRESH SYSTEM WITH NO MANUAL STEPS**

---

## 🎬 **REALITY CHECK**

**Current Claim:** *"Zero-setup Remotion video generation"*  
**Current Reality:** *"Assumes user already has Remotion knowledge and working setup"*

**Target:** True zero-setup for non-technical users  
**Current State:** Complex setup disguised as simple installation

**The package is NOT ready for publication and needs significant rework to deliver on its promises.**

---

*Status: Major issues identified - Significant development required before publication*