/**
 * Proven Remotion Code Generation Patterns
 * Based on official Remotion documentation and working examples
 * Ensures Claude generates correct, video-optimized code without common mistakes
 */

import { 
  AbsoluteFill, 
  useCurrentFrame, 
  useVideoConfig, 
  interpolate, 
  spring, 
  Sequence,
  Img,
  staticFile
} from 'remotion';

// ============================================================================
// PATTERN 1: Basic Animation Component Structure
// ============================================================================
export const BasicAnimationPattern = `
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const {COMPONENT_NAME}: React.FC = () => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '{BACKGROUND_COLOR}',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '6rem', // Video-optimized large text
        color: '{TEXT_COLOR}',
      }}
    >
      <div style={{ opacity }}>{CONTENT}</div>
    </AbsoluteFill>
  );
};
`;

// ============================================================================
// PATTERN 2: Spring Animation with Scaling
// ============================================================================
export const SpringAnimationPattern = `
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';

export const {COMPONENT_NAME}: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const scale = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
  });
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '{BACKGROUND_COLOR}',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          transform: \`scale(\${scale})\`,
          fontSize: '6rem',
          color: '{TEXT_COLOR}',
          fontWeight: 'bold',
        }}
      >
        {CONTENT}
      </div>
    </AbsoluteFill>
  );
};
`;

// ============================================================================
// PATTERN 3: GitHub Showcase (From Official Documentation)
// ============================================================================
export const GitHubShowcasePattern = `
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

type Props = {
  name: string;
  logo: string;
  repo: string;
  description?: string;
};

export const {COMPONENT_NAME}: React.FC<Props> = ({ name, repo, logo, description }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame: frame - 10,
    config: {
      damping: 100,
    },
  });

  const opacity = interpolate(frame, [30, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const moveY = interpolate(frame, [20, 30], [10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        scale: String(scale),
        backgroundColor: '#0d1117', // GitHub dark theme
        color: '#f0f6fc', // GitHub text color
        fontWeight: 'bold',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 40,
        }}
      >
        <Img
          src={logo}
          style={{
            height: 120, // Large for video
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: '6rem', // Video-optimized large text
              transform: \`translateY(\${moveY}px)\`,
              lineHeight: 1,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: '3rem', // Large subtitle for video
              opacity,
              lineHeight: 1.25,
              color: '#58a6ff', // GitHub accent blue
            }}
          >
            {repo}
          </div>
          {description && (
            <div
              style={{
                fontSize: '2rem',
                opacity: opacity * 0.8,
                marginTop: 20,
                maxWidth: 800,
              }}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
`;

// ============================================================================
// PATTERN 4: Sequential Text Animation
// ============================================================================
export const SequentialTextPattern = `
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion';

type Props = {
  titles: string[];
};

const AnimatedTitle: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  return (
    <div style={{ 
      opacity, 
      textAlign: 'center', 
      fontSize: '7rem', // Video-optimized
      color: '{TEXT_COLOR}',
      fontWeight: 'bold',
    }}>
      {title}
    </div>
  );
};

export const {COMPONENT_NAME}: React.FC<Props> = ({ titles }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '{BACKGROUND_COLOR}',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {titles.map((title, index) => (
        <Sequence
          key={title}
          from={index * 40}
          durationInFrames={60}
        >
          <AnimatedTitle title={title} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
`;

// ============================================================================
// PATTERN 5: Product Demo Layout
// ============================================================================
export const ProductDemoPattern = `
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

type Props = {
  productName: string;
  features: string[];
  accentColor?: string;
};

export const {COMPONENT_NAME}: React.FC<Props> = ({ productName, features, accentColor = '#3b82f6' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const titleScale = spring({
    fps,
    frame,
    config: { damping: 200 },
  });
  
  const featuresOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'white',
        padding: 80,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Product Title */}
      <div
        style={{
          fontSize: '8rem',
          fontWeight: '900',
          color: '#1f2937',
          textAlign: 'center',
          marginBottom: 80,
          transform: \`scale(\${titleScale})\`,
        }}
      >
        {productName}
      </div>
      
      {/* Features Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 60,
          opacity: featuresOpacity,
        }}
      >
        {features.map((feature, index) => (
          <div
            key={feature}
            style={{
              padding: 40,
              backgroundColor: '#f9fafb',
              borderRadius: 20,
              fontSize: '3rem',
              color: '#374151',
              borderLeft: \`8px solid \${accentColor}\`,
            }}
          >
            {feature}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
`;

// ============================================================================
// PATTERN METADATA AND VALIDATION RULES
// ============================================================================
export const PatternMetadata = {
  BasicAnimation: {
    name: 'Basic Animation',
    description: 'Simple fade-in animation with video-optimized typography',
    variables: ['{COMPONENT_NAME}', '{BACKGROUND_COLOR}', '{TEXT_COLOR}', '{CONTENT}'],
    duration: 90, // frames
    fps: 30,
  },
  SpringAnimation: {
    name: 'Spring Animation',
    description: 'Bouncy entrance with spring physics',
    variables: ['{COMPONENT_NAME}', '{BACKGROUND_COLOR}', '{TEXT_COLOR}', '{CONTENT}'],
    duration: 120,
    fps: 30,
  },
  GitHubShowcase: {
    name: 'GitHub Showcase',
    description: 'Professional repository showcase with logo and details',
    variables: ['{COMPONENT_NAME}'],
    duration: 150,
    fps: 30,
  },
  SequentialText: {
    name: 'Sequential Text',
    description: 'Multiple titles appearing in sequence',
    variables: ['{COMPONENT_NAME}', '{BACKGROUND_COLOR}', '{TEXT_COLOR}'],
    duration: 'dynamic', // based on titles length
    fps: 30,
  },
  ProductDemo: {
    name: 'Product Demo',
    description: 'Product showcase with features grid',
    variables: ['{COMPONENT_NAME}'],
    duration: 180,
    fps: 30,
  },
};

// ============================================================================
// VALIDATION RULES (Prevents common mistakes)
// ============================================================================
export const ValidationRules = {
  requiredImports: [
    'AbsoluteFill',
    'useCurrentFrame',
  ],
  
  bannedPatterns: [
    'className=', // Use style prop instead
    'class=', // Use style prop instead
    '<div className', // Use style prop instead
  ],
  
  videoOptimizations: [
    'fontSize should be >= 2rem for readability',
    'Use AbsoluteFill for full-screen layout',
    'Always include extrapolateRight: "clamp" for interpolations',
    'Use proper video dimensions (1920x1080 default)',
  ],
  
  commonMistakes: [
    'Don\'t use CSS classes - use inline styles',
    'Don\'t forget useCurrentFrame() for animations',
    'Don\'t use small font sizes (< 2rem)',
    'Don\'t forget to destructure from useVideoConfig() when using spring',
  ],
};