import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const DynamicShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation - slides in from left
  const titleSlide = interpolate(frame, [0, 30], [-200, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Subtitle fade in
  const subtitleOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Accent animation - bouncy spring
  const accentScale = spring({
    fps,
    frame: frame - 60,
    config: { damping: 200, stiffness: 100 },
  });

  // Background gradient rotation
  const gradientRotation = interpolate(frame, [0, 150], [0, 360], {
    extrapolateRight: 'extend',
  });

  // Final fade out
  const fadeOut = interpolate(frame, [120, 150], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientRotation}deg, #667eea 0%, #764ba2 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          color: 'white',
          textShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        {/* Main Title */}
        <h1
          style={{
            fontSize: '8rem',
            fontWeight: 'bold',
            margin: 0,
            marginBottom: '2rem',
            transform: `translateX(${titleSlide}px)`,
          }}
        >
          Rough Cuts MCP
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '3rem',
            margin: 0,
            marginBottom: '3rem',
            opacity: subtitleOpacity,
            fontWeight: '300',
          }}
        >
          Powerful Video Generation
        </p>

        {/* Accent Elements */}
        <div
          style={{
            transform: `scale(${accentScale})`,
            display: 'flex',
            justifyContent: 'center',
            gap: '4rem',
            fontSize: '2.5rem',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '1rem 2rem',
              borderRadius: '2rem',
              backdropFilter: 'blur(10px)',
            }}
          >
            🎬 Create
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '1rem 2rem',
              borderRadius: '2rem',
              backdropFilter: 'blur(10px)',
            }}
          >
            ✨ Animate
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '1rem 2rem',
              borderRadius: '2rem',
              backdropFilter: 'blur(10px)',
            }}
          >
            🚀 Export
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};