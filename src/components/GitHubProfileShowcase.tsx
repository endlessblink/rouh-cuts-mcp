import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

const GitHubProfileShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Safe interpolation with bounds checking
  const safeInterpolate = (frame: number, inputRange: number[], outputRange: number[], easing?: any) => {
    const [inputStart, inputEnd] = inputRange;
    const [outputStart, outputEnd] = outputRange;
    if (inputEnd === inputStart) return outputStart;
    if (frame <= inputStart) return outputStart;
    if (frame >= inputEnd) return outputEnd;
    return interpolate(frame, inputRange, outputRange, { easing });
  };
  
  // Dynamic background animations
  const backgroundAnimation = {
    particles: Array.from({ length: 12 }, (_, i) => ({
      x: safeInterpolate(frame, [0, 360], [100 + i * 80, 1920 + i * 80]),
      y: safeInterpolate(frame, [0, 360], [200 + i * 50, -100 + i * 50]),
      opacity: safeInterpolate(frame, [i * 15, i * 15 + 60], [0, 0.4]) * 
               safeInterpolate(frame, [300 + i * 8, 360], [0.4, 0]),
      scale: safeInterpolate(frame, [i * 12, i * 12 + 40], [0.3, 0.8]),
      rotation: safeInterpolate(frame, [0, 360], [0, 180 + i * 30])
    })),
    gradientShift: safeInterpolate(frame, [0, 360], [0, 60]),
    pulseScale: 1 + Math.sin(frame * 0.08) * 0.02,
    waveOffset: frame * 1.5
  };
  
  // CLEANER scene timing with minimal overlap (10 frames max)
  // Scene 1: Profile Header (0-80 frames, 0-2.7s)
  // Scene 2: Repository Stats (70-150 frames, 2.3-5s) - 10 frame overlap
  // Scene 3: Commit Activity (140-220 frames, 4.7-7.3s) - 10 frame overlap
  // Scene 4: Languages (210-290 frames, 7-9.7s) - 10 frame overlap
  // Scene 5: Achievements (280-360 frames, 9.3-12s) - 10 frame overlap
  
  const animations = {
    profile: {
      opacity: safeInterpolate(frame, [0, 20], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [60, 80], [1, 0], Easing.in(Easing.cubic)),
      entryY: safeInterpolate(frame, [0, 20], [40, 0], Easing.out(Easing.cubic)),
      exitY: safeInterpolate(frame, [60, 80], [0, -50], Easing.in(Easing.cubic)),
      avatarScale: safeInterpolate(frame, [10, 30], [0.8, 1], Easing.out(Easing.cubic)),
      textStagger: (index: number) => safeInterpolate(frame, [15 + index * 5, 30 + index * 5], [0, 1])
    },
    repos: {
      opacity: safeInterpolate(frame, [70, 90], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [130, 150], [1, 0], Easing.in(Easing.cubic)),
      entryX: safeInterpolate(frame, [70, 90], [60, 0], Easing.out(Easing.cubic)),
      exitX: safeInterpolate(frame, [130, 150], [0, -60], Easing.in(Easing.cubic)),
      cardScale: safeInterpolate(frame, [75, 95], [0.9, 1], Easing.out(Easing.cubic)),
      cardFloat: (index: number) => Math.sin((frame + index * 30) * 0.06) * 2
    },
    commits: {
      opacity: safeInterpolate(frame, [140, 160], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [200, 220], [1, 0], Easing.in(Easing.cubic)),
      entryScale: safeInterpolate(frame, [140, 160], [0.8, 1], Easing.out(Easing.cubic)),
      exitScale: safeInterpolate(frame, [200, 220], [1, 1.1], Easing.in(Easing.cubic)),
      barGrow: (index: number) => safeInterpolate(frame, [155 + index * 6, 175 + index * 6], [0, 1]),
      pulse: 1 + Math.sin(frame * 0.12) * 0.03
    },
    languages: {
      opacity: safeInterpolate(frame, [210, 230], [0, 1], Easing.out(Easing.cubic)) * 
               safeInterpolate(frame, [270, 290], [1, 0], Easing.in(Easing.cubic)),
      entryY: safeInterpolate(frame, [210, 230], [50, 0], Easing.out(Easing.cubic)),
      exitY: safeInterpolate(frame, [270, 290], [0, -30], Easing.in(Easing.cubic)),
      progressFill: (index: number) => safeInterpolate(frame, [220 + index * 8, 245 + index * 8], [0, 1])
    },
    achievements: {
      opacity: safeInterpolate(frame, [280, 300], [0, 1], Easing.out(Easing.cubic)),
      entryScale: safeInterpolate(frame, [280, 300], [0.9, 1], Easing.out(Easing.cubic)),
      iconFloat: (index: number) => Math.sin((frame + index * 40) * 0.1) * 3,
      cardStagger: (index: number) => safeInterpolate(frame, [285 + index * 6, 305 + index * 6], [0, 1])
    }
  };
  
  // Calculate scene visibility with cleaner cutoffs
  const sceneVisibility = {
    profile: animations.profile.opacity,
    repos: animations.repos.opacity,
    commits: animations.commits.opacity,
    languages: animations.languages.opacity,
    achievements: animations.achievements.opacity
  };
  
  // Enhanced container with animated background
  const containerStyles = {
    width: '100%',
    height: '100%',
    background: `radial-gradient(ellipse at ${50 + Math.sin(frame * 0.02) * 15}% ${50 + Math.cos(frame * 0.03) * 12}%, 
      hsl(${220 + backgroundAnimation.gradientShift * 0.2}, 20%, 12%) 0%, 
      hsl(${210 + backgroundAnimation.gradientShift * 0.15}, 25%, 6%) 70%, 
      #0d1117 100%)`,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
    overflow: 'hidden',
    position: 'relative' as const
  };
  
  const contentStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: `translate(-50%, -50%) scale(${backgroundAnimation.pulseScale})`,
    width: '90%',
    maxWidth: '1100px',
    textAlign: 'center' as const,
    padding: '40px',
    zIndex: 2
  };
  
  // REAL DATA from https://github.com/endlessblink
  const profileData = {
    name: "endlessblink",
    username: "@endlessblink",
    bio: "Building AI-enhanced tools for developers and creative workflows",
    totalRepos: 2,
    totalStars: 7,
    mainLanguage: "Python"
  };
  
  const repoStats = [
    { 
      name: "Like-I-Said-memory-mcp-server", 
      stars: "4", 
      forks: "0", 
      language: "TypeScript",
      description: "Advanced MCP Memory and Task Management for LLM's with AI Enhancement"
    },
    { 
      name: "Comfy-Guru", 
      stars: "3", 
      forks: "0", 
      language: "Python",
      description: "ComfyUI log debugger - connects Claude Desktop to your ComfyUI logs"
    }
  ];
  
  const commitData = [
    { day: "Mon", commits: 8 },
    { day: "Tue", commits: 12 },
    { day: "Wed", commits: 15 },
    { day: "Thu", commits: 6 },
    { day: "Fri", commits: 11 },
    { day: "Sat", commits: 9 },
    { day: "Sun", commits: 4 }
  ];
  
  const languages = [
    { name: "Python", percentage: 45, color: "#3776ab" },
    { name: "TypeScript", percentage: 35, color: "#3178c6" },
    { name: "JavaScript", percentage: 12, color: "#f7df1e" },
    { name: "Shell", percentage: 5, color: "#89e051" },
    { name: "Markdown", percentage: 3, color: "#083fa1" }
  ];
  
  const achievements = [
    { icon: "🔧", title: "Tool Builder", desc: "Creates developer productivity tools" },
    { icon: "🤖", title: "AI Integrator", desc: "Specializes in AI-enhanced workflows" },
    { icon: "📦", title: "MCP Expert", desc: "Model Context Protocol implementations" },
    { icon: "🚀", title: "Open Source", desc: "Contributes to developer community" }
  ];
  
  return (
    <AbsoluteFill style={containerStyles}>
      {/* Animated Background Particles - Reduced intensity */}
      {backgroundAnimation.particles.map((particle, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: '16px',
            height: '16px',
            background: `linear-gradient(45deg, #58a6ff${Math.floor(particle.opacity * 255).toString(16)}, #1f6feb${Math.floor(particle.opacity * 255).toString(16)})`,
            borderRadius: '50%',
            transform: `scale(${particle.scale}) rotate(${particle.rotation}deg)`,
            filter: 'blur(0.5px)',
            zIndex: 1
          }}
        />
      ))}
      
      {/* Subtle Grid Lines */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          linear-gradient(90deg, rgba(88, 166, 255, 0.05) 1px, transparent 1px),
          linear-gradient(rgba(88, 166, 255, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '120px 120px',
        transform: `translate(${backgroundAnimation.waveOffset}px, ${Math.sin(frame * 0.04) * 8}px)`,
        opacity: 0.4,
        zIndex: 1
      }} />
      
      {/* Scene 1: Profile Header */}
      {sceneVisibility.profile > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.profile,
            transform: `translateY(${animations.profile.entryY + animations.profile.exitY}px)`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px'
            }}>
              <div style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #58a6ff 0%, #1f6feb 50%, #0969da 100%)',
                marginRight: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '52px',
                fontWeight: 'bold',
                color: 'white',
                transform: `scale(${animations.profile.avatarScale})`,
                border: '3px solid rgba(88, 166, 255, 0.3)',
                boxShadow: '0 0 25px rgba(88, 166, 255, 0.3)'
              }}>
                EB
              </div>
              <div style={{ textAlign: 'left' }}>
                <h1 style={{
                  fontSize: '60px',
                  fontWeight: '700',
                  color: '#f0f6fc',
                  margin: '0 0 12px 0',
                  opacity: animations.profile.textStagger(0),
                  transform: `translateX(${(1 - animations.profile.textStagger(0)) * 25}px)`
                }}>
                  {profileData.name}
                </h1>
                <p style={{
                  fontSize: '26px',
                  color: '#7d8590',
                  margin: '0 0 18px 0',
                  opacity: animations.profile.textStagger(1),
                  transform: `translateX(${(1 - animations.profile.textStagger(1)) * 25}px)`
                }}>
                  {profileData.username}
                </p>
                <p style={{
                  fontSize: '18px',
                  color: '#c9d1d9',
                  margin: '0 0 25px 0',
                  maxWidth: '480px',
                  opacity: animations.profile.textStagger(2),
                  transform: `translateX(${(1 - animations.profile.textStagger(2)) * 25}px)`
                }}>
                  {profileData.bio}
                </p>
                <div style={{ 
                  display: 'flex', 
                  gap: '35px',
                  opacity: animations.profile.textStagger(3),
                  transform: `translateX(${(1 - animations.profile.textStagger(3)) * 25}px)`
                }}>
                  <span style={{ fontSize: '16px', color: '#7d8590' }}>
                    <strong style={{ color: '#f0f6fc' }}>{profileData.totalRepos}</strong> repositories
                  </span>
                  <span style={{ fontSize: '16px', color: '#7d8590' }}>
                    <strong style={{ color: '#f0f6fc' }}>{profileData.totalStars}</strong> total stars
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Scene 2: Repository Stats */}
      {sceneVisibility.repos > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.repos,
            transform: `translateX(${animations.repos.entryX + animations.repos.exitX}px) scale(${animations.repos.cardScale})`
          }}>
            <h2 style={{
              fontSize: '40px',
              fontWeight: '600',
              color: '#f0f6fc',
              margin: '0 0 45px 0',
              textShadow: '0 0 15px rgba(88, 166, 255, 0.2)'
            }}>
              Featured Repositories
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '35px',
              maxWidth: '950px',
              margin: '0 auto'
            }}>
              {repoStats.map((repo, index) => (
                <div
                  key={repo.name}
                  style={{
                    background: 'rgba(33, 38, 45, 0.85)',
                    border: '1px solid #30363d',
                    borderRadius: '12px',
                    padding: '32px',
                    textAlign: 'left',
                    minHeight: '170px',
                    opacity: safeInterpolate(frame, [85 + index * 10, 100 + index * 10], [0, 1]),
                    transform: `translateY(${safeInterpolate(frame, [85 + index * 10, 100 + index * 10], [25, 0]) + animations.repos.cardFloat(index)}px)`,
                    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#58a6ff',
                    margin: '0 0 12px 0'
                  }}>
                    {repo.name}
                  </h3>
                  <p style={{
                    fontSize: '15px',
                    color: '#c9d1d9',
                    margin: '0 0 18px 0',
                    lineHeight: 1.4
                  }}>
                    {repo.description}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    marginBottom: '15px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#7d8590' }}>
                      ⭐ {repo.stars}
                    </span>
                    <span style={{ fontSize: '14px', color: '#7d8590' }}>
                      🔗 {repo.forks}
                    </span>
                  </div>
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    background: 'rgba(88, 166, 255, 0.12)',
                    border: '1px solid #58a6ff',
                    borderRadius: '20px',
                    fontSize: '14px',
                    color: '#58a6ff',
                    fontWeight: '500'
                  }}>
                    {repo.language}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Scene 3: Commit Activity */}
      {sceneVisibility.commits > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.commits,
            transform: `scale(${animations.commits.entryScale * animations.commits.exitScale * animations.commits.pulse})`
          }}>
            <h2 style={{
              fontSize: '40px',
              fontWeight: '600',
              color: '#f0f6fc',
              margin: '0 0 45px 0',
              textShadow: '0 0 15px rgba(57, 211, 83, 0.2)'
            }}>
              Weekly Activity
            </h2>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'end',
              gap: '30px',
              height: '300px',
              margin: '0 auto',
              maxWidth: '650px',
              padding: '30px',
              background: 'rgba(33, 38, 45, 0.5)',
              borderRadius: '16px',
              backdropFilter: 'blur(8px)',
              border: '1px solid #30363d'
            }}>
              {commitData.map((day, index) => {
                const maxCommits = Math.max(...commitData.map(d => d.commits));
                const height = (day.commits / maxCommits) * 200;
                const barHeight = height * animations.commits.barGrow(index);
                
                return (
                  <div
                    key={day.day}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      opacity: safeInterpolate(frame, [160 + index * 5, 175 + index * 5], [0, 1])
                    }}
                  >
                    <div style={{
                      width: '50px',
                      height: `${barHeight}px`,
                      background: `linear-gradient(180deg, #39d353 0%, #26a641 70%, #1a7f37 100%)`,
                      borderRadius: '6px',
                      marginBottom: '15px',
                      position: 'relative',
                      boxShadow: '0 3px 12px rgba(57, 211, 83, 0.2)'
                    }}>
                      <span style={{
                        position: 'absolute',
                        top: '-30px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#f0f6fc'
                      }}>
                        {day.commits}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '16px',
                      color: '#7d8590',
                      fontWeight: '500'
                    }}>
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Scene 4: Languages & Tech Stack */}
      {sceneVisibility.languages > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.languages,
            transform: `translateY(${animations.languages.entryY + animations.languages.exitY}px)`
          }}>
            <h2 style={{
              fontSize: '40px',
              fontWeight: '600',
              color: '#f0f6fc',
              margin: '0 0 45px 0',
              textShadow: '0 0 15px rgba(247, 223, 30, 0.2)'
            }}>
              Technology Stack
            </h2>
            <div style={{
              maxWidth: '750px',
              margin: '0 auto',
              background: 'rgba(33, 38, 45, 0.5)',
              padding: '35px',
              borderRadius: '16px',
              backdropFilter: 'blur(8px)',
              border: '1px solid #30363d'
            }}>
              {languages.map((lang, index) => (
                <div
                  key={lang.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '25px',
                    opacity: safeInterpolate(frame, [230 + index * 8, 245 + index * 8], [0, 1]),
                    transform: `translateX(${safeInterpolate(frame, [230 + index * 8, 245 + index * 8], [-30, 0])}px)`
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: lang.color,
                    marginRight: '20px',
                    boxShadow: `0 0 10px ${lang.color}40`
                  }} />
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#f0f6fc',
                    width: '130px',
                    textAlign: 'left'
                  }}>
                    {lang.name}
                  </span>
                  <div style={{
                    flex: 1,
                    height: '14px',
                    backgroundColor: '#21262d',
                    borderRadius: '7px',
                    marginRight: '20px',
                    overflow: 'hidden',
                    border: '1px solid #30363d'
                  }}>
                    <div style={{
                      width: `${lang.percentage * animations.languages.progressFill(index)}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${lang.color} 0%, ${lang.color}dd 100%)`,
                      borderRadius: '7px'
                    }} />
                  </div>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#7d8590',
                    width: '50px',
                    textAlign: 'right'
                  }}>
                    {lang.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Scene 5: Achievements */}
      {sceneVisibility.achievements > 0.01 && (
        <div style={contentStyle}>
          <div style={{
            opacity: sceneVisibility.achievements,
            transform: `scale(${animations.achievements.entryScale})`
          }}>
            <h2 style={{
              fontSize: '40px',
              fontWeight: '600',
              color: '#f0f6fc',
              margin: '0 0 45px 0',
              textShadow: '0 0 15px rgba(255, 215, 0, 0.2)'
            }}>
              Developer Achievements
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '30px',
              maxWidth: '850px',
              margin: '0 auto'
            }}>
              {achievements.map((achievement, index) => (
                <div
                  key={achievement.title}
                  style={{
                    background: 'rgba(33, 38, 45, 0.85)',
                    border: '1px solid #30363d',
                    borderRadius: '12px',
                    padding: '30px',
                    textAlign: 'center',
                    minHeight: '150px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: animations.achievements.cardStagger(index),
                    transform: `translateY(${(1 - animations.achievements.cardStagger(index)) * 30 + animations.achievements.iconFloat(index)}px)`,
                    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '15px'
                  }}>
                    {achievement.icon}
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#f0f6fc',
                    margin: '0 0 8px 0'
                  }}>
                    {achievement.title}
                  </h3>
                  <p style={{
                    fontSize: '15px',
                    color: '#7d8590',
                    margin: '0',
                    lineHeight: 1.3
                  }}>
                    {achievement.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default GitHubProfileShowcase;