import React from 'react';
import {Composition} from 'remotion';
import {Demo} from './Demo';

export const Root: React.FC = () => {
  return (
    <Composition
      id="Demo"
      component={Demo}
      durationInFrames={150}
      fps={30}
      width={720}
      height={1280}
    />
  );
};
