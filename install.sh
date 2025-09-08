#!/bin/bash

echo "🎬 Installing Zero-Setup Remotion MCP for Claude Desktop..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js from https://nodejs.org"
    echo "Then run this script again."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo

# Install dependencies and build MCP
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "🔨 Building MCP server..."
cd mcp-server
npm install
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Failed to build MCP server"
    exit 1
fi
cd ..

echo "⚙️ Configuring Claude Desktop..."
node setup-universal.js
if [ $? -ne 0 ]; then
    echo "❌ Failed to configure Claude Desktop"
    echo "Please manually add the MCP configuration"
    exit 1
fi

echo
echo "✅ 🎉 Installation Complete!"
echo
echo "📋 Next Steps:"
echo "1. Restart Claude Desktop"
echo "2. Ask Claude to create videos!"
echo
echo "💡 Example prompts:"
echo "   - \"Create a dynamic showcase video\""
echo "   - \"Make an animated logo intro\""
echo "   - \"Generate a product demo video\""
echo
echo "🎬 The MCP will automatically:"
echo "   ✓ Create Remotion projects when needed"
echo "   ✓ Generate professional video components"
echo "   ✓ Launch preview studio"
echo "   ✓ Render videos to MP4"
echo
echo "📂 Videos will be saved to: ~/Claude-Videos/remotion-project/out/"
echo
