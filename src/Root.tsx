import React from 'react';
import { Composition } from 'remotion';
import GitHubProfileShowcase from './components/GitHubProfileShowcase';
import AutoInstallTest from './components/AutoInstallTest';
import AutoInstallationDemo from './components/AutoInstallationDemo';

/**
 * Remotion Root Component
 * Registers all video compositions for the project
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GitHubProfileShowcase"
        component={GitHubProfileShowcase}
        durationInFrames={360}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AutoInstallTest"
        component={AutoInstallTest}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AutoInstallationDemo"
        component={AutoInstallationDemo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};