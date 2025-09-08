import React from 'react';
import { useCurrentFrame, interpolate, Sequence } from 'remotion';

const WindowsTestSuccess: React.FC = () => {
  const frame = useCurrentFrame();
  
  const scale = interpolate(frame, [0, 30, 60, 90], [0.5, 1.2, 0.8, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  const rotation = interpolate(frame, [0, 90], [0, 360]);

  return (
    <div style={{
      flex: 1,
      backgroundColor: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6)',
    }}>
      <Sequence from={0} durationInFrames={90}>
        <div
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            color: 'white',
            fontSize: 48,
            fontWeight: 'bold',
            textShadow: '0 0 20px rgba(255,255,255,0.5)',
            textAlign: 'center',
          }}
        >
          🎬✨<br/>
          Windows Fix<br/>
          SUCCESS!
        </div>
      </Sequence>
    </div>
  );
};

export default WindowsTestSuccess;