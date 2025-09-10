Never build in wsl2 or ws2 for this project, ALWAYS in windows, Never create wsl2 paths
Only build on windows, never wsl. never add wsl paths.

# CRITICAL: NO EMOJIS IN CODE - JSON PARSING ERRORS
NEVER use emoji characters in MCP server code, tool responses, or log messages.
These cause "Unexpected token" JSON parsing errors in Claude Desktop.

## BANNED EMOJIS - DO NOT USE
- ❌ NO cross marks - use [ERROR] instead
- ✅ NO checkmarks - use [OK] instead  
- 🚀 NO rockets - use [LAUNCH] instead
- 💡 NO lightbulbs - use [TIP] or [SOLUTION] instead
- 🔥 NO fire - use text like "CRITICAL:" or "HOT:" instead
- 🎯 NO targets - use [TARGET] or remove
- 📊 NO charts - use [STATS] instead
- ⚠️ NO warning signs - use [WARNING] instead
- 🚨 NO sirens - use [ALERT] instead
- 📹 NO cameras - use [VIDEO] instead
- 🛠️ NO tools - use [FIX] or [TOOLS] instead
- 🔧 NO wrenches - use [REPAIR] or [CONFIG] instead
- 📁 NO folders - use "Directory:" instead
- 🎬 NO clappers - use [VIDEO] or remove
- ANY OTHER EMOJI - Replace with appropriate text marker

## WHY THIS MATTERS
MCP servers communicate via JSON. Emojis break JSON parsing and cause:
- "Unexpected token" errors
- "is not valid JSON" errors  
- Complete MCP server failure in Claude Desktop

Always use plain ASCII text markers in square brackets instead. 



# CRITICAL: Evidence-Based Development Rules

## BANNED Marketing Buzzwords
Never use these meaningless catchphrases:
- ❌ "production-ready" 
- ❌ "enterprise-grade"
- ❌ "bulletproof"
- ❌ "rock-solid" 
- ❌ "battle-tested"
- ❌ "industrial-strength"
- ❌ "mission-critical"

## REQUIRED: Testing Before Claims
- Never claim functionality works without actual testing evidence
- Never report "success" based on code compilation alone
- Never assume features work because they "should work"
- Always provide specific test results: "tested with 3 scenarios, 2 passed, 1 failed"

## Use Evidence-Based Language
- ✅ "Tested on Windows 10 with Node.js 18.x"
- ✅ "Verified with actual MCP tool calls"  
- ✅ "Confirmed studio launches and responds to HTTP requests"
- ✅ "Dependencies install successfully in clean environment"

## Core Principle
If you haven't tested it, don't claim it works. This prevents the exact same false confidence that caused the original MCP reliability issues.