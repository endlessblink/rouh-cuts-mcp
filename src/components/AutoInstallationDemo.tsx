import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

export const AutoInstallationDemo: React.FC = () => {
  const frame = useCurrentFrame();
  
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    easing: Easing.out(Easing.cubic)
  });
  
  const titleY = interpolate(frame, [0, 30], [50, 0], {
    easing: Easing.out(Easing.cubic)
  });
  
  const subtitleOpacity = interpolate(frame, [20, 50], [0, 1], {
    easing: Easing.out(Easing.cubic)
  });
  
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: 'white'
      }}
    >
      <h1
        style={{
          fontSize: '80px',
          fontWeight: 'bold',
          margin: '0 0 30px 0',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`
        }}
      >
        🎬 Auto-Installation Demo
      </h1>
      
      <p
        style={{
          fontSize: '32px',
          opacity: subtitleOpacity,
          maxWidth: '800px',
          lineHeight: 1.4
        }}
      >
        Remotion project auto-created with dependencies!<br />
        Zero manual setup required.
      </p>
    </AbsoluteFill>
  );
};