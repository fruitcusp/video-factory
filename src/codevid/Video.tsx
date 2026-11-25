import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Caption, CODEVID_STYLES, CODEVID_THEMES, FONT, TitleBar, resolveStyle} from './Preview';

// Video that theo kich ban khach: moi doan kich ban = 1 canh, do dai
// canh = do dai giong doc cua doan do (giay, truyen qua props).
// Giong doc duoc ghep o buoc ffmpeg sau render (file voice.wav canh).

const SceneView: React.FC<{styleId: string; text: string; index: number}> = ({styleId, text, index}) => {
  const id = resolveStyle(styleId);
  const theme = CODEVID_THEMES[id];
  const frame = useCurrentFrame();
  const Visual = theme.Visual;
  return (
    <AbsoluteFill style={{backgroundColor: theme.bg, fontFamily: FONT}}>
      <TitleBar text={CODEVID_STYLES[id].name} fg={theme.titleFg} />
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Visual scene={index} local={frame} frame={frame} />
      </div>
      <Caption text={text} fg={theme.capFg} bg={theme.capBg} local={frame} />
    </AbsoluteFill>
  );
};

export const CodeVidVideo: React.FC<{styleId?: string; scenes?: string[]; sceneDurations?: number[]}> = ({
  styleId,
  scenes,
  sceneDurations,
}) => {
  const list = scenes && scenes.length ? scenes : [''];
  const durs = sceneDurations && sceneDurations.length === list.length ? sceneDurations : list.map(() => 3);
  let acc = 0;
  return (
    <AbsoluteFill>
      {list.map((text, i) => {
        const from = Math.round(acc * 30);
        const dur = Math.max(15, Math.round(durs[i] * 30));
        acc += durs[i];
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <SceneView styleId={styleId || 've-tay'} text={text} index={i} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
