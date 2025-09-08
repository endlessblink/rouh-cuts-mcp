@echo off
echo 🧪 Testing Remotion AI Copilot MCP Server...
echo.

cd /d "D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Video + Motion\rough-cuts-mcp\mcp-server"

if not exist "dist\index.js" (
    echo ❌ MCP server not built yet. Run build-mcp.bat first.
    pause
    exit /b 1
)

echo 🔍 Testing MCP server startup...
echo Press Ctrl+C to stop the test
echo.

node dist\index.js

echo.
echo ✅ Test completed!
pause
