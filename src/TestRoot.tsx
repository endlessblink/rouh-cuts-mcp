import React from 'react';
import { Composition } from 'remotion';

// Simple test component to verify exports work
const TestComponent: React.FC = () => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#0099ff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '60px',
      color: 'white'
    }}>
      ✅ MCP Server Working!
    </div>
  );
};

// Root component with simple test
const TestRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TestComponent"
        component={TestComponent}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

export default TestRoot;