import React from 'react';
import {Composition} from 'remotion';
import {Demo} from './Demo';
import {CodeVidPreview} from './codevid/Preview';
import {CodeVidVideo} from './codevid/Video';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="Demo"
        component={Demo}
        durationInFrames={150}
        fps={30}
        width={720}
        height={1280}
      />
      <Composition
        id="CodeVidPreview"
        component={CodeVidPreview}
        durationInFrames={150}
        fps={30}
        width={720}
        height={1280}
        defaultProps={{styleId: 've-tay'}}
      />
      <Composition
        id="CodeVidVideo"
        component={CodeVidVideo}
        durationInFrames={300}
        fps={30}
        width={720}
        height={1280}
        defaultProps={{styleId: 've-tay', scenes: [], sceneDurations: []}}
        calculateMetadata={({props}) => {
          const durs = (props.sceneDurations || []) as number[];
          const total = durs.reduce((a, b) => a + b, 0);
          return {durationInFrames: Math.max(30, Math.round(total * 30))};
        }}
      />
    </>
  );
};
