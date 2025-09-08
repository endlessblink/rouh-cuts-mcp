import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

/**
 * Test Component - Demonstrates correct Remotion patterns
 * Based on official documentation examples
 */
export const TestComponent: React.FC = () => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  const scale = interpolate(frame, [30, 60], [1, 1.1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0d1117', // GitHub dark theme
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          fontSize: '6rem', // Video-optimized large text
          color: '#f0f6fc', // GitHub text color
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        🎬 Remotion AI
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          fontSize: '2rem',
          color: '#58a6ff', // GitHub accent blue
          opacity: opacity * 0.8,
        }}
      >
        Generated with proven patterns
      </div>
    </AbsoluteFill>
  );
};