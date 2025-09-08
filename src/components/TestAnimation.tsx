import React from 'react';
import { useCurrentFrame, interpolate, Sequence } from 'remotion';

const TestAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  const scale = interpolate(frame, [0, 60], [0.8, 1.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{
      flex: 1,
      backgroundColor: '#1a1a2e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 60,
      color: '#16213e',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Sequence from={0} durationInFrames={90}>
        <div
          style={{
            opacity,
            transform: `scale(${scale})`,
            color: 'white',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          🎬 Rough Cut MCP Test
        </div>
      </Sequence>
    </div>
  );
};

export default TestAnimation;