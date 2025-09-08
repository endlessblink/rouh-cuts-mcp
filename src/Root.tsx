import React from 'react';
import { Composition } from 'remotion';
import { TestComponent } from './components/TestComponent';
import { DynamicShowcase } from './components/DynamicShowcase';
import TestAnimation from './components/TestAnimation';
import WindowsTestSuccess from './components/WindowsTestSuccess';
import SimpleTextAnimation from './components/SimpleTextAnimation';
import TestFixedComponent from './components/TestFixedComponent';
import LoadingBar from './components/LoadingBar';
import SpinnerAnimation from './components/SpinnerAnimation';

/**
 * Remotion Root Component
 * Registers all video compositions for the project
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TestComponent"
        component={TestComponent}
        durationInFrames={90} // 3 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="DynamicShowcase"
        component={DynamicShowcase}
        durationInFrames={150} // 5 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="TestAnimation"
        component={TestAnimation}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="WindowsTestSuccess"
        component={WindowsTestSuccess}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SimpleTextAnimation"
        component={SimpleTextAnimation}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TestFixedComponent"
        component={TestFixedComponent}
        durationInFrames={60}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LoadingBar"
        component={LoadingBar}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SpinnerAnimation"
        component={SpinnerAnimation}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};