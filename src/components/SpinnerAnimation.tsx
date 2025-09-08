import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const SpinnerAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Create a continuous rotation
  const rotation = interpolate(
    frame,
    [0, fps * 3], // 3 seconds duration
    [0, 360 * 3], // 3 full rotations
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'extend'
    }
  );
  
  // Pulsing scale effect
  const scale = interpolate(
    frame % (fps * 0.8), // Pulse every 0.8 seconds
    [0, fps * 0.4, fps * 0.8],
    [1, 1.2, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: '#1a1a2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer spinning ring */}
      <div
        style={{
          width: 120,
          height: 120,
          border: '8px solid rgba(74, 144, 226, 0.3)',
          borderTop: '8px solid #4a90e2',
          borderRadius: '50%',
          transform: `rotate(${rotation}deg) scale(${scale})`,
          position: 'absolute',
        }}
      />
      
      {/* Inner spinning dots */}
      <div
        style={{
          width: 80,
          height: 80,
          position: 'relative',
          transform: `rotate(${-rotation * 0.7}deg)`, // Counter-rotate at different speed
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 12,
              height: 12,
              backgroundColor: '#ff6b6b',
              borderRadius: '50%',
              top: '50%',
              left: '50%',
              transform: `
                translate(-50%, -50%) 
                rotate(${i * 90}deg) 
                translateY(-40px)
                scale(${1 + Math.sin((frame + i * 15) * 0.2) * 0.3})
              `,
              opacity: 0.7 + Math.sin((frame + i * 20) * 0.15) * 0.3,
            }}
          />
        ))}
      </div>
      
      {/* Center pulse */}
      <div
        style={{
          width: 16,
          height: 16,
          backgroundColor: '#4ecdc4',
          borderRadius: '50%',
          transform: `scale(${1 + Math.sin(frame * 0.3) * 0.5})`,
          boxShadow: `0 0 20px rgba(78, 205, 196, 0.6)`,
        }}
      />
    </div>
  );
};

export default SpinnerAnimation;