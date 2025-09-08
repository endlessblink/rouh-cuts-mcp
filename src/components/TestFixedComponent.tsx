import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

const TestFixedComponent: React.FC = () => {
  const frame = useCurrentFrame();
  
  const rotation = interpolate(frame, [0, 60], [0, 360]);
  const scale = interpolate(frame, [0, 60], [1, 1.5]);

  return (
    <div style={{
      flex: 1,
      backgroundColor: '#22c55e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div
        style={{
          transform: `rotate(${rotation}deg) scale(${scale})`,
          fontSize: 72,
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        🔧 MCP FIXED!
      </div>
    </div>
  );
};

export default TestFixedComponent;