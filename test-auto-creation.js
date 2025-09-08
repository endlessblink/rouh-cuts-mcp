const path = require('path');
const { spawn } = require('child_process');

// Test the new MCP server directly
const mcpServerPath = path.join(__dirname, 'mcp-server', 'dist', 'index.js');

console.log('🧪 Testing Auto-Creation MCP Server...');
console.log(`📁 MCP Path: ${mcpServerPath}`);
console.log('');

// Simulate MCP communication by running the server directly
const testProcess = spawn('node', [mcpServerPath], {
  cwd: 'C:\\Users\\endle\\Desktop', // Test from a directory without Remotion
  stdio: 'pipe'
});

// Send a test message to trigger auto-creation
testProcess.stdin.write(JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'list_components',
    arguments: {}
  }
}) + '\n');

testProcess.stdout.on('data', (data) => {
  console.log('📤 Server Response:', data.toString());
});

testProcess.stderr.on('data', (data) => {
  console.log('🔍 Server Info:', data.toString());
});

testProcess.on('close', (code) => {
  console.log(`✅ Test completed with code: ${code}`);
});

// Close after 10 seconds
setTimeout(() => {
  testProcess.kill();
  console.log('🏁 Test finished');
}, 10000);
