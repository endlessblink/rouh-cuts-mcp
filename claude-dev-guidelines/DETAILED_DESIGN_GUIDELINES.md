# 🎬 REMOTION DESIGN GUIDELINES
**Mandatory Rules to Prevent Layout Issues**

## 🚨 **CRITICAL RULES - NEVER VIOLATE**

### **1. ABSOLUTE POSITIONING RULES**
- ❌ **NEVER** use multiple `position: 'absolute'` elements that can overlap
- ✅ **ALWAYS** use `position: 'relative'` or normal flow for content sections
- ✅ **ONLY** use absolute positioning for single, full-screen elements

### **2. TEXT OVERLAP PREVENTION**
- ❌ **NEVER** place text elements without proper spacing calculations
- ✅ **ALWAYS** use `marginBottom` of at least 40px between sections
- ✅ **ALWAYS** test text at different frame positions to ensure no overlap

### **3. CONTAINER HEIGHT MANAGEMENT**
- ❌ **NEVER** assume text will fit in arbitrary heights
- ✅ **ALWAYS** use `minHeight` instead of fixed `height` for text containers
- ✅ **ALWAYS** add padding: 20px minimum inside containers with text

### **4. GRID LAYOUT REQUIREMENTS**
- ✅ **ALWAYS** use explicit `gridTemplateColumns` (never auto-fit)
- ✅ **ALWAYS** set `gap` of at least 20px
- ✅ **ALWAYS** use fixed heights for grid items to prevent layout shift

### **5. SCENE TRANSITION SAFETY**
- ✅ **ALWAYS** use conditional rendering: `{opacity > 0.01 && (...)}`
- ✅ **ALWAYS** ensure scenes don't overlap in time
- ✅ **NEVER** have multiple scenes visible simultaneously unless intended

### **6. READABILITY & SIZE REQUIREMENTS (CRITICAL)**
- ❌ **NEVER** use font sizes smaller than 16px for body text
- ❌ **NEVER** use font sizes smaller than 18px for badges/pills/labels
- ❌ **NEVER** use font sizes smaller than 20px for buttons
- ✅ **ALWAYS** ensure text is clearly readable at 1920x1080 resolution
- ✅ **ALWAYS** use minimum 44px height for interactive elements
- ✅ **ALWAYS** test readability from normal viewing distance

## 📐 **SAFE LAYOUT PATTERNS**

### **Pattern 1: Single Scene Layout**
```typescript
return (
  <AbsoluteFill style={containerStyles}>
    {/* Only ONE scene visible at a time */}
    {currentScene === 'intro' && <IntroContent />}
    {currentScene === 'main' && <MainContent />}
    {currentScene === 'outro' && <OutroContent />}
  </AbsoluteFill>
);
```

### **Pattern 2: Stacked Flow Layout** 
```typescript
return (
  <AbsoluteFill style={containerStyles}>
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '60px',  // MANDATORY gap
      padding: '80px'
    }}>
      <Section1 />
      <Section2 />
      <Section3 />
    </div>
  </AbsoluteFill>
);
```

### **Pattern 3: Centered Single Element**
```typescript
return (
  <AbsoluteFill style={containerStyles}>
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '800px'
    }}>
      <ContentCard />
    </div>
  </AbsoluteFill>
);
```

## 🛡️ **BULLETPROOF SPACING RULES**

### **Minimum Spacing Requirements:**
- **Between sections**: 60px margin
- **Container padding**: 80px minimum
- **Card padding**: 40px minimum  
- **Grid gaps**: 20px minimum
- **Text line height**: 1.4 minimum

### **Typography Safety:**
- **Titles**: Max 2 lines, use ellipsis for overflow
- **Descriptions**: Max 3 lines, proper line-height
- **Never**: Use absolute positioning for text blocks

## 🎯 **TESTING CHECKLIST**

Before deploying ANY component:

### **Visual Tests:**
- [ ] Play animation from frame 0 to end
- [ ] Check every 30-frame interval for overlaps
- [ ] Verify text doesn't overflow containers
- [ ] Test at different browser zoom levels

### **Layout Tests:**
- [ ] All grid items same height
- [ ] No text bleeding outside cards
- [ ] Proper spacing between all elements
- [ ] Content fits within safe margins

### **Animation Tests:**
- [ ] Smooth transitions between scenes
- [ ] No jarring position jumps
- [ ] Elements don't appear/disappear abruptly

## 🚫 **BANNED PATTERNS**

### **NEVER USE THESE:**
```typescript
// ❌ Multiple overlapping absolute elements
<div style={{ position: 'absolute', top: 0 }}>Content 1</div>
<div style={{ position: 'absolute', top: '20%' }}>Content 2</div>

// ❌ Auto-sizing grids
gridTemplateColumns: 'repeat(auto-fit, minmax(...))'

// ❌ Fixed heights with text
height: '100px'  // Use minHeight instead

// ❌ Scenes without conditional rendering
{animations.scene1Opacity && <Scene1 />}  // Missing > 0.01 check
```

## ✅ **SAFE ALTERNATIVES**

```typescript
// ✅ Single scene with proper positioning
{animations.sceneOpacity > 0.01 && (
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '800px'
  }}>
    <ContentCard />
  </div>
)}

// ✅ Explicit grid with safe spacing
<div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '30px',
  padding: '40px'
}}>

// ✅ Flexible heights
<div style={{
  minHeight: '120px',
  padding: '20px'
}}>
```

## 🎬 **COMPONENT STRUCTURE TEMPLATE**

```typescript
const SafeComponent: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Calculate which scene is active
  const currentScene = 
    frame < 30 ? 'intro' :
    frame < 90 ? 'main' : 'outro';
  
  return (
    <AbsoluteFill style={safeContainerStyles}>
      {currentScene === 'intro' && (
        <div style={centeredContentStyle}>
          <IntroCard />
        </div>
      )}
      
      {currentScene === 'main' && (
        <div style={centeredContentStyle}>
          <MainContentCard />
        </div>
      )}
      
      {currentScene === 'outro' && (
        <div style={centeredContentStyle}>
          <OutroCard />
        </div>
      )}
    </AbsoluteFill>
  );
};
```

---

## 📋 **MANDATORY CHECKLIST FOR EVERY COMPONENT**

Before creating/editing any Remotion component:

- [ ] Read these guidelines completely
- [ ] Choose appropriate layout pattern
- [ ] Use safe spacing values
- [ ] Test for text overlap
- [ ] Verify scene transitions
- [ ] Confirm responsive behavior

**Following these guidelines is MANDATORY for all Remotion components.**

---

*Last updated: Current session - Add new rules as issues are discovered*