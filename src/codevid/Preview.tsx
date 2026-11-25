import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

// Dong co "Video bang code" cua TuTaLab: 1 bo khuon, 8 phong cach tu
// catalog 79 ban nha. Moi phong cach: tieu de o dai tren, phu de loi
// thoai o dai duoi, hinh trung tam theo dung chat lieu phong cach.
// File nay chua: bang phong cach + cac hinh trung tam (dung chung cho
// ban xem truoc 5 giay va ban video that theo kich ban khach).

export type CodeVidStyleId =
  | 've-tay'
  | 'bang-phan'
  | 'phang'
  | 'net-manh'
  | 'doanh-nghiep'
  | 'pixel'
  | 'bieu-do'
  | 'neon';

export const CODEVID_SAMPLE_SCENES: [string, string] = [
  'Ba bước để nhớ lâu hơn',
  'Học ít thôi, nhưng học đều mỗi ngày',
];

export const CODEVID_STYLES: Record<CodeVidStyleId, {name: string}> = {
  've-tay': {name: 'Vẽ tay giải thích'},
  'bang-phan': {name: 'Bảng phấn'},
  phang: {name: 'Đồ họa phẳng'},
  'net-manh': {name: 'Nét mảnh tối giản'},
  'doanh-nghiep': {name: 'Vector doanh nghiệp'},
  pixel: {name: 'Pixel 8-bit'},
  'bieu-do': {name: 'Biểu đồ sống'},
  neon: {name: 'Neon tương lai'},
};

export const FONT = 'DejaVu Sans, sans-serif';

export type VisualProps = {scene: number; local: number; frame: number};

const VisualVeTay: React.FC<VisualProps> = ({local, scene}) => {
  const draw = interpolate(local, [5, 45], [0, 1], {extrapolateRight: 'clamp'});
  const r = 120 * draw;
  return (
    <svg width="560" height="560" viewBox="0 0 560 560">
      <circle cx="280" cy="230" r={r} fill="none" stroke="#2456c8" strokeWidth="7" strokeLinecap="round" />
      <path d={`M 190 400 Q 280 ${400 - 60 * draw} 370 400`} fill="none" stroke="#e2543e" strokeWidth="7" strokeLinecap="round" />
      <text x="280" y="243" textAnchor="middle" fontFamily={FONT} fontSize="36" fontWeight="800" fill="#20304a">
        {scene % 2 === 0 ? '1 · 2 · 3' : 'Mỗi ngày'}
      </text>
      <path d="M120 480 h320" stroke="#20304a" strokeWidth="5" strokeLinecap="round" strokeDasharray="14 12" />
    </svg>
  );
};

const VisualBangPhan: React.FC<VisualProps> = ({local, scene}) => {
  const w = interpolate(local, [5, 50], [0, 300], {extrapolateRight: 'clamp'});
  return (
    <svg width="560" height="560" viewBox="0 0 560 560">
      <rect x="60" y="90" width="440" height="300" fill="none" stroke="#f5f2e8" strokeWidth="5" />
      <line x1="90" y1="160" x2={90 + w} y2="160" stroke="#ffd94d" strokeWidth="6" strokeLinecap="round" />
      <line x1="90" y1="230" x2={90 + w * 0.8} y2="230" stroke="#f5f2e8" strokeWidth="6" strokeLinecap="round" />
      <line x1="90" y1="300" x2={90 + w * 0.6} y2="300" stroke="#8fd0ff" strokeWidth="6" strokeLinecap="round" />
      <text x="280" y="470" textAnchor="middle" fontFamily={FONT} fontSize="40" fontWeight="700" fill="#f5f2e8">
        {scene % 2 === 0 ? 'Bước 1 → 2 → 3' : 'Đều đặn thắng tất cả'}
      </text>
    </svg>
  );
};

const VisualPhang: React.FC<VisualProps> = ({local, scene}) => {
  const {fps} = useVideoConfig();
  const pop = spring({frame: local, fps, config: {damping: 11}});
  return (
    <svg width="560" height="560" viewBox="0 0 560 560" style={{transform: `scale(${0.7 + 0.3 * pop})`}}>
      <circle cx="200" cy="240" r="95" fill="#ffcf3f" />
      <circle cx="360" cy="240" r="95" fill="#3f8cff" />
      <rect x="150" y="360" width="260" height="42" rx="21" fill="#20304a" />
      <text x="280" y="252" textAnchor="middle" fontFamily={FONT} fontSize="52" fontWeight="800" fill="#ffffff">
        {scene % 2 === 0 ? 'A · B' : 'OK!'}
      </text>
    </svg>
  );
};

const VisualNetManh: React.FC<VisualProps> = ({local, scene}) => {
  const p = interpolate(local, [5, 55], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <svg width="560" height="560" viewBox="0 0 560 560">
      <path
        d="M80 380 C 180 180, 300 460, 400 220 S 470 300, 490 260"
        fill="none"
        stroke="#222222"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="900"
        strokeDashoffset={900 * (1 - p)}
      />
      <text x="280" y="480" textAnchor="middle" fontFamily={FONT} fontSize="36" fontWeight="400" fill="#222222">
        {scene % 2 === 0 ? 'một nét, một ý' : 'ít mà sâu'}
      </text>
    </svg>
  );
};

const VisualDoanhNghiep: React.FC<VisualProps> = ({local, scene}) => {
  const hs = [0.4, 0.7, 1].map((k, i) => interpolate(local, [5 + i * 10, 35 + i * 10], [0, 240 * k], {extrapolateRight: 'clamp'}));
  return (
    <svg width="560" height="560" viewBox="0 0 560 560">
      <rect x="70" y="70" width="420" height="330" fill="#ffffff" stroke="#111111" strokeWidth="4" />
      {hs.map((h, i) => (
        <rect key={i} x={120 + i * 120} y={400 - h} width="70" height={h} fill={i === 2 ? '#e03131' : '#111111'} />
      ))}
      <text x="280" y="480" textAnchor="middle" fontFamily={FONT} fontSize="38" fontWeight="800" fill="#111111">
        {scene % 2 === 0 ? 'Số liệu rõ ràng' : 'Tăng đều mỗi tuần'}
      </text>
    </svg>
  );
};

const VisualPixel: React.FC<VisualProps> = ({local, scene}) => {
  const step = Math.floor(local / 8) % 3;
  const cells: React.ReactNode[] = [];
  const P = 40;
  for (let gx = 0; gx < 9; gx++) {
    for (let gy = 0; gy < 7; gy++) {
      const on = (gx + gy + step) % 4 === 0 || (gx === 4 && gy === 3);
      if (on) cells.push(<rect key={`${gx}-${gy}`} x={70 + gx * P} y={110 + gy * P} width={P - 6} height={P - 6} fill={gx === 4 && gy === 3 ? '#ffd94d' : '#3fd68f'} />);
    }
  }
  return (
    <svg width="560" height="560" viewBox="0 0 560 560">
      {cells}
      <text x="280" y="480" textAnchor="middle" fontFamily={FONT} fontSize="36" fontWeight="800" fill="#f5f2e8">
        {scene % 2 === 0 ? 'LEVEL 1' : 'LEVEL UP!'}
      </text>
    </svg>
  );
};

const VisualBieuDo: React.FC<VisualProps> = ({local, scene}) => {
  const p = interpolate(local, [5, 55], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <svg width="560" height="560" viewBox="0 0 560 560">
      <line x1="70" y1="380" x2="490" y2="380" stroke="#3a4a6b" strokeWidth="3" />
      <polyline points="70,340 160,290 250,310 340,220 430,240 490,140" fill="none" stroke="#2f7bff" strokeWidth="6" strokeLinejoin="round" strokeDasharray="700" strokeDashoffset={700 * (1 - p)} />
      <circle cx="490" cy="140" r={10 + 6 * p} fill="#ff7a1a" />
      <text x="280" y="470" textAnchor="middle" fontFamily={FONT} fontSize="40" fontWeight="800" fill="#ffffff">
        {scene % 2 === 0 ? '+128% lượt nhớ' : 'Đều mỗi ngày'}
      </text>
    </svg>
  );
};

const VisualNeon: React.FC<VisualProps> = ({frame, scene}) => {
  const pulse = 0.85 + 0.15 * Math.sin(frame / 6);
  return (
    <svg width="560" height="560" viewBox="0 0 560 560" style={{opacity: pulse}}>
      <circle cx="280" cy="250" r="130" fill="none" stroke="#22d3ee" strokeWidth="6" />
      <circle cx="280" cy="250" r="92" fill="none" stroke="#e879f9" strokeWidth="4" />
      <text x="280" y="268" textAnchor="middle" fontFamily={FONT} fontSize="46" fontWeight="800" fill="#ffffff">
        {scene % 2 === 0 ? 'AI · 2026' : 'TƯƠNG LAI'}
      </text>
      <line x1="110" y1="440" x2="450" y2="440" stroke="#22d3ee" strokeWidth="4" />
    </svg>
  );
};

export const CODEVID_THEMES: Record<
  CodeVidStyleId,
  {bg: string; titleFg: string; capFg: string; capBg: string; Visual: React.FC<VisualProps>}
> = {
  've-tay': {bg: '#f7efdc', titleFg: '#20304a', capFg: '#20304a', capBg: '#ffffff', Visual: VisualVeTay},
  'bang-phan': {bg: '#22473a', titleFg: '#f5f2e8', capFg: '#20304a', capBg: '#f5f2e8', Visual: VisualBangPhan},
  phang: {bg: '#fdf3e3', titleFg: '#20304a', capFg: '#ffffff', capBg: '#20304a', Visual: VisualPhang},
  'net-manh': {bg: '#ffffff', titleFg: '#222222', capFg: '#222222', capBg: '#f1f1f1', Visual: VisualNetManh},
  'doanh-nghiep': {bg: '#f4f4f2', titleFg: '#111111', capFg: '#ffffff', capBg: '#111111', Visual: VisualDoanhNghiep},
  pixel: {bg: '#141433', titleFg: '#ffd94d', capFg: '#141433', capBg: '#ffd94d', Visual: VisualPixel},
  'bieu-do': {bg: '#0b1026', titleFg: '#ffffff', capFg: '#ffffff', capBg: '#1b2745', Visual: VisualBieuDo},
  neon: {bg: '#070b24', titleFg: '#22d3ee', capFg: '#ffffff', capBg: '#131a3a', Visual: VisualNeon},
};

export const resolveStyle = (styleId?: string): CodeVidStyleId =>
  (CODEVID_STYLES[styleId as CodeVidStyleId] ? styleId : 've-tay') as CodeVidStyleId;

export const TitleBar: React.FC<{text: string; fg: string}> = ({text, fg}) => (
  <div style={{position: 'absolute', top: 54, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
    <div style={{color: fg, fontFamily: FONT, fontSize: 40, fontWeight: 800, padding: '10px 26px', textAlign: 'center'}}>
      {text}
    </div>
  </div>
);

export const Caption: React.FC<{text: string; fg: string; bg: string; local: number}> = ({text, fg, bg, local}) => {
  const y = interpolate(local, [0, 10], [26, 0], {extrapolateRight: 'clamp'});
  const op = interpolate(local, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', bottom: 64, left: 36, right: 36, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          color: fg,
          backgroundColor: bg,
          fontFamily: FONT,
          fontSize: 37,
          fontWeight: 700,
          lineHeight: 1.3,
          padding: '16px 22px',
          borderRadius: 12,
          textAlign: 'center',
          opacity: op,
          transform: `translateY(${y}px)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// Ban xem truoc: 2 canh mau, moi canh 75 frame.
export const CodeVidPreview: React.FC<{styleId?: string}> = ({styleId}) => {
  const id = resolveStyle(styleId);
  const meta = CODEVID_STYLES[id];
  const theme = CODEVID_THEMES[id];
  const frame = useCurrentFrame();
  const scene = frame < 75 ? 0 : 1;
  const local = frame - scene * 75;
  const Visual = theme.Visual;
  return (
    <AbsoluteFill style={{backgroundColor: theme.bg, fontFamily: FONT}}>
      <TitleBar text={meta.name} fg={theme.titleFg} />
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Visual scene={scene} local={local} frame={frame} />
      </div>
      <Caption text={CODEVID_SAMPLE_SCENES[scene]} fg={theme.capFg} bg={theme.capBg} local={local} />
    </AbsoluteFill>
  );
};
