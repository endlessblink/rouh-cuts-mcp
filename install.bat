@echo off
echo 🎬 Installing Zero-Setup Remotion MCP for Claude Desktop...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js from https://nodejs.org
    echo Then run this script again.
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Install dependencies and build MCP
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo 🔨 Building MCP server...
cd mcp-server
call npm install
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build MCP server
    pause
    exit /b 1
)
cd ..

echo ⚙️ Configuring Claude Desktop...
node setup-universal.js
if %errorlevel% neq 0 (
    echo ❌ Failed to configure Claude Desktop
    echo Please manually add the MCP configuration
    pause
    exit /b 1
)

echo.
echo ✅ 🎉 Installation Complete!
echo.
echo 📋 Next Steps:
echo 1. Restart Claude Desktop
echo 2. Ask Claude to create videos!
echo.
echo 💡 Example prompts:
echo    - "Create a dynamic showcase video"
echo    - "Make an animated logo intro"  
echo    - "Generate a product demo video"
echo.
echo 🎬 The MCP will automatically:
echo    ✓ Create Remotion projects when needed
echo    ✓ Generate professional video components
echo    ✓ Launch preview studio
echo    ✓ Render videos to MP4
echo.
echo 📂 Videos will be saved to: %USERPROFILE%\Claude-Videos\remotion-project\out\
echo.
pause
