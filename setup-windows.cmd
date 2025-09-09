@echo off
REM Windows-Native MCP Server Setup Script
REM This ensures Claude Desktop compatibility by using Windows-native builds

echo 🎬 Setting up Rough Cuts MCP for Windows Claude Desktop...
echo.

REM Check if Node.js is available
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js from https://nodejs.org
    echo    Make sure to add Node.js to your PATH during installation.
    pause
    exit /b 1
)

REM Display Node.js version
echo ✅ Node.js found:
node --version
echo.

REM Navigate to MCP server directory
cd /d "%~dp0mcp-server"

REM Install dependencies using Windows npm
echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Build TypeScript using Windows npm
echo 🔨 Building TypeScript...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build TypeScript
    pause
    exit /b 1
)

REM Verify build output exists
if not exist "dist\index.js" (
    echo ❌ Build failed - dist\index.js not found
    pause
    exit /b 1
)

echo ✅ MCP server built successfully!
echo.

REM Test MCP server startup
echo 🧪 Testing MCP server startup...
timeout /t 2 >nul
echo Testing... (will timeout after 5 seconds)
timeout /t 5 /nobreak | node dist\index.js

REM Run the universal setup script
echo.
echo 🎯 Configuring Claude Desktop...
cd /d "%~dp0"
node setup-universal.js

echo.
echo ✅ Setup complete! 
echo.
echo 🎯 Next steps:
echo 1. Restart Claude Desktop completely
echo 2. Ask Claude to create videos using the MCP tools
echo.
echo 💡 Test commands:
echo    - rough-cuts-mcp:check_environment
echo    - rough-cuts-mcp:setup_remotion_environment
echo    - rough-cuts-mcp:launch_remotion_studio
echo.
pause