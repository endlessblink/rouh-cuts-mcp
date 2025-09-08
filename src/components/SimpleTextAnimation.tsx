import React from 'react';
import { useCurrentFrame, interpolate, Sequence } from 'remotion';

const SimpleTextAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Fade in effect
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  // Scale up effect
  const scale = interpolate(frame, [0, 30, 60], [0.8, 1.1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  // Slide in from left
  const translateX = interpolate(frame, [0, 30], [-100, 0], {
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
      fontFamily: 'Arial, sans-serif',
    }}>
      <Sequence from={0} durationInFrames={90}>
        <div
          style={{
            opacity,
            transform: `translateX(${translateX}px) scale(${scale})`,
            color: '#ffffff',
            fontSize: 64,
            fontWeight: 'bold',
            textAlign: 'center',
            textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
          }}
        >
          Hello World!
        </div>
      </Sequence>
    </div>
  );
};

export default SimpleTextAnimation;