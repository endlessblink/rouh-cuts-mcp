# 🎬 REMOTION QUICK GUIDELINES
**Copy this into new Claude chats before creating animations**

## 🚨 CRITICAL RULES - NEVER VIOLATE

### **Layout Rules:**
- ✅ **ONLY ONE SCENE VISIBLE** at a time using: `{currentScene === 'intro' && <Content />}`
- ❌ **NEVER multiple `position: 'absolute'`** elements that can overlap
- ✅ **ALWAYS use scene-based rendering** instead of opacity-based overlays

### **Spacing Rules:**
- ✅ **Minimum 60px** between sections
- ✅ **Container padding: 80px** minimum
- ✅ **Grid gaps: 25px** minimum
- ✅ **Use `minHeight` not `height`** for text containers

### **Safe Scene Pattern:**
```typescript
const currentScene = 
  frame < 30 ? 'intro' :
  frame < 90 ? 'main' : 'outro';

return (
  <AbsoluteFill style={containerStyles}>
    {currentScene === 'intro' && <IntroContent />}
    {currentScene === 'main' && <MainContent />}  
    {currentScene === 'outro' && <OutroContent />}
  </AbsoluteFill>
);
```

### **Grid Safety:**
```typescript
// ✅ SAFE GRID
<div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr', // Explicit columns
  gap: '25px',
  maxWidth: '600px'
}}>
```

### **Banned Patterns:**
- ❌ `gridTemplateColumns: 'repeat(auto-fit, ...)'`
- ❌ Multiple `position: 'absolute'` elements
- ❌ Overlapping opacity-based scenes
- ❌ Fixed heights with text content

**Paste this at start of new animation chats!**