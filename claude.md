Never build in wsl2 or ws2 for this project, ALWAYS in windows, Never create wsl2 paths
Only build on windows, never wsl. never add wsl paths. 



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