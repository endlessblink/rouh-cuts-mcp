import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const AutoInstallTest: React.FC = () => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  const scale = interpolate(frame, [0, 30], [0.8, 1]);
  
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          textAlign: 'center',
          color: 'white'
        }}
      >
        <h1 style={{ fontSize: '60px', margin: '0 0 20px 0' }}>
          🎬 Auto-Install Success!
        </h1>
        <p style={{ fontSize: '24px', margin: 0 }}>
          Remotion MCP is working perfectly
        </p>
      </div>
    </AbsoluteFill>
  );
};