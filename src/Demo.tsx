import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleScale = spring({frame, fps, config: {damping: 12}});
  const barWidth = interpolate(frame, [20, 90], [0, 560], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [130, 149], [1, 0], {extrapolateLeft: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0b1026',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeOut,
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          color: '#ffffff',
          fontSize: 64,
          fontWeight: 800,
          textAlign: 'center',
          transform: `scale(${titleScale})`,
          padding: '0 40px',
        }}
      >
        KHO VIDEO ACTIONS
      </div>
      <div style={{color: '#ff7a1a', fontSize: 34, marginTop: 18, textAlign: 'center'}}>
        Remotion + GSAP + Three.js + FFmpeg
      </div>
      <div
        style={{
          marginTop: 46,
          height: 16,
          width: barWidth,
          backgroundColor: '#2f7bff',
          borderRadius: 8,
        }}
      />
      <div style={{color: '#9fb3ff', fontSize: 26, marginTop: 26}}>
        Render tu dong tren GitHub Actions
      </div>
    </AbsoluteFill>
  );
};
