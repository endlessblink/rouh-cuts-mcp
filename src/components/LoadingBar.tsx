import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

const LoadingBar: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Progress from 0% to 100% starting immediately at frame 0
  const progress = interpolate(frame, [0, 120], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  // Pulse effect for the bar - starts immediately
  const glowIntensity = interpolate(frame, [0, 30, 60, 90, 120], [0.5, 0.8, 0.5, 0.9, 0.6]);
  
  // Text is visible from frame 0
  const textOpacity = 1;

  return (
    <div style={{
      flex: 1,
      backgroundColor: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      fontFamily: 'Arial, sans-serif',
    }}>
      {/* Loading Text - visible immediately */}
      <div
        style={{
          opacity: textOpacity,
          color: '#e2e8f0',
          fontSize: 32,
          fontWeight: 'bold',
          marginBottom: 40,
          textAlign: 'center',
        }}
      >
        Loading...
      </div>
      
      {/* Progress Bar Container */}
      <div
        style={{
          width: 400,
          height: 12,
          backgroundColor: '#1e293b',
          borderRadius: 6,
          border: '1px solid #334155',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Progress Bar Fill - starts loading immediately */}
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #10b981)',
            borderRadius: 6,
            boxShadow: `0 0 ${glowIntensity * 20}px rgba(59, 130, 246, ${glowIntensity})`,
            transition: 'none',
          }}
        />
      </div>
      
      {/* Percentage Text - visible immediately */}
      <div
        style={{
          opacity: textOpacity,
          color: '#94a3b8',
          fontSize: 18,
          marginTop: 20,
          fontWeight: '500',
        }}
      >
        {Math.round(progress)}%
      </div>
    </div>
  );
};

export default LoadingBar;